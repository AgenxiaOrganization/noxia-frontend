/**
 * Client HTTP pour la messagerie de Noxia Contrôle (canal "Contacter
 * l'administration NOXIA" du widget assistant établissement) — appel direct
 * au back-office, comme `instances.ts` (pas via le proxy vers une instance,
 * contrairement à `superAdminClient.ts`) : les conversations sont stockées
 * côté Noxia Contrôle, pas dans une instance métier.
 */

import { clearPlatformSession, getPlatformAuthHeaders } from '../platformAuth'

const CONTROLE_BASE_URL =
  process.env.NEXT_PUBLIC_CONTROLE_API_URL ?? 'http://127.0.0.1:8001/api/v1'

export class MessagingApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly data: unknown,
  ) {
    super(message)
    this.name = 'MessagingApiError'
  }
}

export interface ConversationSummary {
  id: number
  instance_code: string
  instance_name: string
  company_id: number
  company_name: string
  last_message_at: string | null
  unread_count: number
  created_at: string
}

export interface ConversationMessage {
  id: number
  direction: 'inbound' | 'outbound'
  sender_name: string
  sender_email: string
  sender_admin_email: string
  text: string
  created_at: string
}

export interface ConversationDetail extends ConversationSummary {
  messages: ConversationMessage[]
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) return {} as T
  if (res.status === 401) {
    clearPlatformSession()
    throw new MessagingApiError('Session expirée', 401, null)
  }

  const text = await res.text()
  const data = text ? JSON.parse(text) : {}

  if (!res.ok) {
    const message = (data as Record<string, unknown>)?.detail as string ?? 'Une erreur est survenue.'
    throw new MessagingApiError(message, res.status, data)
  }

  return data as T
}

export async function listConversations(instanceCode?: string): Promise<ConversationSummary[]> {
  const params = instanceCode ? `?instance=${instanceCode}` : ''
  const res = await fetch(`${CONTROLE_BASE_URL}/messaging/conversations/${params}`, {
    headers: getPlatformAuthHeaders(),
  })
  const data = await parseResponse<ConversationSummary[] | { results: ConversationSummary[] }>(res)
  return Array.isArray(data) ? data : data.results ?? []
}

export async function getConversation(id: number): Promise<ConversationDetail> {
  const res = await fetch(`${CONTROLE_BASE_URL}/messaging/conversations/${id}/`, {
    headers: getPlatformAuthHeaders(),
  })
  return parseResponse<ConversationDetail>(res)
}

export async function replyToConversation(id: number, text: string): Promise<ConversationMessage> {
  const res = await fetch(`${CONTROLE_BASE_URL}/messaging/conversations/${id}/reply/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getPlatformAuthHeaders() },
    body: JSON.stringify({ text }),
  })
  return parseResponse<ConversationMessage>(res)
}

export async function deleteConversation(id: number): Promise<void> {
  const res = await fetch(`${CONTROLE_BASE_URL}/messaging/conversations/${id}/`, {
    method: 'DELETE',
    headers: getPlatformAuthHeaders(),
  })
  await parseResponse<void>(res)
}

export async function bulkDeleteConversations(ids: number[]): Promise<{ deleted: number }> {
  const res = await fetch(`${CONTROLE_BASE_URL}/messaging/conversations/bulk-delete/`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...getPlatformAuthHeaders() },
    body: JSON.stringify({ ids }),
  })
  return parseResponse<{ deleted: number }>(res)
}

export async function deleteMessage(id: number): Promise<void> {
  const res = await fetch(`${CONTROLE_BASE_URL}/messaging/messages/${id}/`, {
    method: 'DELETE',
    headers: getPlatformAuthHeaders(),
  })
  await parseResponse<void>(res)
}

export async function getUnreadCount(scope?: 'global', instanceCode?: string): Promise<number> {
  const params = new URLSearchParams()
  if (scope) params.set('scope', scope)
  if (instanceCode) params.set('instance', instanceCode)
  const query = params.toString() ? `?${params.toString()}` : ''
  const res = await fetch(`${CONTROLE_BASE_URL}/messaging/unread-count/${query}`, {
    headers: getPlatformAuthHeaders(),
  })
  const data = await parseResponse<{ unread_count: number }>(res)
  return data.unread_count
}

/** URL + headers pour ouvrir une connexion EventSource (SSE) sur la page
 * Messagerie ouverte — `EventSource` natif ne permet pas de headers
 * personnalisés, le token est donc passé en query string (même convention
 * que les WebSockets, voir useWebSockets.ts). */
export function getMessagingStreamUrl(): string {
  const headers = getPlatformAuthHeaders()
  const token = headers.Authorization?.replace('Bearer ', '') ?? ''
  return `${CONTROLE_BASE_URL}/messaging/stream/?token=${encodeURIComponent(token)}`
}
