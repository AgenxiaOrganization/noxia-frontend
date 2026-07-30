'use client'

import { useState, useEffect } from 'react'
import {
  Truck, Search, Plus, Edit, Trash2, Eye, MoreVertical,
  Building2, Phone, Mail, MapPin, Package, DollarSign,
  CheckCircle, AlertTriangle, X, Clock, Download,
  Filter, ChevronDown, Activity, Award, Star,
  TrendingUp, TrendingDown, BarChart3, Users,
  ShoppingBag, Calendar, MessageSquare, Send
} from 'lucide-react'

// Types
interface Supplier {
  id: number
  name: string
  contactName: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  products: {
    id: number
    name: string
    category: string
    price: number
  }[]
  companies: {
    id: number
    name: string
    country: string
    plan: string
  }[]
  status: 'active' | 'inactive' | 'pending'
  rating: number
  totalOrders: number
  totalSpent: number
  lastOrder: string
  createdAt: string
  updatedAt: string
  paymentTerms?: string
  deliveryDelay?: number
}

// Données mockées
const mockSuppliers: Supplier[] = [
  {
    id: 1,
    name: 'Brasserie du Gabon',
    contactName: 'M. Mbadinga',
    email: 'commandes@brassgabon.ga',
    phone: '+241 66 00 00 01',
    address: 'Zone Industrielle',
    city: 'Libreville',
    country: 'Gabon',
    products: [
      { id: 1, name: 'Bière Castel 65cl', category: 'Boisson', price: 900 },
      { id: 2, name: 'Bière Guinness 65cl', category: 'Boisson', price: 1200 }
    ],
    companies: [
      { id: 1, name: 'Bar Le Premium', country: 'Gabon', plan: 'Premium' },
      { id: 2, name: 'Snack Le Délice', country: 'Gabon', plan: 'Starter' }
    ],
    status: 'active',
    rating: 4.8,
    totalOrders: 24,
    totalSpent: 1245000,
    lastOrder: '2026-07-08',
    createdAt: '2026-01-15',
    updatedAt: '2026-07-10',
    paymentTerms: '30 jours',
    deliveryDelay: 2
  },
  {
    id: 2,
    name: 'Distriboissons SA',
    contactName: 'Mme Obiang',
    email: 'ventes@distriboissons.ga',
    phone: '+241 66 00 00 02',
    address: 'Boulevard du Commerce',
    city: 'Port-Gentil',
    country: 'Gabon',
    products: [
      { id: 3, name: 'Whisky Jack Daniel\'s', category: 'Boisson', price: 15000 },
      { id: 4, name: 'Vodka Absolut', category: 'Boisson', price: 11000 }
    ],
    companies: [
      { id: 1, name: 'Bar Le Premium', country: 'Gabon', plan: 'Premium' },
      { id: 3, name: 'Boîte VIP', country: 'Cameroun', plan: 'Business' }
    ],
    status: 'active',
    rating: 4.5,
    totalOrders: 18,
    totalSpent: 980000,
    lastOrder: '2026-07-05',
    createdAt: '2026-02-20',
    updatedAt: '2026-07-09',
    paymentTerms: '15 jours',
    deliveryDelay: 3
  },
  {
    id: 3,
    name: 'Vins & Spiritueux',
    contactName: 'M. Nguema',
    email: 'contact@vinsspiritueux.ga',
    phone: '+241 66 00 00 03',
    address: 'Rue des Vins',
    city: 'Libreville',
    country: 'Gabon',
    products: [
      { id: 5, name: 'Champagne Moet', category: 'Boisson', price: 28000 },
      { id: 6, name: 'Vin Rouge Bordeaux', category: 'Boisson', price: 4500 }
    ],
    companies: [
      { id: 3, name: 'Boîte VIP', country: 'Cameroun', plan: 'Business' }
    ],
    status: 'active',
    rating: 4.2,
    totalOrders: 12,
    totalSpent: 560000,
    lastOrder: '2026-07-01',
    createdAt: '2026-03-10',
    updatedAt: '2026-07-08',
    paymentTerms: '30 jours',
    deliveryDelay: 4
  },
  {
    id: 4,
    name: 'FoodPro Gabon',
    contactName: 'Mme Mba',
    email: 'commandes@foodpro.ga',
    phone: '+241 66 00 00 04',
    address: 'Zone Agro-alimentaire',
    city: 'Owendo',
    country: 'Gabon',
    products: [
      { id: 7, name: 'Brochettes Poulet', category: 'Nourriture', price: 1200 },
      { id: 8, name: 'Burger Classic', category: 'Nourriture', price: 1500 }
    ],
    companies: [
      { id: 2, name: 'Snack Le Délice', country: 'Gabon', plan: 'Starter' },
      { id: 4, name: 'Restaurant La Terrasse', country: 'Côte d\'Ivoire', plan: 'Premium' }
    ],
    status: 'active',
    rating: 4.7,
    totalOrders: 32,
    totalSpent: 860000,
    lastOrder: '2026-07-06',
    createdAt: '2026-01-05',
    updatedAt: '2026-07-10',
    paymentTerms: '20 jours',
    deliveryDelay: 1
  },
  {
    id: 5,
    name: 'Coca-Cola Gabon',
    contactName: 'Service Commercial',
    email: 'commandes@cocacola.ga',
    phone: '+241 66 00 00 05',
    address: 'Avenue des Boissons',
    city: 'Libreville',
    country: 'Gabon',
    products: [
      { id: 9, name: 'Coca-Cola 33cl', category: 'Boisson', price: 500 },
      { id: 10, name: 'Jus d\'Orange', category: 'Boisson', price: 700 }
    ],
    companies: [
      { id: 1, name: 'Bar Le Premium', country: 'Gabon', plan: 'Premium' },
      { id: 5, name: 'Bar Le Soleil', country: 'Sénégal', plan: 'Essai' }
    ],
    status: 'pending',
    rating: 3.8,
    totalOrders: 8,
    totalSpent: 180000,
    lastOrder: '2026-06-28',
    createdAt: '2026-04-15',
    updatedAt: '2026-07-07',
    paymentTerms: '45 jours',
    deliveryDelay: 5
  },
  {
    id: 6,
    name: 'Boulangerie Moderne',
    contactName: 'M. Essono',
    email: 'contact@boulangerie.ga',
    phone: '+241 66 00 00 06',
    address: 'Rue des Pains',
    city: 'Douala',
    country: 'Cameroun',
    products: [
      { id: 11, name: 'Pain Baguette', category: 'Nourriture', price: 200 },
      { id: 12, name: 'Viennoiseries', category: 'Nourriture', price: 350 }
    ],
    companies: [
      { id: 4, name: 'Restaurant La Terrasse', country: 'Côte d\'Ivoire', plan: 'Premium' }
    ],
    status: 'inactive',
    rating: 3.5,
    totalOrders: 5,
    totalSpent: 45000,
    lastOrder: '2026-05-15',
    createdAt: '2026-05-01',
    updatedAt: '2026-06-30',
    paymentTerms: '15 jours',
    deliveryDelay: 2
  }
]

