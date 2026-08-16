'use client'

import { useState } from 'react'
import { X, Mail, Phone, Send } from 'lucide-react'
import type { EmployeeRow } from './types'

interface SendCredentialsModalProps {
  employee: EmployeeRow
  companyCode: string
  companyName: string
  isSending: boolean
  onSendEmail: () => void
  onSendWhatsapp: (message: string) => void
  onClose: () => void
}

function buildMessage(method: 'email' | 'whatsapp', employee: EmployeeRow, companyCode: string, companyName: string) {
  return method === 'email'
    ? `Bonjour ${employee.name},\n\nVoici vos identifiants pour vous connecter au bot de Noxia et à l'application :\n\n- E-mail : ${employee.email}\n- ID Établissement : ${companyCode}\n- ID Employé : ${employee.employeeId}\n\nCordialement,\nL'équipe de gestion de ${companyName}.`
    : `Bonjour ${employee.name},\n\nVoici vos identifiants pour vous connecter au bot de Noxia :\n- ID Établissement : ${companyCode}\n- ID Employé : ${employee.employeeId}\n\nCordialement,\nL'équipe de gestion de ${companyName}.`
}

/** Modal d'envoi des identifiants employé par email/WhatsApp, partagée entre l'espace gérant et super-admin. */
export default function SendCredentialsModal({ employee, companyCode, companyName, isSending, onSendEmail, onSendWhatsapp, onClose }: SendCredentialsModalProps) {
  const [method, setMethod] = useState<'email' | 'whatsapp'>('email')
  const [message, setMessage] = useState(() => buildMessage('email', employee, companyCode, companyName))

  const switchMethod = (next: 'email' | 'whatsapp') => {
    setMethod(next)
    setMessage(buildMessage(next, employee, companyCode, companyName))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (method === 'email') {
      onSendEmail()
    } else {
      if (!employee.phone) return
      onSendWhatsapp(message)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: '#1e293b', border: '1px solid #334155' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-lg font-semibold text-white">{method === 'email' ? 'Envoyer par E-mail' : 'Envoyer par WhatsApp'}</h2>
            <p className="text-xs text-indigo-400">{method === 'email' ? employee.email : (employee.phone || 'Pas de numéro')}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs mb-2" style={{ color: '#94a3b8' }}>Méthode d&apos;envoi</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => switchMethod('email')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition flex items-center justify-center gap-2 ${
                  method === 'email' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800/80'
                }`}
              >
                <Mail className="w-4 h-4" />
                Par E-mail
              </button>
              <button
                type="button"
                onClick={() => switchMethod('whatsapp')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition flex items-center justify-center gap-2 ${
                  method === 'whatsapp' ? 'bg-green-600/20 border-green-500 text-green-400' : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800/80'
                }`}
              >
                <Phone className="w-4 h-4" />
                Par WhatsApp
              </button>
            </div>
          </div>

          {method === 'email' ? (
            <div>
              <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Adresse e-mail destinataire</label>
              <input type="text" value={employee.email} disabled className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none bg-slate-900 border border-slate-700 opacity-60 cursor-not-allowed" />
            </div>
          ) : (
            <div>
              <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Numéro WhatsApp destinataire</label>
              <input type="text" value={employee.phone || ''} disabled className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none bg-slate-900 border border-slate-700 opacity-60 cursor-not-allowed" placeholder="Aucun numéro configuré" />
            </div>
          )}

          <div>
            <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Message à envoyer</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none resize-none h-44 bg-slate-900 border border-slate-700 focus:border-indigo-500"
              required
            />
          </div>

          <div className="flex gap-3 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium transition bg-transparent border border-slate-700 text-slate-400 hover:text-white" disabled={isSending}>
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSending || (method === 'whatsapp' && !employee.phone)}
              className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
              style={{
                background: method === 'email' ? '#22c55e' : '#25D366',
                boxShadow: method === 'email' ? '0 10px 25px -5px rgba(34, 197, 94, 0.3)' : '0 10px 25px -5px rgba(37, 211, 102, 0.3)',
              }}
            >
              <Send className="w-4 h-4" />
              {isSending ? 'Envoi...' : method === 'email' ? 'Envoyer les identifiants' : 'Ouvrir WhatsApp'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
