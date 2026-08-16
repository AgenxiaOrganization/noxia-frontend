'use client'

import { useState, useEffect } from 'react'
import { Plus, Award } from 'lucide-react'
import { Search } from 'lucide-react'
import { getCompany } from '../../../lib/auth'
import { getEmployees, createEmployee, patchEmployee, deleteEmployee, regenerateEmployeeCode, sendEmployeeCode, getCompanyMe, updateCompanyMe, uploadEmployeePhoto } from '../../../lib/api/companies'
import { ensureArray } from '@/lib/api'
import { toast } from 'sonner'
import Loader from '@/components/ui/Loader'
import EmployeeTable from '@/components/employees/EmployeeTable'
import EmployeeFormModal, { type EmployeeFormPayload } from '@/components/employees/EmployeeFormModal'
import SendCredentialsModal from '@/components/employees/SendCredentialsModal'
import ExpirationModal from '@/components/employees/ExpirationModal'
import PermissionsMatrixModal, { availablePermissions, type Permission } from '@/components/employees/PermissionsMatrixModal'
import { allRoles, type EmployeeRow } from '@/components/employees/types'

const defaultRolePermissions: Record<string, string[]> = {
  administrateur: ['ventes', 'stock', 'rapports', 'parametres', 'employes'],
  responsable: ['ventes', 'stock', 'rapports', 'parametres', 'employes'],
  gerant: ['ventes', 'stock', 'rapports'],
  caissier: ['ventes'],
  serveur: ['ventes'],
  magasinier: ['stock'],
  comptable: ['rapports'],
}

