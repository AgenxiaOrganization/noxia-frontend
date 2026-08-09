/**
 * Session du back-office NOXIA (Noxia Contrôle) — séparée de la session
 * client gérée par `auth.ts`. Deux systèmes JWT indépendants : les comptes
 * clients utilisent un JWT HS256 avec refresh token (6h, `auth.ts`) ; les
 * comptes plateforme (super-admin/admin) utilisent un JWT RS256 sans
 * refresh token (24h, ce fichier). Les clés localStorage sont distinctes
 * pour ne jamais se mélanger.
 */

const PLATFORM_ACCESS_KEY = 'noxia_platform_access'
const PLATFORM_USER_KEY = 'noxia_platform_user'
const PLATFORM_EXPIRY_KEY = 'noxia_platform_session_expiry'

const PLATFORM_SESSION_DURATION_MS = 24 * 60 * 60 * 1000

export interface PlatformUser {
  id: number
  email: string
  first_name: string
  last_name: string
  role: 'super_admin' | 'admin' | 'viewer'
  permissions: string[]
  instances: { id: number; code: string; name: string }[]
  is_active: boolean
  last_login_at: string | null
  created_at: string
}

export interface PlatformLoginResponse {
  access_token: string
  user: PlatformUser
}

export function savePlatformSession(data: PlatformLoginResponse) {
  if (typeof window === 'undefined') return
  localStorage.setItem(PLATFORM_ACCESS_KEY, data.access_token)
  localStorage.setItem(PLATFORM_USER_KEY, JSON.stringify(data.user))
  const expiry = Date.now() + PLATFORM_SESSION_DURATION_MS
  localStorage.setItem(PLATFORM_EXPIRY_KEY, String(expiry))
}

export function clearPlatformSession() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(PLATFORM_ACCESS_KEY)
  localStorage.removeItem(PLATFORM_USER_KEY)
  localStorage.removeItem(PLATFORM_EXPIRY_KEY)
}

export function getPlatformAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(PLATFORM_ACCESS_KEY)
}

export function getPlatformUser(): PlatformUser | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(PLATFORM_USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as PlatformUser
  } catch {
    return null
  }
}

export function isPlatformAuthenticated(): boolean {
  return !!getPlatformAccessToken() && !!getPlatformUser()
}

export function isPlatformSessionExpired(): boolean {
  if (typeof window === 'undefined') return false
  const expiry = localStorage.getItem(PLATFORM_EXPIRY_KEY)
  if (!expiry) return true
  return Date.now() > parseInt(expiry, 10)
}

/** Returns the Authorization header object for Noxia Contrôle API calls. */
export function getPlatformAuthHeaders(): Record<string, string> {
  const token = getPlatformAccessToken()
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}
