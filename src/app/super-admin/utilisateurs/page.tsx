'use client'

import { useState } from 'react'
import { Search, Plus, Edit, Trash2, User, MoreVertical, Check, X } from 'lucide-react'

// Données mockées
const mockUsers = [
  { id: 1, name: 'Jean Dupont', email: 'jean@lepremium.ga', role: 'Admin', company: 'Bar Le Premium', status: 'actif', date: '2026-06-01' },
  { id: 2, name: 'Marie Koffi', email: 'marie@ledelice.ga', role: 'Gérant', company: 'Snack Le Délice', status: 'actif', date: '2026-06-15' },
  { id: 3, name: 'Pierre Ngoma', email: 'pierre@vip.ga', role: 'Admin', company: 'Boîte VIP', status: 'actif', date: '2026-05-20' },
  { id: 4, name: 'Sophie Ndong', email: 'sophie@laterrasse.ga', role: 'Comptable', company: 'Restaurant La Terrasse', status: 'suspendu', date: '2026-04-10' },
  { id: 5, name: 'Alain Boussengui', email: 'alain@lesoleil.ga', role: 'Admin', company: 'Bar Le Soleil', status: 'en_attente', date: '2026-07-08' },
]

export default function SuperAdminUtilisateurs() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredUsers = mockUsers.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.company.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const config = {
      actif: { label: 'Actif', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' },
      suspendu: { label: 'Suspendu', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
      en_attente: { label: 'En attente', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
    }
    const c = config[status as keyof typeof config] || config.en_attente
    return (
      <span 
        className="text-xs px-2 py-0.5 rounded-full"
        style={{ background: c.bg, color: c.color }}
      >
        {c.label}
      </span>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Utilisateurs</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            {mockUsers.length} utilisateurs
          </p>
        </div>
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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
        <input
          type="text"
          placeholder="Rechercher un utilisateur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
          style={{ 
            background: 'rgba(51, 65, 85, 0.5)',
            border: '1px solid #334155'
          }}
        />
      </div>

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
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b" style={{ borderColor: '#334155' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: '#4f46e5' }}>
                        {user.name.split(' ').map(w => w[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-xs" style={{ color: '#64748b' }}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#94a3b8' }}>{user.company}</td>
                  <td className="px-4 py-3">{getStatusBadge(user.status)}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#94a3b8' }}>{user.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded transition hover:bg-white/10" style={{ color: '#94a3b8' }}>
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded transition hover:bg-red-500/20" style={{ color: '#f87171' }}>
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
            <User className="w-12 h-12 mx-auto mb-2" style={{ color: '#334155' }} />
            <p className="text-sm" style={{ color: '#64748b' }}>Aucun utilisateur trouvé</p>
          </div>
        )}
      </div>
    </div>
  )
}