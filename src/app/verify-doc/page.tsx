'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ShieldCheck, ShieldAlert, Search, Loader2, FileText, Building2, User, Calendar, DollarSign, CheckCircle2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface VerifyResult {
  is_valid: boolean
  verification_code?: string
  document_type?: string
  company_name?: string
  company_country?: string
  company_type?: string
  verified_since?: string
  employee_name?: string
  employee_email?: string
  employee_matricule?: string
  month?: string
  net_salary?: number
  currency?: string
  status?: string
  status_display?: string
  created_at?: string
  has_employer_signature?: boolean
  detail?: string
}

function VerifyDocContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryCode = searchParams.get('code') || ''

  const [inputCode, setInputCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VerifyResult | null>(null)
  const [searched, setSearched] = useState(false)

  const verifyCode = useCallback(async (codeToVerify: string) => {
    const cleanCode = codeToVerify.trim().toUpperCase()
    if (!cleanCode) return

    setResult(null) // Réinitialiser le résultat immédiatement pour éviter tout clignotement
    setLoading(true)
    setSearched(true)
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api/v1'
      const res = await fetch(`${BASE_URL}/finance/verify/${encodeURIComponent(cleanCode)}/`)
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setResult({
        is_valid: false,
        detail: "Impossible d'effectuer la vérification. Vérifiez votre connexion au serveur."
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (queryCode) {
      setInputCode(queryCode)
      verifyCode(queryCode)
    }
  }, [queryCode, verifyCode])

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputCode.trim()) return
    // Mettre à jour l'URL sans rechargement de page
    router.push(`/verify-doc?code=${encodeURIComponent(inputCode.trim())}`)
    verifyCode(inputCode)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mb-2">
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Vérification de Sécurité NOXIA</h1>
          <p className="text-sm text-slate-400">
            Contrôle d&apos;authenticité et de validité des documents officiels émis par NOXIA Smart SaaS.
          </p>
        </div>

        {/* Formulaire de recherche */}
        <form onSubmit={handleFormSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Ex: NOXIA-VERIF-000001-X8K9"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-sm outline-none focus:border-indigo-500 transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !inputCode.trim()}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center gap-2 transition shadow-lg shadow-indigo-600/30 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Vérifier'}
          </button>
        </form>

        {/* Écran de Chargement NOXIA Orbit */}
        {loading && (
          <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/60 p-8 space-y-4 text-center backdrop-blur-md shadow-xl animate-pulse">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <ShieldCheck className="w-8 h-8 text-indigo-400 absolute" />
            </div>
            <h3 className="text-lg font-bold text-white">Vérification cryptographique en cours...</h3>
            <p className="text-xs text-slate-400 font-mono">Contrôle de l&apos;empreinte numérique certifiée NOXIA Smart SaaS</p>
          </div>
        )}

        {/* Résultat */}
        {!loading && searched && result && (
          <div className="space-y-4">
            {result.is_valid && result.document_type === 'Établissement certifié NOXIA' ? (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-6 space-y-4 backdrop-blur-md shadow-xl text-center">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Établissement Certifié NOXIA</span>
                  <h3 className="text-2xl font-bold text-white mt-1">{result.company_name}</h3>
                  <p className="text-sm text-slate-400 mt-1">{result.company_type} • {result.company_country}</p>
                </div>
                <div className="pt-3 border-t border-emerald-500/20 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  Certifié depuis le {result.verified_since}
                </div>
                <p className="text-xs font-mono text-emerald-300/70">Code Officiel : {result.verification_code}</p>
              </div>
            ) : !result.is_valid && result.company_name ? (
              <div className="rounded-2xl border border-rose-500/40 bg-rose-950/20 p-6 space-y-3 backdrop-blur-md text-center shadow-xl">
                <ShieldAlert className="w-10 h-10 text-rose-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">{result.company_name}</h3>
                <p className="text-sm text-rose-300">{result.detail || "Cet établissement n'est plus certifié par NOXIA."}</p>
              </div>
            ) : result.is_valid ? (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-6 space-y-4 backdrop-blur-md shadow-xl">
                <div className="flex items-center gap-3 pb-3 border-b border-emerald-500/20">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Document Authentique & Valide</span>
                    <h3 className="text-lg font-bold text-white">{result.document_type}</h3>
                    <p className="text-xs font-mono text-emerald-300">Code Officiel : {result.verification_code}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                      Établissement Émetteur
                    </div>
                    <p className="font-semibold text-white">{result.company_name}</p>
                    <p className="text-xs text-slate-400">{result.company_country}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      Bénéficiaire / Signataire
                    </div>
                    <p className="font-semibold text-white">{result.employee_name}</p>
                    <p className="text-xs text-slate-400">Matricule : <span className="font-mono text-indigo-300 font-semibold">{result.employee_matricule}</span></p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      Période / Exercice
                    </div>
                    <p className="font-semibold text-white">{result.month}</p>
                    <p className="text-xs text-slate-400">Statut : <span className="text-emerald-400 font-semibold">{result.status_display}</span></p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      {result.net_salary && result.net_salary > 0 ? "Montant Certifié" : "Conformité Document"}
                    </div>
                    <p className="font-bold text-lg text-emerald-400">
                      {result.net_salary && result.net_salary > 0 
                        ? `${result.net_salary.toLocaleString()} ${result.currency}`
                        : "Authenticité Certifiée ✅"
                      }
                    </p>
                  </div>
                </div>

                <div className="pt-2 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800">
                  <span>Signature d&apos;établissement : {result.has_employer_signature ? '✅ Certifiée' : '✔️ Validée par la Direction'}</span>
                  <span>Émis le : {result.created_at?.slice(0, 10)}</span>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-rose-500/40 bg-rose-950/20 p-6 space-y-3 backdrop-blur-md text-center shadow-xl">
                <ShieldAlert className="w-10 h-10 text-rose-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">Document Invalide ou Introuvable</h3>
                <p className="text-sm text-rose-300">
                  {result.detail || "Le code renseigné ne correspond à aucun document authentique délivré par la plateforme NOXIA."}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="text-center pt-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-3.5 h-3.5" />
            Retourner à l&apos;accueil NOXIA
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function VerifyDocPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    }>
      <VerifyDocContent />
    </Suspense>
  )
}
