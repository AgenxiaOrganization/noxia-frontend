'use client'

import { useState, useEffect } from 'react'
import {
  FileText, Search, Filter, Download, ChevronDown,
  Activity, User, Users, Building2, CreditCard, Package,
  Truck, Bell, Settings, LogOut, Mail, Phone,
  CheckCircle, AlertTriangle, XCircle, Clock,
  Eye, MoreVertical, Calendar, BarChart3,
  Shield, Zap, Target, Award, Gift, Crown,
  TrendingUp, TrendingDown, DollarSign, ShoppingBag,
  X
} from 'lucide-react'

// Types
interface Log {
  id: number
  action: string
  actionType: 'auth' | 'company' | 'user' | 'subscription' | 'payment' | 'product' | 'stock' | 'sale' | 'supplier' | 'system' | 'security'
  severity: 'info' | 'warning' | 'error' | 'critical'
  user: {
    id: number
    name: string
    email: string
    role: string
  }
  company?: {
    id: number
    name: string
    country: string
  }
  targetType: 'user' | 'company' | 'subscription' | 'product' | 'sale' | 'payment'
  targetId?: number
  targetName?: string
  details: {
    before?: any
    after?: any
    message: string
    ip?: string
    userAgent?: string
  }
  timestamp: string
  createdAt: string
}

// Données mockées
const mockLogs: Log[] = [
  {
    id: 1,
    action: 'Connexion utilisateur',
    actionType: 'auth',
    severity: 'info',
    user: { id: 1, name: 'Jean Dupont', email: 'jean@lepremium.ga', role: 'Admin' },
    company: { id: 1, name: 'Bar Le Premium', country: 'Gabon' },
    targetType: 'user',
    targetId: 1,
    targetName: 'Jean Dupont',
    details: {
      message: 'Connexion réussie depuis Chrome 150.0',
      ip: '192.168.1.100',
      userAgent: 'Chrome/150.0.0.0'
    },
    timestamp: '2026-07-10 14:30:00',
    createdAt: '2026-07-10 14:30:00'
  },
  // ... le reste des logs
]

const actionTypeColors = {
  auth: { label: 'Authentification', color: '#3b82f6', icon: User },
  company: { label: 'Entreprise', color: '#8b5cf6', icon: Building2 },
  user: { label: 'Utilisateur', color: '#22c55e', icon: Users },
  subscription: { label: 'Abonnement', color: '#f59e0b', icon: CreditCard },
  payment: { label: 'Paiement', color: '#22c55e', icon: DollarSign },
  product: { label: 'Produit', color: '#818cf8', icon: Package },
  stock: { label: 'Stock', color: '#f59e0b', icon: Package },
  sale: { label: 'Vente', color: '#22c55e', icon: ShoppingBag },
  supplier: { label: 'Fournisseur', color: '#64748b', icon: Truck },
  system: { label: 'Système', color: '#64748b', icon: Settings },
  security: { label: 'Sécurité', color: '#ef4444', icon: Shield }
}

