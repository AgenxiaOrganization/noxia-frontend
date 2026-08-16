'use client'

import { getPlatformUser } from '@/lib/platformAuth'
import { canPerform, type PlatformAction } from '@/lib/permissions'

/** Indique si le compte plateforme connecté peut effectuer `action`. */
export function usePermission(action: PlatformAction): boolean {
  return canPerform(getPlatformUser(), action)
}
