/**
 * Noxia Auth — helpers pour la gestion des tokens JWT en localStorage.
 * Les sessions durent 6 heures (durée de vie de l'access token côté Django).
 * À l'expiration, l'utilisateur est redirigé automatiquement vers /login.
 */

import type { AuthResponse } from './api'

const ACCESS_KEY    = 'noxia_access'
const REFRESH_KEY   = 'noxia_refresh'
const USER_KEY      = 'noxia_user'
const COMPANY_KEY   = 'noxia_company'
const MEMBERSHIP_KEY = 'noxia_membership'
const EXPIRY_KEY    = 'noxia_session_expiry'

// Durée de session en millisecondes (6 heures)
const SESSION_DURATION_MS = 6 * 60 * 60 * 1000

// ─── Token storage ─────────────────────────────────────────────────────────────

export function saveSession(data: AuthResponse) {
  if (typeof window === 'undefined') return
  localStorage.setItem(ACCESS_KEY, data.access)
  localStorage.setItem(REFRESH_KEY, data.refresh)
  localStorage.setItem(USER_KEY, JSON.stringify(data.user))
  if (data.company)    localStorage.setItem(COMPANY_KEY, JSON.stringify(data.company))
  if (data.membership) localStorage.setItem(MEMBERSHIP_KEY, JSON.stringify(data.membership))
  // Enregistrement de l'horodatage d'expiration de la session (maintenant + 6h)
  const expiry = Date.now() + SESSION_DURATION_MS
  localStorage.setItem(EXPIRY_KEY, String(expiry))
}

export function clearSession() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(COMPANY_KEY)
  localStorage.removeItem(MEMBERSHIP_KEY)
  localStorage.removeItem(EXPIRY_KEY)
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(REFRESH_KEY)
}

export function getUser() {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthResponse['user']
  } catch {
    return null
  }
}

export function getCompany() {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(COMPANY_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as NonNullable<AuthResponse['company']>
  } catch {
    return null
  }
}

export function getMembership() {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(MEMBERSHIP_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as NonNullable<AuthResponse['membership']>
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  return !!getAccessToken()
}

/**
 * Vérifie si la session est expirée en comparant l'horodatage actuel
 * avec la date d'expiration stockée en localStorage.
 * Retourne true si la session a expiré ou si aucune date n'est trouvée.
 */
export function isSessionExpired(): boolean {
  if (typeof window === 'undefined') return false
  const expiry = localStorage.getItem(EXPIRY_KEY)
  if (!expiry) return true
  return Date.now() > parseInt(expiry, 10)
}

/**
 * Met à jour uniquement l'access token après un rafraîchissement silencieux.
 * Réinitialise aussi la date d'expiration de la session pour 6h supplémentaires.
 */
export function updateAccessToken(newAccessToken: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ACCESS_KEY, newAccessToken)
  // Renouvellement de la fenêtre de 6h après chaque refresh réussi
  const expiry = Date.now() + SESSION_DURATION_MS
  localStorage.setItem(EXPIRY_KEY, String(expiry))
}

/** Returns the Authorization header object for authenticated API calls. */
export function getAuthHeaders(): Record<string, string> {
  const token = getAccessToken()
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}
