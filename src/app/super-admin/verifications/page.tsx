'use client'

import { useState, useEffect, useContext, useMemo } from 'react'
import { ServerContext } from '../layout'
import {
  listInstancePendingVerifications, approveVerificationDocument, rejectVerificationDocument,
  type ProxyVerificationDocument,
} from '@/lib/superAdminClient'
import Loader from '@/components/ui/Loader'
import { toast } from 'sonner'
import {
  ShieldCheck, Search, FileText, Building2, Check, X, Globe,
  ExternalLink, Loader2, Clock,
} from 'lucide-react'

export default function SuperAdminVerifications() {
  const { selectedServer, isGlobalMode } = useContext(ServerContext)

  const [documents, setDocuments] = useState<ProxyVerificationDocument[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [rejectingDoc, setRejectingDoc] = useState<ProxyVerificationDocument | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const loadData = () => {
    if (isGlobalMode) {
      setDocuments([])
      return
    }
    let cancelled = false
    setIsLoading(true)
    setError(null)
    listInstancePendingVerifications(selectedServer.id)
      .then((list) => { if (!cancelled) setDocuments(list) })
      .catch((e) => {
        if (cancelled) return
        console.error('Erreur chargement des vérifications', e)
        setError('Impossible de charger les documents en attente de cette instance.')
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }

  useEffect(loadData, [selectedServer.id, isGlobalMode])

  const filteredDocuments = useMemo(() => documents.filter((d) => {
    const term = searchTerm.toLowerCase()
    return !term
      || d.company_name.toLowerCase().includes(term)
      || d.document_type_display.toLowerCase().includes(term)
  }), [documents, searchTerm])

  const companiesCount = new Set(documents.map((d) => d.company_id)).size

  const handleApprove = async (doc: ProxyVerificationDocument) => {
    setProcessingId(doc.id)
    try {
      await approveVerificationDocument(selectedServer.id, doc.company_id, doc.id)
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id))
      toast.success(`Document "${doc.document_type_display}" approuvé pour ${doc.company_name}.`)
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'approbation.")
    } finally {
      setProcessingId(null)
    }
  }

  const openRejectModal = (doc: ProxyVerificationDocument) => {
    setRejectingDoc(doc)
    setRejectReason('')
  }

  const handleReject = async () => {
    if (!rejectingDoc || !rejectReason.trim()) return
    setProcessingId(rejectingDoc.id)
    try {
      await rejectVerificationDocument(selectedServer.id, rejectingDoc.company_id, rejectingDoc.id, rejectReason.trim())
      setDocuments((prev) => prev.filter((d) => d.id !== rejectingDoc.id))
      toast.success(`Document "${rejectingDoc.document_type_display}" rejeté pour ${rejectingDoc.company_name}.`)
      setRejectingDoc(null)
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Erreur lors du rejet.')
    } finally {
      setProcessingId(null)
    }
  }

  if (isGlobalMode) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <Globe className="w-10 h-10" style={{ color: '#334155' }} />
        <p className="text-sm" style={{ color: '#94a3b8' }}>Sélectionnez une instance dans le menu pour voir ses vérifications.</p>
      </div>
    )
  }

  if (isLoading) return <Loader />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" style={{ color: '#818cf8' }} />
            Vérifications — {selectedServer.name}
          </h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            {documents.length} document{documents.length > 1 ? 's' : ''} en attente • {companiesCount} entreprise{companiesCount > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>{error}</div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
        <input
          type="text"
          placeholder="Rechercher (entreprise, type de document)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
          style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
        />
      </div>

      <div className="grid gap-3">
        {filteredDocuments.map((doc) => (
          <div
            key={doc.id}
            className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center gap-4"
            style={{ background: '#1e293b', borderColor: '#334155' }}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
              <FileText className="w-5 h-5" style={{ color: '#f59e0b' }} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-white">{doc.document_type_display}</span>
                <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                  <Clock className="w-3 h-3" />
                  En attente
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Building2 className="w-3 h-3 shrink-0" style={{ color: '#64748b' }} />
                <span className="text-xs truncate" style={{ color: '#94a3b8' }}>{doc.company_name}</span>
                <span className="text-xs" style={{ color: '#475569' }}>•</span>
                <span className="text-xs" style={{ color: '#64748b' }}>
                  {new Date(doc.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={doc.file}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-lg text-sm transition flex items-center gap-1.5 hover:bg-white/5"
                style={{ border: '1px solid #334155', color: '#94a3b8' }}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Voir
              </a>
              <button
                onClick={() => handleApprove(doc)}
                disabled={processingId === doc.id}
                className="px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 disabled:opacity-50"
                style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}
              >
                {processingId === doc.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Approuver
              </button>
              <button
                onClick={() => openRejectModal(doc)}
                disabled={processingId === doc.id}
                className="px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 disabled:opacity-50"
                style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}
              >
                <X className="w-3.5 h-3.5" />
                Rejeter
              </button>
            </div>
          </div>
        ))}

        {filteredDocuments.length === 0 && (
          <div className="p-8 text-center rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
            <ShieldCheck className="w-12 h-12 mx-auto mb-2" style={{ color: '#334155' }} />
            <p className="text-sm" style={{ color: '#64748b' }}>Aucun document en attente de revue.</p>
          </div>
        )}
      </div>

      {rejectingDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setRejectingDoc(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6"
            style={{ background: '#1e293b', border: '1px solid #334155' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-white mb-1">Rejeter le document</h2>
            <p className="text-sm mb-4" style={{ color: '#94a3b8' }}>
              {rejectingDoc.document_type_display} — {rejectingDoc.company_name}
            </p>
            <label className="text-xs font-medium mb-1 block" style={{ color: '#94a3b8' }}>
              Motif du rejet (obligatoire, visible par le responsable)
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Ex : document illisible, informations incohérentes avec le profil..."
              className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none transition resize-none"
              style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setRejectingDoc(null)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition"
                style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8' }}
              >
                Annuler
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || processingId === rejectingDoc.id}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}
              >
                {processingId === rejectingDoc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
