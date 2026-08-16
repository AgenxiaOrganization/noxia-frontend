/**
 * Client HTTP pour le CRUD des `Instance` elles-mêmes côté Noxia Contrôle
 * (liste des déploiements NOXIA par pays : code, base URL API, statut) —
 * distinct de `superAdminClient.ts` qui proxifie des requêtes VERS une
 * instance déjà choisie. Réservé au rôle super_admin côté backend
 * (`IsSuperAdminOrReadOwnInstances`) ; create/update/delete renverront 403
 * pour un compte admin.
 */

import { clearPlatformSession, getPlatformAuthHeaders } from '../platformAuth'
import { ensureArray } from '../api'

const CONTROLE_BASE_URL =
  process.env.NEXT_PUBLIC_CONTROLE_API_URL ?? 'http://127.0.0.1:8001/api/v1'

export class InstancesApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly data: unknown,
  ) {
    super(message)
    this.name = 'InstancesApiError'
  }
}

export type InstanceStatus = 'active' | 'inactive' | 'maintenance'

export interface PlatformInstance {
  id: number
  code: string
  name: string
  url_api: string
  status: InstanceStatus
  last_heartbeat: string | null
  is_stale: boolean
  created_at: string
  api_key?: string
}

export interface CreateInstancePayload {
  code: string
  name: string
  url_api: string
  status?: InstanceStatus
}

/**
 * DRF renvoie soit {detail: "..."} soit un objet d'erreurs par champ
 * {code: ["Un objet instance avec ce champ code existe déjà."]} — on
 * aplatit toujours vers une phrase lisible, quel que soit le champ en cause.
 */
function extractErrorMessage(data: unknown): string {
  if (!data || typeof data !== 'object') return 'Une erreur est survenue.'
  const obj = data as Record<string, unknown>
  if (typeof obj.detail === 'string') return obj.detail

  const firstValue = Object.values(obj)[0]
  const firstMessage = Array.isArray(firstValue) ? firstValue[0] : firstValue
  return typeof firstMessage === 'string' ? firstMessage : 'Une erreur est survenue.'
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) return {} as T
  if (res.status === 401) {
    clearPlatformSession()
    throw new InstancesApiError('Session expirée', 401, null)
  }

  const text = await res.text()
  const data = text ? JSON.parse(text) : {}

  if (!res.ok) {
    throw new InstancesApiError(extractErrorMessage(data), res.status, data)
  }

  return data as T
}

export async function listInstances(): Promise<PlatformInstance[]> {
  const res = await fetch(`${CONTROLE_BASE_URL}/instances/`, {
    headers: getPlatformAuthHeaders(),
  })
  const data = await parseResponse<PlatformInstance[] | { results: PlatformInstance[] }>(res)
  return ensureArray<PlatformInstance>(data)
}

/** La clé API n'est renvoyée qu'à la création — jamais dans `listInstances()`. */
export async function createInstance(payload: CreateInstancePayload): Promise<PlatformInstance> {
  const res = await fetch(`${CONTROLE_BASE_URL}/instances/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getPlatformAuthHeaders() },
    body: JSON.stringify(payload),
  })
  return parseResponse<PlatformInstance>(res)
}

export async function updateInstance(
  id: number,
  payload: Partial<CreateInstancePayload>,
): Promise<PlatformInstance> {
  const res = await fetch(`${CONTROLE_BASE_URL}/instances/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getPlatformAuthHeaders() },
    body: JSON.stringify(payload),
  })
  return parseResponse<PlatformInstance>(res)
}

export async function deleteInstance(id: number): Promise<void> {
  const res = await fetch(`${CONTROLE_BASE_URL}/instances/${id}/`, {
    method: 'DELETE',
    headers: getPlatformAuthHeaders(),
  })
  await parseResponse<void>(res)
}
