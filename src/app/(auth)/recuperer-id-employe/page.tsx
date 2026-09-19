'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Check, Copy, KeyRound, Loader2, XCircle } from 'lucide-react'
import { recoverEmployeeId, ApiError } from '@/lib/api'

/**
 * Consomme le token de recuperation d'ID employe recu par email — c'est ICI,
 * au chargement de cette page, que le nouveau code est genere cote backend
 * (jamais avant, voir accounts.views.RecoverEmployeeIdView), pour garantir
 * que seule la personne ayant reellement recu l'email obtient le nouveau code.
 */
function RecoverEmployeeIdContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [employeeId, setEmployeeId] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMessage('Ce lien de récupération est invalide ou incomplet.')
      return
    }

    let cancelled = false
    recoverEmployeeId(token)
      .then((result) => {
        if (cancelled) return
        setEmployeeId(result.employee_id)
        setCompanyName(result.company_name)
        setStatus('success')
      })
      .catch((err) => {
        if (cancelled) return
        setErrorMessage(err instanceof ApiError ? err.message : 'Erreur inattendue. Réessayez.')
        setStatus('error')
      })

    return () => { cancelled = true }
  }, [token])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(employeeId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Presse-papiers indisponible (contexte non securise, permission
      // refusee...) — le code reste affiche a l'ecran pour copie manuelle.
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#818cf8' }} />
        <p className="text-sm" style={{ color: '#94a3b8' }}>Génération de votre nouvel ID employé...</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg p-3" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <XCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#f87171' }} />
          <p className="text-sm" style={{ color: '#fca5a5' }}>{errorMessage}</p>
        </div>
        <Link
          href="/id-employe-oublie"
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition"
          style={{ background: '#4f46e5' }}
        >
          Demander un nouveau lien
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-center" style={{ color: '#94a3b8' }}>
        Voici votre nouvel ID employé pour <span className="text-white font-medium">{companyName}</span>.
        L&apos;ancien code ne fonctionne plus.
      </p>

      <button
        onClick={handleCopy}
        className="w-full flex items-center justify-between gap-3 rounded-xl px-4 py-4 transition hover:brightness-110"
        style={{ background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.35)' }}
      >
        <span className="flex items-center gap-2 min-w-0">
          <KeyRound className="w-4 h-4 shrink-0" style={{ color: '#818cf8' }} />
          <span className="font-mono text-lg font-bold tracking-widest text-white truncate">{employeeId}</span>
        </span>
        {copied ? (
          <Check className="w-4 h-4 shrink-0" style={{ color: '#22c55e' }} />
        ) : (
          <Copy className="w-4 h-4 shrink-0" style={{ color: '#818cf8' }} />
        )}
      </button>
      {copied && (
        <p className="text-xs text-center" style={{ color: '#22c55e' }}>Copié !</p>
      )}

      <Link
        href="/login"
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]"
        style={{ background: '#4f46e5', boxShadow: '0 10px 25px -5px rgba(99,102,241,0.3)' }}
      >
        <ArrowLeft className="w-4 h-4" />
        Aller à la connexion
      </Link>
    </div>
  )
}

export default function RecoverEmployeeIdPage() {
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
          <h1 className="text-2xl font-display font-extrabold text-white tracking-tight">Nouvel ID employé</h1>
        </div>

        <div
          className="rounded-2xl p-6 animate-fade-in"
          style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <Suspense fallback={<p className="text-sm text-center" style={{ color: '#94a3b8' }}>Chargement...</p>}>
            <RecoverEmployeeIdContent />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
