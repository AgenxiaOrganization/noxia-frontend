'use client'

import { useState, useEffect } from 'react'
import {
  Building2, Search, Plus, Edit, Trash2, Eye, MoreVertical,
  Check, X, Users, CreditCard, Calendar, MapPin, Phone,
  Mail, Globe, FileText, Clock, AlertTriangle, CheckCircle,
  Download, Filter, ChevronDown, Activity, Shield, Award,
  Star, Crown, Gift, Zap, BarChart3, TrendingUp, TrendingDown,
  DollarSign, Package, ShoppingBag, Truck, Settings
} from 'lucide-react'

// Types
interface Company {
  id: number
  name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  plan: string
  status: 'active' | 'suspended' | 'pending' | 'trial' | 'expired'
  users: number
  products: number
  revenue: number
  orders: number
  subscriptionStart: string
  subscriptionEnd: string
  createdAt: string
  updatedAt: string
  lastActivity: string
  documents: {
    status: 'verified' | 'pending' | 'rejected' | 'none'
    count: number
  }
  notifications: number
  avatar?: string
}

// Données mockées
const mockCompanies: Company[] = [
  {
    id: 1,
    name: 'Bar Le Premium',
    email: 'contact@lepremium.ga',
    phone: '+241 77 00 00 01',
    address: 'Avenue de l\'Indépendance',
    city: 'Libreville',
    country: 'Gabon',
    plan: 'Premium',
    status: 'active',
    users: 8,
    products: 127,
    revenue: 450000,
    orders: 127,
    subscriptionStart: '2026-06-01',
    subscriptionEnd: '2026-07-01',
    createdAt: '2026-06-01',
    updatedAt: '2026-07-10',
    lastActivity: '2026-07-10 14:30',
    documents: { status: 'verified', count: 3 },
    notifications: 5
  },
  {
    id: 2,
    name: 'Snack Le Délice',
    email: 'contact@ledelice.ga',
    phone: '+241 77 00 00 02',
    address: 'Boulevard du Commerce',
    city: 'Port-Gentil',
    country: 'Gabon',
    plan: 'Starter',
    status: 'active',
    users: 3,
    products: 45,
    revenue: 120000,
    orders: 89,
    subscriptionStart: '2026-06-15',
    subscriptionEnd: '2026-07-15',
    createdAt: '2026-06-15',
    updatedAt: '2026-07-09',
    lastActivity: '2026-07-09 18:15',
    documents: { status: 'pending', count: 2 },
    notifications: 3
  },
  {
    id: 3,
    name: 'Boîte VIP',
    email: 'contact@vip.ga',
    phone: '+241 77 00 00 03',
    address: 'Rue des Ambassades',
    city: 'Libreville',
    country: 'Gabon',
    plan: 'Business',
    status: 'active',
    users: 12,
    products: 234,
    revenue: 820000,
    orders: 245,
    subscriptionStart: '2026-05-20',
    subscriptionEnd: '2026-06-20',
    createdAt: '2026-05-20',
    updatedAt: '2026-07-08',
    lastActivity: '2026-07-08 23:45',
    documents: { status: 'verified', count: 5 },
    notifications: 8
  },
  {
    id: 4,
    name: 'Restaurant La Terrasse',
    email: 'contact@laterrasse.ga',
    phone: '+241 77 00 00 04',
    address: 'Quartier des Affaires',
    city: 'Douala',
    country: 'Cameroun',
    plan: 'Premium',
    status: 'suspended',
    users: 5,
    products: 78,
    revenue: 280000,
    orders: 156,
    subscriptionStart: '2026-04-10',
    subscriptionEnd: '2026-05-10',
    createdAt: '2026-04-10',
    updatedAt: '2026-07-05',
    lastActivity: '2026-07-05 10:00',
    documents: { status: 'rejected', count: 1 },
    notifications: 12
  },
  {
    id: 5,
    name: 'Bar Le Soleil',
    email: 'contact@lesoleil.ga',
    phone: '+241 77 00 00 05',
    address: 'Avenue du Bord de Mer',
    city: 'Dakar',
    country: 'Sénégal',
    plan: 'Essai',
    status: 'trial',
    users: 1,
    products: 12,
    revenue: 0,
    orders: 0,
    subscriptionStart: '2026-07-08',
    subscriptionEnd: '2026-08-08',
    createdAt: '2026-07-08',
    updatedAt: '2026-07-08',
    lastActivity: '2026-07-08 12:00',
    documents: { status: 'pending', count: 1 },
    notifications: 2
  },
  {
    id: 6,
    name: 'Gourmet Express',
    email: 'contact@gourmet.ga',
    phone: '+241 77 00 00 06',
    address: 'Rue des Gourmets',
    city: 'Libreville',
    country: 'Gabon',
    plan: 'Starter',
    status: 'expired',
    users: 2,
    products: 23,
    revenue: 45000,
    orders: 34,
    subscriptionStart: '2026-03-01',
    subscriptionEnd: '2026-04-01',
    createdAt: '2026-03-01',
    updatedAt: '2026-07-01',
    lastActivity: '2026-07-01 08:30',
    documents: { status: 'none', count: 0 },
    notifications: 6
  },
]

