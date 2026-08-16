'use client'

import { useState } from 'react'
import { ImagePlus } from 'lucide-react'
import { allRoles, type EmployeeRow } from './types'

export interface EmployeeFormPayload {
  first_name: string
  last_name: string
  phone: string
  email: string
  role: string
  base_salary: number
  commission_rate: number
}

interface EmployeeFormModalProps {
  employee: EmployeeRow | null
  onSubmit: (payload: EmployeeFormPayload, photoFile: File | null) => void
  onClose: () => void
}

/**
 * Formulaire d'ajout/édition employé, partagé entre l'espace gérant et
 * super-admin. La photo de profil (facultative) est transmise séparément du
 * payload JSON principal — upload multipart géré par le parent (voir
 * uploadEmployeePhoto), jamais dans le payload texte lui-même.
 */
export default function EmployeeFormModal({ employee, onSubmit, onClose }: EmployeeFormModalProps) {
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(employee?.photo ?? null)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const fullName = formData.get('fullName') as string
    const role = formData.get('role') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const salaryInput = formData.get('salary') as string
    const commissionInput = formData.get('commission') as string
    const baseSalary = role === 'administrateur' ? 0 : parseFloat(salaryInput) || 0
    const commissionRate = parseFloat(commissionInput) || 0

    const names = fullName.trim().split(' ')
    const first_name = names[0] || ''
    const last_name = names.slice(1).join(' ') || ''

    onSubmit({ first_name, last_name, phone, email, role, base_salary: baseSalary, commission_rate: commissionRate }, photoFile)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: '#1e293b', border: '1px solid #334155' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-white mb-4">{employee ? "Modifier l'employé" : 'Ajouter un employé'}</h2>

        <form key={employee?.id || 'new'} className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>
              Photo de profil <span className="text-[10px] text-slate-400 font-normal">(Opt.)</span>
            </label>
            <div
              className="flex items-center gap-3 rounded-lg p-3 cursor-pointer transition hover:border-indigo-500"
              style={{ background: 'rgba(51, 65, 85, 0.3)', border: '1px dashed #334155' }}
              onClick={() => document.getElementById('employeePhotoInput')?.click()}
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Aperçu" className="w-12 h-12 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                  <ImagePlus className="w-5 h-5" style={{ color: '#818cf8' }} />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm text-white truncate">{photoFile ? photoFile.name : photoPreview ? 'Changer la photo' : 'Ajouter une photo'}</p>
                <p className="text-xs" style={{ color: '#64748b' }}>JPG, PNG ou WEBP (max 5 Mo)</p>
              </div>
              <input
                id="employeePhotoInput" type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Nom complet</label>
            <input
              type="text"
              name="fullName"
              defaultValue={employee?.name || ''}
              className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
              style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Rôle</label>
              <select
                name="role"
                defaultValue={employee?.role || 'serveur'}
                className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
              >
                {allRoles.map(role => (
                  <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Téléphone</label>
              <input
                type="text"
                name="phone"
                defaultValue={employee?.phone || '+241 '}
                className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Email</label>
            <input
              type="email"
              name="email"
              defaultValue={employee?.email || ''}
              className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
              style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Salaire (FCFA)</label>
              <input
                type="number"
                name="salary"
                defaultValue={employee?.salary || 120000}
                className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Commission (%)</label>
              <input
                type="number"
                name="commission"
                defaultValue={employee?.commission || 0}
                className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium transition"
              style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8' }}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition"
              style={{ background: '#4f46e5', boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)' }}
            >
              {employee ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
