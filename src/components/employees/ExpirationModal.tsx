'use client'

import { useState } from 'react'
import type { EmployeeRow } from './types'

interface ExpirationModalProps {
  employee: EmployeeRow
  isSaving: boolean
  onSave: (isoDate: string | null) => void
  onClose: () => void
}

function toInputValue(isoDate: string | null | undefined): string {
  if (!isoDate) return ''
  const localDate = new Date(isoDate)
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset())
  return localDate.toISOString().slice(0, 16)
}

/** Modal de configuration de l'expiration du code employé, partagée entre l'espace gérant et super-admin. */
export default function ExpirationModal({ employee, isSaving, onSave, onClose }: ExpirationModalProps) {
  const [value, setValue] = useState(() => toInputValue(employee.activation_code_expires_at))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl p-6"
        style={{ background: '#1e293b', border: '1px solid #334155' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-white mb-2">Expiration de l'ID Employé</h2>
        <p className="text-sm mb-4" style={{ color: '#94a3b8' }}>
          Définissez la date et l'heure limites de validité du code de connexion pour <strong>{employee.name}</strong> (Code actuel : <code style={{ color: '#818cf8' }}>{employee.employeeId}</code>).
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Date et heure d'expiration</label>
            <input
              type="datetime-local"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
              style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onSave(null)}
              disabled={isSaving}
              className="flex-1 py-2 text-xs font-semibold rounded-lg transition"
              style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171' }}
            >
              Retirer l'expiration
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium transition"
              style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8' }}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={() => onSave(value ? new Date(value).toISOString() : null)}
              disabled={isSaving}
              className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition"
              style={{ background: '#4f46e5', boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)' }}
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
