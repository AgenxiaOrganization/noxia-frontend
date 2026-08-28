'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Mail, User, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { loginWithEmployeeId, googleAuth, ApiError } from '@/lib/api'
import { saveSession } from '@/lib/auth'
import { toast } from 'sonner'

// GOOGLE_CLIENT_ID must be set in .env.local as NEXT_PUBLIC_GOOGLE_CLIENT_ID.
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''
if (!GOOGLE_CLIENT_ID) {
  console.error(
    '[Noxia] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not defined. ' +
    'Add it to .env.local and restart the dev server.',
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [activationCode, setActivationCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [googleNoticeModalOpen, setGoogleNoticeModalOpen] = useState(false)
  const [googleNoticeEmail, setGoogleNoticeEmail] = useState('')

  // ── Google GIS init ──────────────────────────────────────────────────────────
  const handleGoogleCredential = useCallback(
    async (response: { credential: string }) => {
      setGoogleLoading(true)
      setError(null)
      try {
        const result = await googleAuth(response.credential)

        if (result.status === 'no_membership') {
          setError(result.detail)
          return
        }

        if (result.status === 'company_name_required') {
          const params = new URLSearchParams({
            via: 'google',
            id_token: response.credential,
            email: result.email,
            first_name: result.first_name,
            last_name: result.last_name,
          })
          window.location.href = `/register?${params.toString()}`
          return
        }

        saveSession(result)
        setSuccess(true)
        toast.success("Connexion réussie !")
        setTimeout(() => { window.location.href = '/dashboard' }, 600)
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
        text: "signin_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: "100%"
      })
    }
  }, [])

  useEffect(() => {
    const initGoogle = () => {
      if (!window.google) return
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
        use_fedcm_for_prompt: false,
      } as any)

      const btnDiv = document.getElementById("google-button-div")
      if (btnDiv) {
        window.google.accounts.id.renderButton(btnDiv, {
          type: "standard",
          theme: "filled_dark",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          logo_alignment: "left",
          width: "100%"
        })
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
  }, [handleGoogleCredential])

  // ── Employee ID login ────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !activationCode) return
    setIsLoading(true)
    setError(null)

    try {
      const result = await loginWithEmployeeId(email, activationCode)
      saveSession(result)
      setSuccess(true)
      toast.success("Connexion réussie !")
      setTimeout(() => { window.location.href = '/dashboard' }, 600)
    } catch (err) {
      const errMsg = err instanceof ApiError ? err.message : 'Connexion impossible. Réessayez.'
      setError(errMsg)

      if (errMsg.toLowerCase().includes('google')) {
        setGoogleNoticeEmail(email)
        setGoogleNoticeModalOpen(true)
        toast.info("Compte Google détecté. Veuillez utiliser la connexion avec Google.")
      } else {
        toast.error(errMsg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #312e81 70%, #4f46e5 100%)',
      }}
    >
      <div className="w-full max-w-md">

        {/* Logo NOXIA */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-dark-900/50 p-2 border border-dark-800/60 overflow-hidden shadow-md">
            <div className="absolute inset-0 bg-primary-500/10 blur-md rounded-full" />
            <img 
              src="/logos/NOXIA_Orbit_Logo.svg" 
              alt="NOXIA" 
              className="relative w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-display font-extrabold text-white tracking-tight">NOXIA</h1>
          <p className="text-sm text-dark-400 mt-1.5 font-medium">OS Intelligent pour Bars & Restaurants</p>
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
          {/* Success state */}
          {success && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <CheckCircle2 className="w-12 h-12" style={{ color: '#22c55e' }} />
              <p className="text-white font-semibold text-lg">Connexion réussie !</p>
              <p className="text-sm" style={{ color: '#94a3b8' }}>Redirection en cours...</p>
            </div>
          )}

          {/* Google Loading state */}
          {googleLoading && !success && (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <img src="/logos/NOXIA_Orbit_Logo.svg" alt="NOXIA" className="w-12 h-12 animate-spin" />
              <p className="text-white font-semibold text-lg">Vérification de votre compte...</p>
              <p className="text-sm" style={{ color: '#94a3b8' }}>Veuillez patienter un instant.</p>
            </div>
          )}

          {!success && !googleLoading && (
            <>
              {/* Error banner */}
              {error && (
                <div
                  className="flex items-start gap-2 rounded-lg p-3 mb-4 text-sm"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form — Email + ID Employé */}
              <form onSubmit={handleSubmit} className="space-y-4">

                <div>
                  <label className="block text-xs mb-1.5 font-medium" style={{ color: '#94a3b8' }}>Email</label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: '#64748b' }}
                    />
                    <input
                      id="login-email"
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
                    ID Employé
                    <span className="ml-1 text-xs" style={{ color: '#64748b' }}>(code 10 caractères)</span>
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: '#64748b' }}
                    />
                    <input
                      id="login-activation-code"
                      type={showPassword ? 'text' : 'password'}
                      value={activationCode}
                      onChange={(e) => setActivationCode(e.target.value)}
                      placeholder="••••••••••"
                      maxLength={10}
                      className="w-full rounded-lg px-4 py-2.5 pl-10 pr-10 text-white text-sm outline-none transition tracking-widest focus:ring-2 focus:ring-indigo-500"
                      style={{ background: 'rgba(51,65,85,0.5)', border: '1px solid #334155' }}
                      required
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:text-white"
                      style={{ color: '#64748b' }}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs mt-1" style={{ color: '#64748b' }}>
                    Code fourni par votre administrateur lors de votre enregistrement.
                  </p>
                </div>

                <button
                  id="login-submit-btn"
                  type="submit"
                  disabled={isLoading || !email || activationCode.length < 10}
                  className="w-full py-2.5 rounded-lg text-white font-semibold text-sm transition-all duration-200 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: '#4f46e5', boxShadow: '0 10px 25px -5px rgba(99,102,241,0.3)' }}
                >
                  {isLoading ? (
                    <>
                      <img src="/logos/NOXIA_Orbit_Logo.svg" alt="NOXIA" className="w-4 h-4 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </button>
              </form>

              {/* Separator */}
              <div className="flex items-center gap-4 my-5">
                <div className="flex-1 h-px" style={{ background: '#334155' }} />
                <span className="text-xs" style={{ color: '#64748b' }}>OU</span>
                <div className="flex-1 h-px" style={{ background: '#334155' }} />
              </div>

              {/* Google Login - Responsive */}
              <div className="w-full flex justify-center">
                <div 
                  ref={googleButtonRef}
                  id="google-button-div" 
                  className="w-full max-w-[382px] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                />
              </div>

              <p className="text-center text-xs mt-4" style={{ color: '#64748b' }}>
                La connexion Google vérifie aussi votre accès employé.
              </p>
            </>
          )}
        </div>

        {/* Link to register */}
        <p className="text-center text-sm mt-4" style={{ color: '#94a3b8' }}>
          Pas encore de compte ?{' '}
          <Link href="/register" className="hover:underline font-medium" style={{ color: '#818cf8' }}>
            Créer un compte
          </Link>
        </p>

      </div>

      {/* MODAL ALERTE COMPTE GOOGLE DÉTECTÉ */}
      {googleNoticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <svg className="w-8 h-8" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Compte Google Détecté 🔒</h3>
              <p className="text-sm text-slate-300">
                Le compte <span className="font-semibold text-indigo-400">{googleNoticeEmail}</span> a été créé avec Google.
              </p>
              <p className="text-xs text-slate-400">
                Aucun mot de passe ou ID employé classique n&apos;a été configuré. Veuillez cliquer ci-dessous pour vous connecter en 1 clic avec Google.
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setGoogleNoticeModalOpen(false)
                  const googleBtn = document.querySelector('#google-button-div div[role="button"]') as HTMLElement
                  if (googleBtn) {
                    googleBtn.click()
                  } else {
                    toast.info("Veuillez utiliser le bouton 'Se connecter avec Google'.")
                  }
                }}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/30"
              >
                Se connecter avec Google 🚀
              </button>

              <button
                type="button"
                onClick={() => setGoogleNoticeModalOpen(false)}
                className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}