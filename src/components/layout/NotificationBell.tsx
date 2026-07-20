'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Package, AlertTriangle, Check, CheckCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  type Notification,
} from '@/lib/api/notifications'
import { useWebSockets } from '@/lib/hooks/useWebSockets'

// --- Icône et couleur par type d'alerte ---
const alertTypeConfig: Record<string, { icon: typeof Bell; color: string; bgColor: string }> = {
  stock_low: { icon: AlertTriangle, color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' },
  stock_out: { icon: Package, color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)' },
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
 * Cloche d'alertes 🔔 — n'affiche que les alertes (category=alert).
 * Stock bas, rupture de stock, événements critiques.
 */
export function NotificationBell() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [alerts, setAlerts] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // --- Chargement initial du compteur d'alertes ---
  useEffect(() => {
    const loadCount = async () => {
      try {
        const data = await getUnreadCount('alert')
        setUnreadCount(data.count)
      } catch (err) {
        console.error('Erreur chargement compteur alertes', err)
      }
    }
    loadCount()
  }, [])

  // --- Chargement des alertes quand le dropdown s'ouvre ---
  useEffect(() => {
    if (!isOpen) return
    const load = async () => {
      setIsLoading(true)
      try {
        const data = await getNotifications(1, 'alert')
        setAlerts(data.results)
      } catch (err) {
        console.error('Erreur chargement alertes', err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [isOpen])

  // --- WebSocket : ne traiter que les alertes ---
  const handleWsMessage = useCallback((data: { type: string; notification: Notification }) => {
    if (data.type === 'new_notification' && data.notification.category === 'alert') {
      setAlerts(prev => [data.notification, ...prev])
      setUnreadCount(prev => prev + 1)
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
    } catch (err) {
      console.error('Erreur marquage toutes alertes', err)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton cloche alertes */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 rounded-lg transition hover:bg-white/10"
        aria-label="Alertes"
        title="Alertes"
      >
        <Bell className="w-5 h-5" style={{ color: '#94a3b8' }} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full text-white text-[10px] flex items-center justify-center font-bold px-1"
              style={{ background: '#ef4444' }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown des alertes */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border shadow-2xl z-50 overflow-hidden"
              style={{ background: '#1e293b', borderColor: '#334155' }}
            >
              {/* En-tête */}
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#334155' }}>
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" style={{ color: '#f59e0b' }} />
                  <span className="text-sm font-semibold text-white">Alertes</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="flex items-center gap-1 text-xs transition hover:text-white" style={{ color: '#64748b' }}>
                    <CheckCheck className="w-3.5 h-3.5" />
                    Tout lire
                  </button>
                )}
              </div>

              {/* Liste */}
              <div className="max-h-80 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: '#334155', borderTopColor: '#f59e0b' }} />
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Bell className="w-8 h-8 mb-2" style={{ color: '#334155' }} />
                    <p className="text-sm" style={{ color: '#64748b' }}>Aucune alerte</p>
                  </div>
                ) : (
                  alerts.map((alert) => {
                    const config = alertTypeConfig[alert.type] || alertTypeConfig.stock_low
                    const Icon = config.icon
                    return (
                      <motion.button
                        key={alert.id}
                        onClick={() => handleAlertClick(alert)}
                        className="w-full flex items-start gap-3 px-4 py-3 text-left transition border-b"
                        style={{ borderColor: '#334155', background: alert.is_read ? 'transparent' : 'rgba(245, 158, 11, 0.04)' }}
                        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: config.bgColor }}>
                          <Icon className="w-4 h-4" style={{ color: config.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm truncate ${alert.is_read ? 'font-normal' : 'font-semibold'}`} style={{ color: alert.is_read ? '#94a3b8' : '#e2e8f0' }}>
                              {alert.title}
                            </p>
                            {!alert.is_read && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: '#f59e0b' }} />}
                          </div>
                          <p className="text-xs mt-0.5 line-clamp-2" style={{ color: '#64748b' }}>{alert.message}</p>
                          <p className="text-[10px] mt-1" style={{ color: '#475569' }}>{timeAgo(alert.created_at)}</p>
                        </div>
                        {alert.is_read && <Check className="w-3.5 h-3.5 shrink-0 mt-1" style={{ color: '#334155' }} />}
                      </motion.button>
                    )
                  })
                )}
              </div>

              {/* Pied de page */}
              {alerts.length > 0 && (
                <button
                  onClick={() => { setIsOpen(false); router.push('/alerts') }}
                  className="w-full text-center py-2.5 text-xs font-medium transition border-t hover:bg-white/5"
                  style={{ color: '#f59e0b', borderColor: '#334155' }}
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
