'use client'

import { useState, useEffect } from 'react'
import {
  CreditCard, Search, Eye, Edit, MoreVertical,
  Check, X, Building2, Calendar, Clock, DollarSign,
  Download, Filter, ChevronDown, Activity, Award,
  TrendingUp, TrendingDown, BarChart3, Users,
  ShoppingBag, AlertTriangle, Receipt, Printer,
  Mail, Send, Smartphone, Banknote, Wallet
} from 'lucide-react'

// Types
interface Payment {
  id: number
  invoiceNumber: string
  company: {
    id: number
    name: string
    country: string
    plan: string
  }
  amount: number
  currency: string
  method: 'cash' | 'mobile_money' | 'card' | 'bank_transfer' | 'other'
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  type: 'subscription' | 'one_time' | 'commission'
  description: string
  paymentDate: string
  dueDate: string
  paidAt?: string
  reference?: string
  subscriptionId?: number
  createdAt: string
  updatedAt: string
  notes?: string
}

// Données mockées
const mockPayments: Payment[] = [
  {
    id: 1,
    invoiceNumber: 'INV-2026-001',
    company: { id: 1, name: 'Bar Le Premium', country: 'Gabon', plan: 'Premium' },
    amount: 11000,
    currency: 'FCFA',
    method: 'mobile_money',
    status: 'completed',
    type: 'subscription',
    description: 'Abonnement Premium - Juin 2026',
    paymentDate: '2026-06-01',
    dueDate: '2026-06-01',
    paidAt: '2026-06-01 10:30:00',
    reference: 'MOB-123456',
    subscriptionId: 1,
    createdAt: '2026-06-01',
    updatedAt: '2026-06-01'
  },
  {
    id: 2,
    invoiceNumber: 'INV-2026-002',
    company: { id: 2, name: 'Snack Le Délice', country: 'Gabon', plan: 'Starter' },
    amount: 5000,
    currency: 'FCFA',
    method: 'cash',
    status: 'completed',
    type: 'subscription',
    description: 'Abonnement Starter - Juin 2026',
    paymentDate: '2026-06-15',
    dueDate: '2026-06-15',
    paidAt: '2026-06-15 14:20:00',
    reference: 'CASH-001',
    subscriptionId: 2,
    createdAt: '2026-06-15',
    updatedAt: '2026-06-15'
  },
  {
    id: 3,
    invoiceNumber: 'INV-2026-003',
    company: { id: 3, name: 'Boîte VIP', country: 'Cameroun', plan: 'Business' },
    amount: 14000,
    currency: 'FCFA',
    method: 'card',
    status: 'completed',
    type: 'subscription',
    description: 'Abonnement Business - Mai 2026',
    paymentDate: '2026-05-20',
    dueDate: '2026-05-20',
    paidAt: '2026-05-20 09:15:00',
    reference: 'CARD-789012',
    subscriptionId: 3,
    createdAt: '2026-05-20',
    updatedAt: '2026-05-20'
  },
  {
    id: 4,
    invoiceNumber: 'INV-2026-004',
    company: { id: 4, name: 'Restaurant La Terrasse', country: 'Côte d\'Ivoire', plan: 'Premium' },
    amount: 11000,
    currency: 'FCFA',
    method: 'bank_transfer',
    status: 'pending',
    type: 'subscription',
    description: 'Abonnement Premium - Avril 2026',
    paymentDate: '2026-04-10',
    dueDate: '2026-04-10',
    reference: 'VIR-345678',
    subscriptionId: 4,
    createdAt: '2026-04-10',
    updatedAt: '2026-04-10',
    notes: 'En attente de confirmation bancaire'
  },
  {
    id: 5,
    invoiceNumber: 'INV-2026-005',
    company: { id: 5, name: 'Bar Le Soleil', country: 'Sénégal', plan: 'Essai' },
    amount: 0,
    currency: 'FCFA',
    method: 'other',
    status: 'completed',
    type: 'subscription',
    description: 'Essai gratuit - Juillet 2026',
    paymentDate: '2026-07-08',
    dueDate: '2026-07-08',
    paidAt: '2026-07-08 12:00:00',
    subscriptionId: 5,
    createdAt: '2026-07-08',
    updatedAt: '2026-07-08'
  },
  {
    id: 6,
    invoiceNumber: 'INV-2026-006',
    company: { id: 1, name: 'Bar Le Premium', country: 'Gabon', plan: 'Premium' },
    amount: 25000,
    currency: 'FCFA',
    method: 'mobile_money',
    status: 'failed',
    type: 'commission',
    description: 'Commission sur ventes - Mars 2026',
    paymentDate: '2026-03-01',
    dueDate: '2026-03-01',
    reference: 'COM-001',
    createdAt: '2026-03-01',
    updatedAt: '2026-03-02',
    notes: 'Échec de paiement, carte expirée'
  },
  {
    id: 7,
    invoiceNumber: 'INV-2026-007',
    company: { id: 3, name: 'Boîte VIP', country: 'Cameroun', plan: 'Business' },
    amount: 45000,
    currency: 'FCFA',
    method: 'card',
    status: 'refunded',
    type: 'one_time',
    description: 'Achat ponctuel - Équipement VIP',
    paymentDate: '2026-02-15',
    dueDate: '2026-02-15',
    paidAt: '2026-02-15 16:00:00',
    reference: 'ONE-002',
    createdAt: '2026-02-15',
    updatedAt: '2026-02-20',
    notes: 'Remboursement effectué suite à annulation'
  },
  {
    id: 8,
    invoiceNumber: 'INV-2026-008',
    company: { id: 2, name: 'Snack Le Délice', country: 'Gabon', plan: 'Starter' },
    amount: 5000,
    currency: 'FCFA',
    method: 'cash',
    status: 'completed',
    type: 'subscription',
    description: 'Abonnement Starter - Mai 2026',
    paymentDate: '2026-05-15',
    dueDate: '2026-05-15',
    paidAt: '2026-05-15 11:45:00',
    reference: 'CASH-002',
    subscriptionId: 2,
    createdAt: '2026-05-15',
    updatedAt: '2026-05-15'
  }
]

