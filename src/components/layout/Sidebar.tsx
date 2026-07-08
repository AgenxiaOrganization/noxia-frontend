'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, Package, Box, CreditCard, Users, 
  FileBarChart, DollarSign, Truck, Bell, MessageSquare, 
  Bot, Settings, Key 
} from 'lucide-react'

const menuItems = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { id: 'products', label: 'Produits', icon: Package },
  { id: 'stock', label: 'Stock', icon: Box },
  { id: 'pos', label: 'Caisse (POS)', icon: CreditCard },
  { id: 'employees', label: 'Employes', icon: Users },
  { id: 'reports', label: 'Rapports', icon: FileBarChart },
  { id: 'finance', label: 'Finances', icon: DollarSign },
  { id: 'fournisseurs', label: 'Fournisseurs', icon: Truck },
  { id: 'alerts', label: 'Alertes', icon: Bell },
  { id: 'messaging', label: 'Messagerie', icon: MessageSquare },
  { id: 'assistant', label: 'Assistant IA', icon: Bot },
  { id: 'settings', label: 'Parametres', icon: Settings },
  { id: 'subscription', label: 'Abonnement', icon: Key },
]

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()

  return (
    <>
      {open && (
        <div 
          className="fixed inset-0 z-40 md:hidden" 
          onClick={onClose} 
          style={{ background: 'rgba(0,0,0,0.6)' }}
        />
      )}
      <aside 
        className={`fixed md:sticky top-0 z-50 h-screen w-64 flex flex-col border-r transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{ 
          background: '#1e293b',
          borderColor: '#334155'
        }}
      >
        {/* Logo */}
        <div className="p-4 flex items-center gap-3 border-b" style={{ borderColor: '#334155' }}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
            N
          </div>
          <div>
            <span className="font-semibold text-sm text-white">NOXIA</span>
            <p className="text-xs" style={{ color: '#94a3b8' }}>Administrateur</p>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === `/${item.id}` || pathname.startsWith(`/${item.id}/`)
            const Icon = item.icon
            return (
              <Link
                key={item.id}
                href={`/${item.id}`}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-primary-500/15 text-primary-400' 
                    : 'hover:bg-white/5 hover:text-white'
                }`}
                style={{ color: isActive ? '#818cf8' : '#94a3b8' }}
              >
                <Icon className="w-4 h-4" />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </nav>
        
        {/* Footer */}
        <div className="p-3 border-t" style={{ borderColor: '#334155' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-xs font-bold text-white">
              AD
            </div>
            <div>
              <p className="text-sm font-medium text-white">Admin Demo</p>
              <p className="text-xs" style={{ color: '#94a3b8' }}>Premium</p>
            </div>
          </div>
          <button className="w-full text-left text-xs transition py-1" style={{ color: '#94a3b8' }}>
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  )
}