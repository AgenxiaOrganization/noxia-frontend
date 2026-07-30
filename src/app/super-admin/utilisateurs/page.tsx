'use client'

import { useState, useEffect } from 'react'
import {
  Users, Search, Plus, Edit, Trash2, Eye, MoreVertical,
  Check, X, Mail, Phone, Calendar, MapPin, Shield,
  UserCheck, UserX, UserPlus, Clock, AlertTriangle,
  Download, Filter, ChevronDown, Activity, Award,
  Star, Crown, Gift, Zap, BarChart3, TrendingUp, TrendingDown,
  DollarSign, Building2, Smartphone, Key, Copy, CheckCircle
} from 'lucide-react'

// Types
interface User {
  id: number
  name: string
  email: string
  phone: string
  role: 'super_admin' | 'admin' | 'gerant' | 'caissier' | 'serveur' | 'magasinier' | 'comptable'
  status: 'active' | 'suspended' | 'pending' | 'inactive'
  company: {
    id: number
    name: string
    country: string
  }
  employeeId: string
  lastLogin: string
  createdAt: string
  updatedAt: string
  notifications: number
  avatar?: string
  permissions: string[]
}

// Données mockées
const mockUsers: User[] = [
  {
    id: 1,
    name: 'Jean Dupont',
    email: 'jean@lepremium.ga',
    phone: '+241 77 00 00 01',
    role: 'admin',
    status: 'active',
    company: { id: 1, name: 'Bar Le Premium', country: 'Gabon' },
    employeeId: 'EMP-001',
    lastLogin: '2026-07-10 14:30',
    createdAt: '2026-06-01',
    updatedAt: '2026-07-10',
    notifications: 3,
    permissions: ['Ventes', 'Stock', 'Rapports', 'Paramètres']
  },
  {
    id: 2,
    name: 'Marie Koffi',
    email: 'marie@ledelice.ga',
    phone: '+241 77 00 00 02',
    role: 'gerant',
    status: 'active',
    company: { id: 2, name: 'Snack Le Délice', country: 'Gabon' },
    employeeId: 'EMP-002',
    lastLogin: '2026-07-09 18:15',
    createdAt: '2026-06-15',
    updatedAt: '2026-07-09',
    notifications: 1,
    permissions: ['Ventes', 'Stock', 'Rapports']
  },
  {
    id: 3,
    name: 'Pierre Ngoma',
    email: 'pierre@vip.ga',
    phone: '+241 77 00 00 03',
    role: 'admin',
    status: 'active',
    company: { id: 3, name: 'Boîte VIP', country: 'Gabon' },
    employeeId: 'EMP-003',
    lastLogin: '2026-07-08 23:45',
    createdAt: '2026-05-20',
    updatedAt: '2026-07-08',
    notifications: 5,
    permissions: ['Ventes', 'Stock', 'Rapports', 'Paramètres', 'Employés']
  },
  {
    id: 4,
    name: 'Sophie Ndong',
    email: 'sophie@laterrasse.ga',
    phone: '+241 77 00 00 04',
    role: 'comptable',
    status: 'suspended',
    company: { id: 4, name: 'Restaurant La Terrasse', country: 'Cameroun' },
    employeeId: 'EMP-004',
    lastLogin: '2026-07-05 10:00',
    createdAt: '2026-04-10',
    updatedAt: '2026-07-05',
    notifications: 8,
    permissions: ['Rapports', 'Finances']
  },
  {
    id: 5,
    name: 'Alain Boussengui',
    email: 'alain@lesoleil.ga',
    phone: '+241 77 00 00 05',
    role: 'admin',
    status: 'pending',
    company: { id: 5, name: 'Bar Le Soleil', country: 'Sénégal' },
    employeeId: 'EMP-005',
    lastLogin: '2026-07-08 12:00',
    createdAt: '2026-07-08',
    updatedAt: '2026-07-08',
    notifications: 2,
    permissions: ['Ventes', 'Stock', 'Rapports', 'Paramètres']
  },
  {
    id: 6,
    name: 'Chloé Rivière',
    email: 'chloe@delices.ga',
    phone: '+241 77 00 00 06',
    role: 'serveur',
    status: 'active',
    company: { id: 1, name: 'Bar Le Premium', country: 'Gabon' },
    employeeId: 'EMP-006',
    lastLogin: '2026-07-10 13:20',
    createdAt: '2026-06-10',
    updatedAt: '2026-07-10',
    notifications: 0,
    permissions: ['Ventes']
  },
  {
    id: 7,
    name: 'François Tchou',
    email: 'francois@food.ga',
    phone: '+241 77 00 00 07',
    role: 'magasinier',
    status: 'inactive',
    company: { id: 2, name: 'Snack Le Délice', country: 'Gabon' },
    employeeId: 'EMP-007',
    lastLogin: '2026-07-01 08:30',
    createdAt: '2026-03-01',
    updatedAt: '2026-07-01',
    notifications: 4,
    permissions: ['Stock']
  },
]

