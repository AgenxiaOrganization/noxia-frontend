'use client'

import { Fragment, useState } from 'react'
import { Check, ChevronDown, X } from 'lucide-react'
import type { ComparisonData } from './pricing-utils'

/** Tableau comparatif replié (<details>) : reçoit des données compactes
 * calculées côté serveur (toComparison) et n'est construit qu'à l'ouverture,
 * pour ne pas alourdir le premier affichage (des centaines de cellules). */
export function FeatureComparison({ data }: { data: ComparisonData }) {
  const [open, setOpen] = useState(false)
  if (data.planNames.length === 0) return null

  return (
    <details className="nx-faq nx-card-soft mt-12 overflow-hidden" onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary className="flex items-center justify-between gap-4 px-6 py-5 text-white font-semibold">
        Comparer toutes les fonctionnalités des plans
        <ChevronDown className="nx-faq-icon w-5 h-5 text-slate-400" aria-hidden="true" />
      </summary>
      {open && (
        <div className="nx-faq-body overflow-x-auto border-t border-white/[0.06]">
          <table className="w-full text-sm" aria-label="Comparaison des fonctionnalités par plan d'abonnement">
            <thead>
              <tr className="border-b border-white/10">
                <th scope="col" className="px-4 py-3 text-left text-xs text-slate-400">Fonctionnalité</th>
                {data.planNames.map((name) => (
                  <th key={name} scope="col" className="px-4 py-3 text-center text-xs font-semibold text-slate-100">{name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.categories.map((category) => (
                <Fragment key={category.id}>
                  <tr className="border-b border-white/[0.05]">
                    <th scope="colgroup" colSpan={1 + data.planNames.length} className="px-4 py-2 text-left text-xs font-semibold text-indigo-300">
                      {category.label}
                    </th>
                  </tr>
                  {category.rows.map((row) => (
                    <tr key={row.label} className="border-b border-white/[0.05]">
                      <th scope="row" className="px-4 py-2 text-left text-xs font-normal text-slate-400">{row.label}</th>
                      {row.values.map((included, i) => (
                        <td key={data.planNames[i]} className="px-4 py-2 text-center">
                          {included
                            ? <Check className="w-4 h-4 mx-auto text-emerald-400" aria-label="Inclus" />
                            : <X className="w-4 h-4 mx-auto text-slate-600" aria-label="Non inclus" />}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {category.id === 'advanced' && data.limits.map((limit) => (
                    <tr key={limit.label} className="border-b border-white/[0.05]">
                      <th scope="row" className="px-4 py-2 text-left text-xs font-normal text-slate-400">{limit.label}</th>
                      {limit.values.map((value, i) => (
                        <td key={data.planNames[i]} className="px-4 py-2 text-center text-xs font-medium text-slate-200">{value}</td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </details>
  )
}
