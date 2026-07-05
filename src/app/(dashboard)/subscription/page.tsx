'use client'

import { useState } from 'react'
import {
  CreditCard, Check, X, Crown, Star,
  Zap, Users, Package, BarChart, Bot,
  Smartphone, Globe, Headphones, ChevronRight,
  Calendar, Download, AlertCircle
} from 'lucide-react'

// Données mockées
const currentPlan = {
  id: 'premium',
  name: 'Premium',
  price: 49900,
  period: 'mois',
  status: 'actif',
  startDate: '2026-06-01',
  endDate: '2026-07-01',
  features: [
    'Tableau de bord',
    'Gestion des ventes',
    'Gestion des stocks',
    'Rapports basiques',
    'WhatsApp & Telegram',
    'Rapports avancés',
    'Multi-utilisateurs',
    'Multi-caisses',
    'Assistant IA',
    'Multi-établissements',
    'API publique'
  ]
}

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    period: '5 jours',
    description: 'Pour démarrer et tester',
    popular: false,
    features: [
      'Tableau de bord',
      'Gestion des ventes',
      'Gestion des stocks',
      'Rapports basiques',
      'WhatsApp & Telegram'
    ],
    notIncluded: [
      'Rapports avancés',
      'Multi-utilisateurs',
      'Multi-caisses',
      'Assistant IA',
      'Multi-établissements',
      'API publique'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 49900,
    period: 'mois',
    description: 'Pour les établissements en croissance',
    popular: true,
    features: [
      'Tableau de bord',
      'Gestion des ventes',
      'Gestion des stocks',
      'Rapports basiques',
      'WhatsApp & Telegram',
      'Rapports avancés',
      'Multi-utilisateurs',
      'Multi-caisses',
      'Assistant IA',
      'Multi-établissements',
      'API publique'
    ],
    notIncluded: []
  },
  {
    id: 'business',
    name: 'Business',
    price: 0,
    period: 'sur devis',
    description: 'Pour les groupes et franchises',
    popular: false,
    features: [
      'Tout Premium +',
      'Support prioritaire 24/7',
      'Formation équipe',
      'Déploiement personnalisé',
      'Intégrations sur mesure',
      'SLA garanti'
    ],
    notIncluded: []
  }
]

const mockInvoices = [
  { id: 'INV-2026-06', date: '2026-06-01', amount: 49900, status: 'payée', plan: 'Premium' },
  { id: 'INV-2026-05', date: '2026-05-01', amount: 49900, status: 'payée', plan: 'Premium' },
  { id: 'INV-2026-04', date: '2026-04-01', amount: 49900, status: 'payée', plan: 'Premium' },
  { id: 'INV-2026-03', date: '2026-03-01', amount: 49900, status: 'payée', plan: 'Premium' },
]

const featureCategories = [
  { id: 'base', label: 'Fonctionnalités de base', icon: Package },
  { id: 'advanced', label: 'Fonctionnalités avancées', icon: BarChart },
  { id: 'integration', label: 'Intégrations & API', icon: Globe },
  { id: 'support', label: 'Support & Assistance', icon: Headphones },
]

const featureMap: Record<string, { category: string, label: string }> = {
  'Tableau de bord': { category: 'base', label: 'Tableau de bord' },
  'Gestion des ventes': { category: 'base', label: 'Gestion des ventes' },
  'Gestion des stocks': { category: 'base', label: 'Gestion des stocks' },
  'Rapports basiques': { category: 'base', label: 'Rapports basiques' },
  'Rapports avancés': { category: 'advanced', label: 'Rapports avancés' },
  'Multi-utilisateurs': { category: 'advanced', label: 'Multi-utilisateurs' },
  'Multi-caisses': { category: 'advanced', label: 'Multi-caisses' },
  'Assistant IA': { category: 'advanced', label: 'Assistant IA' },
  'Multi-établissements': { category: 'advanced', label: 'Multi-établissements' },
  'API publique': { category: 'integration', label: 'API publique' },
  'WhatsApp & Telegram': { category: 'integration', label: 'WhatsApp & Telegram' },
  'Support prioritaire 24/7': { category: 'support', label: 'Support prioritaire 24/7' },
  'Formation équipe': { category: 'support', label: 'Formation équipe' },
  'Déploiement personnalisé': { category: 'support', label: 'Déploiement personnalisé' },
  'Intégrations sur mesure': { category: 'integration', label: 'Intégrations sur mesure' },
  'SLA garanti': { category: 'support', label: 'SLA garanti' },
  'Tout Premium +': { category: 'base', label: 'Tout Premium +' },
}

