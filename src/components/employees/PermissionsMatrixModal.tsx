'use client'

import { useState } from 'react'
import { X, GripVertical } from 'lucide-react'
import { allRoles } from './types'

export interface Permission {
  id: string
  label: string
  roles: string[]
}

export const availablePermissions = [
  { id: 'ventes', label: 'Ventes' },
  { id: 'stock', label: 'Stock' },
  { id: 'rapports', label: 'Rapports' },
  { id: 'parametres', label: 'Paramètres' },
  { id: 'employes', label: 'Employés' },
]

interface PermissionsMatrixModalProps {
  initialPermissions: Permission[]
  isSaving: boolean
  onSave: (formattedPermissions: Record<string, string[]>) => void
  onClose: () => void
}

/** Matrice de permissions par rôle (drag & drop), partagée entre l'espace gérant et super-admin. */
export default function PermissionsMatrixModal({ initialPermissions, isSaving, onSave, onClose }: PermissionsMatrixModalProps) {
  const [rolePermissionsState, setRolePermissionsState] = useState<Permission[]>(initialPermissions)
  const [draggedPermission, setDraggedPermission] = useState<string | null>(null)

  const handleDrop = (role: string) => {
    if (!draggedPermission) return
    setRolePermissionsState(prev => {
      const existing = prev.find(p => p.id === draggedPermission)
      if (existing) {
        if (!existing.roles.includes(role)) {
          return prev.map(p => p.id === draggedPermission ? { ...p, roles: [...p.roles, role] } : p)
        }
        return prev
      }
      const perm = availablePermissions.find(p => p.id === draggedPermission)
      return perm ? [...prev, { ...perm, roles: [role] }] : prev
    })
    setDraggedPermission(null)
  }

  const removePermissionFromRole = (permissionId: string, role: string) => {
    setRolePermissionsState(prev =>
      prev.map(p => p.id === permissionId ? { ...p, roles: p.roles.filter(r => r !== role) } : p).filter(p => p.roles.length > 0),
    )
  }

  const getPermissionsForRole = (role: string): string[] => rolePermissionsState.filter(p => p.roles.includes(role)).map(p => p.id)

  const handleSave = () => {
    const formatted: Record<string, string[]> = {}
    allRoles.forEach(role => { formatted[role] = [] })
    rolePermissionsState.forEach(perm => {
      perm.roles.forEach(role => { if (formatted[role]) formatted[role].push(perm.id) })
    })
    onSave(formatted)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div
        className="w-full max-w-4xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: '#1e293b', border: '1px solid #334155' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Matrice des permissions</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition" style={{ color: '#94a3b8' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm mb-4" style={{ color: '#94a3b8' }}>Faites glisser une permission vers un rôle pour l&apos;attribuer.</p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-1">
            <h3 className="text-xs font-semibold mb-2" style={{ color: '#94a3b8' }}>Permissions</h3>
            <div className="space-y-2">
              {availablePermissions.map((perm) => (
                <div
                  key={perm.id}
                  draggable
                  onDragStart={() => setDraggedPermission(perm.id)}
                  className="p-2 rounded-lg cursor-grab active:cursor-grabbing text-xs text-center transition hover:bg-primary-500/10"
                  style={{ background: 'rgba(51, 65, 85, 0.3)', border: '1px solid #334155', color: '#94a3b8' }}
                >
                  <GripVertical className="w-3 h-3 inline mr-1" />
                  {perm.label}
                </div>
              ))}
            </div>
          </div>

          {allRoles.map((role) => (
            <div key={role} className="lg:col-span-1" onDragOver={(e) => e.preventDefault()} onDrop={() => handleDrop(role)}>
              <h3 className="text-xs font-semibold mb-2 truncate" style={{ color: '#94a3b8' }}>{role.charAt(0).toUpperCase() + role.slice(1)}</h3>
              <div className="p-2 rounded-lg min-h-[100px] transition" style={{ background: 'rgba(51, 65, 85, 0.2)', border: '2px dashed #334155' }}>
                {getPermissionsForRole(role).map((permId) => {
                  const perm = availablePermissions.find(p => p.id === permId)
                  if (!perm) return null
                  return (
                    <div key={permId} className="flex items-center justify-between p-1.5 rounded text-xs mb-1" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                      <span>{perm.label}</span>
                      <button onClick={() => removePermissionFromRole(permId, role)} className="hover:text-red-400">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )
                })}
                {getPermissionsForRole(role).length === 0 && <p className="text-xs text-center" style={{ color: '#64748b' }}>Déposez ici</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t" style={{ borderColor: '#334155' }}>
          <button onClick={onClose} className="px-6 py-2.5 rounded-lg text-sm font-medium transition" style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8' }}>
            Fermer
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-lg text-white text-sm font-semibold transition"
            style={{ background: '#4f46e5', boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)' }}
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  )
}
