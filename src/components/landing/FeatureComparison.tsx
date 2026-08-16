'use client'

import { useEffect, useState } from 'react'
import { Check, X, Package, BarChart, Globe, Headphones } from 'lucide-react'
import { motion } from 'framer-motion'
import React from 'react'
import { getPlans, getFeatureRegistry, type Plan, type FeatureRegistryEntry } from '@/lib/api/subscription'

const featureCategories = [
  { id: 'base', label: 'Fonctionnalités de base', icon: Package },
  { id: 'advanced', label: 'Fonctionnalités avancées', icon: BarChart },
  { id: 'integration', label: 'Intégrations & API', icon: Globe },
  { id: 'support', label: 'Support & Assistance', icon: Headphones },
]

/**
 * Categorisation purement visuelle pour regrouper le tableau comparatif —
 * les labels viennent du vrai catalogue de plans de l'instance (voir
 * lib/api/subscription.ts). Doit rester aligne avec les `label` de
 * subscriptions.feature_registry.FEATURE_REGISTRY cote noxia-backend. Un
 * libelle absent de la liste (fonctionnalite decorative libre ajoutee par
 * le super-admin) tombe dans "base" par defaut.
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

export function FeatureComparison() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [featureRegistry, setFeatureRegistry] = useState<FeatureRegistryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([getPlans(), getFeatureRegistry()])
      .then(([planList, registry]) => {
        if (cancelled) return
        setPlans([...planList].sort((a, b) => a.display_order - b.display_order))
        setFeatureRegistry(registry)
      })
      .catch((e) => console.error('Erreur chargement comparatif des plans', e))
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [])

  // Fonctionnalites du registre (controle d'acces reel, modele deny-list —
  // toujours affichees meme si aucun plan ne les mentionne explicitement)
  // + fonctionnalites decoratives libres trouvees sur au moins un plan
  // (modele allow-list — affichees seulement si un plan les liste).
  const registryLabels = featureRegistry.map((f) => f.label)
  const freeLabels = Array.from(
    new Set(plans.flatMap((p) => p.features.filter((f) => !f.key).map((f) => f.label))),
  )
  const allFeatureLabels = Array.from(new Set([...registryLabels, ...freeLabels]))

  if (!isLoading && plans.length === 0) return null

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
                    <th key={plan.code} className="px-4 py-3 text-center text-xs font-semibold" style={{ color: '#f1f5f9' }}>
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureCategories.map((category) => {
                  const categoryFeatures = allFeatureLabels.filter((label) => featureCategoryOf(label) === category.id)
                  if (categoryFeatures.length === 0) return null

                  return (
                    <React.Fragment key={category.id}>
                      <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                        <td colSpan={1 + plans.length} className="px-4 py-2 text-xs font-semibold" style={{ color: '#818cf8' }}>
                          <category.icon className="w-3 h-3 inline mr-1" />
                          {category.label}
                        </td>
                      </tr>
                      {categoryFeatures.map((label) => {
                        const isRegistryFeature = registryLabels.includes(label)
                        return (
                          <tr key={label} className="border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                            <td className="px-4 py-2 text-xs" style={{ color: '#94a3b8' }}>{label}</td>
                            {plans.map((plan) => {
                              const entry = plan.features.find((f) => f.label === label)
                              // Fonctionnalite du registre : modele deny-list
                              // (absente du plan = incluse par defaut, voir
                              // PlanFeaturePermission cote backend).
                              // Fonctionnalite decorative libre : modele
                              // allow-list classique.
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
        </motion.div>
      </div>
    </section>
  )
}
