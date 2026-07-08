'use client'

import { useState } from 'react'
import {
  Search, Plus, Minus, Package, TrendingUp, TrendingDown,
  X, Check, AlertTriangle
} from 'lucide-react'

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
}

// --- Données Mockées ---
const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Bière Castel 65cl',
    category: 'boisson',
    subCategory: 'casier',
    stock: 48,
    minStock: 20,
    maxStock: 100,
    unit: 'unité',
    cost: 900,
    supplier: 'Brasserie du Gabon',
    unitsPerPackage: 24,
  },
  {
    id: 2,
    name: 'Bière Guinness 65cl',
    category: 'boisson',
    subCategory: 'casier',
    stock: 12,
    minStock: 15,
    maxStock: 100,
    unit: 'unité',
    cost: 1200,
    supplier: 'Brasserie du Gabon',
    unitsPerPackage: 24,
  },
  {
    id: 3,
    name: 'Whisky Jack Daniel\'s',
    category: 'boisson',
    subCategory: 'unite',
    stock: 8,
    minStock: 5,
    maxStock: 50,
    unit: 'bouteille',
    cost: 15000,
    supplier: 'Distriboissons SA',
    unitsPerPackage: 1,
  },
  {
    id: 4,
    name: 'Coca-Cola 33cl',
    category: 'boisson',
    subCategory: 'casier',
    stock: 120,
    minStock: 30,
    maxStock: 200,
    unit: 'unité',
    cost: 500,
    supplier: 'Coca-Cola Gabon',
    unitsPerPackage: 12,
  },
  {
    id: 5,
    name: 'Cocktail Mojito',
    category: 'boisson',
    subCategory: 'unite',
    stock: -1,
    minStock: 0,
    maxStock: 0,
    unit: 'verre',
    cost: 1500,
    supplier: null,
    unitsPerPackage: 1,
  },
  {
    id: 6,
    name: 'Brochettes Poulet',
    category: 'nourriture',
    subCategory: 'unite',
    stock: 45,
    minStock: 10,
    maxStock: 100,
    unit: 'unité',
    cost: 1200,
    supplier: 'FoodPro Gabon',
    unitsPerPackage: 1,
  },
]

