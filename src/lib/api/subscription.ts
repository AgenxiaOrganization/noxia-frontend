import { get, post, put, patch, del } from '@/lib/api'
import { getAuthHeaders } from '@/lib/auth'
import type { ApiClient } from '../superAdminClient'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api/v1'

export interface PlanFeature {
  key: string | null
  label: string
  description: string
  category: string
  included: boolean
}

export interface FeatureRegistryEntry {
  key: string
  label: string
  description: string
  category: string
}

export interface Plan {
  id: number
  code: string
  name: string
  description: string
  price: string
  original_price: string | null
  discount_ends_at: string | null
  has_active_discount: boolean
  yearly_price: string | null
  yearly_discount_percent: number
  trial_days: number
  period_label: string
  is_free: boolean
  is_featured: boolean
  badge_label: string
  cta_label: string
  display_order: number
  features: PlanFeature[]
  max_employees: number
  max_cash_registers: number
}

export interface Subscription {
  id: number
  plan: Plan
  status: 'trialing' | 'active' | 'expired' | 'canceled'
  trial_end: string | null
  current_period_end: string | null
  payment_reference: string
  created_at: string
  /** A deja beneficie de l'essai gratuit une fois (voir start_trial cote
   * backend) — ne redevient jamais false, sert a interdire un retour a
   * l'essai apres une annulation ou une expiration. */
  has_trialed: boolean
}

export type PvitMethod = 'AIRTEL_MONEY' | 'MOOV_MONEY' | 'VISA_MASTERCARD'
export type BillingPeriod = 'monthly' | 'yearly'

export interface PvitTransaction {
  id: number
  merchant_reference: string
  pvit_transaction_id: string
  plan_name: string
  method: PvitMethod
  method_display: string
  amount: string
  fees: string | null
  billing_period: BillingPeriod
  status: 'pending' | 'success' | 'failed' | 'ambiguous'
  status_display: string
  failure_reason: string
  /** Formulaire bancaire PVit — non-vide uniquement pour VISA_MASTERCARD ;
   * le frontend doit y rediriger le client plutot que de sonder le statut. */
  redirect_url: string
  created_at: string
  confirmed_at: string | null
}

/** GET /subscriptions/plans/ — public, utilise par la page tarifs. */
export function getPlans(): Promise<Plan[]> {
  return get<Plan[]>('/subscriptions/plans/')
}

/** GET /subscriptions/features/public/ — public, utilise par le comparatif
 * de fonctionnalites de la landing (aucune donnee sensible, juste label/
 * description de chaque fonctionnalite du registre). */
export function getFeatureRegistry(): Promise<FeatureRegistryEntry[]> {
  return get<FeatureRegistryEntry[]>('/subscriptions/features/public/')
}

/**
 * Meme principe d'injection de client que `companies.ts`/`catalog.ts` : le
 * super-admin reutilise ces fonctions via `createSuperAdminClient(instanceCode,
 * companyId)` (le proxy relaie `?company_id=` et `get_user_company()` cote
 * noxia-backend lit `proxied_company` en priorite, voir
 * companies/authentication.py) sans dupliquer la logique pour un gerant normal.
 */
export function createSubscriptionApi(client: ApiClient) {
  return {
    /** GET /subscriptions/me/ — reste accessible meme abonnement expire (voir
     * companies.permissions.SubscriptionExpiredError, bypass_subscription_check). */
    getMySubscription: () => client.get<Subscription>('/subscriptions/me/'),

    /** POST /subscriptions/subscribe/ — stub Phase 1, aucun paiement reel
     * n'est effectue ; active immediatement le plan choisi pour 30 jours. */
    subscribeToPlan: (planCode: Plan['code'], paymentReference = '') =>
      client.post<Subscription>('/subscriptions/subscribe/', { plan_code: planCode, payment_reference: paymentReference }),

    /** POST /subscriptions/mypvit/initiate/ — initie un paiement reel
     * (Airtel Money, Moov Money, Visa/Mastercard) via MyPVit. Renvoie une
     * transaction PENDING ; le statut definitif arrive par webhook, donc il
     * faut ensuite sonder getPvitTransactionStatus jusqu'a success/failed. */
    initiatePvitPayment: (
      planCode: Plan['code'], method: PvitMethod, customerAccountNumber = '',
      billingPeriod: BillingPeriod = 'monthly',
    ) =>
      client.post<PvitTransaction>('/subscriptions/mypvit/initiate/', {
        plan_code: planCode, method, customer_account_number: customerAccountNumber,
        billing_period: billingPeriod,
      }),

    /** GET /subscriptions/mypvit/transactions/{reference}/ — statut courant
     * d'une transaction MyPVit, pour le polling cote frontend. */
    getPvitTransactionStatus: (reference: string) =>
      client.get<PvitTransaction>(`/subscriptions/mypvit/transactions/${encodeURIComponent(reference)}/`),

    /** GET /subscriptions/mypvit/transactions/ — historique des transactions
     * de l'entreprise (masquees exclues, voir hideTransaction). */
    listMyTransactions: () =>
      client.get<PvitTransaction[]>('/subscriptions/mypvit/transactions/'),

    /** DELETE /subscriptions/mypvit/transactions/{reference}/hide/ —
     * suppression LOGIQUE d'une entree de l'historique visible du gerant
     * (jamais un vrai DELETE en base, refuse sur une transaction PENDING). */
    hideTransaction: (reference: string) =>
      client.del<void>(`/subscriptions/mypvit/transactions/${encodeURIComponent(reference)}/hide/`),

    /** POST /subscriptions/cancel/ — annule l'abonnement courant : bloque
     * immediatement l'acces a tous les services (comme une expiration), sans
     * remboursement de la duree en cours. Reversible uniquement en
     * re-souscrivant a un plan (gratuit si jamais utilise, payant sinon). */
    cancelSubscription: () =>
      client.post<Subscription>('/subscriptions/cancel/', {}),
  }
}

const defaultSubscriptionApi = createSubscriptionApi({ get, post, put, patch, del })

export const {
  getMySubscription, subscribeToPlan, initiatePvitPayment, getPvitTransactionStatus,
  listMyTransactions, hideTransaction, cancelSubscription,
} = defaultSubscriptionApi

/** Telecharge la facture PDF d'une transaction reussie — meme pattern que
 * downloadPayslipPDF (lib/api/finance.ts) : le endpoint exige un JWT (header
 * Authorization), donc un simple <a href> ne fonctionnerait pas ; on
 * recupere le blob nous-memes puis on declenche le telechargement. */
export async function downloadTransactionInvoicePdf(reference: string, filename?: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/subscriptions/mypvit/transactions/${encodeURIComponent(reference)}/pdf/`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error('Échec du téléchargement de la facture PDF.')
  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename ?? `facture_abonnement_${reference}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}
