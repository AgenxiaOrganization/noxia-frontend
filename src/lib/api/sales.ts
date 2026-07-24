import { get, post, put, del } from '../api'

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

// Cash Registers
export const getCashRegisters = () => get<CashRegister[]>('/sales/cash-registers/')
export const createCashRegister = (data: Partial<CashRegister>) => post<CashRegister>('/sales/cash-registers/', data)
export const updateCashRegister = (id: number, data: Partial<CashRegister>) => put<CashRegister>(`/sales/cash-registers/${id}/`, data)
export const deleteCashRegister = (id: number) => del<void>(`/sales/cash-registers/${id}/`)

// Sales
export const getSales = async (): Promise<Sale[]> => {
  const res = await get<{ results: Sale[] } | Sale[]>('/sales/')
  return Array.isArray(res) ? res : res.results ?? []
}
export const createSale = (data: Partial<Sale>) => post<Sale>('/sales/', data)
export const updateSale = (id: number, data: Partial<Sale>) => put<Sale>(`/sales/${id}/`, data)
export const deleteSale = (id: number) => del<void>(`/sales/${id}/`)

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api/v1'
import { getAuthHeaders } from '../auth'

export async function downloadSalesReportPDF(period: string = 'semaine'): Promise<void> {
  const res = await fetch(`${BASE_URL}/sales/reports/pdf/?period=${encodeURIComponent(period)}`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error("Échec du téléchargement du rapport de ventes PDF.")
  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `rapport_ventes_${period}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}

export async function downloadSalesReportExcel(period: string = 'semaine'): Promise<void> {
  const res = await fetch(`${BASE_URL}/sales/reports/excel/?period=${encodeURIComponent(period)}`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error("Échec du téléchargement du rapport de ventes Excel.")
  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `rapport_ventes_${period}.xlsx`
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}

