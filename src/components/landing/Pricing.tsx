'use client'

import { useState, useEffect } from 'react'
import { Check, X, Star, Gift } from 'lucide-react'

const plans = [
  {
    id: 'essai',
    name: 'Essai',
    price: 0,
    period: '30 jours',
    description: 'Découvrez toutes les fonctionnalités',
    featured: false,
    isFree: true,
    features: [
      'Tableau de bord complet',
      'Gestion des ventes (POS)',
      'Gestion des stocks',
      'Rapports avancés',
      'Multi-utilisateurs',
      'Multi-caisses',
      'Assistant IA',
      'Multi-établissements',
      'API publique',
      'WhatsApp & Telegram',
      'Alertes automatiques',
      'Support prioritaire 24/7'
    ],
    notIncluded: [],
    cta: 'Commencer l\'essai',
    href: '/register'
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 5000,
    period: 'mois',
    description: 'Pour les petits établissements',
    featured: false,
    isFree: false,
    features: [
      'Tableau de bord',
      'Gestion des ventes (POS)',
      'Gestion des stocks',
      'Rapports basiques',
      'WhatsApp & Telegram',
      'Alertes automatiques'
    ],
    notIncluded: [
      'Rapports avancés',
      'Multi-utilisateurs',
      'Multi-caisses',
      'Assistant IA',
      'Multi-établissements',
      'API publique',
      'Support prioritaire'
    ],
    cta: 'Choisir Starter',
    href: '/register'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 11000,
    period: 'mois',
    description: 'Pour les établissements en croissance',
    featured: true,
    isFree: false,
    features: [
      'Tableau de bord complet',
      'Gestion des ventes (POS)',
      'Gestion des stocks',
      'Rapports avancés',
      'Multi-utilisateurs',
      'Multi-caisses',
      'Assistant IA',
      'Multi-établissements',
      'API publique',
      'WhatsApp & Telegram',
      'Alertes automatiques'
    ],
    notIncluded: [
      'Support prioritaire 24/7'
    ],
    cta: 'Choisir Premium',
    href: '/register'
  },
  {
    id: 'business',
    name: 'Business',
    price: 14000,
    period: 'mois',
    description: 'Pour les groupes et franchises',
    featured: false,
    isFree: false,
    features: [
      'Tableau de bord complet',
      'Gestion des ventes (POS)',
      'Gestion des stocks',
      'Rapports avancés',
      'Multi-utilisateurs',
      'Multi-caisses',
      'Assistant IA',
      'Multi-établissements',
      'API publique',
      'WhatsApp & Telegram',
      'Alertes automatiques',
      'Support prioritaire 24/7',
      'Formation équipe',
      'Déploiement personnalisé',
      'Intégrations sur mesure',
      'SLA garanti'
    ],
    notIncluded: [],
    cta: 'Choisir Business',
    href: '/register'
  },
]

// ✅ Fonction de formatage simple pour éviter l'hydratation
const formatPrice = (price: number): string => {
  // Utiliser un formatage simple qui ne change pas entre serveur et client
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export function Pricing() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const formattedPrice = isMounted ? formatPrice(plan.price) : plan.price.toString()
            return (
              <div 
                key={plan.id}
                className={`rounded-2xl p-6 relative transition-all duration-500 hover:scale-105 ${
                  plan.featured ? 'lg:-translate-y-2' : ''
                }`}
                style={{
                  background: plan.featured 
                    ? 'linear-gradient(to bottom, rgba(99, 102, 241, 0.2), rgba(49, 46, 129, 0.2))'
                    : 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  border: plan.featured 
                    ? '2px solid #6366f1'
                    : '1px solid rgba(255,255,255,0.1)',
                  animation: `fadeIn 0.6s ease-out ${index * 0.1}s both`
                }}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-xs font-bold animate-pulse"
                    style={{ background: '#6366f1' }}
                  >
                    <Star className="w-3 h-3 inline mr-1" />
                    Recommandé
                  </div>
                )}
                {plan.isFree && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-xs font-bold"
                    style={{ background: '#22c55e' }}
                  >
                    <Gift className="w-3 h-3 inline mr-1" />
                    Essai 30 jours
                  </div>
                )}
                <h3 className="text-xl font-bold text-white mt-2">{plan.name}</h3>
                <p className="text-sm" style={{ color: '#94a3b8' }}>{plan.description}</p>
                <div className="my-4">
                  <span className={`text-3xl font-bold ${plan.isFree ? 'text-green-400' : 'text-white'}`}>
                    {plan.price === 0 ? 'Gratuit' : formattedPrice + ' FCFA'}
                  </span>
                  {plan.period && plan.price > 0 && (
                    <span className="text-sm" style={{ color: '#94a3b8' }}>/{plan.period}</span>
                  )}
                  {plan.isFree && (
                    <p className="text-xs mt-1" style={{ color: '#22c55e' }}>30 jours d'essai complet</p>
                  )}
                </div>

                <ul className="space-y-2 mb-6 text-sm">
                  {plan.features.slice(0, 5).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0" style={{ color: '#22c55e' }} />
                      <span style={{ color: '#cbd5e1' }}>{feature}</span>
                    </li>
                  ))}
                  {plan.features.length > 5 && (
                    <li className="text-xs" style={{ color: '#64748b' }}>
                      +{plan.features.length - 5} autres fonctionnalités
                    </li>
                  )}
                  {plan.notIncluded && plan.notIncluded.slice(0, 3).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <X className="w-4 h-4 shrink-0" style={{ color: '#475569' }} />
                      <span style={{ color: '#475569' }}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <a 
                  href={plan.href}
                  className={`block text-center py-2.5 rounded-xl text-white font-semibold text-sm transition-all duration-300 ${
                    plan.featured 
                      ? 'bg-primary-600 hover:bg-primary-500 shadow-lg shadow-primary-600/25 hover:shadow-xl hover:scale-105' 
                      : plan.isFree
                      ? 'bg-green-600 hover:bg-green-500 shadow-lg shadow-green-600/25 hover:shadow-xl hover:scale-105'
                      : 'border border-dark-600 hover:border-primary-500 hover:bg-primary-500/10'
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}