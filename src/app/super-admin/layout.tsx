'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Building2, Users, CreditCard, FileText, Settings,
  LogOut, Menu, X, Bell, ChevronDown, Shield, Activity,
  Package, Truck, BarChart, Globe, AlertTriangle,
  Database, Server, ShoppingBag, UserCog, Flag, Plus,
  Layers, Zap, Target, Award, Crown, Star, Gift,
  MessageCircle, Bot, Tag, ShieldCheck, Sparkles
} from 'lucide-react'
import React from 'react'
import { usePlatformSessionGuard } from '@/lib/hooks/usePlatformSessionGuard'
import { clearPlatformSession, getPlatformUser } from '@/lib/platformAuth'
import { listInstanceCompanies, listInstancePendingVerifications, type ProxyCompany } from '@/lib/superAdminClient'
import { listInstances, type PlatformInstance } from '@/lib/api/instances'

// Frequence de sondage du compteur de documents KYB en attente (cloche) —
// simple polling, pas de canal WebSocket dedie pour le super-admin (voir
// notes de conception : la cloche super-admin doit rester cross-instance-
// friendly sans dependre d'une connexion persistante par instance).
const PENDING_VERIFICATIONS_POLL_MS = 60_000

// Type pour un serveur
interface ServerInstance {
  id: string
  name: string
  url: string
  country: string
  codeLabel: string
  isActive: boolean
}

const GLOBAL_SERVER: ServerInstance = {
  id: 'global', name: 'Global', url: 'Tous les serveurs', country: 'Global', codeLabel: 'ALL', isActive: true,
}

function toServerInstance(instance: PlatformInstance): ServerInstance {
  return {
    id: instance.code,
    name: instance.name,
    url: instance.url_api,
    country: instance.name,
    codeLabel: instance.code.slice(0, 2).toUpperCase(),
    isActive: instance.status === 'active',
  }
}

/** Badge textuel (code pays/instance) — remplace les emojis drapeau par un
 * indicateur visuel neutre et coherent avec le reste de l'UI. */
function ServerBadge({ server, size = 'sm' }: { server: ServerInstance; size?: 'sm' | 'lg' }) {
  const Icon = server.id === 'global' ? Globe : Server
  const dims = size === 'lg' ? 'w-6 h-6 text-[10px]' : 'w-5 h-5 text-[9px]'
  return (
    <span
      className={`inline-flex items-center justify-center rounded shrink-0 font-bold ${dims}`}
      style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}
    >
      {server.id === 'global' ? <Icon className="w-3 h-3" /> : server.codeLabel}
    </span>
  )
}

// Menu métier - visible uniquement une fois une instance sélectionnée.
// "Instances" n'y figure pas : c'est un réglage de la plateforme elle-même
// (URL, clé API) indépendant de l'instance/établissement choisis, il vit
// juste sous le sélecteur de serveur (voir plus bas) plutôt que mélangé au
// menu métier d'un établissement précis.
const menuItems = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, href: '/super-admin' },
  { id: 'entreprises', label: 'Entreprises', icon: Building2, href: '/super-admin/entreprises' },
  { id: 'verifications', label: 'Vérifications', icon: ShieldCheck, href: '/super-admin/verifications' },
  { id: 'utilisateurs', label: 'Utilisateurs', icon: Users, href: '/super-admin/utilisateurs' },
  { id: 'produits', label: 'Produits', icon: Package, href: '/super-admin/produits' },
  { id: 'stock', label: 'Stock global', icon: Database, href: '/super-admin/stock' },
  { id: 'ventes', label: 'Ventes', icon: ShoppingBag, href: '/super-admin/ventes' },
  { id: 'fournisseurs', label: 'Fournisseurs', icon: Truck, href: '/super-admin/fournisseurs' },
  { id: 'rapports', label: 'Rapports', icon: BarChart, href: '/super-admin/rapports' },
  { id: 'assistant', label: 'Assistant IA', icon: Bot, href: '/super-admin/assistant' },
  { id: 'abonnements', label: 'Abonnements', icon: CreditCard, href: '/super-admin/abonnements' },
  { id: 'plans', label: "Plans d'abonnement", icon: Tag, href: '/super-admin/plans' },
  { id: 'logs', label: "Journal d'audit", icon: FileText, href: '/super-admin/logs' },
  { id: 'alertes', label: 'Alertes système', icon: AlertTriangle, href: '/super-admin/alertes' },
  { id: 'notifications', label: 'Notifications', icon: MessageCircle, href: '/super-admin/notifications' },
  { id: 'parametres', label: 'Paramètres', icon: Settings, href: '/super-admin/parametres' },
  // Conformité Art. 32/53 (Ordonnance n°0011/PR/2026, Gabon) : volontairement
  // en dernier dans le menu, distinct du journal d'audit ci-dessus (actions
  // utilisateurs) — celui-ci trace les métadonnées d'origine des contenus
  // générés par l'assistant IA, restituables à la HAC sur demande.
  { id: 'journal-ia', label: 'Journal des contenus IA', icon: Sparkles, href: '/super-admin/journal-ia' },
]

