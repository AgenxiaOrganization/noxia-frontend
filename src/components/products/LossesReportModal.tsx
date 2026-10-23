'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronRight, X } from 'lucide-react'
import { getLossesReport, type LossesReport } from '@/lib/api/inventory'
import { isFeatureNotIncludedError } from '@/components/ui/FeatureLockedScreen'

const fieldStyle = { background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }

const isoDay = (d: Date) => {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

const fmtQty = (value: string | number) => {
  const n = Number(value)
  return Number.isInteger(n) ? String(n) : n.toFixed(2)
}

/** Rapport des pertes (casse, péremption…) sur une période, regroupé par produit. */
export default function LossesReportModal({ onClose }: { onClose: () => void }) {
  const [dateFrom, setDateFrom] = useState(() => isoDay(new Date(new Date().setDate(1))))
  const [dateTo, setDateTo] = useState(() => isoDay(new Date()))
  const [report, setReport] = useState<LossesReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [locked, setLocked] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getLossesReport(dateFrom || undefined, dateTo || undefined)
      .then(data => { if (!cancelled) setReport(data) })
      .catch(err => {
        if (cancelled) return
        if (isFeatureNotIncludedError(err)) setLocked(true)
        else setError(err instanceof Error ? err.message : 'Impossible de charger le rapport.')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [dateFrom, dateTo])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ background: '#1e293b', border: '1px solid #334155' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" /> Rapport des pertes
            </h2>
            <p className="text-xs text-slate-400">Casses, péremptions et autres pertes déclarées, par produit</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {locked ? (
          <div className="p-6 text-sm text-slate-300">
            Le rapport des pertes n&apos;est pas inclus dans votre abonnement. Vous pouvez toujours déclarer une perte
            depuis « Ajuster le stock » ; passez à un plan supérieur pour consulter ce rapport.
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-slate-700 grid grid-cols-2 gap-2">
              <label className="text-xs text-slate-400">
                Du
                <input type="date" value={dateFrom} max={dateTo || undefined} onChange={e => setDateFrom(e.target.value)}
                  className="mt-1 w-full rounded-lg px-3 py-2 text-sm text-white outline-none" style={fieldStyle} />
              </label>
              <label className="text-xs text-slate-400">
                Au
                <input type="date" value={dateTo} min={dateFrom || undefined} onChange={e => setDateTo(e.target.value)}
                  className="mt-1 w-full rounded-lg px-3 py-2 text-sm text-white outline-none" style={fieldStyle} />
              </label>
            </div>

            <div className="p-4 overflow-y-auto space-y-3">
              {loading && <p className="text-sm text-slate-400">Chargement…</p>}
              {error && <p className="text-sm text-red-400">{error}</p>}
              {!loading && !error && report && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-xl border border-slate-700 bg-slate-800/50">
                      <p className="text-xs text-slate-400">Unités perdues</p>
                      <p className="text-xl font-bold text-orange-400">{fmtQty(report.quantite_totale)}</p>
                    </div>
                    <div className="p-3 rounded-xl border border-slate-700 bg-slate-800/50">
                      <p className="text-xs text-slate-400">Déclarations</p>
                      <p className="text-xl font-bold text-white">{report.nombre_de_pertes}</p>
                    </div>
                  </div>

                  {report.produits.length === 0 ? (
                    <p className="text-sm text-slate-400">Aucune perte déclarée sur cette période.</p>
                  ) : report.produits.map(row => (
                    <div key={row.product} className="rounded-xl border border-slate-700">
                      <button
                        onClick={() => setOpen(open === row.product ? null : row.product)}
                        className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-800/60 rounded-xl"
                      >
                        <span className="flex items-center gap-2 text-sm text-white font-medium">
                          {open === row.product ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          {row.product_name}
                        </span>
                        <span className="text-sm font-bold text-orange-400">
                          {fmtQty(row.total_quantity)} unité{Number(row.total_quantity) > 1 ? 's' : ''}
                        </span>
                      </button>
                      {open === row.product && (
                        <div className="border-t border-slate-700 divide-y divide-slate-800">
                          {row.movements.map(m => (
                            <div key={m.id} className="px-3 py-2 flex items-center justify-between gap-2 text-xs">
                              <div className="min-w-0">
                                <p className="text-slate-200 truncate">{m.reason}</p>
                                <p className="text-slate-500">
                                  {new Date(m.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })} • {m.created_by_name}
                                </p>
                              </div>
                              <span className="text-orange-300 shrink-0">-{fmtQty(m.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
