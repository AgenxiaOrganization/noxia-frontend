'use client'

import { useState } from 'react'
import { AlertTriangle, Loader2, X } from 'lucide-react'

/**
 * Confirmation d'annulation d'abonnement — rend effective la promesse du FAQ
 * public (annulation possible a tout moment, sans penalite, mais sans
 * remboursement de la duree en cours). Un `confirm()` natif ne suffit pas
 * pour un texte aussi engageant : ce modal dedie force la lecture des
 * consequences (suspension totale, non-remboursement, perte definitive de
 * l'essai gratuit le cas echeant) avant de pouvoir valider.
 */
export default function CancelSubscriptionModal({
  hasTrialed,
  isSubmitting,
  onClose,
  onConfirm,
}: {
  hasTrialed: boolean
  isSubmitting: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  const [acknowledged, setAcknowledged] = useState(false)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={isSubmitting ? undefined : onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-7 sm:p-8"
        style={{ background: '#1e293b', border: '1px solid #334155', boxShadow: '0 25px 60px -15px rgba(0,0,0,0.5)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(239, 68, 68, 0.15)' }}
            >
              <AlertTriangle className="w-5 h-5" style={{ color: '#ef4444' }} />
            </div>
            <h2 className="text-lg font-bold text-white">Annuler mon abonnement</h2>
          </div>
          {!isSubmitting && (
            <button onClick={onClose} className="p-1 rounded transition hover:bg-white/10" style={{ color: '#94a3b8' }}>
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="space-y-3 text-sm" style={{ color: '#cbd5e1' }}>
          <p>Cette action est <strong className="text-white">définitive et non remboursable</strong> : la durée déjà payée sur la période en cours ne sera pas remboursée.</p>
          <p>Dès l'annulation, <strong className="text-white">tous les services NOXIA seront immédiatement suspendus</strong> pour votre établissement, jusqu'à ce que vous choisissiez un nouveau plan ou réactiviez votre abonnement.</p>
          {hasTrialed && (
            <p>
              <strong className="text-white">Vous ne pourrez plus revenir au plan d'essai gratuit</strong> : ayant déjà bénéficié de l'essai, seuls les plans payants resteront disponibles pour réactiver l'accès.
            </p>
          )}
        </div>

        <label className="flex items-start gap-2.5 mt-5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-0.5"
          />
          <span className="text-xs" style={{ color: '#94a3b8' }}>
            Je comprends que cette annulation est définitive, non remboursable, et que l'accès à NOXIA sera suspendu jusqu'à la reprise d'un plan.
          </span>
        </label>

        <div className="flex flex-col-reverse sm:flex-row gap-2.5 mt-6">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-50"
            style={{ background: 'rgba(148, 163, 184, 0.15)', color: '#cbd5e1' }}
          >
            Conserver mon abonnement
          </button>
          <button
            onClick={onConfirm}
            disabled={!acknowledged || isSubmitting}
            className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: '#ef4444' }}
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isSubmitting ? 'Annulation...' : "Confirmer l'annulation"}
          </button>
        </div>
      </div>
    </div>
  )
}
