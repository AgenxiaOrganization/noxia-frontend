'use client'

import { useState, useEffect } from 'react'
import {
  MessageCircle, Bot, CreditCard, Clock, Sparkles,
  Check, CheckCheck, Calendar, ArrowRight
} from 'lucide-react'
import { getNotifications, markAsRead, markAllAsRead, type Notification } from '@/lib/api/notifications'
import Loader from '@/components/ui/Loader'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

// --- Configuration des icônes et couleurs ---
const notifTypeConfig: Record<string, { icon: any; color: string; bgColor: string; label: string }> = {
  bot_linked: { icon: Bot, color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.15)', label: 'Intégration Bot' },
  sub_change: { icon: CreditCard, color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.15)', label: 'Abonnement' },
  sub_expiry: { icon: Clock, color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)', label: 'Expiration' },
  sub_reminder: { icon: Sparkles, color: '#a855f7', bgColor: 'rgba(168, 85, 247, 0.15)', label: 'Rappel' },
}

// --- Formatage de la date ---
function formatFullDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// --- Groupement par date relative ---
function getGroupLabel(dateString: string): string {
  const today = new Date()
  const date = new Date(dateString)
  
  const isSameDay = today.toDateString() === date.toDateString()
  if (isSameDay) return "Aujourd'hui"
  
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const isYesterday = yesterday.toDateString() === date.toDateString()
  if (isYesterday) return "Hier"
  
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  const loadNotifications = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true)
      const response = await getNotifications(1, 'notification')
      setNotifications(response.results || [])
    } catch (err) {
      console.error('Erreur lors du chargement des notifications', err)
      toast.error('Erreur lors de la récupération des notifications.')
    } finally {
      if (!silent) setIsLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const handleMarkRead = async (id: number) => {
    try {
      await markAsRead(id)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      )
      toast.success('Notification marquée comme lue')
    } catch (err) {
      console.error(err)
      toast.error('Impossible de marquer la notification comme lue.')
    }
  }

  const handleMarkAllRead = async () => {
    try {
      const markPromise = markAllAsRead('notification')
      toast.promise(markPromise, {
        loading: 'Marquage en cours...',
        success: 'Toutes les notifications ont été marquées comme lues.',
        error: 'Erreur lors du marquage des notifications.'
      })
      await markPromise
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (err) {
      console.error(err)
    }
  }

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.is_read) {
      await handleMarkRead(notif.id)
    }
    if (notif.link) {
      router.push(notif.link)
    }
  }

  // Filtrage local
  const filteredNotifs = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read
    if (filter === 'read') return n.is_read
    return true
  })

  // Groupement par date
  const groups: Record<string, Notification[]> = {}
  filteredNotifs.forEach(n => {
    const label = getGroupLabel(n.created_at)
    if (!groups[label]) groups[label] = []
    groups[label].push(n)
  })

  const unreadCount = notifications.filter(n => !n.is_read).length

  if (isLoading) {
    return <Loader />
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-primary-400" style={{ color: '#818cf8' }} />
            Notifications
          </h1>
          <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
            Suivez l'activité de votre établissement (abonnements, bots, et intégrations)
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition bg-primary-500/10 hover:bg-primary-500/20"
            style={{ color: '#818cf8', border: '1px solid rgba(129, 140, 248, 0.2)' }}
          >
            <CheckCheck className="w-4 h-4" />
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* FILTRES & STATS */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border"
        style={{ background: '#1e293b', borderColor: '#334155' }}
      >
        <div className="flex gap-2">
          {(['all', 'unread', 'read'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === tab
                  ? 'bg-primary-500/20 text-primary-400 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              style={filter === tab ? { color: '#818cf8', background: 'rgba(129, 140, 248, 0.15)' } : {}}
            >
              {tab === 'all' && 'Toutes'}
              {tab === 'unread' && `Non lues (${unreadCount})`}
              {tab === 'read' && 'Déjà lues'}
            </button>
          ))}
        </div>
        
        <div className="text-xs" style={{ color: '#64748b' }}>
          Total : {notifications.length} notification{notifications.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* LISTE DES NOTIFICATIONS */}
      {filteredNotifs.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 border rounded-xl"
          style={{ background: '#1e293b', borderColor: '#334155' }}
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-slate-800">
            <MessageCircle className="w-6 h-6 text-slate-500" />
          </div>
          <p className="text-sm font-semibold text-white">Aucune notification</p>
          <p className="text-xs mt-1 text-slate-500">
            Vous n'avez pas de notifications correspondant à votre filtre actuel.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groups).map(([groupLabel, notifs]) => (
            <div key={groupLabel} className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
                <Calendar className="w-3.5 h-3.5" />
                {groupLabel}
              </div>

              <div
                className="rounded-xl border overflow-hidden divide-y"
                style={{ background: '#1e293b', borderColor: '#334155' }}
              >
                {notifs.map((notif) => {
                  const config = notifTypeConfig[notif.type] || {
                    icon: MessageCircle,
                    color: '#818cf8',
                    bgColor: 'rgba(129, 140, 248, 0.15)',
                    label: 'Système'
                  }
                  const Icon = config.icon

                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className="group p-4 flex gap-4 transition cursor-pointer hover:bg-white/5"
                      style={{
                        background: notif.is_read ? 'transparent' : 'rgba(129, 140, 248, 0.03)'
                      }}
                    >
                      {/* Icône */}
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: config.bgColor }}
                      >
                        <Icon className="w-5 h-5" style={{ color: config.color }} />
                      </div>

                      {/* Corps */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}
                          >
                            {config.label}
                          </span>
                          
                          <span className="text-[10px]" style={{ color: '#475569' }}>
                            {formatFullDate(notif.created_at)}
                          </span>

                          {!notif.is_read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" style={{ background: '#818cf8' }} />
                          )}
                        </div>

                        <h3
                          className={`text-sm ${notif.is_read ? 'font-medium text-slate-300' : 'font-bold text-white'}`}
                        >
                          {notif.title}
                        </h3>

                        <p className="text-xs text-slate-400 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>

                      {/* Actions/Liens */}
                      <div className="flex items-center shrink-0">
                        {notif.link ? (
                          <div
                            className="p-2 rounded-lg transition opacity-60 group-hover:opacity-100 bg-white/5 hover:bg-white/10"
                            title="Naviguer"
                          >
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition" />
                          </div>
                        ) : (
                          !notif.is_read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMarkRead(notif.id)
                              }}
                              className="p-2 rounded-lg transition hover:bg-white/5 text-slate-500 hover:text-white"
                              title="Marquer comme lu"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RAPPEL PREMIUM */}
      <div
        className="p-5 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 overflow-hidden relative"
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
          borderColor: 'rgba(129, 140, 248, 0.3)'
        }}
      >
        <div className="space-y-1 text-center md:text-left z-10">
          <h4 className="font-bold text-white flex items-center justify-center md:justify-start gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Passez à l'Abonnement Business
          </h4>
          <p className="text-xs text-slate-300 max-w-xl">
            Débloquez la messagerie WhatsApp & Telegram illimitée, la gestion multi-caisses avancée, des rapports financiers automatisés, et un assistant IA à votre disposition 24/7.
          </p>
        </div>
        <button
          onClick={() => router.push('/subscription')}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-95 shrink-0 z-10"
          style={{ background: '#4f46e5' }}
        >
          Voir les plans d'abonnement
        </button>
        {/* Cercles de fond décoratifs */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-purple-500/5 blur-2xl pointer-events-none" />
      </div>
    </div>
  )
}
