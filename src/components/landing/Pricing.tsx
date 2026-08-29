'use client'

import { useState, useEffect } from 'react'
import { Check, X, Star, Gift, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { getPlans, getFeatureRegistry, type Plan, type FeatureRegistryEntry, type PlanFeature } from '@/lib/api/subscription'

type BillingPeriod = 'monthly' | 'yearly'

// Fonction de formatage simple
const formatPrice = (price: number): string => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

/**
 * Reconstruit la liste COMPLETE des fonctionnalites d'un plan a afficher,
 * modele deny-list identique au backend (PlanFeaturePermission) : une cle
 * technique du registre absente de plan.features reste INCLUSE par defaut —
 * elle doit donc apparaitre comme cochee ici aussi, pas simplement disparaitre
 * de l'affichage. Sans ca, un plan qui ne liste aucune exclusion explicite
 * (ex: "Essai") semble n'avoir que 2 fonctionnalites au lieu de "tout".
 */
function resolveDisplayFeatures(plan: Plan, registry: FeatureRegistryEntry[]): PlanFeature[] {
  const rawFeatures = Array.isArray(plan.features) ? plan.features : []
  const byKey = new Map(rawFeatures.filter((f) => f.key).map((f) => [f.key, f]))
  const freeFeatures = rawFeatures.filter((f) => !f.key)

  const registryResolved: PlanFeature[] = registry.map((entry) => {
    const override = byKey.get(entry.key)
    return {
      key: entry.key,
      label: entry.label,
      description: entry.description,
      category: entry.category,
      included: override ? override.included : true,
    }
  })

  return [...registryResolved, ...freeFeatures]
}

export function Pricing() {
  const [isMounted, setIsMounted] = useState(false)
  const [plans, setPlans] = useState<Plan[]>([])
  const [featureRegistry, setFeatureRegistry] = useState<FeatureRegistryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set())

  useEffect(() => {
    setIsMounted(true)
    let cancelled = false
    Promise.all([getPlans(), getFeatureRegistry()])
      .then(([planList, registry]) => {
        if (cancelled) return
        setPlans([...planList].sort((a, b) => a.display_order - b.display_order))
        setFeatureRegistry(registry)
      })
      .catch((e) => console.error('Erreur chargement des plans', e))
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [])

  // Au moins un plan propose une offre annuelle : le toggle n'a de sens que
  // dans ce cas (sinon "Annuel" n'affecterait jamais rien de visible).
  const anyPlanHasYearlyOffer = plans.some((p) => p.yearly_price !== null)

  const toggleExpanded = (code: string) => {
    setExpandedPlans((prev) => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
  }

  return (
    <section
      id="pricing"
      className="py-20"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #312e81 70%, #4f46e5 100%)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white animate-slide-up">
            Plans d'abonnement
          </h2>
          <p className="text-lg" style={{ color: '#94a3b8' }}>
            Choisissez le plan adapté à votre établissement. Évoluez à tout moment.
          </p>
        </div>

        {!isLoading && anyPlanHasYearlyOffer && (
          <div className="flex justify-center mb-10">
            <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <button
                onClick={() => setBillingPeriod('monthly')}
                className="px-4 py-2 rounded-md text-sm font-medium transition"
                style={{
                  background: billingPeriod === 'monthly' ? '#4f46e5' : 'transparent',
                  color: billingPeriod === 'monthly' ? '#fff' : '#94a3b8',
                }}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className="px-4 py-2 rounded-md text-sm font-medium transition"
                style={{
                  background: billingPeriod === 'yearly' ? '#4f46e5' : 'transparent',
                  color: billingPeriod === 'yearly' ? '#fff' : '#94a3b8',
                }}
              >
                Annuel
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#818cf8' }} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto items-start">
            {plans.map((plan, index) => {
              const hasYearlyOffer = plan.yearly_price !== null
              const useYearly = billingPeriod === 'yearly' && hasYearlyOffer
              const price = useYearly ? parseFloat(plan.yearly_price as string) : parseFloat(plan.price)
              const originalPrice = plan.original_price ? parseFloat(plan.original_price) : null
              const formattedPrice = isMounted ? formatPrice(price) : price.toString()
              const formattedOriginalPrice = originalPrice !== null
                ? (isMounted ? formatPrice(originalPrice) : originalPrice.toString())
                : null
              // Liste complete (registre + decoratives), modele deny-list —
              // voir resolveDisplayFeatures : une cle du registre absente du
              // plan reste incluse par defaut, comme cote backend.
              const features = resolveDisplayFeatures(plan, featureRegistry)
              const includedFeatures = features.filter((f) => f.included)
              const excludedFeatures = features.filter((f) => !f.included)
              const isExpanded = expandedPlans.has(plan.code)
              const visibleIncluded = isExpanded ? includedFeatures : includedFeatures.slice(0, 5)
              const visibleExcluded = isExpanded ? excludedFeatures : excludedFeatures.slice(0, 3)
              const hiddenCount = (includedFeatures.length - visibleIncluded.length)
                + (excludedFeatures.length - visibleExcluded.length)

              return (
                <div
                  key={plan.code}
                  className={`rounded-2xl p-6 relative transition-all duration-500 hover:scale-105 ${
                    plan.is_featured ? 'lg:-translate-y-2' : ''
                  }`}
                  style={{
                    background: plan.is_featured
                      ? 'linear-gradient(to bottom, rgba(99, 102, 241, 0.2), rgba(49, 46, 129, 0.2))'
                      : 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)',
                    border: plan.is_featured
                      ? '2px solid #6366f1'
                      : '1px solid rgba(255,255,255,0.1)',
                    animation: `fadeIn 0.6s ease-out ${index * 0.1}s both`
                  }}
                >
                  {plan.badge_label && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1 whitespace-nowrap"
                      style={{ background: plan.is_free ? '#22c55e' : '#6366f1' }}
                    >
                      {plan.is_free ? <Gift className="w-3 h-3" /> : <Star className="w-3 h-3" />}
                      {plan.badge_label}
                    </div>
                  )}
                  {plan.has_active_discount && !useYearly && (
                    <div
                      className="absolute -top-3 right-3 px-3 py-1 rounded-full text-white text-[10px] font-bold animate-pulse"
                      style={{ background: '#f59e0b' }}
                    >
                      PROMO
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-white mt-2">{plan.name}</h3>
                  <p className="text-sm" style={{ color: '#94a3b8' }}>{plan.description}</p>
                  <div className="my-4">
                    {plan.has_active_discount && !useYearly && formattedOriginalPrice && (
                      <div className="text-sm line-through mb-0.5" style={{ color: '#64748b' }}>
                        {formattedOriginalPrice} FCFA
                      </div>
                    )}
                    <span className={`text-3xl font-bold ${plan.is_free ? 'text-green-400' : 'text-white'}`}>
                      {price === 0 ? 'Gratuit' : formattedPrice + ' FCFA'}
                    </span>
                    {price > 0 && (
                      <span className="text-sm" style={{ color: '#94a3b8' }}>/{useYearly ? 'an' : plan.period_label}</span>
                    )}
                    {useYearly && plan.yearly_discount_percent > 0 && (
                      <p className="text-xs mt-1 font-medium" style={{ color: '#818cf8' }}>
                        Économisez {plan.yearly_discount_percent}% vs mensuel
                      </p>
                    )}
                    {!plan.is_free && billingPeriod === 'yearly' && !hasYearlyOffer && (
                      <p className="text-xs mt-1" style={{ color: '#64748b' }}>Pas d'offre annuelle — facturé au mois</p>
                    )}
                    {plan.is_free && plan.trial_days > 0 && (
                      <p className="text-xs mt-1" style={{ color: '#22c55e' }}>{plan.trial_days} jours d'essai complet</p>
                    )}
                  </div>

                  <ul className="space-y-2 mb-3 text-sm">
                    {visibleIncluded.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-4 h-4 shrink-0" style={{ color: '#22c55e' }} />
                        <span style={{ color: '#cbd5e1' }}>{feature.label}</span>
                      </li>
                    ))}
                    {visibleExcluded.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <X className="w-4 h-4 shrink-0" style={{ color: '#475569' }} />
                        <span style={{ color: '#475569' }}>{feature.label}</span>
                      </li>
                    ))}
                  </ul>

                  {hiddenCount > 0 && (
                    <button
                      type="button"
                      onClick={() => toggleExpanded(plan.code)}
                      className="flex items-center gap-1 text-xs font-medium mb-4 transition hover:opacity-80"
                      style={{ color: '#818cf8' }}
                    >
                      {isExpanded ? (
                        <>Voir moins <ChevronUp className="w-3.5 h-3.5" /></>
                      ) : (
                        <>Voir {hiddenCount} de plus <ChevronDown className="w-3.5 h-3.5" /></>
                      )}
                    </button>
                  )}
                  {hiddenCount === 0 && <div className="mb-6" />}

                  <a
                    href="/register"
                    className={`block text-center py-2.5 rounded-xl text-white font-semibold text-sm transition-all duration-300 ${
                      plan.is_featured
                        ? 'bg-primary-600 hover:bg-primary-500 shadow-lg shadow-primary-600/25 hover:shadow-xl hover:scale-105'
                        : plan.is_free
                        ? 'bg-green-600 hover:bg-green-500 shadow-lg shadow-green-600/25 hover:shadow-xl hover:scale-105'
                        : 'border border-dark-600 hover:border-primary-500 hover:bg-primary-500/10'
                    }`}
                  >
                    {plan.cta_label}
                  </a>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
