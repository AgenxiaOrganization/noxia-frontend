'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Building2, Users, CreditCard, FileText, Settings,
  LogOut, Menu, X, Bell, ChevronDown, Shield, Activity,
  Package, Truck, BarChart, Globe, AlertTriangle, MessageSquare,
  Database, Server, ShoppingBag, UserCog, Flag
} from 'lucide-react'

// Liste des pays disponibles
const countries = [
  { code: 'GA', name: 'Gabon', flag: '🇬🇦', domain: 'noxia.ga' },
  { code: 'CM', name: 'Cameroun', flag: '🇨🇲', domain: 'noxia.cm' },
  { code: 'CG', name: 'Congo', flag: '🇨🇬', domain: 'noxia.cg' },
  { code: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮', domain: 'noxia.ci' },
  { code: 'ZA', name: 'Afrique du Sud', flag: '🇿🇦', domain: 'noxia.co.za' },
  { code: 'FR', name: 'France', flag: '🇫🇷', domain: 'noxia.fr' },
  { code: 'SN', name: 'Sénégal', flag: '🇸🇳', domain: 'noxia.sn' },
  { code: 'ML', name: 'Mali', flag: '🇲🇱', domain: 'noxia.ml' },
]

const menuItems = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, href: '/super-admin' },
  { id: 'entreprises', label: 'Entreprises', icon: Building2, href: '/super-admin/entreprises' },
  { id: 'utilisateurs', label: 'Utilisateurs', icon: Users, href: '/super-admin/utilisateurs' },
  { id: 'produits', label: 'Produits', icon: Package, href: '/super-admin/produits' },
  { id: 'stock', label: 'Stock global', icon: Database, href: '/super-admin/stock' },
  { id: 'ventes', label: 'Ventes', icon: ShoppingBag, href: '/super-admin/ventes' },
  { id: 'fournisseurs', label: 'Fournisseurs', icon: Truck, href: '/super-admin/fournisseurs' },
  { id: 'abonnements', label: 'Abonnements', icon: CreditCard, href: '/super-admin/abonnements' },
  { id: 'paiements', label: 'Paiements', icon: CreditCard, href: '/super-admin/paiements' },
  { id: 'logs', label: 'Journal d\'audit', icon: FileText, href: '/super-admin/logs' },
  { id: 'alertes', label: 'Alertes système', icon: AlertTriangle, href: '/super-admin/alertes' },
  { id: 'messagerie', label: 'Messagerie', icon: MessageSquare, href: '/super-admin/messagerie' },
  { id: 'parametres', label: 'Paramètres', icon: Settings, href: '/super-admin/parametres' },
]

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState(countries[0]) // Gabon par défaut
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex h-screen" style={{ background: '#0f172a' }}>
      {/* Sidebar */}
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

        {/* Sélecteur de pays */}
        <div className="p-3 border-b" style={{ borderColor: '#1e293b' }}>
          <div className="relative">
            <button
              onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg transition hover:bg-white/5"
              style={{ 
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid #1e293b'
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedCountry.flag}</span>
                <span className="text-sm text-white">{selectedCountry.name}</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCountryDropdownOpen ? 'rotate-180' : ''}`} style={{ color: '#94a3b8' }} />
            </button>

            {isCountryDropdownOpen && (
              <div 
                className="absolute left-0 right-0 mt-1 rounded-lg border shadow-xl z-50 max-h-48 overflow-y-auto"
                style={{ 
                  background: '#1e293b',
                  borderColor: '#334155'
                }}
              >
                {countries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => {
                      setSelectedCountry(country)
                      setIsCountryDropdownOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition hover:bg-white/5 ${
                      selectedCountry.code === country.code ? 'bg-primary-500/10 text-primary-400' : 'text-white'
                    }`}
                  >
                    <span className="text-lg">{country.flag}</span>
                    <span>{country.name}</span>
                    <span className="text-xs ml-auto" style={{ color: '#64748b' }}>{country.domain}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Globe className="w-3 h-3" style={{ color: '#64748b' }} />
            <span className="text-xs" style={{ color: '#64748b' }}>Instance: {selectedCountry.domain}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
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
              <p className="text-sm font-medium text-white">Super Admin</p>
              <p className="text-xs" style={{ color: '#64748b' }}>root@noxia.io</p>
            </div>
          </div>
          <button
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition hover:bg-red-500/10"
            style={{ color: '#94a3b8' }}
            onClick={() => window.location.href = '/login'}
          >
            <LogOut className="w-4 h-4" style={{ color: '#f87171' }} />
            <span style={{ color: '#f87171' }}>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header 
          className="h-14 border-b flex items-center justify-between px-4 sm:px-6 shrink-0"
          style={{ 
            borderColor: '#1e293b',
            background: 'rgba(15, 23, 42, 0.8)'
          }}
        >
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="md:hidden hover:text-white transition"
              style={{ color: '#94a3b8' }}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h2 className="font-semibold text-sm text-white">
              Super Admin • {selectedCountry.flag} {selectedCountry.name}
            </h2>
            <span 
              className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
              style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}
            >
              <Shield className="w-3 h-3" />
              Root
            </span>
            <span 
              className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
              style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}
            >
              <Server className="w-3 h-3" />
              {selectedCountry.domain}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative cursor-pointer">
              <Bell className="w-5 h-5" style={{ color: '#94a3b8' }} />
              <span 
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[10px] flex items-center justify-center font-bold"
                style={{ background: '#ef4444' }}
              >
                5
              </span>
            </div>
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
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}