const roleColors = {
  super_admin: '#ef4444',
  admin: '#4f46e5',
  gerant: '#22c55e',
  caissier: '#f59e0b',
  serveur: '#3b82f6',
  magasinier: '#8b5cf6',
  comptable: '#ec4899'
}

const roleLabels = {
  super_admin: 'Super Admin',
  admin: 'Administrateur',
  gerant: 'Gérant',
  caissier: 'Caissier',
  serveur: 'Serveur',
  magasinier: 'Magasinier',
  comptable: 'Comptable'
}

const statusConfig = {
  active: { label: 'Actif', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', icon: CheckCircle },
  suspended: { label: 'Suspendu', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', icon: X },
  pending: { label: 'En attente', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: Clock },
  inactive: { label: 'Inactif', color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)', icon: UserX }
}

export default function SuperAdminUtilisateurs() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedCompany, setSelectedCompany] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const roles = ['all', ...new Set(users.map(u => u.role))]
  const statuses = ['all', ...new Set(users.map(u => u.status))]
  const companies = ['all', ...new Set(users.map(u => u.company.name))]

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === 'all' || u.role === selectedRole
    const matchesStatus = selectedStatus === 'all' || u.status === selectedStatus
    const matchesCompany = selectedCompany === 'all' || u.company.name === selectedCompany
    return matchesSearch && matchesRole && matchesStatus && matchesCompany
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

  const getRoleBadge = (role: string) => {
    const color = roleColors[role as keyof typeof roleColors] || '#6366f1'
    const label = roleLabels[role as keyof typeof roleLabels] || role
    return (
      <span 
        className="text-xs px-2 py-0.5 rounded-full"
        style={{ background: `${color}20`, color: color }}
      >
        {label}
      </span>
    )
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(text)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Stats
  const totalUsers = users.length
  const activeUsers = users.filter(u => u.status === 'active').length
  const pendingUsers = users.filter(u => u.status === 'pending').length
  const suspendedUsers = users.filter(u => u.status === 'suspended').length

  return (
    <div className={`space-y-6 transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Utilisateurs</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            {totalUsers} utilisateurs • {activeUsers} actifs
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
            Ajouter un utilisateur
          </button>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Total utilisateurs</p>
          <p className="text-xl font-bold text-white">{totalUsers}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Actifs</p>
          <p className="text-xl font-bold" style={{ color: '#22c55e' }}>{activeUsers}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>En attente</p>
          <p className="text-xl font-bold" style={{ color: '#f59e0b' }}>{pendingUsers}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Suspendus</p>
          <p className="text-xl font-bold" style={{ color: '#ef4444' }}>{suspendedUsers}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
          <input
            type="text"
            placeholder="Rechercher un utilisateur (nom, email, ID)..."
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
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="rounded-lg px-3 py-2.5 text-white text-sm outline-none transition"
          style={{ 
            background: 'rgba(51, 65, 85, 0.5)',
            border: '1px solid #334155'
          }}
        >
          <option value="all">Tous les rôles</option>
          {roles.filter(r => r !== 'all').map(r => (
            <option key={r} value={r}>{roleLabels[r as keyof typeof roleLabels] || r}</option>
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
          {statuses.filter(s => s !== 'all').map(s => (
            <option key={s} value={s}>{statusConfig[s as keyof typeof statusConfig]?.label || s}</option>
          ))}
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

      {/* Tableau des utilisateurs */}
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
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Utilisateur</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Rôle</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Entreprise</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Dernière connexion</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-white/5 transition" style={{ borderColor: '#334155' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ 
                          background: roleColors[user.role as keyof typeof roleColors] || '#4f46e5' 
                        }}
                      >
                        {user.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-xs" style={{ color: '#64748b' }}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" style={{ color: '#64748b' }} />
                      <span className="text-xs" style={{ color: '#94a3b8' }}>{user.company.name}</span>
                    </div>
                    <span className="text-xs" style={{ color: '#64748b' }}>{user.company.country}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <code className="text-xs font-mono" style={{ color: '#818cf8' }}>{user.employeeId}</code>
                      <button
                        onClick={() => copyToClipboard(user.employeeId)}
                        className="p-0.5 rounded hover:bg-white/10 transition"
                        style={{ color: '#94a3b8' }}
                        title="Copier l'ID"
                      >
                        {copiedId === user.employeeId ? (
                          <CheckCircle className="w-3 h-3" style={{ color: '#22c55e' }} />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-xs" style={{ color: '#94a3b8' }}>{user.lastLogin}</p>
                      {user.notifications > 0 && (
                        <span className="text-xs" style={{ color: '#ef4444' }}>
                          {user.notifications} notifications
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button 
                        onClick={() => { setSelectedUser(user); setIsModalOpen(true) }}
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
        {filteredUsers.length === 0 && (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto mb-2" style={{ color: '#334155' }} />
            <p className="text-sm" style={{ color: '#64748b' }}>Aucun utilisateur trouvé</p>
          </div>
        )}
      </div>

      {/* MODAL DÉTAILS UTILISATEUR */}
      {isModalOpen && selectedUser && (
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
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white"
                  style={{ 
                    background: roleColors[selectedUser.role as keyof typeof roleColors] || '#4f46e5' 
                  }}
                >
                  {selectedUser.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedUser.name}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: '#64748b' }}>{selectedUser.email}</span>
                    <span className="text-xs" style={{ color: '#64748b' }}>•</span>
                    <span className="text-xs" style={{ color: '#64748b' }}>{selectedUser.phone}</span>
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
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Rôle</p>
                  <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Statut</p>
                  <div className="mt-1">{getStatusBadge(selectedUser.status)}</div>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>ID Employé</p>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-sm font-mono" style={{ color: '#818cf8' }}>{selectedUser.employeeId}</code>
                    <button
                      onClick={() => copyToClipboard(selectedUser.employeeId)}
                      className="p-0.5 rounded hover:bg-white/10 transition"
                      style={{ color: '#94a3b8' }}
                    >
                      {copiedId === selectedUser.employeeId ? (
                        <CheckCircle className="w-3 h-3" style={{ color: '#22c55e' }} />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Entreprise */}
              <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Entreprise</p>
                <div className="flex items-center gap-2 mt-1">
                  <Building2 className="w-4 h-4" style={{ color: '#818cf8' }} />
                  <span className="font-medium text-white">{selectedUser.company.name}</span>
                  <span className="text-xs" style={{ color: '#64748b' }}>({selectedUser.company.country})</span>
                </div>
              </div>

              {/* Permissions */}
              <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Permissions</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedUser.permissions.map((perm, i) => (
                    <span 
                      key={i}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}
                    >
                      {perm}
                    </span>
                  ))}
                  {selectedUser.permissions.length === 0 && (
                    <span className="text-xs" style={{ color: '#64748b' }}>Aucune permission</span>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Dernière connexion</p>
                  <p className="text-sm font-medium text-white">{selectedUser.lastLogin}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Notifications</p>
                  <p className="text-sm font-medium text-white">{selectedUser.notifications} non lues</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Compte créé le</p>
                  <p className="text-sm font-medium text-white">{selectedUser.createdAt}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Dernière mise à jour</p>
                  <p className="text-sm font-medium text-white">{selectedUser.updatedAt}</p>
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
                Modifier l'utilisateur
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}