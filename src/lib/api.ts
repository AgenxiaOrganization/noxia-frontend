import { getAuthHeaders, getRefreshToken, updateAccessToken, clearSession } from './auth'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api/v1'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  status: 'authenticated'
  access: string
  refresh: string
  user: {
    id: number
    email: string
    first_name: string
    last_name: string
    phone: string
    has_completed_profile: boolean
  }
  company: {
    id: number
    name: string
    type: string
    is_active: boolean
    verification_status: string
    is_certified?: boolean
    verification_code?: string | null
    verification_reviewed_at?: string | null
    verification_rejection_reason?: string
    messaging_code: string
    role_permissions?: Record<string, string[]>
    address?: string
    phone?: string
    email?: string
    currency?: string
    country?: string
    timezone?: string
    tva_rate?: number
    logo?: string | null
    whatsapp_bot_active?: boolean
    telegram_bot_active?: boolean
  } | null
  membership: {
    id: number
    role: string
    is_active: boolean
    activation_code: string | null
    photo_profile?: string | null
  } | null
  /** Config globale a l'instance (pas a l'entreprise) — numero WhatsApp du
   * bot NOXIA, configure cote backoffice (Instance.whatsapp_bot_number) et
   * recopie dans le .env de cette instance (settings.WHATSAPP_BOT_NUMBER).
   * Present uniquement sur la reponse de GET /auth/me/, absent du login. */
  whatsapp_bot_number?: string
}

export interface GoogleCompanyRequiredResponse {
  status: 'company_name_required'
  email: string
  first_name: string
  last_name: string
  detail: string
}

export interface GoogleNoMembershipResponse {
  status: 'no_membership'
  detail: string
}

export type GoogleAuthResult =
  | AuthResponse
  | GoogleCompanyRequiredResponse
  | GoogleNoMembershipResponse

// ─── Types internes ───────────────────────────────────────────────────────────

/** Contexte de la requête originale, nécessaire pour pouvoir la rejouer
 *  correctement après un rafraîchissement silencieux du token (retry 401). */
interface RequestContext {
  method: string
  path: string
  body?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly data: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Tente un rafraîchissement silencieux du token d'accès via le refresh token.
 * Retourne le nouvel access token si le refresh réussit, ou null en cas d'échec.
 */
async function tryRefreshToken(): Promise<string | null> {
  const refresh = getRefreshToken()
  if (!refresh) return null
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    })
    if (!res.ok) return null
    const data = await res.json()
    if (data.access) {
      updateAccessToken(data.access)
      return data.access
    }
    return null
  } catch {
    return null
  }
}

/**
 * Déconnecte l'utilisateur et le redirige vers la page de login.
 * Appelé lorsque le refresh token est lui-même expiré ou invalide.
 */
function forceLogout(): void {
  clearSession()
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}

