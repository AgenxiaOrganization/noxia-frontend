'use client'

import Link from 'next/link'
import { Lock, ArrowUpCircle } from 'lucide-react'

/**
 * Ecran affiche a la place d'une page/section quand l'API renvoie un 403
 * `feature_not_included` (voir subscriptions.permissions.PlanFeaturePermission
 * cote backend) — la fonctionnalite existe mais n'est pas incluse dans le
 * plan actuel de l'entreprise. Le menu reste volontairement visible/cliquable
 * pour toutes les fonctionnalites (decouvrabilite commerciale) ; c'est cet
 * ecran qui explique pourquoi l'action a echoue et propose de mettre a niveau,
 * plutot que de laisser une erreur technique brute ou une liste vide.
 */
export function FeatureLockedScreen({ featureLabel }: { featureLabel?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center gap-4">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
        <Lock className="w-8 h-8" style={{ color: '#818cf8' }} />
      </div>
      <div>
        <h2 className="text-lg font-bold text-white">
          {featureLabel ? `« ${featureLabel} » n'est pas incluse dans votre plan` : "Fonctionnalité non incluse dans votre plan"}
        </h2>
        <p className="text-sm mt-1 max-w-md" style={{ color: '#94a3b8' }}>
          Passez à un plan supérieur pour débloquer cette fonctionnalité et bien d'autres.
        </p>
      </div>
      <Link
        href="/subscription"
        className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition flex items-center gap-2 bg-primary-600 hover:bg-primary-500"
        style={{ boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)' }}
      >
        <ArrowUpCircle className="w-4 h-4" />
        Voir les plans disponibles
      </Link>
    </div>
  )
}

/** Detecte le 403 dedie (voir ApiError.data cote lib/api.ts) sans dependre
 * du message d'erreur textuel, qui peut changer. */
export function isFeatureNotIncludedError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const data = (err as { data?: unknown }).data
  if (!data || typeof data !== 'object') return false
  return (data as Record<string, unknown>).code === 'feature_not_included'
}
