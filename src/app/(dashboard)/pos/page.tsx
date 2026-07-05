'use client'

import { useState } from 'react'
import { 
  Plus, Minus, X, CreditCard, Smartphone, Banknote, 
  Coffee, Utensils, Sparkles, ShoppingCart, Trash2
} from 'lucide-react'

// Données mockées
const mockProducts = [
  { id: 1, name: 'Bière Castel 65cl', category: 'boisson', price: 1500, stock: 48, unit: 'unité' },
  { id: 2, name: 'Bière Guinness 65cl', category: 'boisson', price: 2000, stock: 12, unit: 'unité' },
  { id: 3, name: 'Whisky Jack Daniel\'s', category: 'boisson', price: 25000, stock: 8, unit: 'bouteille' },
  { id: 4, name: 'Vodka Absolut', category: 'boisson', price: 20000, stock: 15, unit: 'bouteille' },
  { id: 5, name: 'Champagne Moet', category: 'boisson', price: 45000, stock: 6, unit: 'bouteille' },
  { id: 6, name: 'Coca-Cola 33cl', category: 'boisson', price: 1000, stock: 120, unit: 'unité' },
  { id: 7, name: 'Jus d\'Orange', category: 'boisson', price: 1500, stock: 60, unit: 'unité' },
  { id: 8, name: 'Cocktail Mojito', category: 'boisson', price: 5000, stock: -1, unit: 'verre' },
  { id: 9, name: 'Cocktail Pina Colada', category: 'boisson', price: 6000, stock: -1, unit: 'verre' },
  { id: 10, name: 'Brochettes Poulet', category: 'nourriture', price: 3500, stock: 45, unit: 'unité' },
  { id: 11, name: 'Burger Classic', category: 'nourriture', price: 4000, stock: 30, unit: 'unité' },
  { id: 12, name: 'Chicha Session', category: 'service', price: 10000, stock: -1, unit: 'session' },
  { id: 13, name: 'Entree VIP', category: 'service', price: 15000, stock: -1, unit: 'ticket' },
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

interface CartItem {
  productId: number
  qty: number
}

export default function POSPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [cart, setCart] = useState<CartItem[]>([])
  const [paymentModal, setPaymentModal] = useState(false)

  const categories = ['all', ...new Set(mockProducts.map(p => p.category))]

  const filteredProducts = mockProducts.filter(p => 
    selectedCategory === 'all' || p.category === selectedCategory
  )

  const getProduct = (id: number) => mockProducts.find(p => p.id === id)

  const addToCart = (productId: number) => {
    const existing = cart.find(item => item.productId === productId)
    if (existing) {
      setCart(cart.map(item => 
        item.productId === productId 
          ? { ...item, qty: item.qty + 1 }
          : item
      ))
    } else {
      setCart([...cart, { productId, qty: 1 }])
    }
  }

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.productId !== productId))
  }

  const updateQty = (productId: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, item.qty + delta)
        return { ...item, qty: newQty }
      }
      return item
    }))
  }

  const clearCart = () => setCart([])

  const total = cart.reduce((acc, item) => {
    const product = getProduct(item.productId)
    return acc + (product ? product.price * item.qty : 0)
  }, 0)

  const handleCheckout = (paymentMethod: string) => {
    console.log('Commande encaissée:', { cart, paymentMethod, total })
    setCart([])
    setPaymentModal(false)
    // TODO: Appel API pour créer la vente
  }

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Colonne produits */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h1 className="text-xl font-bold text-white">Caisse (POS)</h1>
            <select 
              className="px-3 py-1.5 rounded-lg text-sm text-white outline-none transition"
              style={{ 
                background: 'rgba(51, 65, 85, 0.5)',
                border: '1px solid #334155'
              }}
            >
              {['Caisse Principale', 'Caisse Terrasse', 'Caisse VIP'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
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
                {cat === 'all' ? 'Tous' : categoryLabels[cat as keyof typeof categoryLabels]}
              </button>
            ))}
          </div>

          {/* Grille produits */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto">
            {filteredProducts.map((product) => {
              const Icon = categoryIcons[product.category as keyof typeof categoryIcons] || ShoppingCart
              const isLowStock = product.stock >= 0 && product.stock <= 5
              
              return (
                <button
                  key={product.id}
                  onClick={() => addToCart(product.id)}
                  className="p-3 rounded-xl border text-left transition-all hover:border-primary-500"
                  style={{ 
                    background: '#1e293b',
                    borderColor: isLowStock ? '#ef4444' : '#334155'
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4" style={{ color: '#818cf8' }} />
                    <span className="font-medium text-sm text-white truncate flex-1">{product.name}</span>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: '#22c55e' }}>
                    {product.price.toLocaleString()} FCFA
                  </p>
                  {product.stock >= 0 && (
                    <p className={`text-xs ${isLowStock ? 'text-red-400' : 'text-dark-400'}`}>
                      Stock: {product.stock} {product.unit}s
                    </p>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Colonne Panier */}
        <div 
          className="rounded-xl border p-4 flex flex-col"
          style={{ 
            background: '#1e293b',
            borderColor: '#334155'
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Panier ({cart.length})
            </h2>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs transition flex items-center gap-1"
                style={{ color: '#f87171' }}
              >
                <Trash2 className="w-3 h-3" />
                Vider
              </button>
            )}
          </div>

          {/* Liste du panier */}
          <div className="flex-1 overflow-y-auto space-y-2 min-h-[200px] max-h-[300px]">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingCart className="w-12 h-12" style={{ color: '#334155' }} />
                <p className="text-sm" style={{ color: '#64748b' }}>Panier vide</p>
                <p className="text-xs" style={{ color: '#334155' }}>Ajoutez des produits</p>
              </div>
            ) : (
              cart.map((item) => {
                const product = getProduct(item.productId)
                if (!product) return null
                const subtotal = product.price * item.qty

                return (
                  <div 
                    key={item.productId} 
                    className="flex items-center justify-between p-2 rounded-lg text-sm"
                    style={{ background: 'rgba(51, 65, 85, 0.3)' }}
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-white truncate block">{product.name}</span>
                      <span className="text-xs" style={{ color: '#94a3b8' }}>
                        {product.price.toLocaleString()} F x {item.qty}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm" style={{ color: '#22c55e' }}>
                        {subtotal.toLocaleString()} F
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQty(item.productId, -1)}
                          className="w-6 h-6 rounded flex items-center justify-center transition hover:bg-white/10"
                          style={{ background: 'rgba(51, 65, 85, 0.5)' }}
                        >
                          <Minus className="w-3 h-3" style={{ color: '#94a3b8' }} />
                        </button>
                        <span className="w-6 text-center text-white">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.productId, 1)}
                          className="w-6 h-6 rounded flex items-center justify-center transition hover:bg-white/10"
                          style={{ background: 'rgba(51, 65, 85, 0.5)' }}
                        >
                          <Plus className="w-3 h-3" style={{ color: '#94a3b8' }} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="p-1 rounded hover:bg-red-500/20 transition"
                        style={{ color: '#f87171' }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Total et encaissement */}
          <div className="border-t pt-3 mt-3" style={{ borderColor: '#334155' }}>
            <div className="flex justify-between mb-3">
              <span className="text-sm" style={{ color: '#94a3b8' }}>Total</span>
              <span className="text-2xl font-bold text-white">{total.toLocaleString()} FCFA</span>
            </div>
            <button
              onClick={() => cart.length > 0 && setPaymentModal(true)}
              disabled={cart.length === 0}
              className="w-full py-3 rounded-lg text-white font-semibold text-sm transition disabled:opacity-50"
              style={{ 
                background: cart.length > 0 ? '#22c55e' : '#334155',
                boxShadow: cart.length > 0 ? '0 10px 25px -5px rgba(34, 197, 94, 0.3)' : 'none'
              }}
            >
              Encaisser
            </button>
          </div>
        </div>
      </div>

      {/* Modal de paiement */}
      {paymentModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setPaymentModal(false)}
        >
          <div 
            className="w-full max-w-md rounded-2xl p-6"
            style={{ 
              background: '#1e293b',
              border: '1px solid #334155'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-white mb-2 text-center">Encaissement</h2>
            <p className="text-center text-3xl font-bold mb-4" style={{ color: '#22c55e' }}>
              {total.toLocaleString()} FCFA
            </p>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleCheckout('especes')}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border transition hover:border-primary-500"
                style={{ 
                  background: 'rgba(51, 65, 85, 0.3)',
                  borderColor: '#334155'
                }}
              >
                <Banknote className="w-8 h-8" style={{ color: '#f59e0b' }} />
                <span className="text-xs text-white">Espèces</span>
              </button>

              <button
                onClick={() => handleCheckout('mobile_money')}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border transition hover:border-primary-500"
                style={{ 
                  background: 'rgba(51, 65, 85, 0.3)',
                  borderColor: '#334155'
                }}
              >
                <Smartphone className="w-8 h-8" style={{ color: '#3b82f6' }} />
                <span className="text-xs text-white">Mobile Money</span>
              </button>

              <button
                onClick={() => handleCheckout('carte')}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border transition hover:border-primary-500"
                style={{ 
                  background: 'rgba(51, 65, 85, 0.3)',
                  borderColor: '#334155'
                }}
              >
                <CreditCard className="w-8 h-8" style={{ color: '#8b5cf6' }} />
                <span className="text-xs text-white">Carte bancaire</span>
              </button>
            </div>

            <button
              onClick={() => setPaymentModal(false)}
              className="w-full mt-4 py-2 rounded-lg text-sm font-medium transition"
              style={{ 
                background: 'transparent',
                border: '1px solid #334155',
                color: '#94a3b8'
              }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  )
}