'use client'

import { useState, useEffect } from 'react'
import {
  Building2, Users, CreditCard, TrendingUp, TrendingDown,
  Activity, AlertTriangle, CheckCircle, Clock, DollarSign,
  BarChart3, PieChart, Package, ShoppingBag, Calendar,
  ChevronRight, Download, Filter, MoreVertical, Eye,
  Target, Zap, Award, Crown, Star, Gift, Layers,
  Server, Globe, Database, HardDrive, Cpu
} from 'lucide-react'

// Types
interface DashboardStats {
  totalCompanies: number
  activeCompanies: number
  totalUsers: number
  mrr: number
  totalRevenue: number
  revenueChange: number
  conversionRate: number
  activationRate: number
  activeCompaniesWithOrders: number
  monthlyOrders: number
  monthlyOrdersChange: number
  commission: number
  commissionRate: number
  monthlyRevenue: number
  planDistribution: {
    essai: number
    decouverte: number
    business: number
    pro: number
  }
  serversStats: {
    id: string
    name: string
    companies: number
    users: number
    revenue: number
  }[]
}

interface ExpiredTrial {
  id: number
  name: string
  expiryDate: string
  days: number
  company: string
  server: string
}

interface RecentActivity {
  id: number
  action: string
  company: string
  user: string
  time: string
  status: 'success' | 'warning' | 'error' | 'info'
  server: string
}

// Données mockées (version GLOBALE - tout est réuni)
const mockStats: DashboardStats = {
  totalCompanies: 238,
  activeCompanies: 47,
  totalUsers: 525,
  mrr: 715600,
  totalRevenue: 5710150,
  revenueChange: 38,
  conversionRate: 69,
  activationRate: 91,
  activeCompaniesWithOrders: 47,
  monthlyOrders: 11,
  monthlyOrdersChange: 38,
  commission: 171305,
  commissionRate: 3,
  monthlyRevenue: 211500,
  planDistribution: {
    essai: 33,
    decouverte: 64,
    business: 92,
    pro: 8
  },
  serversStats: [
    { id: 'ga', name: 'Gabon', companies: 89, users: 245, revenue: 2150000 },
    { id: 'cm', name: 'Cameroun', companies: 56, users: 120, revenue: 1350000 },
    { id: 'ci', name: "Côte d'Ivoire", companies: 43, users: 85, revenue: 980000 },
    { id: 'sn', name: 'Sénégal', companies: 28, users: 45, revenue: 620000 },
    { id: 'fr', name: 'France', companies: 12, users: 18, revenue: 380000 },
    { id: 'za', name: 'Afrique du Sud', companies: 10, users: 12, revenue: 230000 },
  ]
}

const mockExpiredTrials: ExpiredTrial[] = [
  { id: 1, name: 'Maison Kaly', expiryDate: '2026-05-28', days: 28, company: 'Maison Kaly', server: 'Gabon' },
  { id: 2, name: 'Awa Couture', expiryDate: '2026-05-25', days: 25, company: 'Awa Couture', server: 'Cameroun' },
  { id: 3, name: 'Délices du Sahel', expiryDate: '2026-05-21', days: 21, company: 'Délices du Sahel', server: "Côte d'Ivoire" },
  { id: 4, name: 'Tech Accessories', expiryDate: '2026-05-18', days: 18, company: 'Tech Accessories', server: 'Sénégal' },
  { id: 5, name: 'Mode Express', expiryDate: '2026-05-15', days: 15, company: 'Mode Express', server: 'Gabon' },
  { id: 6, name: "Saveurs d'Afrique", expiryDate: '2026-05-12', days: 12, company: "Saveurs d'Afrique", server: 'France' },
  { id: 7, name: 'Digital Store', expiryDate: '2026-05-09', days: 9, company: 'Digital Store', server: 'Afrique du Sud' },
]

