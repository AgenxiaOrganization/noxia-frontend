import type { FeatureRegistryEntry, Plan } from '@/lib/api/subscription'
import { FeatureComparison } from './FeatureComparison'
import { PricingCards } from './PricingCards'
import { toComparison, toPlanCards } from './pricing-utils'

/**
 * Tarifs lus côté serveur (table Plan du backend, via l'API publique) : les
 * prix sont dans le HTML. Aucun prix, remise ni durée d'essai n'est écrit
 * ici ; tout vient de l'API.
 */
export function Pricing({ plans, registry }: { plans: Plan[] | null; registry: FeatureRegistryEntry[] }) {
  const cards = plans ? toPlanCards(plans, registry) : []
  return (
    <section id="pricing" className="nx-section nx-cv" aria-labelledby="pricing-title">
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{ background: 'radial-gradient(ellipse 70% 45% at 50% 0%, rgba(99, 102, 241, 0.14), transparent 70%)' }}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10" data-reveal>
          <p className="nx-eyebrow">Tarifs</p>
          <h2 id="pricing-title" className="mt-4 text-3xl sm:text-4xl font-bold text-white">Un plan pour chaque établissement</h2>
          <p className="mt-4 text-lg text-slate-400">Prix en FCFA. Changez de plan à tout moment depuis votre espace.</p>
        </div>
        <PricingCards initialCards={cards} />
        {plans && <FeatureComparison data={toComparison(plans, registry)} />}
      </div>
    </section>
  )
}
