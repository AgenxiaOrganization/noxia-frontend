'use client'

import { useState, useEffect, Suspense } from 'react'
import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  CreditCard, Check, X, Crown, Star,
  Package, BarChart, Globe,
  Headphones, Calendar, Gift, Loader2, Receipt,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  getMySubscription, subscribeToPlan, getPlans, getFeatureRegistry,
  type Subscription, type Plan, type FeatureRegistryEntry,
} from '@/lib/api/subscription'
import Loader from '@/components/ui/Loader'
import PvitPaymentModal from '@/components/payments/PvitPaymentModal'

const featureCategories = [
  { id: 'base', label: 'Fonctionnalités de base', icon: Package },
  { id: 'advanced', label: 'Fonctionnalités avancées', icon: BarChart },
  { id: 'integration', label: 'Intégrations & API', icon: Globe },
  { id: 'support', label: 'Support & Assistance', icon: Headphones },
]

/**
 * Categorisation purement visuelle pour regrouper le tableau comparatif —
 * doit rester alignee avec les `label` de
 * subscriptions.feature_registry.FEATURE_REGISTRY cote noxia-backend. Meme
 * mapping que Pricing.tsx/FeatureComparison.tsx (landing) et
 * super-admin/abonnements — cette page doit afficher exactement la meme
 * offre que celle vue publiquement/configuree par le super-admin.
 */
const FEATURE_CATEGORY_KEYWORDS: Record<string, string> = {
  'catalogue produits': 'base',
  'gestion des stocks': 'base',
  'caisse enregistreuse (pos)': 'base',
  'fournisseurs & commandes': 'advanced',
  'export des rapports de ventes': 'advanced',
  'charges & dépenses': 'advanced',
  'fiches de paie': 'advanced',
  'synthèse financière': 'advanced',
  'export des bilans financiers': 'advanced',
  'tableau de bord avancé': 'advanced',
  "journal d'audit": 'support',
  'multi-utilisateurs': 'advanced',
  'multi-caisses': 'advanced',
  'assistant ia': 'integration',
  'multi-établissements': 'advanced',
  'api publique': 'integration',
  'whatsapp & telegram': 'integration',
  'alertes automatiques': 'integration',
  'support prioritaire 24/7': 'support',
  'formation équipe': 'support',
  'déploiement personnalisé': 'support',
  'intégrations sur mesure': 'integration',
  'sla garanti': 'support',
}

function featureCategoryOf(label: string): string {
  return FEATURE_CATEGORY_KEYWORDS[label.trim().toLowerCase()] ?? 'base'
}

const statusLabels: Record<string, { label: string; color: string }> = {
  trialing: { label: 'Essai', color: '#3b82f6' },
  active: { label: 'Actif', color: '#22c55e' },
  expired: { label: 'Expiré', color: '#ef4444' },
  canceled: { label: 'Annulé', color: '#64748b' },
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={<Loader />}>
      <SubscriptionPageContent />
    </Suspense>
  )
}

function SubscriptionPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [featureRegistry, setFeatureRegistry] = useState<FeatureRegistryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isChangingPlan, setIsChangingPlan] = useState(false)
  const [selectedPlanCode, setSelectedPlanCode] = useState<string | null>(null)
  const [paymentModalPlan, setPaymentModalPlan] = useState<Plan | null>(null)

  const loadData = () => {
    setIsLoading(true)
    Promise.all([getMySubscription(), getPlans(), getFeatureRegistry()])
      .then(([sub, planList, registry]) => {
        setSubscription(sub)
        setPlans([...planList].sort((a, b) => a.display_order - b.display_order))
        setFeatureRegistry(registry)
      })
      .catch((e) => console.error('Erreur chargement abonnement', e))
      .finally(() => setIsLoading(false))
  }

  useEffect(loadData, [])

  // Retour du formulaire bancaire PVit (paiement carte, voir
  // PvitPaymentModal / MYPVIT_SUCCESS_REDIRECTION_URL_CODE cote backend) —
  // le webhook a deja (ou va) confirmer le statut definitif independamment
  // de cette redirection ; on rafraichit juste l'abonnement pour refleter
  // l'activation si elle a deja eu lieu, et on nettoie l'URL.
  useEffect(() => {
    const payment = searchParams.get('payment')
    if (!payment) return
    if (payment === 'success') {
      toast.success('Paiement en cours de confirmation — votre abonnement sera activé sous quelques instants.')
      loadData()
    } else if (payment === 'failed') {
      toast.error('Le paiement par carte a été refusé ou annulé.')
    }
    router.replace('/subscription')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const handlePlanChange = async (plan: Plan) => {
    // Plan gratuit (Essai) : pas de paiement reel a faire, on garde
    // l'activation directe existante. Plan payant : ouvre le flux MyPVit
    // (voir PvitPaymentModal) — l'activation n'aura lieu qu'une fois le
    // paiement confirme par webhook cote backend.
    if (plan.is_free || Number(plan.price) === 0) {
      setSelectedPlanCode(plan.code)
      setIsChangingPlan(true)
      try {
        const updated = await subscribeToPlan(plan.code)
        setSubscription(updated)
        toast.success(`Plan ${updated.plan.name} activé.`)
      } catch (err) {
        console.error(err)
        toast.error("Erreur lors de l'activation du plan.")
      } finally {
        setIsChangingPlan(false)
      }
      return
    }
    setPaymentModalPlan(plan)
  }

  if (isLoading) return <Loader />

  const statusInfo = subscription ? statusLabels[subscription.status] ?? statusLabels.canceled : statusLabels.canceled
  const currentPlanCode = subscription?.plan.code
  const endDate = subscription?.current_period_end ?? subscription?.trial_end

  const registryLabels = featureRegistry.map((f) => f.label)
  const freeLabels = Array.from(
    new Set(plans.flatMap((p) => p.features.filter((f) => !f.key).map((f) => f.label))),
  )
  const allFeatureLabels = Array.from(new Set([...registryLabels, ...freeLabels]))

  return (
    <div className="p-4 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Abonnement</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            Gérez votre plan
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-3 py-1 rounded-full flex items-center gap-1"
            style={{ background: `${statusInfo.color}20`, color: statusInfo.color }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* PLAN ACTUEL */}
      <div
        className="rounded-xl border p-6"
        style={{
          background: subscription?.status === 'expired'
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(127, 29, 29, 0.15))'
            : 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(49, 46, 129, 0.15))',
          borderColor: subscription?.status === 'expired' ? '#ef4444' : '#6366f1',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5" style={{ color: '#f59e0b' }} />
              <h2 className="text-lg font-bold text-white">Plan {subscription?.plan.name ?? '—'}</h2>
            </div>
            <p className="text-2xl font-bold text-white mt-1">
              {subscription ? Number(subscription.plan.price).toLocaleString('fr-FR') + ' FCFA' : '...'}
              <span className="text-sm font-normal" style={{ color: '#94a3b8' }}>/{subscription?.plan.period_label || 'mois'}</span>
            </p>
            {endDate && (
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span style={{ color: subscription?.status === 'expired' ? '#ef4444' : '#94a3b8' }}>
                  <Calendar className="w-3 h-3 inline mr-1" />
                  {subscription?.status === 'expired' ? 'Expiré le' : subscription?.status === 'trialing' ? "Fin d'essai" : 'Prochain paiement'} :{' '}
                  {new Date(endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PLANS DISPONIBLES */}
      <h3 className="font-semibold text-sm text-white mt-2">Changer de plan</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const isCurrent = plan.code === currentPlanCode
          const price = parseFloat(plan.price)
          const isFree = plan.is_free || price === 0
          const isChanging = selectedPlanCode === plan.code && isChangingPlan
          const planFeatures = plan.features.filter((f) => f.included)

          return (
            <div
              key={plan.code}
              className={`rounded-xl border p-5 transition-all relative ${
                isCurrent ? 'border-primary-500' : 'hover:border-primary-500'
              }`}
              style={{
                background: isCurrent
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(49, 46, 129, 0.1))'
                  : '#1e293b',
                borderColor: isCurrent ? '#6366f1' : '#334155',
                transform: plan.is_featured ? 'translateY(-4px)' : 'none'
              }}
            >
              {plan.is_featured && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-xs font-bold"
                  style={{ background: '#6366f1' }}
                >
                  <Star className="w-3 h-3 inline mr-1" />
                  {plan.badge_label || 'Recommandé'}
                </div>
              )}
              {isFree && !plan.is_featured && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-xs font-bold"
                  style={{ background: '#22c55e' }}
                >
                  <Gift className="w-3 h-3 inline mr-1" />
                  {plan.badge_label || 'Essai gratuit'}
                </div>
              )}
              <h3 className="text-lg font-bold text-white">{plan.name}</h3>
              <p className="text-sm" style={{ color: '#94a3b8' }}>{plan.description}</p>
              <div className="my-3">
                {plan.has_active_discount && plan.original_price && (
                  <div className="text-sm line-through mb-0.5" style={{ color: '#64748b' }}>
                    {parseFloat(plan.original_price).toLocaleString('fr-FR')} FCFA
                  </div>
                )}
                <span className={`text-3xl font-bold ${isFree ? 'text-green-400' : 'text-white'}`}>
                  {price === 0 ? 'Gratuit' : price.toLocaleString('fr-FR') + ' FCFA'}
                </span>
                {price > 0 && (
                  <span className="text-sm" style={{ color: '#94a3b8' }}>/{plan.period_label}</span>
                )}
                {isFree && plan.trial_days > 0 && (
                  <p className="text-xs mt-1" style={{ color: '#22c55e' }}>{plan.trial_days} jours d'essai complet</p>
                )}
              </div>

              <ul className="space-y-1.5 mb-4 text-xs">
                {planFeatures.slice(0, 4).map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-3 h-3" style={{ color: '#22c55e' }} />
                    <span style={{ color: '#cbd5e1' }}>{feature.label}</span>
                  </li>
                ))}
                {planFeatures.length > 4 && (
                  <li className="text-xs" style={{ color: '#64748b' }}>
                    +{planFeatures.length - 4} autres fonctionnalités
                  </li>
                )}
              </ul>

              <button
                onClick={() => handlePlanChange(plan)}
                disabled={isCurrent || isChangingPlan}
                className={`w-full py-2 rounded-lg text-white text-sm font-semibold transition flex items-center justify-center gap-1.5 ${
                  isCurrent
                    ? 'bg-dark-600 text-dark-400 cursor-default'
                    : isFree
                    ? 'bg-green-600 hover:bg-green-500'
                    : 'bg-primary-600 hover:bg-primary-500'
                } disabled:opacity-50`}
                style={{
                  boxShadow: !isCurrent && !isChangingPlan
                    ? isFree
                      ? '0 10px 25px -5px rgba(34, 197, 94, 0.3)'
                      : '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
                    : 'none'
                }}
              >
                {isChanging && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isCurrent ? 'Plan actuel' : isChanging ? 'Changement...' : plan.cta_label || 'Choisir ce plan'}
              </button>
            </div>
          )
        })}
      </div>

      {/* COMPARAISON DES FONCTIONNALITÉS */}
      {allFeatureLabels.length > 0 && (
        <div
          className="rounded-xl border overflow-hidden"
          style={{
            background: '#1e293b',
            borderColor: '#334155'
          }}
        >
          <div className="p-4 border-b" style={{ borderColor: '#334155' }}>
            <h3 className="font-semibold text-sm text-white">Comparaison des fonctionnalités</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: '#334155' }}>
                  <th className="px-4 py-3 text-left text-xs" style={{ color: '#94a3b8' }}>Fonctionnalité</th>
                  {plans.map((plan) => (
                    <th key={plan.code} className="px-4 py-3 text-center text-xs" style={{ color: '#94a3b8' }}>
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureCategories.map((category) => {
                  const features = allFeatureLabels.filter((label) => featureCategoryOf(label) === category.id)
                  if (features.length === 0) return null

                  return (
                    <React.Fragment key={category.id}>
                      <tr className="border-b" style={{ borderColor: '#334155' }}>
                        <td colSpan={1 + plans.length} className="px-4 py-2 text-xs font-semibold" style={{ color: '#818cf8' }}>
                          <category.icon className="w-3 h-3 inline mr-1" />
                          {category.label}
                        </td>
                      </tr>
                      {features.map((label) => {
                        const isRegistryFeature = registryLabels.includes(label)
                        return (
                          <tr key={label} className="border-b" style={{ borderColor: '#334155' }}>
                            <td className="px-4 py-2 text-xs" style={{ color: '#94a3b8' }}>{label}</td>
                            {plans.map((plan) => {
                              const entry = plan.features.find((f) => f.label === label)
                              // Fonctionnalite du registre : modele deny-list
                              // (absente du plan = incluse par defaut, voir
                              // PlanFeaturePermission cote backend).
                              // Fonctionnalite decorative libre : allow-list.
                              const hasFeature = isRegistryFeature
                                ? (entry ? entry.included : true)
                                : Boolean(entry?.included)
                              return (
                                <td key={`${plan.code}-${label}`} className="px-4 py-2 text-center">
                                  {hasFeature ? (
                                    <Check className="w-4 h-4 mx-auto" style={{ color: '#22c55e' }} />
                                  ) : (
                                    <X className="w-4 h-4 mx-auto" style={{ color: '#475569' }} />
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FACTURATION */}
      <div
        className="rounded-xl border p-4"
        style={{
          background: '#1e293b',
          borderColor: '#334155'
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'rgba(99, 102, 241, 0.15)' }}
          >
            <Receipt className="w-5 h-5" style={{ color: '#818cf8' }} />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Facturation & méthodes de paiement</p>
            <p className="text-xs" style={{ color: '#94a3b8' }}>
              Paiement sécurisé via Airtel Money, Moov Money ou Visa/Mastercard. Choisissez un plan payant ci-dessus pour démarrer.
            </p>
          </div>
        </div>
      </div>

      {/* SUPPORT */}
      <div
        className="rounded-xl border p-4"
        style={{
          background: '#1e293b',
          borderColor: '#334155'
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(99, 102, 241, 0.15)' }}
            >
              <Headphones className="w-5 h-5" style={{ color: '#818cf8' }} />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Besoin d'aide ?</p>
              <p className="text-xs" style={{ color: '#94a3b8' }}>
                Contactez notre support pour toute question sur votre abonnement
              </p>
            </div>
          </div>
          <button
            className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition flex items-center gap-2"
            style={{
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              color: '#818cf8'
            }}
          >
            Contacter le support
          </button>
        </div>
      </div>

      {paymentModalPlan && (
        <PvitPaymentModal
          plan={paymentModalPlan}
          onClose={() => setPaymentModalPlan(null)}
          onSuccess={() => { setPaymentModalPlan(null); loadData() }}
        />
      )}
    </div>
  )
}
