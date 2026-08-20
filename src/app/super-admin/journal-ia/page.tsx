'use client'

import { useState, useEffect, useMemo, useContext } from 'react'
import {
  Bot, Search, Download,
  RefreshCw, User, Globe, Building2, MessageSquare,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from 'lucide-react'
import { ServerContext } from '../layout'
import { createSuperAdminClient, getProxyDownloadTarget } from '@/lib/superAdminClient'
import { createAIContentLogApi, type AIContentLogItem } from '@/lib/api/aiContentLogs'
import Loader from '@/components/ui/Loader'
import { toast } from 'sonner'

export default function SuperAdminJournalIA() {
  const { selectedServer, isGlobalMode, selectedCompany } = useContext(ServerContext)

  const [logs, setLogs] = useState<AIContentLogItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSource, setSelectedSource] = useState('all')

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const getApi = () => createAIContentLogApi(createSuperAdminClient(selectedServer.id, selectedCompany!.id))

  const loadData = () => {
    if (isGlobalMode || !selectedCompany) {
      setLogs([])
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)
    getApi().getAIContentLogs({ search: searchTerm, source: selectedSource })
      .then((apiLogs) => {
        if (cancelled) return
        setLogs(apiLogs)
      })
      .catch((e) => {
        if (cancelled) return
        console.error('Erreur chargement journal IA (super-admin)', e)
        setError('Impossible de charger le journal des contenus IA de cette entreprise.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }

  useEffect(loadData, [selectedServer.id, selectedCompany, isGlobalMode, selectedSource])
  useEffect(() => { setCurrentPage(1) }, [searchTerm, selectedSource, itemsPerPage])

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch =
        !searchTerm.trim() ||
        log.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.response.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.user_email ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.session_id.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesSource = selectedSource === 'all' || log.source === selectedSource

      return matchesSearch && matchesSource
    })
  }, [logs, searchTerm, selectedSource])

  const stats = useMemo(() => {
    const total = logs.length
    const dashboard = logs.filter(l => l.source === 'dashboard').length
    const landing = logs.filter(l => l.source === 'landing').length
    return { total, dashboard, landing }
  }, [logs])

  const handleExportExcel = async () => {
    if (!selectedCompany) return
    setIsExporting(true)
    try {
      const { url, headers } = getProxyDownloadTarget(selectedServer.id, selectedCompany.id, '/ai-content-logs/export-excel/')
      const queryParams = new URLSearchParams()
      if (searchTerm) queryParams.append('search', searchTerm)
      if (selectedSource !== 'all') queryParams.append('source', selectedSource)
      const separator = url.includes('?') ? '&' : '?'
      const fullUrl = queryParams.toString() ? `${url}${separator}${queryParams.toString()}` : url

      const response = await fetch(fullUrl, { headers })
      if (!response.ok) throw new Error('Erreur lors de la génération du rapport Excel.')

      const blob = await response.blob()
      const objectUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = `NOXIA_Journal_IA_${selectedCompany.name}_${new Date().toISOString().slice(0, 10)}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(objectUrl)
      toast.success('Export Excel généré avec succès.')
    } catch (err) {
      console.error('Erreur export Excel journal IA (super-admin)', err)
      toast.error("Impossible de générer l'export Excel.")
    } finally {
      setIsExporting(false)
    }
  }

  const totalItems = filteredLogs.length
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
  const paginatedLogs = useMemo(() => filteredLogs.slice(startIndex, endIndex), [filteredLogs, startIndex, endIndex])

  if (isGlobalMode) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <Globe className="w-10 h-10" style={{ color: '#334155' }} />
        <p className="text-sm" style={{ color: '#94a3b8' }}>Sélectionnez une instance dans le menu pour voir son journal IA.</p>
      </div>
    )
  }

  if (!selectedCompany) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <Building2 className="w-10 h-10" style={{ color: '#334155' }} />
        <p className="text-sm" style={{ color: '#94a3b8' }}>Sélectionnez une entreprise dans le menu pour voir son journal IA.</p>
      </div>
    )
  }

  if (isLoading) return <Loader />

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-md shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Journal des Contenus IA — {selectedCompany.name}</h1>
              <p className="text-xs text-slate-400">
                Métadonnées d&apos;origine des réponses de l&apos;assistant IA (Art. 32/53, Ordonnance n°0011/PR/2026) — restituables à la Haute Autorité de la Communication sur demande.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Rafraîchir
          </button>
          <button
            onClick={handleExportExcel}
            disabled={isExporting || filteredLogs.length === 0}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 transition disabled:opacity-40"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Export en cours...' : 'Exporter en Excel'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"><MessageSquare className="w-5 h-5" /></div>
          <div>
            <p className="text-xs text-slate-400">Total des échanges</p>
            <p className="text-lg font-bold text-white">{stats.total.toLocaleString('fr-FR')}</p>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20"><Bot className="w-5 h-5" /></div>
          <div>
            <p className="text-xs text-slate-400">Assistant dashboard</p>
            <p className="text-lg font-bold text-sky-400">{stats.dashboard.toLocaleString('fr-FR')}</p>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20"><Globe className="w-5 h-5" /></div>
          <div>
            <p className="text-xs text-slate-400">Assistant landing (public)</p>
            <p className="text-lg font-bold text-violet-400">{stats.landing.toLocaleString('fr-FR')}</p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher par message, réponse, utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-500 px-2">Origine :</span>
          {[{ id: 'all', label: 'Toutes' }, { id: 'dashboard', label: 'Dashboard' }, { id: 'landing', label: 'Landing' }].map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedSource(s.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${selectedSource === s.id ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl flex flex-col">
        <div className="overflow-x-auto">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Bot className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400 font-medium">Aucun échange IA ne correspond à vos filtres actuels.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="px-4 py-3.5">Horodatage</th>
                  <th className="px-4 py-3.5">Origine</th>
                  <th className="px-4 py-3.5">Utilisateur</th>
                  <th className="px-4 py-3.5">Message</th>
                  <th className="px-4 py-3.5">Réponse générée</th>
                  <th className="px-4 py-3.5 text-right">Adresse IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {paginatedLogs.map(log => {
                  const formattedDate = new Date(log.created_at).toLocaleString('fr-FR', {
                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
                  })
                  const sourceStyle = log.source === 'dashboard'
                    ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                    : 'bg-violet-500/15 text-violet-300 border-violet-500/30'

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors align-top">
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{formattedDate}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 text-[11px] font-bold rounded-lg border ${sourceStyle}`}>
                          {log.source === 'dashboard' ? 'Dashboard' : 'Landing'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <p className="text-white font-semibold text-[11px]">{log.user_email ?? 'Visiteur anonyme'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-200 max-w-xs truncate" title={log.prompt}>{log.prompt}</td>
                      <td className="px-4 py-3 text-slate-300 max-w-sm truncate" title={log.response}>{log.response}</td>
                      <td className="px-4 py-3 text-right text-slate-400 font-mono text-[11px] whitespace-nowrap">{log.ip_address || '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {filteredLogs.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>Afficher</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-white outline-none focus:border-indigo-500 font-semibold transition"
              >
                <option value={10}>10 par page</option>
                <option value={25}>25 par page</option>
                <option value={50}>50 par page</option>
                <option value={100}>100 par page</option>
              </select>
              <span>| Affichage de <strong className="text-white">{startIndex + 1}</strong> à <strong className="text-white">{endIndex}</strong> sur <strong className="text-indigo-400">{totalItems}</strong> échanges</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-40 transition">
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-40 transition">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) pageNum = i + 1
                  else if (currentPage <= 3) pageNum = i + 1
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
                  else pageNum = currentPage - 2 + i
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition ${currentPage === pageNum ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/80'}`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-40 transition">
                <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-40 transition">
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
