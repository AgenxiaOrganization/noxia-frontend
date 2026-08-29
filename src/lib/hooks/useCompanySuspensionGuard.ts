'use client'

import { useEffect, useState } from 'react'
import { get } from '@/lib/api'

interface CompanyMeSuspensionFields {
  is_suspended: boolean
  suspended_reason: string
  suspension_allowed_modules: string[]
}

/**
 * Detecte si l'etablissement du gerant connecte est suspendu, de deux
 * facons complementaires (meme principe que useSubscriptionGuard) :
 * 1. Verification proactive au montage (GET /companies/me/, reste
 *    accessible meme suspendu — voir bypass_suspension_check cote backend).
 * 2. Evenement global 'company-suspended', declenche par lib/api.ts des
 *    qu'un 403 avec code=company_suspended arrive sur N'IMPORTE QUEL appel
 *    API — capte le cas ou la suspension survient pendant que le gerant est
 *    deja sur la page.
 *
 * Contrairement a l'abonnement expire, une suspension ne bloque PAS
 * forcement tout : `allowedModules` liste ce qui reste utilisable, donc
 * l'appelant affiche un bandeau (pas un modal plein ecran bloquant).
 */
export function useCompanySuspensionGuard() {
  const [isSuspended, setIsSuspended] = useState(false)
  const [reason, setReason] = useState('')
  const [allowedModules, setAllowedModules] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false

    get<CompanyMeSuspensionFields>('/companies/me/')
      .then((company) => {
        if (cancelled || !company.is_suspended) return
        setIsSuspended(true)
        setReason(company.suspended_reason)
        setAllowedModules(company.suspension_allowed_modules)
      })
      .catch(() => {})

    const handleSuspended = (event: Event) => {
      const detail = (event as CustomEvent<{ reason: string; allowedModules: string[] }>).detail
      setIsSuspended(true)
      setReason(detail?.reason ?? '')
      setAllowedModules(detail?.allowedModules ?? [])
    }
    window.addEventListener('company-suspended', handleSuspended)

    return () => {
      cancelled = true
      window.removeEventListener('company-suspended', handleSuspended)
    }
  }, [])

  return { isSuspended, reason, allowedModules }
}
