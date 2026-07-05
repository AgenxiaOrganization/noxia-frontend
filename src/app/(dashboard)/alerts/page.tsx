'use client'

import { useState } from 'react'
import {
  Bell, AlertTriangle, CheckCircle, XCircle,
  Package, DollarSign, Users, MessageSquare,
  Mail, Smartphone, Settings, ChevronDown,
  Search, Filter, Clock
} from 'lucide-react'

// Données mockées
const mockAlerts = [
  { 
    id: 1, 
    type: 'stock_faible', 
    product: 'Bière Guinness 65cl', 
    stock: 12, 
    threshold: 15,
    status: 'actif',
    date: '2026-06-28 10:00',
    channels: ['whatsapp', 'email']
  },
  { 
    id: 2, 
    type: 'stock_faible', 
    product: 'Champagne Moet 75cl', 
    stock: 6, 
    threshold: 3,
    status: 'actif',
    date: '2026-06-27 18:30',
    channels: ['whatsapp']
  },
  { 
    id: 3, 
    type: 'stock_faible', 
    product: 'Whisky Jack Daniel\'s', 
    stock: 8, 
    threshold: 5,
    status: 'actif',
    date: '2026-06-28 09:15',
    channels: ['whatsapp', 'email', 'push']
  },
  { 
    id: 4, 
    type: 'stock_epuise', 
    product: 'Jus d\'Orange 33cl', 
    stock: 0, 
    threshold: 15,
    status: 'critique',
    date: '2026-06-28 08:00',
    channels: ['whatsapp', 'email', 'push']
  },
  { 
    id: 5, 
    type: 'caisse_ecart', 
    product: 'Caisse Principale', 
    stock: null, 
    threshold: null,
    status: 'actif',
    date: '2026-06-27 22:00',
    channels: ['email']
  },
]

const mockProducts = [
  { id: 1, name: 'Bière Castel 65cl', stock: 48, minStock: 20, maxStock: 100, unit: 'unité' },
  { id: 2, name: 'Bière Guinness 65cl', stock: 12, minStock: 15, maxStock: 100, unit: 'unité' },
  { id: 3, name: 'Whisky Jack Daniel\'s', stock: 8, minStock: 5, maxStock: 50, unit: 'bouteille' },
  { id: 4, name: 'Champagne Moet 75cl', stock: 6, minStock: 3, maxStock: 30, unit: 'bouteille' },
  { id: 5, name: 'Coca-Cola 33cl', stock: 120, minStock: 30, maxStock: 200, unit: 'unité' },
  { id: 6, name: 'Jus d\'Orange 33cl', stock: 0, minStock: 15, maxStock: 100, unit: 'unité' },
]

const channelIcons = {
  whatsapp: MessageSquare,
  email: Mail,
  push: Smartphone
}

