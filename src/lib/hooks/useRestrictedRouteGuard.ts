'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { RESTRICTED_ROUTE_PATHS } from '@/lib/superAdminRestrictedRoutes'

/**
 * Bloque l'accès direct par URL aux pages retirées de la navigation
 * super-admin (voir src/lib/superAdminRestrictedRoutes.ts) — recommandation
 * de l'Autorité de Protection des Données Personnelles (Gabon) : le
 * back-office ne doit plus donner accès aux données d'activité des
 * établissements clients, même en tapant l'URL directement une fois le lien
 * retiré de la sidebar.
 */
export function useRestrictedRouteGuard() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const isRestricted = RESTRICTED_ROUTE_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    )
    if (isRestricted) {
      router.replace('/super-admin')
    }
  }, [pathname, router])
}
