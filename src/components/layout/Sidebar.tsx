'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, Package, Box, CreditCard, Users, 
  FileBarChart, DollarSign, Truck, Bell, MessageSquare, MessageCircle,
  Settings, Key, ChevronLeft, ChevronRight
} from 'lucide-react'

const menuItems = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { id: 'products', label: 'Produits', icon: Package },
  { id: 'stock', label: 'Stock', icon: Box },
  { id: 'pos', label: 'Caisse (POS)', icon: CreditCard },
  { id: 'employees', label: 'Employés', icon: Users },
  { id: 'reports', label: 'Rapports', icon: FileBarChart },
  { id: 'finance', label: 'Finances', icon: DollarSign },
  { id: 'fournisseurs', label: 'Fournisseurs', icon: Truck },
  { id: 'alerts', label: 'Alertes', icon: Bell },
  { id: 'notifications', label: 'Notifications', icon: MessageCircle },
  { id: 'messaging', label: 'Messagerie', icon: MessageSquare },
  { id: 'settings', label: 'Paramètres', icon: Settings },
  { id: 'subscription', label: 'Abonnement', icon: Key },
]

export function Sidebar({ 
  open, 
  onClose, 
  collapsed, 
  onToggleCollapse 
}: { 
  open: boolean; 
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const pathname = usePathname()

  const showText = !collapsed || open

  return (
    <>
      {open && (
        <div 
          className="fixed inset-0 z-40 md:hidden bg-black/60 backdrop-blur-sm" 
          onClick={onClose} 
        />
      )}
      <aside 
        className={`fixed md:sticky top-0 z-50 h-screen flex flex-col border-r border-dark-800/60 bg-dark-900 transition-all duration-300 ${
          open ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        } ${
          !open && collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className={`p-5 flex items-center border-b border-dark-800/60 ${
          !open && collapsed ? 'justify-center' : 'gap-3'
        }`}>
          <div className="relative w-8 h-8 rounded-lg flex items-center justify-center bg-dark-900/50 p-1 border border-dark-700/30 overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-primary-500/10 blur-md rounded-full" />
            <img 
              src="/logos/NOXIA_Orbit_Logo.svg" 
              alt="NOXIA" 
              className="relative w-full h-full object-contain"
            />
          </div>
          {showText && (
            <div className="animate-fade-in">
              <span className="font-display font-bold text-sm tracking-wide text-primary-500">NOXIA</span>
              <span className="text-[10px] text-primary-400 font-medium block leading-none">Smart SaaS</span>
            </div>
          )}
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin scrollbar-thumb-dark-800 scrollbar-track-transparent">
          {menuItems.map((item) => {
            const isActive = pathname === `/${item.id}` || pathname.startsWith(`/${item.id}/`)
            const Icon = item.icon
            
            return (
              <Link
                key={item.id}
                href={`/${item.id}`}
                prefetch={true}
                className={`relative flex items-center rounded-xl text-sm font-medium transition-all duration-200 overflow-hidden group ${
                  !open && collapsed ? 'justify-center p-2.5 w-11 h-11 mx-auto' : 'gap-3 px-3.5 py-2.5'
                } ${
                  isActive 
                    ? 'bg-primary-500/10 text-primary-500 font-bold' 
                    : 'text-dark-300 hover:bg-white/[0.04] hover:text-white'
                }`}
                title={!open && collapsed ? item.label : undefined}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary-500 rounded-r-full" />
                )}
                <Icon className={`w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-105 shrink-0 ${
                  isActive ? 'text-primary-400' : 'text-dark-400 group-hover:text-dark-200'
                }`} />
                {showText && (
                  <span className="truncate animate-fade-in">{item.label}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Toggle Collapse Button (PC uniquement) */}
        <div className="hidden md:block p-4 border-t border-dark-800/60">
          <button
            onClick={onToggleCollapse}
            className="w-full py-2 flex items-center justify-center rounded-xl text-dark-400 hover:text-white hover:bg-white/[0.04] transition-all duration-200"
            title={collapsed ? "Déplier le menu" : "Plier le menu"}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <div className="flex items-center gap-2 animate-fade-in">
                <ChevronLeft className="w-5 h-5" />
                <span className="text-xs font-semibold">Réduire le menu</span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}