const mockMovements = [
  { id: 1, product: 'Bière Castel 65cl', type: 'entree', qty: 24, date: '2026-07-08 10:00', user: 'Admin', note: 'Approvisionnement' },
  { id: 2, product: 'Bière Guinness 65cl', type: 'sortie', qty: 3, date: '2026-07-08 09:30', user: 'Jean M.', note: 'Vente' },
  { id: 3, product: 'Whisky Jack Daniel\'s', type: 'entree', qty: 6, date: '2026-07-07 16:00', user: 'Admin', note: 'Commande fournisseur' },
]

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [movements, setMovements] = useState(mockMovements)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add')
  const [adjustmentQty, setAdjustmentQty] = useState(1)
  const [adjustmentTypeQty, setAdjustmentTypeQty] = useState<'unit' | 'package'>('unit')
  const [adjustmentNote, setAdjustmentNote] = useState('')

  const categories = ['all', ...new Set(products.map(p => p.category))]

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
    setAdjustmentQty(1)
    setAdjustmentTypeQty('unit')
    setAdjustmentNote(type === 'add' ? 'Approvisionnement' : 'Sortie manuelle')
    setIsModalOpen(true)
  }

  // --- Appliquer l'ajustement ---
  const applyAdjustment = () => {
    if (!selectedProduct) return

    let qtyToAdjust = adjustmentQty
    let unitLabel = ''

    // Si c'est un produit en casier et qu'on ajuste en "casiers"
    if (selectedProduct.subCategory === 'casier' && adjustmentTypeQty === 'package') {
      qtyToAdjust = adjustmentQty * selectedProduct.unitsPerPackage
      unitLabel = ` (${adjustmentQty} casier${adjustmentQty > 1 ? 's' : ''} = ${qtyToAdjust} unités)`
    }

    // Appliquer la modification
    const updatedProducts = products.map(p => {
      if (p.id === selectedProduct.id) {
        let newStock = p.stock
        if (adjustmentType === 'add') {
          newStock = p.stock >= 0 ? p.stock + qtyToAdjust : p.stock
        } else {
          newStock = p.stock >= 0 ? Math.max(0, p.stock - qtyToAdjust) : p.stock
        }
        return { ...p, stock: newStock }
      }
      return p
    })

    setProducts(updatedProducts)

    // Ajouter au mouvement
    setMovements([
      {
        id: Date.now(),
        product: selectedProduct.name,
        type: adjustmentType === 'add' ? 'entree' : 'sortie',
        qty: qtyToAdjust,
        date: new Date().toLocaleString('fr-FR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        user: 'Admin',
        note: adjustmentNote + unitLabel,
      },
      ...movements,
    ])

    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  // --- Rendu ---
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

      {/* Tableau des stocks */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: '#1e293b', borderColor: '#334155' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: '#334155' }}>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Produit</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Stock</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Seuil</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Valeur</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const isLow = product.stock >= 0 && product.stock <= product.minStock
                const isOut = product.stock === 0
                const isInfinite = product.stock < 0
                const progress = product.maxStock > 0 ? (product.stock / product.maxStock) * 100 : 0

                return (
                  <tr key={product.id} className="border-b" style={{ borderColor: '#334155' }}>
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-medium text-white">{product.name}</span>
                        {product.supplier && (
                          <p className="text-xs" style={{ color: '#64748b' }}>{product.supplier}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8' }}>
                        {product.subCategory === 'casier' ? 'Casier' : 'Unité'}
                      </span>
                      {product.subCategory === 'casier' && (
                        <p className="text-xs" style={{ color: '#64748b' }}>
                          {product.unitsPerPackage} unités/casier
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {!isInfinite ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${isOut ? 'text-red-400' : isLow ? 'text-orange-400' : 'text-white'}`}>
                              {product.stock}
                            </span>
                            <span className="text-xs" style={{ color: '#64748b' }}>{product.unit}s</span>
                            {isOut && <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">RUPTURE</span>}
                            {isLow && !isOut && <span className="text-xs px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400">ALERTE</span>}
                          </div>
                          {product.maxStock > 0 && (
                            <div className="w-full h-1.5 rounded-full" style={{ background: '#334155' }}>
                              <div
                                className="h-1.5 rounded-full transition-all"
                                style={{
                                  width: `${Math.min(100, progress)}%`,
                                  background: isOut ? '#ef4444' : isLow ? '#f59e0b' : '#22c55e'
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: '#64748b' }}>Illimité</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#94a3b8' }}>
                      {product.minStock > 0 ? product.minStock : '-'}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#94a3b8' }}>
                      {product.stock >= 0 ? `${(product.stock * product.cost).toLocaleString()} F` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openAdjustmentModal(product, 'add')}
                          className="p-1.5 rounded transition hover:bg-green-500/20"
                          style={{ color: '#22c55e' }}
                          title="Ajouter du stock"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openAdjustmentModal(product, 'remove')}
                          className="p-1.5 rounded transition hover:bg-red-500/20"
                          style={{ color: '#ef4444' }}
                          title="Retirer du stock"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filteredProducts.length === 0 && (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto mb-2" style={{ color: '#334155' }} />
            <p className="text-sm" style={{ color: '#64748b' }}>Aucun produit trouvé</p>
          </div>
        )}
      </div>

      {/* Historique des mouvements */}
      <div
        className="rounded-xl border p-4"
        style={{ background: '#1e293b', borderColor: '#334155' }}
      >
        <h3 className="font-semibold text-sm text-white mb-3">Mouvements récents</h3>
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {movements.slice(0, 10).map((movement) => (
            <div
              key={movement.id}
              className="flex items-center justify-between p-2 rounded-lg text-sm"
              style={{
                background: movement.type === 'entree' ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                border: `1px solid ${movement.type === 'entree' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'}`
              }}
            >
              <div className="flex items-center gap-3">
                {movement.type === 'entree' ? (
                  <TrendingUp className="w-4 h-4" style={{ color: '#22c55e' }} />
                ) : (
                  <TrendingDown className="w-4 h-4" style={{ color: '#ef4444' }} />
                )}
                <div>
                  <span className="text-white">{movement.product}</span>
                  <span className="text-xs ml-2" style={{ color: '#64748b' }}>{movement.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-semibold ${movement.type === 'entree' ? 'text-green-400' : 'text-red-400'}`}>
                  {movement.type === 'entree' ? '+' : '-'}{movement.qty}
                </span>
                <span className="text-xs" style={{ color: '#64748b' }}>{movement.user}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL D'AJUSTEMENT */}
      {isModalOpen && selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6"
            style={{
              background: '#1e293b',
              border: '1px solid #334155'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-white mb-4">
              {adjustmentType === 'add' ? 'Ajouter du stock' : 'Retirer du stock'}
            </h2>

            <div className="space-y-4">
              {/* Produit (Lecture seule) */}
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Produit</label>
                <input
                  type="text"
                  value={selectedProduct.name}
                  disabled
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition opacity-60"
                  style={{
                    background: 'rgba(51, 65, 85, 0.5)',
                    border: '1px solid #334155'
                  }}
                />
              </div>

              {/* Stock actuel */}
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Stock actuel</label>
                <p className="text-lg font-bold text-white">
                  {selectedProduct.stock >= 0 ? `${selectedProduct.stock} ${selectedProduct.unit}s` : 'Illimité'}
                </p>
                {selectedProduct.subCategory === 'casier' && selectedProduct.stock >= 0 && (
                  <p className="text-xs" style={{ color: '#64748b' }}>
                    Soit {Math.floor(selectedProduct.stock / selectedProduct.unitsPerPackage)} casier(s) de {selectedProduct.unitsPerPackage} unités
                  </p>
                )}
              </div>

              {/* Type d'ajustement (casier ou unité) */}
              {selectedProduct.subCategory === 'casier' && (
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Ajuster en</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAdjustmentTypeQty('unit')}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${adjustmentTypeQty === 'unit' ? 'border' : 'border-transparent'
                        }`}
                      style={{
                        background: adjustmentTypeQty === 'unit' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(51, 65, 85, 0.3)',
                        borderColor: adjustmentTypeQty === 'unit' ? '#6366f1' : 'transparent',
                        color: adjustmentTypeQty === 'unit' ? '#818cf8' : '#94a3b8'
                      }}
                    >
                      Unités
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustmentTypeQty('package')}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${adjustmentTypeQty === 'package' ? 'border' : 'border-transparent'
                        }`}
                      style={{
                        background: adjustmentTypeQty === 'package' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(51, 65, 85, 0.3)',
                        borderColor: adjustmentTypeQty === 'package' ? '#6366f1' : 'transparent',
                        color: adjustmentTypeQty === 'package' ? '#818cf8' : '#94a3b8'
                      }}
                    >
                      Casiers
                    </button>
                  </div>
                </div>
              )}

              {/* Quantité */}
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>
                  Quantité à {adjustmentType === 'add' ? 'ajouter' : 'retirer'}
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={adjustmentQty}
                  onChange={(e) => setAdjustmentQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                  style={{
                    background: 'rgba(51, 65, 85, 0.5)',
                    border: '1px solid #334155'
                  }}
                />
                {selectedProduct.subCategory === 'casier' && adjustmentTypeQty === 'package' && (
                  <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
                    = {adjustmentQty * selectedProduct.unitsPerPackage} unités
                  </p>
                )}
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Note</label>
                <input
                  type="text"
                  value={adjustmentNote}
                  onChange={(e) => setAdjustmentNote(e.target.value)}
                  placeholder={adjustmentType === 'add' ? 'Approvisionnement' : 'Sortie manuelle'}
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                  style={{
                    background: 'rgba(51, 65, 85, 0.5)',
                    border: '1px solid #334155'
                  }}
                />
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-3 border-t" style={{ borderColor: '#334155' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium transition"
                  style={{
                    background: 'transparent',
                    border: '1px solid #334155',
                    color: '#94a3b8'
                  }}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={applyAdjustment}
                  className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition"
                  style={{
                    background: adjustmentType === 'add' ? '#22c55e' : '#ef4444',
                    boxShadow: adjustmentType === 'add'
                      ? '0 10px 25px -5px rgba(34, 197, 94, 0.3)'
                      : '0 10px 25px -5px rgba(239, 68, 68, 0.3)'
                  }}
                >
                  Valider
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}