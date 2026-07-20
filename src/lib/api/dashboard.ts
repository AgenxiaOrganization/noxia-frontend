import { get } from '@/lib/api'

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

export async function getDashboardStats(period: 'day' | 'week' | 'month' | 'year'): Promise<DashboardStats> {
  return get<DashboardStats>(`/sales/dashboard/?period=${period}`)
}