// Contexte pour partager le serveur ET l'établissement sélectionnés
export const ServerContext = React.createContext<{
  selectedServer: ServerInstance
  isGlobalMode: boolean
  switchServer: (server: ServerInstance) => void
  companies: ProxyCompany[]
  selectedCompany: ProxyCompany | null
  switchCompany: (company: ProxyCompany) => void
  refreshServers: () => void
}>({
  selectedServer: GLOBAL_SERVER,
  isGlobalMode: true,
  switchServer: () => {},
  companies: [],
  selectedCompany: null,
  switchCompany: () => {},
  refreshServers: () => {},
})

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  usePlatformSessionGuard()

  // getPlatformUser() lit localStorage : au premier rendu SSR il n'existe
  // pas encore, donc on ne le resout qu'apres le montage cote client pour
  // eviter un mismatch d'hydratation entre le HTML serveur (sans session)
  // et le client (avec session).
  const [platformUser, setPlatformUser] = useState<ReturnType<typeof getPlatformUser>>(null)
  useEffect(() => setPlatformUser(getPlatformUser()), [])

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [servers, setServers] = useState<ServerInstance[]>([GLOBAL_SERVER])
  const [selectedServer, setSelectedServer] = useState<ServerInstance>(GLOBAL_SERVER)
  const [isServerDropdownOpen, setIsServerDropdownOpen] = useState(false)
  const [companies, setCompanies] = useState<ProxyCompany[]>([])
  const [selectedCompany, setSelectedCompany] = useState<ProxyCompany | null>(null)
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false)
  const [serversReloadKey, setServersReloadKey] = useState(0)
  const [pendingVerificationsCount, setPendingVerificationsCount] = useState(0)
  const pathname = usePathname()

  const isGlobalMode = selectedServer.id === 'global'

  const switchServer = (server: ServerInstance) => {
    setSelectedServer(server)
    setIsServerDropdownOpen(false)
  }

  const switchCompany = (company: ProxyCompany) => {
    setSelectedCompany(company)
    setIsCompanyDropdownOpen(false)
  }

  const refreshServers = () => setServersReloadKey((k) => k + 1)

  useEffect(() => {
    let cancelled = false
    listInstances()
      .then((list) => {
        if (cancelled) return
        const loaded = [GLOBAL_SERVER, ...list.map(toServerInstance)]
        setServers(loaded)
        setSelectedServer((current) => loaded.find((s) => s.id === current.id) ?? GLOBAL_SERVER)
      })
      .catch((e) => console.error('Erreur chargement des instances', e))
    return () => { cancelled = true }
  }, [serversReloadKey])

  useEffect(() => {
    if (isGlobalMode) {
      setCompanies([])
      setSelectedCompany(null)
      return
    }
    let cancelled = false
    listInstanceCompanies(selectedServer.id)
      .then((list) => {
        if (cancelled) return
        setCompanies(list)
        setSelectedCompany((current) => (current && list.some(c => c.id === current.id)) ? current : (list[0] ?? null))
      })
      .catch((e) => {
        console.error('Erreur chargement des entreprises de cette instance', e)
        if (!cancelled) { setCompanies([]); setSelectedCompany(null) }
      })
    return () => { cancelled = true }
  }, [selectedServer.id, isGlobalMode])

  // Compteur de la cloche : documents KYB en attente sur l'instance active.
  // Pas de sens en mode Global (aucune instance ciblable par le proxy).
  useEffect(() => {
    if (isGlobalMode) {
      setPendingVerificationsCount(0)
      return
    }
    let cancelled = false
    const poll = () => {
      listInstancePendingVerifications(selectedServer.id)
        .then((list) => { if (!cancelled) setPendingVerificationsCount(list.length) })
        .catch((e) => console.error('Erreur chargement des vérifications en attente', e))
    }
    poll()
    const interval = setInterval(poll, PENDING_VERIFICATIONS_POLL_MS)
    return () => { cancelled = true; clearInterval(interval) }
  }, [selectedServer.id, isGlobalMode])

  return (
    <ServerContext.Provider value={{ selectedServer, isGlobalMode, switchServer, companies, selectedCompany, switchCompany, refreshServers }}>
      <div className="flex h-screen" style={{ background: '#0f172a' }}>
        {/* Sidebar - n'apparaît qu'une fois une instance sélectionnée : en
            mode Global, il n'y a encore aucune action métier à afficher. */}
        {!isGlobalMode && (
          <aside
            className={`fixed md:sticky top-0 z-50 h-screen w-64 flex flex-col border-r transition-transform duration-300 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            }`}
            style={{
              background: '#0f172a',
              borderColor: '#1e293b'
            }}
          >
            {/* Logo */}
            <div className="p-4 flex items-center gap-3 border-b" style={{ borderColor: '#1e293b' }}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <img src="/logos/NOXIA_Orbit_Logo.svg" alt="NOXIA" className="w-6 h-6" />
              </div>
              <div>
                <span className="font-semibold text-sm text-white">Super Admin</span>
                <p className="text-xs" style={{ color: '#94a3b8' }}>NOXIA</p>
              </div>
            </div>

            {/* Sélecteur de serveurs */}
            <div className="p-3 border-b" style={{ borderColor: '#1e293b' }}>
              <div className="relative">
                <button
                  onClick={() => setIsServerDropdownOpen(!isServerDropdownOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg transition hover:bg-white/5"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid #1e293b'
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <ServerBadge server={selectedServer} />
                    <span className="text-sm text-white truncate">{selectedServer.name}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 shrink-0 ${isServerDropdownOpen ? 'rotate-180' : ''}`} style={{ color: '#94a3b8' }} />
                </button>

                {isServerDropdownOpen && (
                  <div
                    className="absolute left-0 right-0 mt-1 rounded-lg border shadow-xl z-50 max-h-64 overflow-y-auto"
                    style={{
                      background: '#1e293b',
                      borderColor: '#334155'
                    }}
                  >
                    {servers.map((server) => (
                      <button
                        key={server.id}
                        onClick={() => switchServer(server)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition hover:bg-white/5 ${
                          selectedServer.id === server.id ? 'bg-primary-500/10 text-primary-400' : 'text-white'
                        }`}
                      >
                        <ServerBadge server={server} />
                        <span className="truncate">{server.name}</span>
                        <span className="text-xs ml-auto" style={{ color: '#64748b' }}>{server.id === 'global' ? 'Global' : server.url}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Globe className="w-3 h-3 shrink-0" style={{ color: '#64748b' }} />
                <span className="text-xs truncate" style={{ color: '#64748b' }}>
                  Instance: {selectedServer.url}
                </span>
              </div>
              <Link
                href="/super-admin/instances"
                className="mt-2 flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition hover:bg-white/5"
                style={{ color: '#94a3b8' }}
              >
                <Server className="w-3.5 h-3.5" />
                Gérer les instances
              </Link>
            </div>

            {/* Sélecteur d'entreprise (au sein de l'instance choisie) */}
            <div className="p-3 border-b" style={{ borderColor: '#1e293b' }}>
              <div className="relative">
                <button
                  onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg transition hover:bg-white/5"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1e293b' }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Building2 className="w-4 h-4 shrink-0" style={{ color: '#818cf8' }} />
                    <span className="text-sm text-white truncate">
                      {selectedCompany ? selectedCompany.name : companies.length === 0 ? 'Aucune entreprise' : 'Sélectionner...'}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 shrink-0 ${isCompanyDropdownOpen ? 'rotate-180' : ''}`} style={{ color: '#94a3b8' }} />
                </button>

                {isCompanyDropdownOpen && companies.length > 0 && (
                  <div
                    className="absolute left-0 right-0 mt-1 rounded-lg border shadow-xl z-50 max-h-64 overflow-y-auto"
                    style={{ background: '#1e293b', borderColor: '#334155' }}
                  >
                    {companies.map((company) => (
                      <button
                        key={company.id}
                        onClick={() => switchCompany(company)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition hover:bg-white/5 ${
                          selectedCompany?.id === company.id ? 'bg-primary-500/10 text-primary-400' : 'text-white'
                        }`}
                      >
                        <span className="truncate">{company.name}</span>
                        <span className="text-xs ml-auto" style={{ color: '#64748b' }}>{company.country}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation métier */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                const Icon = item.icon
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary-500/15 text-primary-400'
                        : 'text-dark-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-primary-400' : 'text-dark-400'}`} />
                    <span className="truncate">{item.label}</span>
                    {isActive && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary-500/20 text-primary-400 ml-auto font-bold">
                        {selectedServer.codeLabel}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t" style={{ borderColor: '#1e293b' }}>
              <div className="flex items-center gap-2 mb-3 px-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: '#4f46e5' }}>
                  SA
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {platformUser ? `${platformUser.first_name} ${platformUser.last_name}`.trim() || platformUser.email : 'Super Admin'}
                  </p>
                  <p className="text-xs" style={{ color: '#64748b' }}>{platformUser?.email ?? ''}</p>
                </div>
              </div>
              <button
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition hover:bg-red-500/10"
                style={{ color: '#94a3b8' }}
                onClick={() => {
                  clearPlatformSession()
                  window.location.href = '/super-admin-login'
                }}
              >
                <LogOut className="w-4 h-4" style={{ color: '#f87171' }} />
                <span style={{ color: '#f87171' }}>Déconnexion</span>
              </button>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar - toujours visible, contient le sélecteur d'instance en
              mode Global (puisqu'il n'y a alors pas de sidebar pour ça). */}
          <header
            className="h-14 border-b flex items-center justify-between px-4 sm:px-6 shrink-0"
            style={{
              borderColor: '#1e293b',
              background: 'rgba(15, 23, 42, 0.8)'
            }}
          >
            <div className="flex items-center gap-4 min-w-0">
              {!isGlobalMode && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden hover:text-white transition"
                  style={{ color: '#94a3b8' }}
                >
                  {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              )}

              {isGlobalMode ? (
                <div className="relative">
                  <button
                    onClick={() => setIsServerDropdownOpen(!isServerDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition hover:bg-white/5"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1e293b' }}
                  >
                    <ServerBadge server={selectedServer} />
                    <span className="text-sm font-semibold text-white truncate">{selectedServer.name}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 shrink-0 ${isServerDropdownOpen ? 'rotate-180' : ''}`} style={{ color: '#94a3b8' }} />
                  </button>

                  {isServerDropdownOpen && (
                    <div
                      className="absolute left-0 mt-1 w-64 rounded-lg border shadow-xl z-50 max-h-64 overflow-y-auto"
                      style={{ background: '#1e293b', borderColor: '#334155' }}
                    >
                      {servers.map((server) => (
                        <button
                          key={server.id}
                          onClick={() => switchServer(server)}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition hover:bg-white/5 ${
                            selectedServer.id === server.id ? 'bg-primary-500/10 text-primary-400' : 'text-white'
                          }`}
                        >
                          <ServerBadge server={server} />
                          <span className="truncate">{server.name}</span>
                          <span className="text-xs ml-auto" style={{ color: '#64748b' }}>{server.id === 'global' ? 'Global' : server.url}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <h2 className="font-semibold text-sm text-white flex items-center gap-2">
                  <ServerBadge server={selectedServer} />
                  {selectedServer.name}
                </h2>
              )}

              <span
                className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0"
                style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}
              >
                <Shield className="w-3 h-3" />
                Root
              </span>
              {!isGlobalMode && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0"
                  style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}
                >
                  <Server className="w-3 h-3" />
                  {selectedServer.url}
                </span>
              )}
              {isGlobalMode && (
                <Link
                  href="/super-admin/instances"
                  className="text-xs px-2 py-1 rounded-lg flex items-center gap-1.5 shrink-0 transition hover:bg-white/5"
                  style={{ border: '1px solid #1e293b', color: '#94a3b8' }}
                >
                  <Server className="w-3 h-3" />
                  Gérer les instances
                </Link>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Link href="/super-admin/verifications" className="relative cursor-pointer hover:opacity-80 transition" title="Vérifications KYB en attente">
                <Bell className="w-5 h-5" style={{ color: '#94a3b8' }} />
                {pendingVerificationsCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: '#ef4444' }}
                  >
                    {pendingVerificationsCount > 99 ? '99+' : pendingVerificationsCount}
                  </span>
                )}
              </Link>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: '#4f46e5' }}
                >
                  SA
                </div>
                <span className="text-sm text-white hidden sm:block">Super Admin</span>
                <ChevronDown className="w-4 h-4" style={{ color: '#94a3b8' }} />
              </div>
              {isGlobalMode && (
                <button
                  className="p-2 rounded-lg transition hover:bg-red-500/10"
                  title="Déconnexion"
                  onClick={() => {
                    clearPlatformSession()
                    window.location.href = '/super-admin-login'
                  }}
                >
                  <LogOut className="w-4 h-4" style={{ color: '#f87171' }} />
                </button>
              )}
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </ServerContext.Provider>
  )
}