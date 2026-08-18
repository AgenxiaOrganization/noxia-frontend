'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getPlans, type Plan } from '@/lib/api/subscription'
import PvitPaymentModal from '@/components/payments/PvitPaymentModal'
import Loader from '@/components/ui/Loader'

/**
 * Page de paiement post-inscription : atteinte uniquement quand le client
 * vient de créer son compte (essai déjà actif, voir accounts.serializers)
 * en choisissant un plan payant à l'étape 3 de /register. Réutilise
 * PvitPaymentModal tel quel (composant autonome, ne dépend que de
 * `plan`/`onClose`/`onSuccess`) affiché en page pleine plutôt qu'en modal —
 * fermer/passer n'annule rien : l'abonnement reste en essai, payable plus
 * tard depuis /subscription.
 */
function SubscriptionCheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planCode = searchParams.get('plan') ?? ''

  const [plan, setPlan] = useState<Plan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!planCode) {
      router.replace('/dashboard')
      return
    }
    getPlans()
      .then((list) => {
        const found = list.find((p) => p.code === planCode)
        if (!found) {
          setNotFound(true)
        } else {
          setPlan(found)
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false))
  }, [planCode, router])

  const goToDashboard = () => router.replace('/dashboard')

  if (isLoading) return <Loader />

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #312e81 70%, #4f46e5 100%)',
      }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">
            N
          </div>
          <h1 className="text-2xl font-bold text-white">Compte créé avec succès !</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            Plus qu'une étape : réglez votre abonnement pour l'activer.
          </p>
        </div>

        {notFound || !plan ? (
          <div
            className="rounded-2xl p-6 text-center space-y-4"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <p className="text-sm" style={{ color: '#94a3b8' }}>
              Ce plan n'est plus disponible. Votre compte reste actif en essai gratuit — vous pourrez choisir un plan à tout moment depuis votre espace.
            </p>
            <button
              onClick={goToDashboard}
              className="w-full py-2.5 rounded-lg text-white font-semibold text-sm transition"
              style={{ background: '#4f46e5' }}
            >
              Accéder à mon tableau de bord
            </button>
          </div>
        ) : (
          <PvitPaymentModal
            plan={plan}
            onClose={goToDashboard}
            onSuccess={goToDashboard}
          />
        )}

        <p className="text-center text-sm mt-4" style={{ color: '#94a3b8' }}>
          <button onClick={goToDashboard} className="hover:underline font-medium" style={{ color: '#818cf8' }}>
            Passer pour l'instant, je paierai plus tard
          </button>
        </p>
      </div>
    </div>
  )
}

export default function SubscriptionCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f172a' }}>
        <img src="/logos/NOXIA_Orbit_Logo.svg" alt="NOXIA" className="w-8 h-8 animate-spin" />
      </div>
    }>
      <SubscriptionCheckoutContent />
    </Suspense>
  )
}
