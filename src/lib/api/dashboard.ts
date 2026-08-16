import { get, post, put, patch, del } from '@/lib/api'
import type { ApiClient } from '@/lib/superAdminClient'

export interface DashboardStats {
  revenue: number
  sales_count: number
  low_stock_count: number
  active_employees: number
  recent_transactions: {
    cashier: string
    amount: string | number
    date: string
    method: string
  }[]
  sales_chart: {
    label: string
    value: string | number
  }[]
  top_product: {
    name: string
    quantity: string | number
  } | null
  stock_alerts: {
    product_name: string
    quantity: string | number
    threshold: string | number
  }[]
}

/**
 * Voir `catalog.ts` : meme principe d'injection de client, pour que
 * `super-admin` reutilise ce dashboard (via le proxy) sans le dupliquer.
 */
export function createDashboardApi(client: ApiClient) {
  return {
    getDashboardStats: (period: 'day' | 'week' | 'month' | 'year') =>
      client.get<DashboardStats>(`/sales/dashboard/?period=${period}`),
  }
}

const defaultDashboardApi = createDashboardApi({ get, post, put, patch, del })

export const { getDashboardStats } = defaultDashboardApi
