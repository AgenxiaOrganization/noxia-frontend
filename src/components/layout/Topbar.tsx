'use client'

import { useState, useEffect } from 'react'
import { Menu, User, LogOut, Settings, Building2, FileText, CreditCard, ChevronDown, Copy, Check, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { getUser, getCompany, getMembership, clearSession, saveSession } from '@/lib/auth'
import { getMe } from '@/lib/api'
import { NotificationBell } from './NotificationBell'
import { NotificationIcon } from './NotificationIcon'



export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const [time, setTime] = useState('')
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showCompanyId, setShowCompanyId] = useState(false)
  const [showEmployeeId, setShowEmployeeId] = useState(false)

  const [userData, setUserData] = useState({
    name: 'Chargement...',
    email: '',
    role: '',
    avatar: '',
    company: 'Chargement...',
    companyId: '---',    // ID de l'établissement (10 caractères, messaging_code)
    employeeId: '---',   // ID de l'employé (6 caractères, activation_code)
    plan: 'Essai gratuit',
  })

  useEffect(() => {
    const loadUser = async () => {
      let user = getUser()
      let comp = getCompany()
      let memb = getMembership()

      // Si l'utilisateur est là mais qu'il manque l'entreprise (cas d'une ancienne session),
      // on force le chargement depuis le serveur !
      if (user && (!comp || !comp.messaging_code)) {
        try {
          const freshData = await getMe()
          if (freshData.company) {
            // Reconstruit la session (les tokens ne sont pas touchés)
            const accessToken = localStorage.getItem('noxia_access') || ''
            const refreshToken = localStorage.getItem('noxia_refresh') || ''
            saveSession({
              status: 'authenticated',
              access: accessToken,
              refresh: refreshToken,
              user: freshData.user,
              company: freshData.company,
              membership: freshData.membership,
            })
            user = freshData.user
            comp = freshData.company
            memb = freshData.membership
          }
        } catch (err) {
          console.error("Erreur récupération session", err)
        }
      }

      if (user) {
        setUserData({
          name: `${user.first_name} ${user.last_name}`.trim() || user.email,
          email: user.email,
          role: memb?.role || 'Employé',
          avatar: (user.first_name?.[0] || user.email[0]).toUpperCase(),
          company: comp?.name || 'Mon Entreprise',
          companyId: comp?.messaging_code || '---',
          employeeId: memb?.activation_code || '---',
          plan: comp?.verification_status === 'verified' ? 'Premium' : 'Essai 30j',
        })
      }
    }

    loadUser()
  }, [])

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

  const copyCompanyId = () => {
    navigator.clipboard.writeText(userData.companyId)
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
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
          <span className="text-xs" style={{ color: '#94a3b8' }}>ID Établissement:</span>
          <code className="text-xs font-mono" style={{ color: '#818cf8' }}>
            {showCompanyId ? userData.companyId : '*************'}
          </code>
          <button
            onClick={() => setShowCompanyId(!showCompanyId)}
            className="p-0.5 rounded hover:bg-white/10 transition"
            style={{ color: '#94a3b8' }}
            title={showCompanyId ? "Masquer" : "Afficher"}
          >
            {showCompanyId ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
          <button
            onClick={copyCompanyId}
            className="p-0.5 rounded hover:bg-white/10 transition"
            style={{ color: '#94a3b8' }}
            title="Copier"
          >
            {copied ? <Check className="w-3 h-3" style={{ color: '#22c55e' }} /> : <Copy className="w-3 h-3" />}
          </button>
        </div>

        {/* Date/Heure */}
        <span className="text-xs hidden sm:block" style={{ color: '#94a3b8' }}>{time}</span>

        {/* Notifications et Alertes en temps réel */}
        <div className="flex items-center gap-1">
          <NotificationIcon />
          <NotificationBell />
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
              {userData.avatar}
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
                    {userData.avatar}
                  </div>
                  <p className="font-semibold text-white">{userData.name}</p>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>{userData.email}</p>
                  <span 
                    className="text-xs px-2 py-0.5 rounded-full inline-block mt-1"
                    style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}
                  >
                    {userData.plan}
                  </span>
                </div>

                {/* Infos entreprise */}
                <div 
                  className="p-3 border-b"
                  style={{ borderColor: '#334155' }}
                >
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <Building2 className="w-4 h-4" style={{ color: '#64748b' }} />
                    <div>
                      <p className="text-white">{userData.company}</p>
                      <p className="text-xs flex items-center gap-1" style={{ color: '#64748b' }}>
                        ID Établissement: 
                        <code style={{ color: '#818cf8' }}>{showCompanyId ? userData.companyId : '*************'}</code>
                        <button onClick={(e) => { e.stopPropagation(); setShowCompanyId(!showCompanyId); }} className="hover:text-white transition">
                          {showCompanyId ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4" style={{ color: '#64748b' }} />
                    <div>
                      <p className="text-white">Votre compte ({userData.role})</p>
                      <p className="text-xs flex items-center gap-1" style={{ color: '#64748b' }}>
                        ID Employé: 
                        <code style={{ color: '#818cf8' }}>{showEmployeeId ? userData.employeeId : '**********'}</code>
                        <button onClick={(e) => { e.stopPropagation(); setShowEmployeeId(!showEmployeeId); }} className="hover:text-white transition">
                          {showEmployeeId ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </p>
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
                      clearSession()
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