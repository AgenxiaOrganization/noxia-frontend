'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Package, AlertTriangle, CheckCheck, Trash2 } from 'lucide-react'
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

// --- Icône et couleur par type d'alerte ---
const alertTypeConfig: Record<string, { icon: typeof Bell; color: string; bgColor: string }> = {
  stock_low: { icon: AlertTriangle, color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' },
  stock_out: { icon: Package, color: '#f43f5e', bgColor: 'rgba(244, 63, 94, 0.15)' },
}

// --- Formatage de la date relative ---
function timeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) return "À l'instant"
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)}j`
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

/**
 * Cloche d'alertes 🔔 — n'affiche que les alertes (category=alert).
 */
export function NotificationBell() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [alerts, setAlerts] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const loadUnreadCount = useCallback(async () => {
    try {
      const data = await getUnreadCount('alert')
      setUnreadCount(data.count)
    } catch (err) {
      console.error('Erreur chargement compteur alertes', err)
    }
  }, [])

  // --- Chargement du compteur + Écouteur d'événements globaux ---
  useEffect(() => {
    loadUnreadCount()
    const handleUpdate = () => loadUnreadCount()
    window.addEventListener('notifications_updated', handleUpdate)
    return () => window.removeEventListener('notifications_updated', handleUpdate)
  }, [loadUnreadCount])

  // --- Chargement des alertes quand le dropdown s'ouvre ---
  useEffect(() => {
    if (!isOpen) return
    const load = async () => {
      setIsLoading(true)
      try {
        const response = await getNotifications(1, 'alert')
        const items = ensureArray<Notification>(response)
        setAlerts(items)
        loadUnreadCount()
      } catch (err) {
        console.error('Erreur chargement alertes', err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [isOpen, loadUnreadCount])

  // --- WebSocket ---
  const handleWsMessage = useCallback((data: { type: string; notification: Notification }) => {
    if (data.type === 'new_notification' && data.notification.category === 'alert') {
      setAlerts(prev => [data.notification, ...prev])
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
  const handleAlertClick = async (alert: Notification) => {
    if (!alert.is_read) {
      try {
        await markAsRead(alert.id)
        setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, is_read: true } : a))
        setUnreadCount(prev => Math.max(0, prev - 1))
        window.dispatchEvent(new Event('notifications_updated'))
      } catch (err) {
        console.error('Erreur marquage alerte', err)
      }
    }
    setIsOpen(false)
    if (alert.link) router.push(alert.link)
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead('alert')
      setAlerts(prev => prev.map(a => ({ ...a, is_read: true })))
      setUnreadCount(0)
      window.dispatchEvent(new Event('notifications_updated'))
    } catch (err) {
      console.error('Erreur marquage toutes alertes', err)
    }
  }

  const handleDeleteAlert = async (e: React.MouseEvent, alert: Notification) => {
    e.stopPropagation()
    try {
      await deleteNotification(alert.id)
      setAlerts(prev => prev.filter(a => a.id !== alert.id))
      if (!alert.is_read) setUnreadCount(prev => Math.max(0, prev - 1))
      window.dispatchEvent(new Event('notifications_updated'))
    } catch (err) {
      console.error('Erreur suppression alerte', err)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton cloche alertes */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl transition-all duration-200 hover:bg-white/[0.06] active:scale-95 flex items-center justify-center"
        aria-label="Alertes"
        title="Alertes"
      >
        <Bell className="w-5 h-5 text-dark-300 hover:text-white transition-colors" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full text-white text-[10px] flex items-center justify-center font-bold px-1 shadow-lg bg-rose-500 ring-2 ring-dark-950"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown des alertes - CENTRÉ et RESPONSIVE (comme NotificationIcon) */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-[400px] rounded-2xl border border-dark-700/80 bg-dark-900/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden"
            >
              {/* En-tête */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-dark-800/80 bg-dark-950/40">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                    <Bell className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-sm font-bold text-white tracking-wide">Alertes</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      {unreadCount} critique{unreadCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1.5 text-xs font-medium text-dark-300 hover:text-amber-400 transition-colors px-2 py-1 rounded-lg hover:bg-white/[0.05]"
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
                    <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-dark-800/60 flex items-center justify-center mb-3 border border-dark-700/50">
                      <Bell className="w-6 h-6 text-dark-400" />
                    </div>
                    <p className="text-sm font-semibold text-white">Aucune alerte</p>
                    <p className="text-xs text-dark-400 mt-1">Tous les stocks sont au niveau optimal !</p>
                  </div>
                ) : (
                  alerts.map((alert) => {
                    const config = alertTypeConfig[alert.type] || alertTypeConfig.stock_low
                    const Icon = config.icon
                    return (
                      <div
                        key={alert.id}
                        className={`group w-full flex items-start gap-3 px-4 py-3 transition-all duration-150 hover:bg-white/[0.04] relative ${
                          alert.is_read ? 'bg-transparent' : 'bg-amber-500/[0.04]'
                        }`}
                      >
                        {!alert.is_read && (
                          <span className="absolute left-0 top-3 bottom-3 w-1 bg-amber-500 rounded-r-full" />
                        )}
                        <button onClick={() => handleAlertClick(alert)} className="flex items-start gap-3 flex-1 min-w-0 text-left">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border border-white/5 shadow-sm"
                            style={{ background: config.bgColor }}
                          >
                            <Icon className="w-4.5 h-4.5" style={{ color: config.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`text-sm truncate ${alert.is_read ? 'font-medium text-dark-200' : 'font-bold text-white'}`}>
                                {alert.title}
                              </p>
                              <span className="text-[10px] text-dark-400 shrink-0 font-medium">{timeAgo(alert.created_at)}</span>
                            </div>
                            <p className="text-xs text-dark-300 mt-1 line-clamp-2 leading-relaxed">{alert.message}</p>
                          </div>
                        </button>
                        <button
                          onClick={(e) => handleDeleteAlert(e, alert)}
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
              {alerts.length > 0 && (
                <button
                  onClick={() => { setIsOpen(false); router.push('/alerts') }}
                  className="w-full text-center py-2.5 text-xs font-semibold text-amber-400 hover:text-amber-300 hover:bg-white/[0.04] transition-colors border-t border-dark-800/80 bg-dark-950/40"
                >
                  Voir toutes les alertes →
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}