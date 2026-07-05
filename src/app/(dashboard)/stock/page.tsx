'use client'

import { useState } from 'react'
import { Search, Plus, Minus, RefreshCw, AlertTriangle, Package, TrendingUp, TrendingDown } from 'lucide-react'

// Données mockées (pour l'instant)
const mockProducts = [
  { id: 1, name: 'Bière Castel 65cl', category: 'boisson', stock: 48, minStock: 20, maxStock: 100, unit: 'unité', cost: 900, supplier: 'Brasserie du Gabon' },
  { id: 2, name: 'Bière Guinness 65cl', category: 'boisson', stock: 12, minStock: 15, maxStock: 100, unit: 'unité', cost: 1200, supplier: 'Brasserie du Gabon' },
  { id: 3, name: 'Whisky Jack Daniel\'s', category: 'boisson', stock: 8, minStock: 5, maxStock: 50, unit: 'bouteille', cost: 15000, supplier: 'Distriboissons SA' },
  { id: 4, name: 'Coca-Cola 33cl', category: 'boisson', stock: 120, minStock: 30, maxStock: 200, unit: 'unité', cost: 500, supplier: 'Coca-Cola Gabon' },
  { id: 5, name: 'Cocktail Mojito', category: 'boisson', stock: -1, minStock: 0, maxStock: 0, unit: 'verre', cost: 1500, supplier: null },
  { id: 6, name: 'Brochettes Poulet', category: 'nourriture', stock: 45, minStock: 10, maxStock: 100, unit: 'unité', cost: 1200, supplier: 'FoodPro Gabon' },
]

const mockMovements = [
  { id: 1, product: 'Bière Castel 65cl', type: 'entree', qty: 24, date: '2026-06-28 10:00', user: 'Admin', note: 'Approvisionnement' },
  { id: 2, product: 'Bière Guinness 65cl', type: 'sortie', qty: 3, date: '2026-06-28 09:30', user: 'Jean M.', note: 'Vente' },
  { id: 3, product: 'Whisky Jack Daniel\'s', type: 'entree', qty: 6, date: '2026-06-27 16:00', user: 'Admin', note: 'Commande fournisseur' },
  { id: 4, product: 'Coca-Cola 33cl', type: 'sortie', qty: 12, date: '2026-06-27 14:20', user: 'Marie K.', note: 'Vente' },
  { id: 5, product: 'Brochettes Poulet', type: 'entree', qty: 30, date: '2026-06-27 10:00', user: 'Admin', note: 'Livraison' },
]

export default function StockPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showMovementForm, setShowMovementForm] = useState(false)
  const [movementType, setMovementType] = useState<'entree' | 'sortie'>('entree')
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  const categories = ['all', ...new Set(mockProducts.map(p => p.category))]

  const filteredProducts = mockProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const totalStockValue = mockProducts
    .filter(p => p.stock >= 0)
    .reduce((acc, p) => acc + (p.stock * p.cost), 0)

  const lowStockCount = mockProducts.filter(p => p.stock >= 0 && p.stock <= p.minStock).length
  const outOfStockCount = mockProducts.filter(p => p.stock === 0).length

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Gestion des Stocks</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            Valeur totale du stock : <span className="font-semibold text-white">{totalStockValue.toLocaleString()} FCFA</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setMovementType('entree'); setShowMovementForm(true); }}
            className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition flex items-center gap-2"
            style={{ 
              background: '#22c55e',
              boxShadow: '0 10px 25px -5px rgba(34, 197, 94, 0.3)'
            }}
          >
            <Plus className="w-4 h-4" />
            Entrée
          </button>
          <button
            onClick={() => { setMovementType('sortie'); setShowMovementForm(true); }}
            className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition flex items-center gap-2"
            style={{ 
              background: '#ef4444',
              boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.3)'
            }}
          >
            <Minus className="w-4 h-4" />
            Sortie
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Produits en stock</p>
          <p className="text-xl font-bold text-white">{mockProducts.filter(p => p.stock >= 0).length}</p>
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
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                selectedCategory === cat ? 'border' : 'border-transparent'
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
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Catégorie</th>
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
                    <td className="px-4 py-3 text-xs" style={{ color: '#94a3b8' }}>
                      {product.category}
                    </td>
                    <td className="px-4 py-3">
                      {product.stock >= 0 ? (
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
                          onClick={() => {
                            setSelectedProduct(product)
                            setMovementType('entree')
                            setShowMovementForm(true)
                          }}
                          className="p-1.5 rounded transition hover:bg-green-500/20"
                          style={{ color: '#22c55e' }}
                          title="Ajouter du stock"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProduct(product)
                            setMovementType('sortie')
                            setShowMovementForm(true)
                          }}
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
        <div className="space-y-2">
          {mockMovements.slice(0, 5).map((movement) => (
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

      {/* Modal de mouvement de stock */}
      {showMovementForm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setShowMovementForm(false)}
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
              {movementType === 'entree' ? 'Entrée de stock' : 'Sortie de stock'}
            </h2>

            <form className="space-y-3" onSubmit={(e) => {
              e.preventDefault()
              // TODO: Appel API
              setShowMovementForm(false)
            }}>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Produit</label>
                <select
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                  style={{ 
                    background: 'rgba(51, 65, 85, 0.5)',
                    border: '1px solid #334155'
                  }}
                  defaultValue={selectedProduct?.id || ''}
                >
                  <option value="">Sélectionner un produit</option>
                  {mockProducts.filter(p => p.stock >= 0).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (stock: {p.stock} {p.unit}s)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Quantité</label>
                <input
                  type="number"
                  min="1"
                  defaultValue="1"
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                  style={{ 
                    background: 'rgba(51, 65, 85, 0.5)',
                    border: '1px solid #334155'
                  }}
                  required
                />
              </div>

              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Note</label>
                <input
                  type="text"
                  placeholder={movementType === 'entree' ? 'Approvisionnement' : 'Vente manuelle'}
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                  style={{ 
                    background: 'rgba(51, 65, 85, 0.5)',
                    border: '1px solid #334155'
                  }}
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowMovementForm(false)}
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
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition"
                  style={{ 
                    background: movementType === 'entree' ? '#22c55e' : '#ef4444',
                    boxShadow: movementType === 'entree' 
                      ? '0 10px 25px -5px rgba(34, 197, 94, 0.3)' 
                      : '0 10px 25px -5px rgba(239, 68, 68, 0.3)'
                  }}
                >
                  Valider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}