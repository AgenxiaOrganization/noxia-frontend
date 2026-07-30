'use client'

import { useState, useEffect } from 'react'
import {
  CreditCard, Search, Eye, Edit, Trash2, MoreVertical,
  Check, X, Building2, Calendar, Clock, DollarSign,
  Download, Filter, ChevronDown, Activity, Award,
  TrendingUp, TrendingDown, BarChart3, Users,
  ShoppingBag, AlertTriangle, Crown, Star, Gift,
  Zap, Target, RefreshCw, Mail, Send,
  Plus
} from 'lucide-react'

// Types
interface Subscription {
  id: number
  company: {
    id: number
    name: string
    country: string
    plan: string
  }
  plan: {
    id: number
    name: string
    code: string
    price: number
    trialDays: number
  }
  status: 'active' | 'trial' | 'expired' | 'cancelled' | 'pending'
  startDate: string
  endDate: string
  trialEnd?: string
  autoRenew: boolean
  paymentMethod: 'cash' | 'mobile_money' | 'card' | 'bank_transfer'
  amount: number
  currency: string
  lastPaymentDate: string
  nextPaymentDate: string
  paymentHistory: {
    id: number
    date: string
    amount: number
    status: 'paid' | 'pending' | 'failed'
    method: string
  }[]
  createdAt: string
  updatedAt: string
  notes?: string
}

// Données mockées
const mockSubscriptions: Subscription[] = [
  {
    id: 1,
    company: { id: 1, name: 'Bar Le Premium', country: 'Gabon', plan: 'Premium' },
    plan: { id: 1, name: 'Premium', code: 'PREMIUM', price: 11000, trialDays: 0 },
    status: 'active',
    startDate: '2026-06-01',
    endDate: '2026-07-01',
    autoRenew: true,
    paymentMethod: 'mobile_money',
    amount: 11000,
    currency: 'FCFA',
    lastPaymentDate: '2026-06-01',
    nextPaymentDate: '2026-07-01',
    paymentHistory: [
      { id: 1, date: '2026-06-01', amount: 11000, status: 'paid', method: 'Mobile Money' },
      { id: 2, date: '2026-05-01', amount: 11000, status: 'paid', method: 'Mobile Money' },
      { id: 3, date: '2026-04-01', amount: 11000, status: 'paid', method: 'Carte' }
    ],
    createdAt: '2026-06-01',
    updatedAt: '2026-07-10',
    notes: 'Client fidèle, paiement ponctuel'
  },
  {
    id: 2,
    company: { id: 2, name: 'Snack Le Délice', country: 'Gabon', plan: 'Starter' },
    plan: { id: 2, name: 'Starter', code: 'STARTER', price: 5000, trialDays: 5 },
    status: 'active',
    startDate: '2026-06-15',
    endDate: '2026-07-15',
    trialEnd: '2026-06-20',
    autoRenew: false,
    paymentMethod: 'cash',
    amount: 5000,
    currency: 'FCFA',
    lastPaymentDate: '2026-06-15',
    nextPaymentDate: '2026-07-15',
    paymentHistory: [
      { id: 4, date: '2026-06-15', amount: 5000, status: 'paid', method: 'Espèces' }
    ],
    createdAt: '2026-06-15',
    updatedAt: '2026-07-09',
    notes: 'Essai gratuit terminé, passage en Starter'
  },
  {
    id: 3,
    company: { id: 3, name: 'Boîte VIP', country: 'Cameroun', plan: 'Business' },
    plan: { id: 3, name: 'Business', code: 'BUSINESS', price: 14000, trialDays: 0 },
    status: 'active',
    startDate: '2026-05-20',
    endDate: '2026-06-20',
    autoRenew: true,
    paymentMethod: 'card',
    amount: 14000,
    currency: 'FCFA',
    lastPaymentDate: '2026-05-20',
    nextPaymentDate: '2026-06-20',
    paymentHistory: [
      { id: 5, date: '2026-05-20', amount: 14000, status: 'paid', method: 'Carte bancaire' },
      { id: 6, date: '2026-04-20', amount: 14000, status: 'paid', method: 'Carte bancaire' }
    ],
    createdAt: '2026-05-20',
    updatedAt: '2026-07-08',
    notes: 'Premium client, paiement automatique'
  },
  {
    id: 4,
    company: { id: 4, name: 'Restaurant La Terrasse', country: 'Côte d\'Ivoire', plan: 'Premium' },
    plan: { id: 1, name: 'Premium', code: 'PREMIUM', price: 11000, trialDays: 0 },
    status: 'expired',
    startDate: '2026-04-10',
    endDate: '2026-05-10',
    autoRenew: false,
    paymentMethod: 'bank_transfer',
    amount: 11000,
    currency: 'FCFA',
    lastPaymentDate: '2026-04-10',
    nextPaymentDate: '2026-05-10',
    paymentHistory: [
      { id: 7, date: '2026-04-10', amount: 11000, status: 'paid', method: 'Virement' },
      { id: 8, date: '2026-03-10', amount: 11000, status: 'paid', method: 'Virement' }
    ],
    createdAt: '2026-04-10',
    updatedAt: '2026-07-05',
    notes: 'Abonnement expiré, relance en cours'
  },
  {
    id: 5,
    company: { id: 5, name: 'Bar Le Soleil', country: 'Sénégal', plan: 'Essai' },
    plan: { id: 4, name: 'Essai', code: 'TRIAL', price: 0, trialDays: 30 },
    status: 'trial',
    startDate: '2026-07-08',
    endDate: '2026-08-08',
    trialEnd: '2026-08-08',
    autoRenew: false,
    paymentMethod: 'cash',
    amount: 0,
    currency: 'FCFA',
    lastPaymentDate: '2026-07-08',
    nextPaymentDate: '2026-08-08',
    paymentHistory: [],
    createdAt: '2026-07-08',
    updatedAt: '2026-07-08',
    notes: 'Nouvel essai, à suivre'
  },
  {
    id: 6,
    company: { id: 1, name: 'Bar Le Premium', country: 'Gabon', plan: 'Premium' },
    plan: { id: 1, name: 'Premium', code: 'PREMIUM', price: 11000, trialDays: 0 },
    status: 'cancelled',
    startDate: '2026-03-01',
    endDate: '2026-04-01',
    autoRenew: false,
    paymentMethod: 'mobile_money',
    amount: 11000,
    currency: 'FCFA',
    lastPaymentDate: '2026-03-01',
    nextPaymentDate: '2026-04-01',
    paymentHistory: [
      { id: 9, date: '2026-03-01', amount: 11000, status: 'paid', method: 'Mobile Money' },
      { id: 10, date: '2026-02-01', amount: 11000, status: 'paid', method: 'Mobile Money' }
    ],
    createdAt: '2026-03-01',
    updatedAt: '2026-04-01',
    notes: 'Annulé, client reparti sur Starter'
  }
]

