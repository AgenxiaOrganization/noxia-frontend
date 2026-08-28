'use client'

import { useEffect, useState } from 'react'
import { Check, X, Package, BarChart, Globe, Headphones, LayoutDashboard, Box, CreditCard, Bot, Bell, MessageCircle, Activity, MessageSquare, Users, ShieldCheck, FileBarChart, DollarSign, Truck, Key, UserCog, Zap, Award, Crown, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import React from 'react'
import { getPlans, getFeatureRegistry, type Plan, type FeatureRegistryEntry } from '@/lib/api/subscription'

const featureCategories = [
  { id: 'base', label: 'Fonctionnalités de base', icon: LayoutDashboard },
  { id: 'advanced', label: 'Fonctionnalités avancées', icon: BarChart },
  { id: 'integration', label: 'Intégrations & API', icon: Globe },
  { id: 'support', label: 'Support & Assistance', icon: Headphones },
]

/**
 * Catalogue complet des fonctionnalités avec leur catégorie et leur position dans la cascade
 * L'ordre détermine l'affichage dans le tableau
 */
const FEATURE_CATALOG: { label: string; category: string; order: number }[] = [
  // BASE (1-8)
  { label: 'Tableau de bord avancé', category: 'base', order: 1 },
  { label: 'Gestion des produits', category: 'base', order: 2 },
  { label: 'Gestion des stocks', category: 'base', order: 3 },
  { label: 'Caisse (POS)', category: 'base', order: 4 },
  { label: 'Assistant IA (bulle)', category: 'base', order: 5 },
  { label: 'Alertes automatiques', category: 'base', order: 6 },
  { label: 'Notifications en temps réel', category: 'base', order: 7 },
  { label: "Journal d'audit (Logs)", category: 'base', order: 8 },
  
  // AVANCÉES (9-18)
  { label: 'WhatsApp & Telegram', category: 'advanced', order: 9 },
  { label: 'Gestion des employés', category: 'advanced', order: 10 },
  { label: 'Messagerie intégrée', category: 'advanced', order: 11 },
  { label: 'Certification', category: 'advanced', order: 12 },
  { label: 'Multi-utilisateurs', category: 'advanced', order: 13 },
  { label: 'Multi-caisses', category: 'advanced', order: 14 },
  { label: 'Fournisseurs & commandes', category: 'advanced', order: 15 },
  { label: 'Rapports avancés', category: 'advanced', order: 16 },
  { label: 'Finances & comptabilité', category: 'advanced', order: 17 },
  { label: 'Export PDF/Excel', category: 'advanced', order: 18 },
  
  // INTÉGRATIONS (19-22)
  { label: 'Multi-établissements', category: 'integration', order: 19 },
  { label: 'API publique', category: 'integration', order: 20 },
  { label: 'Intégrations sur mesure', category: 'integration', order: 21 },
  
  // SUPPORT (22-25)
  { label: 'Support prioritaire 24/7', category: 'support', order: 22 },
  { label: 'Formation équipe', category: 'support', order: 23 },
  { label: 'Déploiement personnalisé', category: 'support', order: 24 },
  { label: 'SLA garanti', category: 'support', order: 25 },
]

const featureCategoryOf = (label: string): string => {
  const found = FEATURE_CATALOG.find(f => f.label === label)
  return found?.category || 'base'
}

const featureOrderOf = (label: string): number => {
  const found = FEATURE_CATALOG.find(f => f.label === label)
  return found?.order || 999
}

/**
 * Détermine quelles fonctionnalités sont incluses en fonction du nom du plan
 * (plutôt que du code, plus flexible)
 */
const getPlanFeaturesByIndex = (planName: string, planIndex: number): string[] => {
  // Essai / Trial / Gratuit : toutes sauf support 24/7
  if (planName.toLowerCase().includes('essai') || 
      planName.toLowerCase().includes('trial') || 
      planName.toLowerCase().includes('gratuit') ||
      planIndex === 0) {
    return FEATURE_CATALOG.filter(f => f.label !== 'Support prioritaire 24/7').map(f => f.label)
  }
  
  // Starter : 8 premières (base)
  if (planName.toLowerCase().includes('starter') || planIndex === 1) {
    return FEATURE_CATALOG.filter(f => f.order <= 8).map(f => f.label)
  }
  
  // Premium : 18 premières (base + avancées)
  if (planName.toLowerCase().includes('premium') || planIndex === 2) {
    return FEATURE_CATALOG.filter(f => f.order <= 18).map(f => f.label)
  }
  
  // Business / Pro : toutes
  if (planName.toLowerCase().includes('business') || 
      planName.toLowerCase().includes('pro') ||
      planIndex === 3) {
    return FEATURE_CATALOG.map(f => f.label)
  }
  
  // Fallback : par défaut, Starter
  return FEATURE_CATALOG.filter(f => f.order <= 8).map(f => f.label)
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

  const allFeatureLabels = FEATURE_CATALOG.map(f => f.label)
  const registryLabels = featureRegistry.map((f) => f.label)

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
                  const categoryFeatures = allFeatureLabels
                    .filter((label) => featureCategoryOf(label) === category.id)
                    .sort((a, b) => featureOrderOf(a) - featureOrderOf(b))

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
                        return (
                          <tr key={label} className="border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                            <td className="px-4 py-2 text-xs" style={{ color: '#94a3b8' }}>{label}</td>
                            {plans.map((plan, index) => {
                              // ✅ Utiliser le nom du plan et sa position pour déterminer les fonctionnalités
                              const planFeatures = getPlanFeaturesByIndex(plan.name, index)
                              const hasFeature = planFeatures.includes(label)
                              
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
              <div className="flex items-center gap-1.5 ml-4">
                <span className="w-3 h-0.5" style={{ background: '#6366f1' }} />
                <span>Frontière Starter / Premium</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5" style={{ background: '#8b5cf6' }} />
                <span>Frontière Premium / Business</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}