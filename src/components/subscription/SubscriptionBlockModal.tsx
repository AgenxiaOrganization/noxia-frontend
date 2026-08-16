'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, CreditCard, Loader2, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { getMySubscription, subscribeToPlan, type Plan, type Subscription } from '@/lib/api/subscription'
import { clearSession } from '@/lib/auth'

/**
 * Modal plein ecran, non fermable (pas de croix, pas de clic exterieur) —
 * affiche des que l'abonnement de l'entreprise est EXPIRED (voir
 * useSubscriptionGuard). L'utilisateur ne peut faire que deux choses :
 * payer (stub Phase 1, aucune passerelle reelle) ou se deconnecter. Toute
 * autre action est bloquee cote backend de toute facon (403
 * subscription_expired), ce modal rend juste cette regle visible et
 * incontournable plutot que de laisser l'utilisateur cogner contre des
 * erreurs 403 sur chaque page.
 */
export default function SubscriptionBlockModal({ onResolved }: { onResolved: () => void }) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [payingCode, setPayingCode] = useState<Plan['code'] | null>(null)

  useEffect(() => {
    getMySubscription()
      .then(setSubscription)
      .catch((e) => console.error('Erreur chargement abonnement (modal blocage)', e))
      .finally(() => setIsLoading(false))
  }, [])

  const handlePay = async (planCode: Plan['code']) => {
    try {
      setPayingCode(planCode)
      const updated = await subscribeToPlan(planCode)
      toast.success(`Paiement effectué : plan ${updated.plan.name} activé pour 30 jours.`)
      onResolved()
    } catch (err) {
      console.error(err)
      toast.error('Erreur lors du paiement.')
    } finally {
      setPayingCode(null)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ background: 'rgba(2, 6, 23, 0.96)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-6 sm:p-8"
        style={{ background: '#1e293b', border: '1px solid #ef4444' }}
      >
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
            <AlertTriangle className="w-7 h-7" style={{ color: '#ef4444' }} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Votre abonnement a expiré</h1>
            <p className="text-sm mt-2" style={{ color: '#94a3b8' }}>
              L'accès à NOXIA est suspendu pour cet établissement jusqu'au renouvellement de votre abonnement.
              Choisissez un plan ci-dessous pour continuer.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#818cf8' }} />
          </div>
        ) : (
          <div className="space-y-2.5">
            {[
              { code: 'starter' as const, label: 'Starter', highlight: false },
              { code: 'premium' as const, label: 'Premium', highlight: true },
              { code: 'business' as const, label: 'Business', highlight: false },
            ].map((plan) => (
              <button
                key={plan.code}
                onClick={() => handlePay(plan.code)}
                disabled={payingCode !== null}
                className="w-full py-3 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
                style={{
                  background: plan.highlight ? '#4f46e5' : 'rgba(99, 102, 241, 0.15)',
                  color: plan.highlight ? '#fff' : '#818cf8',
                  border: plan.highlight ? 'none' : '1px solid rgba(99, 102, 241, 0.3)',
                }}
              >
                {payingCode === plan.code ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                Payer et activer le plan {plan.label}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => { clearSession(); window.location.href = '/login' }}
          className="w-full mt-5 py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5"
          style={{ color: '#64748b' }}
        >
          <LogOut className="w-3.5 h-3.5" />
          Se déconnecter
        </button>
      </div>
    </div>
  )
}