async function parseResponse<T>(res: Response, ctx: RequestContext): Promise<T> {
  if (res.status === 204) {
    return {} as T
  }

  // Tentative de rafraîchissement silencieux du token si la réponse est 401
  if (res.status === 401) {
    const newToken = await tryRefreshToken()
    if (newToken) {
      // Rejouer la requête originale avec la bonne méthode HTTP et le body d'origine
      const retryRes = await fetch(`${BASE_URL}${ctx.path}`, {
        method: ctx.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${newToken}`,
        },
        ...(ctx.body ? { body: ctx.body } : {}),
      })
      // Si le retry réussit, on retourne le résultat ; sinon on force le logout
      if (retryRes.ok) {
        if (retryRes.status === 204) return {} as T
        const retryText = await retryRes.text()
        return retryText ? JSON.parse(retryText) : {} as T
      }
    }
    // Refresh échoué → session expirée → redirection vers /login
    forceLogout()
    throw new ApiError('Session expirée. Veuillez vous reconnecter.', 401, null)
  }

  const text = await res.text()
  let data: unknown = null
  try {
    data = text ? JSON.parse(text) : {}
  } catch (e) {
    console.error(`[API Error] Parsing JSON echoue pour ${ctx.path}. Statut: ${res.status}. Debut de reponse:`, text.slice(0, 800))
    throw new ApiError(`Erreur serveur (${res.status}) : reponse non valide.`, res.status, null)
  }

  if (!res.ok) {
    const message =
      (data as Record<string, unknown>)?.detail as string ??
      (data && typeof data === 'object'
        ? Object.values(data as Record<string, string[]>)
            .flat()
            .join(' ')
        : null) ??
      'Une erreur est survenue.'

    // 403 "abonnement expire" (voir companies.permissions.SubscriptionExpiredError
    // cote backend) : declenche un evenement global ecoute par useSubscriptionGuard
    // pour afficher le modal de paiement bloquant, plutot que de laisser chaque
    // appelant gerer ce cas individuellement (meme principe que forceLogout() sur 401).
    if (res.status === 403 && (data as Record<string, unknown>)?.code === 'subscription_expired') {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('subscription-expired'))
      }
    }

    // 403 "etablissement suspendu" (voir companies.permissions.CompanySuspendedError
    // cote backend) : ecoute par useCompanySuspensionGuard pour afficher le
    // bandeau de blocage avec le motif — contrairement a l'abonnement expire,
    // ne bloque QUE les modules non explicitement laisses actifs par le
    // super-admin (voir allowed_modules), donc pas de modal plein ecran ici.
    if (res.status === 403 && (data as Record<string, unknown>)?.code === 'company_suspended') {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('company-suspended', {
          detail: {
            reason: (data as Record<string, unknown>)?.reason ?? '',
            allowedModules: (data as Record<string, unknown>)?.allowed_modules ?? [],
          },
        }))
      }
    }

    throw new ApiError(message, res.status, data)
  }

  return data as T
}

// ─── CACHE MÉMOIRE ULTRA-RAPIDE (Stale-While-Revalidate) ──────────────────────
const apiCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL_MS = 60000 // 60 secondes de fraîcheur

/**
 * Garantit qu'une donnée renvoyée par l'API est sous forme de tableau,
 * même si le backend renvoie un objet paginé DRF { count: X, results: [...] }, null ou undefined.
 */
export function ensureArray<T>(data: any): T[] {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.results)) return data.results
  return []
}

export function invalidateApiCache(pathPrefix?: string) {
  if (!pathPrefix) {
    apiCache.clear()
    return
  }
  for (const key of apiCache.keys()) {
    if (key.includes(pathPrefix)) {
      apiCache.delete(key)
    }
  }
}

function getPathPrefix(path: string): string {
  const parts = path.split('/').filter(Boolean)
  return parts.length > 0 ? `/${parts[0]}` : ''
}

export async function get<T>(path: string, options?: { skipCache?: boolean }): Promise<T> {
  const cacheKey = path
  const now = Date.now()
  const cached = apiCache.get(cacheKey)

  // Si données en cache, les renvoyer instantanément (0ms de latence !)
  if (!options?.skipCache && cached) {
    const isFresh = (now - cached.timestamp < CACHE_TTL_MS)
    // SWR : Revalidation en arrière-plan si périmé
    if (!isFresh) {
      fetch(`${BASE_URL}${path}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      })
        .then(res => parseResponse<T>(res, { method: 'GET', path }))
        .then(freshData => {
          apiCache.set(cacheKey, { data: freshData, timestamp: Date.now() })
        })
        .catch(() => {})
    }

    return cached.data as T
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  })
  const data = await parseResponse<T>(res, { method: 'GET', path })
  apiCache.set(cacheKey, { data, timestamp: Date.now() })
  return data
}

export async function post<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const serialized = JSON.stringify(body)
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: serialized,
  })
  invalidateApiCache(getPathPrefix(path))
  return parseResponse<T>(res, { method: 'POST', path, body: serialized })
}

export async function put<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const serialized = JSON.stringify(body)
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: serialized,
  })
  invalidateApiCache(getPathPrefix(path))
  return parseResponse<T>(res, { method: 'PUT', path, body: serialized })
}

export async function patch<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const serialized = JSON.stringify(body)
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: serialized,
  })
  invalidateApiCache(getPathPrefix(path))
  return parseResponse<T>(res, { method: 'PATCH', path, body: serialized })
}

export async function del<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  })
  invalidateApiCache(getPathPrefix(path))
  return parseResponse<T>(res, { method: 'DELETE', path })
}

// ─── Auth endpoints ────────────────────────────────────────────────────────────

/**
 * Connexion par email + code employé (activation_code à 6 caractères).
 * POST /auth/login-employee/
 */
