import { ShoppingCart, Trash2, Minus, Plus, X } from 'lucide-react'
import { CartItem, Product } from './types'

interface CartSidebarProps {
  cart: CartItem[]
  getProduct: (id: number) => Product | undefined
  totalItems: number
  total: number
  updateQty: (productId: number, delta: number) => void
  removeFromCart: (productId: number) => void
  clearCart: () => void
  onCheckout: () => void
}

export default function CartSidebar({
  cart,
  getProduct,
  totalItems,
  total,
  updateQty,
  removeFromCart,
  clearCart,
  onCheckout
}: CartSidebarProps) {
  return (
    <div 
      className="rounded-xl border p-4 flex flex-col h-full min-h-[400px]"
      style={{ 
        background: '#1e293b',
        borderColor: '#334155'
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-white flex items-center gap-2">
          <ShoppingCart className="w-4 h-4" />
          Panier ({totalItems} article{totalItems > 1 ? 's' : ''})
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
      <div className="flex-1 overflow-y-auto space-y-2 max-h-[300px]">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <ShoppingCart className="w-12 h-12 mb-2" style={{ color: '#334155' }} />
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
                <div className="flex-1 min-w-0 pr-2">
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
          onClick={onCheckout}
          disabled={cart.length === 0}
          className="w-full py-3 rounded-lg text-white font-semibold text-sm transition disabled:opacity-50"
          style={{ 
            background: cart.length > 0 ? '#22c55e' : '#334155',
            boxShadow: cart.length > 0 ? '0 10px 25px -5px rgba(34, 197, 94, 0.3)' : 'none'
          }}
        >
          Encaisser ({totalItems} article{totalItems > 1 ? 's' : ''})
        </button>
      </div>
    </div>
  )
}
