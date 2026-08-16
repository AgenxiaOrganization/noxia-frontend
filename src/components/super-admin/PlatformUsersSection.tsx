'use client'

import { useState, useEffect, FormEvent } from 'react'
import { Users, Plus, X, Trash2, Shield, ShieldAlert, Mail } from 'lucide-react'
import { getPlatformUser } from '@/lib/platformAuth'
import {
  listPlatformUsers, createPlatformUser, updatePlatformUser, deletePlatformUser,
  type PlatformUserAccount, type PlatformRole,
} from '@/lib/api/platformUsers'
import Loader from '@/components/ui/Loader'
import { toast } from 'sonner'

const roleLabels: Record<PlatformRole, string> = {
  super_admin: 'Super Admin', admin: 'Admin', viewer: 'Lecture seule',
}
const roleColors: Record<PlatformRole, string> = {
  super_admin: '#ef4444', admin: '#818cf8', viewer: '#64748b',
}

/** Comptes plateforme (super_admin/admin) du back-office lui-meme — stockes
 * dans la base de Noxia Controle, sans lien avec une instance/entreprise
 * precise. Reserve aux super_admin (le backend renvoie 403 sinon). */
export default function PlatformUsersSection() {
  const platformUser = getPlatformUser()
  const isSuperAdmin = platformUser?.role === 'super_admin'

  const [users, setUsers] = useState<PlatformUserAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingUser, setEditingUser] = useState<PlatformUserAccount | null>(null)
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState<PlatformRole>('admin')
  const [password, setPassword] = useState('')

  const loadData = () => {
    setIsLoading(true)
    setError(null)
    listPlatformUsers()
      .then(setUsers)
      .catch((e) => {
        console.error('Erreur chargement des comptes plateforme', e)
        setError('Impossible de charger les comptes plateforme.')
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(loadData, [])

  const openCreateForm = () => {
    setEditingUser(null)
    setEmail(''); setFirstName(''); setLastName(''); setRole('admin'); setPassword('')
    setIsFormOpen(true)
  }

  const openEditForm = (user: PlatformUserAccount) => {
    setEditingUser(user)
    setEmail(user.email); setFirstName(user.first_name); setLastName(user.last_name)
    setRole(user.role); setPassword('')
    setIsFormOpen(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      if (editingUser) {
        await updatePlatformUser(editingUser.id, {
          email, first_name: firstName, last_name: lastName, role,
          ...(password ? { password } : {}),
        })
        toast.success(`Compte "${email}" mis à jour.`)
      } else {
        await createPlatformUser({ email, first_name: firstName, last_name: lastName, role, password })
        toast.success(`Compte "${email}" créé avec succès.`)
      }
      setIsFormOpen(false)
      loadData()
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'enregistrement.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (user: PlatformUserAccount) => {
    if (user.email === platformUser?.email) {
      toast.error('Impossible de supprimer votre propre compte.')
      return
    }
    if (!confirm(`Supprimer définitivement le compte "${user.email}" ?`)) return
    try {
      await deletePlatformUser(user.id)
      toast.success('Compte supprimé.')
      loadData()
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la suppression.')
    }
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <ShieldAlert className="w-10 h-10" style={{ color: '#334155' }} />
        <p className="text-sm" style={{ color: '#94a3b8' }}>
          La gestion des comptes plateforme est réservée aux comptes super-admin.
        </p>
      </div>
    )
  }

  if (isLoading) return <Loader />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm text-white">Comptes plateforme</h3>
          <p className="text-xs" style={{ color: '#94a3b8' }}>
            {users.length} compte{users.length > 1 ? 's' : ''} — super_admin (accès total) ou admin (accès restreint par instance).
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="px-3 py-2 rounded-lg text-white text-sm font-semibold transition flex items-center gap-2"
          style={{ background: '#4f46e5' }}
        >
          <Plus className="w-4 h-4" />
          Ajouter un compte
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>{error}</div>
      )}

      <div className="rounded-xl border overflow-hidden" style={{ background: '#1e293b', borderColor: '#334155' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: '#334155' }}>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Compte</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Rôle</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Instances assignées</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Statut</th>
                <th className="px-4 py-3 text-right text-xs font-medium" style={{ color: '#94a3b8' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center">
                    <Users className="w-10 h-10 mx-auto mb-2" style={{ color: '#334155' }} />
                    <p className="text-sm" style={{ color: '#64748b' }}>Aucun compte plateforme.</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-white/5 transition" style={{ borderColor: '#334155' }}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{`${user.first_name} ${user.last_name}`.trim() || user.email}</p>
                      <p className="text-xs flex items-center gap-1" style={{ color: '#64748b' }}><Mail className="w-3 h-3" />{user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1 w-fit" style={{ background: `${roleColors[user.role]}20`, color: roleColors[user.role] }}>
                        <Shield className="w-3 h-3" />
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#94a3b8' }}>
                      {user.role === 'super_admin' ? 'Toutes (accès total)' : (user.instances.map((i) => i.name).join(', ') || 'Aucune')}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: user.is_active ? 'rgba(34,197,94,0.15)' : 'rgba(100,116,139,0.15)', color: user.is_active ? '#22c55e' : '#64748b' }}>
                        {user.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEditForm(user)} className="px-2.5 py-1 rounded text-xs font-medium transition hover:bg-white/10" style={{ color: '#818cf8' }}>
                          Modifier
                        </button>
                        <button onClick={() => handleDelete(user)} className="p-1.5 rounded transition hover:bg-red-500/10" style={{ color: '#94a3b8' }} title="Supprimer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl border border-dark-800/60 bg-dark-900 shadow-2xl" style={{ background: '#1e293b', borderColor: '#334155' }}>
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: '#334155' }}>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-400" />
                {editingUser ? 'Modifier le compte' : 'Nouveau compte plateforme'}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#94a3b8' }}>Email</label>
                <input
                  type="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none"
                  style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#94a3b8' }}>Prénom</label>
                  <input
                    type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none"
                    style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#94a3b8' }}>Nom</label>
                  <input
                    type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none"
                    style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#94a3b8' }}>Rôle</label>
                <select
                  value={role} onChange={(e) => setRole(e.target.value as PlatformRole)}
                  className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none"
                  style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                >
                  <option value="admin">Admin (accès restreint par instance)</option>
                  <option value="super_admin">Super Admin (accès total)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#94a3b8' }}>
                  {editingUser ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
                </label>
                <input
                  type="password" required={!editingUser} minLength={8}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingUser ? 'Laisser vide pour ne pas changer' : ''}
                  className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none"
                  style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: '#334155' }}>
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-5 py-2 rounded-lg text-sm font-medium transition" style={{ border: '1px solid #334155', color: '#94a3b8' }}>
                  Annuler
                </button>
                <button type="submit" disabled={isSaving} className="px-5 py-2 rounded-lg text-white text-sm font-semibold transition disabled:opacity-50 flex items-center gap-1.5" style={{ background: '#4f46e5' }}>
                  <Plus className="w-4 h-4" />
                  {editingUser ? 'Enregistrer' : 'Créer le compte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
