import { KPICard } from '@/components/dashboard/KPICard'
import { SalesChart } from '@/components/dashboard/SalesChart'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { StockAlerts } from '@/components/dashboard/StockAlerts'

export default function DashboardPage() {
  return (
    <div className="p-4 space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          label="CA du jour" 
          value="450 000 FCFA" 
          color="#22c55e"
          subtitle="+12% vs hier"
        />
        <KPICard 
          label="Ventes" 
          value="127" 
          color="#818cf8"
          subtitle="48 en espèces"
        />
        <KPICard 
          label="Alertes stock" 
          value="3" 
          color="#f59e0b"
          subtitle="produits critiques"
        />
        <KPICard 
          label="Employés actifs" 
          value="8" 
          color="#8b5cf6"
          subtitle="sur 12 inscrits"
        />
      </div>

      {/* Graphique + Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <div>
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
    </div>
  )
}