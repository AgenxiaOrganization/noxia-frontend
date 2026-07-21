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
export const getSales = () => get<Sale[]>('/sales/sales/')
export const createSale = (data: Partial<Sale>) => post<Sale>('/sales/sales/', data)
export const updateSale = (id: number, data: Partial<Sale>) => put<Sale>(`/sales/sales/${id}/`, data)
export const deleteSale = (id: number) => del<void>(`/sales/sales/${id}/`)
