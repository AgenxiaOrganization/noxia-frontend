// Données publiques de la landing, lues CÔTÉ SERVEUR (composant serveur) :
// les tarifs et les établissements arrivent dans le HTML, sans requête du
// navigateur ni attente au chargement, et restent lisibles par Google.
// Mises en cache 5 minutes (revalidation Next.js) : une modification de plan
// par le super-admin apparaît sur la landing en 5 minutes au plus.
// Module serveur uniquement (importé par src/app/page.tsx).
import type { FeatureRegistryEntry, Plan } from '@/lib/api/subscription'

// API_INTERNAL_URL (facultatif) : adresse du backend vue depuis le serveur
// Next.js ; sinon l'adresse publique, déjà utilisée par le navigateur.
const API_URL =
  process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api/v1'

const REVALIDATE_SECONDS = 300
const TIMEOUT_MS = 4000

export type ShowcaseCompany = {
  id: number
  name: string
  type: string
  type_display: string
  country: string
  logo: string | null
  client_since_year: number
  verified: boolean
  verification_code: string | null
}

export type Showcase = { total_companies: number; results: ShowcaseCompany[] }

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    // Backend injoignable (build hors ligne, redémarrage) : la page s'affiche
    // quand même ; les tarifs sont alors chargés par le navigateur.
    return null
  }
}

export async function getLandingData() {
  const [plans, registry, showcase] = await Promise.all([
    getJson<Plan[]>('/subscriptions/plans/'),
    getJson<FeatureRegistryEntry[]>('/subscriptions/features/public/'),
    getJson<Showcase>('/companies/showcase/'),
  ])
  const sortedPlans = plans ? [...plans].sort((a, b) => a.display_order - b.display_order) : null
  // Durée d'essai réelle (plan gratuit), jamais un chiffre écrit en dur.
  const trialDays = sortedPlans?.find((p) => p.is_free && p.trial_days > 0)?.trial_days ?? null
  return { plans: sortedPlans, registry: registry ?? [], showcase, trialDays }
}
