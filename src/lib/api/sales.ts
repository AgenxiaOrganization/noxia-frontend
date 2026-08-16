import { get, post, put, patch, del } from '../api'
import type { ApiClient } from '../superAdminClient'
import { getAuthHeaders } from '../auth'

export interface CashRegister {
  id: number
  name: string
  is_active: boolean
}

export interface SaleItem {
  id?: number
  product: number
  product_name?: string
  product_category?: string
  quantity: string
  unit_price: string
  subtotal?: string
}

export interface Sale {
  id: number
  cash_register: number
  cash_register_name?: string
  cashier: number
  cashier_name?: string
  status: 'open' | 'paid' | 'cancelled'
  payment_method: 'cash' | 'mobile_money' | 'card' | 'other'
  total_amount: string
  items: SaleItem[]
  created_at?: string
  updated_at?: string
}

/**
 * Voir `catalog.ts` : meme principe d'injection de client, pour que
 * `super-admin` reutilise cette logique sans la dupliquer.
 */
export function createSalesApi(client: ApiClient) {
  return {
    // Cash Registers
    getCashRegisters: () => client.get<CashRegister[]>('/sales/cash-registers/'),
    createCashRegister: (data: Partial<CashRegister>) => client.post<CashRegister>('/sales/cash-registers/', data),
    updateCashRegister: (id: number, data: Partial<CashRegister>) => client.put<CashRegister>(`/sales/cash-registers/${id}/`, data as any),
    deleteCashRegister: (id: number) => client.del<void>(`/sales/cash-registers/${id}/`),

    // Sales
    getSales: async (): Promise<Sale[]> => {
      const res = await client.get<{ results: Sale[] } | Sale[]>('/sales/')
      return Array.isArray(res) ? res : res.results ?? []
    },
    createSale: (data: Partial<Sale>) => client.post<Sale>('/sales/', data as any),
    updateSale: (id: number, data: Partial<Sale>) => client.put<Sale>(`/sales/${id}/`, data as any),
    deleteSale: (id: number) => client.del<void>(`/sales/${id}/`),
  }
}

const defaultSalesApi = createSalesApi({ get, post, put, patch, del })

export const {
  getCashRegisters, createCashRegister, updateCashRegister, deleteCashRegister,
  getSales, createSale, updateSale, deleteSale,
} = defaultSalesApi

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api/v1'

async function downloadBlob(url: string, headers: Record<string, string>, filename: string, errorMessage: string): Promise<void> {
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(errorMessage)
  const blob = await res.blob()
  const objUrl = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(objUrl)
}

/**
 * Telechargements binaires (PDF/Excel) : pas de client ApiClient ici (parse
 * toujours en JSON), donc URL + headers explicites. `target` permet a
 * super-admin de cibler le proxy (voir superAdminClient.getProxyDownloadTarget)
 * au lieu de l'instance directe, sans dupliquer cette logique.
 */
export async function downloadSalesReportPDF(period: string = 'semaine', target?: { url: string; headers: Record<string, string> }): Promise<void> {
  await downloadBlob(
    target?.url ?? `${BASE_URL}/sales/reports/pdf/?period=${encodeURIComponent(period)}`,
    target?.headers ?? getAuthHeaders(),
    `rapport_ventes_${period}.pdf`,
    'Échec du téléchargement du rapport de ventes PDF.',
  )
}

export async function downloadSalesReportExcel(period: string = 'semaine', target?: { url: string; headers: Record<string, string> }): Promise<void> {
  await downloadBlob(
    target?.url ?? `${BASE_URL}/sales/reports/excel/?period=${encodeURIComponent(period)}`,
    target?.headers ?? getAuthHeaders(),
    `rapport_ventes_${period}.xlsx`,
    'Échec du téléchargement du rapport de ventes Excel.',
  )
}
