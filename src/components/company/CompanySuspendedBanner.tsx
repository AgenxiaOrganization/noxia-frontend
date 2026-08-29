'use client'

import { ShieldAlert } from 'lucide-react'

const MODULE_LABELS: Record<string, string> = {
  documents: 'Documents',
  parametres: 'Paramètres',
  abonnement: 'Abonnement',
}

/**
 * Bandeau persistant affiché en haut du dashboard pendant que l'établissement
 * est suspendu (voir useCompanySuspensionGuard). Non fermable définitivement
 * (pas de croix) : contrairement à SubscriptionBlockModal, ce n'est pas un
 * modal plein écran bloquant, puisque le super-admin peut laisser certains
 * modules fonctionnels (allowedModules) — la navigation reste possible, seuls
 * les appels API vers des modules non autorisés renvoient un 403 explicite.
 */
export default function CompanySuspendedBanner({
  reason, allowedModules,
}: {
  reason: string
  allowedModules: string[]
}) {
  const allowedLabels = allowedModules.map((m) => MODULE_LABELS[m] ?? m)

  return (
    <div
      className="shrink-0 px-4 py-3 flex items-start gap-3"
      style={{ background: 'rgba(239, 68, 68, 0.95)', color: '#fff' }}
    >
      <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-sm font-semibold">Votre établissement a été suspendu par NOXIA</p>
        {reason && <p className="text-sm mt-0.5 opacity-95">{reason}</p>}
        {allowedLabels.length > 0 && (
          <p className="text-xs mt-1 opacity-90">
            Fonctionnalités encore accessibles : {allowedLabels.join(', ')}.
          </p>
        )}
      </div>
    </div>
  )
}
