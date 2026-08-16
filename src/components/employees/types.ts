export interface EmployeeRow {
  id: number
  name: string
  role: string
  phone: string
  email: string
  salary: number
  commission: number
  active: boolean
  sales: number
  employeeId: string
  activation_code_expires_at?: string | null
  is_activation_code_expired?: boolean
  photo?: string | null
}

export const roleColors: Record<string, string> = {
  administrateur: '#6366f1',
  responsable: '#818cf8',
  gerant: '#22c55e',
  caissier: '#f59e0b',
  serveur: '#3b82f6',
  magasinier: '#8b5cf6',
  comptable: '#ec4899',
}

export const allRoles = ['administrateur', 'responsable', 'gerant', 'caissier', 'serveur', 'magasinier', 'comptable']
