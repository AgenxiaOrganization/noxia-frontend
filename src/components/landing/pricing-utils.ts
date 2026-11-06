// Logique des tarifs partagée entre le serveur (rendu initial) et le
// navigateur (repli si le serveur n'a pas pu joindre l'API).
import type { FeatureRegistryEntry, Plan, PlanFeature } from '@/lib/api/subscription'

/** 15000 -> « 15 000 » : identique côté serveur et navigateur (pas de toLocaleString). */
export function formatPrice(price: number): string {
  return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

/**
 * Liste COMPLÈTE des fonctionnalités d'un plan, modèle deny-list identique
 * au backend (PlanFeaturePermission) : une clé du registre absente de
 * plan.features reste INCLUSE par défaut.
 */
export function resolveDisplayFeatures(plan: Plan, registry: FeatureRegistryEntry[]): PlanFeature[] {
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

/** Données d'une carte de plan, sérialisables (passées au composant client). */
export type PlanCard = {
  code: string
  name: string
  description: string
  badgeLabel: string
  ctaLabel: string
  isFree: boolean
  isFeatured: boolean
  trialDays: number
  periodLabel: string
  monthlyPrice: number
  yearlyPrice: number | null
  yearlyDiscountPercent: number
  originalPrice: number | null
  hasActiveDiscount: boolean
  included: string[]
  excluded: string[]
}

export function toPlanCards(plans: Plan[], registry: FeatureRegistryEntry[]): PlanCard[] {
  return plans.map((plan) => {
    const features = resolveDisplayFeatures(plan, registry)
    return {
      code: plan.code,
      name: plan.name,
      description: plan.description,
      badgeLabel: plan.badge_label,
      ctaLabel: plan.cta_label,
      isFree: plan.is_free,
      isFeatured: plan.is_featured,
      trialDays: plan.trial_days,
      periodLabel: plan.period_label,
      monthlyPrice: parseFloat(plan.price),
      yearlyPrice: plan.yearly_price !== null ? parseFloat(plan.yearly_price) : null,
      yearlyDiscountPercent: plan.yearly_discount_percent,
      originalPrice: plan.original_price ? parseFloat(plan.original_price) : null,
      hasActiveDiscount: plan.has_active_discount,
      included: features.filter((f) => f.included).map((f) => f.label),
      excluded: features.filter((f) => !f.included).map((f) => f.label),
    }
  })
}

/** Tableau comparatif compact (calculé côté serveur) : seulement ce que le
 * navigateur affiche, pas les plans complets. */
export type ComparisonData = {
  planNames: string[]
  categories: { id: string; label: string; rows: { label: string; values: boolean[] }[] }[]
  limits: { label: string; values: string[] }[]
}

const COMPARISON_CATEGORIES = [
  { id: 'base', label: 'Fonctionnalités de base' },
  { id: 'advanced', label: 'Fonctionnalités avancées' },
  { id: 'support', label: 'Support & Assistance' },
]

/** Modèle deny-list IDENTIQUE au backend (PlanFeaturePermission) : une clé
 * connue absente de plan.features reste incluse ; une entrée décorative
 * absente n'est jamais incluse. */
function planHasFeature(plan: Plan, key: string | null, label: string): boolean {
  const entry = (plan.features ?? []).find((f) => (key ? f.key === key : !f.key && f.label === label))
  if (!entry) return key !== null
  return !!entry.included
}

export function toComparison(plans: Plan[], registry: FeatureRegistryEntry[]): ComparisonData {
  const freeLabels = new Set<string>()
  for (const plan of plans) for (const f of plan.features ?? []) if (!f.key && f.label) freeLabels.add(f.label)
  const allRows = [
    ...registry.map((f) => ({ key: f.key as string | null, label: f.label, category: f.category })),
    ...Array.from(freeLabels).map((label) => ({ key: null, label, category: 'support' })),
  ]
  const hasLimits = plans.some((p) => p.max_employees > 0 || p.max_cash_registers > 0)
  const unlimited = (n: number) => (n > 0 ? String(n) : 'Illimité')
  return {
    planNames: plans.map((p) => p.name),
    categories: COMPARISON_CATEGORIES.map((c) => ({
      id: c.id,
      label: c.label,
      rows: allRows.filter((r) => r.category === c.id).map((r) => ({
        label: r.label, values: plans.map((p) => planHasFeature(p, r.key, r.label)),
      })),
    })).filter((c) => c.rows.length > 0),
    limits: hasLimits
      ? [
          { label: "Nombre d'employés", values: plans.map((p) => unlimited(p.max_employees)) },
          { label: 'Nombre de caisses', values: plans.map((p) => unlimited(p.max_cash_registers)) },
        ]
      : [],
  }
}
