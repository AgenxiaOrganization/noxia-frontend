'use client'

import { useEffect, useRef, useState } from 'react'
import { useWebSockets } from '@/lib/hooks/useWebSockets'
import { get, del } from '@/lib/api'
import { getUser } from '@/lib/auth'

interface AdminChatMessage {
  id: string
  /** Identifiant utilisé pour la suppression (DELETE .../messages/{clientMessageId}/) —
   * seuls les messages INBOUND (envoyés par l'établissement) en ont un côté
   * serveur ; les réponses OUTBOUND de l'administration ne sont jamais
   * supprimables depuis ce panneau. */
  clientMessageId?: string
  direction: 'inbound' | 'outbound'
  senderName: string
  text: string
  createdAt: string
  status?: 'pending' | 'sent'
}

interface HistoryMessage {
  id: number
  direction: 'inbound' | 'outbound'
  sender_name: string
  text: string
  created_at: string
  client_message_id: string
}

type IncomingEvent =
  | { type: 'message_sent'; client_message_id: string; status: 'pending' }
  | { type: 'admin_chat_message'; message: { id: number; sender_name: string; text: string; sent_at: string } }

function generateId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/** Panneau "Contacter l'administration NOXIA" — canal temps réel dédié aux
 * administrateurs d'établissement, distinct de l'assistant IA (@n8n/chat).
 * Voir noxia-backend core/consumers.py::AdminChatConsumer. */
export default function AdminChatPanel({ onBackToAssistant }: { onBackToAssistant?: () => void }) {
  const [messages, setMessages] = useState<AdminChatMessage[]>([])
  const [input, setInput] = useState('')
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const user = getUser()

  useEffect(() => {
    get<{ messages: HistoryMessage[] }>('/companies/assistant/admin-chat/history/')
      .then((data) => {
        setMessages(
          (data.messages || []).map((m) => ({
            id: String(m.id),
            clientMessageId: m.direction === 'inbound' ? m.client_message_id || undefined : undefined,
            direction: m.direction,
            senderName: m.sender_name,
            text: m.text,
            createdAt: m.created_at,
          })),
        )
      })
      .catch(() => {
        // Historique indisponible (Noxia Contrôle injoignable) : le
        // panneau reste utilisable, juste sans les anciens messages.
      })
      .finally(() => setHistoryLoaded(true))
  }, [])

  const { isConnected, send } = useWebSockets<IncomingEvent>('/ws/admin-chat/', (event) => {
    if (event.type === 'admin_chat_message') {
      setMessages((prev) => [
        ...prev,
        {
          id: `srv-${event.message.id}`,
          direction: 'outbound',
          senderName: event.message.sender_name,
          text: event.message.text,
          createdAt: event.message.sent_at,
        },
      ])
    } else if (event.type === 'message_sent') {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === event.client_message_id ? { ...m, status: 'sent' } : m,
        ),
      )
    }
  })

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages])

  const handleSend = () => {
    const text = input.trim()
    if (!text) return
    const clientMessageId = generateId()
    setMessages((prev) => [
      ...prev,
      {
        id: clientMessageId,
        clientMessageId,
        direction: 'inbound',
        senderName: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Vous',
        text,
        createdAt: new Date().toISOString(),
        status: 'pending',
      },
    ])
    send({ type: 'send_message', text, client_message_id: clientMessageId })
    setInput('')
  }

  const handleDelete = async (message: AdminChatMessage) => {
    if (!message.clientMessageId) return
    if (!window.confirm('Supprimer ce message ?')) return
    const previous = messages
    setMessages((prev) => prev.filter((m) => m.id !== message.id))
    try {
      await del(`/companies/assistant/admin-chat/messages/${message.clientMessageId}/`)
    } catch (err) {
      console.error(err)
      setMessages(previous)
    }
  }

  return (
    <div className="noxia-admin-chat">
      <div className="noxia-admin-chat-status">
        {onBackToAssistant && (
          <button type="button" className="noxia-admin-chat-back" onClick={onBackToAssistant}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Assistant IA
          </button>
        )}
        <span className={`noxia-admin-chat-dot ${isConnected ? 'is-online' : ''}`} />
        {isConnected ? 'Connecté à l\'administration NOXIA' : 'Connexion en cours…'}
      </div>

      <div className="noxia-admin-chat-messages" ref={listRef}>
        {historyLoaded && messages.length === 0 && (
          <p className="noxia-admin-chat-empty">
            Écrivez à l&apos;équipe NOXIA pour toute question sur votre établissement, votre abonnement ou un problème rencontré.
          </p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`noxia-admin-chat-msg noxia-admin-chat-msg--${m.direction}`}>
            <div className="noxia-admin-chat-msg-bubble">
              <span className="noxia-admin-chat-msg-sender">{m.senderName}</span>
              <p>{m.text}</p>
            </div>
            <div className="noxia-admin-chat-msg-meta">
              {m.status === 'pending' && <span className="noxia-admin-chat-msg-pending">Envoi…</span>}
              {m.clientMessageId && (
                <button type="button" className="noxia-admin-chat-msg-delete" onClick={() => handleDelete(m)}>
                  Supprimer
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="noxia-admin-chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="Écrivez votre message à l'administration…"
        />
        <button type="button" onClick={handleSend} disabled={!input.trim()} aria-label="Envoyer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2 11 13" />
            <path d="M22 2 15 22l-4-9-9-4Z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
