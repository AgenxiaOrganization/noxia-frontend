'use client'

import { useState, useEffect, useRef } from 'react'
import {
  MessageSquare, Search, Send, Bot, User, Building2,
  Phone, Mail, MoreVertical, Eye, Download, Filter,
  CheckCircle, XCircle, Clock, AlertTriangle,
  Smartphone, MessageCircle, AtSign, Hash,
  ChevronDown, RefreshCw, Plus, Edit, Trash2,
  Reply, Forward, Archive, Flag, Star, Users,
  Calendar, Activity, Zap, Target, Award,
  Bell,
  FileText,
  Paperclip,
  Settings,
  X
} from 'lucide-react'

// Types
interface Message {
  id: number
  sender: {
    id: number
    name: string
    type: 'user' | 'system' | 'bot'
    company?: {
      id: number
      name: string
      country: string
    }
    avatar?: string
  }
  receiver: {
    id: number
    name: string
    type: 'user' | 'system' | 'bot'
    company?: {
      id: number
      name: string
      country: string
    }
  }
  subject: string
  content: string
  type: 'notification' | 'alert' | 'message' | 'system'
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'pending'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  channel: 'whatsapp' | 'telegram' | 'email' | 'in_app' | 'sms'
  attachments?: {
    id: number
    name: string
    size: string
    type: string
  }[]
  readAt?: string
  deliveredAt?: string
  createdAt: string
  updatedAt: string
  conversationId?: string
  replyTo?: number
}

