'use client'

import { useState, useEffect } from 'react'
import { User, Wallet } from 'lucide-react'
import { getProducts, getCategories } from '../../../lib/api/catalog'
import { createSale, getCashRegisters, createCashRegister, CashRegister, getSales, Sale } from '../../../lib/api/sales'
import { invalidateApiCache } from '../../../lib/api'
import { useWebSockets } from '../../../lib/hooks/useWebSockets'
import { getUser, getMembership } from '../../../lib/auth'
import { toast } from 'sonner'
import { FeatureLockedScreen, isFeatureNotIncludedError } from '@/components/ui/FeatureLockedScreen'

import { Product, CartItem, cartKey } from '../../../components/pos/types'
import ProductGrid from '../../../components/pos/ProductGrid'
import FormulaChooser from '../../../components/pos/FormulaChooser'
import CartSidebar from '../../../components/pos/CartSidebar'
import PaymentModal from '../../../components/pos/PaymentModal'
import DailySalesList from '../../../components/pos/DailySalesList'
import ReceiptModal from '../../../components/pos/ReceiptModal'

export default function POSPage() {
  const user = getUser()
  const membership = getMembership()
  const currentEmployee = user ? { id: user.id, name: `${user.first_name} ${user.last_name}`, role: membership?.role || 'Employé' } : null

  const [products, setProducts] = useState<Product[]>([])
  const [dailySales, setDailySales] = useState<Sale[]>([])
  const [isLoadingSales, setIsLoadingSales] = useState(false)
  const [selectedReceiptSale, setSelectedReceiptSale] = useState<Sale | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([])
  const [selectedCashRegisterId, setSelectedCashRegisterId] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [paymentModal, setPaymentModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<string>(currentEmployee?.name || '')
  const [categoriesList, setCategoriesList] = useState<string[]>(['boisson'])
  const [isFeatureLocked, setIsFeatureLocked] = useState(false)
  const [formulaChoiceProduct, setFormulaChoiceProduct] = useState<Product | null>(null)


  const loadData = async () => {
    try {
      setIsLoadingSales(true)
      const [apiProducts, apiCashRegs, apiCategories, apiSales] = await Promise.all([
        getProducts(),
        getCashRegisters(),
        getCategories(),
        // Seulement les ventes du jour (heure locale) : la caisse n'affiche que celles-là.
        getSales({ from: new Date(new Date().setHours(0, 0, 0, 0)) })
      ])
      
      setDailySales(apiSales || [])
      setIsLoadingSales(false)
      
      if (apiProducts && apiProducts.length > 0) {
        setProducts(apiProducts.map((p: any) => {
          let stock = -1;
          if (p.unit !== 'service' && p.stock !== undefined && p.stock !== -1) {
            stock = parseFloat(p.stock);
          }

          return {
            id: p.id,
            name: p.name,
            category: p.category_name?.toLowerCase() || 'boisson',
            price: parseFloat(p.price),
            stock: stock,
            unit: p.unit,
            photo: p.photo ?? null,
            formulas: (p.formulas || [])
              .filter((f: any) => f.is_active)
              .map((f: any) => ({ id: f.id, name: f.name, unitsSold: f.units_sold, price: parseFloat(f.price) })),
          }
        }))
      }
      if (currentEmployee) {
        setSelectedEmployee(currentEmployee.name)
      }
      
      let activeRegs = apiCashRegs
      if (!apiCashRegs || apiCashRegs.length === 0) {
        try {
          const defaultReg = await createCashRegister({ name: 'Caisse Principale', is_active: true })
          activeRegs = [defaultReg]
        } catch (regErr) {
          console.error("Erreur lors de la création de la caisse enregistreuse par défaut", regErr)
        }
      }
      setCashRegisters(activeRegs || [])
      if (activeRegs && activeRegs.length > 0) {
        setSelectedCashRegisterId((prev) => prev ?? activeRegs[0].id)
      }

      if (apiCategories && apiCategories.length > 0) {
        const catNames = apiCategories.map((c: any) => c.name.toLowerCase())
        setCategoriesList(Array.from(new Set(catNames)))
      }
      setIsFeatureLocked(false)
    } catch (e) {
      if (isFeatureNotIncludedError(e)) {
        setIsFeatureLocked(true)
      } else {
        console.error('Erreur lors du chargement des données POS', e)
      }
      setIsLoadingSales(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useWebSockets('/ws/prices/', (data) => {
    console.log("Mise à jour des prix reçue :", data)
    loadData() // Rafraîchir les produits
  })

  useWebSockets('/ws/sales/', (data) => {
    console.log("Nouvelle vente signalée par WebSocket :", data)
    // Refresh inventory/products
    loadData()
  })

  const categories = ['all', ...categoriesList]

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getProduct = (id: number) => products.find(p => p.id === id)

  const getFormula = (product: Product | undefined, formulaId: number | null) =>
    formulaId == null ? undefined : product?.formulas?.find(f => f.id === formulaId)

  // Unités réelles retirées du stock par une ligne : une formule « Pack 3 » x2 = 6 unités.
  const unitsOf = (item: CartItem) => {
    const formula = getFormula(getProduct(item.productId), item.formulaId)
    return item.qty * (formula ? formula.unitsSold : 1)
  }

  const linePrice = (item: CartItem) => {
    const product = getProduct(item.productId)
    const formula = getFormula(product, item.formulaId)
    return formula ? formula.price : (product?.price ?? 0)
  }

  // Le stock est vérifié sur toutes les lignes du même produit (unité + formules).
  const fitsStock = (nextCart: CartItem[], productId: number) => {
    const product = getProduct(productId)
    if (!product || product.unit === 'service' || product.stock < 0) return true
    const used = nextCart.filter(i => i.productId === productId).reduce((acc, i) => acc + unitsOf(i), 0)
    if (used > product.stock) {
      alert(`Stock insuffisant ! Il reste ${product.stock} ${product.unit}(s).`)
      return false
    }
    return true
  }

  // --- Panier ---
  const addLine = (productId: number, formulaId: number | null) => {
    const key = cartKey({ productId, formulaId })
    const existing = cart.find(item => cartKey(item) === key)
    const nextCart = existing
      ? cart.map(item => cartKey(item) === key ? { ...item, qty: item.qty + 1 } : item)
      : [...cart, { productId, formulaId, qty: 1 }]
    if (fitsStock(nextCart, productId)) setCart(nextCart)
  }

  const addToCart = (productId: number) => {
    const product = getProduct(productId)
    if (!product) return
    if (product.formulas && product.formulas.length > 0) {
      setFormulaChoiceProduct(product)
      return
    }
    addLine(productId, null)
  }

  const removeFromCart = (key: string) => {
    setCart(cart.filter(item => cartKey(item) !== key))
  }

  const updateQty = (key: string, delta: number) => {
    const target = cart.find(item => cartKey(item) === key)
    if (!target) return
    const nextCart = cart.map(item => cartKey(item) === key ? { ...item, qty: Math.max(1, item.qty + delta) } : item)
    if (delta < 0 || fitsStock(nextCart, target.productId)) setCart(nextCart)
  }

  const clearCart = () => setCart([])

  // --- Calculs ---
  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0)
  const total = cart.reduce((acc, item) => acc + linePrice(item) * item.qty, 0)

  // --- Encaissement ---
  const handleCheckout = async (paymentMethod: string) => {
    if (cart.length === 0) return

    if (cashRegisters.length === 0) {
      toast.error("Erreur : Aucune caisse enregistreuse disponible.")
      return
    }
    if (!currentEmployee) {
      toast.error("Erreur : Aucun caissier identifié.")
      return
    }

    const backupCart = [...cart]
    const currentTotal = total

    // Fermer le modal et vider le panier immédiatement pour une réactivité instantanée
    setCart([])
    setPaymentModal(false)

    // Mettre à jour le stock localement de manière optimiste
    const updatedProducts = products.map(p => {
      const sold = backupCart.filter(item => item.productId === p.id).reduce((acc, item) => acc + unitsOf(item), 0)
      if (sold > 0 && p.stock >= 0 && p.stock !== 999) {
        return { ...p, stock: Math.max(0, p.stock - sold) }
      }
      return p
    })
    setProducts(updatedProducts)

    // Préparer les articles pour le backend (formule : quantity = nombre de formules, prix fixé côté serveur)
    const items = backupCart.map(item => {
      if (item.formulaId != null) {
        return { product: item.productId, formula: item.formulaId, quantity: item.qty.toString() }
      }
      const p = getProduct(item.productId)
      return {
        product: item.productId,
        quantity: item.qty.toString(),
        unit_price: p ? p.price.toString() : "0"
      }
    })

    let mappedMethod: 'cash' | 'mobile_money' | 'card' | 'other' = 'cash'
    if (paymentMethod === 'Mobile Money') {
      mappedMethod = 'mobile_money'
    } else if (paymentMethod === 'Carte bancaire') {
      mappedMethod = 'card'
    } else if (paymentMethod !== 'Espèces') {
      mappedMethod = 'other'
    }

    // Envoi de la transaction en tâche de fond
    const targetCaisseId = selectedCashRegisterId || (cashRegisters.length > 0 ? cashRegisters[0].id : 1)
    createSale({
      cash_register: targetCaisseId,
      payment_method: mappedMethod,
      items: items as any
    })
      .then(async (newSale) => {
        toast.success(`✅ Vente enregistrée : ${currentTotal.toLocaleString()} FCFA (${paymentMethod})`)
        // createSale() n'invalide que le cache de /sales — le stock des
        // produits vendus a pourtant changé (voir sales/services.py
        // checkout_sale -> apply_movement). Sans ça, loadData() ci-dessous
        // re-sert le cache /catalog perime (60s de fraicheur, voir
        // lib/api.ts CACHE_TTL_MS) et ecrase la mise a jour optimiste
        // faite plus haut avec l'ancien stock.
        invalidateApiCache('/catalog')
        invalidateApiCache('/inventory')
        await loadData()
        if (newSale && newSale.id) {
          setSelectedReceiptSale(newSale)
        }
      })
      .catch((err) => {
        console.error("Erreur lors de l'encaissement:", err)
        toast.error("❌ Échec de l'enregistrement de la vente.")
        // Restaurer le panier et les stocks en cas d'erreur
        setCart(backupCart)
        loadData()
      })
  }

  if (isFeatureLocked) {
    return <FeatureLockedScreen featureLabel="Caisse enregistreuse (POS)" />
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-xl font-bold text-primary-500">Caisse (POS)</h1>
        
        {isMounted && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Sélecteur de Caisse POS */}
            {cashRegisters.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dark-800/60 bg-dark-900 shadow-sm">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-dark-400 font-medium">Caisse :</span>
                <select
                  value={selectedCashRegisterId ?? ''}
                  onChange={(e) => setSelectedCashRegisterId(Number(e.target.value))}
                  className="bg-transparent text-sm text-white font-semibold outline-none cursor-pointer pr-1"
                >
                  {cashRegisters.map(c => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                      {c.name} {!c.is_active ? '(Inactive)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Employé connecté */}
            {currentEmployee && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dark-800/40 bg-dark-900">
                <User className="w-4 h-4 text-indigo-400" />
                <span className="text-sm text-white font-medium">
                  {currentEmployee.name} <span className="text-dark-400">({currentEmployee.role})</span>
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Grille Produits */}
        <ProductGrid
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredProducts={filteredProducts}
          addToCart={addToCart}
        />

        {/* Barre Latérale Panier */}
        <CartSidebar
          cart={cart}
          getProduct={getProduct}
          linePrice={linePrice}
          totalItems={totalItems}
          total={total}
          updateQty={updateQty}
          removeFromCart={removeFromCart}
          clearCart={clearCart}
          onCheckout={() => cart.length > 0 && setPaymentModal(true)}
        />
      </div>

      {/* Section des Encaissements du jour en Temps Réel */}
      {isMounted && (
        <DailySalesList
          sales={dailySales}
          isLoading={isLoadingSales}
          onRefresh={loadData}
          onViewReceipt={(sale) => setSelectedReceiptSale(sale)}
        />
      )}

      <FormulaChooser
        product={formulaChoiceProduct}
        onChoose={(formulaId) => {
          if (formulaChoiceProduct) addLine(formulaChoiceProduct.id, formulaId)
          setFormulaChoiceProduct(null)
        }}
        onClose={() => setFormulaChoiceProduct(null)}
      />

      {/* Modal de Paiement */}
      <PaymentModal
        isOpen={paymentModal}
        onClose={() => setPaymentModal(false)}
        total={total}
        totalItems={totalItems}
        selectedEmployee={selectedEmployee}
        handleCheckout={handleCheckout}
      />

      {/* Modal de Reçu d'encaissement */}
      <ReceiptModal
        isOpen={Boolean(selectedReceiptSale)}
        onClose={() => setSelectedReceiptSale(null)}
        sale={selectedReceiptSale}
      />
    </div>
  )
}