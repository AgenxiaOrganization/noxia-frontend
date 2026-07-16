'use client'

import { useState } from 'react'
import { Search, Plus, Edit, Trash2, Building2, MoreVertical, Check, X, Eye } from 'lucide-react'

// Données mockées
const mockCompanies = [
  { id: 1, name: 'Bar Le Premium', email: 'contact@lepremium.ga', plan: 'Premium', status: 'actif', users: 8, date: '2026-06-01' },
  { id: 2, name: 'Snack Le Délice', email: 'contact@ledelice.ga', plan: 'Starter', status: 'actif', users: 3, date: '2026-06-15' },
  { id: 3, name: 'Boîte VIP', email: 'contact@vip.ga', plan: 'Business', status: 'actif', users: 12, date: '2026-05-20' },
  { id: 4, name: 'Restaurant La Terrasse', email: 'contact@laterrasse.ga', plan: 'Premium', status: 'suspendu', users: 5, date: '2026-04-10' },
  { id: 5, name: 'Bar Le Soleil', email: 'contact@lesoleil.ga', plan: 'Essai', status: 'en_attente', users: 1, date: '2026-07-08' },
]

export default function SuperAdminEntreprises() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCompanies = mockCompanies.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Entreprises</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            {mockCompanies.length} entreprises inscrites
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
          Ajouter une entreprise
        </button>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
        <input
          type="text"
          placeholder="Rechercher une entreprise..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
          style={{ 
            background: 'rgba(51, 65, 85, 0.5)',
            border: '1px solid #334155'
          }}
        />
      </div>

      {/* Tableau */}
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
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Plan</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Utilisateurs</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((company) => (
                <tr key={company.id} className="border-b" style={{ borderColor: '#334155' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
                        <Building2 className="w-4 h-4" style={{ color: '#818cf8' }} />
                      </div>
                      <div>
                        <p className="font-medium text-white">{company.name}</p>
                        <p className="text-xs" style={{ color: '#64748b' }}>{company.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                      {company.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white">{company.users}</td>
                  <td className="px-4 py-3">{getStatusBadge(company.status)}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#94a3b8' }}>{company.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded transition hover:bg-white/10" style={{ color: '#94a3b8' }}>
                        <Eye className="w-4 h-4" />
                      </button>
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
        {filteredCompanies.length === 0 && (
          <div className="p-8 text-center">
            <Building2 className="w-12 h-12 mx-auto mb-2" style={{ color: '#334155' }} />
            <p className="text-sm" style={{ color: '#64748b' }}>Aucune entreprise trouvée</p>
          </div>
        )}
      </div>
    </div>
  )
}