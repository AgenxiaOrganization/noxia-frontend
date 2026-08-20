import { get, post, put, patch, del } from '../api'
import { getAuthHeaders } from '../auth'
import type { ApiClient } from '../superAdminClient'

export interface AIContentLogItem {
  id: number
  company: number
  user: number | null
  user_email: string | null
  session_id: string
  source: 'dashboard' | 'landing'
  model_name: string
  prompt: string
  response: string
  ip_address?: string
  created_at: string
}

export interface AIContentLogResponse {
  count?: number
  results?: AIContentLogItem[]
}

/**
 * Journal des contenus generes par l'assistant IA (Art. 32/53, Ordonnance
 * n°0011/PR/2026, Gabon) — meme principe d'injection de client que
 * `audit.ts`, pour que `super-admin` reutilise cette logique sans dupliquer.
 */
export function createAIContentLogApi(client: ApiClient) {
  return {
    getAIContentLogs: async (params?: { search?: string; source?: string }): Promise<AIContentLogItem[]> => {
      const queryParams = new URLSearchParams()
      if (params?.search) queryParams.append('search', params.search)
      if (params?.source && params.source !== 'all') queryParams.append('source', params.source)

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''
      const res = await client.get<any>(`/ai-content-logs/${queryString}`)
      if (res && Array.isArray(res.results)) return res.results
      if (Array.isArray(res)) return res
      return []
    },
  }
}

const defaultAIContentLogApi = createAIContentLogApi({ get, post, put, patch, del })

export const { getAIContentLogs } = defaultAIContentLogApi

export const downloadAIContentLogsExcel = async (params?: {
  search?: string
  source?: string
}): Promise<void> => {
  const queryParams = new URLSearchParams()
  if (params?.search) queryParams.append('search', params.search)
  if (params?.source && params.source !== 'all') queryParams.append('source', params.source)

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''

  const response = await fetch(`/api/v1/ai-content-logs/export-excel/${queryString}`, {
    headers: getAuthHeaders()
  })

  if (!response.ok) {
    throw new Error('Erreur lors de la génération du rapport Excel.')
  }

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `NOXIA_Journal_IA_${new Date().toISOString().slice(0, 10)}.xlsx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
