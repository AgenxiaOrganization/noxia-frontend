'use client'

import { useState, useEffect } from 'react'
import {
  AlertTriangle, Bell, CheckCircle, XCircle, Clock,
  Search, Filter, Download, Eye, MoreVertical,
  Building2, Package, CreditCard, Users, Truck,
  Server, Database, Shield, Zap, Target, Award,
  TrendingUp, TrendingDown, DollarSign, ShoppingBag,
  RefreshCw, Mail, Send, ChevronDown, Activity,
  X
} from 'lucide-react'

// Types
interface SystemAlert {
  id: number
  title: string
  description: string
  type: 'stock' | 'payment' | 'subscription' | 'security' | 'system' | 'performance' | 'company'
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: 'active' | 'resolved' | 'dismissed' | 'in_progress'
  source: {
    id: number
    name: string
    type: 'company' | 'system' | 'user'
    company?: {
      id: number
      name: string
      country: string
    }
  }
  affectedCount?: number
  details: {
    message: string
    errorCode?: string
    stackTrace?: string
    metadata?: Record<string, any>
  }
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  assignedTo?: string
  notes?: string
}

// Données mockées
const mockAlerts: SystemAlert[] = [
  {
    id: 1,
    title: 'Stock critique - Bière Guinness',
    description: 'Le stock de Bière Guinness est tombé sous le seuil critique (12 unités restantes)',
    type: 'stock',
    severity: 'high',
    status: 'active',
    source: {
      id: 1,
      name: 'Bar Le Premium',
      type: 'company',
      company: { id: 1, name: 'Bar Le Premium', country: 'Gabon' }
    },
    affectedCount: 1,
    details: {
      message: 'Stock critique détecté pour le produit Bière Guinness (ID: 2)',
      metadata: {
        productId: 2,
        currentStock: 12,
        threshold: 15,
        companyId: 1
      }
    },
    createdAt: '2026-07-10 12:15:00',
    updatedAt: '2026-07-10 12:15:00',
    assignedTo: 'Jean Dupont',
    notes: 'À réapprovisionner d\'urgence'
  },
  {
    id: 2,
    title: 'Paiement échoué - Commission Mars',
    description: 'Le paiement de la commission du mois de Mars a échoué pour Boîte VIP',
    type: 'payment',
    severity: 'critical',
    status: 'in_progress',
    source: {
      id: 3,
      name: 'Boîte VIP',
      type: 'company',
      company: { id: 3, name: 'Boîte VIP', country: 'Cameroun' }
    },
    affectedCount: 1,
    details: {
      message: 'Échec de paiement de commission - carte expirée',
      errorCode: 'PAY_ERR_001',
      metadata: {
        paymentId: 6,
        amount: 25000,
        attempt: 3
      }
    },
    createdAt: '2026-03-02 09:00:00',
    updatedAt: '2026-03-02 09:30:00',
    assignedTo: 'Super Admin',
    notes: 'Contacter le client pour mise à jour de la carte'
  },
  {
    id: 3,
    title: 'Abonnement expiré - Restaurant La Terrasse',
    description: "L'abonnement Premium de Restaurant La Terrasse a expiré le 10 mai",
    type: 'subscription',
    severity: 'medium',
    status: 'resolved',
    source: {
      id: 4,
      name: 'Restaurant La Terrasse',
      type: 'company',
      company: { id: 4, name: 'Restaurant La Terrasse', country: 'Côte d\'Ivoire' }
    },
    affectedCount: 1,
    details: {
      message: "Abonnement expiré depuis 60 jours",
      metadata: {
        subscriptionId: 4,
        expiredAt: '2026-05-10',
        daysOverdue: 60
      }
    },
    createdAt: '2026-05-10 00:00:00',
    updatedAt: '2026-05-15 10:00:00',
    resolvedAt: '2026-05-15 10:00:00',
    assignedTo: 'Super Admin'
  },
  {
    id: 4,
    title: 'Tentative de connexion suspecte',
    description: 'Tentative de connexion avec des identifiants incorrects pour Pierre Ngoma',
    type: 'security',
    severity: 'critical',
    status: 'active',
    source: {
      id: 0,
      name: 'Système de sécurité',
      type: 'system'
    },
    affectedCount: 1,
    details: {
      message: 'Tentative de connexion suspecte depuis IP 45.33.22.11',
      metadata: {
        ip: '45.33.22.11',
        userId: 3,
        attempts: 5,
        timestamp: '2026-07-10 05:30:00'
      }
    },
    createdAt: '2026-07-10 05:30:00',
    updatedAt: '2026-07-10 05:30:00',
    assignedTo: 'Super Admin',
    notes: 'Bloquer l\'IP si persistant'
  },
  {
    id: 5,
    title: 'Performance dégradée - API',
    description: 'Le temps de réponse de l\'API a dépassé 5 secondes sur 3 requêtes',
    type: 'performance',
    severity: 'medium',
    status: 'in_progress',
    source: {
      id: 0,
      name: 'Système de monitoring',
      type: 'system'
    },
    affectedCount: 15,
    details: {
      message: 'Temps de réponse API anormalement élevé',
      metadata: {
        endpoints: ['/api/sales', '/api/products', '/api/stock'],
        avgResponseTime: 5400,
        threshold: 2000
      }
    },
    createdAt: '2026-07-10 14:00:00',
    updatedAt: '2026-07-10 14:00:00',
    assignedTo: 'Super Admin'
  },
  {
    id: 6,
    title: 'Nouvelle entreprise en attente de vérification',
    description: "L'entreprise Bar Le Soleil attend la vérification des documents",
    type: 'company',
    severity: 'low',
    status: 'active',
    source: {
      id: 5,
      name: 'Bar Le Soleil',
      type: 'company',
      company: { id: 5, name: 'Bar Le Soleil', country: 'Sénégal' }
    },
    affectedCount: 1,
    details: {
      message: 'Documents en attente de vérification pour Bar Le Soleil',
      metadata: {
        companyId: 5,
        documents: ['registre_commerce', 'attestation_fiscale'],
        submittedAt: '2026-07-08'
      }
    },
    createdAt: '2026-07-08 12:00:00',
    updatedAt: '2026-07-08 12:00:00',
    assignedTo: 'Super Admin'
  }
]

