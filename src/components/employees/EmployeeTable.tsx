'use client'

import { useState } from 'react'
import { User, Edit, Trash2, Phone, Mail, Eye, EyeOff, Copy, Calendar, RefreshCw, Send, UserX, UserCheck } from 'lucide-react'
import { roleColors, type EmployeeRow } from './types'

interface EmployeeTableProps {
  employees: EmployeeRow[]
  onEdit: (employee: EmployeeRow) => void
  onDelete: (employee: EmployeeRow) => void
  onToggleActive: (employee: EmployeeRow) => void
  onRegenerateId: (employee: EmployeeRow) => void
  onSend: (employee: EmployeeRow) => void
  onOpenExpiration: (employee: EmployeeRow) => void
}

/** Table employés (desktop) + cartes (mobile), partagée entre l'espace gérant et super-admin. */
export default function EmployeeTable({ employees, onEdit, onDelete, onToggleActive, onRegenerateId, onSend, onOpenExpiration }: EmployeeTableProps) {
  const [showEmployeeId, setShowEmployeeId] = useState<number | null>(null)
  const [showSalaryId, setShowSalaryId] = useState<number | null>(null)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const expirationLabel = (employee: EmployeeRow) => {
    if (!employee.activation_code_expires_at) return "Pas d'expiration"
    const date = new Date(employee.activation_code_expires_at)
    return employee.is_activation_code_expired
      ? `Expiré le ${date.toLocaleDateString()}`
      : `Expire le ${date.toLocaleDateString()} à ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  }

  if (employees.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
        <User className="w-12 h-12 mx-auto mb-2" style={{ color: '#334155' }} />
        <p className="text-sm" style={{ color: '#64748b' }}>Aucun employé trouvé</p>
      </div>
    )
  }

  return (
    <>
      {/* Table (Desktop) */}
      <div className="hidden md:block rounded-xl border overflow-hidden" style={{ background: '#1e293b', borderColor: '#334155' }}>
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
              {employees.map((employee) => {
                const isIdVisible = showEmployeeId === employee.id
                return (
                  <tr key={employee.id} className="border-b" style={{ borderColor: '#334155' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {employee.photo ? (
                          <img src={employee.photo} alt={employee.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: roleColors[employee.role] || '#6366f1' }}>
                            {employee.name.split(' ').map((w) => w[0] || '').join('')}
                          </div>
                        )}
                        <span className="font-medium text-white">{employee.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${roleColors[employee.role] || '#6366f1'}20`, color: roleColors[employee.role] || '#6366f1' }}>
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
                          <code className="text-xs font-mono" style={{ color: '#818cf8' }}>{isIdVisible ? employee.employeeId : '••••••••'}</code>
                          <button onClick={() => setShowEmployeeId(isIdVisible ? null : employee.id)} className="p-0.5 rounded hover:bg-white/10 transition" style={{ color: '#94a3b8' }} title={isIdVisible ? 'Masquer' : 'Afficher'}>
                            {isIdVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                          <button onClick={() => copyToClipboard(employee.employeeId)} className="p-0.5 rounded hover:bg-white/10 transition" style={{ color: '#94a3b8' }} title="Copier">
                            <Copy className="w-3 h-3" />
                          </button>
                          <button onClick={() => onOpenExpiration(employee)} className="p-0.5 rounded hover:bg-white/10 transition" style={{ color: '#94a3b8' }} title="Paramétrer l'expiration">
                            <Calendar className="w-3 h-3" />
                          </button>
                        </div>
                        <span className={`text-[10px] ${employee.is_activation_code_expired ? 'text-red-400 font-semibold' : 'text-slate-400'}`}>{expirationLabel(employee)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#94a3b8' }}>
                      {employee.role === 'administrateur' ? (
                        <span className="text-[11px] italic text-indigo-300 font-medium bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">N/A</span>
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-white">{showSalaryId === employee.id ? `${employee.salary.toLocaleString()} F` : '••••••••'}</span>
                            <button onClick={() => setShowSalaryId(showSalaryId === employee.id ? null : employee.id)} className="p-0.5 rounded hover:bg-white/10 transition" style={{ color: '#94a3b8' }} title={showSalaryId === employee.id ? 'Masquer le salaire' : 'Afficher le salaire'}>
                              {showSalaryId === employee.id ? <EyeOff className="w-3 h-3 text-indigo-400" /> : <Eye className="w-3 h-3" />}
                            </button>
                          </div>
                          {employee.commission > 0 && <span className="block text-[11px]" style={{ color: '#22c55e' }}>+{employee.commission}% comm.</span>}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="font-semibold" style={{ color: '#22c55e' }}>{employee.sales.toLocaleString()} F</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${employee.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {employee.active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        <button onClick={() => onSend(employee)} className="p-1.5 rounded transition hover:bg-blue-500/20" style={{ color: '#3b82f6' }} title="Envoyer les infos">
                          <Send className="w-4 h-4" />
                        </button>
                        <button onClick={() => onEdit(employee)} className="p-1.5 rounded transition hover:bg-white/10" style={{ color: '#94a3b8' }} title="Modifier">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => onRegenerateId(employee)} className="p-1.5 rounded transition hover:bg-yellow-500/20" style={{ color: '#f59e0b' }} title="Régénérer l'ID">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button onClick={() => onToggleActive(employee)} className="p-1.5 rounded transition hover:bg-white/10" style={{ color: employee.active ? '#f87171' : '#22c55e' }} title={employee.active ? 'Désactiver' : 'Activer'}>
                          {employee.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button onClick={() => onDelete(employee)} className="p-1.5 rounded transition hover:bg-red-500/20" style={{ color: '#ef4444' }} title="Supprimer">
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

      {/* Cartes (Mobile) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {employees.map((employee) => {
          const isIdVisible = showEmployeeId === employee.id
          return (
            <div key={employee.id} className="p-4 rounded-xl border space-y-3" style={{ background: '#1e293b', borderColor: '#334155' }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {employee.photo ? (
                    <img src={employee.photo} alt={employee.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: roleColors[employee.role] || '#6366f1' }}>
                      {employee.name.split(' ').map((w) => w[0] || '').join('')}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-white text-sm">{employee.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full inline-block mt-0.5" style={{ background: `${roleColors[employee.role] || '#6366f1'}20`, color: roleColors[employee.role] || '#6366f1' }}>
                      {employee.role}
                    </span>
                  </div>
                </div>
                <span
                  onClick={() => onToggleActive(employee)}
                  className={`text-xs px-2.5 py-1 rounded-full cursor-pointer transition select-none ${employee.active ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}
                >
                  {employee.active ? 'Actif' : 'Inactif'}
                </span>
              </div>

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

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: '#94a3b8' }}>ID Employé</span>
                  <div className="flex items-center gap-1">
                    <code className="text-xs font-mono bg-slate-950 px-2 py-0.5 rounded text-indigo-300">{isIdVisible ? employee.employeeId || 'Non généré' : '••••••••'}</code>
                    {employee.employeeId && (
                      <>
                        <button onClick={() => copyToClipboard(employee.employeeId)} className="p-1 rounded hover:bg-slate-800 text-slate-400">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setShowEmployeeId(isIdVisible ? null : employee.id)} className="p-1 rounded hover:bg-slate-800 text-slate-400">
                          {isIdVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </>
                    )}
                    <button onClick={() => onOpenExpiration(employee)} className="p-1 rounded hover:bg-slate-800 text-indigo-400">
                      <Calendar className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className={`text-[10px] text-right ${employee.is_activation_code_expired ? 'text-red-400 font-semibold' : 'text-slate-500'}`}>{expirationLabel(employee)}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2 rounded bg-slate-900 border" style={{ borderColor: '#334155' }}>
                  <span className="block text-[10px]" style={{ color: '#94a3b8' }}>Salaire</span>
                  {employee.role === 'administrateur' ? (
                    <span className="font-semibold text-indigo-300 italic text-xs">N/A</span>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{showSalaryId === employee.id ? `${employee.salary.toLocaleString()} F` : '••••••••'}</span>
                      <button onClick={() => setShowSalaryId(showSalaryId === employee.id ? null : employee.id)} className="p-0.5 rounded hover:bg-white/10 transition text-slate-400">
                        {showSalaryId === employee.id ? <EyeOff className="w-3 h-3 text-indigo-400" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>
                  )}
                  {employee.role !== 'administrateur' && employee.commission > 0 && <span className="block text-[10px] text-green-400">+{employee.commission}% comm.</span>}
                </div>
                <div className="p-2 rounded bg-slate-900 border" style={{ borderColor: '#334155' }}>
                  <span className="block text-[10px]" style={{ color: '#94a3b8' }}>Ventes</span>
                  <span className="font-semibold text-green-400">{employee.sales.toLocaleString()} F</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t" style={{ borderColor: '#334155' }}>
                <button onClick={() => onSend(employee)} className="px-2.5 py-1.5 rounded text-xs transition bg-blue-500/10 hover:bg-blue-500/20 flex items-center gap-1" style={{ color: '#3b82f6' }}>
                  <Send className="w-3.5 h-3.5" />
                  <span>Envoyer</span>
                </button>
                <button onClick={() => onEdit(employee)} className="px-2.5 py-1.5 rounded text-xs transition bg-white/5 hover:bg-white/10 flex items-center gap-1" style={{ color: '#94a3b8' }}>
                  <Edit className="w-3.5 h-3.5" />
                  <span>Modifier</span>
                </button>
                <button onClick={() => onRegenerateId(employee)} className="px-2.5 py-1.5 rounded text-xs transition bg-yellow-500/10 hover:bg-yellow-500/20 flex items-center gap-1" style={{ color: '#f59e0b' }}>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Régénérer</span>
                </button>
                <button onClick={() => onDelete(employee)} className="p-1.5 rounded transition bg-red-500/10 hover:bg-red-500/20" style={{ color: '#ef4444' }} title="Supprimer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
