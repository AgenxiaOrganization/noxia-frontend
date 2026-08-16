import { get, post, put, patch, del } from '../api'
import type { ApiClient } from '../superAdminClient'

export interface Notification {
  id: number
  category: 'alert' | 'notification'
  type: 'stock_low' | 'stock_out' | 'bot_linked' | 'sub_change' | 'sub_expiry' | 'sub_reminder'
    | 'sale_completed' | 'doc_approved' | 'doc_rejected' | 'company_certified'
  title: string
  message: string
  link: string
  is_read: boolean
  created_at: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

/**
 * Voir `catalog.ts` : meme principe d'injection de client. Sert a la fois
 * les alertes et les notifications (memes endpoints, filtre `category`).
 */
export function createNotificationsApi(client: ApiClient) {
  return {
    getNotifications: (page = 1, category?: 'alert' | 'notification') => {
      const params = new URLSearchParams({ page: String(page) })
      if (category) params.set('category', category)
      return client.get<PaginatedResponse<Notification>>(`/notifications/?${params.toString()}`)
    },
    getUnreadCount: (category?: 'alert' | 'notification') => {
      const params = category ? `?category=${category}` : ''
      return client.get<{ count: number }>(`/notifications/unread-count/${params}`)
    },
    markAsRead: (id: number) => client.post<Notification>(`/notifications/${id}/read/`, {}),
    markAllAsRead: (category?: 'alert' | 'notification') => {
      const params = category ? `?category=${category}` : ''
      return client.post<{ detail: string }>(`/notifications/read-all/${params}`, {})
    },
    deleteNotification: (id: number) => client.del<void>(`/notifications/${id}/`),
  }
}

const defaultNotificationsApi = createNotificationsApi({ get, post, put, patch, del })

export const { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } = defaultNotificationsApi
