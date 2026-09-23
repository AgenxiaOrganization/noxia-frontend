'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MessageSquare, Building2, Trash2, Server } from 'lucide-react'
import { toast } from 'sonner'
import Loader from '@/components/ui/Loader'
import {
  listConversations,
  bulkDeleteConversations,
  type ConversationSummary,
} from '@/lib/api/messaging'

function formatDate(dateString: string | null): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export default function SuperAdminMessagerie() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const load = () => {
    setIsLoading(true)
    listConversations()
      .then(setConversations)
      .catch((e) => {
        console.error('Erreur chargement des conversations', e)
        toast.error('Impossible de charger la messagerie.')
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(load, [])

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleBulkDelete = async () => {
    if (selected.size === 0) return
    if (!window.confirm(`Supprimer ${selected.size} conversation${selected.size > 1 ? 's' : ''} ? Cette action est irréversible.`)) return
    try {
      await bulkDeleteConversations(Array.from(selected))
      setConversations((prev) => prev.filter((c) => !selected.has(c.id)))
      setSelected(new Set())
      toast.success('Conversations supprimées.')
    } catch (e) {
      console.error(e)
      toast.error('Erreur lors de la suppression.')
    }
  }

  if (isLoading) return <Loader />

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-500 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary-400" />
            Messagerie
          </h1>
          <p className="text-sm mt-1 text-dark-400">Messages envoyés par les administrateurs d&apos;établissement</p>
        </div>
        {selected.size > 0 && (
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition"
            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171' }}
          >
            <Trash2 className="w-4 h-4" />
            Supprimer ({selected.size})
          </button>
        )}
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dark-800/40 glass-card">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-dark-950/40 border border-dark-800/60">
            <MessageSquare className="w-6 h-6 text-dark-400" />
          </div>
          <p className="text-sm font-semibold text-white">Aucune conversation</p>
          <p className="text-xs mt-1 text-dark-400">Les messages envoyés par les administrateurs d&apos;établissement apparaîtront ici.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-dark-800/40 overflow-hidden divide-y divide-dark-800/20 bg-dark-900">
          {conversations.map((conv) => (
            <div key={conv.id} className="group flex items-center gap-3 p-4 hover:bg-white/5 transition">
              <input
                type="checkbox"
                checked={selected.has(conv.id)}
                onChange={() => toggleSelect(conv.id)}
                onClick={(e) => e.stopPropagation()}
                className="w-4 h-4 rounded border-dark-700 shrink-0"
              />
              <Link href={`/super-admin/messagerie/${conv.id}`} className="flex-1 min-w-0 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
                  <Building2 className="w-5 h-5" style={{ color: '#818cf8' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm truncate ${conv.unread_count > 0 ? 'font-bold text-white' : 'font-medium text-dark-300'}`}>
                      {conv.company_name}
                    </h3>
                    <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-dark-950/40 text-dark-400 border border-dark-800/40 shrink-0">
                      <Server className="w-2.5 h-2.5" />
                      {conv.instance_name}
                    </span>
                  </div>
                  <p className="text-xs text-dark-400 mt-0.5">{formatDate(conv.last_message_at)}</p>
                </div>
                {conv.unread_count > 0 && (
                  <span
                    className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                    style={{ background: '#ef4444' }}
                  >
                    {conv.unread_count > 99 ? '99+' : conv.unread_count}
                  </span>
                )}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
