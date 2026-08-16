'use client'

import { useState, useEffect, useContext, FormEvent } from 'react'
import { Server, Plus, X, Trash2, Copy, CheckCircle, AlertTriangle, Shield } from 'lucide-react'
import { ServerContext } from '../layout'
import { getPlatformUser } from '@/lib/platformAuth'
import {
  listInstances, createInstance, updateInstance, deleteInstance,
  type PlatformInstance, type InstanceStatus,
} from '@/lib/api/instances'
import Loader from '@/components/ui/Loader'
import { toast } from 'sonner'

const statusLabels: Record<InstanceStatus, string> = {
  active: 'Active', inactive: 'Inactive', maintenance: 'Maintenance',
}
const statusColors: Record<InstanceStatus, string> = {
  active: '#22c55e', inactive: '#64748b', maintenance: '#f59e0b',
}

export default function SuperAdminInstances() {
  const { refreshServers } = useContext(ServerContext)
  const platformUser = getPlatformUser()
  const isSuperAdmin = platformUser?.role === 'super_admin'

  const [instances, setInstances] = useState<PlatformInstance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [urlApi, setUrlApi] = useState('')

  const [newApiKey, setNewApiKey] = useState<{ code: string; key: string } | null>(null)

  const loadData = () => {
    setIsLoading(true)
    setError(null)
    listInstances()
      .then(setInstances)
      .catch((e) => {
        console.error('Erreur chargement des instances', e)
        setError('Impossible de charger la liste des instances.')
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(loadData, [])

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      const created = await createInstance({ code: code.trim().toLowerCase(), name: name.trim(), url_api: urlApi.trim() })
      toast.success(`Instance "${created.name}" créée avec succès.`)
      setNewApiKey(created.api_key ? { code: created.code, key: created.api_key } : null)
      setIsFormOpen(false)
      setCode(''); setName(''); setUrlApi('')
      loadData()
      refreshServers()
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la création.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleStatusChange = async (instance: PlatformInstance, status: InstanceStatus) => {
    try {
      await updateInstance(instance.id, { status })
      toast.success(`Statut mis à jour : ${statusLabels[status]}`)
      loadData()
      refreshServers()
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour.')
    }
  }

  const handleDelete = async (instance: PlatformInstance) => {
    if (!confirm(`Supprimer définitivement l'instance "${instance.name}" ? Cette action est irréversible.`)) return
    try {
      await deleteInstance(instance.id)
      toast.success('Instance supprimée.')
      loadData()
      refreshServers()
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la suppression.')
    }
  }

  const copyApiKey = (key: string) => {
    navigator.clipboard.writeText(key)
    toast.success('Clé API copiée dans le presse-papiers.')
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <Shield className="w-10 h-10" style={{ color: '#334155' }} />
        <p className="text-sm" style={{ color: '#94a3b8' }}>
          La gestion des instances est réservée aux comptes super-admin.
        </p>
      </div>
    )
  }

  if (isLoading) return <Loader />

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Instances NOXIA</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            {instances.length} déploiement{instances.length > 1 ? 's' : ''} — un par pays, même code source, seule la base URL change.
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition bg-primary-500 hover:brightness-110 active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter une instance
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>{error}</div>
      )}

      {newApiKey && (
        <div className="rounded-xl border p-4 space-y-2" style={{ background: 'rgba(34, 197, 94, 0.06)', borderColor: 'rgba(34, 197, 94, 0.3)' }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-green-400 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Clé API de « {newApiKey.code} » — à copier maintenant, elle ne sera plus jamais affichée
            </p>
            <button onClick={() => setNewApiKey(null)} className="text-slate-400 hover:text-white transition">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 rounded-lg text-xs text-white bg-dark-950/50 border border-dark-800/60 overflow-x-auto whitespace-nowrap">
              {newApiKey.key}
            </code>
            <button onClick={() => copyApiKey(newApiKey.key)} className="p-2 rounded-lg transition bg-dark-800/60 hover:bg-dark-700 text-white shrink-0">
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs" style={{ color: '#94a3b8' }}>
            À coller dans le <code>.env</code> de l'instance (<code>INSTANCE_PROXY_API_KEY</code>) et dans <code>NOXIA_CONTROLE_API_KEY</code> pour l'envoi périodique des statistiques.
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-dark-800/40 glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-800/20">
                <th className="px-4 py-3 text-left text-xs text-dark-400">Instance</th>
                <th className="px-4 py-3 text-left text-xs text-dark-400">Code</th>
                <th className="px-4 py-3 text-left text-xs text-dark-400">Base URL API</th>
                <th className="px-4 py-3 text-left text-xs text-dark-400">Statut</th>
                <th className="px-4 py-3 text-left text-xs text-dark-400">Dernier heartbeat</th>
                <th className="px-4 py-3 text-right text-xs text-dark-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {instances.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <Server className="w-10 h-10 mx-auto mb-2" style={{ color: '#334155' }} />
                    <p className="text-sm" style={{ color: '#64748b' }}>Aucune instance enregistrée.</p>
                  </td>
                </tr>
              ) : (
                instances.map((instance) => (
                  <tr key={instance.id} className="border-b border-dark-800/10 transition hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-white font-medium">{instance.name}</td>
                    <td className="px-4 py-3 text-dark-400 font-mono text-xs">{instance.code}</td>
                    <td className="px-4 py-3 text-dark-400 font-mono text-xs">{instance.url_api}</td>
                    <td className="px-4 py-3">
                      <select
                        value={instance.status}
                        onChange={(e) => handleStatusChange(instance, e.target.value as InstanceStatus)}
                        className="rounded-lg px-2.5 py-1 text-xs font-medium outline-none bg-dark-950/40 border border-dark-800/60 focus:border-primary-500"
                        style={{ color: statusColors[instance.status] }}
                      >
                        {(Object.keys(statusLabels) as InstanceStatus[]).map((s) => (
                          <option key={s} value={s} style={{ color: '#0f172a' }}>{statusLabels[s]}</option>
                        ))}
                      </select>
                      {instance.is_stale && instance.status === 'active' && (
                        <span className="ml-2 text-xs inline-flex items-center gap-1" style={{ color: '#f59e0b' }}>
                          <AlertTriangle className="w-3 h-3" /> pas de heartbeat récent
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-dark-400 text-xs">
                      {instance.last_heartbeat ? new Date(instance.last_heartbeat).toLocaleString('fr-FR') : 'Jamais'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(instance)}
                        className="p-1.5 rounded-lg transition hover:bg-red-500/10 text-dark-400 hover:text-red-400"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl border border-dark-800/60 bg-dark-900 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-dark-800/60">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-primary-400" />
                Nouvelle instance
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-dark-400">Code (identifiant court, ex. "fr", "sn")</label>
                <input
                  type="text" required maxLength={10} pattern="[a-z0-9\-]+"
                  value={code} onChange={(e) => setCode(e.target.value)}
                  placeholder="fr"
                  className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none bg-dark-950/50 border border-dark-800/60 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-dark-400">Nom (pays / libellé affiché)</label>
                <input
                  type="text" required
                  value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="France"
                  className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none bg-dark-950/50 border border-dark-800/60 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-dark-400">Base URL de l'API (noxia-backend de cette instance)</label>
                <input
                  type="url" required
                  value={urlApi} onChange={(e) => setUrlApi(e.target.value)}
                  placeholder="https://api.noxia.fr/api/v1"
                  className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none bg-dark-950/50 border border-dark-800/60 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition"
                />
              </div>
              <p className="text-xs" style={{ color: '#64748b' }}>
                Une clé API sera générée automatiquement — elle ne s'affichera qu'une seule fois après la création.
              </p>

              <div className="flex justify-end gap-3 pt-4 border-t border-dark-800/60">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-5 py-2 rounded-lg text-sm font-medium transition border border-dark-800/60 text-dark-400 hover:text-white hover:bg-white/5">
                  Annuler
                </button>
                <button type="submit" disabled={isSaving} className="px-5 py-2 rounded-lg text-white text-sm font-semibold transition bg-primary-500 hover:brightness-110 active:scale-95 flex items-center gap-1.5 disabled:opacity-50">
                  <Plus className="w-4 h-4" />
                  Créer l'instance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
