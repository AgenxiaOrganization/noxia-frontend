'use client'

import { useState } from 'react'
import { 
  Plus, Search, Edit, Trash2, User, UserCheck, UserX,
  Phone, Mail, DollarSign, Award, Key, Copy, Check,
  Eye, EyeOff, Send, GripVertical, X
} from 'lucide-react'

// --- Types ---
interface Employee {
  id: number
  name: string
  role: string
  phone: string
  email: string
  salary: number
  commission: number
  active: boolean
  sales: number
  employeeId: string
}

interface Permission {
  id: string
  label: string
  roles: string[]
}

// --- Données Mockées ---
const mockEmployees: Employee[] = [
  { id: 1, name: 'Jean M.', role: 'caissier', phone: '+241 77 00 00 01', email: 'jean@lepremium.ga', salary: 150000, commission: 2, active: true, sales: 450000, employeeId: 'EMP-001' },
  { id: 2, name: 'Marie K.', role: 'serveur', phone: '+241 77 00 00 02', email: 'marie@lepremium.ga', salary: 120000, commission: 5, active: true, sales: 320000, employeeId: 'EMP-002' },
  { id: 3, name: 'Pierre O.', role: 'magasinier', phone: '+241 77 00 00 03', email: 'pierre@lepremium.ga', salary: 130000, commission: 0, active: true, sales: 0, employeeId: 'EMP-003' },
  { id: 4, name: 'Sophie N.', role: 'caissier', phone: '+241 77 00 00 04', email: 'sophie@lepremium.ga', salary: 150000, commission: 2, active: true, sales: 280000, employeeId: 'EMP-004' },
  { id: 5, name: 'David L.', role: 'serveur', phone: '+241 77 00 00 05', email: 'david@lepremium.ga', salary: 120000, commission: 5, active: false, sales: 0, employeeId: 'EMP-005' },
  { id: 6, name: 'Alice B.', role: 'comptable', phone: '+241 77 00 00 06', email: 'alice@lepremium.ga', salary: 200000, commission: 0, active: true, sales: 0, employeeId: 'EMP-006' },
  { id: 7, name: 'François T.', role: 'gerant', phone: '+241 77 00 00 07', email: 'francois@lepremium.ga', salary: 250000, commission: 1, active: true, sales: 820000, employeeId: 'EMP-007' },
  { id: 8, name: 'Chloé R.', role: 'serveur', phone: '+241 77 00 00 08', email: 'chloe@lepremium.ga', salary: 120000, commission: 5, active: true, sales: 410000, employeeId: 'EMP-008' },
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

const allRoles = ['administrateur', 'responsable', 'gerant', 'caissier', 'serveur', 'magasinier', 'comptable']

// Permissions disponibles pour le Drag & Drop
const availablePermissions = [
  { id: 'ventes', label: 'Ventes' },
  { id: 'stock', label: 'Stock' },
  { id: 'rapports', label: 'Rapports' },
  { id: 'parametres', label: 'Paramètres' },
  { id: 'employes', label: 'Employés' },
]

const rolePermissions: Record<string, Permission[]> = {
  administrateur: [
    { id: 'ventes', label: 'Ventes', roles: ['administrateur', 'responsable', 'gerant', 'caissier', 'serveur'] },
    { id: 'stock', label: 'Stock', roles: ['administrateur', 'responsable', 'gerant', 'magasinier'] },
    { id: 'rapports', label: 'Rapports', roles: ['administrateur', 'responsable', 'gerant', 'comptable'] },
    { id: 'parametres', label: 'Paramètres', roles: ['administrateur', 'responsable'] },
    { id: 'employes', label: 'Employés', roles: ['administrateur', 'responsable'] },
  ],
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
const [showEmployeeId, setShowEmployeeId] = useState<number | null>(null)
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false)
  const [draggedPermission, setDraggedPermission] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<string>('caissier')
  const [rolePermissionsState, setRolePermissionsState] = useState<Permission[]>(
    rolePermissions.administrateur || []
  )

  const filteredEmployees = employees.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeEmployees = filteredEmployees.filter(e => e.active)
  const totalSales = filteredEmployees.reduce((acc, e) => acc + e.sales, 0)

  // Générer un ID employé
  const generateEmployeeId = () => {
    return 'EMP-' + Math.random().toString(36).substring(2, 6).toUpperCase()
  }

  // Copier dans le presse-papiers
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // TODO: Ajouter un toast de confirmation
  }

  // Envoyer les infos à l'employé (simulation)
  const sendToEmployee = (employee: Employee) => {
    alert(`📤 Infos envoyées à ${employee.name} :\n\nID: ${employee.employeeId}\nRôle: ${employee.role}\nTéléphone: ${employee.phone}\nEmail: ${employee.email}`)
  }

  // --- Drag & Drop des permissions ---
  const handleDragStart = (permissionId: string) => {
    setDraggedPermission(permissionId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (role: string) => {
    if (!draggedPermission) return

    // Ajouter la permission au rôle
    setRolePermissionsState(prev => {
      const existing = prev.find(p => p.id === draggedPermission)
      if (existing) {
        if (!existing.roles.includes(role)) {
          return prev.map(p => 
            p.id === draggedPermission 
              ? { ...p, roles: [...p.roles, role] }
              : p
          )
        }
        return prev
      }
      // Créer une nouvelle permission
      const perm = availablePermissions.find(p => p.id === draggedPermission)
      if (perm) {
        return [...prev, { ...perm, roles: [role] }]
      }
      return prev
    })

    setDraggedPermission(null)
  }

  const removePermissionFromRole = (permissionId: string, role: string) => {
    setRolePermissionsState(prev => {
      return prev.map(p => {
        if (p.id === permissionId) {
          return { ...p, roles: p.roles.filter(r => r !== role) }
        }
        return p
      }).filter(p => p.roles.length > 0)
    })
  }

  const getPermissionsForRole = (role: string): string[] => {
    const perms = rolePermissionsState.filter(p => p.roles.includes(role))
    return perms.map(p => p.id)
  }

  // --- Rendu ---
  return (
    <div className="p-4 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Employés</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            {activeEmployees.length} actifs • {filteredEmployees.length - activeEmployees.length} inactifs
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsPermissionsModalOpen(true)}
            className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition flex items-center gap-2"
            style={{ 
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              color: '#818cf8'
            }}
          >
            <Award className="w-4 h-4" />
            Permissions
          </button>
          <button
            onClick={() => { setEditingEmployee(null); setIsModalOpen(true); }}
            className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition flex items-center gap-2"
            style={{ 
              background: '#4f46e5',
              boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
            }}
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
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
            {[...employees].sort((a, b) => b.sales - a.sales)[0]?.name || '-'}
          </p>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
        <input
          type="text"
          placeholder="Rechercher un employé (nom, rôle, ID)..."
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
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>ID Employé</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Salaire</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Ventes</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => {
                const isIdVisible = showEmployeeId === employee.id
                return (
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
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <code className="text-xs font-mono" style={{ color: '#818cf8' }}>
                          {isIdVisible ? employee.employeeId : '••••••••'}
                        </code>
                        <button
                          onClick={() => setShowEmployeeId(isIdVisible ? null : employee.id)}
                          className="p-0.5 rounded hover:bg-white/10 transition"
                          style={{ color: '#94a3b8' }}
                          title={isIdVisible ? 'Masquer' : 'Afficher'}
                        >
                          {isIdVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(employee.employeeId)}
                          className="p-0.5 rounded hover:bg-white/10 transition"
                          style={{ color: '#94a3b8' }}
                          title="Copier"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#94a3b8' }}>
                      {employee.salary.toLocaleString()} F
                      {employee.commission > 0 && (
                        <span className="block text-xs" style={{ color: '#22c55e' }}>
                          +{employee.commission}% comm.
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
                      <div className="flex gap-1 flex-wrap">
                        <button
                          onClick={() => sendToEmployee(employee)}
                          className="p-1.5 rounded transition hover:bg-blue-500/20"
                          style={{ color: '#3b82f6' }}
                          title="Envoyer les infos"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setEditingEmployee(employee); setIsModalOpen(true); }}
                          className="p-1.5 rounded transition hover:bg-white/10"
                          style={{ color: '#94a3b8' }}
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const updated = employees.map(e => 
                              e.id === employee.id ? { ...e, active: !e.active } : e
                            )
                            setEmployees(updated)
                          }}
                          className="p-1.5 rounded transition hover:bg-white/10"
                          style={{ color: employee.active ? '#f87171' : '#22c55e' }}
                          title={employee.active ? 'Désactiver' : 'Activer'}
                        >
                          {employee.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
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

      {/* MODAL PERMISSIONS (Drag & Drop) */}
      {isPermissionsModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setIsPermissionsModalOpen(false)}
        >
          <div 
            className="w-full max-w-4xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            style={{ 
              background: '#1e293b',
              border: '1px solid #334155'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Matrice des permissions</h2>
              <button
                onClick={() => setIsPermissionsModalOpen(false)}
                className="p-1 rounded hover:bg-white/10 transition"
                style={{ color: '#94a3b8' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm mb-4" style={{ color: '#94a3b8' }}>
              Faites glisser une permission vers un rôle pour l&apos;attribuer.
            </p>

            {/* Drag & Drop Zone */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Colonne des permissions disponibles */}
              <div className="lg:col-span-1">
                <h3 className="text-xs font-semibold mb-2" style={{ color: '#94a3b8' }}>Permissions</h3>
                <div className="space-y-2">
                  {availablePermissions.map((perm) => (
                    <div
                      key={perm.id}
                      draggable
                      onDragStart={() => handleDragStart(perm.id)}
                      className="p-2 rounded-lg cursor-grab active:cursor-grabbing text-xs text-center transition hover:bg-primary-500/10"
                      style={{
                        background: 'rgba(51, 65, 85, 0.3)',
                        border: '1px solid #334155',
                        color: '#94a3b8'
                      }}
                    >
                      <GripVertical className="w-3 h-3 inline mr-1" />
                      {perm.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Colonnes des rôles */}
              {allRoles.map((role) => (
                <div 
                  key={role}
                  className="lg:col-span-1"
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(role)}
                >
                  <h3 className="text-xs font-semibold mb-2 truncate" style={{ color: '#94a3b8' }}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </h3>
                  <div 
                    className="p-2 rounded-lg min-h-[100px] transition"
                    style={{
                      background: 'rgba(51, 65, 85, 0.2)',
                      border: '2px dashed #334155'
                    }}
                  >
                    {getPermissionsForRole(role).map((permId) => {
                      const perm = availablePermissions.find(p => p.id === permId)
                      if (!perm) return null
                      return (
                        <div 
                          key={permId}
                          className="flex items-center justify-between p-1.5 rounded text-xs mb-1"
                          style={{
                            background: 'rgba(99, 102, 241, 0.15)',
                            color: '#818cf8'
                          }}
                        >
                          <span>{perm.label}</span>
                          <button
                            onClick={() => removePermissionFromRole(permId, role)}
                            className="hover:text-red-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )
                    })}
                    {getPermissionsForRole(role).length === 0 && (
                      <p className="text-xs text-center" style={{ color: '#64748b' }}>
                        Déposez ici
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t" style={{ borderColor: '#334155' }}>
              <button
                onClick={() => setIsPermissionsModalOpen(false)}
                className="px-6 py-2.5 rounded-lg text-sm font-medium transition"
                style={{
                  background: 'transparent',
                  border: '1px solid #334155',
                  color: '#94a3b8'
                }}
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  // TODO: Sauvegarder les permissions
                  alert('Permissions sauvegardées !')
                  setIsPermissionsModalOpen(false)
                }}
                className="px-6 py-2.5 rounded-lg text-white text-sm font-semibold transition"
                style={{
                  background: '#4f46e5',
                  boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
                }}
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AJOUT/MODIFICATION EMPLOYÉ */}
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
              // TODO: Appel API
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
                    {allRoles.map(role => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
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