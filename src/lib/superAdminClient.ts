/**
 * Client HTTP pour les appels du super-admin vers les donnees d'ETABLISSEMENT
 * (produits, stock, ventes...) d'une instance choisie. Contrairement a
 * `controleApi.ts` (qui parle a Noxia Controle lui-meme), ces requetes sont
 * relayees par Noxia Controle vers l'instance metier concernee : le token
 * RS256 du compte plateforme n'est jamais envoye a l'instance, seule Noxia
 * Controle connait la cle API de l'instance (voir noxia-backoffice/proxy).
 *
 * Meme forme (`get/post/put/patch/del`) que `lib/api.ts` afin que les
 * modules `lib/api/*.ts` (catalog, inventory...) puissent accepter ce client
 * en injection plutot que d'etre dupliques pour le super-admin.
 */

import { getPlatformAuthHeaders, clearPlatformSession } from './platformAuth'

const CONTROLE_BASE_URL =
  process.env.NEXT_PUBLIC_CONTROLE_API_URL ?? 'http://127.0.0.1:8001/api/v1'

export class SuperAdminApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly data: unknown,
  ) {
    super(message)
    this.name = 'SuperAdminApiError'
  }
}

export interface ProxyCompany {
  id: number
  name: string
  type: string
  country: string
  is_active: boolean
  messaging_code: string
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) return {} as T
  if (res.status === 401) {
    clearPlatformSession()
    throw new SuperAdminApiError('Session expirée', 401, null)
  }

  const text = await res.text()
  const data = text ? JSON.parse(text) : {}

  if (!res.ok) {
    const message =
      (data as Record<string, unknown>)?.detail as string ?? 'Une erreur est survenue.'
    throw new SuperAdminApiError(message, res.status, data)
  }

  return data as T
}

/** Ajoute `company_id` à un chemin donné, en préservant une query existante. */
function withCompanyId(path: string, companyId: number): string {
  const separator = path.includes('?') ? '&' : '?'
  return `${path}${separator}company_id=${companyId}`
}

/**
 * Fabrique un client `{ get, post, put, patch, del }` scopé sur l'instance ET
 * l'établissement choisis — chaque requête cible explicitement `companyId`
 * puisque le compte plateforme n'a pas de Membership sur l'instance distante.
 */