const severityConfig = {
  info: { label: 'Info', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', icon: Activity },
  warning: { label: 'Alerte', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: AlertTriangle },
  error: { label: 'Erreur', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', icon: XCircle },
  critical: { label: 'Critique', color: '#7f1d1d', bg: 'rgba(127, 29, 29, 0.25)', icon: AlertTriangle }
}

export default function SuperAdminLogs() {
  const [logs, setLogs] = useState<Log[]>(mockLogs)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedActionType, setSelectedActionType] = useState('all')
  const [selectedSeverity, setSelectedSeverity] = useState('all')
  const [selectedUser, setSelectedUser] = useState('all')
  const [selectedLog, setSelectedLog] = useState<Log | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const actionTypes = ['all', ...new Set(logs.map(l => l.actionType))]
  const severities = ['all', ...new Set(logs.map(l => l.severity))]
  const users = ['all', ...new Set(logs.map(l => l.user.name))]

  const filteredLogs = logs.filter(l => {
    const matchesSearch = l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         l.details.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         l.targetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         l.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesActionType = selectedActionType === 'all' || l.actionType === selectedActionType
    const matchesSeverity = selectedSeverity === 'all' || l.severity === selectedSeverity
    const matchesUser = selectedUser === 'all' || l.user.name === selectedUser
    return matchesSearch && matchesActionType && matchesSeverity && matchesUser
  })

  const getActionTypeBadge = (type: string) => {
    const config = actionTypeColors[type as keyof typeof actionTypeColors]
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

  const getSeverityBadge = (severity: string) => {
    const config = severityConfig[severity as keyof typeof severityConfig]
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

  const formatDate = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  // Stats
  const totalLogs = logs.length
  const infoLogs = logs.filter(l => l.severity === 'info').length
  const warningLogs = logs.filter(l => l.severity === 'warning').length
  const errorLogs = logs.filter(l => l.severity === 'error' || l.severity === 'critical').length

  return (
    <div className={`space-y-6 transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Journal d'audit</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            {totalLogs} événements enregistrés
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
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filtrer</span>
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Total événements</p>
          <p className="text-xl font-bold text-white">{totalLogs}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Info</p>
          <p className="text-xl font-bold" style={{ color: '#3b82f6' }}>{infoLogs}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Alertes</p>
          <p className="text-xl font-bold" style={{ color: '#f59e0b' }}>{warningLogs}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Erreurs / Critiques</p>
          <p className="text-xl font-bold" style={{ color: '#ef4444' }}>{errorLogs}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
          <input
            type="text"
            placeholder="Rechercher une action, un message, une cible..."
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
          value={selectedActionType}
          onChange={(e) => setSelectedActionType(e.target.value)}
          className="rounded-lg px-3 py-2.5 text-white text-sm outline-none transition"
          style={{ 
            background: 'rgba(51, 65, 85, 0.5)',
            border: '1px solid #334155'
          }}
        >
          <option value="all">Tous les types</option>
          {Object.entries(actionTypeColors).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="rounded-lg px-3 py-2.5 text-white text-sm outline-none transition"
          style={{ 
            background: 'rgba(51, 65, 85, 0.5)',
            border: '1px solid #334155'
          }}
        >
          <option value="all">Toutes les sévérités</option>
          <option value="info">Info</option>
          <option value="warning">Alerte</option>
          <option value="error">Erreur</option>
          <option value="critical">Critique</option>
        </select>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="rounded-lg px-3 py-2.5 text-white text-sm outline-none transition"
          style={{ 
            background: 'rgba(51, 65, 85, 0.5)',
            border: '1px solid #334155'
          }}
        >
          <option value="all">Tous les utilisateurs</option>
          {users.filter(u => u !== 'all').map(u => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </div>

      {/* Tableau des logs */}
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
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Utilisateur</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Cible</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Sévérité</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Détails</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-white/5 transition" style={{ borderColor: '#334155' }}>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-white">{formatDate(log.timestamp)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm text-white">{log.action}</span>
                      {log.company && (
                        <span className="text-xs" style={{ color: '#64748b' }}>
                          <Building2 className="w-3 h-3 inline mr-1" />
                          {log.company.name}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {getActionTypeBadge(log.actionType)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm text-white">{log.user.name}</span>
                      <span className="text-xs" style={{ color: '#64748b' }}>{log.user.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {log.targetName ? (
                      <div className="flex flex-col">
                        <span className="text-sm text-white">{log.targetName}</span>
                        <span className="text-xs" style={{ color: '#64748b' }}>ID: #{log.targetId}</span>
                      </div>
                    ) : (
                      <span className="text-xs" style={{ color: '#64748b' }}>-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {getSeverityBadge(log.severity)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-[200px]">
                      <p className="text-xs truncate" style={{ color: '#94a3b8' }}>
                        {log.details.message}
                      </p>
                      {log.details.ip && (
                        <span className="text-xs" style={{ color: '#64748b' }}>IP: {log.details.ip}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => { setSelectedLog(log); setIsModalOpen(true) }}
                      className="p-1.5 rounded transition hover:bg-white/10"
                      style={{ color: '#94a3b8' }}
                      title="Voir les détails"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredLogs.length === 0 && (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-2" style={{ color: '#334155' }} />
            <p className="text-sm" style={{ color: '#64748b' }}>Aucun log trouvé</p>
          </div>
        )}
      </div>

      {/* MODAL DÉTAILS LOG */}
      {isModalOpen && selectedLog && (
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
                  style={{ 
                    background: severityConfig[selectedLog.severity as keyof typeof severityConfig]?.bg || 'rgba(51,65,85,0.3)',
                    color: severityConfig[selectedLog.severity as keyof typeof severityConfig]?.color || '#94a3b8'
                  }}
                >
                  {(() => {
                    const SeverityIcon = severityConfig[selectedLog.severity as keyof typeof severityConfig]?.icon || FileText
                    return <SeverityIcon className="w-6 h-6" />
                  })()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Détails du log</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: '#64748b' }}>ID: #{selectedLog.id}</span>
                    <span className="text-xs" style={{ color: '#64748b' }}>•</span>
                    <span className="text-xs" style={{ color: '#64748b' }}>{formatDate(selectedLog.timestamp)}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded hover:bg-white/10" style={{ color: '#94a3b8' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Infos principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Action</p>
                  <p className="text-sm font-medium text-white">{selectedLog.action}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Type</p>
                  <div className="mt-1">{getActionTypeBadge(selectedLog.actionType)}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Sévérité</p>
                  <div className="mt-1">{getSeverityBadge(selectedLog.severity)}</div>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Utilisateur</p>
                  <p className="text-sm font-medium text-white">{selectedLog.user.name}</p>
                  <p className="text-xs" style={{ color: '#64748b' }}>{selectedLog.user.email}</p>
                </div>
              </div>

              {/* Cible */}
              {selectedLog.targetName && (
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Cible</p>
                  <p className="text-sm font-medium text-white">{selectedLog.targetName}</p>
                  <p className="text-xs" style={{ color: '#64748b' }}>Type: {selectedLog.targetType} • ID: #{selectedLog.targetId}</p>
                </div>
              )}

              {/* Entreprise */}
              {selectedLog.company && (
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Entreprise</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Building2 className="w-4 h-4" style={{ color: '#818cf8' }} />
                    <span className="font-medium text-white">{selectedLog.company.name}</span>
                    <span className="text-xs" style={{ color: '#64748b' }}>({selectedLog.company.country})</span>
                  </div>
                </div>
              )}

              {/* Détails */}
              <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Message</p>
                <p className="text-sm text-white">{selectedLog.details.message}</p>
              </div>

              {/* Avant/Après */}
              {selectedLog && (selectedLog.details.before || selectedLog.details.after) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedLog.details.before && (
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                      <p className="text-xs" style={{ color: '#94a3b8' }}>Avant</p>
                      <pre className="text-xs text-white mt-1 whitespace-pre-wrap">
                        {JSON.stringify(selectedLog.details.before, null, 2)}
                      </pre>
                    </div>
                  )}
                  {selectedLog.details.after && (
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                      <p className="text-xs" style={{ color: '#94a3b8' }}>Après</p>
                      <pre className="text-xs text-white mt-1 whitespace-pre-wrap">
                        {JSON.stringify(selectedLog.details.after, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* IP */}
              {selectedLog.details.ip && (
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Informations techniques</p>
                  <p className="text-sm text-white">IP: {selectedLog.details.ip}</p>
                  {selectedLog.details.userAgent && (
                    <p className="text-xs" style={{ color: '#64748b' }}>User-Agent: {selectedLog.details.userAgent}</p>
                  )}
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
                <Download className="w-4 h-4" />
                Exporter ce log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}