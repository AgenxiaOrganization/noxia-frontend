'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Gift, Star } from 'lucide-react'
import { formatPrice, toPlanCards, type PlanCard } from './pricing-utils'

type BillingPeriod = 'monthly' | 'yearly'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api/v1'

/**
 * Cartes des plans : rendues dans le HTML par le serveur (initialCards) ;
 * le navigateur ne gère que la bascule mensuel/annuel et le dépliage. Si le
 * serveur n'a pas pu joindre l'API, les plans sont chargés ici en repli.
 */
export function PricingCards({ initialCards }: { initialCards: PlanCard[] }) {
  const [cards, setCards] = useState(initialCards)
  const [loadFailed, setLoadFailed] = useState(false)
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (initialCards.length > 0) return
    let cancelled = false
    Promise.all([
      fetch(`${API_URL}/subscriptions/plans/`).then((r) => (r.ok ? r.json() : Promise.reject())),
      fetch(`${API_URL}/subscriptions/features/public/`).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([plans, registry]) => {
        if (cancelled) return
        const sorted = [...plans].sort((a, b) => a.display_order - b.display_order)
        setCards(toPlanCards(sorted, registry))
      })
      .catch(() => { if (!cancelled) setLoadFailed(true) })
    return () => { cancelled = true }
  }, [initialCards])

  const hasYearly = cards.some((c) => c.yearlyPrice !== null)

  if (cards.length === 0) {
    return (
      <p className="text-center text-slate-400 py-10" aria-live="polite">
        {loadFailed ? 'Les tarifs sont momentanément indisponibles. Réessayez dans un instant.' : 'Chargement des tarifs…'}
      </p>
    )
  }

  return (
    <>
      {hasYearly && (
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-1 rounded-xl p-1 bg-white/[0.05] border border-white/10" role="group" aria-label="Période de facturation">
            {(['monthly', 'yearly'] as const).map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setBillingPeriod(period)}
                aria-pressed={billingPeriod === period}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  billingPeriod === period ? 'bg-[#4f46e5] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {period === 'monthly' ? 'Mensuel' : 'Annuel'}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {cards.map((card) => {
          const useYearly = billingPeriod === 'yearly' && card.yearlyPrice !== null
          const price = useYearly ? (card.yearlyPrice as number) : card.monthlyPrice
          const isOpen = expanded.has(card.code)
          const shownIncluded = isOpen ? card.included : card.included.slice(0, 6)
          const shownExcluded = isOpen ? card.excluded : card.excluded.slice(0, 2)
          const hidden = card.included.length + card.excluded.length - shownIncluded.length - shownExcluded.length

          return (
            <article
              key={card.code}
              data-glow
              className={`nx-lift relative flex flex-col rounded-[1.25rem] p-6 ${card.isFeatured ? 'nx-card lg:-translate-y-3' : 'nx-card-soft'}`}
              style={card.isFeatured ? { boxShadow: '0 30px 70px -30px rgba(99, 102, 241, 0.7)' } : undefined}
              aria-label={`Plan ${card.name}`}
            >
              <span className="nx-hover-glow" aria-hidden="true" />
              {card.badgeLabel && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3.5 py-1 text-xs font-bold text-white"
                  style={{ background: card.isFree ? '#15803d' : '#4f46e5' }}
                >
                  {card.isFree ? <Gift className="w-3 h-3" aria-hidden="true" /> : <Star className="w-3 h-3" aria-hidden="true" />}
                  {card.badgeLabel}
                </span>
              )}
              <h3 className="relative mt-2 text-xl font-bold text-white">{card.name}</h3>
              {card.description && <p className="relative mt-1 text-sm text-slate-400">{card.description}</p>}

              <div className="relative my-5">
                {card.hasActiveDiscount && !useYearly && card.originalPrice !== null && (
                  <p className="text-sm line-through text-slate-500">{formatPrice(card.originalPrice)} FCFA</p>
                )}
                <p>
                  <span className={`text-3xl font-bold ${card.isFree ? 'text-emerald-400' : 'text-white'}`}>
                    {price === 0 ? 'Gratuit' : `${formatPrice(price)} FCFA`}
                  </span>
                  {price > 0 && <span className="text-sm text-slate-400"> /{useYearly ? 'an' : card.periodLabel}</span>}
                </p>
                {useYearly && card.yearlyDiscountPercent > 0 && (
                  <p className="mt-1 text-xs font-semibold text-indigo-300">Économisez {card.yearlyDiscountPercent} % par rapport au mensuel</p>
                )}
                {billingPeriod === 'yearly' && !card.isFree && card.yearlyPrice === null && (
                  <p className="mt-1 text-xs text-slate-500">Pas d&apos;offre annuelle : facturé au mois</p>
                )}
                {card.isFree && card.trialDays > 0 && (
                  <p className="mt-1 text-xs text-emerald-400">{card.trialDays} jours d&apos;essai complet</p>
                )}
              </div>

              <ul id={`plan-features-${card.code}`} className="relative space-y-2 text-sm">
                {/* Coches en CSS (nx-li-yes / nx-li-no) : une icône SVG par ligne pesait des centaines de nœuds. */}
                {shownIncluded.map((label) => (
                  <li key={label} className="nx-li-yes text-slate-300">{label}</li>
                ))}
                {shownExcluded.map((label) => (
                  <li key={label} className="nx-li-no text-slate-500"><span className="sr-only">Non inclus : </span>{label}</li>
                ))}
              </ul>

              {hidden > 0 || isOpen ? (
                <button
                  type="button"
                  onClick={() => setExpanded((prev) => {
                    const next = new Set(prev)
                    if (next.has(card.code)) next.delete(card.code)
                    else next.add(card.code)
                    return next
                  })}
                  className="relative mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-300 hover:text-indigo-200"
                  aria-expanded={isOpen}
                  aria-controls={`plan-features-${card.code}`}
                >
                  {isOpen ? <>Voir moins <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" /></> : <>Voir {hidden} de plus <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" /></>}
                </button>
              ) : null}

              <div className="relative mt-auto pt-6">
                <a
                  href="/register"
                  className={`w-full ${card.isFeatured || card.isFree ? 'nx-btn-primary' : 'nx-btn-secondary'}`}
                  style={card.isFree && !card.isFeatured ? { background: '#15803d' } : undefined}
                  aria-label={`${card.ctaLabel} pour le plan ${card.name}`}
                >
                  {card.ctaLabel}
                </a>
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}
