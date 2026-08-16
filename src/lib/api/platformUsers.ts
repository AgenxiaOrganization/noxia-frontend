/**
 * Client HTTP pour le CRUD des comptes plateforme (`PlatformUser` : rôle
 * super_admin/admin/viewer) côté Noxia Contrôle — distinct des comptes
 * clients (gérants/employés) qui vivent dans la base de chaque instance.
 * Stocké uniquement dans la base du back-office, jamais dans une instance.
 * Réservé au rôle super_admin côté backend (`IsSuperAdmin`) ; create/update/
 * delete renverront 403 pour un compte admin/viewer.
 */

import { clearPlatformSession, getPlatformAuthHeaders } from '../platformAuth'
import { ensureArray } from '../api'

const CONTROLE_BASE_URL =
  process.env.NEXT_PUBLIC_CONTROLE_API_URL ?? 'http://127.0.0.1:8001/api/v1'

export class PlatformUsersApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly data: unknown,
  ) {
    super(message)
    this.name = 'PlatformUsersApiError'
  }
}

export type PlatformRole = 'super_admin' | 'admin' | 'viewer'

export interface PlatformUserInstance {
  id: number
  code: string
  name: string
}

export interface PlatformUserAccount {
  id: number
  email: string
  first_name: string
  last_name: string
  role: PlatformRole
  permissions: string[]
  instances: PlatformUserInstance[]
  is_active: boolean
  last_login_at: string | null
  created_at: string
}

export interface CreatePlatformUserPayload {
  email: string
  first_name?: string
  last_name?: string
  role: PlatformRole
  password: string
  is_active?: boolean
  instance_ids?: number[]
}

export type UpdatePlatformUserPayload = Partial<Omit<CreatePlatformUserPayload, 'password'>> & {
  password?: string
}

/**
 * DRF renvoie soit {detail: "..."} soit un objet d'erreurs par champ
 * {email: ["Un objet platform user avec ce champ email existe déjà."]} — on
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
    throw new PlatformUsersApiError('Session expirée', 401, null)
  }

  const text = await res.text()
  const data = text ? JSON.parse(text) : {}

  if (!res.ok) {
    throw new PlatformUsersApiError(extractErrorMessage(data), res.status, data)
  }

  return data as T
}

export async function listPlatformUsers(): Promise<PlatformUserAccount[]> {
  const res = await fetch(`${CONTROLE_BASE_URL}/platform-users/`, {
    headers: getPlatformAuthHeaders(),
  })
  const data = await parseResponse<PlatformUserAccount[] | { results: PlatformUserAccount[] }>(res)
  return ensureArray<PlatformUserAccount>(data)
}

export async function createPlatformUser(payload: CreatePlatformUserPayload): Promise<PlatformUserAccount> {
  const res = await fetch(`${CONTROLE_BASE_URL}/platform-users/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getPlatformAuthHeaders() },
    body: JSON.stringify(payload),
  })
  return parseResponse<PlatformUserAccount>(res)
}

export async function updatePlatformUser(
  id: number,
  payload: UpdatePlatformUserPayload,
): Promise<PlatformUserAccount> {
  const res = await fetch(`${CONTROLE_BASE_URL}/platform-users/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getPlatformAuthHeaders() },
    body: JSON.stringify(payload),
  })
  return parseResponse<PlatformUserAccount>(res)
}

export async function deletePlatformUser(id: number): Promise<void> {
  const res = await fetch(`${CONTROLE_BASE_URL}/platform-users/${id}/`, {
    method: 'DELETE',
    headers: getPlatformAuthHeaders(),
  })
  await parseResponse<void>(res)
}
