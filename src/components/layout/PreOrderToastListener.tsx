'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ClipboardList } from 'lucide-react'
import { useWebSockets } from '@/lib/hooks/useWebSockets'
import type { Notification } from '@/lib/api/notifications'

/**
 * Toast temps reel a la reception d'une nouvelle commande client (menu QR
 * public) — monte globalement dans le layout dashboard (pas seulement sur
 * /preorders) pour que le staff soit alerte ou qu'il se trouve dans l'app.
 * Reutilise le meme canal WebSocket que NotificationIcon (ws/notifications/,
 * alimente par core.signals.preorder_received_notification) plutot que d'en
 * ouvrir un second : une seule connexion suffit, chaque ecouteur filtre par
 * type de notification qui l'interesse.
 */
export function PreOrderToastListener() {
  const router = useRouter()

  const handleWsMessage = useCallback((data: { type: string; notification: Notification }) => {
    if (data.type !== 'new_notification' || data.notification.type !== 'preorder_received') return

    toast.custom(
      (t) => (
        <button
          onClick={() => { toast.dismiss(t); router.push('/preorders') }}
          className="flex items-start gap-3 w-full max-w-sm rounded-2xl border border-primary-500/30 bg-dark-900/95 backdrop-blur-xl p-4 shadow-2xl text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-primary-500/15 border border-primary-500/30 flex items-center justify-center shrink-0">
            <ClipboardList className="w-4.5 h-4.5 text-primary-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white">Nouvelle commande en ligne</p>
            <p className="text-xs text-dark-300 mt-0.5 line-clamp-2">{data.notification.message}</p>
            <p className="text-[11px] text-primary-400 mt-1 font-medium">Voir la file d&apos;attente →</p>
          </div>
        </button>
      ),
      { duration: 8000 },
    )
  }, [router])

  useWebSockets<{ type: string; notification: Notification }>('/ws/notifications/', handleWsMessage)

  return null
}
