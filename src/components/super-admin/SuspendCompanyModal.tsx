'use client'

import { useState } from 'react'
import { AlertTriangle, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { suspendCompany, type ProxyCompanyDetail, type SuspensionModule } from '@/lib/superAdminClient'

const MODULE_OPTIONS: { value: SuspensionModule; label: string; hint: string }[] = [
  { value: 'documents', label: 'Documents', hint: 'Dépôt et consultation des documents de certification' },
  { value: 'parametres', label: 'Paramètres', hint: "Profil de l'établissement et informations générales" },
  { value: 'abonnement', label: 'Abonnement', hint: 'Consultation et paiement de son abonnement' },
]

/**
 * Modal de suspension d'un établissement (super-admin). Le motif est
 * obligatoire (affiché tel quel au gérant, voir CompanySuspendedBanner côté
 * client) ; les modules cochés restent utilisables pendant la suspension
 * (voir companies.permissions._check_company_suspended côté noxia-backend).
 */
export default function SuspendCompanyModal({
  instanceCode, company, onClose, onSuspended,
}: {
  instanceCode: string
  company: ProxyCompanyDetail
  onClose: () => void
  onSuspended: (updated: { is_suspended: boolean; suspended_reason: string; suspension_allowed_modules: string[] }) => void
}) {
  const [reason, setReason] = useState('')
  const [allowedModules, setAllowedModules] = useState<SuspensionModule[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toggleModule = (module: SuspensionModule) => {
    setAllowedModules((prev) => prev.includes(module) ? prev.filter((m) => m !== module) : [...prev, module])
  }

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('Le motif de suspension est obligatoire.')
      return
    }
    setIsSubmitting(true)
    try {
      const updated = await suspendCompany(instanceCode, company.id, { reason: reason.trim(), allowedModules })
      toast.success(`"${company.name}" a été suspendu.`)
      onSuspended(updated)
      onClose()
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la suspension.')
    } finally {
      setIsSubmitting(false)
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
        style={{ background: '#1e293b', border: '1px solid #f59e0b' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
              <AlertTriangle className="w-5 h-5" style={{ color: '#f59e0b' }} />
            </div>
            <h2 className="text-lg font-bold text-white">Suspendre {company.name}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10" style={{ color: '#94a3b8' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs mb-4" style={{ color: '#94a3b8' }}>
          Le gérant sera bloqué sur tous les modules sauf ceux cochés ci-dessous. Le motif est affiché tel quel dans son espace.
        </p>

        <label className="block text-xs font-medium mb-1.5" style={{ color: '#cbd5e1' }}>
          Motif de la suspension <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Ex : Documents de certification manquants ou expirés."
          className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none resize-none mb-4"
          style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
        />

        <p className="text-xs font-medium mb-2" style={{ color: '#cbd5e1' }}>Modules laissés accessibles</p>
        <div className="space-y-2 mb-6">
          {MODULE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-start gap-2.5 p-2.5 rounded-lg cursor-pointer transition"
              style={{ background: 'rgba(51, 65, 85, 0.3)', border: '1px solid #334155' }}
            >
              <input
                type="checkbox"
                checked={allowedModules.includes(opt.value)}
                onChange={() => toggleModule(opt.value)}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium text-white">{opt.label}</p>
                <p className="text-xs" style={{ color: '#64748b' }}>{opt.hint}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
            style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8' }}
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !reason.trim()}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: '#f59e0b', color: '#1e293b' }}
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
            Confirmer la suspension
          </button>
        </div>
      </div>
    </div>
  )
}