export async function loginWithEmployeeId(
  email: string,
  activationCode: string,
): Promise<AuthResponse> {
  return post<AuthResponse>('/auth/login-employee/', {
    email,
    activation_code: activationCode.toUpperCase(),
  })
}

/**
 * Connexion / inscription via Google.
 * POST /auth/google/
 *
 * — Si l'utilisateur existe et a un Membership actif → AuthResponse
 * — Si l'utilisateur existe mais sans Membership     → GoogleNoMembershipResponse (HTTP 403)
 * — Si l'utilisateur n'existe pas encore            → GoogleCompanyRequiredResponse
 * — Si l'utilisateur n'existe pas + company_name    → AuthResponse (création du compte)
 */
export async function googleAuth(
  idToken: string,
  extra?: { company_name?: string; company_type?: string; phone?: string; country?: string; plan_code?: string },
): Promise<GoogleAuthResult> {
  // For the no_membership case the backend returns HTTP 403 which our `post`
  // helper would normally throw. We catch it here so the frontend can display
  // a friendly message instead.
  try {
    return await post<GoogleAuthResult>('/auth/google/', {
      id_token: idToken,
      ...(extra ?? {}),
    })
  } catch (err) {
    if (err instanceof ApiError && err.statusCode === 403) {
      return (err.data as GoogleNoMembershipResponse)
    }
    throw err
  }
}

/**
 * Inscription complète (nouveau gérant + établissement).
 * POST /auth/register/
 */
export async function registerAccount(payload: {
  email: string
  password: string
  first_name?: string
  last_name?: string
  phone?: string
  company_name: string
  company_type?: string
  country?: string
  plan_code?: string
}): Promise<AuthResponse> {
  return post<AuthResponse>('/auth/register/', payload)
}

/**
 * Détecte le pays probable du visiteur à partir de son IP (best-effort,
 * pour pré-remplir — jamais bloquant — le champ pays du formulaire
 * d'inscription). Renvoie `null` si la détection échoue plutôt que de
 * lever une erreur, pour ne jamais gêner l'affichage du formulaire.
 * GET /auth/detect-country/
 */
export async function detectCountry(): Promise<string | null> {
  try {
    const { country } = await get<{ country: string | null }>('/auth/detect-country/', { skipCache: true })
    return country
  } catch {
    return null
  }
}

/**
 * Rafraîchissement du token JWT.
 * POST /auth/refresh/
 */
export async function refreshToken(refresh: string): Promise<{ access: string }> {
  return post<{ access: string }>('/auth/refresh/', { refresh })
}

/**
 * Bypass de connexion réservé au développement local.
 * Le backend renvoie 403 sur cet endpoint dès que DEBUG=False : ne jamais
 * appeler cette fonction depuis un composant accessible en production.
 * POST /auth/dev-login/
 */
export async function devLogin(email: string): Promise<AuthResponse> {
  return post<AuthResponse>('/auth/dev-login/', { email })
}

/**
 * Récupérer le profil complet de l'utilisateur connecté
 * GET /auth/me/
 */
export async function getMe(): Promise<Omit<AuthResponse, 'status' | 'access' | 'refresh'>> {
  return get<Omit<AuthResponse, 'status' | 'access' | 'refresh'>>('/auth/me/')
}

/**
 * Mettre à jour le profil de l'utilisateur connecté
 * PATCH /auth/me/
 */
export async function updateMe(payload: {
  first_name?: string
  last_name?: string
  phone?: string
}): Promise<Omit<AuthResponse, 'status' | 'access' | 'refresh'>> {
  return patch<Omit<AuthResponse, 'status' | 'access' | 'refresh'>>('/auth/me/', payload)
}

/**
 * Televerse/remplace la photo de profil de l'utilisateur connecte —
 * multipart, contourne le client JSON comme les autres uploads de photo.
 * PATCH /auth/me/
 */
export async function uploadMyPhoto(file: File): Promise<Omit<AuthResponse, 'status' | 'access' | 'refresh'>> {
  const formData = new FormData()
  formData.append('photo_profile', file)
  const res = await fetch(`${BASE_URL}/auth/me/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: formData,
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as Record<string, unknown>)?.detail as string ?? "Erreur lors de l'envoi de la photo.")
  }
  return res.json()
}
