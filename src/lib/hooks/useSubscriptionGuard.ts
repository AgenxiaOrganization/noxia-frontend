'use client'

import { useEffect, useState } from 'react'
import { getMySubscription } from '@/lib/api/subscription'

export type SubscriptionBlockStatus = 'expired' | 'canceled'

/**
 * Detecte si l'abonnement de l'entreprise courante est expire ou annule, de
 * deux facons complementaires :
 * 1. Verification proactive au montage (GET /subscriptions/me/, reste
 *    accessible meme bloque — voir bypass_subscription_check cote backend).
 * 2. Evenement global 'subscription-expired', declenche par lib/api.ts des
 *    qu'un 403 avec code=subscription_expired arrive sur N'IMPORTE QUEL
 *    appel API (produits, ventes, stock...) — capte le cas ou l'abonnement
 *    devient bloquant pendant que l'utilisateur est deja sur la page.
 *
 * Retourne status : non-null fige l'interface via un modal plein ecran non
 * fermable (voir SubscriptionBlockModal), jusqu'a ce que setStatus(null) soit
 * appele apres une reactivation reussie. Expire et annule partagent le meme
 * `code` d'erreur cote backend (companies.permissions.SubscriptionExpiredError) —
 * seul le texte affiche differe, lu depuis le statut reel de l'abonnement.
 */
export function useSubscriptionGuard() {
  const [status, setStatus] = useState<SubscriptionBlockStatus | null>(null)

  useEffect(() => {
    let cancelled = false
    getMySubscription()
      .then((sub) => {
        if (cancelled) return
        if (sub.status === 'expired' || sub.status === 'canceled') setStatus(sub.status)
      })
      .catch(() => {})

    // L'evenement reseau global ne porte pas le statut exact (juste le code
    // 'subscription_expired' partage entre expired/canceled) — on retombe
    // sur 'expired' par defaut si rien n'est deja fige, corrige au prochain
    // GET /subscriptions/me/ (ex: au montage du modal lui-meme) si c'est en
    // fait 'canceled'.
    const handleBlocked = () => setStatus((prev) => prev ?? 'expired')
    window.addEventListener('subscription-expired', handleBlocked)

    return () => {
      cancelled = true
      window.removeEventListener('subscription-expired', handleBlocked)
    }
  }, [])

  return { isExpired: status !== null, status, setStatus }
}
