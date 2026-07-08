'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, Building2, Key } from 'lucide-react'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [loginMethod, setLoginMethod] = useState<'classic' | 'company'>('classic')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulation de connexion
    console.log('Login:', { email, password, companyId, method: loginMethod })
    
    setTimeout(() => {
      setIsLoading(false)
      window.location.href = '/dashboard'
    }, 1500)
  }

  const handleGoogleLogin = () => {
    // Simulation de connexion Google
    alert('🔐 Redirection vers Google...\n\n(SIMULATION) Connexion avec Google réussie !')
    setTimeout(() => {
      window.location.href = '/dashboard'
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #312e81 70%, #4f46e5 100%)' 
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
            N
          </div>
          <h1 className="text-2xl font-bold text-white">NOXIA</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>OS Intelligent pour Bars & Restaurants</p>
        </div>

        {/* Formulaire */}
        <div 
          className="rounded-2xl p-6 animate-fade-in"
          style={{ 
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          {/* Méthode de connexion */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setLoginMethod('classic')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                loginMethod === 'classic' ? 'border' : 'border-transparent'
              }`}
              style={{
                background: loginMethod === 'classic' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(51, 65, 85, 0.3)',
                borderColor: loginMethod === 'classic' ? '#6366f1' : 'transparent',
                color: loginMethod === 'classic' ? '#818cf8' : '#94a3b8'
              }}
            >
              <Mail className="w-4 h-4 inline mr-1" />
              Email
            </button>
            <button
              onClick={() => setLoginMethod('company')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                loginMethod === 'company' ? 'border' : 'border-transparent'
              }`}
              style={{
                background: loginMethod === 'company' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(51, 65, 85, 0.3)',
                borderColor: loginMethod === 'company' ? '#6366f1' : 'transparent',
                color: loginMethod === 'company' ? '#818cf8' : '#94a3b8'
              }}
            >
              <Building2 className="w-4 h-4 inline mr-1" />
              Entreprise
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {loginMethod === 'classic' ? (
              <>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contact@monbar.com"
                      className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
                      style={{ 
                        background: 'rgba(51, 65, 85, 0.5)',
                        border: '1px solid #334155'
                      }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-lg px-4 py-2.5 pl-10 pr-10 text-white text-sm outline-none transition"
                      style={{ 
                        background: 'rgba(51, 65, 85, 0.5)',
                        border: '1px solid #334155'
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: '#64748b' }}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contact@monbar.com"
                      className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
                      style={{ 
                        background: 'rgba(51, 65, 85, 0.5)',
                        border: '1px solid #334155'
                      }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>ID Unique Entreprise</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                    <input
                      type="text"
                      value={companyId}
                      onChange={(e) => setCompanyId(e.target.value)}
                      placeholder="NOX-XXXXXXXXXX"
                      className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
                      style={{ 
                        background: 'rgba(51, 65, 85, 0.5)',
                        border: '1px solid #334155'
                      }}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg text-white font-semibold text-sm transition disabled:opacity-50"
              style={{ 
                background: '#4f46e5',
                boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
              }}
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* Séparateur */}
          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px" style={{ background: '#334155' }} />
            <span className="text-xs" style={{ color: '#64748b' }}>OU</span>
            <div className="flex-1 h-px" style={{ background: '#334155' }} />
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full py-2.5 rounded-lg text-white text-sm font-medium transition flex items-center justify-center gap-3"
            style={{ 
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid #334155',
              backdropFilter: 'blur(10px)'
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuer avec Google
          </button>

          <p className="text-center text-xs mt-4" style={{ color: '#64748b' }}>
            Demo : admin@stockbot.io / admin123
          </p>
        </div>

        {/* Lien vers l'inscription */}
        <p className="text-center text-sm mt-4" style={{ color: '#94a3b8' }}>
          Pas encore de compte ?{' '}
          <Link href="/register" className="hover:underline" style={{ color: '#818cf8' }}>
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  )
}