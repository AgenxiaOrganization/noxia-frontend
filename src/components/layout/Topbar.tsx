'use client'

import { useState, useEffect } from 'react'
import { Menu, User, LogOut, Settings, Building2, FileText, CreditCard, ChevronDown, Copy, Check, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { getUser, getCompany, getMembership, clearSession, saveSession } from '@/lib/auth'
import { getMe } from '@/lib/api'
import { getMySubscription, type Subscription } from '@/lib/api/subscription'
import { NotificationBell } from './NotificationBell'
import { NotificationIcon } from './NotificationIcon'

const SUBSCRIPTION_STATUS_LABELS: Record<Subscription['status'], { label: string; color: string }> = {
  trialing: { label: 'Essai', color: '#3b82f6' },
  active: { label: 'Actif', color: '#22c55e' },
  expired: { label: 'Expiré', color: '#ef4444' },
  canceled: { label: 'Annulé', color: '#64748b' },
}

/** Jours restants avant `trial_end`/`current_period_end` — null si deja
 * expire ou si aucune date de fin n'existe. */
function daysRemaining(dateStr: string | null): number | null {
  if (!dateStr) return null
  const diffMs = new Date(dateStr).getTime() - Date.now()
  if (diffMs <= 0) return 0
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}



export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const [time, setTime] = useState('')
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showCompanyId, setShowCompanyId] = useState(false)
  const [showEmployeeId, setShowEmployeeId] = useState(false)

  const [activeTheme, setActiveTheme] = useState('indigo')
  const [activeBg, setActiveBg] = useState('slate')

  useEffect(() => {
    const savedTheme = localStorage.getItem('noxia_theme') || 'indigo'
    const savedBg = localStorage.getItem('noxia_bg') || 'slate'
    setActiveTheme(savedTheme)
    setActiveBg(savedBg)
    
    // Écouteur pour synchroniser les changements de thèmes
    const handleStorageChange = () => {
      setActiveTheme(localStorage.getItem('noxia_theme') || 'indigo')
      setActiveBg(localStorage.getItem('noxia_bg') || 'slate')
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const changeTheme = (themeName: string) => {
    const root = document.documentElement
    root.classList.remove('theme-indigo', 'theme-emerald', 'theme-ocean', 'theme-white-pure', 'theme-white-soft')
    if (themeName !== 'indigo') {
      root.classList.add(`theme-${themeName}`)
    }
    localStorage.setItem('noxia_theme', themeName)
    setActiveTheme(themeName)
    window.dispatchEvent(new Event('storage'))
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, 100)
  }

  const changeBg = (bgName: string) => {
    const root = document.documentElement
    root.classList.remove('bg-slate', 'bg-oled', 'bg-abysse', 'bg-white-pure', 'bg-white-soft')
    if (bgName !== 'slate') {
      root.classList.add(`bg-${bgName}`)
    }
    localStorage.setItem('noxia_bg', bgName)
    setActiveBg(bgName)
    window.dispatchEvent(new Event('storage'))
  }

  const [userData, setUserData] = useState({
    name: 'Chargement...',
    email: '',
    role: '',
    avatar: '',
    company: 'Chargement...',
    companyId: '---',    // ID de l'établissement (10 caractères, messaging_code)
    employeeId: '---',   // ID de l'employé (6 caractères, activation_code)
    photoProfile: null as string | null,
  })
  const [subscription, setSubscription] = useState<Subscription | null>(null)

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
          photoProfile: memb?.photo_profile ?? null,
        })
      }

      // La photo de profil peut avoir change depuis le dernier login (session
      // en localStorage potentiellement ancienne) — un rafraichissement
      // silencieux garantit qu'elle reste a jour sans attendre une
      // reconnexion complete.
      try {
        const fresh = await getMe()
        if (fresh.membership) {
          setUserData((prev) => ({ ...prev, photoProfile: fresh.membership!.photo_profile ?? null }))
        }
      } catch {
        // Silencieux : l'avatar reste sur la valeur de session si le rafraichissement echoue.
      }
    }

    loadUser()
    getMySubscription().then(setSubscription).catch((e) => console.error('Erreur chargement abonnement (topbar)', e))
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
      className="h-14 border-b border-dark-800/60 flex items-center justify-between px-4 sm:px-6 shrink-0 relative z-20 backdrop-blur-md bg-dark-950/70"
    >
      {/* Gauche */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick} 
          className="md:hidden text-dark-300 hover:text-white hover:bg-white/5 p-1.5 rounded-lg transition"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <span className="font-display font-black text-sm tracking-widest bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent select-none animate-pulse">
            NOXIA
          </span>
          <span className="hidden sm:inline text-xs text-dark-500 font-semibold border-l border-dark-800/40 pl-3 select-none">
            Tableau de bord
          </span>
        </div>
      </div>

      {/* Double Sélecteur Intégré Globalement dans la Topbar */}
      <div className="hidden md:flex items-center gap-2">
        {/* Sélecteur de Thèmes (Accent / Police) */}
        <div className="flex items-center gap-1 bg-dark-900/60 px-2 py-1 rounded-lg border border-dark-800/40 backdrop-blur-sm" title="Couleur de police">
          <span className="text-[8px] uppercase tracking-wider font-extrabold text-dark-400 select-none mr-1.5">Police</span>
          {[
            { id: 'indigo', label: 'Indigo Royal', color: 'from-indigo-500 to-indigo-600' },
            { id: 'emerald', label: 'Émeraude Sauvage', color: 'from-emerald-500 to-emerald-600' },
            { id: 'ocean', label: 'Bleu Océan', color: 'from-sky-500 to-sky-600' },
            { id: 'white-pure', label: 'Blanc Pur', color: 'from-white to-white-soft border border-dark-300/30' },
            { id: 'white-soft', label: 'Blanc Doux', color: 'from-dark-200 to-dark-400 border border-dark-300/30' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => changeTheme(t.id)}
              className={`w-3.5 h-3.5 rounded-full bg-gradient-to-br ${t.color} transition-all duration-200 hover:scale-110 relative ${
                activeTheme === t.id 
                  ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-950 scale-105 shadow-lg' 
                  : 'opacity-70 hover:opacity-100'
              }`}
              title={`Couleur de police : ${t.label}`}
            />
          ))}
        </div>

            {/* Sélecteur d'Arrière-plans */}
            <div className="flex items-center gap-1 bg-dark-900/60 px-2 py-1 rounded-lg border border-dark-800/40 backdrop-blur-sm" title="Background">
              <span className="text-[8px] uppercase tracking-wider font-extrabold text-dark-400 select-none mr-1.5">Fond</span>
              {[
                { id: 'slate', label: 'Ardoise', color: 'bg-dark-950 border border-dark-800' },
                { id: 'oled', label: 'Noir OLED', color: 'bg-[#000000] border border-dark-900' },
                { id: 'abysse', label: 'Bleu Abysse', color: 'bg-[#050b1a] border border-blue-950/40' },
                { id: 'white-pure', label: 'Blanc Neige', color: 'bg-[#ffffff] border border-dark-300' },
                { id: 'white-soft', label: 'Gris Doux', color: 'bg-[#f1f5f9] border border-dark-300' }
              ].map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => changeBg(bg.id)}
                  className={`w-3.5 h-3.5 rounded-md ${bg.color} transition-all duration-200 hover:scale-110 relative ${
                    activeBg === bg.id 
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-950 scale-105 shadow-lg' 
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  title={`Background : ${bg.label}`}
                />
              ))}
            </div>
          </div>

      {/* Droite */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-dark-900/50 border border-dark-800/50">
          <span className="text-xs text-dark-400">ID Établissement:</span>
          <code className="text-xs font-mono font-semibold text-primary-400">
            {showCompanyId ? userData.companyId : '*************'}
          </code>
          <button
            onClick={() => setShowCompanyId(!showCompanyId)}
            className="p-1 rounded hover:bg-white/5 text-dark-400 hover:text-white transition"
            title={showCompanyId ? "Masquer" : "Afficher"}
          >
            {showCompanyId ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
          <button
            onClick={copyCompanyId}
            className="p-1 rounded hover:bg-white/5 text-dark-400 hover:text-white transition"
            title="Copier"
          >
            {copied ? <Check className="w-3 h-3 text-accent-500" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>

        {/* Date/Heure */}
        <span className="text-xs font-medium text-dark-400 hidden sm:block">{time}</span>

        {/* Notifications et Alertes en temps réel */}
        <div className="flex items-center gap-1">
          <NotificationIcon />
          <NotificationBell />
        </div>

        {/* Profil utilisateur */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition hover:bg-white/[0.04] group"
          >
            {userData.photoProfile ? (
              <img src={userData.photoProfile} alt={userData.name} className="w-8 h-8 rounded-full object-cover shadow-md" />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-primary-500 to-indigo-600 shadow-md"
              >
                {userData.avatar}
              </div>
            )}
            <ChevronDown className="w-4 h-4 text-dark-300 transition-transform duration-200 group-hover:text-white" />
          </button>

          {/* Dropdown Profil */}
          {isProfileOpen && (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileOpen(false)}
              />
              <div 
                className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-dark-800/80 shadow-2xl z-50 overflow-hidden bg-dark-900"
              >
                {/* En-tête profil */}
                <div 
                  className="p-5 border-b border-dark-800/60 text-center"
                >
                  {userData.photoProfile ? (
                    <img src={userData.photoProfile} alt={userData.name} className="w-16 h-16 rounded-full object-cover mx-auto mb-2.5 shadow-lg" />
                  ) : (
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-2.5 bg-gradient-to-br from-primary-500 to-indigo-600 shadow-lg"
                    >
                      {userData.avatar}
                    </div>
                  )}
                  <p className="font-semibold text-white text-base tracking-tight">{userData.name}</p>
                  <p className="text-xs text-dark-400 mt-0.5">{userData.email}</p>
                  {subscription && (
                    <div className="flex items-center justify-center gap-1.5 mt-2 flex-wrap">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full inline-block bg-primary-500/10 text-primary-400 border border-primary-500/15">
                        {subscription.plan.name}
                      </span>
                      <span
                        className="text-[10px] font-bold px-2.5 py-1 rounded-full inline-block"
                        style={{
                          background: `${SUBSCRIPTION_STATUS_LABELS[subscription.status].color}20`,
                          color: SUBSCRIPTION_STATUS_LABELS[subscription.status].color,
                        }}
                      >
                        {SUBSCRIPTION_STATUS_LABELS[subscription.status].label}
                      </span>
                    </div>
                  )}
                  {subscription && (() => {
                    const endDate = subscription.current_period_end ?? subscription.trial_end
                    const days = daysRemaining(endDate)
                    if (days === null || subscription.status === 'canceled') return null
                    return (
                      <p className="text-[11px] mt-1.5" style={{ color: days <= 3 ? '#ef4444' : '#94a3b8' }}>
                        {days === 0
                          ? "Expire aujourd'hui"
                          : `${days} jour${days > 1 ? 's' : ''} restant${days > 1 ? 's' : ''} avant ${subscription.status === 'trialing' ? "la fin de l'essai" : 'le renouvellement'}`}
                      </p>
                    )
                  })()}
                </div>

                {/* Infos entreprise */}
                <div 
                  className="p-4 border-b border-dark-800/60 space-y-3"
                >
                  <div className="flex items-center gap-3 text-sm">
                    <Building2 className="w-[18px] h-[18px] text-dark-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-white font-medium truncate">{userData.company}</p>
                      <p className="text-xs flex items-center gap-1 text-dark-400 mt-0.5">
                        ID Établissement: 
                        <code className="text-primary-400 font-mono font-semibold">{showCompanyId ? userData.companyId : '*************'}</code>
                        <button onClick={(e) => { e.stopPropagation(); setShowCompanyId(!showCompanyId); }} className="hover:text-white transition">
                          {showCompanyId ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <User className="w-[18px] h-[18px] text-dark-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-white font-medium truncate">Votre compte ({userData.role})</p>
                      <p className="text-xs flex items-center gap-1 text-dark-400 mt-0.5">
                        ID Employé: 
                        <code className="text-primary-400 font-mono font-semibold">{showEmployeeId ? userData.employeeId : '**********'}</code>
                        <button onClick={(e) => { e.stopPropagation(); setShowEmployeeId(!showEmployeeId); }} className="hover:text-white transition">
                          {showEmployeeId ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Liens */}
                <div className="p-2 space-y-0.5">
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition text-dark-300 hover:bg-white/[0.04] hover:text-white"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings className="w-4 h-4 text-dark-400" />
                    Paramètres
                  </Link>
                  <Link
                    href="/settings?tab=documents"
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition text-dark-300 hover:bg-white/[0.04] hover:text-white"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <FileText className="w-4 h-4 text-dark-400" />
                    Documents
                  </Link>
                  <Link
                    href="/subscription"
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition text-dark-300 hover:bg-white/[0.04] hover:text-white"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <CreditCard className="w-4 h-4 text-dark-400" />
                    Abonnement
                  </Link>
                  <button
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition w-full text-left text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    onClick={() => {
                      setIsProfileOpen(false)
                      clearSession()
                      window.location.href = '/login'
                    }}
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
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