'use client'

import { useEffect, useState } from 'react'
import { Check, X, BarChart, Headphones, LayoutDashboard } from 'lucide-react'
import { motion } from 'framer-motion'
import React from 'react'
import { getPlans, getFeatureRegistry, type Plan, type FeatureRegistryEntry } from '@/lib/api/subscription'

const featureCategories = [
  { id: 'base', label: 'Fonctionnalités de base', icon: LayoutDashboard },
  { id: 'advanced', label: 'Fonctionnalités avancées', icon: BarChart },
  { id: 'support', label: 'Support & Assistance', icon: Headphones },
]

/** Une ligne du tableau : soit une clé technique du registre (contrôle
 * d'accès réel), soit un label libre purement décoratif (ex: "Support
 * prioritaire 24/7") saisi sur au moins un plan par le super-admin. */
interface FeatureRow {
  key: string | null
  label: string
  category: string
}

/** Un plan inclut-il cette ligne ? Modele deny-list IDENTIQUE au backend
 * (voir subscriptions.permissions.PlanFeaturePermission/get_excluded_feature_keys) :
 * une clé technique connue mais absente de plan.features reste INCLUSE par
 * défaut ; une entrée décorative absente n'a simplement rien à afficher
 * (jamais incluse par défaut, il n'y a rien qui la "débloque" implicitement). */
function planHasFeature(plan: Plan, row: FeatureRow): boolean {
  const entry = (plan.features ?? []).find((f) =>
    row.key ? f.key === row.key : (!f.key && f.label === row.label)
  )
  if (!entry) return row.key !== null
  return !!entry.included
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

  if (!isLoading && plans.length === 0) return null

  // Lignes "clé connue" : une par entrée du registre backend
  // (subscriptions.feature_registry.FEATURE_REGISTRY), catégorie réelle —
  // plus de tableau FEATURE_CATALOG inventé en dur côté frontend.
  const registryRows: FeatureRow[] = featureRegistry.map((f) => ({
    key: f.key, label: f.label, category: f.category,
  }))

  // Lignes "décoratives" : tous les labels libres distincts présents sur au
  // moins un plan (support 24/7, formation équipe, SLA...) — catégorie
  // 'support', seule catégorie purement décorative restante.
  const freeLabels = new Set<string>()
  for (const plan of plans) {
    for (const f of plan.features ?? []) {
      if (!f.key && f.label) freeLabels.add(f.label)
    }
  }
  const freeRows: FeatureRow[] = Array.from(freeLabels).map((label) => ({
    key: null, label, category: 'support',
  }))

  const allRows = [...registryRows, ...freeRows]

  // Limites numériques (max_employees/max_cash_registers) : nature
  // différente d'une coche binaire (un nombre, pas oui/non) — affichées à
  // part, dans leur propre section sous le tableau de coches.
  const hasNumericLimits = plans.some((p) => p.max_employees > 0 || p.max_cash_registers > 0)

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
                  const categoryRows = allRows.filter((row) => row.category === category.id)
                  if (categoryRows.length === 0) return null

                  return (
                    <React.Fragment key={category.id}>
                      <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                        <td colSpan={1 + plans.length} className="px-4 py-2 text-xs font-semibold" style={{ color: '#818cf8' }}>
                          <category.icon className="w-3 h-3 inline mr-1" />
                          {category.label}
                        </td>
                      </tr>
                      {categoryRows.map((row) => (
                        <tr key={row.key ?? row.label} className="border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                          <td className="px-4 py-2 text-xs" style={{ color: '#94a3b8' }}>{row.label}</td>
                          {plans.map((plan) => {
                            const hasFeature = planHasFeature(plan, row)
                            return (
                              <td key={`${plan.code}-${row.key ?? row.label}`} className="px-4 py-2 text-center">
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
                      {category.id === 'advanced' && hasNumericLimits && (
                        <>
                          <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                            <td className="px-4 py-2 text-xs" style={{ color: '#94a3b8' }}>Nombre d'employés</td>
                            {plans.map((plan) => (
                              <td key={`${plan.code}-max-employees`} className="px-4 py-2 text-center text-xs font-medium" style={{ color: '#e2e8f0' }}>
                                {plan.max_employees > 0 ? plan.max_employees : 'Illimité'}
                              </td>
                            ))}
                          </tr>
                          <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                            <td className="px-4 py-2 text-xs" style={{ color: '#94a3b8' }}>Nombre de caisses</td>
                            {plans.map((plan) => (
                              <td key={`${plan.code}-max-registers`} className="px-4 py-2 text-center text-xs font-medium" style={{ color: '#e2e8f0' }}>
                                {plan.max_cash_registers > 0 ? plan.max_cash_registers : 'Illimité'}
                              </td>
                            ))}
                          </tr>
                        </>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Légende */}
          <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: '#94a3b8' }}>
              <div className="flex items-center gap-1.5">
                <Check className="w-3 h-3" style={{ color: '#22c55e' }} />
                <span>Inclus</span>
              </div>
              <div className="flex items-center gap-1.5">
                <X className="w-3 h-3" style={{ color: '#475569' }} />
                <span>Non inclus</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
