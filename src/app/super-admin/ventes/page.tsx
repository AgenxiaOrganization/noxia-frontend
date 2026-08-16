'use client'

import { useContext, useEffect, useState } from 'react'
import { Globe, Building2, Wallet } from 'lucide-react'
import { ServerContext } from '../layout'
import { createSuperAdminClient } from '@/lib/superAdminClient'
import { createCatalogApi, type Product as CatalogProduct } from '@/lib/api/catalog'
import { createSalesApi, type CashRegister, type Sale } from '@/lib/api/sales'
import { toast } from 'sonner'

import { Product, CartItem } from '@/components/pos/types'
import ProductGrid from '@/components/pos/ProductGrid'
import CartSidebar from '@/components/pos/CartSidebar'
import PaymentModal from '@/components/pos/PaymentModal'
import DailySalesList from '@/components/pos/DailySalesList'
import ReceiptModal from '@/components/pos/ReceiptModal'
import Loader from '@/components/ui/Loader'

export default function SuperAdminVentes() {
  const { selectedServer, isGlobalMode, selectedCompany } = useContext(ServerContext)

  const [products, setProducts] = useState<Product[]>([])
  const [dailySales, setDailySales] = useState<Sale[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSales, setIsLoadingSales] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedReceiptSale, setSelectedReceiptSale] = useState<Sale | null>(null)

  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([])
  const [selectedCashRegisterId, setSelectedCashRegisterId] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [paymentModal, setPaymentModal] = useState(false)
  const [categoriesList, setCategoriesList] = useState<string[]>(['boisson'])

  const getApis = () => {
    const client = createSuperAdminClient(selectedServer.id, selectedCompany!.id)
    return { catalogApi: createCatalogApi(client), salesApi: createSalesApi(client) }
  }

  const loadData = () => {
    if (isGlobalMode || !selectedCompany) {
      setProducts([])
      setDailySales([])
      setCashRegisters([])
      return
    }

    let cancelled = false
    const { catalogApi, salesApi } = getApis()

    setIsLoading(true)
    setIsLoadingSales(true)
    setError(null)
    Promise.all([catalogApi.getProducts(), salesApi.getCashRegisters(), catalogApi.getCategories(), salesApi.getSales()])
      .then(async ([apiProducts, apiCashRegs, apiCategories, apiSales]) => {
        if (cancelled) return
        setDailySales(apiSales || [])
        setIsLoadingSales(false)

        if (apiProducts && apiProducts.length > 0) {
          setProducts(apiProducts.map((p: any) => {
            let stock = -1
            if (p.unit !== 'service' && p.stock !== undefined && p.stock !== -1) {
              stock = parseFloat(p.stock)
            }
            return { id: p.id, name: p.name, category: p.category_name?.toLowerCase() || 'boisson', price: parseFloat(p.price), stock, unit: p.unit, photo: p.photo ?? null }
          }))
        } else {
          setProducts([])
        }

        let activeRegs = apiCashRegs
        if (!apiCashRegs || apiCashRegs.length === 0) {
          try {
            const defaultReg = await salesApi.createCashRegister({ name: 'Caisse Principale', is_active: true })
            activeRegs = [defaultReg]
          } catch (regErr) {
            console.error('Erreur lors de la création de la caisse enregistreuse par défaut (super-admin)', regErr)
          }
        }
        setCashRegisters(activeRegs || [])
        if (activeRegs && activeRegs.length > 0) {
          setSelectedCashRegisterId((prev) => prev ?? activeRegs[0].id)
        }

        if (apiCategories && (apiCategories as any).length > 0) {
          const catNames = (apiCategories as any[]).map((c: any) => c.name.toLowerCase())
          setCategoriesList(Array.from(new Set(catNames)))
        }
      })
      .catch((e) => {
        if (cancelled) return
        console.error('Erreur chargement ventes (super-admin)', e)
        setError('Impossible de charger les données de cette entreprise.')
        setIsLoadingSales(false)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }

  useEffect(loadData, [selectedServer.id, selectedCompany, isGlobalMode])

  const categories = ['all', ...categoriesList]
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getProduct = (id: number) => products.find(p => p.id === id)

  const addToCart = (productId: number) => {
    const product = getProduct(productId)
    if (!product) return
    const isService = product.unit === 'service' || product.stock === -1
    if (!isService && product.stock >= 0) {
      const existing = cart.find(item => item.productId === productId)
      const currentQty = existing ? existing.qty : 0
      if (currentQty >= product.stock) {
        toast.error(`Stock insuffisant ! Il reste ${product.stock} ${product.unit}(s).`)
        return
      }
    }
    const existing = cart.find(item => item.productId === productId)
    if (existing) {
      setCart(cart.map(item => item.productId === productId ? { ...item, qty: item.qty + 1 } : item))
    } else {
      setCart([...cart, { productId, qty: 1 }])
    }
  }

  const removeFromCart = (productId: number) => setCart(cart.filter(item => item.productId !== productId))

  const updateQty = (productId: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, item.qty + delta)
        const product = getProduct(productId)
        if (product && product.stock >= 0 && product.stock !== 999 && newQty > product.stock) {
          toast.error(`Stock insuffisant ! Il reste ${product.stock} ${product.unit}(s).`)
          return item
        }
        return { ...item, qty: newQty }
      }
      return item
    }))
  }

  const clearCart = () => setCart([])

  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0)
  const total = cart.reduce((acc, item) => {
    const product = getProduct(item.productId)
    return acc + (product ? product.price * item.qty : 0)
  }, 0)

  const handleCheckout = async (paymentMethod: string) => {
    if (cart.length === 0 || !selectedCompany) return
    if (cashRegisters.length === 0) {
      toast.error('Erreur : Aucune caisse enregistreuse disponible.')
      return
    }

    const backupCart = [...cart]
    const currentTotal = total
    setCart([])
    setPaymentModal(false)

    const updatedProducts = products.map(p => {
      const cartItem = backupCart.find(item => item.productId === p.id)
      if (cartItem && p.stock >= 0 && p.stock !== 999) {
        return { ...p, stock: Math.max(0, p.stock - cartItem.qty) }
      }
      return p
    })
    setProducts(updatedProducts)

    const items = backupCart.map(item => {
      const p = getProduct(item.productId)
      return { product: item.productId, quantity: item.qty.toString(), unit_price: p ? p.price.toString() : '0' }
    })

    let mappedMethod: 'cash' | 'mobile_money' | 'card' | 'other' = 'cash'
    if (paymentMethod === 'Mobile Money') mappedMethod = 'mobile_money'
    else if (paymentMethod === 'Carte bancaire') mappedMethod = 'card'
    else if (paymentMethod !== 'Espèces') mappedMethod = 'other'

    const { salesApi } = getApis()
    const targetCaisseId = selectedCashRegisterId || (cashRegisters.length > 0 ? cashRegisters[0].id : 1)
    salesApi.createSale({ cash_register: targetCaisseId, payment_method: mappedMethod, items: items as any })
      .then(async (newSale) => {
        toast.success(`Vente enregistrée : ${currentTotal.toLocaleString()} FCFA (${paymentMethod})`)
        loadData()
        if (newSale && newSale.id) setSelectedReceiptSale(newSale)
      })
      .catch((err) => {
        console.error("Erreur lors de l'encaissement (super-admin)", err)
        toast.error("Échec de l'enregistrement de la vente.")
        setCart(backupCart)
        loadData()
      })
  }

  if (isGlobalMode) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <Globe className="w-10 h-10" style={{ color: '#334155' }} />
        <p className="text-sm" style={{ color: '#94a3b8' }}>Sélectionnez une instance dans le menu pour voir ses ventes.</p>
      </div>
    )
  }

  if (!selectedCompany) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <Building2 className="w-10 h-10" style={{ color: '#334155' }} />
        <p className="text-sm" style={{ color: '#94a3b8' }}>Sélectionnez une entreprise dans le menu pour voir ses ventes.</p>
      </div>
    )
  }

  if (isLoading) return <Loader />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-xl font-bold text-primary-500">Caisse (POS) — {selectedCompany.name}</h1>

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
      </div>

      {error && (
        <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ProductGrid
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredProducts={filteredProducts}
          addToCart={addToCart}
        />

        <CartSidebar
          cart={cart}
          getProduct={getProduct}
          totalItems={totalItems}
          total={total}
          updateQty={updateQty}
          removeFromCart={removeFromCart}
          clearCart={clearCart}
          onCheckout={() => cart.length > 0 && setPaymentModal(true)}
        />
      </div>

      <DailySalesList
        sales={dailySales}
        isLoading={isLoadingSales}
        onRefresh={loadData}
        onViewReceipt={(sale) => setSelectedReceiptSale(sale)}
      />

      <PaymentModal
        isOpen={paymentModal}
        onClose={() => setPaymentModal(false)}
        total={total}
        totalItems={totalItems}
        selectedEmployee="Super Admin"
        handleCheckout={handleCheckout}
      />

      <ReceiptModal
        isOpen={Boolean(selectedReceiptSale)}
        onClose={() => setSelectedReceiptSale(null)}
        sale={selectedReceiptSale}
      />
    </div>
  )
}
