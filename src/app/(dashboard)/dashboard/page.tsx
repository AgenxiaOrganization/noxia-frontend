'use client'

import { useState } from 'react'
import { KPICard } from '@/components/dashboard/KPICard'
import { SalesChart } from '@/components/dashboard/SalesChart'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { StockAlerts } from '@/components/dashboard/StockAlerts'
import { KPIModal } from '@/components/dashboard/KPIModal'

// Données mockées pour les modals
const ventesData = [
  { label: 'Whisky Jack Daniel\'s', value: '25 000 F', date: '10:32' },
  { label: 'Bière Castel x3', value: '4 500 F', date: '10:15' },
  { label: 'Cocktail Mojito x2', value: '10 000 F', date: '09:45' },
  { label: 'Champagne Moet', value: '45 000 F', date: '09:10' },
  { label: 'Brochettes Poulet x4', value: '14 000 F', date: '08:50' },
]

const produitsData = [
  { label: 'Whisky Jack Daniel\'s', value: '8 bouteilles' },
  { label: 'Bière Guinness', value: '12 unités ⚠️' },
  { label: 'Champagne Moet', value: '6 bouteilles' },
]

const employesData = [
  { label: 'François T.', value: 'Gérant', date: 'Actif' },
  { label: 'Chloé R.', value: 'Serveur', date: 'Actif' },
  { label: 'Jean M.', value: 'Caissier', date: 'Actif' },
]

export default function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalData, setModalData] = useState<Array<{ label: string; value: string | number; date?: string }>>([])

  const openModal = (title: string, data: any[]) => {
    setModalTitle(title)
    setModalData(data)
    setModalOpen(true)
  }

  return (
    <div className="p-4 space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => openModal('Détail des ventes', ventesData)} className="cursor-pointer">
          <KPICard 
            label="CA du jour" 
            value="450 000 FCFA" 
            color="#22c55e"
            subtitle="+12% vs hier"
          />
        </div>
        <div onClick={() => openModal('Liste des produits', produitsData)} className="cursor-pointer">
          <KPICard 
            label="Ventes" 
            value="127" 
            color="#818cf8"
            subtitle="48 en espèces"
          />
        </div>
        <div onClick={() => openModal('Alertes stock', produitsData.filter(p => p.value.includes('⚠️')))} className="cursor-pointer">
          <KPICard 
            label="Alertes stock" 
            value="3" 
            color="#f59e0b"
            subtitle="produits critiques"
          />
        </div>
        <div onClick={() => openModal('Employés actifs', employesData)} className="cursor-pointer">
          <KPICard 
            label="Employés actifs" 
            value="8" 
            color="#8b5cf6"
            subtitle="sur 12 inscrits"
          />
        </div>
      </div>

      {/* Graphique + Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <div className="lg:col-span-2">
    <SalesChart />
  </div>
  <div className="lg:col-span-1">
    <RecentTransactions />
  </div>
</div>

      {/* Alertes stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StockAlerts />
        <div 
          className="p-4 rounded-xl border flex items-center justify-center"
          style={{ 
            background: '#1e293b',
            borderColor: '#334155'
          }}
        >
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            🔜 Top produits du jour (à venir)
          </p>
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