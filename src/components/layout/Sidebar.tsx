'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, Package, Box, CreditCard, Users, 
  FileBarChart, DollarSign, Truck, Bell, MessageSquare, 
  Bot, Settings, Key 
} from 'lucide-react'
import { cn } from '@/lib/utils'

const menuItems = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { id: 'products', label: 'Produits', icon: Package },
  { id: 'stock', label: 'Stock', icon: Box },
  { id: 'pos', label: 'Caisse (POS)', icon: CreditCard },
  { id: 'employees', label: 'Employes', icon: Users },
  { id: 'reports', label: 'Rapports', icon: FileBarChart },
  { id: 'finance', label: 'Finances', icon: DollarSign },
  { id: 'suppliers', label: 'Distributeurs', icon: Truck },
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
      {open && <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={onClose} />}
      <aside className={cn(
        'fixed md:sticky top-0 z-50 h-screen w-64 flex flex-col bg-dark-800 border-r border-dark-700 shrink-0 transition-transform duration-300',
        open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}>
        <div className="p-4 flex items-center gap-3 border-b border-dark-700">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">N</div>
          <div>
            <span className="font-semibold text-sm">NOXIA</span>
            <p className="text-xs text-dark-400">Administrateur</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === `/${item.id}` || pathname.startsWith(`/${item.id}/`)
            const Icon = item.icon
            return (
              <Link
                key={item.id}
                href={`/${item.id}`}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  isActive ? 'bg-primary-500/15 text-primary-400' : 'text-dark-300 hover:bg-dark-700/50 hover:text-white'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-3 border-t border-dark-700">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-xs font-bold">AD</div>
            <div>
              <p className="text-sm font-medium">Admin Demo</p>
              <p className="text-xs text-dark-400">Premium</p>
            </div>
          </div>
          <button className="w-full text-left text-xs text-dark-400 hover:text-red-400 transition py-1">Déconnexion</button>
        </div>
      </aside>
    </>
  )
}