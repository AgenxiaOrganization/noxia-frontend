'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  clearPlatformSession,
  isPlatformAuthenticated,
  isPlatformSessionExpired,
} from '@/lib/platformAuth'

/**
 * Garde de session du back-office NOXIA.
 * Vérifie qu'un compte plateforme (super-admin/admin/viewer) valide est
 * connecté — pas seulement qu'un token quelconque existe. Redirige vers
 * /super-admin-login si absent, expiré, ou si aucun profil utilisateur
 * n'est associé au token (protège contre un accès avec une session client
 * normale, qui n'a jamais de session plateforme).
 */
export function usePlatformSessionGuard() {
  const router = useRouter()

  useEffect(() => {
    const checkSession = () => {
      if (!isPlatformAuthenticated() || isPlatformSessionExpired()) {
        clearPlatformSession()
        router.replace('/super-admin-login')
      }
    }

    checkSession()

    const interval = setInterval(checkSession, 60_000)

    return () => clearInterval(interval)
  }, [router])
}
