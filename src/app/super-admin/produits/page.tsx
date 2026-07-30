'use client'

import { useState, useEffect } from 'react'
import {
  Package, Search, Plus, Edit, Trash2, Eye, MoreVertical,
  Check, X, Building2, Truck, Calendar, Clock, DollarSign,
  Download, Filter, ChevronDown, Activity, AlertTriangle,
  TrendingUp, TrendingDown, Copy, BarChart3, Users,
  ShoppingBag, Box, Layers, Tag, Archive, RefreshCw
} from 'lucide-react'

// Types
interface Product {
  id: number
  name: string
  category: string
  price: number
  stock: number
  minStock: number
  maxStock?: number
  unit: string
  status: 'active' | 'inactive' | 'low_stock' | 'out_of_stock'
  company: {
    id: number
    name: string
    country: string
    plan: string
  }
  supplier: string | null
  supplierId?: number | null
  createdAt: string
  updatedAt: string
  lastSold?: string
  totalSold?: number
  revenue?: number
  characteristics?: Record<string, string>
  categoryId?: number
}

// Données mockées enrichies
const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Bière Castel 65cl',
    category: 'Boisson',
    price: 1500,
    stock: 48,
    minStock: 20,
    maxStock: 100,
    unit: 'unité',
    status: 'active',
    company: { id: 1, name: 'Bar Le Premium', country: 'Gabon', plan: 'Premium' },
    supplier: 'Brasserie du Gabon',
    createdAt: '2026-06-01',
    updatedAt: '2026-07-10',
    lastSold: '2026-07-10 14:30',
    totalSold: 127,
    revenue: 190500,
    characteristics: { 'Type': 'Lager', 'Contenance': '65cl', 'Taux alcool': '5%' }
  },
  {
    id: 2,
    name: 'Bière Guinness 65cl',
    category: 'Boisson',
    price: 2000,
    stock: 12,
    minStock: 15,
    maxStock: 100,
    unit: 'unité',
    status: 'low_stock',
    company: { id: 1, name: 'Bar Le Premium', country: 'Gabon', plan: 'Premium' },
    supplier: 'Brasserie du Gabon',
    createdAt: '2026-06-01',
    updatedAt: '2026-07-10',
    lastSold: '2026-07-10 12:15',
    totalSold: 89,
    revenue: 178000,
    characteristics: { 'Type': 'Stout', 'Contenance': '65cl', 'Taux alcool': '6%' }
  },
  {
    id: 3,
    name: 'Whisky Jack Daniel\'s',
    category: 'Boisson',
    price: 25000,
    stock: 8,
    minStock: 5,
    maxStock: 50,
    unit: 'bouteille',
    status: 'active',
    company: { id: 2, name: 'Snack Le Délice', country: 'Gabon', plan: 'Starter' },
    supplier: 'Distriboissons SA',
    createdAt: '2026-06-15',
    updatedAt: '2026-07-08',
    lastSold: '2026-07-08 20:45',
    totalSold: 34,
    revenue: 850000,
    characteristics: { 'Origine': 'Écosse', 'Âge': '12 ans', 'Volume': '70cl' }
  },
  {
    id: 4,
    name: 'Champagne Moet',
    category: 'Boisson',
    price: 45000,
    stock: 0,
    minStock: 3,
    maxStock: 30,
    unit: 'bouteille',
    status: 'out_of_stock',
    company: { id: 3, name: 'Boîte VIP', country: 'Cameroun', plan: 'Business' },
    supplier: 'Vins & Spiritueux',
    createdAt: '2026-05-20',
    updatedAt: '2026-07-05',
    lastSold: '2026-07-05 23:30',
    totalSold: 12,
    revenue: 540000,
    characteristics: { 'Type': 'Brut', 'Région': 'Champagne', 'Volume': '75cl' }
  },
  {
    id: 5,
    name: 'Burger Classic',
    category: 'Nourriture',
    price: 4000,
    stock: 30,
    minStock: 8,
    maxStock: 80,
    unit: 'unité',
    status: 'active',
    company: { id: 4, name: 'Restaurant La Terrasse', country: 'Côte d\'Ivoire', plan: 'Premium' },
    supplier: 'FoodPro Gabon',
    createdAt: '2026-04-10',
    updatedAt: '2026-07-09',
    lastSold: '2026-07-09 19:00',
    totalSold: 156,
    revenue: 624000,
    characteristics: { 'Viande': 'Bœuf', 'Pain': 'Brioche', 'Accompagnement': 'Frites' }
  },
  {
    id: 6,
    name: 'Chicha Session',
    category: 'Service',
    price: 10000,
    stock: -1,
    minStock: 0,
    maxStock: 0,
    unit: 'session',
    status: 'active',
    company: { id: 5, name: 'Bar Le Soleil', country: 'Sénégal', plan: 'Essai' },
    supplier: null,
    createdAt: '2026-07-08',
    updatedAt: '2026-07-08',
    lastSold: '2026-07-08 22:00',
    totalSold: 8,
    revenue: 80000,
    characteristics: { 'Durée': '1h', 'Parfums': 'Multiples' }
  },
  {
    id: 7,
    name: 'Vodka Absolut',
    category: 'Boisson',
    price: 20000,
    stock: 15,
    minStock: 5,
    maxStock: 50,
    unit: 'bouteille',
    status: 'active',
    company: { id: 1, name: 'Bar Le Premium', country: 'Gabon', plan: 'Premium' },
    supplier: 'Distriboissons SA',
    createdAt: '2026-06-10',
    updatedAt: '2026-07-09',
    lastSold: '2026-07-09 21:15',
    totalSold: 45,
    revenue: 900000,
    characteristics: { 'Origine': 'Suède', 'Volume': '70cl', 'Taux alcool': '40%' }
  },
  {
    id: 8,
    name: 'Cocktail Mojito',
    category: 'Boisson',
    price: 5000,
    stock: -1,
    minStock: 0,
    maxStock: 0,
    unit: 'verre',
    status: 'active',
    company: { id: 2, name: 'Snack Le Délice', country: 'Gabon', plan: 'Starter' },
    supplier: null,
    createdAt: '2026-06-20',
    updatedAt: '2026-07-07',
    lastSold: '2026-07-07 18:30',
    totalSold: 67,
    revenue: 335000,
    characteristics: { 'Alcool': 'Rhum', 'Fruits': 'Citron vert, Menthe' }
  }
]

