'use client'

import { useState } from 'react'
import { Search, CreditCard, MoreVertical, Check, X, Edit, Trash2 } from 'lucide-react'

// Données mockées
const mockSubscriptions = [
  { id: 1, company: 'Bar Le Premium', plan: 'Premium', price: 11000, status: 'actif', start: '2026-06-01', end: '2026-07-01' },
  { id: 2, company: 'Snack Le Délice', plan: 'Starter', price: 5000, status: 'actif', start: '2026-06-15', end: '2026-07-15' },
  { id: 3, company: 'Boîte VIP', plan: 'Business', price: 14000, status: 'actif', start: '2026-05-20', end: '2026-06-20' },
  { id: 4, company: 'Restaurant La Terrasse', plan: 'Premium', price: 11000, status: 'expire', start: '2026-04-10', end: '2026-05-10' },
  { id: 5, company: 'Bar Le Soleil', plan: 'Essai', price: 0, status: 'actif', start: '2026-07-08', end: '2026-08-08' },
]

export default function SuperAdminAbonnements() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredSubscriptions = mockSubscriptions.filter(s =>
    s.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.plan.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const config = {
      actif: { label: 'Actif', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' },
      expire: { label: 'Expiré', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
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
          <h1 className="text-xl font-bold text-white">Abonnements</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            {mockSubscriptions.length} abonnements
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
        <input
          type="text"
          placeholder="Rechercher un abonnement..."
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
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Entreprise</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Plan</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Prix</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Début</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Fin</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.map((sub) => (
                <tr key={sub.id} className="border-b" style={{ borderColor: '#334155' }}>
                  <td className="px-4 py-3 text-white">{sub.company}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                      {sub.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: '#22c55e' }}>{sub.price.toLocaleString()} F</td>
                  <td className="px-4 py-3">{getStatusBadge(sub.status)}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#94a3b8' }}>{sub.start}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#94a3b8' }}>{sub.end}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded transition hover:bg-white/10" style={{ color: '#94a3b8' }}>
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredSubscriptions.length === 0 && (
          <div className="p-8 text-center">
            <CreditCard className="w-12 h-12 mx-auto mb-2" style={{ color: '#334155' }} />
            <p className="text-sm" style={{ color: '#64748b' }}>Aucun abonnement trouvé</p>
          </div>
        )}
      </div>
    </div>
  )
}