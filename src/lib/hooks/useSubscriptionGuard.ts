'use client'

import { useEffect, useState } from 'react'
import { getMySubscription } from '@/lib/api/subscription'

/**
 * Detecte si l'abonnement de l'entreprise courante est expire, de deux
 * facons complementaires :
 * 1. Verification proactive au montage (GET /subscriptions/me/, reste
 *    accessible meme expire — voir bypass_subscription_check cote backend).
 * 2. Evenement global 'subscription-expired', declenche par lib/api.ts des
 *    qu'un 403 avec code=subscription_expired arrive sur N'IMPORTE QUEL
 *    appel API (produits, ventes, stock...) — capte le cas ou l'abonnement
 *    expire pendant que l'utilisateur est deja sur la page.
 *
 * Retourne isExpired : true fige l'interface via un modal plein ecran non
 * fermable (voir SubscriptionBlockModal), jusqu'a ce que setIsExpired(false)
 * soit appele apres un paiement reussi.
 */
export function useSubscriptionGuard() {
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    let cancelled = false
    getMySubscription()
      .then((sub) => { if (!cancelled && sub.status === 'expired') setIsExpired(true) })
      .catch(() => {})

    const handleExpired = () => setIsExpired(true)
    window.addEventListener('subscription-expired', handleExpired)

    return () => {
      cancelled = true
      window.removeEventListener('subscription-expired', handleExpired)
    }
  }, [])

  return { isExpired, setIsExpired }
}