const mockRecentActivities: RecentActivity[] = [
  { id: 1, action: 'Nouvelle entreprise inscrite', company: 'Bar Le Premium', user: 'Jean M.', time: 'Il y a 5 min', status: 'success', server: 'Gabon' },
  { id: 2, action: 'Abonnement Premium activé', company: 'Snack Le Délice', user: 'Marie K.', time: 'Il y a 15 min', status: 'success', server: 'Cameroun' },
  { id: 3, action: 'Tentative de connexion suspecte', company: 'Boîte VIP', user: 'Inconnu', time: 'Il y a 30 min', status: 'warning', server: "Côte d'Ivoire" },
  { id: 4, action: 'Paiement échoué', company: 'Restaurant La Terrasse', user: 'François T.', time: 'Il y a 1h', status: 'error', server: 'Sénégal' },
  { id: 5, action: 'Nouvel utilisateur ajouté', company: 'Bar Le Soleil', user: 'Admin', time: 'Il y a 2h', status: 'success', server: 'Gabon' },
]

export default function SuperAdminDashboard() {
  const [stats] = useState<DashboardStats>(mockStats)
  const [expiredTrials] = useState<ExpiredTrial[]>(mockExpiredTrials)
  const [recentActivities] = useState<RecentActivity[]>(mockRecentActivities)
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + ' FCFA'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4" style={{ color: '#22c55e' }} />
      case 'warning': return <AlertTriangle className="w-4 h-4" style={{ color: '#f59e0b' }} />
      case 'error': return <AlertTriangle className="w-4 h-4" style={{ color: '#ef4444' }} />
      default: return <Activity className="w-4 h-4" style={{ color: '#818cf8' }} />
    }
  }

  return (
    <div className={`space-y-6 transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">🌍 Vue Globale</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            Tous les serveurs • {stats.totalCompanies} entreprises • {stats.totalUsers} utilisateurs
          </p>
        </div>
        <div className="flex gap-2">
         <select
  value={selectedPeriod}
  onChange={(e) => setSelectedPeriod(e.target.value)}
  className="px-3 py-2 rounded-lg text-sm outline-none transition"
  style={{ 
    background: 'rgba(51, 65, 85, 0.5)',
    border: '1px solid #334155',
    color: '#94a3b8'
  }}
>
  <option value="today">Aujourd'hui</option>
  <option value="week">Cette semaine</option>
  <option value="month">Ce mois</option>
  <option value="quarter">Ce trimestre</option>
  <option value="year">Cette année</option>
</select>
          <button
            className="px-3 py-2 rounded-lg transition flex items-center gap-2"
            style={{ 
              background: 'rgba(51, 65, 85, 0.3)',
              border: '1px solid #334155',
              color: '#94a3b8'
            }}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exporter</span>
          </button>
        </div>
      </div>

      {/* Stats par serveur (nouveau) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {stats.serversStats.map((server) => (
          <div key={server.id} className="p-3 rounded-xl border hover:border-primary-500 transition cursor-pointer" style={{ background: '#1e293b', borderColor: '#334155' }}>
            <div className="flex items-center gap-2 mb-1">
              <Server className="w-3 h-3" style={{ color: '#818cf8' }} />
              <span className="text-xs font-medium text-white">{server.name}</span>
            </div>
            <p className="text-lg font-bold text-white">{server.companies}</p>
            <p className="text-xs" style={{ color: '#64748b' }}>entreprises</p>
            <div className="flex justify-between mt-1 text-xs">
              <span style={{ color: '#64748b' }}>{server.users} users</span>
              <span style={{ color: '#22c55e' }}>{formatCurrency(server.revenue)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* KPIs Principaux (globaux) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR */}
        <div className="p-4 rounded-xl border transition-all hover:border-primary-500" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#94a3b8' }}>MRR Global</p>
            <DollarSign className="w-4 h-4" style={{ color: '#22c55e' }} />
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(stats.mrr)}</p>
          <p className="text-xs mt-1" style={{ color: '#64748b' }}>Abonnements actifs</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
              <TrendingUp className="w-3 h-3" />
              +{stats.revenueChange}%
            </span>
            <span className="text-xs" style={{ color: '#64748b' }}>vs mois dernier</span>
          </div>
        </div>

        {/* Commandes mois */}
        <div className="p-4 rounded-xl border transition-all hover:border-primary-500" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#94a3b8' }}>Commandes mois</p>
            <ShoppingBag className="w-4 h-4" style={{ color: '#818cf8' }} />
          </div>
          <p className="text-2xl font-bold text-white">{stats.monthlyOrders}</p>
          <p className="text-xs mt-1" style={{ color: '#64748b' }}>Commandes passées</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
              <TrendingUp className="w-3 h-3" />
              +{stats.monthlyOrdersChange}%
            </span>
            <span className="text-xs" style={{ color: '#64748b' }}>vs mois dernier</span>
          </div>
        </div>

        {/* Commission */}
        <div className="p-4 rounded-xl border transition-all hover:border-primary-500" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#94a3b8' }}>Commission</p>
            <Zap className="w-4 h-4" style={{ color: '#f59e0b' }} />
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(stats.commission)}</p>
          <p className="text-xs mt-1" style={{ color: '#64748b' }}>{stats.commissionRate}% sur les transactions</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
              <TrendingUp className="w-3 h-3" />
              Cumulé
            </span>
          </div>
        </div>

        {/* Taux d'activation */}
        <div className="p-4 rounded-xl border transition-all hover:border-primary-500" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#94a3b8' }}>Activation</p>
            <Target className="w-4 h-4" style={{ color: '#8b5cf6' }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: '#8b5cf6' }}>{stats.activationRate}%</p>
          <p className="text-xs mt-1" style={{ color: '#64748b' }}>Boutiques avec &gt;1 produit</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
              {stats.activeCompaniesWithOrders} boutiques actives
            </span>
          </div>
        </div>
      </div>

      {/* Statistiques détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Taux de conversion & Boutiques actives */}
        <div className="p-4 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-white">Conversion & Activation</h3>
            <BarChart3 className="w-4 h-4" style={{ color: '#64748b' }} />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: '#94a3b8' }}>Taux de conversion</span>
                <span className="font-bold" style={{ color: '#22c55e' }}>{stats.conversionRate}%</span>
              </div>
              <div className="w-full h-2 rounded-full mt-1" style={{ background: '#334155' }}>
                <div className="h-2 rounded-full" style={{ width: `${stats.conversionRate}%`, background: 'linear-gradient(90deg, #22c55e, #4ade80)' }} />
              </div>
              <p className="text-xs mt-1" style={{ color: '#64748b' }}>Trial → Payant</p>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: '#94a3b8' }}>Taux d'activation</span>
                <span className="font-bold" style={{ color: '#8b5cf6' }}>{stats.activationRate}%</span>
              </div>
              <div className="w-full h-2 rounded-full mt-1" style={{ background: '#334155' }}>
                <div className="h-2 rounded-full" style={{ width: `${stats.activationRate}%`, background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)' }} />
              </div>
              <p className="text-xs mt-1" style={{ color: '#64748b' }}>Boutiques avec &gt;1 produit</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: '#334155' }}>
              <span style={{ color: '#94a3b8' }}>Boutiques actives</span>
              <span className="font-bold text-white">{stats.activeCompanies}</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: '#94a3b8' }}>Avec commandes (30j)</span>
              <span className="font-bold text-white">{stats.activeCompaniesWithOrders}</span>
            </div>
          </div>
        </div>

        {/* Répartition des plans */}
        <div className="p-4 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-white">Répartition des plans</h3>
            <PieChart className="w-4 h-4" style={{ color: '#64748b' }} />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: '#22c55e' }} />
                <span style={{ color: '#94a3b8' }}>Essai gratuit</span>
              </div>
              <span className="font-medium text-white">{stats.planDistribution.essai}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: '#818cf8' }} />
                <span style={{ color: '#94a3b8' }}>Découverte</span>
              </div>
              <span className="font-medium text-white">{stats.planDistribution.decouverte}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: '#f59e0b' }} />
                <span style={{ color: '#94a3b8' }}>Business</span>
              </div>
              <span className="font-medium text-white">{stats.planDistribution.business}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: '#8b5cf6' }} />
                <span style={{ color: '#94a3b8' }}>Pro</span>
              </div>
              <span className="font-medium text-white">{stats.planDistribution.pro}</span>
            </div>
            <div className="pt-2 border-t flex items-center justify-between" style={{ borderColor: '#334155' }}>
              <span className="text-sm font-medium" style={{ color: '#94a3b8' }}>Total MRR</span>
              <span className="text-sm font-bold text-white">{formatCurrency(stats.mrr)}</span>
            </div>
          </div>
        </div>

        {/* Revenus */}
        <div className="p-4 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-white">Revenus</h3>
            <DollarSign className="w-4 h-4" style={{ color: '#22c55e' }} />
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs" style={{ color: '#94a3b8' }}>Revenus clients (cumul)</p>
              <p className="text-xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="flex items-center justify-between text-sm py-1 border-t" style={{ borderColor: '#334155' }}>
              <span style={{ color: '#94a3b8' }}>Commission ({stats.commissionRate}%)</span>
              <span className="font-medium" style={{ color: '#f59e0b' }}>{formatCurrency(stats.commission)}</span>
            </div>
            <div className="flex items-center justify-between text-sm py-1 border-t" style={{ borderColor: '#334155' }}>
              <span style={{ color: '#94a3b8' }}>Ce mois-ci</span>
              <span className="font-medium text-white">{formatCurrency(stats.monthlyRevenue)}</span>
            </div>
            <div className="flex items-center justify-between text-sm py-1 border-t" style={{ borderColor: '#334155' }}>
              <span style={{ color: '#94a3b8' }}>Moyenne par boutique</span>
              <span className="font-medium text-white">{formatCurrency(Math.round(stats.monthlyRevenue / Math.max(1, stats.activeCompanies)))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Essais expirés + Activités récentes (avec serveur) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Essais expirés */}
        <div className="p-4 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-white">Essais expirés — à relancer</h3>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
              {expiredTrials.length}
            </span>
          </div>
          <div className="space-y-2 max-h-[250px] overflow-y-auto">
            {expiredTrials.map((trial) => (
              <div key={trial.id} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                <div>
                  <p className="text-sm font-medium text-white">{trial.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: '#64748b' }}>{trial.company}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                      {trial.server}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                    J-{trial.days}
                  </span>
                  <button className="px-3 py-1 rounded text-xs font-medium transition hover:bg-green-500/20" style={{ color: '#22c55e' }}>
                    Relancer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activités récentes (avec serveur) */}
        <div className="p-4 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-white">Activités récentes</h3>
            <button className="text-xs flex items-center gap-1" style={{ color: '#818cf8' }}>
              Voir tout
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2 max-h-[250px] overflow-y-auto">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                <div className="flex items-center gap-2">
                  {getStatusIcon(activity.status)}
                  <div>
                    <p className="text-sm text-white">{activity.action}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: '#64748b' }}>{activity.company} • {activity.user}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                        {activity.server}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-xs" style={{ color: '#64748b' }}>{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl border text-center" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-2xl font-bold text-white">1769</p>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Utilisateurs total</p>
        </div>
        <div className="p-3 rounded-xl border text-center" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-2xl font-bold text-white">61</p>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Nouveaux cette semaine</p>
        </div>
        <div className="p-3 rounded-xl border text-center" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-2xl font-bold text-white">525</p>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Messages</p>
        </div>
        <div className="p-3 rounded-xl border text-center" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-2xl font-bold text-white">133</p>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Notifications</p>
        </div>
      </div>
    </div>
  )
}