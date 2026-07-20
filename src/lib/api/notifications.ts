import { get, post } from '../api'

// --- Types ---

export interface Notification {
  id: number
  category: 'alert' | 'notification'
  type: 'stock_low' | 'stock_out' | 'bot_linked' | 'sub_change' | 'sub_expiry' | 'sub_reminder'
  title: string
  message: string
  link: string
  is_read: boolean
  created_at: string
}

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// --- Endpoints ---

/** Récupère la liste paginée, filtrable par catégorie (alert ou notification) */
export const getNotifications = (page = 1, category?: 'alert' | 'notification') => {
  const params = new URLSearchParams({ page: String(page) })
  if (category) params.set('category', category)
  return get<PaginatedResponse<Notification>>(`/notifications/?${params.toString()}`)
}

/** Compteur de non-lues, filtrable par catégorie */
export const getUnreadCount = (category?: 'alert' | 'notification') => {
  const params = category ? `?category=${category}` : ''
  return get<{ count: number }>(`/notifications/unread-count/${params}`)
}

/** Marque une notification/alerte comme lue */
export const markAsRead = (id: number) =>
  post<Notification>(`/notifications/${id}/read/`, {})

/** Marque toutes comme lues, filtrable par catégorie */
export const markAllAsRead = (category?: 'alert' | 'notification') => {
  const params = category ? `?category=${category}` : ''
  return post<{ detail: string }>(`/notifications/read-all/${params}`, {})
}