export default function AlertsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  const filteredAlerts = mockAlerts.filter(a => {
    const matchesSearch = a.product.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || a.type === filterType
    return matchesSearch && matchesType
  })

  const activeAlerts = mockAlerts.filter(a => a.status === 'actif' || a.status === 'critique')

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Alertes</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            {activeAlerts.length} alertes actives • {mockAlerts.filter(a => a.status === 'critique').length} critiques
          </p>
        </div>
        <button
          className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition flex items-center gap-2"
          style={{ 
            background: '#4f46e5',
            boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
          }}
        >
          <Settings className="w-4 h-4" />
          Configurer les alertes
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
          <input
            type="text"
            placeholder="Rechercher une alerte..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
            style={{ 
              background: 'rgba(51, 65, 85, 0.5)',
              border: '1px solid #334155'
            }}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {['all', 'stock_faible', 'stock_epuise', 'caisse_ecart'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                filterType === type ? 'border' : 'border-transparent'
              }`}
              style={{
                background: filterType === type ? 'rgba(99, 102, 241, 0.15)' : 'rgba(51, 65, 85, 0.3)',
                borderColor: filterType === type ? '#6366f1' : 'transparent',
                color: filterType === type ? '#818cf8' : '#94a3b8'
              }}
            >
              {type === 'all' ? 'Tous' : 
               type === 'stock_faible' ? 'Stock faible' : 
               type === 'stock_epuise' ? 'Rupture' : 
               'Caisse'}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des alertes */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const Icon = alert.type === 'stock_faible' ? AlertTriangle : 
                        alert.type === 'stock_epuise' ? XCircle : 
                        DollarSign
          
          const statusColor = alert.status === 'critique' ? '#ef4444' : 
                              alert.status === 'actif' ? '#f59e0b' : 
                              '#22c55e'
          
          const statusLabel = alert.status === 'critique' ? 'Critique' : 
                              alert.status === 'actif' ? 'Active' : 
                              'Résolue'

          return (
            <div 
              key={alert.id}
              className="rounded-xl border p-4 transition-all hover:border-primary-500"
              style={{ 
                background: '#1e293b',
                borderColor: alert.status === 'critique' ? '#ef4444' : '#334155'
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ 
                      background: alert.type === 'stock_faible' ? 'rgba(245, 158, 11, 0.15)' :
                                 alert.type === 'stock_epuise' ? 'rgba(239, 68, 68, 0.15)' :
                                 'rgba(99, 102, 241, 0.15)'
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: statusColor }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-white">{alert.product}</span>
                      <span 
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ 
                          background: `${statusColor}20`,
                          color: statusColor
                        }}
                      >
                        {statusLabel}
                      </span>
                      {alert.type === 'stock_faible' && (
                        <span className="text-xs" style={{ color: '#94a3b8' }}>
                          {alert.stock} / {alert.threshold} unités
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs flex-wrap">
                      <span style={{ color: '#64748b' }}>
                        <Clock className="w-3 h-3 inline mr-1" />
                        {alert.date}
                      </span>
                      <span style={{ color: '#64748b' }}>
                        Canaux: {alert.channels.map(c => (
                          <span key={c} className="inline-flex items-center gap-1 ml-1">
                            {c === 'whatsapp' && '📱 WhatsApp'}
                            {c === 'email' && '✉️ Email'}
                            {c === 'push' && '🔔 Push'}
                          </span>
                        ))}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {alert.status === 'actif' && (
                    <button
                      className="px-3 py-1 rounded text-xs font-medium transition flex items-center gap-1"
                      style={{ 
                        background: 'rgba(34, 197, 94, 0.15)',
                        color: '#22c55e'
                      }}
                    >
                      <CheckCircle className="w-3 h-3" />
                      Résoudre
                    </button>
                  )}
                  <button
                    className="px-3 py-1 rounded text-xs font-medium transition flex items-center gap-1"
                    style={{ 
                      background: 'rgba(51, 65, 85, 0.3)',
                      color: '#94a3b8'
                    }}
                  >
                    Détails
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Configuration des seuils */}
      <div 
        className="rounded-xl border p-4"
        style={{ background: '#1e293b', borderColor: '#334155' }}
      >
        <h3 className="font-semibold text-sm text-white mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Seuils d'alerte par produit
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: '#334155' }}>
                <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Produit</th>
                <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Stock actuel</th>
                <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Seuil actuel</th>
                <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Nouveau seuil</th>
                <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {mockProducts.map((product) => {
                const isLow = product.stock >= 0 && product.stock <= product.minStock
                const isOut = product.stock === 0
                
                return (
                  <tr key={product.id} className="border-b" style={{ borderColor: '#334155' }}>
                    <td className="px-3 py-2 text-white">{product.name}</td>
                    <td className="px-3 py-2" style={{ color: isOut ? '#ef4444' : isLow ? '#f59e0b' : '#94a3b8' }}>
                      {product.stock >= 0 ? product.stock : 'Illimité'}
                    </td>
                    <td className="px-3 py-2" style={{ color: '#94a3b8' }}>{product.minStock}</td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        defaultValue={product.minStock}
                        className="w-20 rounded px-2 py-1 text-white text-xs outline-none transition"
                        style={{ 
                          background: 'rgba(51, 65, 85, 0.5)',
                          border: '1px solid #334155'
                        }}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <span 
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          isOut ? 'bg-red-500/20 text-red-400' :
                          isLow ? 'bg-orange-500/20 text-orange-400' :
                          'bg-green-500/20 text-green-400'
                        }`}
                      >
                        {isOut ? 'Rupture' : isLow ? 'Alerte' : 'OK'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <button
          className="mt-3 px-4 py-2 rounded-lg text-sm font-medium transition"
          style={{ 
            background: 'rgba(99, 102, 241, 0.15)',
            color: '#818cf8'
          }}
        >
          Mettre à jour les seuils
        </button>
      </div>

      {/* Configuration des canaux */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: MessageSquare, name: 'WhatsApp', desc: 'Responsable, Magasinier', active: true },
          { icon: Mail, name: 'Email', desc: 'Responsable, Comptable', active: true },
          { icon: Smartphone, name: 'Push', desc: 'Tous les rôles', active: true },
        ].map((channel, i) => (
          <div 
            key={i}
            className="rounded-xl border p-4 text-center"
            style={{ background: '#1e293b', borderColor: '#334155' }}
          >
            <div className="flex items-center justify-center gap-2">
              <channel.icon className="w-5 h-5" style={{ color: '#818cf8' }} />
              <span className="font-medium text-white">{channel.name}</span>
            </div>
            <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>{channel.desc}</p>
            <label className="flex items-center justify-center gap-2 mt-2 text-xs">
              <input type="checkbox" defaultChecked={channel.active} className="accent-primary-500" />
              <span style={{ color: '#94a3b8' }}>Actif</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}