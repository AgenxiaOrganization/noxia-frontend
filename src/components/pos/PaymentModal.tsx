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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
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
        <p className="text-center text-3xl font-bold mb-2" style={{ color: '#22c55e' }}>
          {total.toLocaleString()} FCFA
        </p>
        <p className="text-center text-sm mb-4" style={{ color: '#94a3b8' }}>
          {totalItems} article{totalItems > 1 ? 's' : ''}
        </p>

        {/* Affichage de l'employé */}
        <div className="flex items-center justify-center gap-2 mb-4 p-2 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
          <User className="w-4 h-4" style={{ color: '#818cf8' }} />
          <span className="text-sm text-white">{selectedEmployee}</span>
        </div>

        <div className="space-y-3">
          <p className="text-xs" style={{ color: '#94a3b8' }}>Moyen de paiement</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleCheckout('Espèces')}
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
              onClick={() => handleCheckout('Mobile Money')}
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
              onClick={() => handleCheckout('Carte bancaire')}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border transition hover:border-primary-500"
              style={{ 
                background: 'rgba(51, 65, 85, 0.3)',
                borderColor: '#334155'
              }}
            >
              <CreditCard className="w-8 h-8" style={{ color: '#8b5cf6' }} />
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
              className="flex flex-col items-center gap-2 p-4 rounded-xl border transition hover:border-primary-500"
              style={{ 
                background: 'rgba(51, 65, 85, 0.3)',
                borderColor: '#334155'
              }}
            >
              <Wallet className="w-8 h-8" style={{ color: '#ec4899' }} />
              <span className="text-xs text-white">Autre</span>
              <input
                type="text"
                placeholder="Ex: Chèque, Ticket..."
                value={customPaymentMethod}
                onChange={(e) => setCustomPaymentMethod(e.target.value)}
                className="w-full rounded px-2 py-1 text-xs text-white outline-none transition"
                style={{ 
                  background: 'rgba(51, 65, 85, 0.5)',
                  border: '1px solid #334155'
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-2 py-2 rounded-lg text-sm font-medium transition"
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
    </div>
  )
}
