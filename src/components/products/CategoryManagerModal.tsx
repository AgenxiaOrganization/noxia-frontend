'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Check, CornerDownRight, FolderTree, Pencil, Plus, Trash2, X } from 'lucide-react'
import { createCategory, deleteCategory, updateCategory, type Category } from '@/lib/api/catalog'

type Kind = Category['type']

const TYPE_LABELS: Record<Kind, string> = { boisson: 'Boisson', nourriture: 'Nourriture', service: 'Service' }

const fieldStyle = { background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }

interface CategoryManagerModalProps {
  categories: Category[]
  onChanged: () => void | Promise<void>
  onClose: () => void
}

function errorText(err: unknown): string {
  return err instanceof Error && err.message ? err.message : 'Une erreur est survenue.'
}

/** Catégories et sous-catégories de l'établissement. Une sous-catégorie est rattachée, si on le
 *  souhaite, à une catégorie principale dont elle prend le type ; un seul niveau. */
export default function CategoryManagerModal({ categories, onChanged, onClose }: CategoryManagerModalProps) {
  const mains = categories.filter(c => !c.parent)
  const subsOf = (id: number) => categories.filter(c => c.parent === id)

  const [name, setName] = useState('')
  const [type, setType] = useState<Kind>('boisson')
  const [parent, setParent] = useState<number | ''>('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editParent, setEditParent] = useState<number | ''>('')
  const [busy, setBusy] = useState(false)

  const run = async (action: () => Promise<unknown>, success: string) => {
    setBusy(true)
    try {
      await action()
      toast.success(success)
      await onChanged()
      return true
    } catch (err) {
      toast.error(errorText(err))
      return false
    } finally {
      setBusy(false)
    }
  }

  const add = async () => {
    const trimmed = name.trim()
    if (!trimmed) return
    const parentCategory = mains.find(c => c.id === parent)
    const ok = await run(
      () => createCategory({ name: trimmed, type: parentCategory?.type ?? type, parent: parentCategory?.id ?? null }),
      parentCategory ? `Sous-catégorie « ${trimmed} » ajoutée à ${parentCategory.name}` : `Catégorie « ${trimmed} » ajoutée`,
    )
    if (ok) {
      setName('')
      setParent('')
    }
  }

  const startEdit = (category: Category) => {
    setEditingId(category.id)
    setEditName(category.name)
    setEditParent(category.parent ?? '')
  }

  const saveEdit = async (category: Category) => {
    const trimmed = editName.trim()
    if (!trimmed) return
    const parentCategory = mains.find(c => c.id === editParent)
    const ok = await run(
      () => updateCategory(category.id, {
        name: trimmed, type: parentCategory?.type ?? category.type, parent: parentCategory?.id ?? null,
      }),
      'Catégorie mise à jour',
    )
    if (ok) setEditingId(null)
  }

  const remove = async (category: Category) => {
    const subs = subsOf(category.id)
    const warning = subs.length > 0
      ? `Ses sous-catégories (${subs.map(s => s.name).join(', ')}) deviendront des catégories principales. `
      : ''
    if (!window.confirm(`Supprimer « ${category.name} » ? ${warning}Ses produits seront conservés, sans catégorie.`)) return
    await run(() => deleteCategory(category.id), `Catégorie « ${category.name} » supprimée`)
  }

  const row = (category: Category, isSub: boolean) => {
    const hasSubs = subsOf(category.id).length > 0
    if (editingId === category.id) {
      return (
        <div key={category.id} className={`flex flex-col sm:flex-row gap-2 p-2 rounded-lg bg-slate-800 ${isSub ? 'ml-6' : ''}`}>
          <input
            value={editName}
            onChange={e => setEditName(e.target.value)}
            className="flex-1 rounded-md px-3 py-1.5 text-sm text-white outline-none"
            style={fieldStyle}
            autoFocus
          />
          <select
            value={editParent}
            onChange={e => setEditParent(e.target.value ? Number(e.target.value) : '')}
            disabled={hasSubs}
            title={hasSubs ? 'Cette catégorie a des sous-catégories : elle reste une catégorie principale.' : undefined}
            className="rounded-md px-3 py-1.5 text-sm text-white outline-none disabled:opacity-50"
            style={fieldStyle}
          >
            <option value="">Catégorie principale</option>
            {mains.filter(m => m.id !== category.id).map(m => (
              <option key={m.id} value={m.id}>Sous-catégorie de {m.name}</option>
            ))}
          </select>
          <div className="flex gap-1 justify-end">
            <button onClick={() => saveEdit(category)} disabled={busy} className="p-2 rounded-md bg-indigo-600 text-white hover:brightness-110" title="Enregistrer">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={() => setEditingId(null)} className="p-2 rounded-md text-slate-400 hover:bg-slate-700" title="Annuler">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )
    }
    return (
      <div key={category.id} className={`flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-slate-800/60 ${isSub ? 'ml-6' : ''}`}>
        <div className="flex items-center gap-2 min-w-0">
          {isSub && <CornerDownRight className="w-4 h-4 shrink-0 text-slate-500" />}
          <span className={`truncate text-sm ${isSub ? 'text-slate-200' : 'text-white font-semibold'}`}>{category.name}</span>
          {!isSub && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 shrink-0">{TYPE_LABELS[category.type]}</span>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={() => startEdit(category)} className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-700" title="Modifier">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => remove(category)} disabled={busy} className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-700" title="Supprimer">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]" style={{ background: '#1e293b', border: '1px solid #334155' }}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div>
            <h2 className="text-lg font-bold text-white">Catégories</h2>
            <p className="text-xs text-slate-400">Ajoutez des catégories et, si vous le souhaitez, des sous-catégories</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-700 space-y-2">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') add() }}
            placeholder="Nom (ex. Bières, Cocktails, Desserts)"
            className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
            style={fieldStyle}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select
              value={parent}
              onChange={e => setParent(e.target.value ? Number(e.target.value) : '')}
              className="rounded-lg px-3 py-2 text-sm text-white outline-none"
              style={fieldStyle}
            >
              <option value="">Catégorie principale</option>
              {mains.map(m => <option key={m.id} value={m.id}>Sous-catégorie de {m.name}</option>)}
            </select>
            <select
              value={parent ? (mains.find(m => m.id === parent)?.type ?? type) : type}
              onChange={e => setType(e.target.value as Kind)}
              disabled={parent !== ''}
              title={parent !== '' ? 'Une sous-catégorie prend le type de sa catégorie principale.' : undefined}
              className="rounded-lg px-3 py-2 text-sm text-white outline-none disabled:opacity-50"
              style={fieldStyle}
            >
              {(Object.keys(TYPE_LABELS) as Kind[]).map(k => <option key={k} value={k}>{TYPE_LABELS[k]}</option>)}
            </select>
          </div>
          <button
            onClick={add}
            disabled={busy || !name.trim()}
            className="w-full px-4 py-2 rounded-lg text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: '#4f46e5' }}
          >
            <Plus className="w-4 h-4" /> Ajouter
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-1">
          {mains.length === 0 && (
            <p className="text-sm text-slate-400 flex items-center gap-2"><FolderTree className="w-4 h-4" /> Aucune catégorie pour le moment.</p>
          )}
          {mains.map(main => (
            <div key={main.id} className="space-y-1">
              {row(main, false)}
              {subsOf(main.id).map(sub => row(sub, true))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
