'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Check, Layers, Pencil, Plus, Trash2, X } from 'lucide-react'
import {
  createProductFormula, deleteProductFormula, getProductFormulas, updateProductFormula,
  type ProductFormula,
} from '@/lib/api/catalog'
import { invalidateApiCache } from '@/lib/api'
import { isFeatureNotIncludedError } from '@/components/ui/FeatureLockedScreen'

const fieldStyle = { background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }

interface ProductFormulaModalProps {
  product: { id: number; name: string; pricePerUnit: number }
  onClose: () => void
}

interface Draft {
  name: string
  units_sold: string
  price: string
}

const emptyDraft: Draft = { name: '', units_sold: '', price: '' }

function errorText(err: unknown): string {
  return err instanceof Error && err.message ? err.message : 'Une erreur est survenue.'
}

/** Formules de vente d'un produit : un nombre d'unités vendu à prix fixe (ex. « Pack 3 » = 3 Régab à 2700 F).
 *  Le stock baisse toujours du nombre réel d'unités. */
export default function ProductFormulaModal({ product, onClose }: ProductFormulaModalProps) {
  const [formulas, setFormulas] = useState<ProductFormula[]>([])
  const [loading, setLoading] = useState(true)
  const [locked, setLocked] = useState(false)
  const [busy, setBusy] = useState(false)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editDraft, setEditDraft] = useState<Draft>(emptyDraft)

  const load = async () => {
    try {
      invalidateApiCache(`/catalog/products/${product.id}/formulas`)
      setFormulas(await getProductFormulas(product.id))
    } catch (err) {
      if (isFeatureNotIncludedError(err)) setLocked(true)
      else toast.error(errorText(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id])

  const run = async (action: () => Promise<unknown>, success: string) => {
    setBusy(true)
    try {
      await action()
      toast.success(success)
      invalidateApiCache('/catalog')
      await load()
      return true
    } catch (err) {
      toast.error(errorText(err))
      return false
    } finally {
      setBusy(false)
    }
  }

  const isValid = (d: Draft) => d.name.trim() && Number(d.units_sold) >= 1 && Number(d.price) > 0

  const add = async () => {
    if (!isValid(draft)) return
    const ok = await run(
      () => createProductFormula(product.id, {
        name: draft.name.trim(), units_sold: Number(draft.units_sold), price: draft.price, is_active: true,
      }),
      `Formule « ${draft.name.trim()} » ajoutée`,
    )
    if (ok) setDraft(emptyDraft)
  }

  const startEdit = (f: ProductFormula) => {
    setEditingId(f.id)
    setEditDraft({ name: f.name, units_sold: String(f.units_sold), price: String(parseFloat(f.price)) })
  }

  const saveEdit = async (f: ProductFormula) => {
    if (!isValid(editDraft)) return
    const ok = await run(
      () => updateProductFormula(product.id, f.id, {
        name: editDraft.name.trim(), units_sold: Number(editDraft.units_sold), price: editDraft.price, is_active: f.is_active,
      }),
      'Formule mise à jour',
    )
    if (ok) setEditingId(null)
  }

  const toggleActive = (f: ProductFormula) => run(
    () => updateProductFormula(product.id, f.id, { name: f.name, units_sold: f.units_sold, price: f.price, is_active: !f.is_active }),
    f.is_active ? 'Formule désactivée' : 'Formule activée',
  )

  const remove = async (f: ProductFormula) => {
    if (!window.confirm(`Supprimer la formule « ${f.name} » ? Les ventes passées gardent son nom sur le ticket.`)) return
    await run(() => deleteProductFormula(product.id, f.id), `Formule « ${f.name} » supprimée`)
  }

  const savingHint = (d: Draft) => {
    const units = Number(d.units_sold)
    const price = Number(d.price)
    if (!units || !price) return null
    const normal = units * product.pricePerUnit
    const diff = normal - price
    return diff > 0
      ? `Au lieu de ${normal.toLocaleString()} F à l'unité — remise de ${diff.toLocaleString()} F`
      : `Prix à l'unité : ${normal.toLocaleString()} F`
  }

  const fields = (d: Draft, set: (d: Draft) => void, autoFocus = false) => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      <input
        value={d.name}
        onChange={e => set({ ...d, name: e.target.value })}
        placeholder="Nom (ex. Pack 3)"
        className="rounded-lg px-3 py-2 text-sm text-white outline-none"
        style={fieldStyle}
        autoFocus={autoFocus}
      />
      <input
        type="number" min="1" step="1"
        value={d.units_sold}
        onChange={e => set({ ...d, units_sold: e.target.value })}
        placeholder="Nb d'unités (ex. 3)"
        className="rounded-lg px-3 py-2 text-sm text-white outline-none"
        style={fieldStyle}
      />
      <input
        type="number" min="0" step="50"
        value={d.price}
        onChange={e => set({ ...d, price: e.target.value })}
        placeholder="Prix total (F)"
        className="rounded-lg px-3 py-2 text-sm text-white outline-none"
        style={fieldStyle}
      />
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        style={{ background: '#1e293b', border: '1px solid #334155' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-white truncate">Formules — {product.name}</h2>
            <p className="text-xs text-slate-400">Vendez plusieurs unités à prix fixe. Le stock baisse du nombre réel d&apos;unités.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {locked ? (
          <div className="p-6 text-sm text-slate-300">
            Les formules de vente ne sont pas incluses dans votre abonnement. Passez à un plan supérieur pour les activer.
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-slate-700 space-y-2">
              {fields(draft, setDraft)}
              {savingHint(draft) && <p className="text-xs text-emerald-400">{savingHint(draft)}</p>}
              <button
                onClick={add}
                disabled={busy || !isValid(draft)}
                className="w-full px-4 py-2 rounded-lg text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: '#4f46e5' }}
              >
                <Plus className="w-4 h-4" /> Ajouter la formule
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-1">
              {loading && <p className="text-sm text-slate-400">Chargement…</p>}
              {!loading && formulas.length === 0 && (
                <p className="text-sm text-slate-400 flex items-center gap-2"><Layers className="w-4 h-4" /> Aucune formule pour ce produit.</p>
              )}
              {formulas.map(f => editingId === f.id ? (
                <div key={f.id} className="p-2 rounded-lg bg-slate-800 space-y-2">
                  {fields(editDraft, setEditDraft, true)}
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => saveEdit(f)} disabled={busy || !isValid(editDraft)} className="p-2 rounded-md bg-indigo-600 text-white hover:brightness-110 disabled:opacity-50" title="Enregistrer">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-2 rounded-md text-slate-400 hover:bg-slate-700" title="Annuler">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div key={f.id} className={`flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-slate-800/60 ${f.is_active ? '' : 'opacity-50'}`}>
                  <div className="min-w-0">
                    <p className="text-sm text-white font-semibold truncate">{f.name}</p>
                    <p className="text-xs text-slate-400">
                      {f.units_sold} unité{f.units_sold > 1 ? 's' : ''} pour {parseFloat(f.price).toLocaleString()} F
                      {!f.is_active && ' • désactivée'}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0 items-center">
                    <button
                      onClick={() => toggleActive(f)} disabled={busy}
                      className="px-2 py-1 rounded-md text-[11px] text-slate-300 hover:bg-slate-700"
                      title={f.is_active ? 'Ne plus proposer en caisse' : 'Proposer à nouveau en caisse'}
                    >
                      {f.is_active ? 'Désactiver' : 'Activer'}
                    </button>
                    <button onClick={() => startEdit(f)} className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-700" title="Modifier">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => remove(f)} disabled={busy} className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-700" title="Supprimer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
