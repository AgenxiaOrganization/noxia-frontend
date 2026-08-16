'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, Bot, CreditCard, Clock, Sparkles, Check, CheckCheck, ShoppingBag, FileCheck, FileX, ShieldCheck, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  type Notification,
} from '@/lib/api/notifications'
import { ensureArray } from '@/lib/api'
import { useWebSockets } from '@/lib/hooks/useWebSockets'

// --- Icône et couleur par type de notification ---
const notifTypeConfig: Record<string, { icon: typeof MessageCircle; color: string; bgColor: string }> = {
  bot_linked: { icon: Bot, color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)' },
  sub_change: { icon: CreditCard, color: '#6366f1', bgColor: 'rgba(99, 102, 241, 0.15)' },
  sub_expiry: { icon: Clock, color: '#f43f5e', bgColor: 'rgba(244, 63, 94, 0.15)' },
  sub_reminder: { icon: Sparkles, color: '#a855f7', bgColor: 'rgba(168, 85, 247, 0.15)' },
  sale_completed: { icon: ShoppingBag, color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)' },
  doc_approved: { icon: FileCheck, color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.15)' },
  doc_rejected: { icon: FileX, color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)' },
  company_certified: { icon: ShieldCheck, color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.15)' },
}

// --- Formatage de la date relative ---
function timeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) return 'À l\'instant'
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)}j`
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

/**
 * Icône notifications 💬 — n'affiche que les notifications (category=notification).
 */
export function NotificationIcon() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const loadUnreadCount = useCallback(async () => {
    try {
      const data = await getUnreadCount('notification')
      setUnreadCount(data.count)
    } catch (err) {
      console.error('Erreur chargement compteur notifications', err)
    }
  }, [])

  // --- Chargement du compteur + Écouteur d'événements globaux ---
  useEffect(() => {
    loadUnreadCount()
    const handleUpdate = () => loadUnreadCount()
    window.addEventListener('notifications_updated', handleUpdate)
    return () => window.removeEventListener('notifications_updated', handleUpdate)
  }, [loadUnreadCount])

  // --- Chargement des notifications quand le dropdown s'ouvre ---
  useEffect(() => {
    if (!isOpen) return
    const load = async () => {
      setIsLoading(true)
      try {
        const response = await getNotifications(1, 'notification')
        const items = ensureArray<Notification>(response)
        setNotifications(items)
        loadUnreadCount()
      } catch (err) {
        console.error('Erreur chargement notifications', err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [isOpen, loadUnreadCount])

  // --- WebSocket ---
  const handleWsMessage = useCallback((data: { type: string; notification: Notification }) => {
    if (data.type === 'new_notification' && data.notification.category === 'notification') {
      setNotifications(prev => [data.notification, ...prev])
      setUnreadCount(prev => prev + 1)
      window.dispatchEvent(new Event('notifications_updated'))
    }
  }, [])

  useWebSockets<{ type: string; notification: Notification }>(
    '/ws/notifications/',
    handleWsMessage
  )

  // --- Fermeture au clic extérieur ---
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // --- Actions ---
  const handleNotifClick = async (notif: Notification) => {
    if (!notif.is_read) {
      try {
        await markAsRead(notif.id)
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))
        window.dispatchEvent(new Event('notifications_updated'))
      } catch (err) {
        console.error('Erreur marquage notification', err)
      }
    }
    setIsOpen(false)
    if (notif.link) router.push(notif.link)
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead('notification')
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
      window.dispatchEvent(new Event('notifications_updated'))
    } catch (err) {
      console.error('Erreur marquage toutes notifications', err)
    }
  }

  const handleDeleteNotif = async (e: React.MouseEvent, notif: Notification) => {
    e.stopPropagation()
    try {
      await deleteNotification(notif.id)
      setNotifications(prev => prev.filter(n => n.id !== notif.id))
      if (!notif.is_read) setUnreadCount(prev => Math.max(0, prev - 1))
      window.dispatchEvent(new Event('notifications_updated'))
    } catch (err) {
      console.error('Erreur suppression notification', err)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton notifications */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl transition-all duration-200 hover:bg-white/[0.06] active:scale-95 flex items-center justify-center"
        aria-label="Notifications"
        title="Notifications"
      >
        <MessageCircle className="w-5 h-5 text-dark-300 hover:text-white transition-colors" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full text-white text-[10px] flex items-center justify-center font-bold px-1 shadow-lg bg-indigo-500 ring-2 ring-dark-950"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown des notifications */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-dark-700/80 bg-dark-900/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden"
            >
              {/* En-tête */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-dark-800/80 bg-dark-950/40">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <MessageCircle className="w-4 h-4 text-indigo-400" />
                  </div>
                  <span className="text-sm font-bold text-white tracking-wide">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1.5 text-xs font-medium text-dark-300 hover:text-indigo-400 transition-colors px-2 py-1 rounded-lg hover:bg-white/[0.05]"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Tout lire
                  </button>
                )}
              </div>

              {/* Liste scrollable */}
              <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-dark-700 scrollbar-track-transparent divide-y divide-dark-800/50">
                {isLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-dark-800/60 flex items-center justify-center mb-3 border border-dark-700/50">
                      <MessageCircle className="w-6 h-6 text-dark-400" />
                    </div>
                    <p className="text-sm font-semibold text-white">Aucune notification</p>
                    <p className="text-xs text-dark-400 mt-1">Vous êtes totalement à jour !</p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const config = notifTypeConfig[notif.type] || notifTypeConfig.bot_linked
                    const Icon = config.icon
                    return (
                      <div
                        key={notif.id}
                        className={`group w-full flex items-start gap-3 px-4 py-3 transition-all duration-150 hover:bg-white/[0.04] relative ${
                          notif.is_read ? 'bg-transparent' : 'bg-indigo-500/[0.04]'
                        }`}
                      >
                        {!notif.is_read && (
                          <span className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-500 rounded-r-full" />
                        )}
                        <button onClick={() => handleNotifClick(notif)} className="flex items-start gap-3 flex-1 min-w-0 text-left">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border border-white/5 shadow-sm"
                            style={{ background: config.bgColor }}
                          >
                            <Icon className="w-4.5 h-4.5" style={{ color: config.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`text-sm truncate ${notif.is_read ? 'font-medium text-dark-200' : 'font-bold text-white'}`}>
                                {notif.title}
                              </p>
                              <span className="text-[10px] text-dark-400 shrink-0 font-medium">{timeAgo(notif.created_at)}</span>
                            </div>
                            <p className="text-xs text-dark-300 mt-1 line-clamp-2 leading-relaxed">{notif.message}</p>
                          </div>
                        </button>
                        <button
                          onClick={(e) => handleDeleteNotif(e, notif)}
                          className="p-1.5 rounded-lg shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition hover:bg-red-500/10 text-dark-400 hover:text-red-400"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Pied de page */}
              {notifications.length > 0 && (
                <button
                  onClick={() => { setIsOpen(false); router.push('/notifications') }}
                  className="w-full text-center py-2.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-white/[0.04] transition-colors border-t border-dark-800/80 bg-dark-950/40"
                >
                  Voir toutes les notifications →
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
