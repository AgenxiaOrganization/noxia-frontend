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

  // Keep the latest callback without triggering reconnections
  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    const token = getAccessToken()
    if (!token || !path) return

    let isMounted = true

    const connect = () => {
      if (!isMounted) return

      const baseUrl = getWsBaseUrl()
      ws.current = new WebSocket(`${baseUrl}${path}?token=${token}`)

      ws.current.onopen = () => {
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
          // Reconnexion automatique après 3 secondes
          setTimeout(connect, 3000)
        }
      }
    }

    connect()

    return () => {
      isMounted = false
      if (ws.current) {
        ws.current.onclose = null // Empêche la reconnexion au démontage
        ws.current.close()
      }
    }
  }, [path])

  return { isConnected }
}
