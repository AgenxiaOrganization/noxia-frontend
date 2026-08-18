/**
 * Client HTTP dédié à Noxia Contrôle (back-office central, port 8001 en
 * local) — séparé de `api.ts` qui cible chaque instance métier. Gestion 401
 * simple (pas de refresh silencieux : le système n'a qu'un access_token
 * 24h, contrairement au flux client de `api.ts`).
 */

import { clearPlatformSession, getPlatformAuthHeaders, type PlatformLoginResponse } from './platformAuth'

const CONTROLE_BASE_URL =
  process.env.NEXT_PUBLIC_CONTROLE_API_URL ?? 'http://127.0.0.1:8001/api/v1'

export class ControleApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly data: unknown,
  ) {
    super(message)
    this.name = 'ControleApiError'
  }
}

export interface ExpiredTrial {
  company_id: number
  company_name: string
  owner_email: string
  owner_phone: string
  trial_end: string
  days_overdue: number
  status: 'expired' | 'expiring_soon'
  manual_reminder_count: number
  instance_code: string
  instance_name: string
}

export interface DashboardStats {
  totalCompanies: number
  activeCompanies: number
  totalUsers: number
  mrr: number
  totalRevenue: number
  revenueChange: number
  conversionRate: number
  activationRate: number
  activeCompaniesWithOrders: number
  monthlyOrders: number
  monthlyOrdersChange: number
  commission: number
  commissionRate: number
  monthlyRevenue: number
  planDistribution: {
    essai: number
    decouverte: number
    business: number
    pro: number
  }
  countryDistribution: Record<string, number>
  serversStats: {
    id: string
    name: string
    companies: number
    users: number
    revenue: number
  }[]
  expiredTrials: ExpiredTrial[]
}

export async function platformLogin(
  email: string,
  password: string,
): Promise<PlatformLoginResponse> {
  const res = await fetch(`${CONTROLE_BASE_URL}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new ControleApiError(data.detail ?? 'Erreur de connexion', res.status, data)
  }
  return data as PlatformLoginResponse
}

export async function platformForgotPassword(email: string): Promise<{ detail: string }> {
  const res = await fetch(`${CONTROLE_BASE_URL}/auth/forgot-password/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new ControleApiError(data.detail ?? 'Erreur lors de la demande.', res.status, data)
  }
  return data as { detail: string }
}

export async function platformResetPassword(
  token: string,
  newPassword: string,
): Promise<{ detail: string }> {
  const res = await fetch(`${CONTROLE_BASE_URL}/auth/reset-password/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, new_password: newPassword }),
  })
  const data = await res.json()
  if (!res.ok) {
    const message =
      data.detail ?? data.new_password?.[0] ?? 'Lien de réinitialisation invalide ou expiré.'
    throw new ControleApiError(message, res.status, data)
  }
  return data as { detail: string }
}

export async function fetchControleDashboard(): Promise<DashboardStats> {
  const res = await fetch(`${CONTROLE_BASE_URL}/dashboard/`, {
    headers: getPlatformAuthHeaders(),
  })
  if (res.status === 401) {
    clearPlatformSession()
    throw new ControleApiError('Session expirée', 401, null)
  }
  const data = await res.json()
  if (!res.ok) {
    throw new ControleApiError('Erreur de chargement du tableau de bord', res.status, data)
  }
  return data as DashboardStats
}
