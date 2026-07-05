'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // TODO: Appel API vers Django
    console.log('Login:', { email, password })
    setTimeout(() => {
      setIsLoading(false)
      // Redirection vers dashboard
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
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
            N
          </div>
          <h1 className="text-2xl font-bold text-white">NOXIA</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>OS Intelligent pour Bars & Restaurants</p>
        </div>

        {/* Formulaire */}
        <div 
          className="rounded-2xl p-6"
          style={{ 
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <h2 className="text-lg font-semibold text-white mb-4">Connexion</h2>
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Email ou téléphone</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@stockbot.io"
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