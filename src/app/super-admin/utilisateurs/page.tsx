'use client'

import { useContext, useEffect, useState } from 'react'
import { Plus, Award, Search, Globe, Building2 } from 'lucide-react'
import { ServerContext } from '../layout'
import { createSuperAdminClient } from '@/lib/superAdminClient'
import { createCompaniesApi, uploadInstanceEmployeePhoto } from '@/lib/api/companies'
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

function mapEmployee(emp: any): EmployeeRow {
  return {
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
  }
}

export default function SuperAdminUtilisateurs() {
  const { selectedServer, isGlobalMode, selectedCompany } = useContext(ServerContext)

  const [employees, setEmployees] = useState<EmployeeRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

  const getApi = () => createCompaniesApi(createSuperAdminClient(selectedServer.id, selectedCompany!.id))

  const loadData = () => {
    if (isGlobalMode || !selectedCompany) {
      setEmployees([])
      return
    }

    let cancelled = false
    const api = getApi()
    setIsLoading(true)
    setError(null)
    Promise.all([api.getEmployees(), api.getCompanyMe()])
      .then(([apiEmployees, companyData]) => {
        if (cancelled) return
        setEmployees(ensureArray<any>(apiEmployees).map(mapEmployee))
        setPermissionsList(buildPermissionsList(companyData?.role_permissions))
      })
      .catch((e) => {
        if (cancelled) return
        console.error('Erreur chargement employés (super-admin)', e)
        setError('Impossible de charger les employés de cette entreprise.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }

  useEffect(loadData, [selectedServer.id, selectedCompany, isGlobalMode])

  const filteredEmployees = employees.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.employeeId.toLowerCase().includes(searchTerm.toLowerCase()),
  )
  const activeEmployees = filteredEmployees.filter(e => e.active)
  const totalSales = filteredEmployees.reduce((acc, e) => acc + e.sales, 0)

  const toggleActive = async (employee: EmployeeRow) => {
    if (!selectedCompany) return
    try {
      const activePromise = getApi().patchEmployee(employee.id, { is_active: !employee.active })
      toast.promise(activePromise, {
        loading: 'Mise à jour du statut...',
        success: `Statut de ${employee.name} mis à jour !`,
        error: 'Erreur lors de la modification du statut.',
      })
      await activePromise
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleRegenerateId = async (employee: EmployeeRow) => {
    if (!selectedCompany) return
    try {
      const regeneratePromise = getApi().regenerateEmployeeCode(employee.id)
      toast.promise(regeneratePromise, {
        loading: `Régénération de l'ID pour ${employee.name}...`,
        success: `Nouvel ID généré pour ${employee.name} !`,
        error: 'Erreur lors de la régénération du code.',
      })
      await regeneratePromise
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteEmployee = async (employee: EmployeeRow) => {
    if (!selectedCompany || !window.confirm(`Voulez-vous vraiment supprimer l'employé ${employee.name} ? Cette action est irréversible.`)) return
    try {
      const deletePromise = getApi().deleteEmployee(employee.id)
      toast.promise(deletePromise, {
        loading: `Suppression de l'employé ${employee.name}...`,
        success: `Employé ${employee.name} supprimé avec succès !`,
        error: "Erreur lors de la suppression de l'employé.",
      })
      await deletePromise
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (payload: EmployeeFormPayload, photoFile: File | null) => {
    if (!selectedCompany) return
    const api = getApi()
    try {
      let employeeId: number
      if (editingEmployee) {
        const editPromise = api.patchEmployee(editingEmployee.id, payload as any)
        toast.promise(editPromise, {
          loading: "Mise à jour de l'employé...",
          success: 'Employé mis à jour avec succès !',
          error: 'Erreur lors de la mise à jour.',
        })
        await editPromise
        employeeId = editingEmployee.id
      } else {
        const createPromise = api.createEmployee(payload as any)
        toast.promise(createPromise, {
          loading: 'Création du compte...',
          success: 'Employé créé avec succès !',
          error: (err: any) => `Erreur : ${err?.response?.data?.detail || err?.message || 'Erreur de validation.'}`,
        })
        const created = await createPromise
        employeeId = created.id
      }
      if (photoFile) {
        try {
          await uploadInstanceEmployeePhoto(selectedServer.id, selectedCompany.id, employeeId, photoFile)
        } catch (photoErr) {
          console.error('Erreur upload photo employé (super-admin)', photoErr)
          toast.error("L'employé a été enregistré, mais l'envoi de la photo a échoué.")
        }
      }
      setIsModalOpen(false)
      loadData()
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
    if (!sendEmployeeData || !selectedCompany) return
    try {
      setIsSending(true)
      const sendPromise = getApi().sendEmployeeCode(sendEmployeeData.id)
      toast.promise(sendPromise, {
        loading: 'Envoi des identifiants par e-mail...',
        success: 'Identifiants envoyés avec succès par e-mail !',
        error: "Erreur lors de l'envoi de l'e-mail.",
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
    toast.success('Redirection vers WhatsApp effectuée !')
    setIsSendModalOpen(false)
  }

  const handleSaveExpiration = async (isoDate: string | null) => {
    if (!selectedEmployeeForExpiration || !selectedCompany) return
    try {
      setIsSavingExpiration(true)
      await getApi().patchEmployee(selectedEmployeeForExpiration.id, { activation_code_expires_at: isoDate })
      toast.success(isoDate ? "Date d'expiration enregistrée." : "Expiration retirée (le code n'expirera plus).")
      setIsExpirationModalOpen(false)
      loadData()
    } catch (err) {
      toast.error('Erreur lors de la mise à jour.')
    } finally {
      setIsSavingExpiration(false)
    }
  }

  const handleSavePermissions = async (formattedPermissions: Record<string, string[]>) => {
    if (!selectedCompany) return
    try {
      setIsSavingPermissions(true)
      const savePromise = getApi().updateCompanyMe({ role_permissions: formattedPermissions })
      toast.promise(savePromise, {
        loading: 'Sauvegarde de la matrice...',
        success: 'Permissions des rôles mises à jour avec succès !',
        error: 'Erreur de sauvegarde.',
      })
      await savePromise
      setIsPermissionsModalOpen(false)
    } catch (err) {
      console.error('Erreur de sauvegarde permissions (super-admin)', err)
    } finally {
      setIsSavingPermissions(false)
    }
  }

  if (isGlobalMode) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <Globe className="w-10 h-10" style={{ color: '#334155' }} />
        <p className="text-sm" style={{ color: '#94a3b8' }}>Sélectionnez une instance dans le menu pour voir ses utilisateurs.</p>
      </div>
    )
  }

  if (!selectedCompany) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <Building2 className="w-10 h-10" style={{ color: '#334155' }} />
        <p className="text-sm" style={{ color: '#94a3b8' }}>Sélectionnez une entreprise dans le menu pour voir ses utilisateurs.</p>
      </div>
    )
  }

  if (isLoading) return <Loader />

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Utilisateurs — {selectedCompany.name}</h1>
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

      {error && (
        <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>
          {error}
        </div>
      )}

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
          companyCode={selectedCompany.messaging_code}
          companyName={selectedCompany.name}
          isSending={isSending}
          onSendEmail={handleSendEmail}
          onSendWhatsapp={handleSendWhatsapp}
          onClose={() => setIsSendModalOpen(false)}
        />
      )}
    </div>
  )
}
