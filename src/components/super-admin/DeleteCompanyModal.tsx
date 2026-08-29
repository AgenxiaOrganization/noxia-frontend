'use client'

import { useState } from 'react'
import { Loader2, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { deleteCompanyPermanently } from '@/lib/superAdminClient'

/**
 * Modal de suppression DÉFINITIVE d'un établissement. Le bouton ne s'active
 * que lorsque le texte saisi correspond au nom de l'établissement
 * (insensible à la casse) — confirmation volontairement stricte pour une
 * action irréversible. Déclenche le téléchargement automatique de l'export
 * Excel renvoyé par le backend (voir delete_company_completely).
 */
export default function DeleteCompanyModal({
  instanceCode, companyId, companyName, onClose, onDeleted,
}: {
  instanceCode: string
  companyId: number
  companyName: string
  onClose: () => void
  onDeleted: () => void
}) {
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const isConfirmed = confirmText.trim().toLowerCase() === companyName.trim().toLowerCase()

  const handleDelete = async () => {
    if (!isConfirmed) return
    setIsDeleting(true)
    try {
      await deleteCompanyPermanently(instanceCode, companyId, companyName)
      toast.success(`"${companyName}" a été supprimé définitivement. L'export a été téléchargé.`)
      onDeleted()
      onClose()
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la suppression.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-6"
        style={{ background: '#1e293b', border: '1px solid #ef4444' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
              <Trash2 className="w-5 h-5" style={{ color: '#ef4444' }} />
            </div>
            <h2 className="text-lg font-bold text-white">Supprimer définitivement</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10" style={{ color: '#94a3b8' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 rounded-lg mb-4 text-sm" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5' }}>
          Cette action est <strong>irréversible</strong>. Toutes les données de « {companyName} » (employés, ventes,
          stock, documents, fichiers) seront supprimées définitivement, y compris sur le stockage Cloudflare R2.
          Un export Excel complet sera automatiquement téléchargé avant la suppression, à titre de sauvegarde unique.
        </div>

        <label className="block text-xs font-medium mb-1.5" style={{ color: '#cbd5e1' }}>
          Tapez « <span className="font-semibold text-white">{companyName}</span> » pour confirmer
        </label>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={companyName}
          className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none mb-6"
          style={{ background: 'rgba(51, 65, 85, 0.5)', border: `1px solid ${isConfirmed ? '#22c55e' : '#334155'}` }}
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
            style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8' }}
          >
            Annuler
          </button>
          <button
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: '#ef4444', color: '#fff' }}
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Supprimer définitivement
          </button>
        </div>
      </div>
    </div>
  )
}