const statusConfig = {
  active: { label: 'Actif', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', icon: Check },
  inactive: { label: 'Inactif', color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)', icon: X },
  low_stock: { label: 'Stock faible', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: AlertTriangle },
  out_of_stock: { label: 'Rupture', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', icon: X }
}

const categoryColors: Record<string, string> = {
  'Boisson': '#3b82f6',
  'Nourriture': '#f59e0b',
  'Service': '#8b5cf6',
  'Autre': '#64748b'
}

export default function SuperAdminProduits() {
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCompany, setSelectedCompany] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSupplier, setSelectedSupplier] = useState('all')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const companies = ['all', ...new Set(products.map(p => p.company.name))]
  const statuses = ['all', ...new Set(products.map(p => p.status))]
  const categories = ['all', ...new Set(products.map(p => p.category))]
  const suppliers = ['all', ...new Set(products.filter(p => p.supplier).map(p => p.supplier!))]

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.company.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCompany = selectedCompany === 'all' || p.company.name === selectedCompany
    const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
    const matchesSupplier = selectedSupplier === 'all' || p.supplier === selectedSupplier
    return matchesSearch && matchesCompany && matchesStatus && matchesCategory && matchesSupplier
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

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + ' FCFA'
  }

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock < 0) return { label: 'Illimité', color: '#8b5cf6' }
    if (stock === 0) return { label: 'Rupture', color: '#ef4444' }
    if (stock <= minStock) return { label: 'Stock faible', color: '#f59e0b' }
    return { label: 'En stock', color: '#22c55e' }
  }

  // Stats
  const totalProducts = products.length
  const activeProducts = products.filter(p => p.status === 'active').length
  const lowStockProducts = products.filter(p => p.status === 'low_stock' || p.status === 'out_of_stock').length
  const totalValue = products.reduce((acc, p) => acc + (p.price * Math.max(0, p.stock)), 0)
  const totalRevenue = products.reduce((acc, p) => acc + (p.revenue || 0), 0)

  return (
    <div className={`space-y-6 transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Produits (Super Admin)</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            Vue globale des produits de toutes les entreprises
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
            Ajouter un produit
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Total produits</p>
          <p className="text-xl font-bold text-white">{totalProducts}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Actifs</p>
          <p className="text-xl font-bold" style={{ color: '#22c55e' }}>{activeProducts}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Stock critique</p>
          <p className="text-xl font-bold" style={{ color: '#ef4444' }}>{lowStockProducts}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Valeur stock</p>
          <p className="text-xl font-bold text-white">{formatCurrency(totalValue)}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Revenus générés</p>
          <p className="text-xl font-bold" style={{ color: '#22c55e' }}>{formatCurrency(totalRevenue)}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
          <input
            type="text"
            placeholder="Rechercher un produit ou une entreprise..."
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
          <option value="active">Actif</option>
          <option value="low_stock">Stock faible</option>
          <option value="out_of_stock">Rupture</option>
          <option value="inactive">Inactif</option>
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
        <select
          value={selectedSupplier}
          onChange={(e) => setSelectedSupplier(e.target.value)}
          className="rounded-lg px-3 py-2.5 text-white text-sm outline-none transition"
          style={{ 
            background: 'rgba(51, 65, 85, 0.5)',
            border: '1px solid #334155'
          }}
        >
          <option value="all">Tous les fournisseurs</option>
          {suppliers.filter(s => s !== 'all').map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Tableau des produits */}
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
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Produit</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Catégorie</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Entreprise</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Prix</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Stock</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Fournisseur</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock, product.minStock)
                return (
                  <tr key={product.id} className="border-b hover:bg-white/5 transition" style={{ borderColor: '#334155' }}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-white">{product.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs" style={{ color: '#64748b' }}>ID: #{product.id}</span>
                          {product.characteristics && Object.keys(product.characteristics).length > 0 && (
                            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8' }}>
                              {Object.keys(product.characteristics).length} carac.
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span 
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ 
                          background: `${categoryColors[product.category] || '#64748b'}20`,
                          color: categoryColors[product.category] || '#64748b'
                        }}
                      >
                        {product.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" style={{ color: '#64748b' }} />
                        <span className="text-xs" style={{ color: '#94a3b8' }}>{product.company.name}</span>
                      </div>
                      <span className="text-xs" style={{ color: '#64748b' }}>{product.company.country}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold" style={{ color: '#22c55e' }}>
                        {formatCurrency(product.price)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${product.stock <= product.minStock && product.stock >= 0 ? 'text-red-400' : 'text-white'}`}>
                            {product.stock >= 0 ? product.stock : '∞'}
                          </span>
                          <span className="text-xs" style={{ color: '#64748b' }}>{product.unit}s</span>
                        </div>
                        <span className="text-xs" style={{ color: stockStatus.color }}>
                          {stockStatus.label}
                        </span>
                        {product.stock >= 0 && product.stock <= product.minStock && (
                          <span className="text-xs" style={{ color: '#f59e0b' }}>Seuil: {product.minStock}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(product.status)}
                    </td>
                    <td className="px-4 py-3">
                      {product.supplier ? (
                        <div className="flex items-center gap-1">
                          <Truck className="w-3 h-3" style={{ color: '#64748b' }} />
                          <span className="text-xs" style={{ color: '#94a3b8' }}>{product.supplier}</span>
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: '#64748b' }}>Aucun</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button 
                          onClick={() => { setSelectedProduct(product); setIsModalOpen(true) }}
                          className="p-1.5 rounded transition hover:bg-white/10"
                          style={{ color: '#94a3b8' }}
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded transition hover:bg-white/10" style={{ color: '#94a3b8' }} title="Dupliquer">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded transition hover:bg-red-500/20" style={{ color: '#f87171' }} title="Supprimer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filteredProducts.length === 0 && (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto mb-2" style={{ color: '#334155' }} />
            <p className="text-sm" style={{ color: '#64748b' }}>Aucun produit trouvé</p>
          </div>
        )}
      </div>

      {/* MODAL DÉTAILS PRODUIT */}
      {isModalOpen && selectedProduct && (
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
                  style={{ 
                    background: `${categoryColors[selectedProduct.category] || '#64748b'}30`,
                    color: categoryColors[selectedProduct.category] || '#64748b'
                  }}
                >
                  {selectedProduct.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedProduct.name}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: '#64748b' }}>ID: #{selectedProduct.id}</span>
                    <span className="text-xs" style={{ color: '#64748b' }}>•</span>
                    <span className="text-xs" style={{ color: '#64748b' }}>{selectedProduct.category}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded hover:bg-white/10" style={{ color: '#94a3b8' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Informations générales */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Statut</p>
                  <div className="mt-1">{getStatusBadge(selectedProduct.status)}</div>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Prix unitaire</p>
                  <p className="text-lg font-bold" style={{ color: '#22c55e' }}>{formatCurrency(selectedProduct.price)}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Stock</p>
                  <p className={`text-lg font-bold ${selectedProduct.stock <= selectedProduct.minStock && selectedProduct.stock >= 0 ? 'text-red-400' : 'text-white'}`}>
                    {selectedProduct.stock >= 0 ? selectedProduct.stock : 'Illimité'} {selectedProduct.unit}s
                  </p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Seuil alerte</p>
                  <p className="text-lg font-bold text-white">{selectedProduct.minStock} {selectedProduct.unit}s</p>
                </div>
              </div>

              {/* Entreprise et Fournisseur */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Entreprise</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Building2 className="w-4 h-4" style={{ color: '#818cf8' }} />
                    <span className="font-medium text-white">{selectedProduct.company.name}</span>
                    <span className="text-xs" style={{ color: '#64748b' }}>({selectedProduct.company.country})</span>
                  </div>
                  <span className="text-xs" style={{ color: '#64748b' }}>Plan: {selectedProduct.company.plan}</span>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Fournisseur</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Truck className="w-4 h-4" style={{ color: '#818cf8' }} />
                    <span className="font-medium text-white">{selectedProduct.supplier || 'Aucun'}</span>
                  </div>
                </div>
              </div>

              {/* Ventes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Dernière vente</p>
                  <p className="text-sm font-medium text-white">{selectedProduct.lastSold || 'Jamais'}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Total vendu</p>
                  <p className="text-sm font-medium text-white">{selectedProduct.totalSold || 0} unités</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Revenus générés</p>
                  <p className="text-sm font-medium" style={{ color: '#22c55e' }}>{formatCurrency(selectedProduct.revenue || 0)}</p>
                </div>
              </div>

              {/* Caractéristiques */}
              {selectedProduct.characteristics && Object.keys(selectedProduct.characteristics).length > 0 && (
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Caractéristiques</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {Object.entries(selectedProduct.characteristics).map(([key, value]) => (
                      <span 
                        key={key}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}
                      >
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Créé le</p>
                  <p className="text-sm font-medium text-white">{selectedProduct.createdAt}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Dernière mise à jour</p>
                  <p className="text-sm font-medium text-white">{selectedProduct.updatedAt}</p>
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
                Modifier le produit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}