const planColors = {
  Essai: '#22c55e',
  Starter: '#818cf8',
  Premium: '#f59e0b',
  Business: '#8b5cf6',
  Pro: '#ec4899'
}

const statusConfig = {
  active: { label: 'Actif', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', icon: CheckCircle },
  suspended: { label: 'Suspendu', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', icon: X },
  pending: { label: 'En attente', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: Clock },
  trial: { label: 'Essai', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', icon: Gift },
  expired: { label: 'Expiré', color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)', icon: AlertTriangle }
}

const docStatusConfig = {
  verified: { label: 'Vérifié', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' },
  pending: { label: 'En attente', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  rejected: { label: 'Rejeté', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
  none: { label: 'Aucun', color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)' }
}

export default function SuperAdminEntreprises() {
  const [companies, setCompanies] = useState<Company[]>(mockCompanies)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPlan, setSelectedPlan] = useState('all')
  const [selectedCountry, setSelectedCountry] = useState('all')
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const statuses = ['all', ...new Set(companies.map(c => c.status))]
  const plans = ['all', ...new Set(companies.map(c => c.plan))]
  const countries = ['all', ...new Set(companies.map(c => c.country))]

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.city.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus
    const matchesPlan = selectedPlan === 'all' || c.plan === selectedPlan
    const matchesCountry = selectedCountry === 'all' || c.country === selectedCountry
    return matchesSearch && matchesStatus && matchesPlan && matchesCountry
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

  const getDocStatusBadge = (status: string) => {
    const config = docStatusConfig[status as keyof typeof docStatusConfig]
    if (!config) return null
    return (
      <span 
        className="text-xs px-2 py-0.5 rounded-full"
        style={{ background: config.bg, color: config.color }}
      >
        {config.label}
      </span>
    )
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + ' FCFA'
  }

  // Stats
  const totalCompanies = companies.length
  const activeCompanies = companies.filter(c => c.status === 'active' || c.status === 'trial').length
  const totalRevenue = companies.reduce((acc, c) => acc + c.revenue, 0)
  const totalUsers = companies.reduce((acc, c) => acc + c.users, 0)
  const totalProducts = companies.reduce((acc, c) => acc + c.products, 0)

  return (
    <div className={`space-y-6 transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Entreprises</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            {totalCompanies} entreprises inscrites • {activeCompanies} actives
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
            Ajouter une entreprise
          </button>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Total entreprises</p>
          <p className="text-xl font-bold text-white">{totalCompanies}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Actives</p>
          <p className="text-xl font-bold" style={{ color: '#22c55e' }}>{activeCompanies}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Utilisateurs</p>
          <p className="text-xl font-bold text-white">{totalUsers}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Produits</p>
          <p className="text-xl font-bold text-white">{totalProducts}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>CA total</p>
          <p className="text-xl font-bold" style={{ color: '#22c55e' }}>{formatCurrency(totalRevenue)}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
          <input
            type="text"
            placeholder="Rechercher une entreprise (nom, email, ville)..."
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
          {statuses.filter(s => s !== 'all').map(s => (
            <option key={s} value={s}>{statusConfig[s as keyof typeof statusConfig]?.label || s}</option>
          ))}
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
          {plans.filter(p => p !== 'all').map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="rounded-lg px-3 py-2.5 text-white text-sm outline-none transition"
          style={{ 
            background: 'rgba(51, 65, 85, 0.5)',
            border: '1px solid #334155'
          }}
        >
          <option value="all">Tous les pays</option>
          {countries.filter(c => c !== 'all').map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Tableau des entreprises */}
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
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Plan</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Utilisateurs</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Revenus</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Documents</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((company) => (
                <tr key={company.id} className="border-b hover:bg-white/5 transition" style={{ borderColor: '#334155' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: 'rgba(99, 102, 241, 0.2)' }}
                      >
                        {company.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white">{company.name}</p>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" style={{ color: '#64748b' }} />
                          <span className="text-xs" style={{ color: '#64748b' }}>{company.city}, {company.country}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs" style={{ color: '#94a3b8' }}>{company.email}</p>
                    <p className="text-xs" style={{ color: '#64748b' }}>{company.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span 
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ 
                        background: `${planColors[company.plan as keyof typeof planColors] || '#6366f1'}20`,
                        color: planColors[company.plan as keyof typeof planColors] || '#6366f1'
                      }}
                    >
                      {company.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(company.status)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="w-3 h-3" style={{ color: '#64748b' }} />
                      <span className="text-white">{company.users}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold" style={{ color: '#22c55e' }}>{formatCurrency(company.revenue)}</p>
                      <p className="text-xs" style={{ color: '#64748b' }}>{company.orders} commandes</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getDocStatusBadge(company.documents.status)}
                      <span className="text-xs" style={{ color: '#64748b' }}>({company.documents.count})</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button 
                        onClick={() => { setSelectedCompany(company); setIsModalOpen(true) }}
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
        {filteredCompanies.length === 0 && (
          <div className="p-8 text-center">
            <Building2 className="w-12 h-12 mx-auto mb-2" style={{ color: '#334155' }} />
            <p className="text-sm" style={{ color: '#64748b' }}>Aucune entreprise trouvée</p>
          </div>
        )}
      </div>

      {/* MODAL DÉTAILS ENTREPRISE */}
      {isModalOpen && selectedCompany && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="w-full max-w-4xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
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
                  {selectedCompany.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedCompany.name}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: '#64748b' }}>{selectedCompany.email}</span>
                    <span className="text-xs" style={{ color: '#64748b' }}>•</span>
                    <span className="text-xs" style={{ color: '#64748b' }}>{selectedCompany.phone}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded hover:bg-white/10" style={{ color: '#94a3b8' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Informations générales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Statut</p>
                  <div className="mt-1">{getStatusBadge(selectedCompany.status)}</div>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Plan</p>
                  <span 
                    className="text-sm font-semibold"
                    style={{ 
                      color: planColors[selectedCompany.plan as keyof typeof planColors] || '#6366f1'
                    }}
                  >
                    {selectedCompany.plan}
                  </span>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Localisation</p>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4" style={{ color: '#64748b' }} />
                    <span className="text-sm text-white">{selectedCompany.city}, {selectedCompany.country}</span>
                  </div>
                </div>
              </div>

              {/* Statistiques */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Utilisateurs</p>
                  <p className="text-xl font-bold text-white">{selectedCompany.users}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Produits</p>
                  <p className="text-xl font-bold text-white">{selectedCompany.products}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Commandes</p>
                  <p className="text-xl font-bold text-white">{selectedCompany.orders}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Revenus</p>
                  <p className="text-xl font-bold" style={{ color: '#22c55e' }}>{formatCurrency(selectedCompany.revenue)}</p>
                </div>
              </div>

              {/* Abonnement */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Début d'abonnement</p>
                  <p className="text-sm font-medium text-white">{selectedCompany.subscriptionStart}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Fin d'abonnement</p>
                  <p className="text-sm font-medium text-white">{selectedCompany.subscriptionEnd}</p>
                </div>
              </div>

              {/* Documents */}
              <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>Documents</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getDocStatusBadge(selectedCompany.documents.status)}
                      <span className="text-xs" style={{ color: '#64748b' }}>{selectedCompany.documents.count} documents</span>
                    </div>
                  </div>
                  <button className="px-3 py-1 rounded text-xs font-medium transition" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                    Voir les documents
                  </button>
                </div>
              </div>

              {/* Dernière activité */}
              <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>Dernière activité</p>
                    <p className="text-sm text-white">{selectedCompany.lastActivity}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: '#64748b' }}>Notifications</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                      {selectedCompany.notifications}
                    </span>
                  </div>
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
                Modifier l'entreprise
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}