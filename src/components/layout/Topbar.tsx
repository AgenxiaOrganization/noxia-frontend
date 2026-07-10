'use client'

import { useState, useEffect } from 'react'
import { Menu, Bell, User, LogOut, Settings, Building2, FileText, CreditCard, ChevronDown, Copy, Check } from 'lucide-react'
import Link from 'next/link'

// Données mockées
const mockUser = {
  name: 'Jean Dupont',
  email: 'jean@lepremium.ga',
  role: 'Administrateur',
  avatar: 'JD',
  company: 'Bar Le Premium',
  companyId: 'NOX-1234567890',
  plan: 'Premium',
}

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const [time, setTime] = useState('')
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(now.toLocaleString('fr-FR', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }))
    }
    updateTime()
    const interval = setInterval(updateTime, 30000)
    return () => clearInterval(interval)
  }, [])

  const copyCode = () => {
    navigator.clipboard.writeText(mockUser.companyId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <header 
      className="h-14 border-b flex items-center justify-between px-4 sm:px-6 shrink-0 relative z-10"
      style={{ 
        borderColor: '#1e293b',
        background: 'rgba(30, 41, 59, 0.5)'
      }}
    >
      {/* Gauche */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick} 
          className="md:hidden hover:text-white transition"
          style={{ color: '#94a3b8' }}
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="font-semibold text-sm truncate max-w-[120px] sm:max-w-none text-white">
          Tableau de bord
        </h2>
      </div>

      {/* Droite */}
      <div className="flex items-center gap-4">
        {/* Code entreprise avec copier */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
          <span className="text-xs" style={{ color: '#94a3b8' }}>ID:</span>
          <code className="text-xs font-mono" style={{ color: '#818cf8' }}>{mockUser.companyId}</code>
          <button
            onClick={copyCode}
            className="p-0.5 rounded hover:bg-white/10 transition"
            style={{ color: '#94a3b8' }}
          >
            {copied ? <Check className="w-3 h-3" style={{ color: '#22c55e' }} /> : <Copy className="w-3 h-3" />}
          </button>
        </div>

        {/* Date */}
        <span className="text-xs hidden sm:block" style={{ color: '#94a3b8' }}>{time}</span>

        {/* Notifications */}
        <div className="relative cursor-pointer">
          <Bell className="w-5 h-5" style={{ color: '#94a3b8' }} />
          <span 
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[10px] flex items-center justify-center font-bold"
            style={{ background: '#ef4444' }}
          >
            3
          </span>
        </div>

        {/* Profil utilisateur */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 px-2 py-1 rounded-lg transition hover:bg-white/5"
          >
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: '#4f46e5' }}
            >
              {mockUser.avatar}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-white leading-tight">{mockUser.name}</p>
              <p className="text-[10px]" style={{ color: '#94a3b8' }}>{mockUser.role}</p>
            </div>
            <ChevronDown className="w-4 h-4" style={{ color: '#94a3b8' }} />
          </button>

          {/* Dropdown Profil */}
          {isProfileOpen && (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileOpen(false)}
              />
              <div 
                className="absolute right-0 top-full mt-2 w-72 rounded-xl border shadow-xl z-50 overflow-hidden"
                style={{ 
                  background: '#1e293b',
                  borderColor: '#334155'
                }}
              >
                {/* En-tête profil */}
                <div 
                  className="p-4 border-b text-center"
                  style={{ borderColor: '#334155' }}
                >
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-2"
                    style={{ background: '#4f46e5' }}
                  >
                    {mockUser.avatar}
                  </div>
                  <p className="font-semibold text-white">{mockUser.name}</p>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>{mockUser.email}</p>
                  <span 
                    className="text-xs px-2 py-0.5 rounded-full inline-block mt-1"
                    style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}
                  >
                    {mockUser.plan}
                  </span>
                </div>

                {/* Infos entreprise */}
                <div 
                  className="p-3 border-b"
                  style={{ borderColor: '#334155' }}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4" style={{ color: '#64748b' }} />
                    <div>
                      <p className="text-white">{mockUser.company}</p>
                      <p className="text-xs" style={{ color: '#64748b' }}>ID: {mockUser.companyId}</p>
                    </div>
                  </div>
                </div>

                {/* Liens */}
                <div className="p-2">
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition hover:bg-white/5"
                    style={{ color: '#94a3b8' }}
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Paramètres
                  </Link>
                  <Link
                    href="/settings?tab=documents"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition hover:bg-white/5"
                    style={{ color: '#94a3b8' }}
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <FileText className="w-4 h-4" />
                    Documents
                  </Link>
                  <Link
                    href="/subscription"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition hover:bg-white/5"
                    style={{ color: '#94a3b8' }}
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <CreditCard className="w-4 h-4" />
                    Abonnement
                  </Link>
                  <button
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition w-full hover:bg-red-500/10"
                    style={{ color: '#f87171' }}
                    onClick={() => {
                      setIsProfileOpen(false)
                      window.location.href = '/login'
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}