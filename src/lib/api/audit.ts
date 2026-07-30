import { get, post } from '../api'
import { getAuthHeaders } from '../auth'

export interface AuditLogItem {
  id: number
  company: number
  user: number | null
  user_email: string
  user_name: string
  user_role: string
  method: string
  path: string
  action: string
  status_code: number
  ip_address?: string
  details?: Record<string, any>
  created_at: string
}

export interface AuditLogResponse {
  count?: number
  results?: AuditLogItem[]
}

export const getAuditLogs = async (params?: {
  search?: string
  method?: string
  status_code?: string | number
}): Promise<AuditLogItem[]> => {
  const queryParams = new URLSearchParams()
  if (params?.search) queryParams.append('search', params.search)
  if (params?.method && params.method !== 'all') queryParams.append('method', params.method)
  if (params?.status_code && params.status_code !== 'all') queryParams.append('status_code', String(params.status_code))

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''
  const res = await get<any>(`/audit-logs/${queryString}`)
  if (res && Array.isArray(res.results)) {
    return res.results
  } else if (Array.isArray(res)) {
    return res
  }
  return []
}

export const clearAuditLogs = async (): Promise<{ detail: string }> => {
  return post<{ detail: string }>('/audit-logs/clear/', {})
}

export const downloadAuditLogsExcel = async (params?: {
  search?: string
  method?: string
  status_code?: string | number
}): Promise<void> => {
  const queryParams = new URLSearchParams()
  if (params?.search) queryParams.append('search', params.search)
  if (params?.method && params.method !== 'all') queryParams.append('method', params.method)
  if (params?.status_code && params.status_code !== 'all') queryParams.append('status_code', String(params.status_code))

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''

  const response = await fetch(`/api/v1/audit-logs/export-excel/${queryString}`, {
    headers: getAuthHeaders()
  })

  if (!response.ok) {
    throw new Error('Erreur lors de la génération du rapport Excel.')
  }

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `NOXIA_Logs_Audit_${new Date().toISOString().slice(0, 10)}.xlsx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
