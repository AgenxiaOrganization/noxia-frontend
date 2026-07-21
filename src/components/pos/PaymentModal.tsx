import { Banknote, Smartphone, CreditCard, Wallet, User } from 'lucide-react'
import { useState } from 'react'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  total: number
  totalItems: number
  selectedEmployee: string
  handleCheckout: (paymentMethod: string) => void
}

export default function PaymentModal({
  isOpen,
  onClose,
  total,
  totalItems,
  selectedEmployee,
  handleCheckout
}: PaymentModalProps) {
  const [customPaymentMethod, setCustomPaymentMethod] = useState('')

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md rounded-2xl p-6 bg-dark-900 border border-dark-800/60 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-white mb-2 text-center">Encaissement</h2>
        <p className="text-center text-3xl font-bold mb-2 text-accent-500">
          {total.toLocaleString()} FCFA
        </p>
        <p className="text-center text-sm mb-4 text-dark-400">
          {totalItems} article{totalItems > 1 ? 's' : ''}
        </p>

        {/* Affichage de l'employé */}
        <div className="flex items-center justify-center gap-2 mb-4 p-2.5 rounded-xl bg-dark-950/40 border border-dark-800/60">
          <User className="w-4 h-4 text-primary-400" />
          <span className="text-sm text-white font-medium">{selectedEmployee}</span>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-dark-400">Moyen de paiement</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleCheckout('Espèces')}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-dark-800/40 bg-dark-950/30 transition hover:border-primary-500 hover:bg-white/[0.02]"
            >
              <Banknote className="w-8 h-8 text-amber-500" />
              <span className="text-xs text-white">Espèces</span>
            </button>

            <button
              onClick={() => handleCheckout('Mobile Money')}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-dark-800/40 bg-dark-950/30 transition hover:border-primary-500 hover:bg-white/[0.02]"
            >
              <Smartphone className="w-8 h-8 text-blue-500" />
              <span className="text-xs text-white">Mobile Money</span>
            </button>

            <button
              onClick={() => handleCheckout('Carte bancaire')}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-dark-800/40 bg-dark-950/30 transition hover:border-primary-500 hover:bg-white/[0.02]"
            >
              <CreditCard className="w-8 h-8 text-purple-500" />
              <span className="text-xs text-white">Carte bancaire</span>
            </button>

            <button
              onClick={() => {
                if (customPaymentMethod.trim()) {
                  handleCheckout(customPaymentMethod.trim())
                } else {
                  alert('Veuillez saisir un moyen de paiement')
                }
              }}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-dark-800/40 bg-dark-950/30 transition hover:border-primary-500 hover:bg-white/[0.02]"
            >
              <Wallet className="w-8 h-8 text-pink-500" />
              <span className="text-xs text-white">Autre</span>
              <input
                type="text"
                placeholder="Ex: Chèque, Ticket..."
                value={customPaymentMethod}
                onChange={(e) => setCustomPaymentMethod(e.target.value)}
                className="w-full rounded-lg px-2.5 py-1 text-xs text-white bg-dark-950/50 border border-dark-800/60 outline-none focus:border-primary-500 transition"
                onClick={(e) => e.stopPropagation()}
              />
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-2 py-2.5 rounded-lg text-sm font-medium transition border border-dark-800/60 text-dark-400 hover:text-white hover:bg-white/5"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}
