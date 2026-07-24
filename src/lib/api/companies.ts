import { get, post, put, patch, del } from '../api'

export interface BotSession {
  id: number
  platform: 'whatsapp' | 'telegram'
  platform_display: string
  external_id: string
  external_username: string
  is_active: boolean
  linked_at: string
  employee_name: string
  employee_email: string
  employee_role: string
}

export interface EmployeeUser {
  id: number
  email: string
  first_name: string
  last_name: string
  phone?: string
}

export interface Employee {
  id: number
  user?: EmployeeUser
  user_id?: number
  first_name?: string
  last_name?: string
  email?: string
  role: 'administrateur' | 'gerant' | 'caissier' | 'serveur' | 'magasinier' | 'stock' | string
  is_active: boolean
  activation_code?: string | null
  phone?: string
  password?: string
  activation_code_expires_at?: string | null
  is_activation_code_expired?: boolean
  bot_sessions?: BotSession[]
}

export interface VerificationDocument {
  id: number
  document_type: string
  file_url: string
  status: string
  uploaded_at: string
}

// Employees
export const getEmployees = () => get<Employee[]>('/companies/employees/')
export const createEmployee = (data: Partial<Employee>) => post<Employee>('/companies/employees/', data)
export const updateEmployee = (id: number, data: Partial<Employee>) => put<Employee>(`/companies/employees/${id}/`, data)
export const patchEmployee = (id: number, data: Partial<Employee>) => patch<Employee>(`/companies/employees/${id}/`, data)
export const regenerateEmployeeCode = (id: number, validityHours?: number) => post<Employee>(`/companies/employees/${id}/regenerate-code/`, { activation_validity_hours: validityHours || 720 })
export const sendEmployeeCode = (id: number) => post<{ detail: string }>(`/companies/employees/${id}/send-code/`, {})
export const deleteEmployee = (id: number) => del<void>(`/companies/employees/${id}/`)

// Bot Sessions
export const getBotSessions = () => get<BotSession[]>('/companies/bot-sessions/')
export const deleteBotSession = (id: number) => del<void>(`/companies/bot-sessions/${id}/`)

// Documents
export const getVerificationDocuments = () => get<VerificationDocument[]>('/companies/me/documents/')

// Company Profile/Configuration
export const getCompanyMe = () => get<any>('/companies/me/')
export const updateCompanyMe = (data: any) => patch<any>('/companies/me/', data)