function buildPermissionsList(rolePermissions: Record<string, string[]> | undefined): Permission[] {
  const source = rolePermissions && Object.keys(rolePermissions).length > 0 ? rolePermissions : defaultRolePermissions
  return availablePermissions.map(ap => ({
    id: ap.id,
    label: ap.label,
    roles: allRoles.filter(role => source[role]?.includes(ap.id)),
  }))
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<EmployeeRow | null>(null)
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false)
  const [permissionsList, setPermissionsList] = useState<Permission[]>([])
  const [isSavingPermissions, setIsSavingPermissions] = useState(false)

  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [sendEmployeeData, setSendEmployeeData] = useState<EmployeeRow | null>(null)
  const [isSending, setIsSending] = useState(false)

  const [isExpirationModalOpen, setIsExpirationModalOpen] = useState(false)
  const [selectedEmployeeForExpiration, setSelectedEmployeeForExpiration] = useState<EmployeeRow | null>(null)
  const [isSavingExpiration, setIsSavingExpiration] = useState(false)

  const loadData = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true)
      const [apiEmployees, companyData] = await Promise.all([getEmployees(), getCompanyMe()])

      setEmployees(ensureArray<any>(apiEmployees).map((emp: any): EmployeeRow => ({
        id: emp.id,
        name: `${emp.user?.first_name || ''} ${emp.user?.last_name || ''}`.trim() || emp.user?.email || 'Nom inconnu',
        role: emp.role,
        phone: emp.user?.phone || '',
        email: emp.user?.email || '',
        salary: emp.role === 'administrateur' ? 0 : (emp.base_salary !== undefined && emp.base_salary !== null ? parseFloat(emp.base_salary) : (emp.role === 'gerant' ? 250000 : emp.role === 'caissier' ? 150000 : 120000)),
        commission: emp.commission_rate !== undefined && emp.commission_rate !== null ? parseFloat(emp.commission_rate) : (emp.role === 'serveur' ? 5 : emp.role === 'caissier' ? 2 : 0),
        active: emp.is_active,
        sales: Number(emp.total_sales) || 0,
        employeeId: emp.activation_code || '',
        activation_code_expires_at: emp.activation_code_expires_at,
        is_activation_code_expired: emp.is_activation_code_expired,
        photo: emp.photo_profile ?? null,
      })))

      setPermissionsList(buildPermissionsList(companyData?.role_permissions))
    } catch (err) {
      console.error('Erreur lors du chargement des employes et permissions', err)
      toast.error('Erreur lors du chargement des employés')
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
    e.employeeId.toLowerCase().includes(searchTerm.toLowerCase()),
  )
  const activeEmployees = filteredEmployees.filter(e => e.active)
  const totalSales = filteredEmployees.reduce((acc, e) => acc + e.sales, 0)

  const toggleActive = async (employee: EmployeeRow) => {
    try {
      const activePromise = patchEmployee(employee.id, { is_active: !employee.active })
      toast.promise(activePromise, {
        loading: 'Mise à jour du statut...',
        success: `✅ Statut de ${employee.name} mis à jour !`,
        error: '❌ Erreur lors de la modification du statut.',
      })
      await activePromise
      await loadData(true)
    } catch (err) {
      console.error(err)
    }
  }

  const handleRegenerateId = async (employee: EmployeeRow) => {
    try {
      const regeneratePromise = regenerateEmployeeCode(employee.id)
      toast.promise(regeneratePromise, {
        loading: `Régénération de l'ID pour ${employee.name}...`,
        success: `✅ Nouvel ID généré pour ${employee.name} !`,
        error: '❌ Erreur lors de la régénération du code.',
      })
      await regeneratePromise
      await loadData(true)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteEmployee = async (employee: EmployeeRow) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer l'employé ${employee.name} ? Cette action est irréversible.`)) return
    try {
      const deletePromise = deleteEmployee(employee.id)
      toast.promise(deletePromise, {
        loading: `Suppression de l'employé ${employee.name}...`,
        success: `✅ Employé ${employee.name} supprimé avec succès !`,
        error: "❌ Erreur lors de la suppression de l'employé.",
      })
      await deletePromise
      await loadData(true)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (payload: EmployeeFormPayload, photoFile: File | null) => {
    try {
      let employeeId: number
      if (editingEmployee) {
        const editPromise = patchEmployee(editingEmployee.id, payload as any)
        toast.promise(editPromise, {
          loading: "Mise à jour de l'employé...",
          success: '✅ Employé mis à jour avec succès !',
          error: '❌ Erreur lors de la mise à jour.',
        })
        await editPromise
        employeeId = editingEmployee.id
      } else {
        const createPromise = createEmployee(payload as any)
        toast.promise(createPromise, {
          loading: 'Création du compte...',
          success: '✅ Employé créé avec succès !',
          error: (err: any) => `❌ Erreur : ${err?.response?.data?.detail || err?.message || 'Erreur de validation.'}`,
        })
        const created = await createPromise
        employeeId = created.id
      }
      if (photoFile) {
        try {
          await uploadEmployeePhoto(employeeId, photoFile)
        } catch (photoErr) {
          console.error('Erreur upload photo employé', photoErr)
          toast.error("L'employé a été enregistré, mais l'envoi de la photo a échoué.")
        }
      }
      setIsModalOpen(false)
      await loadData(true)
    } catch (err) {
      console.error(err)
    }
  }

  const openSendModal = (employee: EmployeeRow) => {
    if (!employee.employeeId) {
      toast.error("Cet employé n'a pas d'ID Employé valide. Veuillez en régénérer un.")
      return
    }
    setSendEmployeeData(employee)
    setIsSendModalOpen(true)
  }

  const handleSendEmail = async () => {
    if (!sendEmployeeData) return
    try {
      setIsSending(true)
      const sendPromise = sendEmployeeCode(sendEmployeeData.id)
      toast.promise(sendPromise, {
        loading: 'Envoi des identifiants par e-mail...',
        success: '✅ Identifiants envoyés avec succès par e-mail !',
        error: "❌ Erreur lors de l'envoi de l'e-mail.",
      })
      await sendPromise
      setIsSendModalOpen(false)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSending(false)
    }
  }

  const handleSendWhatsapp = (message: string) => {
    if (!sendEmployeeData?.phone) return
    const cleanPhone = sendEmployeeData.phone.replace(/[^0-9]/g, '')
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank')
    toast.success('✅ Redirection vers WhatsApp effectuée !')
    setIsSendModalOpen(false)
  }

  const handleSaveExpiration = async (isoDate: string | null) => {
    if (!selectedEmployeeForExpiration) return
    try {
      setIsSavingExpiration(true)
      await patchEmployee(selectedEmployeeForExpiration.id, { activation_code_expires_at: isoDate })
      toast.success(isoDate ? "Date d'expiration enregistrée." : "Expiration retirée (le code n'expirera plus).")
      setIsExpirationModalOpen(false)
      await loadData()
    } catch (err) {
      toast.error('Erreur lors de la mise à jour.')
    } finally {
      setIsSavingExpiration(false)
    }
  }

  const handleSavePermissions = async (formattedPermissions: Record<string, string[]>) => {
    try {
      setIsSavingPermissions(true)
      const savePromise = updateCompanyMe({ role_permissions: formattedPermissions })
      toast.promise(savePromise, {
        loading: 'Sauvegarde de la matrice...',
        success: '✅ Permissions des rôles mises à jour avec succès !',
        error: '❌ Erreur de sauvegarde.',
      })
      await savePromise
      setIsPermissionsModalOpen(false)
    } catch (err) {
      console.error('Erreur de sauvegarde permissions', err)
    } finally {
      setIsSavingPermissions(false)
    }
  }

  const company = getCompany()
  const companyCode = company ? company.messaging_code : 'NOX-XXXXXXXXXX'
  const companyName = company ? company.name : 'Notre établissement'

  if (isLoading) {
    return <Loader />
  }

  return (
    <div className="p-4 space-y-4">
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
            style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.2)', color: '#818cf8' }}
          >
            <Award className="w-4 h-4" />
            Permissions
          </button>
          <button
            onClick={() => { setEditingEmployee(null); setIsModalOpen(true) }}
            className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition flex items-center gap-2"
            style={{ background: '#4f46e5', boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)' }}
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </div>

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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
        <input
          type="text"
          placeholder="Rechercher un employé (nom, rôle, ID)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
          style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
        />
      </div>

      <EmployeeTable
        employees={filteredEmployees}
        onEdit={(employee) => { setEditingEmployee(employee); setIsModalOpen(true) }}
        onDelete={handleDeleteEmployee}
        onToggleActive={toggleActive}
        onRegenerateId={handleRegenerateId}
        onSend={openSendModal}
        onOpenExpiration={(employee) => { setSelectedEmployeeForExpiration(employee); setIsExpirationModalOpen(true) }}
      />

      {isPermissionsModalOpen && (
        <PermissionsMatrixModal
          initialPermissions={permissionsList}
          isSaving={isSavingPermissions}
          onSave={handleSavePermissions}
          onClose={() => setIsPermissionsModalOpen(false)}
        />
      )}

      {isModalOpen && (
        <EmployeeFormModal
          employee={editingEmployee}
          onSubmit={handleSubmit}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {isExpirationModalOpen && selectedEmployeeForExpiration && (
        <ExpirationModal
          employee={selectedEmployeeForExpiration}
          isSaving={isSavingExpiration}
          onSave={handleSaveExpiration}
          onClose={() => setIsExpirationModalOpen(false)}
        />
      )}

      {isSendModalOpen && sendEmployeeData && (
        <SendCredentialsModal
          employee={sendEmployeeData}
          companyCode={companyCode}
          companyName={companyName}
          isSending={isSending}
          onSendEmail={handleSendEmail}
          onSendWhatsapp={handleSendWhatsapp}
          onClose={() => setIsSendModalOpen(false)}
        />
      )}
    </div>
  )
}