const statusConfig = {
  active: { label: 'Actif', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', icon: Check },
  trial: { label: 'Essai', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', icon: Gift },
  expired: { label: 'Expiré', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', icon: X },
  cancelled: { label: 'Annulé', color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)', icon: X },
  pending: { label: 'En attente', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: Clock }
}

const planColors = {
  'Premium': '#f59e0b',
  'Starter': '#818cf8',
  'Business': '#8b5cf6',
  'Essai': '#22c55e',
  'Pro': '#ec4899'
}

const paymentMethodColors = {
  cash: { label: 'Espèces', color: '#f59e0b' },
  mobile_money: { label: 'Mobile Money', color: '#3b82f6' },
  card: { label: 'Carte bancaire', color: '#8b5cf6' },
  bank_transfer: { label: 'Virement', color: '#22c55e' }
}

export default function SuperAdminAbonnements() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(mockSubscriptions)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPlan, setSelectedPlan] = useState('all')
  const [selectedCompany, setSelectedCompany] = useState('all')
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const statuses = ['all', ...new Set(subscriptions.map(s => s.status))]
  const plans = ['all', ...new Set(subscriptions.map(s => s.plan.name))]
  const companies = ['all', ...new Set(subscriptions.map(s => s.company.name))]

  const filteredSubscriptions = subscriptions.filter(s => {
    const matchesSearch = s.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.plan.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus
    const matchesPlan = selectedPlan === 'all' || s.plan.name === selectedPlan
    const matchesCompany = selectedCompany === 'all' || s.company.name === selectedCompany
    return matchesSearch && matchesStatus && matchesPlan && matchesCompany
  })

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig]
    if (!config) return null
    const Icon = config.icon
    return (
      <span 
        className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
        style={{ background: config.bg, color: config.color }}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    )
  }

  const getPlanBadge = (planName: string) => {
    const color = planColors[planName as keyof typeof planColors] || '#6366f1'
    return (
      <span 
        className="text-xs px-2 py-0.5 rounded-full font-medium"
        style={{ background: `${color}20`, color: color }}
      >
        {planName}
      </span>
    )
  }

  const getPaymentMethodBadge = (method: string) => {
    const config = paymentMethodColors[method as keyof typeof paymentMethodColors]
    if (!config) return null
    return (
      <span 
        className="text-xs px-2 py-0.5 rounded-full"
        style={{ background: `${config.color}20`, color: config.color }}
      >
        {config.label}
      </span>
    )
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + ' FCFA'
  }

  // Stats
  const totalSubscriptions = subscriptions.length
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length
  const trialSubscriptions = subscriptions.filter(s => s.status === 'trial').length
  const expiredSubscriptions = subscriptions.filter(s => s.status === 'expired').length
  const totalMRR = subscriptions
    .filter(s => s.status === 'active' || s.status === 'trial')
    .reduce((acc, s) => acc + s.amount, 0)

  const planDistribution = subscriptions.reduce((acc, s) => {
    acc[s.plan.name] = (acc[s.plan.name] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className={`space-y-6 transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Abonnements</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            Vue globale des abonnements de toutes les entreprises
          </p>
        </div>
        <div className="flex gap-2">
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
          <button
            className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition flex items-center gap-2"
            style={{ 
              background: '#4f46e5',
              boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
            }}
          >
            <Plus className="w-4 h-4" />
            Ajouter un abonnement
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Total abonnements</p>
          <p className="text-xl font-bold text-white">{totalSubscriptions}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Actifs</p>
          <p className="text-xl font-bold" style={{ color: '#22c55e' }}>{activeSubscriptions}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Essais</p>
          <p className="text-xl font-bold" style={{ color: '#3b82f6' }}>{trialSubscriptions}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Expirés</p>
          <p className="text-xl font-bold" style={{ color: '#ef4444' }}>{expiredSubscriptions}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>MRR</p>
          <p className="text-xl font-bold" style={{ color: '#22c55e' }}>{formatCurrency(totalMRR)}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
          <input
            type="text"
            placeholder="Rechercher une entreprise ou un plan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
            style={{ 
              background: 'rgba(51, 65, 85, 0.5)',
              border: '1px solid #334155'
            }}
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="rounded-lg px-3 py-2.5 text-white text-sm outline-none transition"
          style={{ 
            background: 'rgba(51, 65, 85, 0.5)',
            border: '1px solid #334155'
          }}
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="trial">Essai</option>
          <option value="expired">Expiré</option>
          <option value="cancelled">Annulé</option>
          <option value="pending">En attente</option>
        </select>
        <select
          value={selectedPlan}
          onChange={(e) => setSelectedPlan(e.target.value)}
          className="rounded-lg px-3 py-2.5 text-white text-sm outline-none transition"
          style={{ 
            background: 'rgba(51, 65, 85, 0.5)',
            border: '1px solid #334155'
          }}
        >
          <option value="all">Tous les plans</option>
          {Object.keys(planDistribution).map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          className="rounded-lg px-3 py-2.5 text-white text-sm outline-none transition"
          style={{ 
            background: 'rgba(51, 65, 85, 0.5)',
            border: '1px solid #334155'
          }}
        >
          <option value="all">Toutes les entreprises</option>
          {companies.filter(c => c !== 'all').map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Tableau des abonnements */}
      <div 
        className="rounded-xl border overflow-hidden"
        style={{ 
          background: '#1e293b',
          borderColor: '#334155'
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: '#334155' }}>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Entreprise</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Plan</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Montant</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Période</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Paiement</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.map((sub) => (
                <tr key={sub.id} className="border-b hover:bg-white/5 transition" style={{ borderColor: '#334155' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3 h-3" style={{ color: '#64748b' }} />
                      <span className="text-white">{sub.company.name}</span>
                    </div>
                    <span className="text-xs" style={{ color: '#64748b' }}>{sub.company.country}</span>
                  </td>
                  <td className="px-4 py-3">
                    {getPlanBadge(sub.plan.name)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold" style={{ color: '#22c55e' }}>
                      {formatCurrency(sub.amount)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(sub.status)}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-xs" style={{ color: '#94a3b8' }}>
                        {sub.startDate} → {sub.endDate}
                      </p>
                      {sub.trialEnd && (
                        <p className="text-xs" style={{ color: '#3b82f6' }}>
                          Essai jusqu'au {sub.trialEnd}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      {getPaymentMethodBadge(sub.paymentMethod)}
                      <p className="text-xs" style={{ color: '#64748b' }}>
                        Prochain: {sub.nextPaymentDate}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button 
                        onClick={() => { setSelectedSubscription(sub); setIsModalOpen(true) }}
                        className="p-1.5 rounded transition hover:bg-white/10"
                        style={{ color: '#94a3b8' }}
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded transition hover:bg-white/10" style={{ color: '#94a3b8' }} title="Modifier">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded transition hover:bg-red-500/20" style={{ color: '#f87171' }} title="Supprimer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredSubscriptions.length === 0 && (
          <div className="p-8 text-center">
            <CreditCard className="w-12 h-12 mx-auto mb-2" style={{ color: '#334155' }} />
            <p className="text-sm" style={{ color: '#64748b' }}>Aucun abonnement trouvé</p>
          </div>
        )}
      </div>

      {/* MODAL DÉTAILS ABONNEMENT */}
      {isModalOpen && selectedSubscription && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="w-full max-w-3xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            style={{ 
              background: '#1e293b',
              border: '1px solid #334155'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white"
                  style={{ background: 'rgba(99, 102, 241, 0.2)' }}
                >
                  <CreditCard className="w-6 h-6" style={{ color: '#818cf8' }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedSubscription.company.name}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: '#64748b' }}>ID: #{selectedSubscription.id}</span>
                    <span className="text-xs" style={{ color: '#64748b' }}>•</span>
                    <span className="text-xs" style={{ color: '#64748b' }}>{selectedSubscription.company.country}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded hover:bg-white/10" style={{ color: '#94a3b8' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Infos principales */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Plan</p>
                  <div className="mt-1">{getPlanBadge(selectedSubscription.plan.name)}</div>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Montant</p>
                  <p className="text-lg font-bold" style={{ color: '#22c55e' }}>{formatCurrency(selectedSubscription.amount)}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Statut</p>
                  <div className="mt-1">{getStatusBadge(selectedSubscription.status)}</div>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Renouvellement</p>
                  <p className="text-sm font-medium text-white">
                    {selectedSubscription.autoRenew ? '✅ Automatique' : '❌ Manuel'}
                  </p>
                </div>
              </div>

              {/* Période */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Début</p>
                  <p className="text-sm font-medium text-white">{selectedSubscription.startDate}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Fin</p>
                  <p className="text-sm font-medium text-white">{selectedSubscription.endDate}</p>
                </div>
                {selectedSubscription.trialEnd && (
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>Fin essai</p>
                    <p className="text-sm font-medium" style={{ color: '#3b82f6' }}>{selectedSubscription.trialEnd}</p>
                  </div>
                )}
              </div>

              {/* Paiements */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Dernier paiement</p>
                  <p className="text-sm font-medium text-white">{selectedSubscription.lastPaymentDate}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Prochain paiement</p>
                  <p className="text-sm font-medium text-white">{selectedSubscription.nextPaymentDate}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Méthode</p>
                  <div className="mt-1">{getPaymentMethodBadge(selectedSubscription.paymentMethod)}</div>
                </div>
              </div>

              {/* Historique des paiements */}
              <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Historique des paiements</p>
                <div className="space-y-1 mt-1">
                  {selectedSubscription.paymentHistory.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between text-sm p-1.5 rounded" style={{ background: 'rgba(51, 65, 85, 0.2)' }}>
                      <span className="text-white">{payment.date}</span>
                      <span style={{ color: '#22c55e' }}>{formatCurrency(payment.amount)}</span>
                      <span className="text-xs" style={{ color: payment.status === 'paid' ? '#22c55e' : payment.status === 'pending' ? '#f59e0b' : '#ef4444' }}>
                        {payment.status === 'paid' ? '✅ Payé' : payment.status === 'pending' ? '⏳ En attente' : '❌ Échoué'}
                      </span>
                      <span className="text-xs" style={{ color: '#64748b' }}>{payment.method}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedSubscription.notes && (
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Notes</p>
                  <p className="text-sm text-white">{selectedSubscription.notes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t" style={{ borderColor: '#334155' }}>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition"
                style={{ 
                  background: 'transparent',
                  border: '1px solid #334155',
                  color: '#94a3b8'
                }}
              >
                Fermer
              </button>
              <button
                className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition flex items-center justify-center gap-2"
                style={{ 
                  background: '#4f46e5',
                  boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
                }}
              >
                <Mail className="w-4 h-4" />
                Relancer
              </button>
              <button
                className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition"
                style={{ 
                  background: '#22c55e',
                  boxShadow: '0 10px 25px -5px rgba(34, 197, 94, 0.3)'
                }}
              >
                Renouveler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}