const statusConfig = {
  active: { label: 'Actif', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', icon: CheckCircle },
  inactive: { label: 'Inactif', color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)', icon: X },
  pending: { label: 'En attente', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: Clock }
}

const ratingColors = {
  5: '#22c55e',
  4: '#22c55e',
  3: '#f59e0b',
  2: '#ef4444',
  1: '#ef4444'
}

export default function SuperAdminFournisseurs() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedCountry, setSelectedCountry] = useState('all')
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const statuses = ['all', ...new Set(suppliers.map(s => s.status))]
  const countries = ['all', ...new Set(suppliers.map(s => s.country))]

  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus
    const matchesCountry = selectedCountry === 'all' || s.country === selectedCountry
    return matchesSearch && matchesStatus && matchesCountry
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

  const renderStars = (rating: number) => {
    const full = Math.floor(rating)
    const hasHalf = rating % 1 >= 0.5
    const stars = []
    for (let i = 0; i < 5; i++) {
      if (i < full) {
        stars.push('★')
      } else if (i === full && hasHalf) {
        stars.push('☆')
      } else {
        stars.push('☆')
      }
    }
    return (
      <span style={{ color: rating >= 4 ? '#22c55e' : rating >= 3 ? '#f59e0b' : '#ef4444' }}>
        {stars.join(' ')}
      </span>
    )
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + ' F'
  }

  // Stats
  const totalSuppliers = suppliers.length
  const activeSuppliers = suppliers.filter(s => s.status === 'active').length
  const totalProducts = suppliers.reduce((acc, s) => acc + s.products.length, 0)
  const totalSpent = suppliers.reduce((acc, s) => acc + s.totalSpent, 0)
  const averageRating = suppliers.reduce((acc, s) => acc + s.rating, 0) / totalSuppliers

  return (
    <div className={`space-y-6 transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Fournisseurs</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            Vue globale des fournisseurs de toutes les entreprises
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
            Ajouter un fournisseur
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Total fournisseurs</p>
          <p className="text-xl font-bold text-white">{totalSuppliers}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Actifs</p>
          <p className="text-xl font-bold" style={{ color: '#22c55e' }}>{activeSuppliers}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Produits référencés</p>
          <p className="text-xl font-bold text-white">{totalProducts}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Dépenses totales</p>
          <p className="text-xl font-bold" style={{ color: '#22c55e' }}>{formatCurrency(totalSpent)}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Note moyenne</p>
          <p className="text-xl font-bold" style={{ color: averageRating >= 4 ? '#22c55e' : '#f59e0b' }}>
            {averageRating.toFixed(1)} ⭐
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
          <input
            type="text"
            placeholder="Rechercher un fournisseur (nom, contact, email)..."
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
          <option value="pending">En attente</option>
          <option value="inactive">Inactif</option>
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

      {/* Tableau des fournisseurs */}
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
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Fournisseur</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Pays</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Produits</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Entreprises</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Note</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="border-b hover:bg-white/5 transition" style={{ borderColor: '#334155' }}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-white">{supplier.name}</p>
                      <span className="text-xs" style={{ color: '#64748b' }}>ID: #{supplier.id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-xs" style={{ color: '#94a3b8' }}>{supplier.contactName}</p>
                      <p className="text-xs" style={{ color: '#64748b' }}>{supplier.phone}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" style={{ color: '#64748b' }} />
                      <span className="text-xs" style={{ color: '#94a3b8' }}>{supplier.country}</span>
                    </div>
                    <span className="text-xs" style={{ color: '#64748b' }}>{supplier.city}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-white">{supplier.products.length}</span>
                      <span className="text-xs" style={{ color: '#64748b' }}>
                        {supplier.products.slice(0, 2).map(p => p.name).join(', ')}
                        {supplier.products.length > 2 && ` +${supplier.products.length - 2}`}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-white">{supplier.companies.length}</span>
                      <span className="text-xs" style={{ color: '#64748b' }}>
                        {supplier.companies.slice(0, 2).map(c => c.name).join(', ')}
                        {supplier.companies.length > 2 && ` +${supplier.companies.length - 2}`}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold" style={{ color: ratingColors[Math.round(supplier.rating) as keyof typeof ratingColors] || '#94a3b8' }}>
                        {supplier.rating.toFixed(1)}
                      </span>
                      <span className="text-xs">{renderStars(supplier.rating)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(supplier.status)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button 
                        onClick={() => { setSelectedSupplier(supplier); setIsModalOpen(true) }}
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
        {filteredSuppliers.length === 0 && (
          <div className="p-8 text-center">
            <Truck className="w-12 h-12 mx-auto mb-2" style={{ color: '#334155' }} />
            <p className="text-sm" style={{ color: '#64748b' }}>Aucun fournisseur trouvé</p>
          </div>
        )}
      </div>

      {/* MODAL DÉTAILS FOURNISSEUR */}
      {isModalOpen && selectedSupplier && (
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
                  <Truck className="w-6 h-6" style={{ color: '#818cf8' }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedSupplier.name}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: '#64748b' }}>ID: #{selectedSupplier.id}</span>
                    <span className="text-xs" style={{ color: '#64748b' }}>•</span>
                    <span className="text-xs" style={{ color: '#64748b' }}>{selectedSupplier.city}, {selectedSupplier.country}</span>
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
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Statut</p>
                  <div className="mt-1">{getStatusBadge(selectedSupplier.status)}</div>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Note</p>
                  <p className="text-lg font-bold" style={{ color: ratingColors[Math.round(selectedSupplier.rating) as keyof typeof ratingColors] || '#94a3b8' }}>
                    {selectedSupplier.rating.toFixed(1)} ⭐
                  </p>
                  <span className="text-xs">{renderStars(selectedSupplier.rating)}</span>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Commandes totales</p>
                  <p className="text-lg font-bold text-white">{selectedSupplier.totalOrders}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Dépenses totales</p>
                  <p className="text-lg font-bold" style={{ color: '#22c55e' }}>{formatCurrency(selectedSupplier.totalSpent)}</p>
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Contact principal</p>
                  <p className="text-sm font-medium text-white">{selectedSupplier.contactName}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Email</p>
                  <p className="text-sm font-medium text-white">{selectedSupplier.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Téléphone</p>
                  <p className="text-sm font-medium text-white">{selectedSupplier.phone}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Adresse</p>
                  <p className="text-sm font-medium text-white">{selectedSupplier.address}</p>
                </div>
              </div>

              {/* Conditions de livraison */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Délai de livraison</p>
                  <p className="text-sm font-medium text-white">{selectedSupplier.deliveryDelay || 0} jours</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Conditions de paiement</p>
                  <p className="text-sm font-medium text-white">{selectedSupplier.paymentTerms || 'Standard'}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Dernière commande</p>
                  <p className="text-sm font-medium text-white">{selectedSupplier.lastOrder}</p>
                </div>
              </div>

              {/* Produits fournis */}
              <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Produits fournis</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedSupplier.products.map((product) => (
                    <span 
                      key={product.id}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}
                    >
                      {product.name} ({formatCurrency(product.price)})
                    </span>
                  ))}
                </div>
              </div>

              {/* Entreprises desservies */}
              <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Entreprises desservies</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedSupplier.companies.map((company) => (
                    <span 
                      key={company.id}
                      className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                      style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}
                    >
                      <Building2 className="w-3 h-3" />
                      {company.name} ({company.country})
                    </span>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Créé le</p>
                  <p className="text-sm font-medium text-white">{selectedSupplier.createdAt}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Dernière mise à jour</p>
                  <p className="text-sm font-medium text-white">{selectedSupplier.updatedAt}</p>
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
                className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition flex items-center justify-center gap-2"
                style={{ 
                  background: '#4f46e5',
                  boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
                }}
              >
                <Send className="w-4 h-4" />
                Contacter
              </button>
              <button
                className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition"
                style={{ 
                  background: '#22c55e',
                  boxShadow: '0 10px 25px -5px rgba(34, 197, 94, 0.3)'
                }}
              >
                Commander
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}