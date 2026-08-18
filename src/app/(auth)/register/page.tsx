'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Mail, User, Building2, Phone, Globe, Check, Gift, Star,
  AlertCircle, CheckCircle2, ChevronRight, ChevronLeft,
} from 'lucide-react'
import { registerAccount, googleAuth, detectCountry, ApiError } from '@/lib/api'
import { saveSession } from '@/lib/auth'
import { countriesData } from '@/lib/countriesData'
import { getPlans, type Plan } from '@/lib/api/subscription'
import { toast } from 'sonner'

// Types pour Google GIS sont déclarés globalement dans src/types/google-gis.d.ts

// GOOGLE_CLIENT_ID must be set in .env.local as NEXT_PUBLIC_GOOGLE_CLIENT_ID.
// Never hard-code credentials here — env vars are the only source of truth.
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''
if (!GOOGLE_CLIENT_ID) {
  // Warn at module-load time so it surfaces immediately in the browser console.
  console.error(
    '[Noxia] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not defined. ' +
    'Add it to .env.local and restart the dev server.',
  )
}

const COMPANY_TYPES = [
  { value: 'bar', label: 'Bar' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'snack', label: 'Snack-bar' },
  { value: 'boite_de_nuit', label: 'Boîte de nuit' },
]

// ─── Inner component (uses useSearchParams) ───────────────────────────────────

