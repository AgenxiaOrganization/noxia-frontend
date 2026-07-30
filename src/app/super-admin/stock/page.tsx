'use client'

import { useState, useEffect } from 'react'
import {
  Package, Search, Eye, Edit, AlertTriangle, CheckCircle,
  Building2, Truck, DollarSign, TrendingUp, TrendingDown,
  BarChart3, PieChart, Filter, Download, ChevronDown,
  X, Clock, RefreshCw, Box, Layers, Archive, ShoppingBag,
  Zap, Target, Award, Gift, Crown
} from 'lucide-react'

// Types
interface StockItem {
  id: number
  productId: number
  productName: string
  category: string
  stock: number
  minStock: number
  maxStock: number
  unit: string
  cost: number
  price: number
  totalValue: number
  status: 'ok' | 'low' | 'critical' | 'out'
  company: {
    id: number
    name: string
    country: string
    plan: string
  }
  supplier: string | null
  lastMovement: string
  movements: {
    in: number
    out: number
    adjustment: number
  }
  turnoverRate: number // Rotation du stock
  daysUntilRestock: number | null
}

// Données mockées
const mockStockItems: StockItem[] = [
  {
    id: 1,
    productId: 1,
    productName: 'Bière Castel 65cl',
    category: 'Boisson',
    stock: 48,
    minStock: 20,
    maxStock: 100,
    unit: 'unité',
    cost: 900,
    price: 1500,
    totalValue: 43200,
    status: 'ok',
    company: { id: 1, name: 'Bar Le Premium', country: 'Gabon', plan: 'Premium' },
    supplier: 'Brasserie du Gabon',
    lastMovement: '2026-07-10 14:30',
    movements: { in: 120, out: 72, adjustment: 0 },
    turnoverRate: 4.2,
    daysUntilRestock: 15
  },
  {
    id: 2,
    productId: 2,
    productName: 'Bière Guinness 65cl',
    category: 'Boisson',
    stock: 12,
    minStock: 15,
    maxStock: 100,
    unit: 'unité',
    cost: 1200,
    price: 2000,
    totalValue: 14400,
    status: 'low',
    company: { id: 1, name: 'Bar Le Premium', country: 'Gabon', plan: 'Premium' },
    supplier: 'Brasserie du Gabon',
    lastMovement: '2026-07-10 12:15',
    movements: { in: 60, out: 48, adjustment: 0 },
    turnoverRate: 3.8,
    daysUntilRestock: 5
  },
  {
    id: 3,
    productId: 3,
    productName: 'Whisky Jack Daniel\'s',
    category: 'Boisson',
    stock: 8,
    minStock: 5,
    maxStock: 50,
    unit: 'bouteille',
    cost: 15000,
    price: 25000,
    totalValue: 120000,
    status: 'ok',
    company: { id: 2, name: 'Snack Le Délice', country: 'Gabon', plan: 'Starter' },
    supplier: 'Distriboissons SA',
    lastMovement: '2026-07-08 20:45',
    movements: { in: 30, out: 22, adjustment: 0 },
    turnoverRate: 2.8,
    daysUntilRestock: 12
  },
  {
    id: 4,
    productId: 4,
    productName: 'Champagne Moet',
    category: 'Boisson',
    stock: 0,
    minStock: 3,
    maxStock: 30,
    unit: 'bouteille',
    cost: 28000,
    price: 45000,
    totalValue: 0,
    status: 'out',
    company: { id: 3, name: 'Boîte VIP', country: 'Cameroun', plan: 'Business' },
    supplier: 'Vins & Spiritueux',
    lastMovement: '2026-07-05 23:30',
    movements: { in: 12, out: 12, adjustment: 0 },
    turnoverRate: 1.2,
    daysUntilRestock: null
  },
  {
    id: 5,
    productId: 5,
    productName: 'Burger Classic',
    category: 'Nourriture',
    stock: 30,
    minStock: 8,
    maxStock: 80,
    unit: 'unité',
    cost: 1500,
    price: 4000,
    totalValue: 45000,
    status: 'ok',
    company: { id: 4, name: 'Restaurant La Terrasse', country: 'Côte d\'Ivoire', plan: 'Premium' },
    supplier: 'FoodPro Gabon',
    lastMovement: '2026-07-09 19:00',
    movements: { in: 80, out: 50, adjustment: 0 },
    turnoverRate: 5.1,
    daysUntilRestock: 8
  },
  {
    id: 6,
    productId: 6,
    productName: 'Jus d\'Orange',
    category: 'Boisson',
    stock: 5,
    minStock: 15,
    maxStock: 60,
    unit: 'unité',
    cost: 700,
    price: 1500,
    totalValue: 3500,
    status: 'critical',
    company: { id: 5, name: 'Bar Le Soleil', country: 'Sénégal', plan: 'Essai' },
    supplier: 'Coca-Cola Gabon',
    lastMovement: '2026-07-08 12:00',
    movements: { in: 30, out: 25, adjustment: 0 },
    turnoverRate: 2.3,
    daysUntilRestock: 2
  },
  {
    id: 7,
    productId: 7,
    productName: 'Vodka Absolut',
    category: 'Boisson',
    stock: 15,
    minStock: 5,
    maxStock: 50,
    unit: 'bouteille',
    cost: 11000,
    price: 20000,
    totalValue: 165000,
    status: 'ok',
    company: { id: 1, name: 'Bar Le Premium', country: 'Gabon', plan: 'Premium' },
    supplier: 'Distriboissons SA',
    lastMovement: '2026-07-09 21:15',
    movements: { in: 40, out: 25, adjustment: 0 },
    turnoverRate: 3.5,
    daysUntilRestock: 10
  },
  {
    id: 8,
    productId: 8,
    productName: 'Brochettes Poulet',
    category: 'Nourriture',
    stock: 8,
    minStock: 10,
    maxStock: 50,
    unit: 'unité',
    cost: 1200,
    price: 3500,
    totalValue: 9600,
    status: 'low',
    company: { id: 2, name: 'Snack Le Délice', country: 'Gabon', plan: 'Starter' },
    supplier: 'FoodPro Gabon',
    lastMovement: '2026-07-10 13:00',
    movements: { in: 40, out: 32, adjustment: 0 },
    turnoverRate: 4.8,
    daysUntilRestock: 4
  }
]

