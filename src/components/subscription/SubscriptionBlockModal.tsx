'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, CreditCard, Loader2, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { getMySubscription, subscribeToPlan, getPlans, type Plan, type Subscription } from '@/lib/api/subscription'
import { clearSession } from '@/lib/auth'
import PvitPaymentModal from '@/components/payments/PvitPaymentModal'

/**
 * Modal plein ecran, non fermable (pas de croix, pas de clic exterieur) —
 * affiche des que l'abonnement de l'entreprise est EXPIRED ou CANCELED (voir
 * useSubscriptionGuard). L'utilisateur ne peut faire que deux choses : payer
 * (vrai flux MyPVit, voir PvitPaymentModal) ou se deconnecter. Toute autre
 * action est bloquee cote backend de toute facon (403 subscription_expired),
 * ce modal rend juste cette regle visible et incontournable plutot que de
 * laisser l'utilisateur cogner contre des erreurs 403 sur chaque page.
 *
 * Charge les plans reels (getPlans) plutot que des codes en dur : un plan
 * gratuit s'active directement (subscribeToPlan), un plan payant ouvre
 * PvitPaymentModal — jamais subscribeToPlan sur un plan payant, que
 * SubscribeSerializer rejette systematiquement cote backend (403/400) pour
 * une requete non-proxy (voir subscriptions.serializers.validate_plan_code).
 */
export default function SubscriptionBlockModal({
  status,
  onResolved,
}: {
  status: 'expired' | 'canceled'
  onResolved: () => void
}) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activatingCode, setActivatingCode] = useState<Plan['code'] | null>(null)
  const [paymentModalPlan, setPaymentModalPlan] = useState<Plan | null>(null)

  useEffect(() => {
    Promise.all([getMySubscription(), getPlans()])
      .then(([sub, planList]) => {
        setSubscription(sub)
        setPlans([...planList].sort((a, b) => a.display_order - b.display_order))
      })
      .catch((e) => console.error('Erreur chargement abonnement/plans (modal blocage)', e))
      .finally(() => setIsLoading(false))
  }, [])

  // Le statut reel remonte par l'API (une fois chargee) est la source de
  // verite la plus fraiche — `status` passe en prop peut n'etre qu'un
  // repli 'expired' pose par l'evenement reseau global avant confirmation
  // (voir useSubscriptionGuard).
  const effectiveStatus = subscription?.status === 'canceled' || subscription?.status === 'expired'
    ? subscription.status
    : status
  const hasTrialed = Boolean(subscription?.has_trialed)

  const handleSelectPlan = async (plan: Plan) => {
    if (plan.is_free || Number(plan.price) === 0) {
      setActivatingCode(plan.code)
      try {
        const updated = await subscribeToPlan(plan.code)
        toast.success(`Plan ${updated.plan.name} activé.`)
        onResolved()
      } catch (err) {
        console.error(err)
        toast.error(err instanceof Error ? err.message : "Erreur lors de l'activation du plan.")
      } finally {
        setActivatingCode(null)
      }
      return
    }
    setPaymentModalPlan(plan)
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
            <h1 className="text-lg font-bold text-white">
              {effectiveStatus === 'canceled' ? 'Votre abonnement a été annulé' : 'Votre abonnement a expiré'}
            </h1>
            <p className="text-sm mt-2" style={{ color: '#94a3b8' }}>
              {effectiveStatus === 'canceled'
                ? "Vous avez annulé votre abonnement NOXIA : l'accès à tous les services est suspendu pour cet établissement. Choisissez un plan ci-dessous pour réactiver l'accès."
                : "L'accès à NOXIA est suspendu pour cet établissement jusqu'au renouvellement de votre abonnement. Choisissez un plan ci-dessous pour continuer."}
            </p>
            {hasTrialed && (
              <p className="text-xs mt-2" style={{ color: '#64748b' }}>
                L'essai gratuit ayant déjà été utilisé, seuls les plans payants sont disponibles ci-dessous.
              </p>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#818cf8' }} />
          </div>
        ) : (
          <div className="space-y-2.5">
            {plans
              .filter((plan) => !hasTrialed || !plan.is_free)
              .map((plan) => (
                <button
                  key={plan.code}
                  onClick={() => handleSelectPlan(plan)}
                  disabled={activatingCode !== null}
                  className="w-full py-3 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{
                    background: plan.is_featured ? '#4f46e5' : 'rgba(99, 102, 241, 0.15)',
                    color: plan.is_featured ? '#fff' : '#818cf8',
                    border: plan.is_featured ? 'none' : '1px solid rgba(99, 102, 241, 0.3)',
                  }}
                >
                  {activatingCode === plan.code ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                  {plan.is_free || Number(plan.price) === 0 ? 'Activer' : 'Payer et activer'} le plan {plan.name}
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

      {/* z-index superieur au conteneur (z-[999]) : PvitPaymentModal doit
          rester utilisable par-dessus le blocage plein ecran. */}
      {paymentModalPlan && (
        <div className="relative z-[1000]">
          <PvitPaymentModal
            plan={paymentModalPlan}
            onClose={() => setPaymentModalPlan(null)}
            onSuccess={() => {
              setPaymentModalPlan(null)
              onResolved()
            }}
          />
        </div>
      )}
    </div>
  )
}
