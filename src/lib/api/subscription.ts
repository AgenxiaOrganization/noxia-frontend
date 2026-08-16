import { get, post, put, patch, del } from '@/lib/api'
import type { ApiClient } from '../superAdminClient'

export interface PlanFeature {
  key: string | null
  label: string
  description: string
  included: boolean
}

export interface FeatureRegistryEntry {
  key: string
  label: string
  description: string
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
  trial_days: number
  period_label: string
  is_free: boolean
  is_featured: boolean
  badge_label: string
  cta_label: string
  display_order: number
  features: PlanFeature[]
}

export interface Subscription {
  id: number
  plan: Plan
  status: 'trialing' | 'active' | 'expired' | 'canceled'
  trial_end: string | null
  current_period_end: string | null
  payment_reference: string
  created_at: string
}

export type PvitMethod = 'AIRTEL_MONEY' | 'MOOV_MONEY' | 'VISA_MASTERCARD'

export interface PvitTransaction {
  id: number
  merchant_reference: string
  pvit_transaction_id: string
  plan_name: string
  method: PvitMethod
  method_display: string
  amount: string
  fees: string | null
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
    initiatePvitPayment: (planCode: Plan['code'], method: PvitMethod, customerAccountNumber = '') =>
      client.post<PvitTransaction>('/subscriptions/mypvit/initiate/', {
        plan_code: planCode, method, customer_account_number: customerAccountNumber,
      }),

    /** GET /subscriptions/mypvit/transactions/{reference}/ — statut courant
     * d'une transaction MyPVit, pour le polling cote frontend. */
    getPvitTransactionStatus: (reference: string) =>
      client.get<PvitTransaction>(`/subscriptions/mypvit/transactions/${encodeURIComponent(reference)}/`),
  }
}

const defaultSubscriptionApi = createSubscriptionApi({ get, post, put, patch, del })

export const {
  getMySubscription, subscribeToPlan, initiatePvitPayment, getPvitTransactionStatus,
} = defaultSubscriptionApi
