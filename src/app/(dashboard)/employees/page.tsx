'use client'

import { useState } from 'react'
import { 
  Plus, Search, Edit, Trash2, User, UserCheck, UserX,
  Phone, Mail, DollarSign, Award, Key, Copy, Check
} from 'lucide-react'

// Données mockées
const mockEmployees = [
  { id: 1, name: 'Jean M.', role: 'caissier', phone: '+241 77 00 00 01', email: 'jean@lepremium.ga', salary: 150000, commission: 2, active: true, sales: 450000 },
  { id: 2, name: 'Marie K.', role: 'serveur', phone: '+241 77 00 00 02', email: 'marie@lepremium.ga', salary: 120000, commission: 5, active: true, sales: 320000 },
  { id: 3, name: 'Pierre O.', role: 'magasinier', phone: '+241 77 00 00 03', email: 'pierre@lepremium.ga', salary: 130000, commission: 0, active: true, sales: 0 },
  { id: 4, name: 'Sophie N.', role: 'caissier', phone: '+241 77 00 00 04', email: 'sophie@lepremium.ga', salary: 150000, commission: 2, active: true, sales: 280000 },
  { id: 5, name: 'David L.', role: 'serveur', phone: '+241 77 00 00 05', email: 'david@lepremium.ga', salary: 120000, commission: 5, active: false, sales: 0 },
  { id: 6, name: 'Alice B.', role: 'comptable', phone: '+241 77 00 00 06', email: 'alice@lepremium.ga', salary: 200000, commission: 0, active: true, sales: 0 },
  { id: 7, name: 'François T.', role: 'gerant', phone: '+241 77 00 00 07', email: 'francois@lepremium.ga', salary: 250000, commission: 1, active: true, sales: 820000 },
  { id: 8, name: 'Chloé R.', role: 'serveur', phone: '+241 77 00 00 08', email: 'chloe@lepremium.ga', salary: 120000, commission: 5, active: true, sales: 410000 },
]

const roleColors: Record<string, string> = {
  administrateur: '#6366f1',
  responsable: '#818cf8',
  gerant: '#22c55e',
  caissier: '#f59e0b',
  serveur: '#3b82f6',
  magasinier: '#8b5cf6',
  comptable: '#ec4899'
}

