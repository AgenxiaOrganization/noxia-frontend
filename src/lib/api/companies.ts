import { get, post, put, patch, del } from '../api'
import { getAuthHeaders } from '../auth'
import { getPlatformAuthHeaders } from '../platformAuth'
import type { ApiClient } from '../superAdminClient'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api/v1'
const CONTROLE_BASE_URL = process.env.NEXT_PUBLIC_CONTROLE_API_URL ?? 'http://127.0.0.1:8001/api/v1'

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
  base_salary?: number
  commission_rate?: number
  activation_code?: string | null
  phone?: string
  password?: string
  activation_code_expires_at?: string | null
  is_activation_code_expired?: boolean
  bot_sessions?: BotSession[]
  photo_profile?: string | null
}

/** Reflete VerificationDocumentSerializer (companies/serializers.py) —
 * `file` est l'URL du fichier stocke (R2 signee en prod, /media/ en local). */
export interface VerificationDocument {
  id: number
  document_type: string
  document_type_display: string
  file: string
  status: 'pending' | 'approved' | 'rejected'
  status_display: string
  rejection_reason: string
  created_at: string
  reviewed_at: string | null
}

/**
 * Voir `catalog.ts` : meme principe d'injection de client, pour que
 * `super-admin` reutilise cette logique sans la dupliquer.
 */
export function createCompaniesApi(client: ApiClient) {
  return {
    // Employees
    getEmployees: () => client.get<Employee[]>('/companies/employees/'),
    createEmployee: (data: Partial<Employee>) => client.post<Employee>('/companies/employees/', data),
    updateEmployee: (id: number, data: Partial<Employee>) => client.put<Employee>(`/companies/employees/${id}/`, data),
    patchEmployee: (id: number, data: Partial<Employee>) => client.patch<Employee>(`/companies/employees/${id}/`, data),
    regenerateEmployeeCode: (id: number, validityHours?: number) => client.post<Employee>(`/companies/employees/${id}/regenerate-code/`, { activation_validity_hours: validityHours || 720 }),
    sendEmployeeCode: (id: number) => client.post<{ detail: string }>(`/companies/employees/${id}/send-code/`, {}),
    deleteEmployee: (id: number) => client.del<void>(`/companies/employees/${id}/`),

    // Bot Sessions
    getBotSessions: () => client.get<BotSession[]>('/companies/bot-sessions/'),
    deleteBotSession: (id: number) => client.del<void>(`/companies/bot-sessions/${id}/`),

    // Documents
    getVerificationDocuments: () => client.get<VerificationDocument[]>('/companies/me/documents/'),
    deleteVerificationDocument: (id: number) => client.del<void>(`/companies/me/documents/${id}/`),

    // Company Profile/Configuration
    getCompanyMe: () => client.get<any>('/companies/me/'),
    updateCompanyMe: (data: any) => client.patch<any>('/companies/me/', data),
  }
}

const defaultCompaniesApi = createCompaniesApi({ get, post, put, patch, del })

export const {
  getEmployees, createEmployee, updateEmployee, patchEmployee, regenerateEmployeeCode, sendEmployeeCode, deleteEmployee,
  getBotSessions, deleteBotSession,
  getVerificationDocuments, deleteVerificationDocument,
  getCompanyMe, updateCompanyMe,
} = defaultCompaniesApi

/**
 * Upload multipart (VerificationDocumentViewSet exige `MultiPartParser`,
 * incompatible avec le client JSON `ApiClient` ci-dessus) — jamais fixer de
 * `Content-Type` a la main : le navigateur genere le boundary correct pour
 * `FormData` tout seul. Deux variantes : gerant normal (JWT direct sur
 * l'instance) et super-admin (relaye par le proxy de Noxia Controle avec
 * `?company_id=`, meme mecanisme que `createSuperAdminClient`).
 */
export async function uploadVerificationDocument(
  documentType: string, file: File,
): Promise<VerificationDocument> {
  const formData = new FormData()
  formData.append('document_type', documentType)
  formData.append('file', file)
  const res = await fetch(`${API_BASE_URL}/companies/me/documents/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(extractDocumentErrorMessage(data))
  }
  return res.json()
}

export async function uploadInstanceVerificationDocument(
  instanceCode: string, companyId: number, documentType: string, file: File,
): Promise<VerificationDocument> {
  const formData = new FormData()
  formData.append('document_type', documentType)
  formData.append('file', file)
  const res = await fetch(
    `${CONTROLE_BASE_URL}/proxy/${instanceCode}/companies/me/documents/?company_id=${companyId}`,
    { method: 'POST', headers: getPlatformAuthHeaders(), body: formData },
  )
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(extractDocumentErrorMessage(data))
  }
  return res.json()
}

function extractDocumentErrorMessage(data: unknown): string {
  if (!data || typeof data !== 'object') return "Erreur lors de l'envoi du document."
  const obj = data as Record<string, unknown>
  if (typeof obj.detail === 'string') return obj.detail
  const firstValue = Object.values(obj)[0]
  const firstMessage = Array.isArray(firstValue) ? firstValue[0] : firstValue
  return typeof firstMessage === 'string' ? firstMessage : "Erreur lors de l'envoi du document."
}

/**
 * Upload/remplacement de la photo de profil d'un employe — multipart
 * (ImageField cote backend), meme principe que uploadVerificationDocument.
 * Reservee a l'administrateur qui gere les employes (EmployeeViewSet,
 * `permission_module = 'employes'`), pas a l'employe lui-meme.
 */
export async function uploadEmployeePhoto(employeeId: number, file: File): Promise<Employee> {
  const formData = new FormData()
  formData.append('photo_profile', file)
  const res = await fetch(`${API_BASE_URL}/companies/employees/${employeeId}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: formData,
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(extractDocumentErrorMessage(data))
  }
  return res.json()
}

/**
 * Upload/remplacement du logo de l'etablissement — multipart (ImageField
 * cote backend, stocke dans R2 sous {etablissement}/logo/, voir
 * companies/storage.py::company_logo_path), meme principe que
 * uploadEmployeePhoto mais sur /companies/me/.
 */
export async function uploadCompanyLogo(file: File): Promise<any> {
  const formData = new FormData()
  formData.append('logo', file)
  const res = await fetch(`${API_BASE_URL}/companies/me/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: formData,
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(extractDocumentErrorMessage(data))
  }
  return res.json()
}

export async function uploadInstanceEmployeePhoto(
  instanceCode: string, companyId: number, employeeId: number, file: File,
): Promise<Employee> {
  const formData = new FormData()
  formData.append('photo_profile', file)
  const res = await fetch(
    `${CONTROLE_BASE_URL}/proxy/${instanceCode}/companies/employees/${employeeId}/?company_id=${companyId}`,
    { method: 'PATCH', headers: getPlatformAuthHeaders(), body: formData },
  )
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(extractDocumentErrorMessage(data))
  }
  return res.json()
}
