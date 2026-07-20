import { Search, ShoppingCart, Coffee, Utensils, Sparkles } from 'lucide-react'
import { Product } from './types'

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

interface ProductGridProps {
  categories: string[]
  selectedCategory: string
  setSelectedCategory: (cat: string) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  filteredProducts: Product[]
  addToCart: (productId: number) => void
}

export default function ProductGrid({
  categories,
  selectedCategory,
  setSelectedCategory,
  searchTerm,
  setSearchTerm,
  filteredProducts,
  addToCart
}: ProductGridProps) {
  return (
    <div className="lg:col-span-2 space-y-4">
      {/* Barre de recherche */}
      <div className="relative mt-4 sm:mt-0">
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

      {/* Filtres catégories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
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

      {/* Grille produits */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto pr-1">
        {filteredProducts.map((product) => {
          const Icon = categoryIcons[product.category as keyof typeof categoryIcons] || ShoppingCart
          const isLowStock = product.stock >= 0 && product.stock <= 5
          const isOutOfStock = product.stock === 0
          
          return (
            <button
              key={product.id}
              onClick={() => addToCart(product.id)}
              disabled={isOutOfStock && product.stock >= 0}
              className="p-3 rounded-xl border text-left transition-all hover:border-primary-500 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ 
                background: '#1e293b',
                borderColor: isOutOfStock ? '#ef4444' : isLowStock ? '#f59e0b' : '#334155'
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4" style={{ color: '#818cf8' }} />
                <span className="font-medium text-sm text-white truncate flex-1">{product.name}</span>
              </div>
              <p className="text-sm font-semibold" style={{ color: '#22c55e' }}>
                {product.price.toLocaleString()} FCFA
              </p>
              {product.stock >= 0 ? (
                <p className={`text-xs ${isOutOfStock ? 'text-red-400' : isLowStock ? 'text-orange-400' : 'text-dark-400'}`}>
                  {isOutOfStock ? '⚠️ Rupture' : `Stock: ${product.stock} ${product.unit}s`}
                </p>
              ) : (
                <p className="text-xs" style={{ color: '#64748b' }}>Illimité</p>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
