'use client'

import { useState, useEffect } from 'react'
import { Check, X, Star, Gift, Loader2 } from 'lucide-react'
import { getPlans, type Plan } from '@/lib/api/subscription'

// Fonction de formatage simple
const formatPrice = (price: number): string => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export function Pricing() {
  const [isMounted, setIsMounted] = useState(false)
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsMounted(true)
    let cancelled = false
    getPlans()
      .then((list) => {
        if (cancelled) return
        setPlans([...list].sort((a, b) => a.display_order - b.display_order))
      })
      .catch((e) => console.error('Erreur chargement des plans', e))
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <section
      id="pricing"
      className="py-20"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #312e81 70%, #4f46e5 100%)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white animate-slide-up">
            Plans d'abonnement
          </h2>
          <p className="text-lg" style={{ color: '#94a3b8' }}>
            Choisissez le plan adapté à votre établissement. Évoluez à tout moment.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#818cf8' }} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {plans.map((plan, index) => {
              const price = parseFloat(plan.price)
              const originalPrice = plan.original_price ? parseFloat(plan.original_price) : null
              const formattedPrice = isMounted ? formatPrice(price) : price.toString()
              const formattedOriginalPrice = originalPrice !== null
                ? (isMounted ? formatPrice(originalPrice) : originalPrice.toString())
                : null
              // `features` doit etre une liste {label, included} — defensif au
              // cas ou une donnee mal formee (ancien format, edition manuelle
              // en base) atteigne quand meme la landing publique.
              const features = Array.isArray(plan.features) ? plan.features : []
              const includedFeatures = features.filter((f) => f.included)
              const excludedFeatures = features.filter((f) => !f.included)

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
                  {plan.has_active_discount && (
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
                    {plan.has_active_discount && formattedOriginalPrice && (
                      <div className="text-sm line-through mb-0.5" style={{ color: '#64748b' }}>
                        {formattedOriginalPrice} FCFA
                      </div>
                    )}
                    <span className={`text-3xl font-bold ${plan.is_free ? 'text-green-400' : 'text-white'}`}>
                      {price === 0 ? 'Gratuit' : formattedPrice + ' FCFA'}
                    </span>
                    {plan.period_label && price > 0 && (
                      <span className="text-sm" style={{ color: '#94a3b8' }}>/{plan.period_label}</span>
                    )}
                    {plan.is_free && plan.trial_days > 0 && (
                      <p className="text-xs mt-1" style={{ color: '#22c55e' }}>{plan.trial_days} jours d'essai complet</p>
                    )}
                  </div>

                  <ul className="space-y-2 mb-6 text-sm">
                    {includedFeatures.slice(0, 5).map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-4 h-4 shrink-0" style={{ color: '#22c55e' }} />
                        <span style={{ color: '#cbd5e1' }}>{feature.label}</span>
                      </li>
                    ))}
                    {includedFeatures.length > 5 && (
                      <li className="text-xs" style={{ color: '#64748b' }}>
                        +{includedFeatures.length - 5} autres fonctionnalités
                      </li>
                    )}
                    {excludedFeatures.slice(0, 3).map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <X className="w-4 h-4 shrink-0" style={{ color: '#475569' }} />
                        <span style={{ color: '#475569' }}>{feature.label}</span>
                      </li>
                    ))}
                  </ul>

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
