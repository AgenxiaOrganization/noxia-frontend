/**
 * Sections du back-office super-admin retirees de la navigation et de
 * l'acces direct par URL — recommandation de l'Autorite de Protection des
 * Donnees Personnelles (Gabon) : le back-office plateforme ne doit plus
 * donner acces aux donnees d'activite des etablissements clients (produits,
 * stock, ventes, fournisseurs, rapports, assistant IA, utilisateurs, contenu
 * genere par l'assistant IA), assimilable a de la surveillance de compte.
 * Les pages elles-memes ne sont pas supprimees, voir
 * src/app/super-admin/layout.tsx (menuItems) et
 * src/lib/hooks/useRestrictedRouteGuard.ts.
 */
export const RESTRICTED_ROUTE_PATHS = [
  '/super-admin/utilisateurs',
  '/super-admin/produits',
  '/super-admin/stock',
  '/super-admin/ventes',
  '/super-admin/fournisseurs',
  '/super-admin/rapports',
  '/super-admin/assistant',
  '/super-admin/journal-ia',
]
