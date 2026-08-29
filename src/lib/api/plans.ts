/**
 * Client HTTP pour le CRUD du catalogue de plans d'abonnement d'une
 * INSTANCE precise (Plan vit desormais cote noxia-backend, pas dans
 * noxia-backoffice) — chaque instance/pays a sa propre offre commerciale
 * (prix, essais, promos adaptes au marche local). Les requetes passent par
 * le proxy applicatif de Noxia Controle comme `listInstanceCompaniesDetailed`
 * (superAdminClient.ts) : pas de `company_id`, ce catalogue n'est pas scope
 * par entreprise. Cote noxia-backend, `PlanAdminListCreateView`/
 * `PlanAdminDetailView` exigent `IsInstanceProxy`, et `ADMIN_FORBIDDEN_ROUTES`
 * (noxia-backoffice/proxy/permissions.py) bloque deja POST/PATCH/DELETE
 * `subscriptions/` pour un compte plateforme 'admin' — seul 'super_admin'
 * peut donc modifier ce catalogue.
 */

import { clearPlatformSession, getPlatformAuthHeaders } from '../platformAuth'

const CONTROLE_BASE_URL =
  process.env.NEXT_PUBLIC_CONTROLE_API_URL ?? 'http://127.0.0.1:8001/api/v1'

export class PlansApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly data: unknown,
  ) {
    super(message)
    this.name = 'PlansApiError'
  }
}

/** Forme LUE depuis l'API (GET) : `label`/`description` sont toujours
 * resolus par le backend, y compris pour les entrees a `key` connue (voir
 * subscriptions.models.Plan.resolved_features cote noxia-backend). */
export interface PlanFeature {
  key: string | null
  label: string
  description: string
  category: string
  included: boolean
}

/** Forme ENVOYEE a l'API (POST/PATCH) : seuls `key` (reference au registre)
 * ou `label` (entree decorative libre) + `included` comptent — label/
 * description resolus sont ignores par le backend en ecriture. */
export interface PlanFeatureInput {
  key?: string
  label?: string
  included: boolean
}

/** Une entree du registre de fonctionnalites (GET /subscriptions/features/)
 * — sert a peupler le selecteur du formulaire de plan. */
export interface FeatureRegistryEntry {
  key: string
  label: string
  description: string
  category: string
}

export interface InstancePlan {
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
  is_active: boolean
  features: PlanFeature[]
  /** 0 = illimité. Distinct de `features` (binaire) : une vraie limite
   * numérique n'a pas de sens comme simple {key, included}. */
  max_employees: number
  max_cash_registers: number
}

export interface PlanPayload {
  code: string
  name: string
  description?: string
  price: number
  original_price?: number | null
  discount_ends_at?: string | null
  yearly_price?: number | null
  yearly_discount_percent?: number
  trial_days?: number
  period_label?: string
  is_free?: boolean
  is_featured?: boolean
  badge_label?: string
  cta_label?: string
  display_order?: number
  is_active?: boolean
  features: PlanFeatureInput[]
  max_employees?: number
  max_cash_registers?: number
}

/**
 * DRF renvoie soit {detail: "..."} soit un objet d'erreurs par champ
 * {code: ["plan avec ce champ code existe deja."]} — on aplatit toujours
 * vers une phrase lisible, quel que soit le champ en cause.
 */
function extractErrorMessage(data: unknown): string {
  if (!data || typeof data !== 'object') return 'Une erreur est survenue.'
  const obj = data as Record<string, unknown>
  if (typeof obj.detail === 'string') return obj.detail

  const firstValue = Object.values(obj)[0]
  const firstMessage = Array.isArray(firstValue) ? firstValue[0] : firstValue
  return typeof firstMessage === 'string' ? firstMessage : 'Une erreur est survenue.'
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) return {} as T
  if (res.status === 401) {
    clearPlatformSession()
    throw new PlansApiError('Session expirée', 401, null)
  }

  const text = await res.text()
  const data = text ? JSON.parse(text) : {}

  if (!res.ok) {
    throw new PlansApiError(extractErrorMessage(data), res.status, data)
  }

  return data as T
}

function base(instanceCode: string) {
  return `${CONTROLE_BASE_URL}/proxy/${instanceCode}/subscriptions/plans/admin`
}

export async function listInstancePlans(instanceCode: string): Promise<InstancePlan[]> {
  const res = await fetch(`${base(instanceCode)}/`, { headers: getPlatformAuthHeaders() })
  return parseResponse<InstancePlan[]>(res)
}

/** Registre des fonctionnalites activables/desactivables par plan — chaque
 * instance a son propre registre backend (subscriptions.feature_registry),
 * donc scope comme le reste par instanceCode via le proxy. */
export async function listInstanceFeatureRegistry(instanceCode: string): Promise<FeatureRegistryEntry[]> {
  const res = await fetch(
    `${CONTROLE_BASE_URL}/proxy/${instanceCode}/subscriptions/features/`,
    { headers: getPlatformAuthHeaders() },
  )
  return parseResponse<FeatureRegistryEntry[]>(res)
}

export async function createInstancePlan(instanceCode: string, payload: PlanPayload): Promise<InstancePlan> {
  const res = await fetch(`${base(instanceCode)}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getPlatformAuthHeaders() },
    body: JSON.stringify(payload),
  })
  return parseResponse<InstancePlan>(res)
}

export async function updateInstancePlan(
  instanceCode: string, id: number, payload: Partial<PlanPayload>,
): Promise<InstancePlan> {
  const res = await fetch(`${base(instanceCode)}/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getPlatformAuthHeaders() },
    body: JSON.stringify(payload),
  })
  return parseResponse<InstancePlan>(res)
}

export async function deleteInstancePlan(instanceCode: string, id: number): Promise<void> {
  const res = await fetch(`${base(instanceCode)}/${id}/`, {
    method: 'DELETE',
    headers: getPlatformAuthHeaders(),
  })
  await parseResponse<void>(res)
}
