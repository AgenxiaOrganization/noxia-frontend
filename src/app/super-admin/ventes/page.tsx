'use client'

import { useState, useEffect } from 'react'
import {
  ShoppingBag, Search, Eye, Download, Filter, ChevronDown,
  TrendingUp, TrendingDown, DollarSign, Calendar, Clock,
  Building2, Users, Package, CreditCard, Smartphone, Banknote,
  X, BarChart3, PieChart, Activity, Award, Zap, Target,
  CheckCircle, AlertTriangle, MoreVertical, Printer, Receipt
} from 'lucide-react'

// Types
interface Sale {
  id: number
  invoiceNumber: string
  product: string
  category: string
  quantity: number
  unitPrice: number
  totalAmount: number
  paymentMethod: 'cash' | 'mobile_money' | 'card' | 'other'
  status: 'completed' | 'pending' | 'refunded' | 'cancelled'
  company: {
    id: number
    name: string
    country: string
    plan: string
  }
  cashier: string
  customerName?: string
  createdAt: string
  updatedAt: string
}

// Données mockées
const mockSales: Sale[] = [
  {
    id: 1,
    invoiceNumber: 'INV-2026-001',
    product: 'Bière Castel 65cl',
    category: 'Boisson',
    quantity: 3,
    unitPrice: 1500,
    totalAmount: 4500,
    paymentMethod: 'cash',
    status: 'completed',
    company: { id: 1, name: 'Bar Le Premium', country: 'Gabon', plan: 'Premium' },
    cashier: 'Jean M.',
    customerName: 'Client régulier',
    createdAt: '2026-07-10 14:30:00',
    updatedAt: '2026-07-10 14:30:00'
  },
  {
    id: 2,
    invoiceNumber: 'INV-2026-002',
    product: 'Whisky Jack Daniel\'s',
    category: 'Boisson',
    quantity: 1,
    unitPrice: 25000,
    totalAmount: 25000,
    paymentMethod: 'mobile_money',
    status: 'completed',
    company: { id: 2, name: 'Snack Le Délice', country: 'Gabon', plan: 'Starter' },
    cashier: 'Marie K.',
    customerName: 'M. Dupont',
    createdAt: '2026-07-10 13:15:00',
    updatedAt: '2026-07-10 13:15:00'
  },
  {
    id: 3,
    invoiceNumber: 'INV-2026-003',
    product: 'Champagne Moet',
    category: 'Boisson',
    quantity: 2,
    unitPrice: 45000,
    totalAmount: 90000,
    paymentMethod: 'card',
    status: 'completed',
    company: { id: 3, name: 'Boîte VIP', country: 'Cameroun', plan: 'Business' },
    cashier: 'Pierre N.',
    customerName: 'VIP Client',
    createdAt: '2026-07-10 12:00:00',
    updatedAt: '2026-07-10 12:00:00'
  },
  {
    id: 4,
    invoiceNumber: 'INV-2026-004',
    product: 'Burger Classic',
    category: 'Nourriture',
    quantity: 2,
    unitPrice: 4000,
    totalAmount: 8000,
    paymentMethod: 'cash',
    status: 'completed',
    company: { id: 4, name: 'Restaurant La Terrasse', country: 'Côte d\'Ivoire', plan: 'Premium' },
    cashier: 'Sophie N.',
    customerName: 'Mme Koffi',
    createdAt: '2026-07-10 11:30:00',
    updatedAt: '2026-07-10 11:30:00'
  },
  {
    id: 5,
    invoiceNumber: 'INV-2026-005',
    product: 'Chicha Session',
    category: 'Service',
    quantity: 1,
    unitPrice: 10000,
    totalAmount: 10000,
    paymentMethod: 'mobile_money',
    status: 'pending',
    company: { id: 5, name: 'Bar Le Soleil', country: 'Sénégal', plan: 'Essai' },
    cashier: 'Alain B.',
    customerName: 'Groupe d\'amis',
    createdAt: '2026-07-10 10:45:00',
    updatedAt: '2026-07-10 10:45:00'
  },
  {
    id: 6,
    invoiceNumber: 'INV-2026-006',
    product: 'Vodka Absolut',
    category: 'Boisson',
    quantity: 2,
    unitPrice: 20000,
    totalAmount: 40000,
    paymentMethod: 'cash',
    status: 'completed',
    company: { id: 1, name: 'Bar Le Premium', country: 'Gabon', plan: 'Premium' },
    cashier: 'Chloé R.',
    customerName: 'Client VIP',
    createdAt: '2026-07-10 09:00:00',
    updatedAt: '2026-07-10 09:00:00'
  },
  {
    id: 7,
    invoiceNumber: 'INV-2026-007',
    product: 'Brochettes Poulet',
    category: 'Nourriture',
    quantity: 4,
    unitPrice: 3500,
    totalAmount: 14000,
    paymentMethod: 'card',
    status: 'refunded',
    company: { id: 2, name: 'Snack Le Délice', country: 'Gabon', plan: 'Starter' },
    cashier: 'François T.',
    customerName: 'M. Ndong',
    createdAt: '2026-07-09 20:00:00',
    updatedAt: '2026-07-09 20:30:00'
  },
  {
    id: 8,
    invoiceNumber: 'INV-2026-008',
    product: 'Cocktail Mojito',
    category: 'Boisson',
    quantity: 3,
    unitPrice: 5000,
    totalAmount: 15000,
    paymentMethod: 'cash',
    status: 'completed',
    company: { id: 3, name: 'Boîte VIP', country: 'Cameroun', plan: 'Business' },
    cashier: 'Pierre N.',
    customerName: 'Groupe d\'amis',
    createdAt: '2026-07-09 19:30:00',
    updatedAt: '2026-07-09 19:30:00'
  }
]

