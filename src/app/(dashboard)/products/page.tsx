'use client'

import { useState } from 'react'
import { Plus, Search, Edit, Trash2, Package, Coffee, Utensils, Sparkles } from 'lucide-react'

// Données mockées (pour l'instant)
const mockProducts = [
  { id: 1, name: 'Bière Castel 65cl', category: 'boisson', subCategory: 'bières', price: 1500, cost: 900, stock: 48, minStock: 20, unit: 'unité', supplier: 'Brasserie du Gabon' },
  { id: 2, name: 'Bière Guinness 65cl', category: 'boisson', subCategory: 'bières', price: 2000, cost: 1200, stock: 12, minStock: 15, unit: 'unité', supplier: 'Brasserie du Gabon' },
  { id: 3, name: 'Whisky Jack Daniel\'s', category: 'boisson', subCategory: 'alcools', price: 25000, cost: 15000, stock: 8, minStock: 5, unit: 'bouteille', supplier: 'Distriboissons SA' },
  { id: 4, name: 'Coca-Cola 33cl', category: 'boisson', subCategory: 'softs', price: 1000, cost: 500, stock: 120, minStock: 30, unit: 'unité', supplier: 'Coca-Cola Gabon' },
  { id: 5, name: 'Cocktail Mojito', category: 'boisson', subCategory: 'cocktails', price: 5000, cost: 1500, stock: -1, minStock: 0, unit: 'verre', supplier: null },
  { id: 6, name: 'Brochettes Poulet', category: 'nourriture', subCategory: 'plats', price: 3500, cost: 1200, stock: 45, minStock: 10, unit: 'unité', supplier: 'FoodPro Gabon' },
  { id: 7, name: 'Burger Classic', category: 'nourriture', subCategory: 'snacks', price: 4000, cost: 1500, stock: 30, minStock: 8, unit: 'unité', supplier: 'FoodPro Gabon' },
  { id: 8, name: 'Chicha Session', category: 'service', subCategory: 'chicha', price: 10000, cost: 2000, stock: -1, minStock: 0, unit: 'session', supplier: null },
]

const categoryIcons = {
  boisson: Coffee,
  nourriture: Utensils,
  service: Sparkles
}

const categoryLabels = {
  boisson: 'Boissons',
  nourriture: 'Nourriture',
  service: 'Services'
}

const categoryColors = {
  boisson: '#3b82f6',
  nourriture: '#f59e0b',
  service: '#8b5cf6'
}

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)

  const filteredProducts = mockProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ['all', ...new Set(mockProducts.map(p => p.category))]

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Produits</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            {mockProducts.length} produits • {mockProducts.filter(p => p.stock >= 0 && p.stock <= p.minStock).length} alertes stock
          </p>
        </div>
        <button
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition flex items-center gap-2"
          style={{ 
            background: '#4f46e5',
            boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
          }}
        >
          <Plus className="w-4 h-4" />
          Ajouter un produit
        </button>
      </div>

      {/* Filtres et recherche */}
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
              {cat === 'all' ? 'Tous' : categoryLabels[cat as keyof typeof categoryLabels] || cat}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des produits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredProducts.map((product) => {
          const Icon = categoryIcons[product.category as keyof typeof categoryIcons] || Package
          const isLowStock = product.stock >= 0 && product.stock <= product.minStock
          const isOutOfStock = product.stock === 0

          return (
            <div 
              key={product.id}
              className="rounded-xl p-4 border transition-all hover:border-primary-500"
              style={{ 
                background: '#1e293b',
                borderColor: isLowStock ? '#ef4444' : '#334155'
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${categoryColors[product.category as keyof typeof categoryColors]}20` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: categoryColors[product.category as keyof typeof categoryColors] }} />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-white truncate max-w-[150px]">{product.name}</h3>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>
                      {categoryLabels[product.category as keyof typeof categoryLabels]} • {product.subCategory}
                    </p>
                  </div>
                </div>
                <span 
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isOutOfStock ? 'bg-red-500/20 text-red-400' :
                    isLowStock ? 'bg-orange-500/20 text-orange-400' : 
                    'bg-green-500/20 text-green-400'
                  }`}
                >
                  {isOutOfStock ? 'Rupture' : isLowStock ? 'Stock faible' : 'Disponible'}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm mb-3">
                <div>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Prix</p>
                  <p className="font-semibold text-white">{product.price.toLocaleString()} FCFA</p>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Stock</p>
                  <p className={`font-semibold ${isLowStock ? 'text-red-400' : 'text-white'}`}>
                    {product.stock >= 0 ? `${product.stock} ${product.unit}s` : 'Illimité'}
                  </p>
                </div>
              </div>

              {product.supplier && (
                <p className="text-xs" style={{ color: '#64748b' }}>
                  Fournisseur: {product.supplier}
                </p>
              )}

              <div className="flex gap-2 mt-3 pt-3 border-t" style={{ borderColor: '#334155' }}>
                <button
                  onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                  className="flex-1 py-1.5 rounded text-xs font-medium transition flex items-center justify-center gap-1"
                  style={{ 
                    background: 'rgba(51, 65, 85, 0.5)',
                    color: '#94a3b8'
                  }}
                >
                  <Edit className="w-3 h-3" />
                  Modifier
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Supprimer "${product.name}" ?`)) {
                      // TODO: Appel API delete
                      console.log('Delete:', product.id)
                    }
                  }}
                  className="flex-1 py-1.5 rounded text-xs font-medium transition flex items-center justify-center gap-1"
                  style={{ 
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#f87171'
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                  Supprimer
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal d'ajout/modification */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            style={{ 
              background: '#1e293b',
              border: '1px solid #334155'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-white mb-4">
              {editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}
            </h2>

            <form className="space-y-3" onSubmit={(e) => {
              e.preventDefault()
              // TODO: Appel API create/update
              setIsModalOpen(false)
            }}>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Nom du produit</label>
                <input
                  type="text"
                  defaultValue={editingProduct?.name || ''}
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                  style={{ 
                    background: 'rgba(51, 65, 85, 0.5)',
                    border: '1px solid #334155'
                  }}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Catégorie</label>
                  <select
                    defaultValue={editingProduct?.category || 'boisson'}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{ 
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid #334155'
                    }}
                  >
                    <option value="boisson">Boisson</option>
                    <option value="nourriture">Nourriture</option>
                    <option value="service">Service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Sous-catégorie</label>
                  <input
                    type="text"
                    defaultValue={editingProduct?.subCategory || ''}
                    placeholder="ex: bières, alcools..."
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{ 
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid #334155'
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Prix (FCFA)</label>
                  <input
                    type="number"
                    defaultValue={editingProduct?.price || 0}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{ 
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid #334155'
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Coût (FCFA)</label>
                  <input
                    type="number"
                    defaultValue={editingProduct?.cost || 0}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{ 
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid #334155'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Unité</label>
                  <input
                    type="text"
                    defaultValue={editingProduct?.unit || 'unité'}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{ 
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid #334155'
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Stock</label>
                  <input
                    type="number"
                    defaultValue={editingProduct?.stock || 0}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{ 
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid #334155'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Seuil d'alerte</label>
                  <input
                    type="number"
                    defaultValue={editingProduct?.minStock || 10}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{ 
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid #334155'
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Fournisseur</label>
                <input
                  type="text"
                  defaultValue={editingProduct?.supplier || ''}
                  placeholder="Nom du fournisseur"
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
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition"
                  style={{ 
                    background: '#4f46e5',
                    boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  {editingProduct ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}