'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Building2, Mail, MailCheck, ShieldCheck } from 'lucide-react'
import { forgotEmployeeId } from '@/lib/api'
import { ApiError } from '@/lib/api'

/**
 * Recuperation de l'ID employe (activation_code) de l'ADMINISTRATEUR d'un
 * etablissement uniquement — jamais un simple employe, qui doit toujours
 * passer par son administrateur pour une regeneration (voir la page
 * Employes du dashboard). Le backend verifie email + code etablissement +
 * role administrateur avant d'envoyer quoi que ce soit (voir
 * accounts.views.ForgotEmployeeIdView) ; la reponse reste volontairement
 * generique pour ne jamais reveler l'existence d'un compte.
 */
export default function ForgotEmployeeIdPage() {
  const [email, setEmail] = useState('')
  const [messagingCode, setMessagingCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await forgotEmployeeId(email, messagingCode)
      // Reponse toujours generique cote backend — on affiche donc
      // systematiquement la confirmation, jamais une erreur specifique.
      setSent(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur inattendue. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #312e81 70%, #4f46e5 100%)' }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-slide-up">
          <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-dark-900/50 p-2 border border-dark-800/60 overflow-hidden shadow-md">
            <div className="absolute inset-0 bg-primary-500/10 blur-md rounded-full" />
            <img src="/logos/NOXIA_Orbit_Logo.svg" alt="NOXIA" className="relative w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-display font-extrabold text-white tracking-tight">ID employé oublié</h1>
          <p className="text-sm text-dark-400 mt-1.5 font-medium">Réservé à l&apos;administrateur de l&apos;établissement</p>
        </div>

        <div
          className="rounded-2xl p-6 animate-fade-in"
          style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          {sent ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg p-3" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.25)' }}>
                <MailCheck className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#22c55e' }} />
                <p className="text-sm" style={{ color: '#94a3b8' }}>
                  Si ces informations correspondent à un compte administrateur, un email vient d&apos;être envoyé
                  à <span className="text-white">{email}</span> avec un lien valable 15 minutes pour générer
                  un nouvel ID employé.
                </p>
              </div>
              <Link
                href="/login"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition"
                style={{ background: 'rgba(51,65,85,0.5)', border: '1px solid #334155', color: '#e2e8f0' }}
              >
                <ArrowLeft className="w-4 h-4" />
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-start gap-2.5 rounded-lg p-3 mb-1" style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#818cf8' }} />
                <p className="text-xs" style={{ color: '#94a3b8' }}>
                  Seul l&apos;administrateur (créateur de l&apos;établissement) peut récupérer son ID employé
                  ainsi. Un employé doit demander une régénération à son administrateur.
                </p>
              </div>

              <div>
                <label className="block text-xs mb-1.5 font-medium" style={{ color: '#94a3b8' }}>Email administrateur</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@monbar.com"
                    className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition focus:ring-2 focus:ring-indigo-500"
                    style={{ background: 'rgba(51,65,85,0.5)', border: '1px solid #334155' }}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs mb-1.5 font-medium" style={{ color: '#94a3b8' }}>
                  ID Établissement
                  <span className="ml-1 text-xs" style={{ color: '#64748b' }}>(code à 10 caractères)</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                  <input
                    type="text"
                    value={messagingCode}
                    onChange={(e) => setMessagingCode(e.target.value)}
                    placeholder="NOX-XXXXXXXX"
                    maxLength={15}
                    className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition tracking-widest focus:ring-2 focus:ring-indigo-500"
                    style={{ background: 'rgba(51,65,85,0.5)', border: '1px solid #334155' }}
                    required
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
                <p className="text-xs mt-1" style={{ color: '#64748b' }}>
                  Visible dans les paramètres de votre établissement.
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg p-3 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-white font-semibold text-sm transition-all duration-200 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: '#4f46e5', boxShadow: '0 10px 25px -5px rgba(99,102,241,0.3)' }}
              >
                {loading ? 'Envoi...' : 'Envoyer le lien de récupération'}
              </button>

              <Link
                href="/login"
                className="flex items-center justify-center gap-1 text-xs hover:underline"
                style={{ color: '#818cf8' }}
              >
                <ArrowLeft className="w-3 h-3" />
                Retour à la connexion
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
