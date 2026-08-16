/**
 * Matrice de permissions pour l'espace super-admin. `super_admin` a un accès
 * total et n'est jamais consulté ici. `admin` est restreint aux actions
 * listées ci-dessous — tout le reste (gestion produits/stock/ventes/etc. au
 * quotidien) lui est autorisé par défaut, à l'image d'un gérant d'établissement.
 */

import type { PlatformUser } from './platformAuth'

export type PlatformAction =
  | 'company.create'
  | 'company.delete'
  | 'company.toggle_status'
  | 'platform_users.manage'
  | 'subscription.change_plan'
  | 'subscription.cancel'
  | 'payments.refund'
  | 'settings.global'
  | 'logs.purge'

const ADMIN_FORBIDDEN_ACTIONS: ReadonlySet<PlatformAction> = new Set([
  'company.create',
  'company.delete',
  'company.toggle_status',
  'platform_users.manage',
  'subscription.change_plan',
  'subscription.cancel',
  'payments.refund',
  'settings.global',
  'logs.purge',
])

export function canPerform(user: PlatformUser | null, action: PlatformAction): boolean {
  if (!user) return false
  if (user.role === 'super_admin') return true
  if (user.role === 'viewer') return false
  return !ADMIN_FORBIDDEN_ACTIONS.has(action)
}
