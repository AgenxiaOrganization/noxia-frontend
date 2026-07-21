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
      className="rounded-2xl border border-dark-800/40 p-5 flex flex-col h-full min-h-[400px] glass-card"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-bold text-sm text-primary-500 flex items-center gap-2">
          <ShoppingCart className="w-4 h-4" />
          Panier ({totalItems} article{totalItems > 1 ? 's' : ''})
        </h2>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs transition flex items-center gap-1 text-red-400 hover:text-red-300"
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
            <ShoppingCart className="w-12 h-12 mb-2 text-dark-500" />
            <p className="text-sm text-dark-400 font-medium">Panier vide</p>
            <p className="text-xs text-dark-500 mt-0.5">Ajoutez des produits</p>
          </div>
        ) : (
          cart.map((item) => {
            const product = getProduct(item.productId)
            if (!product) return null
            const subtotal = product.price * item.qty

            return (
              <div 
                key={item.productId} 
                className="flex items-center justify-between p-2.5 rounded-xl text-sm bg-dark-950/40 border border-dark-800/30"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <span className="font-medium text-white truncate block">{product.name}</span>
                  <span className="text-xs text-dark-400">
                    {product.price.toLocaleString()} F x {item.qty}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-accent-500">
                    {subtotal.toLocaleString()} F
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQty(item.productId, -1)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center transition bg-dark-950 border border-dark-800/50 hover:bg-white/5"
                    >
                      <Minus className="w-3 h-3 text-dark-400" />
                    </button>
                    <span className="w-6 text-center text-white">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.productId, 1)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center transition bg-dark-950 border border-dark-800/50 hover:bg-white/5"
                    >
                      <Plus className="w-3 h-3 text-dark-400" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="p-1 rounded-lg hover:bg-red-500/20 text-red-400 transition"
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
      <div className="border-t border-dark-800/30 pt-3 mt-3">
        <div className="flex justify-between mb-3">
          <span className="text-sm text-dark-400">Total</span>
          <span className="text-2xl font-bold text-white">{total.toLocaleString()} FCFA</span>
        </div>
        <button
          onClick={onCheckout}
          disabled={cart.length === 0}
          className={`w-full py-3 rounded-xl text-white font-semibold text-sm transition disabled:opacity-50 ${
            cart.length > 0 
              ? 'bg-accent-500 hover:bg-accent-600 shadow-lg shadow-accent-500/20 active:scale-95' 
              : 'bg-dark-800 text-dark-400 border border-dark-800/60 cursor-not-allowed'
          }`}
        >
          Encaisser ({totalItems} article{totalItems > 1 ? 's' : ''})
        </button>
      </div>
    </div>
  )
}