const paymentLabels = {
  cash: 'Espèces',
  mobile_money: 'Mobile Money',
  card: 'Carte bancaire',
  other: 'Autre'
}

const paymentIcons = {
  cash: Banknote,
  mobile_money: Smartphone,
  card: CreditCard,
  other: Receipt
}

const paymentColors = {
  cash: '#f59e0b',
  mobile_money: '#3b82f6',
  card: '#8b5cf6',
  other: '#64748b'
}

const statusConfig = {
  completed: { label: 'Validée', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', icon: CheckCircle },
  pending: { label: 'En attente', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: Clock },
  refunded: { label: 'Remboursée', color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)', icon: X },
  cancelled: { label: 'Annulée', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', icon: X }
}

export default function SuperAdminVentes() {
  const [sales, setSales] = useState<Sale[]>(mockSales)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCompany, setSelectedCompany] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPayment, setSelectedPayment] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const companies = ['all', ...new Set(sales.map(s => s.company.name))]
  const statuses = ['all', ...new Set(sales.map(s => s.status))]
  const paymentMethods = ['all', ...new Set(sales.map(s => s.paymentMethod))]
  const categories = ['all', ...new Set(sales.map(s => s.category))]

  const filteredSales = sales.filter(s => {
    const matchesSearch = s.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.cashier.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCompany = selectedCompany === 'all' || s.company.name === selectedCompany
    const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus
    const matchesPayment = selectedPayment === 'all' || s.paymentMethod === selectedPayment
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory
    return matchesSearch && matchesCompany && matchesStatus && matchesPayment && matchesCategory
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

  const getPaymentBadge = (method: string) => {
    const Icon = paymentIcons[method as keyof typeof paymentIcons] || Banknote
    const label = paymentLabels[method as keyof typeof paymentLabels] || method
    const color = paymentColors[method as keyof typeof paymentColors] || '#64748b'
    return (
      <span 
        className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
        style={{ background: `${color}20`, color: color }}
      >
        <Icon className="w-3 h-3" />
        {label}
      </span>
    )
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + ' F'
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  // Stats
  const totalSales = sales.length
  const totalRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0)
  const completedSales = sales.filter(s => s.status === 'completed').length
  const pendingSales = sales.filter(s => s.status === 'pending').length
  const averageTicket = Math.round(totalRevenue / totalSales)

  const revenueByPayment = sales.reduce((acc, s) => {
    acc[s.paymentMethod] = (acc[s.paymentMethod] || 0) + s.totalAmount
    return acc
  }, {} as Record<string, number>)

  const revenueByCategory = sales.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + s.totalAmount
    return acc
  }, {} as Record<string, number>)

  const topCashiers = sales.reduce((acc, s) => {
    if (s.status === 'completed') {
      acc[s.cashier] = (acc[s.cashier] || 0) + s.totalAmount
    }
    return acc
  }, {} as Record<string, number>)

  const sortedCashiers = Object.entries(topCashiers).sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <div className={`space-y-6 transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Ventes</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            Vue globale des ventes de toutes les entreprises
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
          <p className="text-xs" style={{ color: '#94a3b8' }}>Total ventes</p>
          <p className="text-xl font-bold text-white">{totalSales}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Chiffre d'affaires</p>
          <p className="text-xl font-bold" style={{ color: '#22c55e' }}>{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Panier moyen</p>
          <p className="text-xl font-bold text-white">{formatCurrency(averageTicket)}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Validées</p>
          <p className="text-xl font-bold" style={{ color: '#22c55e' }}>{completedSales}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>En attente</p>
          <p className="text-xl font-bold" style={{ color: '#f59e0b' }}>{pendingSales}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
          <input
            type="text"
            placeholder="Rechercher une vente (facture, produit, caissier)..."
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
          <option value="completed">Validée</option>
          <option value="pending">En attente</option>
          <option value="refunded">Remboursée</option>
          <option value="cancelled">Annulée</option>
        </select>
        <select
          value={selectedPayment}
          onChange={(e) => setSelectedPayment(e.target.value)}
          className="rounded-lg px-3 py-2.5 text-white text-sm outline-none transition"
          style={{ 
            background: 'rgba(51, 65, 85, 0.5)',
            border: '1px solid #334155'
          }}
        >
          <option value="all">Tous les paiements</option>
          <option value="cash">Espèces</option>
          <option value="mobile_money">Mobile Money</option>
          <option value="card">Carte bancaire</option>
          <option value="other">Autre</option>
        </select>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-lg px-3 py-2.5 text-white text-sm outline-none transition"
          style={{ 
            background: 'rgba(51, 65, 85, 0.5)',
            border: '1px solid #334155'
          }}
        >
          <option value="all">Toutes les catégories</option>
          {categories.filter(c => c !== 'all').map(c => (
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
            {Object.entries(revenueByPayment).map(([method, amount]) => {
              const percentage = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0
              const color = paymentColors[method as keyof typeof paymentColors] || '#64748b'
              return (
                <div key={method}>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: color }} />
                      <span style={{ color: '#94a3b8' }}>{paymentLabels[method as keyof typeof paymentLabels] || method}</span>
                    </div>
                    <span className="font-medium text-white">{formatCurrency(amount)}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full mt-1" style={{ background: '#334155' }}>
                    <div className="h-1.5 rounded-full" style={{ width: `${percentage}%`, background: color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top caissiers */}
        <div className="p-4 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <h3 className="font-semibold text-sm text-white mb-3">Top caissiers</h3>
          <div className="space-y-2">
            {sortedCashiers.map(([cashier, amount], index) => {
              const percentage = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0
              const colors = ['#22c55e', '#818cf8', '#f59e0b', '#8b5cf6', '#ec4899']
              return (
                <div key={cashier} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: colors[index % colors.length] }}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">{cashier}</span>
                      <span className="text-sm font-medium" style={{ color: '#22c55e' }}>{formatCurrency(amount)}</span>
                    </div>
                    <div className="w-full h-1 rounded-full mt-1" style={{ background: '#334155' }}>
                      <div className="h-1 rounded-full" style={{ width: `${Math.min(100, percentage * 2)}%`, background: colors[index % colors.length] }} />
                    </div>
                  </div>
                </div>
              )
            })}
            {sortedCashiers.length === 0 && (
              <p className="text-sm text-center" style={{ color: '#64748b' }}>Aucune donnée disponible</p>
            )}
          </div>
        </div>
      </div>

      {/* Tableau des ventes */}
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
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Produit</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Entreprise</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Montant</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Paiement</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="border-b hover:bg-white/5 transition" style={{ borderColor: '#334155' }}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-white">{sale.invoiceNumber}</p>
                      <span className="text-xs" style={{ color: '#64748b' }}>ID: #{sale.id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-white">{sale.product}</p>
                      <span className="text-xs" style={{ color: '#64748b' }}>{sale.quantity} × {formatCurrency(sale.unitPrice)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" style={{ color: '#64748b' }} />
                      <span className="text-xs" style={{ color: '#94a3b8' }}>{sale.company.name}</span>
                    </div>
                    <span className="text-xs" style={{ color: '#64748b' }}>{sale.company.country}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold" style={{ color: '#22c55e' }}>{formatCurrency(sale.totalAmount)}</span>
                  </td>
                  <td className="px-4 py-3">
                    {getPaymentBadge(sale.paymentMethod)}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(sale.status)}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-xs" style={{ color: '#94a3b8' }}>{formatDate(sale.createdAt)}</p>
                      <span className="text-xs" style={{ color: '#64748b' }}>{sale.cashier}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button 
                        onClick={() => { setSelectedSale(sale); setIsModalOpen(true) }}
                        className="p-1.5 rounded transition hover:bg-white/10"
                        style={{ color: '#94a3b8' }}
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded transition hover:bg-white/10" style={{ color: '#94a3b8' }} title="Imprimer">
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredSales.length === 0 && (
          <div className="p-8 text-center">
            <ShoppingBag className="w-12 h-12 mx-auto mb-2" style={{ color: '#334155' }} />
            <p className="text-sm" style={{ color: '#64748b' }}>Aucune vente trouvée</p>
          </div>
        )}
      </div>

      {/* MODAL DÉTAILS VENTE */}
      {isModalOpen && selectedSale && (
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
                  <h2 className="text-xl font-bold text-white">{selectedSale.invoiceNumber}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: '#64748b' }}>ID: #{selectedSale.id}</span>
                    <span className="text-xs" style={{ color: '#64748b' }}>•</span>
                    <span className="text-xs" style={{ color: '#64748b' }}>{selectedSale.product}</span>
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
                  <p className="text-xl font-bold" style={{ color: '#22c55e' }}>{formatCurrency(selectedSale.totalAmount)}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Statut</p>
                  <div className="mt-1">{getStatusBadge(selectedSale.status)}</div>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Paiement</p>
                  <div className="mt-1">{getPaymentBadge(selectedSale.paymentMethod)}</div>
                </div>
              </div>

              {/* Détails produit */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Produit</p>
                  <p className="text-sm font-medium text-white">{selectedSale.product}</p>
                  <span className="text-xs" style={{ color: '#64748b' }}>{selectedSale.category}</span>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Quantité</p>
                  <p className="text-sm font-medium text-white">{selectedSale.quantity}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Prix unitaire</p>
                  <p className="text-sm font-medium text-white">{formatCurrency(selectedSale.unitPrice)}</p>
                </div>
              </div>

              {/* Client et Caissier */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Client</p>
                  <p className="text-sm font-medium text-white">{selectedSale.customerName || 'Client anonyme'}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Caissier</p>
                  <p className="text-sm font-medium text-white">{selectedSale.cashier}</p>
                </div>
              </div>

              {/* Entreprise */}
              <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Entreprise</p>
                <div className="flex items-center gap-2 mt-1">
                  <Building2 className="w-4 h-4" style={{ color: '#818cf8' }} />
                  <span className="font-medium text-white">{selectedSale.company.name}</span>
                  <span className="text-xs" style={{ color: '#64748b' }}>({selectedSale.company.country})</span>
                </div>
                <span className="text-xs" style={{ color: '#64748b' }}>Plan: {selectedSale.company.plan}</span>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Créé le</p>
                  <p className="text-sm font-medium text-white">{formatDate(selectedSale.createdAt)}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Dernière mise à jour</p>
                  <p className="text-sm font-medium text-white">{formatDate(selectedSale.updatedAt)}</p>
                </div>
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
              <button
                className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition"
                style={{ 
                  background: '#4f46e5',
                  boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
                }}
              >
                Imprimer la facture
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}