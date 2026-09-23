'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Send, Trash2, Building2, Server } from 'lucide-react'
import { toast } from 'sonner'
import Loader from '@/components/ui/Loader'
import {
  getConversation,
  replyToConversation,
  deleteConversation,
  deleteMessage,
  getMessagingStreamUrl,
  type ConversationDetail,
  type ConversationMessage,
} from '@/lib/api/messaging'

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function SuperAdminMessagerieDetail() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const conversationId = Number(params.id)

  const [conversation, setConversation] = useState<ConversationDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [replyText, setReplyText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  const load = () => {
    setIsLoading(true)
    getConversation(conversationId)
      .then(setConversation)
      .catch((e) => {
        console.error('Erreur chargement conversation', e)
        toast.error('Impossible de charger cette conversation.')
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(load, [conversationId])

  // SSE : uniquement pendant que cette page est ouverte (pas de connexion
  // persistante globale dans le layout super-admin, voir messaging/views.py
  // MessagingStreamView).
  useEffect(() => {
    const source = new EventSource(getMessagingStreamUrl())
    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as { conversation_id: number; message: ConversationMessage }
        if (payload.conversation_id !== conversationId) return
        setConversation((prev) => {
          if (!prev) return prev
          if (prev.messages.some((m) => m.id === payload.message.id)) return prev
          return { ...prev, messages: [...prev.messages, payload.message] }
        })
      } catch {
        // Ping ou payload non-JSON : ignoré.
      }
    }
    return () => source.close()
  }, [conversationId])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [conversation?.messages.length])

  const handleReply = async () => {
    const text = replyText.trim()
    if (!text || isSending) return
    setIsSending(true)
    try {
      const message = await replyToConversation(conversationId, text)
      // Dédup avec le SSE (messaging/views.py::MessagingStreamView), qui
      // poll la DB toutes les 2s et peut repousser ce même message outbound
      // avant ou après cette mise à jour optimiste — sans ce check, les deux
      // sources ajoutent le même id et React lève "two children with the
      // same key" (clé = message.id).
      setConversation((prev) => {
        if (!prev) return prev
        if (prev.messages.some((m) => m.id === message.id)) return prev
        return { ...prev, messages: [...prev.messages, message] }
      })
      setReplyText('')
    } catch (e) {
      console.error(e)
      toast.error("Erreur lors de l'envoi de la réponse.")
    } finally {
      setIsSending(false)
    }
  }

  const handleDeleteMessage = async (messageId: number) => {
    if (!window.confirm('Supprimer ce message ?')) return
    try {
      await deleteMessage(messageId)
      setConversation((prev) => prev ? { ...prev, messages: prev.messages.filter((m) => m.id !== messageId) } : prev)
    } catch (e) {
      console.error(e)
      toast.error('Erreur lors de la suppression du message.')
    }
  }

  const handleDeleteConversation = async () => {
    if (!window.confirm('Supprimer toute cette conversation ? Cette action est irréversible.')) return
    try {
      await deleteConversation(conversationId)
      toast.success('Conversation supprimée.')
      router.push('/super-admin/messagerie')
    } catch (e) {
      console.error(e)
      toast.error('Erreur lors de la suppression.')
    }
  }

  if (isLoading) return <Loader />
  if (!conversation) return null

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto flex flex-col h-[calc(100vh-100px)]">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => router.push('/super-admin/messagerie')}
          className="p-2 rounded-lg hover:bg-white/5 transition text-dark-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary-400 shrink-0" />
            <h1 className="text-lg font-bold text-white truncate">{conversation.company_name}</h1>
          </div>
          <p className="text-xs text-dark-400 flex items-center gap-1 mt-0.5">
            <Server className="w-3 h-3" />
            {conversation.instance_name}
          </p>
        </div>
        <button
          onClick={handleDeleteConversation}
          className="p-2 rounded-lg hover:bg-red-500/10 transition text-dark-400 hover:text-red-400"
          title="Supprimer la conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto space-y-3 p-4 rounded-xl border border-dark-800/40 bg-dark-900">
        {conversation.messages.length === 0 && (
          <p className="text-sm text-dark-400 text-center py-8">Aucun message dans cette conversation.</p>
        )}
        {conversation.messages.map((msg) => (
          <div
            key={msg.id}
            className={`group flex flex-col gap-1 ${msg.direction === 'outbound' ? 'items-end' : 'items-start'}`}
          >
            <div
              className="max-w-[80%] rounded-2xl px-4 py-2.5"
              style={
                msg.direction === 'outbound'
                  ? { background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }
                  : { background: '#1a1830', border: '1px solid rgba(255,255,255,0.06)' }
              }
            >
              <p className="text-[10px] font-semibold opacity-70 mb-0.5">{msg.sender_name}</p>
              <p className="text-sm text-white whitespace-pre-wrap">{msg.text}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-dark-500">{formatDate(msg.created_at)}</span>
              <button
                onClick={() => handleDeleteMessage(msg.id)}
                className="opacity-0 group-hover:opacity-100 transition text-[10px] text-dark-500 hover:text-red-400"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-4">
        <input
          type="text"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleReply()
            }
          }}
          placeholder="Répondre à cet établissement…"
          className="flex-1 px-4 py-2.5 rounded-lg text-sm bg-dark-950 border border-dark-800 text-white placeholder:text-dark-500 focus:outline-none focus:border-primary-500/50"
        />
        <button
          onClick={handleReply}
          disabled={!replyText.trim() || isSending}
          className="p-2.5 rounded-lg bg-primary-500 hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition text-white"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
