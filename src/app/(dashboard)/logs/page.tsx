'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  Activity, Search, Download, Trash2, ShieldCheck, 
  RefreshCw, CheckCircle2, AlertTriangle, XCircle, User, Terminal,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react'
import { getAuditLogs, clearAuditLogs, downloadAuditLogsExcel, AuditLogItem } from '@/lib/api/audit'
import { useWebSockets } from '@/lib/hooks/useWebSockets'
import Loader from '@/components/ui/Loader'
import { toast } from 'sonner'

export default function LogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMethod, setSelectedMethod] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [newLogIds, setNewLogIds] = useState<number[]>([])

  // --- Pagination DataTable ---
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const loadData = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true)
      else setIsRefreshing(true)

      const apiLogs = await getAuditLogs({
        search: searchTerm,
        method: selectedMethod,
        status_code: selectedStatus
      })
      setLogs(apiLogs)
      if (silent) {
        toast.success('🔄 Journal des logs rafraîchi avec succès.')
      }
    } catch (err) {
      console.error('Erreur lors du chargement des logs', err)
      toast.error('Impossible de charger les logs d\'audit.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedMethod, selectedStatus])

  // Réinitialiser à la page 1 lorsque les filtres ou la recherche changent
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedMethod, selectedStatus, itemsPerPage])

  // Écouteur WebSocket en temps réel pour les nouveaux logs d'audit
  useWebSockets('/ws/notifications/', (data: any) => {
    const payload = data?.notification || data
    if (payload?.type === 'audit_log' && payload?.log) {
      const newLog: AuditLogItem = payload.log
      setLogs(prev => [newLog, ...prev.filter(l => l.id !== newLog.id)])
      setNewLogIds(prev => [newLog.id, ...prev.slice(0, 10)])

      setTimeout(() => {
        setNewLogIds(prev => prev.filter(id => id !== newLog.id))
      }, 3500)
    }
  })

  // Recherche et filtrage côté client
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        !searchTerm.trim() ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.method.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesMethod = selectedMethod === 'all' || log.method.toUpperCase() === selectedMethod.toUpperCase()
      
      let matchesStatus = true
      if (selectedStatus === '2xx') matchesStatus = log.status_code >= 200 && log.status_code < 300
      else if (selectedStatus === '4xx') matchesStatus = log.status_code >= 400 && log.status_code < 500
      else if (selectedStatus === '5xx') matchesStatus = log.status_code >= 500
      else if (selectedStatus !== 'all') matchesStatus = String(log.status_code) === selectedStatus

      return matchesSearch && matchesMethod && matchesStatus
    })
  }, [logs, searchTerm, selectedMethod, selectedStatus])

  // Statistiques globales
  const stats = useMemo(() => {
    const total = logs.length
    const success = logs.filter(l => l.status_code >= 200 && l.status_code < 300).length
    const clientErr = logs.filter(l => l.status_code >= 400 && l.status_code < 500).length
    const serverErr = logs.filter(l => l.status_code >= 500).length
    return { total, success, clientErr, serverErr }
  }, [logs])

  // Découpage pour la pagination DataTable
  const totalItems = filteredLogs.length
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
  const paginatedLogs = useMemo(() => {
    return filteredLogs.slice(startIndex, endIndex)
  }, [filteredLogs, startIndex, endIndex])

  // Exporter en fichier Excel (.xlsx) professionnel via le backend Django (openpyxl)
  const handleExportExcel = async () => {
    if (filteredLogs.length === 0) {
      toast.warning('Aucun log à exporter.')
      return
    }

    toast.promise(
      downloadAuditLogsExcel({
        search: searchTerm,
        method: selectedMethod,
        status_code: selectedStatus
      }),
      {
        loading: 'Génération du rapport Excel (.xlsx) par le serveur...',
        success: '📊 Rapport Excel (.xlsx) téléchargé avec succès !',
        error: 'Erreur lors du téléchargement du fichier Excel.'
      }
    )
  }

  // Effacer les logs (Bouton Corbeille)
  const handleClearLogs = async () => {
    if (confirm('Êtes-vous sûr de vouloir effacer l\'historique des logs d\'audit de cet établissement ? Cette action est irréversible.')) {
      try {
        await clearAuditLogs()
        toast.success('🗑️ Historique des logs effacé avec succès.')
        setLogs([])
        setCurrentPage(1)
      } catch (err) {
        console.error('Erreur lors de la suppression des logs', err)
        toast.error('Impossible d\'effacer les logs.')
      }
    }
  }

  if (isLoading) return <Loader />

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* En-tête de page */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-md shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                Journal des Logs & Traçabilité
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Temps Réel Actif
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Suivi complet et sécurisé des requêtes et actions effectuées par les employés de l'établissement.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Bouton Rafraîchir */}
          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition disabled:opacity-50 shadow-sm"
            title="Rafraîchir les données"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
            Rafraîchir
          </button>

          {/* Bouton Export Excel */}
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition active:scale-95"
          >
            <Download className="w-4 h-4" />
            Exporter Excel (.xlsx)
          </button>

          {/* Bouton Vider (Corbeille) */}
          <button
            onClick={handleClearLogs}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1.5 transition active:scale-95"
            title="Vider les logs d'audit"
          >
            <Trash2 className="w-4 h-4" />
            Vider
          </button>
        </div>
      </div>

      {/* Cartes de Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Total des Requêtes</p>
            <p className="text-lg font-bold text-white">{stats.total.toLocaleString('fr-FR')}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Succès (2xx)</p>
            <p className="text-lg font-bold text-emerald-400">{stats.success.toLocaleString('fr-FR')}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Erreurs Client (4xx)</p>
            <p className="text-lg font-bold text-amber-400">{stats.clientErr.toLocaleString('fr-FR')}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Erreurs Serveur (5xx)</p>
            <p className="text-lg font-bold text-rose-400">{stats.serverErr.toLocaleString('fr-FR')}</p>
          </div>
        </div>
      </div>

      {/* Barre de Filtres */}
      <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Champ de Recherche */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher par utilisateur, action, endpoint..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Sélecteurs de filtres */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Filtre Méthode */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-500 px-2">Méthode :</span>
            {['all', 'GET', 'POST', 'PUT', 'DELETE'].map(m => (
              <button
                key={m}
                onClick={() => setSelectedMethod(m)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedMethod === m
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {m === 'all' ? 'Toutes' : m}
              </button>
            ))}
          </div>

          {/* Filtre Statut */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-500 px-2">Statut :</span>
            {[
              { id: 'all', label: 'Tous' },
              { id: '2xx', label: '2xx' },
              { id: '4xx', label: '4xx' },
              { id: '5xx', label: '5xx' }
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedStatus(s.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedStatus === s.id
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tableau interactif des Logs avec Pagination DataTable */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl flex flex-col">
        <div className="overflow-x-auto">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Activity className="w-10 h-10 text-slate-600 mx-auto animate-bounce" />
              <p className="text-sm text-slate-400 font-medium">Aucun log d'audit ne correspond à vos filtres actuels.</p>
              <p className="text-xs text-slate-500">Les actions des utilisateurs apparaîtront ici automatiquement en temps réel.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="px-4 py-3.5">Horodatage</th>
                  <th className="px-4 py-3.5">Utilisateur</th>
                  <th className="px-4 py-3.5">Méthode</th>
                  <th className="px-4 py-3.5">Action Effectuée</th>
                  <th className="px-4 py-3.5">Endpoint API</th>
                  <th className="px-4 py-3.5">Statut HTTP</th>
                  <th className="px-4 py-3.5 text-right">Adresse IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {paginatedLogs.map(log => {
                  const isNew = newLogIds.includes(log.id)
                  const formattedDate = new Date(log.created_at).toLocaleString('fr-FR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                  })

                  // Badge méthode HTTP
                  const methodStyle = 
                    log.method === 'GET' ? 'bg-sky-500/15 text-sky-300 border-sky-500/30' :
                    log.method === 'POST' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
                    log.method === 'PUT' ? 'bg-purple-500/15 text-purple-300 border-purple-500/30' :
                    log.method === 'PATCH' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' :
                    'bg-rose-500/15 text-rose-300 border-rose-500/30'

                  // Badge Statut HTTP
                  const statusStyle = 
                    log.status_code >= 200 && log.status_code < 300 ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                    log.status_code >= 400 && log.status_code < 500 ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                    'bg-rose-500/15 text-rose-400 border-rose-500/30'

                  return (
                    <tr 
                      key={log.id} 
                      className={`transition-colors duration-300 ${
                        isNew ? 'bg-indigo-500/20 border-l-4 border-l-indigo-500 animate-pulse' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Horodatage */}
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                        {formattedDate}
                      </td>

                      {/* Utilisateur & Rôle */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-white font-semibold flex items-center gap-1.5">
                              {log.user_name}
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-indigo-300 border border-slate-700 font-normal">
                                {log.user_role}
                              </span>
                            </p>
                            <p className="text-[10px] text-slate-400">{log.user_email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Méthode */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 text-[11px] font-bold rounded-lg border ${methodStyle}`}>
                          {log.method}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-slate-200 font-semibold max-w-sm truncate" title={log.action}>
                        {log.action}
                      </td>

                      {/* Endpoint */}
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400 max-w-xs truncate" title={log.path}>
                        <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                          {log.path}
                        </span>
                      </td>

                      {/* Code Statut */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 text-[11px] font-bold rounded-lg border ${statusStyle}`}>
                          {log.status_code}
                        </span>
                      </td>

                      {/* Adresse IP */}
                      <td className="px-4 py-3 text-right text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {log.ip_address || '127.0.0.1'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* --- DATATABLE PAGINATION BAR --- */}
        {filteredLogs.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Nombre d'éléments par page */}
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
              <span>
                | Affichage de <strong className="text-white">{startIndex + 1}</strong> à <strong className="text-white">{endIndex}</strong> sur <strong className="text-indigo-400">{totalItems}</strong> logs
              </span>
            </div>

            {/* Boutons de Navigation de Page */}
            <div className="flex items-center gap-1.5">
              {/* Premier */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-900 transition"
                title="Première page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Précédent */}
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-900 transition"
                title="Page précédente"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Numéros de page */}
              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                        currentPage === pageNum
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/80'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              {/* Suivant */}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-900 transition"
                title="Page suivante"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Dernier */}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-900 transition"
                title="Dernière page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