function RegisterForm() {
  const searchParams = useSearchParams()

  // When the user arrives from /login after a failed Google login (new account)
  const viaGoogle = searchParams.get('via') === 'google'
  const googleIdToken = searchParams.get('id_token') ?? ''
  const googleEmail = searchParams.get('email') ?? ''
  const googleFirstName = searchParams.get('first_name') ?? ''
  const googleLastName = searchParams.get('last_name') ?? ''

  const [step, setStep] = useState(1)
  const [isGoogleMode, setIsGoogleMode] = useState(viaGoogle)
  const [pendingGoogleToken, setPendingGoogleToken] = useState(googleIdToken)

  const [formData, setFormData] = useState({
    firstName: googleFirstName,
    lastName: googleLastName,
    email: googleEmail,
    phone: '',
    companyName: '',
    companyType: 'bar',
    country: 'Gabon',
    planCode: '',
  })

  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // ── Google GIS ─────────────────────────────────────────────────────────────
  const handleGoogleCredential = useCallback(
    async (response: { credential: string }) => {
      setGoogleLoading(true)
      setError(null)
      try {
        const result = await googleAuth(response.credential)

        if (result.status === 'authenticated') {
          // User already has an account — just log them in
          saveSession(result)
          setSuccess(true)
          toast.success("Connexion réussie !")
          setTimeout(() => { window.location.href = '/dashboard' }, 600)
          return
        }

        if (result.status === 'no_membership') {
          setError(result.detail)
          toast.error(result.detail)
          return
        }

        if (result.status === 'company_name_required') {
          // New account: pre-fill name/email and ask for company info
          setIsGoogleMode(true)
          setPendingGoogleToken(response.credential)
          setFormData((prev) => ({
            ...prev,
            email: result.email,
            firstName: result.first_name,
            lastName: result.last_name,
          }))
          setStep(2) // skip to company step
        }
      } catch (err) {
        const errMsg = err instanceof ApiError ? err.message : 'Erreur Google. Réessayez.'
        setError(errMsg)
        toast.error(errMsg)
      } finally {
        setGoogleLoading(false)
      }
    },
    [],
  )

  const googleButtonRef = useCallback((element: HTMLDivElement | null) => {
    if (element && window.google) {
      window.google.accounts.id.renderButton(element, {
        type: "standard",
        theme: "filled_dark",
        size: "large",
        text: "signup_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: 382
      })
    }
  }, [])

  useEffect(() => {
    const initGoogle = () => {
      if (!window.google) return
      if (!viaGoogle) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredential,
          use_fedcm_for_prompt: false,
        } as any)

        // If button div is already mounted, render it
        const btnDiv = document.getElementById("google-button-div")
        if (btnDiv) {
          window.google.accounts.id.renderButton(btnDiv, {
            type: "standard",
            theme: "filled_dark",
            size: "large",
            text: "signup_with",
            shape: "rectangular",
            logo_alignment: "left",
            width: 382
          })
        }
      }
    }

    const existingScript = document.getElementById('google-gsi-script')
    if (existingScript) {
      if (window.google) {
        initGoogle()
      } else {
        existingScript.addEventListener('load', initGoogle)
      }
      return
    }

    const script = document.createElement('script')
    script.id = 'google-gsi-script'
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = initGoogle
    document.head.appendChild(script)
  }, [handleGoogleCredential, viaGoogle])

  // If user arrived via Google redirect, go directly to step 2
  useEffect(() => {
    if (viaGoogle && googleIdToken) {
      setStep(2)
    }
  }, [viaGoogle, googleIdToken])

  // Pré-remplit (sans jamais l'imposer) le pays via géolocalisation IP —
  // le <select> reste modifiable dans tous les cas, et un échec de
  // détection laisse simplement le défaut 'Gabon'.
  useEffect(() => {
    detectCountry().then((detected) => {
      if (detected && countriesData.some((c) => c.name === detected)) {
        setFormData((prev) => ({ ...prev, country: detected }))
      }
    })
  }, [])

  // Catalogue de plans pour l'étape 3 (choix de l'offre) — le plan gratuit
  // est présélectionné par défaut, jamais un plan payant, pour qu'un
  // utilisateur qui n'atteint jamais cette étape (ou clique directement sur
  // "Créer mon compte") reçoive toujours l'essai gratuit.
  useEffect(() => {
    getPlans()
      .then((list) => {
        const sorted = [...list].sort((a, b) => a.display_order - b.display_order)
        setPlans(sorted)
        const freePlan = sorted.find((p) => p.is_free) ?? sorted[0]
        if (freePlan) {
          setFormData((prev) => ({ ...prev, planCode: prev.planCode || freePlan.code }))
        }
      })
      .catch((err) => console.error('Erreur chargement des plans', err))
  }, [])

  // ── Form submit ────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      let result

      if (isGoogleMode && pendingGoogleToken) {
        // Complete Google registration with company info
        result = await googleAuth(pendingGoogleToken, {
          company_name: formData.companyName,
          company_type: formData.companyType,
          country: formData.country,
          plan_code: formData.planCode,
        })
        if (result.status !== 'authenticated') {
          // Throw so the catch block handles the error and finally always runs.
          throw new Error('Une erreur inattendue est survenue. Réessayez.')
        }
      } else {
        // Classic registration (generates a random password — user logs in via employee code)
        result = await registerAccount({
          email: formData.email,
          password: generateStrongPassword(),
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          company_name: formData.companyName,
          company_type: formData.companyType,
          country: formData.country,
          plan_code: formData.planCode,
        })
      }

      saveSession(result)
      setSuccess(true)

      // Le compte est toujours créé en essai (voir accounts.serializers —
      // un plan payant n'active jamais rien sans paiement reel). Si
      // l'utilisateur a choisi un plan payant, on l'envoie payer juste
      // apres — sinon direction le tableau de bord comme avant.
      const chosenPlan = plans.find((p) => p.code === formData.planCode)
      const isPaidPlanChosen = chosenPlan && !chosenPlan.is_free && Number(chosenPlan.price) > 0

      toast.success("Compte créé avec succès !")
      setTimeout(() => {
        window.location.href = isPaidPlanChosen
          ? `/subscription-checkout?plan=${encodeURIComponent(chosenPlan.code)}`
          : '/dashboard'
      }, 600)
    } catch (err) {
      const errMsg = err instanceof ApiError ? err.message : 'Erreur lors de la création du compte.'
      setError(errMsg)
      toast.error(errMsg)
    } finally {
      setIsLoading(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  // Mode Google saute l'étape 1 (perso, déjà fournie par Google) : établissement + plan.
  // Mode classique : perso + établissement + plan. Les deux modes finissent
  // à l'étape 3 (choix du plan) qui déclenche handleSubmit.
  const totalSteps = 3
  const headerSubtitle =
    step === 3
      ? 'Dernière étape — choisissez votre offre'
      : isGoogleMode
        ? 'Renseignez votre établissement'
        : "Créez votre compte en quelques instants"

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #312e81 70%, #4f46e5 100%)',
      }}
    >
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-6 animate-slide-up">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">
            N
          </div>
          <h1 className="text-2xl font-bold text-white">Créer votre compte NOXIA</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            {headerSubtitle}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {(isGoogleMode ? [2, 3] : [1, 2, 3]).map((s, i, arr) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  background: s <= step ? '#4f46e5' : 'rgba(51,65,85,0.5)',
                  color: s <= step ? '#fff' : '#64748b',
                  border: s === step ? '2px solid #818cf8' : '2px solid transparent',
                }}
              >
                {s}
              </div>
              {i < arr.length - 1 && <div className="w-8 h-px" style={{ background: step > s ? '#4f46e5' : '#334155' }} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6 animate-fade-in"
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {/* Success */}
          {success && (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <CheckCircle2 className="w-14 h-14" style={{ color: '#22c55e' }} />
              <p className="text-white font-semibold text-lg">Compte créé avec succès !</p>
              <p className="text-sm" style={{ color: '#94a3b8' }}>Redirection vers votre tableau de bord...</p>
            </div>
          )}

          {/* Google Loading state */}
          {googleLoading && !success && (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <img src="/logos/NOXIA_Orbit_Logo.svg" alt="NOXIA" className="w-14 h-14 animate-spin" />
              <p className="text-white font-semibold text-lg">Vérification de votre compte...</p>
              <p className="text-sm" style={{ color: '#94a3b8' }}>Veuillez patienter un instant.</p>
            </div>
          )}

          {!success && !googleLoading && (
            <form onSubmit={step === totalSteps ? handleSubmit : (e) => { e.preventDefault(); setStep(step + 1) }}>

              {/* Error */}
              {error && (
                <div
                  className="flex items-start gap-2 rounded-lg p-3 mb-4 text-sm"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* ── ÉTAPE 1 : Infos personnelles (classic only) ── */}
              {!isGoogleMode && step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-base font-semibold text-white mb-1">Informations personnelles</h2>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs mb-1.5" style={{ color: '#94a3b8' }}>Prénom</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                        <input
                          id="register-first-name"
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="Jean"
                          className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition focus:ring-2 focus:ring-indigo-500"
                          style={{ background: 'rgba(51,65,85,0.5)', border: '1px solid #334155' }}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs mb-1.5" style={{ color: '#94a3b8' }}>Nom</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                        <input
                          id="register-last-name"
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Dupont"
                          className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition focus:ring-2 focus:ring-indigo-500"
                          style={{ background: 'rgba(51,65,85,0.5)', border: '1px solid #334155' }}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: '#94a3b8' }}>Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                      <input
                        id="register-email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="contact@monbar.com"
                        className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition focus:ring-2 focus:ring-indigo-500"
                        style={{ background: 'rgba(51,65,85,0.5)', border: '1px solid #334155' }}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: '#94a3b8' }}>Téléphone <span style={{ color: '#64748b' }}>(optionnel)</span></label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                      <input
                        id="register-phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+237 6XX XXX XXX"
                        className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition focus:ring-2 focus:ring-indigo-500"
                        style={{ background: 'rgba(51,65,85,0.5)', border: '1px solid #334155' }}
                      />
                    </div>
                  </div>

                  {/* Google option */}
                  <div className="flex items-center gap-4 my-1">
                    <div className="flex-1 h-px" style={{ background: '#334155' }} />
                    <span className="text-xs" style={{ color: '#64748b' }}>OU</span>
                    <div className="flex-1 h-px" style={{ background: '#334155' }} />
                  </div>

                  <div 
                    ref={googleButtonRef}
                    id="google-button-div" 
                    className="w-full flex justify-center hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  />

                  <button
                    id="register-next-btn"
                    type="submit"
                    className="w-full py-2.5 rounded-lg text-white font-semibold text-sm transition-all duration-200 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2"
                    style={{ background: '#4f46e5', boxShadow: '0 10px 25px -5px rgba(99,102,241,0.3)' }}
                  >
                    Continuer <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* ── ÉTAPE 2 : Infos établissement ── */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-base font-semibold text-white mb-0.5">Votre établissement</h2>
                    {isGoogleMode && (
                      <p className="text-xs mb-3" style={{ color: '#94a3b8' }}>
                        Connecté avec Google : <span style={{ color: '#818cf8' }}>{formData.email}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: '#94a3b8' }}>Nom de l'établissement</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                      <input
                        id="register-company-name"
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Mon Bar Premium"
                        className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition focus:ring-2 focus:ring-indigo-500"
                        style={{ background: 'rgba(51,65,85,0.5)', border: '1px solid #334155' }}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: '#94a3b8' }}>Type d'établissement</label>
                    <select
                      id="register-company-type"
                      name="companyType"
                      value={formData.companyType}
                      onChange={handleChange}
                      className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition focus:ring-2 focus:ring-indigo-500"
                      style={{ background: 'rgba(51,65,85,0.9)', border: '1px solid #334155' }}
                    >
                      {COMPANY_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: '#94a3b8' }}>Pays</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#64748b' }} />
                      <select
                        id="register-country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition focus:ring-2 focus:ring-indigo-500"
                        style={{ background: 'rgba(51,65,85,0.9)', border: '1px solid #334155' }}
                      >
                        {countriesData.map((c) => (
                          <option key={c.code} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-1">
                    {!isGoogleMode && (
                      <button
                        id="register-back-btn"
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02] hover:bg-slate-700/50 active:scale-[0.98] flex items-center justify-center gap-1"
                        style={{ background: 'rgba(51,65,85,0.4)', border: '1px solid #334155', color: '#94a3b8' }}
                      >
                        <ChevronLeft className="w-4 h-4" /> Retour
                      </button>
                    )}
                    <button
                      id="register-next-btn-2"
                      type="submit"
                      disabled={!formData.companyName}
                      className="flex-1 py-2.5 rounded-lg text-white font-semibold text-sm transition-all duration-200 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: '#4f46e5', boxShadow: '0 10px 25px -5px rgba(99,102,241,0.3)' }}
                    >
                      Continuer <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ── ÉTAPE 3 : Choix de l'offre ── */}
              {step === 3 && (
                <div className="space-y-4">
                  <h2 className="text-base font-semibold text-white mb-0.5">Choisissez votre offre</h2>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>
                    Vous pourrez toujours changer de plan plus tard depuis votre espace.
                  </p>

                  <div className="space-y-2">
                    {plans.map((plan) => {
                      const price = parseFloat(plan.price)
                      const isPlanFree = plan.is_free || price === 0
                      const isSelected = formData.planCode === plan.code
                      return (
                        <button
                          key={plan.code}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, planCode: plan.code }))}
                          className="w-full flex items-center justify-between gap-3 p-3 rounded-lg border transition text-left"
                          style={{
                            background: isSelected ? 'rgba(99,102,241,0.12)' : 'rgba(51,65,85,0.3)',
                            borderColor: isSelected ? '#6366f1' : '#334155',
                          }}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                              style={{ background: isPlanFree ? 'rgba(34,197,94,0.15)' : 'rgba(99,102,241,0.15)' }}
                            >
                              {isPlanFree ? (
                                <Gift className="w-4 h-4" style={{ color: '#22c55e' }} />
                              ) : (
                                <Star className="w-4 h-4" style={{ color: '#818cf8' }} />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white">{plan.name}</p>
                              <p className="text-xs" style={{ color: '#94a3b8' }}>
                                {isPlanFree
                                  ? `Gratuit${plan.trial_days > 0 ? ` — ${plan.trial_days} jours d'essai complet` : ''}`
                                  : `${price.toLocaleString('fr-FR')} FCFA/${plan.period_label}`}
                              </p>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 shrink-0" style={{ color: '#818cf8' }} />}
                        </button>
                      )
                    })}
                  </div>

                  {(() => {
                    const chosenPlan = plans.find((p) => p.code === formData.planCode)
                    const isPaid = chosenPlan && !chosenPlan.is_free && parseFloat(chosenPlan.price) > 0
                    return (
                      <div
                        className="rounded-lg p-3 text-xs"
                        style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc' }}
                      >
                        {isPaid
                          ? '💳 Votre compte est créé immédiatement — vous serez ensuite invité à régler ce plan par Mobile Money ou carte bancaire.'
                          : `🎁 Essai gratuit${chosenPlan && chosenPlan.trial_days > 0 ? ` de ${chosenPlan.trial_days} jours` : ''} inclus — aucune carte bancaire requise.`}
                      </div>
                    )
                  })()}

                  <div className="flex gap-3 pt-1">
                    <button
                      id="register-back-btn-2"
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02] hover:bg-slate-700/50 active:scale-[0.98] flex items-center justify-center gap-1"
                      style={{ background: 'rgba(51,65,85,0.4)', border: '1px solid #334155', color: '#94a3b8' }}
                    >
                      <ChevronLeft className="w-4 h-4" /> Retour
                    </button>
                    <button
                      id="register-submit-btn"
                      type="submit"
                      disabled={isLoading || !formData.planCode}
                      className="flex-1 py-2.5 rounded-lg text-white font-semibold text-sm transition-all duration-200 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: '#4f46e5', boxShadow: '0 10px 25px -5px rgba(99,102,241,0.3)' }}
                    >
                      {isLoading ? (
                        <>
                          <img src="/logos/NOXIA_Orbit_Logo.svg" alt="NOXIA" className="w-4 h-4 animate-spin" />
                          Création...
                        </>
                      ) : (
                        'Créer mon compte'
                      )}
                    </button>
                  </div>
                </div>
              )}

            </form>
          )}
        </div>

        <p className="text-center text-sm mt-4" style={{ color: '#94a3b8' }}>
          Déjà un compte ?{' '}
          <Link href="/login" className="hover:underline font-medium" style={{ color: '#818cf8' }}>
            Se connecter
          </Link>
        </p>

      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Generates a cryptographically random password — never shown to the user. */
function generateStrongPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  const arr = new Uint8Array(24)
  crypto.getRandomValues(arr)
  return Array.from(arr, (b) => chars[b % chars.length]).join('')
}

// ─── Page export (wrapped in Suspense for useSearchParams) ────────────────────

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f172a' }}>
        <img src="/logos/NOXIA_Orbit_Logo.svg" alt="NOXIA" className="w-8 h-8 animate-spin" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}