export default function SubscriptionPage() {
  const [isChangingPlan, setIsChangingPlan] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const handlePlanChange = (planId: string) => {
    setSelectedPlan(planId)
    setIsChangingPlan(true)
    // Simulation de changement
    setTimeout(() => {
      setIsChangingPlan(false)
      alert(`Plan changé pour ${plans.find(p => p.id === planId)?.name}`)
    }, 1500)
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Abonnement</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            Gérez votre plan et vos paiements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span 
            className="text-xs px-3 py-1 rounded-full flex items-center gap-1"
            style={{ 
              background: currentPlan.status === 'actif' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: currentPlan.status === 'actif' ? '#22c55e' : '#ef4444'
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {currentPlan.status === 'actif' ? 'Actif' : 'Inactif'}
          </span>
        </div>
      </div>

      {/* Plan actuel */}
      <div 
        className="rounded-xl border p-6"
        style={{ 
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(49, 46, 129, 0.15))',
          borderColor: '#6366f1'
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5" style={{ color: '#f59e0b' }} />
              <h2 className="text-lg font-bold text-white">Plan {currentPlan.name}</h2>
            </div>
            <p className="text-2xl font-bold text-white mt-1">
              {currentPlan.price.toLocaleString()} FCFA
              <span className="text-sm font-normal" style={{ color: '#94a3b8' }}>
                /{currentPlan.period}
              </span>
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span style={{ color: '#94a3b8' }}>
                <Calendar className="w-3 h-3 inline mr-1" />
                Début: {currentPlan.startDate}
              </span>
              <span style={{ color: '#94a3b8' }}>
                <Calendar className="w-3 h-3 inline mr-1" />
                Prochain paiement: {currentPlan.endDate}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition flex items-center gap-2"
              style={{ 
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                color: '#22c55e'
              }}
            >
              <CreditCard className="w-4 h-4" />
              Payer maintenant
            </button>
          </div>
        </div>
      </div>

      {/* Plans disponibles */}
      <h3 className="font-semibold text-sm text-white mt-2">Changer de plan</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan.id
          return (
            <div 
              key={plan.id}
              className={`rounded-xl border p-6 transition-all ${
                isCurrent ? 'border-primary-500' : 'hover:border-primary-500'
              }`}
              style={{ 
                background: isCurrent 
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(49, 46, 129, 0.1))'
                  : '#1e293b',
                borderColor: isCurrent ? '#6366f1' : '#334155',
                transform: plan.popular ? 'translateY(-4px)' : 'none'
              }}
            >
              {plan.popular && (
                <div 
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-xs font-bold"
                  style={{ background: '#6366f1' }}
                >
                  <Star className="w-3 h-3 inline mr-1" />
                  Recommandé
                </div>
              )}
              <h3 className="text-lg font-bold text-white">{plan.name}</h3>
              <p className="text-sm" style={{ color: '#94a3b8' }}>{plan.description}</p>
              <div className="my-4">
                <span className="text-3xl font-bold text-white">
                  {plan.price === 0 ? 'Gratuit' : plan.price.toLocaleString() + ' FCFA'}
                </span>
                {plan.period && plan.price > 0 && (
                  <span className="text-sm" style={{ color: '#94a3b8' }}>/{plan.period}</span>
                )}
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.slice(0, 5).map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4" style={{ color: '#22c55e' }} />
                    <span style={{ color: '#cbd5e1' }}>{feature}</span>
                  </li>
                ))}
                {plan.features.length > 5 && (
                  <li className="text-xs" style={{ color: '#64748b' }}>
                    +{plan.features.length - 5} autres fonctionnalités
                  </li>
                )}
                {plan.notIncluded && plan.notIncluded.slice(0, 3).map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <X className="w-4 h-4" style={{ color: '#475569' }} />
                    <span style={{ color: '#475569' }}>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePlanChange(plan.id)}
                disabled={isCurrent || isChangingPlan}
                className={`w-full py-2.5 rounded-lg text-white text-sm font-semibold transition ${
                  isCurrent 
                    ? 'bg-dark-600 text-dark-400 cursor-default' 
                    : 'bg-primary-600 hover:bg-primary-500'
                } disabled:opacity-50`}
                style={{ boxShadow: !isCurrent && !isChangingPlan ? '0 10px 25px -5px rgba(99, 102, 241, 0.3)' : 'none' }}
              >
                {isCurrent ? 'Plan actuel' : isChangingPlan && selectedPlan === plan.id ? 'Changement...' : 'Choisir ce plan'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Comparaison des fonctionnalités */}
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
                  <th key={plan.id} className="px-4 py-3 text-center text-xs" style={{ color: '#94a3b8' }}>
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {featureCategories.map((category) => {
                const features = Object.entries(featureMap)
                  .filter(([_, meta]) => meta.category === category.id)
                  .map(([key]) => key)

                return (
                  <>
                    <tr className="border-b" style={{ borderColor: '#334155' }}>
                      <td colSpan={4} className="px-4 py-2 text-xs font-semibold" style={{ color: '#818cf8' }}>
                        <category.icon className="w-3 h-3 inline mr-1" />
                        {category.label}
                      </td>
                    </tr>
                    {features.map((feature) => (
                      <tr key={feature} className="border-b" style={{ borderColor: '#334155' }}>
                        <td className="px-4 py-2 text-xs" style={{ color: '#94a3b8' }}>{feature}</td>
                        {plans.map((plan) => {
                          const hasFeature = plan.features.includes(feature)
                          return (
                            <td key={plan.id} className="px-4 py-2 text-center">
                              {hasFeature ? (
                                <Check className="w-4 h-4 mx-auto" style={{ color: '#22c55e' }} />
                              ) : (
                                <X className="w-4 h-4 mx-auto" style={{ color: '#475569' }} />
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historique des factures */}
      <div 
        className="rounded-xl border p-4"
        style={{ 
          background: '#1e293b',
          borderColor: '#334155'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm text-white">Historique des factures</h3>
          <button className="text-xs flex items-center gap-1" style={{ color: '#818cf8' }}>
            Voir tout
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: '#334155' }}>
                <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Facture</th>
                <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Date</th>
                <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Plan</th>
                <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Montant</th>
                <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Statut</th>
                <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {mockInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-b" style={{ borderColor: '#334155' }}>
                  <td className="px-3 py-2 text-white">{invoice.id}</td>
                  <td className="px-3 py-2" style={{ color: '#94a3b8' }}>{invoice.date}</td>
                  <td className="px-3 py-2" style={{ color: '#94a3b8' }}>{invoice.plan}</td>
                  <td className="px-3 py-2 font-semibold" style={{ color: '#22c55e' }}>
                    {invoice.amount.toLocaleString()} F
                  </td>
                  <td className="px-3 py-2">
                    <span 
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        invoice.status === 'payée' ? 'bg-green-500/20 text-green-400' :
                        invoice.status === 'en attente' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <button className="text-xs flex items-center gap-1" style={{ color: '#818cf8' }}>
                      <Download className="w-3 h-3" />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Méthodes de paiement */}
      <div 
        className="rounded-xl border p-4"
        style={{ 
          background: '#1e293b',
          borderColor: '#334155'
        }}
      >
        <h3 className="font-semibold text-sm text-white mb-3">Méthodes de paiement</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { name: 'Mobile Money', icon: '📱', active: true },
            { name: 'Carte bancaire', icon: '💳', active: true },
            { name: 'Espèces', icon: '💵', active: false },
          ].map((method, i) => (
            <div 
              key={i}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                method.active ? 'border-green-500/20' : 'border-dark-600'
              }`}
              style={{ 
                background: method.active ? 'rgba(34, 197, 94, 0.05)' : 'rgba(51, 65, 85, 0.3)',
                borderColor: method.active ? 'rgba(34, 197, 94, 0.2)' : '#334155'
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{method.icon}</span>
                <span className="text-sm text-white">{method.name}</span>
              </div>
              {method.active && (
                <Check className="w-4 h-4" style={{ color: '#22c55e' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Support */}
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
    </div>
  )
}