const rolePermissions: Record<string, { label: string, permissions: string[] }> = {
  administrateur: {
    label: 'Administrateur',
    permissions: ['Ventes', 'Stock', 'Rapports', 'Paramètres', 'Employés']
  },
  responsable: {
    label: 'Responsable',
    permissions: ['Ventes', 'Stock', 'Rapports', 'Paramètres']
  },
  gerant: {
    label: 'Gérant',
    permissions: ['Ventes', 'Stock', 'Rapports']
  },
  caissier: {
    label: 'Caissier',
    permissions: ['Ventes']
  },
  serveur: {
    label: 'Serveur',
    permissions: ['Ventes']
  },
  magasinier: {
    label: 'Magasinier',
    permissions: ['Stock']
  },
  comptable: {
    label: 'Comptable',
    permissions: ['Rapports']
  }
}

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<any>(null)
  const [showWhatsAppId, setShowWhatsAppId] = useState<string | null>(null)

  const filteredEmployees = mockEmployees.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeEmployees = filteredEmployees.filter(e => e.active)
  const totalSales = filteredEmployees.reduce((acc, e) => acc + e.sales, 0)

  const generateWhatsAppId = () => {
    return 'SB-' + Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // TODO: Afficher un toast de confirmation
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Employés</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            {activeEmployees.length} actifs • {filteredEmployees.length - activeEmployees.length} inactifs
          </p>
        </div>
        <button
          onClick={() => { setEditingEmployee(null); setIsModalOpen(true); }}
          className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition flex items-center gap-2"
          style={{ 
            background: '#4f46e5',
            boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
          }}
        >
          <Plus className="w-4 h-4" />
          Ajouter un employé
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Total employés</p>
          <p className="text-xl font-bold text-white">{filteredEmployees.length}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Actifs</p>
          <p className="text-xl font-bold text-green-400">{activeEmployees.length}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Ventes totales</p>
          <p className="text-xl font-bold text-accent-400">{totalSales.toLocaleString()} F</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Meilleur vendeur</p>
          <p className="text-xl font-bold text-primary-400">
            {mockEmployees.sort((a, b) => b.sales - a.sales)[0]?.name || '-'}
          </p>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
        <input
          type="text"
          placeholder="Rechercher un employé..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
          style={{ 
            background: 'rgba(51, 65, 85, 0.5)',
            border: '1px solid #334155'
          }}
        />
      </div>

      {/* Tableau des employés */}
      <div 
        className="rounded-xl border overflow-hidden"
        style={{ background: '#1e293b', borderColor: '#334155' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: '#334155' }}>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Employé</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Rôle</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Salaire</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Ventes</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>WhatsApp</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="border-b" style={{ borderColor: '#334155' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: roleColors[employee.role] || '#6366f1' }}
                      >
                        {employee.name.split(' ').map(w => w[0]).join('')}
                      </div>
                      <span className="font-medium text-white">{employee.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span 
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: `${roleColors[employee.role] || '#6366f1'}20`,
                        color: roleColors[employee.role] || '#6366f1'
                      }}
                    >
                      {employee.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs" style={{ color: '#94a3b8' }}>{employee.phone}</p>
                    <p className="text-xs" style={{ color: '#64748b' }}>{employee.email}</p>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#94a3b8' }}>
                    {employee.salary.toLocaleString()} FCFA
                    {employee.commission > 0 && (
                      <span className="block text-xs" style={{ color: '#22c55e' }}>
                        +{employee.commission}% commission
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className="font-semibold" style={{ color: '#22c55e' }}>
                      {employee.sales.toLocaleString()} F
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span 
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        employee.active 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {employee.active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {employee.active ? (
                      <button
                        onClick={() => setShowWhatsAppId(showWhatsAppId === employee.id ? null : String(employee.id))}
                        className="text-xs transition flex items-center gap-1"
                        style={{ color: '#818cf8' }}
                      >
                        <Key className="w-3 h-3" />
                        {showWhatsAppId === employee.id ? 'Masquer ID' : 'Générer ID'}
                      </button>
                    ) : (
                      <span className="text-xs" style={{ color: '#64748b' }}>Inactif</span>
                    )}
                    {showWhatsAppId === employee.id && (
                      <div className="mt-1 flex items-center gap-1">
                        <code className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(51,65,85,0.5)', color: '#f1f5f9' }}>
                          {generateWhatsAppId()}
                        </code>
                        <button
                          onClick={() => copyToClipboard(generateWhatsAppId())}
                          className="p-0.5 rounded hover:bg-white/10 transition"
                          style={{ color: '#94a3b8' }}
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditingEmployee(employee); setIsModalOpen(true); }}
                        className="p-1.5 rounded transition hover:bg-white/10"
                        style={{ color: '#94a3b8' }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Modifier le statut de "${employee.name}" ?`)) {
                            // TODO: Appel API toggle active
                            console.log('Toggle:', employee.id)
                          }
                        }}
                        className="p-1.5 rounded transition hover:bg-white/10"
                        style={{ color: employee.active ? '#f87171' : '#22c55e' }}
                      >
                        {employee.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredEmployees.length === 0 && (
          <div className="p-8 text-center">
            <User className="w-12 h-12 mx-auto mb-2" style={{ color: '#334155' }} />
            <p className="text-sm" style={{ color: '#64748b' }}>Aucun employé trouvé</p>
          </div>
        )}
      </div>

      {/* Matrice des permissions */}
      <div 
        className="rounded-xl border p-4"
        style={{ background: '#1e293b', borderColor: '#334155' }}
      >
        <h3 className="font-semibold text-sm text-white mb-3">Matrice des permissions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: '#334155' }}>
                <th className="px-3 py-2 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Rôle</th>
                <th className="px-3 py-2 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Permissions</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(rolePermissions).map(([key, value]) => (
                <tr key={key} className="border-b" style={{ borderColor: '#334155' }}>
                  <td className="px-3 py-2">
                    <span 
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: `${roleColors[key] || '#6366f1'}20`,
                        color: roleColors[key] || '#6366f1'
                      }}
                    >
                      {value.label}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {value.permissions.map(p => (
                        <span 
                          key={p}
                          className="text-xs px-2 py-0.5 rounded"
                          style={{ 
                            background: 'rgba(34, 197, 94, 0.1)',
                            color: '#22c55e'
                          }}
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'ajout/modification */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            style={{ 
              background: '#1e293b',
              border: '1px solid #334155'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-white mb-4">
              {editingEmployee ? 'Modifier l\'employé' : 'Ajouter un employé'}
            </h2>

            <form className="space-y-3" onSubmit={(e) => {
              e.preventDefault()
              // TODO: Appel API create/update
              setIsModalOpen(false)
            }}>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Nom complet</label>
                <input
                  type="text"
                  defaultValue={editingEmployee?.name || ''}
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                  style={{ 
                    background: 'rgba(51, 65, 85, 0.5)',
                    border: '1px solid #334155'
                  }}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Rôle</label>
                  <select
                    defaultValue={editingEmployee?.role || 'serveur'}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{ 
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid #334155'
                    }}
                  >
                    <option value="administrateur">Administrateur</option>
                    <option value="responsable">Responsable</option>
                    <option value="gerant">Gérant</option>
                    <option value="caissier">Caissier</option>
                    <option value="serveur">Serveur</option>
                    <option value="magasinier">Magasinier</option>
                    <option value="comptable">Comptable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Téléphone</label>
                  <input
                    type="text"
                    defaultValue={editingEmployee?.phone || '+241 '}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{ 
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid #334155'
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Email</label>
                <input
                  type="email"
                  defaultValue={editingEmployee?.email || ''}
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                  style={{ 
                    background: 'rgba(51, 65, 85, 0.5)',
                    border: '1px solid #334155'
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Salaire (FCFA)</label>
                  <input
                    type="number"
                    defaultValue={editingEmployee?.salary || 120000}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{ 
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid #334155'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Commission (%)</label>
                  <input
                    type="number"
                    defaultValue={editingEmployee?.commission || 0}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{ 
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid #334155'
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium transition"
                  style={{ 
                    background: 'transparent',
                    border: '1px solid #334155',
                    color: '#94a3b8'
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition"
                  style={{ 
                    background: '#4f46e5',
                    boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  {editingEmployee ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}