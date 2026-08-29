'use client'

import { useContext, useEffect, useState } from 'react'
import {
  CreditCard, Check, X, Crown, Star,
  Package, BarChart,
  Headphones, Calendar, Gift,
  Globe, Building2, Loader2,
} from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'
import { ServerContext } from '../layout'
import { createSuperAdminClient } from '@/lib/superAdminClient'
import { createSubscriptionApi, type Subscription } from '@/lib/api/subscription'
import { listInstancePlans, listInstanceFeatureRegistry, type InstancePlan, type FeatureRegistryEntry } from '@/lib/api/plans'
import Loader from '@/components/ui/Loader'

const featureCategories = [
  { id: 'base', label: 'Fonctionnalités de base', icon: Package },
  { id: 'advanced', label: 'Fonctionnalités avancées', icon: BarChart },
  { id: 'support', label: 'Support & Assistance', icon: Headphones },
]

export default function SuperAdminAbonnements() {
  const { isGlobalMode, selectedServer, selectedCompany } = useContext(ServerContext)

  const [plans, setPlans] = useState<InstancePlan[]>([])
  const [featureRegistry, setFeatureRegistry] = useState<FeatureRegistryEntry[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [changingPlanCode, setChangingPlanCode] = useState<string | null>(null)

  useEffect(() => {
    if (isGlobalMode || !selectedCompany) return
    let cancelled = false
    setIsLoading(true)
    setError(null)

    const subscriptionApi = createSubscriptionApi(createSuperAdminClient(selectedServer.id, selectedCompany.id))

    Promise.all([
      listInstancePlans(selectedServer.id),
      listInstanceFeatureRegistry(selectedServer.id),
      subscriptionApi.getMySubscription(),
    ])
      .then(([planList, registry, sub]) => {
        if (cancelled) return
        setPlans([...planList].filter((p) => p.is_active).sort((a, b) => a.display_order - b.display_order))
        setFeatureRegistry(registry)
        setSubscription(sub)
      })
      .catch((e) => {
        console.error('Erreur chargement abonnement', e)
        if (!cancelled) setError("Impossible de charger l'abonnement de cette entreprise.")
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [selectedServer.id, selectedCompany, isGlobalMode])

  const handlePlanChange = async (planCode: string) => {
    if (!selectedCompany) return
    try {
      setChangingPlanCode(planCode)
      const subscriptionApi = createSubscriptionApi(createSuperAdminClient(selectedServer.id, selectedCompany.id))
      const updated = await subscriptionApi.subscribeToPlan(planCode)
      setSubscription(updated)
      toast.success(`Plan changé pour ${updated.plan.name} — activé pour 30 jours.`)
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Erreur lors du changement de plan.')
    } finally {
      setChangingPlanCode(null)
    }
  }

  if (isGlobalMode) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <Globe className="w-10 h-10" style={{ color: '#334155' }} />
        <p className="text-sm" style={{ color: '#94a3b8' }}>Sélectionnez une instance dans le menu pour voir son abonnement.</p>
      </div>
    )
  }

  if (!selectedCompany) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <Building2 className="w-10 h-10" style={{ color: '#334155' }} />
        <p className="text-sm" style={{ color: '#94a3b8' }}>Sélectionnez une entreprise dans le menu pour voir son abonnement.</p>
      </div>
    )
  }

  if (isLoading) return <Loader />

  if (error) {
    return (
      <div className="p-4">
        <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>{error}</div>
      </div>
    )
  }

  if (!subscription) return null

  const currentPlan = subscription.plan
  // Fonctionnalites du registre (controle d'acces reel, modele deny-list —
  // toujours affichees meme si aucun plan ne les mentionne explicitement)
  // + fonctionnalites decoratives libres trouvees sur au moins un plan
  // (modele allow-list — affichees seulement si un plan les liste).
  const registryLabels = featureRegistry.map((f) => f.label)
  const freeLabels = Array.from(
    new Set(
      plans.flatMap((p) => (Array.isArray(p.features) ? p.features.filter((f) => !f.key).map((f) => f.label) : [])),
    ),
  )
  const allFeatureLabels = Array.from(new Set([...registryLabels, ...freeLabels]))

  // Categorie reelle depuis le registre backend (subscriptions.feature_registry) —
  // plus de mapping par mot-cle duplique et desynchronisable cote frontend.
  const featureCategoryOf = (label: string): string =>
    featureRegistry.find((f) => f.label === label)?.category ?? 'support'

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Abonnement — {selectedCompany.name}</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>Gérez le plan de cet établissement sur l'instance {selectedServer.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-3 py-1 rounded-full flex items-center gap-1"
            style={{
              background: subscription.status === 'active' ? 'rgba(34, 197, 94, 0.15)' : subscription.status === 'trialing' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: subscription.status === 'active' ? '#22c55e' : subscription.status === 'trialing' ? '#818cf8' : '#ef4444',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {subscription.status === 'active' ? 'Actif' : subscription.status === 'trialing' ? 'Essai' : subscription.status === 'expired' ? 'Expiré' : 'Annulé'}
          </span>
        </div>
      </div>

      <div
        className="rounded-xl border p-6"
        style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(49, 46, 129, 0.15))', borderColor: '#6366f1' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5" style={{ color: '#f59e0b' }} />
              <h2 className="text-lg font-bold text-white">Plan {currentPlan.name}</h2>
            </div>
            <p className="text-2xl font-bold text-white mt-1">
              {parseFloat(currentPlan.price) === 0 ? 'Gratuit' : `${parseFloat(currentPlan.price).toLocaleString('fr-FR')} FCFA`}
              {parseFloat(currentPlan.price) > 0 && (
                <span className="text-sm font-normal" style={{ color: '#94a3b8' }}>/{currentPlan.period_label}</span>
              )}
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              {subscription.trial_end && (
                <span style={{ color: '#94a3b8' }}><Calendar className="w-3 h-3 inline mr-1" />Fin d'essai : {new Date(subscription.trial_end).toLocaleDateString('fr-FR')}</span>
              )}
              {subscription.current_period_end && (
                <span style={{ color: '#94a3b8' }}><Calendar className="w-3 h-3 inline mr-1" />Prochain paiement : {new Date(subscription.current_period_end).toLocaleDateString('fr-FR')}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <h3 className="font-semibold text-sm text-white mt-2">Changer de plan</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const isCurrent = plan.code === currentPlan.code
          const price = parseFloat(plan.price)
          const isFree = plan.is_free || price === 0
          const isChanging = changingPlanCode === plan.code
          const planFeatures = Array.isArray(plan.features) ? plan.features.filter((f) => f.included) : []
          return (
            <div
              key={plan.code}
              className={`rounded-xl border p-5 transition-all relative ${isCurrent ? 'border-primary-500' : 'hover:border-primary-500'}`}
              style={{
                background: isCurrent ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(49, 46, 129, 0.1))' : '#1e293b',
                borderColor: isCurrent ? '#6366f1' : '#334155',
                transform: plan.is_featured ? 'translateY(-4px)' : 'none',
              }}
            >
              {plan.is_featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-xs font-bold" style={{ background: '#6366f1' }}>
                  <Star className="w-3 h-3 inline mr-1" />{plan.badge_label || 'Recommandé'}
                </div>
              )}
              {isFree && !plan.is_featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-xs font-bold" style={{ background: '#22c55e' }}>
                  <Gift className="w-3 h-3 inline mr-1" />{plan.badge_label || 'Essai gratuit'}
                </div>
              )}
              <h3 className="text-lg font-bold text-white">{plan.name}</h3>
              <p className="text-sm" style={{ color: '#94a3b8' }}>{plan.description}</p>
              <div className="my-3">
                <span className={`text-3xl font-bold ${isFree ? 'text-green-400' : 'text-white'}`}>
                  {price === 0 ? 'Gratuit' : price.toLocaleString('fr-FR') + ' FCFA'}
                </span>
                {price > 0 && <span className="text-sm" style={{ color: '#94a3b8' }}>/{plan.period_label}</span>}
                {isFree && plan.trial_days > 0 && <p className="text-xs mt-1" style={{ color: '#22c55e' }}>{plan.trial_days} jours d'essai complet</p>}
              </div>

              <ul className="space-y-1.5 mb-4 text-xs">
                {planFeatures.slice(0, 4).map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-3 h-3" style={{ color: '#22c55e' }} />
                    <span style={{ color: '#cbd5e1' }}>{feature.label}</span>
                  </li>
                ))}
                {planFeatures.length > 4 && <li className="text-xs" style={{ color: '#64748b' }}>+{planFeatures.length - 4} autres fonctionnalités</li>}
              </ul>

              <button
                onClick={() => handlePlanChange(plan.code)}
                disabled={isCurrent || changingPlanCode !== null}
                className={`w-full py-2 rounded-lg text-white text-sm font-semibold transition flex items-center justify-center gap-1.5 ${
                  isCurrent ? 'bg-dark-600 text-dark-400 cursor-default' : isFree ? 'bg-green-600 hover:bg-green-500' : 'bg-primary-600 hover:bg-primary-500'
                } disabled:opacity-50`}
                style={{ boxShadow: !isCurrent && changingPlanCode === null ? (isFree ? '0 10px 25px -5px rgba(34, 197, 94, 0.3)' : '0 10px 25px -5px rgba(99, 102, 241, 0.3)') : 'none' }}
              >
                {isChanging && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isCurrent ? 'Plan actuel' : isChanging ? 'Changement...' : plan.cta_label || 'Choisir ce plan'}
              </button>
            </div>
          )
        })}
      </div>

      {allFeatureLabels.length > 0 && (
        <div className="rounded-xl border overflow-hidden" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <div className="p-4 border-b" style={{ borderColor: '#334155' }}>
            <h3 className="font-semibold text-sm text-white">Comparaison des fonctionnalités</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: '#334155' }}>
                  <th className="px-4 py-3 text-left text-xs" style={{ color: '#94a3b8' }}>Fonctionnalité</th>
                  {plans.map((plan) => <th key={plan.code} className="px-4 py-3 text-center text-xs" style={{ color: '#94a3b8' }}>{plan.name}</th>)}
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
                          <category.icon className="w-3 h-3 inline mr-1" />{category.label}
                        </td>
                      </tr>
                      {features.map((label) => {
                        const isRegistryFeature = registryLabels.includes(label)
                        return (
                        <tr key={label} className="border-b" style={{ borderColor: '#334155' }}>
                          <td className="px-4 py-2 text-xs" style={{ color: '#94a3b8' }}>{label}</td>
                          {plans.map((plan) => {
                            const entry = Array.isArray(plan.features) ? plan.features.find((f) => f.label === label) : undefined
                            // Fonctionnalite du registre (controle d'acces
                            // reel) : modele deny-list — absente du plan =
                            // incluse par defaut, voir PlanFeaturePermission
                            // cote backend. Fonctionnalite decorative libre :
                            // modele allow-list classique — visible seulement
                            // si le plan la liste avec included=true.
                            const hasFeature = isRegistryFeature
                              ? (entry ? entry.included : true)
                              : Boolean(entry?.included)
                            return (
                              <td key={`${plan.code}-${label}`} className="px-4 py-2 text-center">
                                {hasFeature ? <Check className="w-4 h-4 mx-auto" style={{ color: '#22c55e' }} /> : <X className="w-4 h-4 mx-auto" style={{ color: '#475569' }} />}
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

      <div className="rounded-xl border p-4" style={{ background: '#1e293b', borderColor: '#334155' }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
              <CreditCard className="w-5 h-5" style={{ color: '#818cf8' }} />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Paiement</p>
              <p className="text-xs" style={{ color: '#94a3b8' }}>
                Phase 1 : la souscription active immédiatement le plan choisi, sans passerelle de paiement réelle.
                Référence de paiement actuelle : {subscription.payment_reference || 'aucune'}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
