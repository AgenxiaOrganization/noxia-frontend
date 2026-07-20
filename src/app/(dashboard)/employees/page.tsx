'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, Search, Edit, Trash2, User, UserCheck, UserX,
  Phone, Mail, DollarSign, Award, Key, Copy, Check,
  Eye, EyeOff, Send, GripVertical, X,
  RefreshCw, Calendar
} from 'lucide-react'
import { getUser, getMembership, getCompany } from '../../../lib/auth'
import { getEmployees, createEmployee, patchEmployee, deleteEmployee, regenerateEmployeeCode, sendEmployeeCode, getCompanyMe, updateCompanyMe } from '../../../lib/api/companies'
import { toast } from 'sonner'
import Loader from '@/components/ui/Loader'


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
  const [employees, setEmployees] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Nouveaux états pour la modal d'envoi d'infos
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [sendEmployeeData, setSendEmployeeData] = useState<any | null>(null)
  const [sendMethod, setSendMethod] = useState<'email' | 'whatsapp'>('email')
  const [sendMessageText, setSendMessageText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null)
  const [showEmployeeId, setShowEmployeeId] = useState<number | null>(null)
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false)
  const [draggedPermission, setDraggedPermission] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<string>('caissier')
  const [rolePermissionsState, setRolePermissionsState] = useState<Permission[]>(
    rolePermissions.administrateur || []
  )

  // Nouveaux états pour l'expiration du code employé
  const [isExpirationModalOpen, setIsExpirationModalOpen] = useState(false)
  const [selectedEmployeeForExpiration, setSelectedEmployeeForExpiration] = useState<any | null>(null)
  const [expirationDateInput, setExpirationDateInput] = useState('')

  const openSendModal = (employee: any) => {
    if (!employee.employeeId) {
      toast.error("Cet employé n'a pas d'ID Employé valide. Veuillez en régénérer un.")
      return
    }
    const company = getCompany()
    const companyCode = company ? company.messaging_code : 'NOX-XXXXXXXXXX'
    const companyName = company ? company.name : 'Notre établissement'
    const text = `Bonjour ${employee.name},\n\nVoici vos identifiants pour vous connecter au bot de Noxia et à l'application :\n\n- E-mail : ${employee.email}\n- ID Établissement : ${companyCode}\n- ID Employé : ${employee.employeeId}\n\nCordialement,\nL'équipe de gestion de ${companyName}.`
    
    setSendEmployeeData(employee)
    setSendMessageText(text)
    setSendMethod('email')
    setIsSendModalOpen(true)
  }

  const handleSendSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sendEmployeeData) return

    try {
      setIsSending(true)
      if (sendMethod === 'email') {
        const sendPromise = sendEmployeeCode(sendEmployeeData.id)
        toast.promise(sendPromise, {
          loading: "Envoi des identifiants par e-mail...",
          success: "✅ Identifiants envoyés avec succès par e-mail !",
          error: "❌ Erreur lors de l'envoi de l'e-mail."
        })
        await sendPromise
      } else {
        if (!sendEmployeeData.phone) {
          toast.error("Ce compte n'a pas de numéro de téléphone configuré.")
          return
        }
        const cleanPhone = sendEmployeeData.phone.replace(/[^0-9]/g, '')
        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(sendMessageText)}`, '_blank')
        toast.success("✅ Redirection vers WhatsApp effectuée !")
      }
      setIsSendModalOpen(false)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSending(false)
    }
  }

  const loadData = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true)
      const [apiEmployees, companyData] = await Promise.all([
        getEmployees(),
        getCompanyMe()
      ])
      
      setEmployees((apiEmployees || []).map((emp: any, index: number) => ({
        id: emp.id,
        name: `${emp.user?.first_name || ''} ${emp.user?.last_name || ''}`.trim() || emp.user?.email || 'Nom inconnu',
        role: emp.role,
        phone: emp.user?.phone || '',
        email: emp.user?.email || '',
        salary: emp.role === 'gerant' ? 250000 : emp.role === 'caissier' ? 150000 : 120000,
        commission: emp.role === 'serveur' ? 5 : emp.role === 'caissier' ? 2 : 0,
        active: emp.is_active,
        sales: Number(emp.total_sales) || 0,
        employeeId: emp.activation_code || '',
        activation_code_expires_at: emp.activation_code_expires_at,
        is_activation_code_expired: emp.is_activation_code_expired
      })))

      if (companyData && companyData.role_permissions && Object.keys(companyData.role_permissions).length > 0) {
        const customPerms = companyData.role_permissions
        const permissionsList = availablePermissions.map(ap => {
          const rolesWithAp = allRoles.filter(role => customPerms[role] && customPerms[role].includes(ap.id))
          return {
            id: ap.id,
            label: ap.label,
            roles: rolesWithAp
          }
        })
        setRolePermissionsState(permissionsList)
      } else {
        const defaultPerms = {
          administrateur: ['ventes', 'stock', 'rapports', 'parametres', 'employes'],
          responsable: ['ventes', 'stock', 'rapports', 'parametres', 'employes'],
          gerant: ['ventes', 'stock', 'rapports'],
          caissier: ['ventes'],
          serveur: ['ventes'],
          magasinier: ['stock'],
          comptable: ['rapports']
        }
        const permissionsList = availablePermissions.map(ap => {
          const rolesWithAp = allRoles.filter(role => defaultPerms[role as keyof typeof defaultPerms]?.includes(ap.id))
          return {
            id: ap.id,
            label: ap.label,
            roles: rolesWithAp
          }
        })
        setRolePermissionsState(permissionsList)
      }
    } catch (err) {
      console.error("Erreur lors du chargement des employes et permissions", err)
      toast.error("Erreur lors du chargement des employés")
    } finally {
      if (!silent) setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredEmployees = employees.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeEmployees = filteredEmployees.filter(e => e.active)
  const totalSales = filteredEmployees.reduce((acc, e) => acc + e.sales, 0)

  // Copier dans le presse-papiers
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("ID Employé copié !")
  }

  // Activer ou désactiver l'employé en base de données
  const toggleActive = async (employee: any) => {
    try {
      const activePromise = patchEmployee(employee.id, { is_active: !employee.active })
      toast.promise(activePromise, {
        loading: "Mise à jour du statut...",
        success: `✅ Statut de ${employee.name} mis à jour !`,
        error: "❌ Erreur lors de la modification du statut."
      })
      await activePromise
      await loadData(true)
    } catch (err) {
      console.error(err)
    }
  }

  // Régénérer le code d'activation (ID Employé)
  const handleRegenerateId = async (employee: any) => {
    try {
      const regeneratePromise = regenerateEmployeeCode(employee.id)
      toast.promise(regeneratePromise, {
        loading: `Régénération de l'ID pour ${employee.name}...`,
        success: `✅ Nouvel ID généré pour ${employee.name} !`,
        error: "❌ Erreur lors de la régénération du code."
      })
      await regeneratePromise
      await loadData(true)
    } catch (err) {
      console.error(err)
    }
  }

  // Supprimer un employé
  const handleDeleteEmployee = async (employee: any) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer l'employé ${employee.name} ? Cette action est irréversible.`)) {
      return
    }

    try {
      const deletePromise = deleteEmployee(employee.id)
      toast.promise(deletePromise, {
        loading: `Suppression de l'employé ${employee.name}...`,
        success: `✅ Employé ${employee.name} supprimé avec succès !`,
        error: "❌ Erreur lors de la suppression de l'employé."
      })
      await deletePromise
      await loadData(true)
    } catch (err) {
      console.error(err)
    }
  }

  // Envoyer les infos à l'employé (simulation)
  const sendToEmployee = (employee: any) => {
    alert(`📤 Infos envoyées à ${employee.name} :\n\nID: ${employee.employeeId}\nRôle: ${employee.role}\nTéléphone: ${employee.phone}\nEmail: ${employee.email}`)
  }

  // Soumettre le formulaire d'employé (création / modification)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const fullName = formData.get('fullName') as string
    const role = formData.get('role') as any
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string

    const names = fullName.trim().split(' ')
    const first_name = names[0] || ''
    const last_name = names.slice(1).join(' ') || ''

    try {
      if (editingEmployee) {
        const editPromise = patchEmployee(editingEmployee.id, {
          role: role,
        })
        toast.promise(editPromise, {
          loading: "Mise à jour du rôle...",
          success: "✅ Rôle de l'employé mis à jour !",
          error: "❌ Erreur lors de la mise à jour."
        })
        await editPromise
      } else {
        const createPromise = createEmployee({
          email,
          first_name,
          last_name,
          phone,
          role
        })
        toast.promise(createPromise, {
          loading: "Création du compte...",
          success: "✅ Employé créé avec succès !",
          error: (err) => {
            const errMsg = err?.response?.data?.detail || err?.message || "Erreur de validation."
            return `❌ Erreur : ${errMsg}`
          }
        })
        await createPromise
      }
      setIsModalOpen(false)
      await loadData(true)
    } catch (err: any) {
      console.error(err)
    }
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
  if (isLoading) {
    return <Loader />
  }

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
            {(() => {
              const best = [...employees].sort((a, b) => b.sales - a.sales)[0]
              return best && best.sales > 0 ? best.name : '-'
            })()}
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

      {/* Tableau des employés (Desktop uniquement) */}
      <div 
        className="hidden md:block rounded-xl border overflow-hidden"
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
                          {employee.name.split(' ').map((w: string) => w[0] || '').join('')}
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
                      <div className="flex flex-col gap-0.5">
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
                          <button
                            onClick={() => {
                              setSelectedEmployeeForExpiration(employee)
                              if (employee.activation_code_expires_at) {
                                const localDate = new Date(employee.activation_code_expires_at)
                                localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset())
                                setExpirationDateInput(localDate.toISOString().slice(0, 16))
                              } else {
                                setExpirationDateInput('')
                              }
                              setIsExpirationModalOpen(true)
                            }}
                            className="p-0.5 rounded hover:bg-white/10 transition"
                            style={{ color: '#94a3b8' }}
                            title="Paramétrer l'expiration"
                          >
                            <Calendar className="w-3 h-3" />
                          </button>
                        </div>
                        {employee.activation_code_expires_at ? (
                          <span 
                            className={`text-[10px] ${
                              employee.is_activation_code_expired 
                                ? 'text-red-400 font-semibold' 
                                : 'text-slate-400'
                            }`}
                          >
                            {employee.is_activation_code_expired 
                              ? `Expiré le ${new Date(employee.activation_code_expires_at).toLocaleDateString()}` 
                              : `Expire le ${new Date(employee.activation_code_expires_at).toLocaleDateString()} à ${new Date(employee.activation_code_expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                            }
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">Pas d'expiration</span>
                        )}
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
                          onClick={() => openSendModal(employee)}
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
                          onClick={() => handleRegenerateId(employee)}
                          className="p-1.5 rounded transition hover:bg-yellow-500/20"
                          style={{ color: '#f59e0b' }}
                          title="Régénérer l'ID"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => toggleActive(employee)}
                          className="p-1.5 rounded transition hover:bg-white/10"
                          style={{ color: employee.active ? '#f87171' : '#22c55e' }}
                          title={employee.active ? 'Désactiver' : 'Activer'}
                        >
                          {employee.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => handleDeleteEmployee(employee)}
                          className="p-1.5 rounded transition hover:bg-red-500/20"
                          style={{ color: '#ef4444' }}
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                       
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vue en Cartes (Mobile uniquement) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredEmployees.map((employee) => {
          const isIdVisible = showEmployeeId === employee.id
          return (
            <div 
              key={employee.id} 
              className="p-4 rounded-xl border space-y-3"
              style={{ background: '#1e293b', borderColor: '#334155' }}
            >
              {/* Header de la carte */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ background: roleColors[employee.role] || '#6366f1' }}
                  >
                    {employee.name.split(' ').map((w: string) => w[0] || '').join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{employee.name}</h3>
                    <span 
                      className="text-[10px] px-2 py-0.5 rounded-full inline-block mt-0.5"
                      style={{
                        background: `${roleColors[employee.role] || '#6366f1'}20`,
                        color: roleColors[employee.role] || '#6366f1'
                      }}
                    >
                      {employee.role}
                    </span>
                  </div>
                </div>
                <span 
                  onClick={() => toggleActive(employee)}
                  className={`text-xs px-2.5 py-1 rounded-full cursor-pointer transition select-none ${
                    employee.active 
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                      : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  }`}
                >
                  {employee.active ? 'Actif' : 'Inactif'}
                </span>
              </div>

              {/* Infos Contact */}
              <div className="space-y-1.5 text-xs border-t border-b py-2" style={{ borderColor: '#334155', color: '#94a3b8' }}>
                {employee.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{employee.phone}</span>
                  </div>
                )}
                {employee.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{employee.email}</span>
                  </div>
                )}
              </div>

              {/* ID Employé & validité */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: '#94a3b8' }}>ID Employé</span>
                  <div className="flex items-center gap-1">
                    <code className="text-xs font-mono bg-slate-950 px-2 py-0.5 rounded text-indigo-300">
                      {isIdVisible ? employee.employeeId || 'Non généré' : '••••••••'}
                    </code>
                    {employee.employeeId && (
                      <>
                        <button 
                          onClick={() => copyToClipboard(employee.employeeId)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => setShowEmployeeId(isIdVisible ? null : employee.id)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400"
                        >
                          {isIdVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => {
                        setSelectedEmployeeForExpiration(employee)
                        if (employee.activation_code_expires_at) {
                          const localDate = new Date(employee.activation_code_expires_at)
                          localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset())
                          setExpirationDateInput(localDate.toISOString().slice(0, 16))
                        } else {
                          setExpirationDateInput('')
                        }
                        setIsExpirationModalOpen(true)
                      }}
                      className="p-1 rounded hover:bg-slate-800 text-indigo-400"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {employee.activation_code_expires_at ? (
                  <p 
                    className={`text-[10px] text-right ${
                      employee.is_activation_code_expired 
                        ? 'text-red-400 font-semibold' 
                        : 'text-slate-400'
                    }`}
                  >
                    {employee.is_activation_code_expired 
                      ? `Expiré le ${new Date(employee.activation_code_expires_at).toLocaleDateString()}` 
                      : `Expire le ${new Date(employee.activation_code_expires_at).toLocaleDateString()} à ${new Date(employee.activation_code_expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    }
                  </p>
                ) : (
                  <p className="text-[10px] text-right text-slate-500">Pas d'expiration</p>
                )}
              </div>

              {/* Rémunération & Ventes */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2 rounded bg-slate-900 border" style={{ borderColor: '#334155' }}>
                  <span className="block text-[10px]" style={{ color: '#94a3b8' }}>Salaire</span>
                  <span className="font-semibold text-white">{employee.salary.toLocaleString()} F</span>
                  {employee.commission > 0 && (
                    <span className="block text-[10px] text-green-400">+{employee.commission}% comm.</span>
                  )}
                </div>
                <div className="p-2 rounded bg-slate-900 border" style={{ borderColor: '#334155' }}>
                  <span className="block text-[10px]" style={{ color: '#94a3b8' }}>Ventes</span>
                  <span className="font-semibold text-green-400">{employee.sales.toLocaleString()} F</span>
                </div>
              </div>

              {/* Actions de la carte */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t" style={{ borderColor: '#334155' }}>
                <button
                  onClick={() => openSendModal(employee)}
                  className="px-2.5 py-1.5 rounded text-xs transition bg-blue-500/10 hover:bg-blue-500/20 flex items-center gap-1"
                  style={{ color: '#3b82f6' }}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Envoyer</span>
                </button>
                <button
                  onClick={() => { setEditingEmployee(employee); setIsModalOpen(true); }}
                  className="px-2.5 py-1.5 rounded text-xs transition bg-white/5 hover:bg-white/10 flex items-center gap-1"
                  style={{ color: '#94a3b8' }}
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Modifier</span>
                </button>
                <button
                  onClick={() => handleRegenerateId(employee)}
                  className="px-2.5 py-1.5 rounded text-xs transition bg-yellow-500/10 hover:bg-yellow-500/20 flex items-center gap-1"
                  style={{ color: '#f59e0b' }}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Régénérer</span>
                </button>
                <button
                  onClick={() => handleDeleteEmployee(employee)}
                  className="p-1.5 rounded transition bg-red-500/10 hover:bg-red-500/20"
                  style={{ color: '#ef4444' }}
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="p-8 text-center rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <User className="w-12 h-12 mx-auto mb-2" style={{ color: '#334155' }} />
          <p className="text-sm" style={{ color: '#64748b' }}>Aucun employé trouvé</p>
        </div>
      )}

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
                onClick={async () => {
                  const formattedPermissions: Record<string, string[]> = {}
                  allRoles.forEach(role => {
                    formattedPermissions[role] = []
                  })
                  rolePermissionsState.forEach(perm => {
                    perm.roles.forEach(role => {
                      if (formattedPermissions[role]) {
                        formattedPermissions[role].push(perm.id)
                      }
                    })
                  })

                  try {
                    const savePromise = updateCompanyMe({ role_permissions: formattedPermissions })
                    toast.promise(savePromise, {
                      loading: "Sauvegarde de la matrice...",
                      success: "✅ Permissions des rôles mises à jour avec succès !",
                      error: "❌ Erreur de sauvegarde."
                    })
                    await savePromise
                    setIsPermissionsModalOpen(false)
                  } catch (err) {
                    console.error("Erreur de sauvegarde permissions", err)
                  }
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

            <form className="space-y-3" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Nom complet</label>
                <input
                  type="text"
                  name="fullName"
                  defaultValue={editingEmployee?.name || ''}
                  disabled={!!editingEmployee}
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition disabled:opacity-50"
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
                    name="role"
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
                    name="phone"
                    defaultValue={editingEmployee?.phone || '+241 '}
                    disabled={!!editingEmployee}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition disabled:opacity-50"
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
                  name="email"
                  defaultValue={editingEmployee?.email || ''}
                  disabled={!!editingEmployee}
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition disabled:opacity-50"
                  style={{ 
                    background: 'rgba(51, 65, 85, 0.5)',
                    border: '1px solid #334155'
                  }}
                  required={!editingEmployee}
                />
              </div>



              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Salaire (FCFA)</label>
                  <input
                    type="number"
                    name="salary"
                    defaultValue={editingEmployee?.salary || 120000}
                    disabled={!!editingEmployee}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition disabled:opacity-50"
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
                    name="commission"
                    defaultValue={editingEmployee?.commission || 0}
                    disabled={!!editingEmployee}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition disabled:opacity-50"
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

      {/* MODAL CONFIGURATION EXPIRATION CODE */}
      {isExpirationModalOpen && selectedEmployeeForExpiration && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setIsExpirationModalOpen(false)}
        >
          <div 
            className="w-full max-w-md rounded-2xl p-6"
            style={{ 
              background: '#1e293b',
              border: '1px solid #334155'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-white mb-2">
              Expiration de l'ID Employé
            </h2>
            <p className="text-sm mb-4" style={{ color: '#94a3b8' }}>
              Définissez la date et l'heure limites de validité du code de connexion pour <strong>{selectedEmployeeForExpiration.name}</strong> (Code actuel : <code style={{ color: '#818cf8' }}>{selectedEmployeeForExpiration.employeeId}</code>).
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>
                  Date et heure d'expiration
                </label>
                <input
                  type="datetime-local"
                  value={expirationDateInput}
                  onChange={(e) => setExpirationDateInput(e.target.value)}
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                  style={{ 
                    background: 'rgba(51, 65, 85, 0.5)',
                    border: '1px solid #334155'
                  }}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await patchEmployee(selectedEmployeeForExpiration.id, {
                        activation_code_expires_at: null
                      })
                      toast.success("Expiration retirée (le code n'expirera plus).")
                      setIsExpirationModalOpen(false)
                      await loadData()
                    } catch (err) {
                      toast.error("Erreur lors de la mise à jour.")
                    }
                  }}
                  className="flex-1 py-2 text-xs font-semibold rounded-lg transition"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#f87171'
                  }}
                >
                  Retirer l'expiration
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExpirationModalOpen(false)}
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
                  type="button"
                  onClick={async () => {
                    try {
                      const isoDate = expirationDateInput ? new Date(expirationDateInput).toISOString() : null
                      await patchEmployee(selectedEmployeeForExpiration.id, {
                        activation_code_expires_at: isoDate
                      })
                      toast.success("Date d'expiration enregistrée.")
                      setIsExpirationModalOpen(false)
                      await loadData()
                    } catch (err) {
                      toast.error("Erreur lors de l'enregistrement.")
                    }
                  }}
                  className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition"
                  style={{ 
                    background: '#4f46e5',
                    boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ENVOI IDENTIFIANTS EMPLOYÉ */}
      {isSendModalOpen && sendEmployeeData && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setIsSendModalOpen(false)}
        >
          <div 
            className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            style={{ 
              background: '#1e293b',
              border: '1px solid #334155'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {sendMethod === 'email' ? 'Envoyer par E-mail' : 'Envoyer par WhatsApp'}
                </h2>
                <p className="text-xs text-indigo-400">
                  {sendMethod === 'email' ? sendEmployeeData.email : (sendEmployeeData.phone || 'Pas de numéro')}
                </p>
              </div>
              <button onClick={() => setIsSendModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendSubmit} className="space-y-4">
              <div>
                <label className="block text-xs mb-2" style={{ color: '#94a3b8' }}>Méthode d&apos;envoi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSendMethod('email')
                      const company = getCompany()
                      const companyCode = company ? company.messaging_code : 'NOX-XXXXXXXXXX'
                      const companyName = company ? company.name : 'Notre établissement'
                      setSendMessageText(`Bonjour ${sendEmployeeData.name},\n\nVoici vos identifiants pour vous connecter au bot de Noxia et à l'application :\n\n- E-mail : ${sendEmployeeData.email}\n- ID Établissement : ${companyCode}\n- ID Employé : ${sendEmployeeData.employeeId}\n\nCordialement,\nL'équipe de gestion de ${companyName}.`)
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition flex items-center justify-center gap-2 ${
                      sendMethod === 'email'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                        : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800/80'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    Par E-mail
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSendMethod('whatsapp')
                      const company = getCompany()
                      const companyCode = company ? company.messaging_code : 'NOX-XXXXXXXXXX'
                      const companyName = company ? company.name : 'Notre établissement'
                      setSendMessageText(`Bonjour ${sendEmployeeData.name},\n\nVoici vos identifiants pour vous connecter au bot de Noxia :\n- ID Établissement : ${companyCode}\n- ID Employé : ${sendEmployeeData.employeeId}\n\nCordialement,\nL'équipe de gestion de ${companyName}.`)
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition flex items-center justify-center gap-2 ${
                      sendMethod === 'whatsapp'
                        ? 'bg-green-600/20 border-green-500 text-green-400'
                        : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800/80'
                    }`}
                  >
                    <Phone className="w-4 h-4" />
                    Par WhatsApp
                  </button>
                </div>
              </div>

              {sendMethod === 'email' ? (
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Adresse e-mail destinataire</label>
                  <input
                    type="text"
                    value={sendEmployeeData.email}
                    disabled
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none bg-slate-900 border border-slate-700 opacity-60 cursor-not-allowed"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Numéro WhatsApp destinataire</label>
                  <input
                    type="text"
                    value={sendEmployeeData.phone || ''}
                    disabled
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none bg-slate-900 border border-slate-700 opacity-60 cursor-not-allowed"
                    placeholder="Aucun numéro configuré"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Message à envoyer</label>
                <textarea
                  value={sendMessageText}
                  onChange={(e) => setSendMessageText(e.target.value)}
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none resize-none h-44 bg-slate-900 border border-slate-700 focus:border-indigo-500"
                  style={{ 
                    fontFamily: 'inherit'
                  }}
                  required
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSendModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium transition bg-transparent border border-slate-700 text-slate-400 hover:text-white"
                  disabled={isSending}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSending || (sendMethod === 'whatsapp' && !sendEmployeeData.phone)}
                  className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ 
                    background: sendMethod === 'email' ? '#22c55e' : '#25D366',
                    boxShadow: sendMethod === 'email' 
                      ? '0 10px 25px -5px rgba(34, 197, 94, 0.3)' 
                      : '0 10px 25px -5px rgba(37, 211, 102, 0.3)'
                  }}
                >
                  <Send className="w-4 h-4" />
                  {isSending ? 'Envoi...' : sendMethod === 'email' ? 'Envoyer les identifiants' : 'Ouvrir WhatsApp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}