'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  X, Check, AlertTriangle
} from 'lucide-react'
import { getProducts, createCategory, createProduct, createCategoryCharacteristic, getCategories } from '../../../lib/api/catalog'
import { getStockItems, getStockMovements, createStockMovement } from '../../../lib/api/inventory'
import { ensureArray } from '@/lib/api'
import Loader from '@/components/ui/Loader'
import { FeatureLockedScreen, isFeatureNotIncludedError } from '@/components/ui/FeatureLockedScreen'
import StockTable from '@/components/products/StockTable'
import StockAdjustmentModal, { type StockAdjustmentPayload } from '@/components/products/StockAdjustmentModal'
import { toast } from 'sonner'

// --- Types ---
interface Product {
  id: number
  name: string
  category: string
  subCategory: string
  stock: number
  minStock: number
  maxStock: number
  unit: string
  cost: number
  supplier: string | null
  unitsPerPackage: number // Pour les casiers
  packagings?: any[]
  stockItemId?: number | null
}



export default function StockPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [movements, setMovements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFeatureLocked, setIsFeatureLocked] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add')
  const [isSaving, setIsSaving] = useState(false)
  const [categoriesList, setCategoriesList] = useState<string[]>([])


  const loadData = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true)
      
      const [rawProducts, rawStockItems, rawMovements, rawCategories] = await Promise.all([
        getProducts(),
        getStockItems(),
        getStockMovements(),
        getCategories()
      ])

      let apiProducts = ensureArray<any>(rawProducts)
      let apiStockItems = ensureArray<any>(rawStockItems)
      let apiMovements = ensureArray<any>(rawMovements)
      let apiCategories = ensureArray<any>(rawCategories)

      if (apiProducts.length === 0 && apiCategories.length === 0) {
        const catBoissons = await createCategory({ name: 'Boissons', type: 'boisson' })
        const createdCatNourriture = await createCategory({ name: 'Nourriture', type: 'nourriture' })
        const catServices = await createCategory({ name: 'Services', type: 'service' })
        apiCategories = [catBoissons, createdCatNourriture, catServices]

        const catBoisson = apiCategories.find((c: any) => c.type === 'boisson')
        const catNourriture = apiCategories.find((c: any) => c.type === 'nourriture')
        const catService = apiCategories.find((c: any) => c.type === 'service')

        // Créer des modèles de caractéristiques s'il n'y en a pas encore
        if (catBoisson && (!catBoisson.characteristics || catBoisson.characteristics.length === 0)) {
          await createCategoryCharacteristic(catBoisson.id, {
            name: 'Bière',
            attributes: { "alcool": "5%", "volume": "65cl" }
          })
          await createCategoryCharacteristic(catBoisson.id, {
            name: 'Whisky',
            attributes: { "origine": "Écosse", "âge": "12 ans" }
          })
        }

        if (catNourriture && (!catNourriture.characteristics || catNourriture.characteristics.length === 0)) {
          await createCategoryCharacteristic(catNourriture.id, {
            name: 'Plat Chaud',
            attributes: { "accompagnement": "Frites", "option": "Salade" }
          })
        }

        const defaultProducts = [
          {
            category: catBoisson?.id || null,
            name: 'Bière Castel 65cl',
            unit: 'unite' as const,
            price: '1500',
            initial_stock: 48,
            initial_min_stock: 10,
            units_per_package: 12
          },
          {
            category: catBoisson?.id || null,
            name: 'Bière Guinness 65cl',
            unit: 'unite' as const,
            price: '2000',
            initial_stock: 12,
            initial_min_stock: 10,
            units_per_package: 12
          },
          {
            category: catBoisson?.id || null,
            name: 'Whisky Jack Daniel\'s',
            unit: 'bouteille' as const,
            price: '25000',
            initial_stock: 8,
            initial_min_stock: 2
          },
          {
            category: catNourriture?.id || null,
            name: 'Burger Classic',
            unit: 'plat' as const,
            price: '4000',
            initial_stock: 30,
            initial_min_stock: 5
          },
          {
            category: catService?.id || null,
            name: 'Chicha Session',
            unit: 'service' as const,
            price: '10000',
            initial_stock: 0,
            initial_min_stock: 0
          }
        ]

        for (const p of defaultProducts) {
          await createProduct(p)
        }

        const [freshProducts, freshStockItems, freshMovements] = await Promise.all([
          getProducts(),
          getStockItems(),
          getStockMovements()
        ])
        apiProducts = ensureArray<any>(freshProducts)
        apiStockItems = ensureArray<any>(freshStockItems)
        apiMovements = ensureArray<any>(freshMovements)
      }

      const stockItemsMap = new Map(apiStockItems.map((item: any) => [item.product, item]))

      const mappedProducts: Product[] = apiProducts.map((p: any) => {
        const isCasier = p.packagings && p.packagings.length > 0 && p.packagings[0].name === 'Casier';
        const stockItem = stockItemsMap.get(p.id);

        return {
          id: p.id,
          name: p.name,
          category: p.category_name || 'boisson',
          subCategory: isCasier ? 'casier' : 'unite',
          stock: stockItem ? parseFloat(stockItem.quantity_on_hand as string) : (p.stock !== undefined ? p.stock : 0),
          minStock: stockItem ? parseFloat(stockItem.alert_threshold as string) : (p.min_stock !== undefined ? p.min_stock : 10),
          maxStock: stockItem ? parseFloat(stockItem.alert_threshold as string) * 5 : 100,
          unit: p.unit || 'unité',
          cost: parseFloat(p.price),
          supplier: p.supplier_name || null,
          unitsPerPackage: isCasier ? p.packagings[0].units_per_package : 1,
          packagings: p.packagings || [],
          stockItemId: stockItem ? stockItem.id : null
        }
      })

      setProducts(mappedProducts)

      setMovements(apiMovements.map((m: any) => ({
        id: m.id,
        product: m.product_name || 'Produit inconnu',
        type: m.movement_type === 'entry' ? 'entree' : 'sortie',
        qty: parseFloat(m.quantity as string),
        date: m.created_at ? new Date(m.created_at).toLocaleString('fr-FR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : '',
        user: m.created_by_name || 'Admin',
        note: m.reason || ''
      })))

      // Enregistrer la liste de toutes les catégories existantes
      const catNames = (apiCategories || []).map((c: any) => c.name)
      setCategoriesList(Array.from(new Set(catNames)))
      setIsFeatureLocked(false)

    } catch (e) {
      if (isFeatureNotIncludedError(e)) {
        setIsFeatureLocked(true)
      } else {
        console.error('Erreur chargement des stocks', e)
      }
    } finally {
      if (!silent) setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const categories = ['all', ...categoriesList]

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Calculs des KPIs
  const totalStockValue = products
    .filter(p => p.stock >= 0)
    .reduce((acc, p) => acc + (p.stock * p.cost), 0)

  const lowStockCount = products.filter(p => p.stock >= 0 && p.stock <= p.minStock).length
  const outOfStockCount = products.filter(p => p.stock === 0).length

  // --- Ouvrir le modal pour ajuster un produit ---
  const openAdjustmentModal = (product: Product, type: 'add' | 'remove') => {
    setSelectedProduct(product)
    setAdjustmentType(type)
    setIsModalOpen(true)
  }

  // --- Appliquer l'ajustement ---
  const applyAdjustment = async (payload: StockAdjustmentPayload) => {
    try {
      setIsSaving(true)
      const adjustPromise = createStockMovement(payload)

      toast.promise(adjustPromise, {
        loading: "Enregistrement de l'ajustement...",
        success: "✅ Ajustement de stock enregistré !",
        error: (err) => {
          const errMsg = err?.response?.data?.non_field_errors?.[0] || err?.message || "Erreur lors de la validation."
          return `❌ Erreur : ${errMsg}`
        }
      })

      await adjustPromise
      setIsModalOpen(false)
      setSelectedProduct(null)
      await loadData(true)
    } catch (err: any) {
      console.error("Erreur lors de l'ajustement", err)
    } finally {
      setIsSaving(false)
    }
  }

  // --- Rendu ---
  if (isLoading) {
    return <Loader />
  }
  if (isFeatureLocked) {
    return <FeatureLockedScreen featureLabel="Gestion des stocks" />
  }

  return (
    <div className="p-4 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Gestion des Stocks</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            Valeur totale du stock : <span className="font-semibold text-white">{totalStockValue.toLocaleString()} FCFA</span>
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Produits en stock</p>
          <p className="text-xl font-bold text-white">{products.filter(p => p.stock >= 0).length}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Valeur du stock</p>
          <p className="text-xl font-bold text-accent-400">{totalStockValue.toLocaleString()} F</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Stock faible</p>
          <p className="text-xl font-bold text-orange-400">{lowStockCount}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Rupture</p>
          <p className="text-xl font-bold text-red-400">{outOfStockCount}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
            style={{
              background: 'rgba(51, 65, 85, 0.5)',
              border: '1px solid #334155'
            }}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${selectedCategory === cat ? 'border' : 'border-transparent'
                }`}
              style={{
                background: selectedCategory === cat ? 'rgba(99, 102, 241, 0.15)' : 'rgba(51, 65, 85, 0.3)',
                borderColor: selectedCategory === cat ? '#6366f1' : 'transparent',
                color: selectedCategory === cat ? '#818cf8' : '#94a3b8'
              }}
            >
              {cat === 'all' ? 'Tous' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tableau des stocks + mouvements */}
      <StockTable products={filteredProducts} movements={movements} onAdjust={openAdjustmentModal} />

      {/* MODAL D'AJUSTEMENT */}
      {isModalOpen && selectedProduct && (
        <StockAdjustmentModal
          product={selectedProduct}
          type={adjustmentType}
          isSaving={isSaving}
          onSubmit={applyAdjustment}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  )
}