// Données mockées
const mockMessages: Message[] = [
  {
    id: 1,
    sender: {
      id: 1,
      name: 'Jean Dupont',
      type: 'user',
      company: { id: 1, name: 'Bar Le Premium', country: 'Gabon' }
    },
    receiver: {
      id: 0,
      name: 'Assistant NOXIA',
      type: 'bot'
    },
    subject: 'Stock critique',
    content: 'Le stock de Bière Guinness est critique (12 unités restantes). Pouvez-vous nous aider à commander ?',
    type: 'alert',
    status: 'read',
    priority: 'high',
    channel: 'whatsapp',
    readAt: '2026-07-10 12:20:00',
    deliveredAt: '2026-07-10 12:15:00',
    createdAt: '2026-07-10 12:15:00',
    updatedAt: '2026-07-10 12:20:00',
    conversationId: 'conv-001'
  },
  {
    id: 2,
    sender: {
      id: 0,
      name: 'Assistant NOXIA',
      type: 'bot'
    },
    receiver: {
      id: 1,
      name: 'Jean Dupont',
      type: 'user',
      company: { id: 1, name: 'Bar Le Premium', country: 'Gabon' }
    },
    subject: 'Réponse commande',
    content: 'Votre commande de Bière Guinness a été passée auprès de Brasserie du Gabon. Livraison prévue dans 48h.',
    type: 'message',
    status: 'read',
    priority: 'medium',
    channel: 'whatsapp',
    readAt: '2026-07-10 12:25:00',
    deliveredAt: '2026-07-10 12:18:00',
    createdAt: '2026-07-10 12:18:00',
    updatedAt: '2026-07-10 12:25:00',
    conversationId: 'conv-001',
    replyTo: 1
  },
  {
    id: 3,
    sender: {
      id: 2,
      name: 'Marie Koffi',
      type: 'user',
      company: { id: 2, name: 'Snack Le Délice', country: 'Gabon' }
    },
    receiver: {
      id: 0,
      name: 'Support NOXIA',
      type: 'system'
    },
    subject: 'Problème d\'encaissement',
    content: 'Bonjour, j\'ai un problème avec l\'encaissement des commandes depuis 2 jours. Le total affiché ne correspond pas au montant réel.',
    type: 'message',
    status: 'pending',
    priority: 'urgent',
    channel: 'telegram',
    createdAt: '2026-07-10 11:30:00',
    updatedAt: '2026-07-10 11:30:00',
    conversationId: 'conv-002'
  },
  {
    id: 4,
    sender: {
      id: 0,
      name: 'Système NOXIA',
      type: 'system'
    },
    receiver: {
      id: 3,
      name: 'Pierre Ngoma',
      type: 'user',
      company: { id: 3, name: 'Boîte VIP', country: 'Cameroun' }
    },
    subject: 'Rappel paiement',
    content: 'Votre abonnement Business expire dans 5 jours. Merci de procéder au renouvellement.',
    type: 'notification',
    status: 'sent',
    priority: 'high',
    channel: 'email',
    deliveredAt: '2026-07-10 10:00:00',
    createdAt: '2026-07-10 09:00:00',
    updatedAt: '2026-07-10 10:00:00',
    conversationId: 'conv-003'
  },
  {
    id: 5,
    sender: {
      id: 4,
      name: 'Sophie Ndong',
      type: 'user',
      company: { id: 4, name: 'Restaurant La Terrasse', country: 'Côte d\'Ivoire' }
    },
    receiver: {
      id: 0,
      name: 'Support NOXIA',
      type: 'system'
    },
    subject: 'Demande d\'annulation',
    content: 'Je souhaite annuler mon abonnement Premium pour raisons personnelles. Merci de m\'indiquer la procédure.',
    type: 'message',
    status: 'delivered',
    priority: 'medium',
    channel: 'email',
    deliveredAt: '2026-07-09 15:00:00',
    createdAt: '2026-07-09 14:30:00',
    updatedAt: '2026-07-09 15:00:00',
    conversationId: 'conv-004'
  },
  {
    id: 6,
    sender: {
      id: 5,
      name: 'Alain Boussengui',
      type: 'user',
      company: { id: 5, name: 'Bar Le Soleil', country: 'Sénégal' }
    },
    receiver: {
      id: 0,
      name: 'Assistant NOXIA',
      type: 'bot'
    },
    subject: 'Activation WhatsApp',
    content: 'Bonjour, je souhaite activer WhatsApp pour mon établissement. Comment puis-je faire ?',
    type: 'message',
    status: 'read',
    priority: 'medium',
    channel: 'whatsapp',
    readAt: '2026-07-08 12:30:00',
    deliveredAt: '2026-07-08 12:10:00',
    createdAt: '2026-07-08 12:10:00',
    updatedAt: '2026-07-08 12:30:00',
    conversationId: 'conv-005'
  },
  {
    id: 7,
    sender: {
      id: 0,
      name: 'Assistant NOXIA',
      type: 'bot'
    },
    receiver: {
      id: 5,
      name: 'Alain Boussengui',
      type: 'user',
      company: { id: 5, name: 'Bar Le Soleil', country: 'Sénégal' }
    },
    subject: 'Guide activation WhatsApp',
    content: 'Pour activer WhatsApp, rendez-vous dans l\'onglet "Messagerie" du tableau de bord. Suivez ensuite la procédure indiquée.',
    type: 'message',
    status: 'read',
    priority: 'medium',
    channel: 'whatsapp',
    readAt: '2026-07-08 12:35:00',
    deliveredAt: '2026-07-08 12:15:00',
    createdAt: '2026-07-08 12:15:00',
    updatedAt: '2026-07-08 12:35:00',
    conversationId: 'conv-005',
    replyTo: 6
  }
]

const typeConfig = {
  notification: { label: 'Notification', color: '#3b82f6', icon: Bell },
  alert: { label: 'Alerte', color: '#ef4444', icon: AlertTriangle },
  message: { label: 'Message', color: '#22c55e', icon: MessageSquare },
  system: { label: 'Système', color: '#64748b', icon: Settings }
}

