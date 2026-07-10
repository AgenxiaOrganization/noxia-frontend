'use client'

import { Check, X, Package, BarChart, Globe, Headphones } from 'lucide-react'
import { motion } from 'framer-motion'
import React from 'react'

const plans = [
  { id: 'essai', name: 'Essai 30j' },
  { id: 'starter', name: 'Starter' },
  { id: 'premium', name: 'Premium' },
  { id: 'business', name: 'Business' },
]

const featureCategories = [
  { id: 'base', label: 'Fonctionnalités de base', icon: Package },
  { id: 'advanced', label: 'Fonctionnalités avancées', icon: BarChart },
  { id: 'integration', label: 'Intégrations & API', icon: Globe },
  { id: 'support', label: 'Support & Assistance', icon: Headphones },
]

// ✅ Mise à jour : Essai et Business ont TOUTES les fonctionnalités
const features = {
  // Base
  'Tableau de bord complet': { category: 'base', plans: ['essai', 'premium', 'business'] },
  'Tableau de bord': { category: 'base', plans: ['starter','essai','business'] },
  'Gestion des ventes (POS)': { category: 'base', plans: ['essai', 'starter', 'premium', 'business'] },
  'Gestion des stocks': { category: 'base', plans: ['essai', 'starter', 'premium', 'business'] },
  'Rapports basiques': { category: 'base', plans: ['starter','essai','business'] },
  'Rapports avancés': { category: 'advanced', plans: ['essai', 'premium', 'business'] },
  'Multi-utilisateurs': { category: 'advanced', plans: ['essai', 'premium', 'business'] },
  'Multi-caisses': { category: 'advanced', plans: ['essai', 'premium', 'business'] },
  'Assistant IA': { category: 'advanced', plans: ['essai', 'premium', 'business'] },
  'Multi-établissements': { category: 'advanced', plans: ['essai', 'premium', 'business'] },
  'API publique': { category: 'integration', plans: ['essai', 'premium', 'business'] },
  'WhatsApp & Telegram': { category: 'integration', plans: ['essai', 'starter', 'premium', 'business'] },
  'Alertes automatiques': { category: 'integration', plans: ['essai', 'starter', 'premium', 'business'] },
  // Support - Essai et Business ont tout
  'Support prioritaire 24/7': { category: 'support', plans: ['essai', 'business'] },
  'Formation équipe': { category: 'support', plans: ['essai', 'business'] },
  'Déploiement personnalisé': { category: 'support', plans: ['essai', 'business'] },
  'Intégrations sur mesure': { category: 'integration', plans: ['essai', 'business'] },
  'SLA garanti': { category: 'support', plans: ['essai', 'business'] },
}

export function FeatureComparison() {
  return (
    <section 
      className="py-20"
      style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #312e81 70%, #4f46e5 100%)' 
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
            Comparaison des fonctionnalités
          </h2>
          <p className="text-lg" style={{ color: '#94a3b8' }}>
            Trouvez le plan qui correspond le mieux à vos besoins
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="rounded-xl border overflow-hidden"
          style={{ 
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            borderColor: 'rgba(255,255,255,0.1)'
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <th className="px-4 py-3 text-left text-xs" style={{ color: '#94a3b8' }}>Fonctionnalité</th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="px-4 py-3 text-center text-xs font-semibold" style={{ color: '#f1f5f9' }}>
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureCategories.map((category) => {
                  const categoryFeatures = Object.entries(features)
                    .filter(([_, meta]) => meta.category === category.id)
                    .map(([key]) => key)

                  return (
                    <React.Fragment key={category.id}>
                      <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                        <td colSpan={5} className="px-4 py-2 text-xs font-semibold" style={{ color: '#818cf8' }}>
                          <category.icon className="w-3 h-3 inline mr-1" />
                          {category.label}
                        </td>
                      </tr>
                      {categoryFeatures.map((feature) => (
                        <tr key={feature} className="border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                          <td className="px-4 py-2 text-xs" style={{ color: '#94a3b8' }}>{feature}</td>
                          {plans.map((plan) => {
                            const hasFeature = features[feature as keyof typeof features]?.plans.includes(plan.id)
                            return (
                              <td key={`${plan.id}-${feature}`} className="px-4 py-2 text-center">
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
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  )
}