const typeConfig = {
  stock: { label: 'Stock', color: '#f59e0b', icon: Package },
  payment: { label: 'Paiement', color: '#22c55e', icon: DollarSign },
  subscription: { label: 'Abonnement', color: '#818cf8', icon: CreditCard },
  security: { label: 'Sécurité', color: '#ef4444', icon: Shield },
  system: { label: 'Système', color: '#64748b', icon: Server },
  performance: { label: 'Performance', color: '#3b82f6', icon: Zap },
  company: { label: 'Entreprise', color: '#8b5cf6', icon: Building2 }
}

const severityConfig = {
  critical: { label: 'Critique', color: '#7f1d1d', bg: 'rgba(127, 29, 29, 0.25)', icon: AlertTriangle },
  high: { label: 'Élevée', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', icon: AlertTriangle },
  medium: { label: 'Moyenne', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: Clock },
  low: { label: 'Basse', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', icon: Activity }
}

const statusConfig = {
  active: { label: 'Active', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', icon: AlertTriangle },
  in_progress: { label: 'En cours', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: Clock },
  resolved: { label: 'Résolue', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', icon: CheckCircle },
  dismissed: { label: 'Ignorée', color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)', icon: XCircle }
}

export default function SuperAdminAlertes() {
  const [alerts, setAlerts] = useState<SystemAlert[]>(mockAlerts)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedSeverity, setSelectedSeverity] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedAlert, setSelectedAlert] = useState<SystemAlert | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const types = ['all', ...new Set(alerts.map(a => a.type))]
  const severities = ['all', ...new Set(alerts.map(a => a.severity))]
  const statuses = ['all', ...new Set(alerts.map(a => a.status))]

  const filteredAlerts = alerts.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         a.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         a.source.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || a.type === selectedType
    const matchesSeverity = selectedSeverity === 'all' || a.severity === selectedSeverity
    const matchesStatus = selectedStatus === 'all' || a.status === selectedStatus
    return matchesSearch && matchesType && matchesSeverity && matchesStatus
  })

  const getTypeBadge = (type: string) => {
    const config = typeConfig[type as keyof typeof typeConfig]
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

  const formatDate = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  // Stats
  const totalAlerts = alerts.length
  const activeAlerts = alerts.filter(a => a.status === 'active' || a.status === 'in_progress').length
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved').length

  return (
    <div className={`space-y-6 transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Alertes Système</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            {activeAlerts} alertes actives • {criticalAlerts} critiques
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              // Simuler un rafraîchissement
              alert('🔄 Alertes rafraîchies !')
            }}
            className="px-3 py-2 rounded-lg transition flex items-center gap-2"
            style={{ 
              background: 'rgba(51, 65, 85, 0.3)',
              border: '1px solid #334155',
              color: '#94a3b8'
            }}
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Rafraîchir</span>
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
          <p className="text-xs" style={{ color: '#94a3b8' }}>Total alertes</p>
          <p className="text-xl font-bold text-white">{totalAlerts}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Actives</p>
          <p className="text-xl font-bold" style={{ color: '#ef4444' }}>{activeAlerts}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Critiques</p>
          <p className="text-xl font-bold" style={{ color: '#7f1d1d' }}>{criticalAlerts}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Résolues</p>
          <p className="text-xl font-bold" style={{ color: '#22c55e' }}>{resolvedAlerts}</p>
        </div>
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
          {Object.entries(typeConfig).map(([key, config]) => (
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
          <option value="critical">Critique</option>
          <option value="high">Élevée</option>
          <option value="medium">Moyenne</option>
          <option value="low">Basse</option>
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
          <option value="active">Active</option>
          <option value="in_progress">En cours</option>
          <option value="resolved">Résolue</option>
          <option value="dismissed">Ignorée</option>
        </select>
      </div>

      {/* Tableau des alertes */}
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
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Alerte</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Source</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Sévérité</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.map((alert) => (
                <tr key={alert.id} className="border-b hover:bg-white/5 transition" style={{ borderColor: '#334155' }}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-white">{alert.title}</p>
                      <p className="text-xs truncate max-w-[200px]" style={{ color: '#94a3b8' }}>
                        {alert.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {getTypeBadge(alert.type)}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-white">{alert.source.name}</p>
                      {alert.source.company && (
                        <span className="text-xs" style={{ color: '#64748b' }}>
                          {alert.source.company.name}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {getSeverityBadge(alert.severity)}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(alert.status)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-xs" style={{ color: '#94a3b8' }}>
                        {formatDate(alert.createdAt)}
                      </span>
                      {alert.assignedTo && (
                        <span className="text-xs" style={{ color: '#64748b' }}>
                          Assigné à: {alert.assignedTo}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button 
                        onClick={() => { setSelectedAlert(alert); setIsModalOpen(true) }}
                        className="p-1.5 rounded transition hover:bg-white/10"
                        style={{ color: '#94a3b8' }}
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {alert.status === 'active' && (
                        <button className="p-1.5 rounded transition hover:bg-green-500/20" style={{ color: '#22c55e' }} title="Marquer comme résolue">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {alert.status === 'in_progress' && (
                        <button className="p-1.5 rounded transition hover:bg-white/10" style={{ color: '#94a3b8' }} title="Marquer comme résolue">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredAlerts.length === 0 && (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 mx-auto mb-2" style={{ color: '#334155' }} />
            <p className="text-sm" style={{ color: '#64748b' }}>Aucune alerte trouvée</p>
          </div>
        )}
      </div>

      {/* MODAL DÉTAILS ALERTE */}
      {isModalOpen && selectedAlert && (
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
                    background: severityConfig[selectedAlert.severity as keyof typeof severityConfig]?.bg || 'rgba(51,65,85,0.3)',
                    color: severityConfig[selectedAlert.severity as keyof typeof severityConfig]?.color || '#94a3b8'
                  }}
                >
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedAlert.title}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: '#64748b' }}>ID: #{selectedAlert.id}</span>
                    <span className="text-xs" style={{ color: '#64748b' }}>•</span>
                    <span className="text-xs" style={{ color: '#64748b' }}>{formatDate(selectedAlert.createdAt)}</span>
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
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Type</p>
                  <div className="mt-1">{getTypeBadge(selectedAlert.type)}</div>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Sévérité</p>
                  <div className="mt-1">{getSeverityBadge(selectedAlert.severity)}</div>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Statut</p>
                  <div className="mt-1">{getStatusBadge(selectedAlert.status)}</div>
                </div>
              </div>

              {/* Description */}
              <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Description</p>
                <p className="text-sm text-white">{selectedAlert.description}</p>
              </div>

              {/* Source */}
              <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Source</p>
                <p className="text-sm font-medium text-white">{selectedAlert.source.name}</p>
                {selectedAlert.source.company && (
                  <p className="text-xs" style={{ color: '#64748b' }}>
                    <Building2 className="w-3 h-3 inline mr-1" />
                    {selectedAlert.source.company.name} ({selectedAlert.source.company.country})
                  </p>
                )}
              </div>

              {/* Détails techniques */}
              {selectedAlert.details.metadata && (
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Détails techniques</p>
                  <pre className="text-xs text-white mt-1 whitespace-pre-wrap">
                    {JSON.stringify(selectedAlert.details.metadata, null, 2)}
                  </pre>
                  {selectedAlert.details.errorCode && (
                    <p className="text-xs mt-1" style={{ color: '#ef4444' }}>
                      Code erreur: {selectedAlert.details.errorCode}
                    </p>
                  )}
                </div>
              )}

              {/* Assignation et Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Assigné à</p>
                  <p className="text-sm font-medium text-white">{selectedAlert.assignedTo || 'Non assigné'}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Résolue le</p>
                  <p className="text-sm font-medium text-white">{selectedAlert.resolvedAt ? formatDate(selectedAlert.resolvedAt) : 'Non résolue'}</p>
                </div>
              </div>

              {/* Notes */}
              {selectedAlert.notes && (
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Notes</p>
                  <p className="text-sm text-white">{selectedAlert.notes}</p>
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
              {selectedAlert.status === 'active' && (
                <button
                  className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition flex items-center justify-center gap-2"
                  style={{ 
                    background: '#4f46e5',
                    boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  <Mail className="w-4 h-4" />
                  Prendre en charge
                </button>
              )}
              <button
                className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition"
                style={{ 
                  background: '#22c55e',
                  boxShadow: '0 10px 25px -5px rgba(34, 197, 94, 0.3)'
                }}
              >
                Marquer comme résolue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}