const statusConfig = {
  ok: { label: 'OK', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', icon: CheckCircle },
  low: { label: 'Stock faible', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: AlertTriangle },
  critical: { label: 'Critique', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', icon: Zap },
  out: { label: 'Rupture', color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)', icon: X }
}

const categoryColors: Record<string, string> = {
  'Boisson': '#3b82f6',
  'Nourriture': '#f59e0b',
  'Service': '#8b5cf6',
  'Autre': '#64748b'
}

export default function SuperAdminStock() {
  const [stockItems, setStockItems] = useState<StockItem[]>(mockStockItems)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCompany, setSelectedCompany] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const companies = ['all', ...new Set(stockItems.map(p => p.company.name))]
  const statuses = ['all', ...new Set(stockItems.map(p => p.status))]
  const categories = ['all', ...new Set(stockItems.map(p => p.category))]

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.company.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCompany = selectedCompany === 'all' || item.company.name === selectedCompany
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCompany && matchesStatus && matchesCategory
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
    return amount.toLocaleString() + ' F'
  }

  // Stats
  const totalItems = stockItems.length
  const totalStockValue = stockItems.reduce((acc, item) => acc + item.totalValue, 0)
  const criticalItems = stockItems.filter(item => item.status === 'critical' || item.status === 'out').length
  const lowStockItems = stockItems.filter(item => item.status === 'low').length
  const okItems = stockItems.filter(item => item.status === 'ok').length

  const totalInMovements = stockItems.reduce((acc, item) => acc + item.movements.in, 0)
  const totalOutMovements = stockItems.reduce((acc, item) => acc + item.movements.out, 0)

  return (
    <div className={`space-y-6 transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Stock Global</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            Vue d'ensemble du stock de toutes les entreprises
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
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Actualiser</span>
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
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Total produits</p>
          <p className="text-xl font-bold text-white">{totalItems}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Valeur stock</p>
          <p className="text-xl font-bold" style={{ color: '#22c55e' }}>{formatCurrency(totalStockValue)}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>OK</p>
          <p className="text-xl font-bold" style={{ color: '#22c55e' }}>{okItems}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Stock faible</p>
          <p className="text-xl font-bold" style={{ color: '#f59e0b' }}>{lowStockItems}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Critique/Rupture</p>
          <p className="text-xl font-bold" style={{ color: '#ef4444' }}>{criticalItems}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Rotation</p>
          <p className="text-xl font-bold text-white">
            {(stockItems.reduce((acc, item) => acc + (item.movements.out / Math.max(1, item.stock)), 0) / totalItems).toFixed(1)}x
          </p>
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
          <option value="ok">OK</option>
          <option value="low">Stock faible</option>
          <option value="critical">Critique</option>
          <option value="out">Rupture</option>
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

      {/* Tableau du stock */}
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
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Stock</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Valeur</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Rotation</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const stockPercentage = item.maxStock > 0 ? (item.stock / item.maxStock) * 100 : 0
                const isLow = item.stock <= item.minStock && item.stock >= 0
                
                return (
                  <tr key={item.id} className="border-b hover:bg-white/5 transition" style={{ borderColor: '#334155' }}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-white">{item.productName}</p>
                        <p className="text-xs" style={{ color: '#64748b' }}>ID: #{item.productId}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span 
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ 
                          background: `${categoryColors[item.category] || '#64748b'}20`,
                          color: categoryColors[item.category] || '#64748b'
                        }}
                      >
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" style={{ color: '#64748b' }} />
                        <span className="text-xs" style={{ color: '#94a3b8' }}>{item.company.name}</span>
                      </div>
                      <span className="text-xs" style={{ color: '#64748b' }}>{item.company.country}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${isLow ? 'text-red-400' : 'text-white'}`}>
                            {item.stock >= 0 ? item.stock : '∞'}
                          </span>
                          <span className="text-xs" style={{ color: '#64748b' }}>{item.unit}s</span>
                          {item.stock > 0 && (
                            <span className="text-xs" style={{ color: '#64748b' }}>
                              ({Math.round(stockPercentage)}%)
                            </span>
                          )}
                        </div>
                        {isLow && item.daysUntilRestock !== null && (
                          <span className="text-xs" style={{ color: '#f59e0b' }}>
                            J-{item.daysUntilRestock} avant rupture
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold" style={{ color: '#22c55e' }}>
                        {formatCurrency(item.totalValue)}
                      </span>
                      <span className="text-xs block" style={{ color: '#64748b' }}>
                        {formatCurrency(item.cost)}/u
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">{item.turnoverRate.toFixed(1)}x</span>
                        <span className="text-xs" style={{ color: '#64748b' }}>
                          In: {item.movements.in} • Out: {item.movements.out}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button 
                          onClick={() => { setSelectedItem(item); setIsModalOpen(true) }}
                          className="p-1.5 rounded transition hover:bg-white/10"
                          style={{ color: '#94a3b8' }}
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded transition hover:bg-white/10" style={{ color: '#94a3b8' }} title="Modifier">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filteredItems.length === 0 && (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto mb-2" style={{ color: '#334155' }} />
            <p className="text-sm" style={{ color: '#64748b' }}>Aucun stock trouvé</p>
          </div>
        )}
      </div>

      {/* MODAL DÉTAILS STOCK */}
      {isModalOpen && selectedItem && (
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
                    background: `${categoryColors[selectedItem.category] || '#64748b'}30`,
                    color: categoryColors[selectedItem.category] || '#64748b'
                  }}
                >
                  {selectedItem.productName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedItem.productName}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: '#64748b' }}>ID: #{selectedItem.productId}</span>
                    <span className="text-xs" style={{ color: '#64748b' }}>•</span>
                    <span className="text-xs" style={{ color: '#64748b' }}>{selectedItem.category}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded hover:bg-white/10" style={{ color: '#94a3b8' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Statistiques principales */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Stock actuel</p>
                  <p className={`text-lg font-bold ${selectedItem.stock <= selectedItem.minStock && selectedItem.stock >= 0 ? 'text-red-400' : 'text-white'}`}>
                    {selectedItem.stock >= 0 ? selectedItem.stock : 'Illimité'} {selectedItem.unit}s
                  </p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Valeur du stock</p>
                  <p className="text-lg font-bold" style={{ color: '#22c55e' }}>{formatCurrency(selectedItem.totalValue)}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Seuil minimum</p>
                  <p className="text-lg font-bold text-white">{selectedItem.minStock} {selectedItem.unit}s</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Rotation</p>
                  <p className="text-lg font-bold text-white">{selectedItem.turnoverRate.toFixed(1)}x</p>
                </div>
              </div>

              {/* Entreprise et Fournisseur */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Entreprise</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Building2 className="w-4 h-4" style={{ color: '#818cf8' }} />
                    <span className="font-medium text-white">{selectedItem.company.name}</span>
                    <span className="text-xs" style={{ color: '#64748b' }}>({selectedItem.company.country})</span>
                  </div>
                  <span className="text-xs" style={{ color: '#64748b' }}>Plan: {selectedItem.company.plan}</span>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Fournisseur</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Truck className="w-4 h-4" style={{ color: '#818cf8' }} />
                    <span className="font-medium text-white">{selectedItem.supplier || 'Aucun'}</span>
                  </div>
                  <span className="text-xs" style={{ color: '#64748b' }}>Dernier mouvement: {selectedItem.lastMovement}</span>
                </div>
              </div>

              {/* Mouvements */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Entrées</p>
                  <p className="text-lg font-bold" style={{ color: '#22c55e' }}>+{selectedItem.movements.in}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Sorties</p>
                  <p className="text-lg font-bold" style={{ color: '#ef4444' }}>-{selectedItem.movements.out}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Ajustements</p>
                  <p className="text-lg font-bold" style={{ color: '#f59e0b' }}>{selectedItem.movements.adjustment || 0}</p>
                </div>
              </div>

              {/* Prix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Prix d'achat</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(selectedItem.cost)} / {selectedItem.unit}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Prix de vente</p>
                  <p className="text-lg font-bold" style={{ color: '#22c55e' }}>{formatCurrency(selectedItem.price)} / {selectedItem.unit}</p>
                </div>
              </div>

              {/* Marge */}
              <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>Marge unitaire</p>
                    <p className="text-lg font-bold" style={{ color: '#22c55e' }}>
                      {formatCurrency(selectedItem.price - selectedItem.cost)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs" style={{ color: '#94a3b8' }}>Taux de marge</p>
                    <p className="text-lg font-bold" style={{ color: '#22c55e' }}>
                      {Math.round(((selectedItem.price - selectedItem.cost) / selectedItem.price) * 100)}%
                    </p>
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
                Modifier le stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}