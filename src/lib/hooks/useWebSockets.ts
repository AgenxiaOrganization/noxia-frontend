import { useEffect, useRef, useState } from 'react'
import { getAccessToken } from '../auth'

const getWsBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_WS_URL) return process.env.NEXT_PUBLIC_WS_URL
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.hostname || '127.0.0.1'
    return `${protocol}//${host}:8000`
  }
  return 'ws://127.0.0.1:8000'
}

export function useWebSockets<T>(path: string | null | undefined, onMessage: (data: T) => void) {
  const [isConnected, setIsConnected] = useState(false)
  const ws = useRef<WebSocket | null>(null)
  const onMessageRef = useRef(onMessage)
  const send = useRef((data: unknown) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data))
    }
  }).current

  // Keep the latest callback without triggering reconnections
  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    const token = getAccessToken()
    if (!token || !path) return

    let isMounted = true
    let attempts = 0
    let retryTimer: ReturnType<typeof setTimeout> | null = null

    const connect = () => {
      if (!isMounted) return

      const baseUrl = getWsBaseUrl()
      ws.current = new WebSocket(`${baseUrl}${path}?token=${token}`)

      ws.current.onopen = () => {
        attempts = 0
        if (isMounted) setIsConnected(true)
      }

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          onMessageRef.current(data)
        } catch (e) {
          console.error("Erreur de parsing WebSocket:", e)
        }
      }

      ws.current.onclose = () => {
        if (isMounted) {
          setIsConnected(false)
          // Reconnexion avec attente croissante ET aléa (1 s, 2 s, 4 s… 30 s
          // max) : après un redémarrage du serveur (mise en production),
          // tous les écrans de tous les établissements perdent la connexion
          // en même temps. Avec un délai fixe, ils revenaient tous à la même
          // seconde — rafale mesurée au test de charge comme saturant le
          // serveur, puis réessayaient encore ensemble.
          const delay = Math.min(30000, 1000 * 2 ** attempts) * (0.5 + Math.random())
          attempts += 1
          retryTimer = setTimeout(connect, delay)
        }
      }
    }

    connect()

    return () => {
      isMounted = false
      if (retryTimer) clearTimeout(retryTimer)
      if (ws.current) {
        ws.current.onclose = null // Empêche la reconnexion au démontage
        ws.current.close()
      }
    }
  }, [path])

  return { isConnected, send }
}
