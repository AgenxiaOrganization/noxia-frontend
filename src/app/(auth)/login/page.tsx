'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Mail, User, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { loginWithEmployeeId, googleAuth, ApiError } from '@/lib/api'
import { saveSession } from '@/lib/auth'
import { toast } from 'sonner'

// Types pour Google GIS sont déclarés globalement dans src/types/google-gis.d.ts

// GOOGLE_CLIENT_ID must be set in .env.local as NEXT_PUBLIC_GOOGLE_CLIENT_ID.
// Never hard-code credentials here — env vars are the only source of truth.
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
          // The user does not exist → redirect to register with pre-filled Google data
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

        // Authenticated ✅
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
        width: 382
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

      // If button div is already mounted, render it
      const btnDiv = document.getElementById("google-button-div")
      if (btnDiv) {
        window.google.accounts.id.renderButton(btnDiv, {
          type: "standard",
          theme: "filled_dark",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          logo_alignment: "left",
          width: 382
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
      toast.error(errMsg)
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

        {/* Logo */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-4">
            <img
              src="/logos/NOXIA_Orbit_Logo.svg"
              alt="NOXIA"
              className="w-10 h-10"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>
          <h1 className="text-2xl font-bold text-white">NOXIA</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>OS Intelligent pour Bars & Restaurants</p>
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

              {/* Google Login */}
              <div 
                ref={googleButtonRef}
                id="google-button-div" 
                className="w-full flex justify-center hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              />

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
    </div>
  )
}