export function createSuperAdminClient(instanceCode: string, companyId: number) {
  const base = `${CONTROLE_BASE_URL}/proxy/${instanceCode}`

  return {
    get: <T>(path: string) =>
      fetch(`${base}${withCompanyId(path, companyId)}`, { headers: getPlatformAuthHeaders() }).then(res => parseResponse<T>(res)),

    post: <T>(path: string, body: Record<string, unknown>) =>
      fetch(`${base}${withCompanyId(path, companyId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getPlatformAuthHeaders() },
        body: JSON.stringify(body),
      }).then(res => parseResponse<T>(res)),

    put: <T>(path: string, body: Record<string, unknown>) =>
      fetch(`${base}${withCompanyId(path, companyId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getPlatformAuthHeaders() },
        body: JSON.stringify(body),
      }).then(res => parseResponse<T>(res)),

    patch: <T>(path: string, body: Record<string, unknown>) =>
      fetch(`${base}${withCompanyId(path, companyId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getPlatformAuthHeaders() },
        body: JSON.stringify(body),
      }).then(res => parseResponse<T>(res)),

    del: <T>(path: string) =>
      fetch(`${base}${withCompanyId(path, companyId)}`, {
        method: 'DELETE',
        headers: getPlatformAuthHeaders(),
      }).then(res => parseResponse<T>(res)),
  }
}

export type ApiClient = ReturnType<typeof createSuperAdminClient>

/** Liste les établissements actifs d'une instance, pour le sélecteur d'établissement. */
export async function listInstanceCompanies(instanceCode: string): Promise<ProxyCompany[]> {
  const res = await fetch(`${CONTROLE_BASE_URL}/proxy/${instanceCode}/companies/proxy-list/`, {
    headers: getPlatformAuthHeaders(),
  })
  return parseResponse<ProxyCompany[]>(res)
}

export interface ProxyCompanyDetail {
  id: number
  name: string
  type: string
  address: string
  phone: string
  country: string
  is_active: boolean
  verification_status: 'incomplete' | 'pending' | 'verified' | 'rejected'
  created_at: string
  owner_email: string
  owner_phone: string
  subscription: {
    status: 'trialing' | 'active' | 'expired' | 'canceled'
    plan_name: string
    plan_code: string
    trial_end: string | null
    created_at: string
    current_period_start: string | null
    current_period_end: string | null
    billing_period: 'monthly' | 'yearly' | null
  } | null
  users_count: number
  products_count: number
  monthly_revenue: string
  monthly_orders: number
  documents_count: number
}

/** Liste complète (toutes, pas seulement actives) des entreprises d'une
 * instance avec agrégats réels — pour super-admin/entreprises. Pas de
 * `company_id` : cet endpoint liste justement TOUTES les entreprises. */
export async function listInstanceCompaniesDetailed(instanceCode: string): Promise<ProxyCompanyDetail[]> {
  const res = await fetch(`${CONTROLE_BASE_URL}/proxy/${instanceCode}/companies/proxy-detail-list/`, {
    headers: getPlatformAuthHeaders(),
  })
  return parseResponse<ProxyCompanyDetail[]>(res)
}

/**
 * Cree une notification manuelle dans l'espace du gerant (relance d'essai
 * depuis le dashboard super-admin) — voir InstanceProxyNotificationCreateView
 * cote noxia-backend. Visible par toute l'entreprise, comme les autres
 * notifications du systeme (stock, ventes...).
 */
export async function sendManualNotification(
  instanceCode: string,
  companyId: number,
  payload: { category: 'notification' | 'alert'; type: string; title: string; message: string; link?: string },
): Promise<void> {
  await createSuperAdminClient(instanceCode, companyId).post('/notifications/proxy-create/', payload)
}

/**
 * URL + headers pour un telechargement binaire (PDF/Excel) via le proxy —
 * utilise par les fonctions de `lib/api/*.ts` qui font un fetch direct
 * plutot que de passer par `createSuperAdminClient` (reponse non-JSON).
 */
export function getProxyDownloadTarget(instanceCode: string, companyId: number, path: string) {
  return {
    url: `${CONTROLE_BASE_URL}/proxy/${instanceCode}${withCompanyId(path, companyId)}`,
    headers: getPlatformAuthHeaders(),
  }
}

export interface ProxyVerificationDocument {
  id: number
  company_id: number
  company_name: string
  document_type: string
  document_type_display: string
  file: string
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason: string
  created_at: string
}

/** Documents KYB en attente de revue (toutes entreprises de l'instance) —
 * alimente la page super-admin/verifications et le compteur de la cloche. */
export async function listInstancePendingVerifications(instanceCode: string): Promise<ProxyVerificationDocument[]> {
  const res = await fetch(`${CONTROLE_BASE_URL}/proxy/${instanceCode}/companies/proxy-pending-verifications/`, {
    headers: getPlatformAuthHeaders(),
  })
  return parseResponse<ProxyVerificationDocument[]>(res)
}

/** Approuve un document KYB — certifie automatiquement l'entreprise des que
 * tous les documents requis sont approuves (voir approve_verification_document
 * cote noxia-backend). `companyId` sert uniquement au ciblage du proxy. */
export async function approveVerificationDocument(instanceCode: string, companyId: number, documentId: number): Promise<ProxyVerificationDocument> {
  return createSuperAdminClient(instanceCode, companyId).post<ProxyVerificationDocument>(`/companies/me/documents/${documentId}/approve/`, {})
}

/** Rejette un document KYB avec motif obligatoire — le responsable pourra le re-televerser. */
export async function rejectVerificationDocument(instanceCode: string, companyId: number, documentId: number, reason: string): Promise<ProxyVerificationDocument> {
  return createSuperAdminClient(instanceCode, companyId).post<ProxyVerificationDocument>(`/companies/me/documents/${documentId}/reject/`, { reason })
}