const statusConfig = {
  sent: { label: 'Envoyé', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', icon: Send },
  delivered: { label: 'Livré', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', icon: CheckCircle },
  read: { label: 'Lu', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)', icon: Eye },
  failed: { label: 'Échoué', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', icon: XCircle },
  pending: { label: 'En attente', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: Clock }
}

const priorityConfig = {
  low: { label: 'Basse', color: '#3b82f6' },
  medium: { label: 'Moyenne', color: '#f59e0b' },
  high: { label: 'Élevée', color: '#ef4444' },
  urgent: { label: 'Urgente', color: '#7f1d1d' }
}

const channelConfig = {
  whatsapp: { label: 'WhatsApp', color: '#22c55e', icon: Smartphone },
  telegram: { label: 'Telegram', color: '#3b82f6', icon: Send },
  email: { label: 'Email', color: '#818cf8', icon: Mail },
  in_app: { label: 'In-App', color: '#8b5cf6', icon: MessageSquare },
  sms: { label: 'SMS', color: '#f59e0b', icon: Phone }
}

export default function SuperAdminMessagerie() {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [selectedChannel, setSelectedChannel] = useState('all')
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'alerts' | 'templates'>('inbox')

  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const types = ['all', ...new Set(messages.map(m => m.type))]
  const statuses = ['all', ...new Set(messages.map(m => m.status))]
  const priorities = ['all', ...new Set(messages.map(m => m.priority))]
  const channels = ['all', ...new Set(messages.map(m => m.channel))]

  const filteredMessages = messages.filter(m => {
    const matchesSearch = m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         m.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         m.sender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         m.receiver.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || m.type === selectedType
    const matchesStatus = selectedStatus === 'all' || m.status === selectedStatus
    const matchesPriority = selectedPriority === 'all' || m.priority === selectedPriority
    const matchesChannel = selectedChannel === 'all' || m.channel === selectedChannel
    return matchesSearch && matchesType && matchesStatus && matchesPriority && matchesChannel
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

  const getPriorityBadge = (priority: string) => {
    const config = priorityConfig[priority as keyof typeof priorityConfig]
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

  const getChannelBadge = (channel: string) => {
    const config = channelConfig[channel as keyof typeof channelConfig]
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

  const formatDate = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const handleSendReply = () => {
    if (!replyContent.trim() || !selectedMessage) return
    alert(`✅ Réponse envoyée à ${selectedMessage.sender.name} :\n\n"${replyContent}"`)
    setReplyContent('')
  }

  // Stats
  const totalMessages = messages.length
  const unreadMessages = messages.filter(m => m.status === 'sent' || m.status === 'delivered').length
  const alertMessages = messages.filter(m => m.type === 'alert').length
  const urgentMessages = messages.filter(m => m.priority === 'urgent').length

  return (
    <div className={`space-y-6 transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Messagerie</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            {totalMessages} messages • {unreadMessages} non lus • {urgentMessages} urgents
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
            <span className="hidden sm:inline">Rafraîchir</span>
          </button>
          <button
            className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition flex items-center gap-2"
            style={{ 
              background: '#4f46e5',
              boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
            }}
          >
            <Plus className="w-4 h-4" />
            Nouveau message
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Total messages</p>
          <p className="text-xl font-bold text-white">{totalMessages}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Non lus</p>
          <p className="text-xl font-bold" style={{ color: '#ef4444' }}>{unreadMessages}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Alertes</p>
          <p className="text-xl font-bold" style={{ color: '#f59e0b' }}>{alertMessages}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Urgents</p>
          <p className="text-xl font-bold" style={{ color: '#7f1d1d' }}>{urgentMessages}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'inbox', label: 'Boîte de réception', icon: MessageSquare },
          { id: 'sent', label: 'Envoyés', icon: Send },
          { id: 'alerts', label: 'Alertes', icon: AlertTriangle },
          { id: 'templates', label: 'Modèles', icon: FileText }
        ].map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id ? 'border' : 'border-transparent'
              }`}
              style={{
                background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.15)' : 'rgba(51, 65, 85, 0.3)',
                borderColor: activeTab === tab.id ? '#6366f1' : 'transparent',
                color: activeTab === tab.id ? '#818cf8' : '#94a3b8'
              }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
          <input
            type="text"
            placeholder="Rechercher un message..."
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
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="rounded-lg px-3 py-2.5 text-white text-sm outline-none transition"
          style={{ 
            background: 'rgba(51, 65, 85, 0.5)',
            border: '1px solid #334155'
          }}
        >
          <option value="all">Tous les statuts</option>
          <option value="sent">Envoyé</option>
          <option value="delivered">Livré</option>
          <option value="read">Lu</option>
          <option value="failed">Échoué</option>
          <option value="pending">En attente</option>
        </select>
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="rounded-lg px-3 py-2.5 text-white text-sm outline-none transition"
          style={{ 
            background: 'rgba(51, 65, 85, 0.5)',
            border: '1px solid #334155'
          }}
        >
          <option value="all">Toutes les priorités</option>
          <option value="low">Basse</option>
          <option value="medium">Moyenne</option>
          <option value="high">Élevée</option>
          <option value="urgent">Urgente</option>
        </select>
        <select
          value={selectedChannel}
          onChange={(e) => setSelectedChannel(e.target.value)}
          className="rounded-lg px-3 py-2.5 text-white text-sm outline-none transition"
          style={{ 
            background: 'rgba(51, 65, 85, 0.5)',
            border: '1px solid #334155'
          }}
        >
          <option value="all">Tous les canaux</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="telegram">Telegram</option>
          <option value="email">Email</option>
          <option value="in_app">In-App</option>
          <option value="sms">SMS</option>
        </select>
      </div>

      {/* Tableau des messages */}
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
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Message</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>De/À</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Priorité</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Canal</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMessages.map((message) => (
                <tr key={message.id} className="border-b hover:bg-white/5 transition" style={{ borderColor: '#334155' }}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-white truncate max-w-[150px]">{message.subject}</p>
                      <p className="text-xs truncate max-w-[150px]" style={{ color: '#94a3b8' }}>
                        {message.content.length > 60 ? message.content.substring(0, 60) + '...' : message.content}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="flex items-center gap-1">
                        {message.sender.type === 'user' && <User className="w-3 h-3" style={{ color: '#818cf8' }} />}
                        {message.sender.type === 'bot' && <Bot className="w-3 h-3" style={{ color: '#22c55e' }} />}
                        {message.sender.type === 'system' && <Settings className="w-3 h-3" style={{ color: '#64748b' }} />}
                        <span className="text-sm text-white">{message.sender.name}</span>
                      </div>
                      {message.sender.company && (
                        <span className="text-xs" style={{ color: '#64748b' }}>
                          {message.sender.company.name}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {getTypeBadge(message.type)}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(message.status)}
                  </td>
                  <td className="px-4 py-3">
                    {getPriorityBadge(message.priority)}
                  </td>
                  <td className="px-4 py-3">
                    {getChannelBadge(message.channel)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-xs" style={{ color: '#94a3b8' }}>
                        {formatDate(message.createdAt)}
                      </span>
                      {message.readAt && (
                        <span className="text-xs" style={{ color: '#64748b' }}>
                          Lu: {formatDate(message.readAt)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button 
                        onClick={() => { setSelectedMessage(message); setIsModalOpen(true) }}
                        className="p-1.5 rounded transition hover:bg-white/10"
                        style={{ color: '#94a3b8' }}
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded transition hover:bg-white/10" style={{ color: '#94a3b8' }} title="Répondre">
                        <Reply className="w-4 h-4" />
                      </button>
                      {message.status === 'pending' && (
                        <button className="p-1.5 rounded transition hover:bg-green-500/20" style={{ color: '#22c55e' }} title="Marquer comme lu">
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
        {filteredMessages.length === 0 && (
          <div className="p-8 text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-2" style={{ color: '#334155' }} />
            <p className="text-sm" style={{ color: '#64748b' }}>Aucun message trouvé</p>
          </div>
        )}
      </div>

      {/* MODAL DÉTAILS MESSAGE */}
      {isModalOpen && selectedMessage && (
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
                    background: typeConfig[selectedMessage.type as keyof typeof typeConfig]?.color + '20' || 'rgba(51,65,85,0.3)',
                    color: typeConfig[selectedMessage.type as keyof typeof typeConfig]?.color || '#94a3b8'
                  }}
                >
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedMessage.subject}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: '#64748b' }}>ID: #{selectedMessage.id}</span>
                    <span className="text-xs" style={{ color: '#64748b' }}>•</span>
                    <span className="text-xs" style={{ color: '#64748b' }}>{formatDate(selectedMessage.createdAt)}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded hover:bg-white/10" style={{ color: '#94a3b8' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* En-tête du message */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>De</p>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedMessage.sender.type === 'user' && <User className="w-4 h-4" style={{ color: '#818cf8' }} />}
                    {selectedMessage.sender.type === 'bot' && <Bot className="w-4 h-4" style={{ color: '#22c55e' }} />}
                    {selectedMessage.sender.type === 'system' && <Settings className="w-4 h-4" style={{ color: '#64748b' }} />}
                    <span className="font-medium text-white">{selectedMessage.sender.name}</span>
                  </div>
                  {selectedMessage.sender.company && (
                    <p className="text-xs" style={{ color: '#64748b' }}>
                      <Building2 className="w-3 h-3 inline mr-1" />
                      {selectedMessage.sender.company.name} ({selectedMessage.sender.company.country})
                    </p>
                  )}
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>À</p>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedMessage.receiver.type === 'user' && <User className="w-4 h-4" style={{ color: '#818cf8' }} />}
                    {selectedMessage.receiver.type === 'bot' && <Bot className="w-4 h-4" style={{ color: '#22c55e' }} />}
                    {selectedMessage.receiver.type === 'system' && <Settings className="w-4 h-4" style={{ color: '#64748b' }} />}
                    <span className="font-medium text-white">{selectedMessage.receiver.name}</span>
                  </div>
                  {selectedMessage.receiver.company && (
                    <p className="text-xs" style={{ color: '#64748b' }}>
                      <Building2 className="w-3 h-3 inline mr-1" />
                      {selectedMessage.receiver.company.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Métadonnées */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.2)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Type</p>
                  <div className="mt-0.5">{getTypeBadge(selectedMessage.type)}</div>
                </div>
                <div className="p-2 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.2)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Statut</p>
                  <div className="mt-0.5">{getStatusBadge(selectedMessage.status)}</div>
                </div>
                <div className="p-2 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.2)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Priorité</p>
                  <div className="mt-0.5">{getPriorityBadge(selectedMessage.priority)}</div>
                </div>
                <div className="p-2 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.2)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Canal</p>
                  <div className="mt-0.5">{getChannelBadge(selectedMessage.channel)}</div>
                </div>
              </div>

              {/* Contenu */}
              <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Contenu</p>
                <div className="mt-2 p-3 rounded-lg whitespace-pre-wrap text-sm text-white" style={{ background: 'rgba(0,0,0,0.2)' }}>
                  {selectedMessage.content}
                </div>
              </div>

              {/* Pièces jointes */}
              {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Pièces jointes</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedMessage.attachments.map((attachment) => (
                      <span 
                        key={attachment.id}
                        className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                        style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}
                      >
                        <Paperclip className="w-3 h-3" />
                        {attachment.name} ({attachment.size})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.2)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Envoyé le</p>
                  <p className="text-sm text-white">{formatDate(selectedMessage.createdAt)}</p>
                </div>
                {selectedMessage.readAt && (
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.2)' }}>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>Lu le</p>
                    <p className="text-sm text-white">{formatDate(selectedMessage.readAt)}</p>
                  </div>
                )}
              </div>

              {/* Répondre */}
              <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Répondre</p>
                <div className="flex gap-2 mt-2">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Votre réponse..."
                    className="flex-1 rounded-lg px-4 py-2.5 text-white text-sm outline-none transition resize-none"
                    style={{ 
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid #334155',
                      minHeight: '80px'
                    }}
                    rows={3}
                  />
                </div>
                <button
                  onClick={handleSendReply}
                  disabled={!replyContent.trim()}
                  className="mt-2 px-4 py-2 rounded-lg text-white text-sm font-semibold transition flex items-center gap-2 disabled:opacity-50"
                  style={{ 
                    background: '#4f46e5',
                    boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  <Send className="w-4 h-4" />
                  Envoyer la réponse
                </button>
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
                  background: '#22c55e',
                  boxShadow: '0 10px 25px -5px rgba(34, 197, 94, 0.3)'
                }}
              >
                <Reply className="w-4 h-4" />
                Répondre
              </button>
              <button
                className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition"
                style={{ 
                  background: '#818cf8',
                  boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
                }}
              >
                Transférer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}