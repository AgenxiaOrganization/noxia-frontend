'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, isSessionExpired, clearSession } from '@/lib/auth'

/**
 * Hook de garde de session.
 * Vérifie toutes les minutes si la session de l'utilisateur est toujours valide.
 * Redirige automatiquement vers /login si :
 *  - L'utilisateur n'est pas authentifié du tout
 *  - Le token d'accès a dépassé sa durée de vie de 6 heures
 */
export function useSessionGuard() {
  const router = useRouter()

  useEffect(() => {
    // Vérification immédiate à l'arrivée sur n'importe quelle page protégée
    const checkSession = () => {
      if (!isAuthenticated() || isSessionExpired()) {
        clearSession()
        router.replace('/login')
      }
    }

    checkSession()

    // Vérification périodique toutes les 60 secondes en arrière-plan
    const interval = setInterval(checkSession, 60_000)

    return () => clearInterval(interval)
  }, [router])
}
