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
    <div className="p-4 space-y-4">
      {/* En-tête + Filtres */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-white">Vue d'ensemble</h2>
        
        <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700">
          {[
            { id: 'day', label: 'Jour' },
            { id: 'week', label: 'Semaine' },
            { id: 'month', label: 'Mois' },
            { id: 'year', label: 'Année' }
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                period === p.id 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
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
          className="p-4 rounded-xl border flex flex-col justify-center h-full"
          style={{ 
            background: '#1e293b',
            borderColor: '#334155'
          }}
        >
          <h3 className="font-semibold text-sm text-white mb-2">Top produit ({period === 'day' ? 'aujourd\'hui' : period})</h3>
          {stats?.top_product ? (
            <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <span className="text-white font-medium">{stats.top_product.name}</span>
              <span className="text-indigo-400 text-sm font-bold">{stats.top_product.quantity} vendus</span>
            </div>
          ) : (
            <p className="text-sm" style={{ color: '#94a3b8' }}>
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