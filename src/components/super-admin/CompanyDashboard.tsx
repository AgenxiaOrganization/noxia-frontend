'use client'

import { useState, useEffect, useCallback } from 'react'
import { KPICard } from '@/components/dashboard/KPICard'
import { SalesChart } from '@/components/dashboard/SalesChart'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { StockAlerts } from '@/components/dashboard/StockAlerts'
import { KPIModal } from '@/components/dashboard/KPIModal'
import { createDashboardApi, type DashboardStats } from '@/lib/api/dashboard'
import { createSuperAdminClient, type ProxyCompany } from '@/lib/superAdminClient'
import Loader from '@/components/ui/Loader'

/** Meme dashboard que celui du gerant ((dashboard)/dashboard/page.tsx),
 * reutilisant les memes composants purs, mais alimente via le proxy pour
 * l'entreprise choisie par le super-admin — remplace la Vue Globale des que
 * isGlobalMode passe a false et qu'une entreprise est selectionnee. */
export default function CompanyDashboard({ instanceCode, company }: { instanceCode: string; company: ProxyCompany }) {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('day')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalData, setModalData] = useState<Array<{ label: string; value: string | number; date?: string }>>([])

  const loadStats = useCallback(async () => {
    setLoading(true)
    try {
      const api = createDashboardApi(createSuperAdminClient(instanceCode, company.id))
      const data = await api.getDashboardStats(period)
      setStats(data)
    } catch (error) {
      console.error('Erreur chargement dashboard entreprise (super-admin)', error)
    } finally {
      setLoading(false)
    }
  }, [instanceCode, company.id, period])

  useEffect(() => { loadStats() }, [loadStats])

  const openModal = (title: string, data: any[]) => {
    setModalTitle(title)
    setModalData(data)
    setModalOpen(true)
  }

  if (loading) return <Loader />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5" style={{ borderColor: '#1e293b' }}>
        <div>
          <h1 className="text-2xl font-bold text-white">{company.name}</h1>
          <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Performances de cet établissement</p>
        </div>
        <div className="flex p-1.5 rounded-xl border" style={{ background: 'rgba(51, 65, 85, 0.3)', borderColor: '#334155' }}>
          {[
            { id: 'day', label: 'Jour' },
            { id: 'week', label: 'Semaine' },
            { id: 'month', label: 'Mois' },
            { id: 'year', label: 'Année' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id as any)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${period === p.id ? 'text-white' : ''}`}
              style={{ background: period === p.id ? '#4f46e5' : 'transparent', color: period === p.id ? '#fff' : '#94a3b8' }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => openModal('Détail du CA', [])} className="cursor-pointer">
          <KPICard
            label={period === 'day' ? 'CA du jour' : period === 'week' ? 'CA de la semaine' : period === 'month' ? 'CA du mois' : "CA de l'année"}
            value={stats ? `${Number(stats.revenue).toLocaleString()} FCFA` : '...'}
            color="#22c55e"
          />
        </div>
        <div onClick={() => openModal('Détail des ventes', [])} className="cursor-pointer">
          <KPICard label="Ventes" value={stats ? stats.sales_count.toString() : '...'} color="#818cf8" />
        </div>
        <div onClick={() => openModal('Alertes stock', stats?.stock_alerts.map((a) => ({ label: a.product_name, value: `${a.quantity} restants` })) || [])} className="cursor-pointer">
          <KPICard label="Alertes stock" value={stats ? stats.low_stock_count.toString() : '...'} color="#f59e0b" subtitle="produits critiques" />
        </div>
        <div onClick={() => openModal('Employés actifs', [])} className="cursor-pointer">
          <KPICard label="Employés actifs" value={stats ? stats.active_employees.toString() : '...'} color="#8b5cf6" subtitle="au total" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-full">
          <SalesChart data={stats?.sales_chart || []} period={period} />
        </div>
        <div className="lg:col-span-1 h-full">
          <RecentTransactions transactions={stats?.recent_transactions || []} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StockAlerts alerts={stats?.stock_alerts || []} />
        <div className="p-5 rounded-2xl border flex flex-col justify-center h-full relative overflow-hidden" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <h3 className="font-bold text-sm mb-3" style={{ color: '#818cf8' }}>Top produit ({period === 'day' ? "aujourd'hui" : period})</h3>
          {stats?.top_product ? (
            <div className="flex items-center justify-between p-3.5 rounded-xl" style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <span className="text-white font-medium">{stats.top_product.name}</span>
              <span className="text-sm font-bold" style={{ color: '#818cf8' }}>{stats.top_product.quantity} vendus</span>
            </div>
          ) : (
            <p className="text-xs" style={{ color: '#64748b' }}>Aucune vente sur cette période.</p>
          )}
        </div>
      </div>

      <KPIModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalTitle} data={modalData} />
    </div>
  )
}