const statusConfig = {
  completed: { label: 'Payé', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', icon: Check },
  pending: { label: 'En attente', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: Clock },
  failed: { label: 'Échoué', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', icon: X },
  refunded: { label: 'Remboursé', color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)', icon: X }
}

const methodConfig = {
  cash: { label: 'Espèces', color: '#f59e0b', icon: Banknote },
  mobile_money: { label: 'Mobile Money', color: '#3b82f6', icon: Smartphone },
  card: { label: 'Carte bancaire', color: '#8b5cf6', icon: CreditCard },
  bank_transfer: { label: 'Virement', color: '#22c55e', icon: Wallet },
  other: { label: 'Autre', color: '#64748b', icon: Receipt }
}

const typeColors = {
  subscription: '#818cf8',
  one_time: '#f59e0b',
  commission: '#8b5cf6'
}

export default function SuperAdminPaiements() {
  const [payments, setPayments] = useState<Payment[]>(mockPayments)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedMethod, setSelectedMethod] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedCompany, setSelectedCompany] = useState('all')
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const statuses = ['all', ...new Set(payments.map(p => p.status))]
  const methods = ['all', ...new Set(payments.map(p => p.method))]
  const types = ['all', ...new Set(payments.map(p => p.type))]
  const companies = ['all', ...new Set(payments.map(p => p.company.name))]

  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus
    const matchesMethod = selectedMethod === 'all' || p.method === selectedMethod
    const matchesType = selectedType === 'all' || p.type === selectedType
    const matchesCompany = selectedCompany === 'all' || p.company.name === selectedCompany
    return matchesSearch && matchesStatus && matchesMethod && matchesType && matchesCompany
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

  const getMethodBadge = (method: string) => {
    const config = methodConfig[method as keyof typeof methodConfig]
    if (!config) return null
    const Icon = config.icon
    return (
      <span 
        className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
        style={{ background: `${config.color}20`, color: config.color }}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    )
  }

  const getTypeBadge = (type: string) => {
    const color = typeColors[type as keyof typeof typeColors] || '#64748b'
    return (
      <span 
        className="text-xs px-2 py-0.5 rounded-full"
        style={{ background: `${color}20`, color: color }}
      >
        {type}
      </span>
    )
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + ' FCFA'
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // Stats
  const totalPayments = payments.length
  const totalAmount = payments.reduce((acc, p) => acc + p.amount, 0)
  const completedAmount = payments
    .filter(p => p.status === 'completed')
    .reduce((acc, p) => acc + p.amount, 0)
  const pendingAmount = payments
    .filter(p => p.status === 'pending')
    .reduce((acc, p) => acc + p.amount, 0)
  const failedAmount = payments
    .filter(p => p.status === 'failed')
    .reduce((acc, p) => acc + p.amount, 0)

  const paymentByMethod = payments.reduce((acc, p) => {
    if (p.status === 'completed') {
      acc[p.method] = (acc[p.method] || 0) + p.amount
    }
    return acc
  }, {} as Record<string, number>)

  const paymentByType = payments.reduce((acc, p) => {
    if (p.status === 'completed') {
      acc[p.type] = (acc[p.type] || 0) + p.amount
    }
    return acc
  }, {} as Record<string, number>)

  return (
    <div className={`space-y-6 transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Paiements</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            Vue globale des paiements de toutes les entreprises
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
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimer</span>
          </button>
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

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Total paiements</p>
          <p className="text-xl font-bold text-white">{totalPayments}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Montant total</p>
          <p className="text-xl font-bold" style={{ color: '#22c55e' }}>{formatCurrency(totalAmount)}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Payés</p>
          <p className="text-xl font-bold" style={{ color: '#22c55e' }}>{formatCurrency(completedAmount)}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>En attente</p>
          <p className="text-xl font-bold" style={{ color: '#f59e0b' }}>{formatCurrency(pendingAmount)}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Échoués</p>
          <p className="text-xl font-bold" style={{ color: '#ef4444' }}>{formatCurrency(failedAmount)}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
          <input
            type="text"
            placeholder="Rechercher une facture, entreprise ou description..."
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
          <option value="completed">Payé</option>
          <option value="pending">En attente</option>
          <option value="failed">Échoué</option>
          <option value="refunded">Remboursé</option>
        </select>
        <select
          value={selectedMethod}
          onChange={(e) => setSelectedMethod(e.target.value)}
          className="rounded-lg px-3 py-2.5 text-white text-sm outline-none transition"
          style={{ 
            background: 'rgba(51, 65, 85, 0.5)',
            border: '1px solid #334155'
          }}
        >
          <option value="all">Tous les moyens</option>
          <option value="cash">Espèces</option>
          <option value="mobile_money">Mobile Money</option>
          <option value="card">Carte bancaire</option>
          <option value="bank_transfer">Virement</option>
          <option value="other">Autre</option>
        </select>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="rounded-lg px-3 py-2.5 text-white text-sm outline-none transition"
          style={{ 
            background: 'rgba(51, 65, 85, 0.5)',
            border: '1px solid #334155'
          }}
        >
          <option value="all">Tous les types</option>
          <option value="subscription">Abonnement</option>
          <option value="one_time">Ponctuel</option>
          <option value="commission">Commission</option>
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

      {/* Analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Répartition par moyen de paiement */}
        <div className="p-4 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <h3 className="font-semibold text-sm text-white mb-3">Répartition par moyen de paiement</h3>
          <div className="space-y-2">
            {Object.entries(paymentByMethod).map(([method, amount]) => {
              const percentage = totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0
              const config = methodConfig[method as keyof typeof methodConfig]
              return (
                <div key={method}>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: config?.color || '#64748b' }} />
                      <span style={{ color: '#94a3b8' }}>{config?.label || method}</span>
                    </div>
                    <span className="font-medium text-white">{formatCurrency(amount)}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full mt-1" style={{ background: '#334155' }}>
                    <div className="h-1.5 rounded-full" style={{ width: `${percentage}%`, background: config?.color || '#64748b' }} />
                  </div>
                </div>
              )
            })}
            {Object.keys(paymentByMethod).length === 0 && (
              <p className="text-sm text-center" style={{ color: '#64748b' }}>Aucune donnée disponible</p>
            )}
          </div>
        </div>

        {/* Répartition par type */}
        <div className="p-4 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <h3 className="font-semibold text-sm text-white mb-3">Répartition par type</h3>
          <div className="space-y-2">
            {Object.entries(paymentByType).map(([type, amount]) => {
              const percentage = totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0
              const color = typeColors[type as keyof typeof typeColors] || '#64748b'
              return (
                <div key={type}>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: color }} />
                      <span style={{ color: '#94a3b8' }}>{type}</span>
                    </div>
                    <span className="font-medium text-white">{formatCurrency(amount)}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full mt-1" style={{ background: '#334155' }}>
                    <div className="h-1.5 rounded-full" style={{ width: `${percentage}%`, background: color }} />
                  </div>
                </div>
              )
            })}
            {Object.keys(paymentByType).length === 0 && (
              <p className="text-sm text-center" style={{ color: '#64748b' }}>Aucune donnée disponible</p>
            )}
          </div>
        </div>
      </div>

      {/* Tableau des paiements */}
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
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Facture</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Entreprise</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Montant</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Méthode</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="border-b hover:bg-white/5 transition" style={{ borderColor: '#334155' }}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-white">{payment.invoiceNumber}</p>
                      <span className="text-xs" style={{ color: '#64748b' }}>ID: #{payment.id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" style={{ color: '#64748b' }} />
                      <span className="text-xs" style={{ color: '#94a3b8' }}>{payment.company.name}</span>
                    </div>
                    <span className="text-xs" style={{ color: '#64748b' }}>{payment.company.country}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold" style={{ color: payment.status === 'completed' ? '#22c55e' : payment.status === 'failed' ? '#ef4444' : '#f59e0b' }}>
                      {formatCurrency(payment.amount)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {getMethodBadge(payment.method)}
                  </td>
                  <td className="px-4 py-3">
                    {getTypeBadge(payment.type)}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(payment.status)}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-xs" style={{ color: '#94a3b8' }}>{formatDate(payment.paymentDate)}</p>
                      {payment.paidAt && (
                        <span className="text-xs" style={{ color: '#64748b' }}>Payé: {new Date(payment.paidAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button 
                        onClick={() => { setSelectedPayment(payment); setIsModalOpen(true) }}
                        className="p-1.5 rounded transition hover:bg-white/10"
                        style={{ color: '#94a3b8' }}
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {payment.status === 'pending' && (
                        <button className="p-1.5 rounded transition hover:bg-green-500/20" style={{ color: '#22c55e' }} title="Valider">
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      {payment.status === 'completed' && (
                        <button className="p-1.5 rounded transition hover:bg-white/10" style={{ color: '#94a3b8' }} title="Imprimer">
                          <Printer className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredPayments.length === 0 && (
          <div className="p-8 text-center">
            <CreditCard className="w-12 h-12 mx-auto mb-2" style={{ color: '#334155' }} />
            <p className="text-sm" style={{ color: '#64748b' }}>Aucun paiement trouvé</p>
          </div>
        )}
      </div>

      {/* MODAL DÉTAILS PAIEMENT */}
      {isModalOpen && selectedPayment && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="w-full max-w-2xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
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
                  <Receipt className="w-6 h-6" style={{ color: '#818cf8' }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedPayment.invoiceNumber}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: '#64748b' }}>ID: #{selectedPayment.id}</span>
                    <span className="text-xs" style={{ color: '#64748b' }}>•</span>
                    <span className="text-xs" style={{ color: '#64748b' }}>{selectedPayment.company.name}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded hover:bg-white/10" style={{ color: '#94a3b8' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Infos principales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Montant</p>
                  <p className="text-xl font-bold" style={{ color: '#22c55e' }}>{formatCurrency(selectedPayment.amount)}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Statut</p>
                  <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Méthode</p>
                  <div className="mt-1">{getMethodBadge(selectedPayment.method)}</div>
                </div>
              </div>

              {/* Détails */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Type</p>
                  <p className="text-sm font-medium text-white">{selectedPayment.type}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Description</p>
                  <p className="text-sm font-medium text-white">{selectedPayment.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Date d'échéance</p>
                  <p className="text-sm font-medium text-white">{formatDate(selectedPayment.dueDate)}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Date de paiement</p>
                  <p className="text-sm font-medium text-white">{selectedPayment.paidAt ? formatDate(selectedPayment.paidAt) : 'Non payé'}</p>
                </div>
              </div>

              {/* Référence */}
              {selectedPayment.reference && (
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Référence</p>
                  <p className="text-sm font-medium text-white">{selectedPayment.reference}</p>
                </div>
              )}

              {/* Notes */}
              {selectedPayment.notes && (
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Notes</p>
                  <p className="text-sm text-white">{selectedPayment.notes}</p>
                </div>
              )}

              {/* Entreprise */}
              <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Entreprise</p>
                <div className="flex items-center gap-2 mt-1">
                  <Building2 className="w-4 h-4" style={{ color: '#818cf8' }} />
                  <span className="font-medium text-white">{selectedPayment.company.name}</span>
                  <span className="text-xs" style={{ color: '#64748b' }}>({selectedPayment.company.country})</span>
                </div>
                <span className="text-xs" style={{ color: '#64748b' }}>Plan: {selectedPayment.company.plan}</span>
              </div>
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
              {selectedPayment.status === 'pending' && (
                <button
                  className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition flex items-center justify-center gap-2"
                  style={{ 
                    background: '#22c55e',
                    boxShadow: '0 10px 25px -5px rgba(34, 197, 94, 0.3)'
                  }}
                >
                  <Check className="w-4 h-4" />
                  Valider le paiement
                </button>
              )}
              {selectedPayment.status === 'failed' && (
                <button
                  className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition flex items-center justify-center gap-2"
                  style={{ 
                    background: '#4f46e5',
                    boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  <Send className="w-4 h-4" />
                  Relancer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}