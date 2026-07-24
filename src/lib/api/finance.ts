import { get, post, put, del } from '../api'
import { getAuthHeaders } from '../auth'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api/v1'

export interface Expense {
  id: number
  company: number
  title: string
  category: string
  category_display: string
  amount: number | string
  date: string
  payment_method: string
  payment_method_display: string
  description: string
  created_by?: number
  created_at?: string
}

export interface PayrollRecord {
  id: number
  company: number
  employee: number
  employee_id?: number
  employee_detail?: {
    id: number
    email: string
    first_name: string
    last_name: string
    phone: string
  }
  month: string
  base_salary: number | string
  prime: number | string
  commission_rate: number | string
  commission_amount: number | string
  deductions: number | string
  net_salary: number | string
  status: 'draft' | 'paid'
  status_display: string
  paid_at?: string
  created_at?: string
}

export interface FinancialSummary {
  period: string
  total_revenue: number | string
  total_expenses: number | string
  net_profit: number | string
  margin_percentage: number | string
  total_payroll: number | string
  tva_rate: number | string
  tva_collected: number | string
  tva_deductible: number | string
  net_tva_payable: number | string
  revenue_by_category: Record<string, string | number>
  expenses_by_category: Record<string, string | number>
}

export interface ExpenseCreatePayload {
  title: string
  category: string
  amount: number
  date: string
  payment_method?: string
  description?: string
}

export interface PayrollCreatePayload {
  employee_id: number
  month: string
  base_salary: number
  prime?: number
  commission_rate?: number
  deductions?: number
  status?: 'draft' | 'paid'
}

export async function getFinancialSummary(month?: string): Promise<FinancialSummary> {
  const query = month ? `?month=${month}` : ''
  return get<FinancialSummary>(`/finance/summary/${query}`)
}

export async function getExpenses(month?: string): Promise<Expense[]> {
  const query = month ? `?month=${month}` : ''
  const res = await get<{ results: Expense[] } | Expense[]>(`/finance/expenses/${query}`)
  return Array.isArray(res) ? res : res.results ?? []
}

export async function createExpense(payload: ExpenseCreatePayload): Promise<Expense> {
  return post<Expense>('/finance/expenses/', payload as unknown as Record<string, unknown>)
}

export async function updateExpense(id: number, payload: Partial<ExpenseCreatePayload>): Promise<Expense> {
  return put<Expense>(`/finance/expenses/${id}/`, payload as unknown as Record<string, unknown>)
}

export async function deleteExpense(id: number): Promise<void> {
  return del(`/finance/expenses/${id}/`)
}

export async function getPayrollRecords(month?: string): Promise<PayrollRecord[]> {
  const query = month ? `?month=${month}` : ''
  const res = await get<{ results: PayrollRecord[] } | PayrollRecord[]>(`/finance/payroll/${query}`)
  return Array.isArray(res) ? res : res.results ?? []
}

export async function createPayrollRecord(payload: PayrollCreatePayload): Promise<PayrollRecord> {
  return post<PayrollRecord>('/finance/payroll/', payload as unknown as Record<string, unknown>)
}

export async function updatePayrollRecord(id: number, payload: Partial<PayrollCreatePayload>): Promise<PayrollRecord> {
  return put<PayrollRecord>(`/finance/payroll/${id}/`, payload as unknown as Record<string, unknown>)
}

export async function downloadExportExcel(month?: string): Promise<void> {
  const query = month ? `?month=${month}` : ''
  const res = await fetch(`${BASE_URL}/finance/export/excel/${query}`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error("Échec du téléchargement de l'export Excel.")
  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `rapport_financier_${month ?? 'global'}.xlsx`
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}

export async function downloadPayslipPDF(payrollId: number, filename?: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/finance/payroll/${payrollId}/pdf/`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error("Échec du téléchargement de la fiche de paie PDF.")
  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename ?? `fiche_de_paie_${payrollId}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}

export async function downloadFinancialReportPDF(month?: string): Promise<void> {
  const query = month ? `?month=${month}` : ''
  const res = await fetch(`${BASE_URL}/finance/export/pdf/${query}`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error("Échec du téléchargement du rapport financier PDF.")
  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `rapport_financier_${month ?? 'global'}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}

