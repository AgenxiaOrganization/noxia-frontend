'use client'

import { useState, useEffect, useCallback } from 'react'
import { KPICard } from '@/components/dashboard/KPICard'
import { SalesChart } from '@/components/dashboard/SalesChart'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { StockAlerts } from '@/components/dashboard/StockAlerts'
import { KPIModal } from '@/components/dashboard/KPIModal'
import { getDashboardStats, DashboardStats } from '@/lib/api/dashboard'
import { useWebSockets } from '@/lib/hooks/useWebSockets'
import { getCompany } from '@/lib/auth'
import Loader from '@/components/ui/Loader'

export default function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalData, setModalData] = useState<Array<{ label: string; value: string | number; date?: string }>>([])
  
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('day')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTheme, setActiveTheme] = useState('indigo')
  const [activeBg, setActiveBg] = useState('slate')

  useEffect(() => {
    const savedTheme = localStorage.getItem('noxia_theme') || 'indigo'
    const savedBg = localStorage.getItem('noxia_bg') || 'slate'
    setActiveTheme(savedTheme)
    setActiveBg(savedBg)
  }, [])

  const changeTheme = (themeName: string) => {
    const root = document.documentElement
    root.classList.remove('theme-indigo', 'theme-emerald', 'theme-ocean', 'theme-white-pure', 'theme-white-soft')
    if (themeName !== 'indigo') {
      root.classList.add(`theme-${themeName}`)
    }
    localStorage.setItem('noxia_theme', themeName)
    setActiveTheme(themeName)
    
    // Déclenche un événement de rafraîchissement pour forcer le dessin du canvas
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, 100)
  }

  const changeBg = (bgName: string) => {
    const root = document.documentElement
    root.classList.remove('bg-slate', 'bg-oled', 'bg-abysse', 'bg-white-pure', 'bg-white-soft')
    if (bgName !== 'slate') {
      root.classList.add(`bg-${bgName}`)
    }
    localStorage.setItem('noxia_bg', bgName)
    setActiveBg(bgName)
  }

  const company = getCompany()

  const loadStats = useCallback(async () => {
    try {
      const data = await getDashboardStats(period)
      setStats(data)
    } catch (error) {
      console.error('Erreur chargement dashboard:', error)
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    loadStats()
    
    // Fallback de rafraîchissement périodique (toutes les 30s)
    const interval = setInterval(loadStats, 30000)

    // Fallback de focus (se recharge immédiatement lorsque l'utilisateur affiche ou revient sur l'onglet)
    const handleFocus = () => {
      loadStats()
    }
    window.addEventListener('focus', handleFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [loadStats])

  // WebSocket pour la mise à jour en temps réel lors d'une vente
  const handleWsMessage = useCallback((data: any) => {
    if (data.type === 'sale_update' || data.type === 'price_update') {
      loadStats()
    }
  }, [loadStats])

  useWebSockets(company ? `/ws/sales/` : null, handleWsMessage)

  const openModal = (title: string, data: any[]) => {
    setModalTitle(title)
    setModalData(data)
    setModalOpen(true)
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* En-tête + Filtres */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-dark-800/20 pb-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-primary-500">Vue d'ensemble</h2>
            <p className="text-xs text-dark-400 mt-1">Suivez les performances de votre établissement en temps réel</p>
          </div>
        </div>
        
        <div className="flex bg-dark-900/60 p-1.5 rounded-xl border border-dark-800/60 backdrop-blur-sm">
          {[
            { id: 'day', label: 'Jour' },
            { id: 'week', label: 'Semaine' },
            { id: 'month', label: 'Mois' },
            { id: 'year', label: 'Année' }
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id as any)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                period === p.id 
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/10' 
                  : 'text-dark-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => openModal('Détail du CA', [])} className="cursor-pointer">
          <KPICard 
            label={period === 'day' ? 'CA du jour' : period === 'week' ? 'CA de la semaine' : period === 'month' ? 'CA du mois' : 'CA de l\'année'} 
            value={stats ? `${Number(stats.revenue).toLocaleString()} FCFA` : '...'} 
            color="#22c55e"
            subtitle=""
          />
        </div>
        <div onClick={() => openModal('Détail des ventes', [])} className="cursor-pointer">
          <KPICard 
            label="Ventes" 
            value={stats ? stats.sales_count.toString() : '...'} 
            color="#818cf8"
            subtitle=""
          />
        </div>
        <div onClick={() => openModal('Alertes stock', stats?.stock_alerts.map(a => ({ label: a.product_name, value: `${a.quantity} restants` })) || [])} className="cursor-pointer">
          <KPICard 
            label="Alertes stock" 
            value={stats ? stats.low_stock_count.toString() : '...'} 
            color="#f59e0b"
            subtitle="produits critiques"
          />
        </div>
        <div onClick={() => openModal('Employés actifs', [])} className="cursor-pointer">
          <KPICard 
            label="Employés actifs" 
            value={stats ? stats.active_employees.toString() : '...'} 
            color="#8b5cf6"
            subtitle="au total"
          />
        </div>
      </div>

      {/* Graphique + Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-full">
          <SalesChart data={stats?.sales_chart || []} period={period} />
        </div>
        <div className="lg:col-span-1 h-full">
          <RecentTransactions transactions={stats?.recent_transactions || []} />
        </div>
      </div>

      {/* Alertes stock & Top produit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StockAlerts alerts={stats?.stock_alerts || []} />
        
        {/* Top produit */}
        <div 
          className="p-5 rounded-2xl border border-dark-800/40 glass-card flex flex-col justify-center h-full relative overflow-hidden"
        >
          <h3 className="font-display font-bold text-sm text-primary-500 mb-3 tracking-tight">Top produit ({period === 'day' ? "aujourd'hui" : period})</h3>
          {stats?.top_product ? (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-primary-500/10 border border-primary-500/20">
              <span className="text-white font-medium">{stats.top_product.name}</span>
              <span className="text-primary-500 text-sm font-bold">{stats.top_product.quantity} vendus</span>
            </div>
          ) : (
            <p className="text-xs text-dark-500 font-medium">
              Aucune vente sur cette période.
            </p>
          )}
        </div>
      </div>

      {/* Modal */}
      <KPIModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        data={modalData}
      />
    </div>
  )
}