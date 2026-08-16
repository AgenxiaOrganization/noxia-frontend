'use client'

import { useState, useEffect, useContext, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ServerContext } from '../layout'
import { listInstanceCompaniesDetailed, createSuperAdminClient, type ProxyCompanyDetail } from '@/lib/superAdminClient'
import { listInstancePlans, type InstancePlan } from '@/lib/api/plans'
import { createSubscriptionApi } from '@/lib/api/subscription'
import { ensureArray } from '@/lib/api'
import Loader from '@/components/ui/Loader'
import { toast } from 'sonner'
import {
  Building2, Search, Eye, X, Users, MapPin, Phone, Mail,
  Clock, AlertTriangle, CheckCircle, Download, ChevronDown, Loader2,
  Server, Globe, ShoppingBag, DollarSign, Package, FileText,
} from 'lucide-react'

const subscriptionStatusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  trialing: { label: 'Essai', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', icon: Clock },
  active: { label: 'Actif', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', icon: CheckCircle },
  expired: { label: 'Expiré', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', icon: AlertTriangle },
  canceled: { label: 'Annulé', color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)', icon: X },
}

const verificationStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  verified: { label: 'Certifié', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' },
  pending: { label: 'En attente', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  rejected: { label: 'Rejeté', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
  incomplete: { label: 'Incomplet', color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)' },
}

function formatCurrency(amount: number) {
  return amount.toLocaleString() + ' FCFA'
}

export default function SuperAdminEntreprises() {
  return (
    <Suspense fallback={<Loader />}>
      <SuperAdminEntreprisesContent />
    </Suspense>
  )
}

function SuperAdminEntreprisesContent() {
  const { selectedServer, isGlobalMode } = useContext(ServerContext)
  const searchParams = useSearchParams()

  const [companies, setCompanies] = useState<ProxyCompanyDetail[]>([])
  const [plans, setPlans] = useState<InstancePlan[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') ?? '')
  const [selectedSubStatus, setSelectedSubStatus] = useState('all')
  const [selectedCompany, setSelectedCompany] = useState<ProxyCompanyDetail | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [changingPlanForId, setChangingPlanForId] = useState<number | null>(null)

  const loadData = () => {
    if (isGlobalMode) {
      setCompanies([])
      return
    }
    let cancelled = false
    setIsLoading(true)
    setError(null)
    Promise.all([
      listInstanceCompaniesDetailed(selectedServer.id),
      listInstancePlans(selectedServer.id),
    ])
      .then(([list, planList]) => {
        if (cancelled) return
        setCompanies(ensureArray<ProxyCompanyDetail>(list))
        setPlans([...planList].filter((p) => p.is_active).sort((a, b) => a.display_order - b.display_order))
      })
      .catch((e) => {
        if (cancelled) return
        console.error('Erreur chargement des entreprises', e)
        setError('Impossible de charger les entreprises de cette instance.')
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }

  useEffect(loadData, [selectedServer.id, isGlobalMode])

  const handlePlanChange = async (company: ProxyCompanyDetail, planCode: string) => {
    if (planCode === company.subscription?.plan_code) return
    setChangingPlanForId(company.id)
    try {
      const subscriptionApi = createSubscriptionApi(createSuperAdminClient(selectedServer.id, company.id))
      const updated = await subscriptionApi.subscribeToPlan(planCode)
      setCompanies((prev) => prev.map((c) => {
        if (c.id !== company.id || !c.subscription) return c
        return {
          ...c,
          subscription: {
            ...c.subscription,
            plan_name: updated.plan.name,
            plan_code: updated.plan.code,
            status: updated.status,
            current_period_end: updated.current_period_end,
          },
        }
      }))
      toast.success(`Plan de "${company.name}" changé pour ${updated.plan.name}.`)
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Erreur lors du changement de plan.')
    } finally {
      setChangingPlanForId(null)
    }
  }

  const filteredCompanies = useMemo(() => companies.filter((c) => {
    const term = searchTerm.toLowerCase()
    const matchesSearch = !term
      || c.name.toLowerCase().includes(term)
      || c.owner_email.toLowerCase().includes(term)
      || c.country.toLowerCase().includes(term)
    const matchesStatus = selectedSubStatus === 'all' || c.subscription?.status === selectedSubStatus
    return matchesSearch && matchesStatus
  }), [companies, searchTerm, selectedSubStatus])

  const totalCompanies = companies.length
  const activeCompanies = companies.filter((c) => c.is_active).length
  const totalUsers = companies.reduce((acc, c) => acc + c.users_count, 0)
  const totalProducts = companies.reduce((acc, c) => acc + c.products_count, 0)
  const totalRevenue = companies.reduce((acc, c) => acc + parseFloat(c.monthly_revenue), 0)

  const getSubscriptionBadge = (status?: string) => {
    const config = subscriptionStatusConfig[status ?? ''] ?? subscriptionStatusConfig.canceled
    const Icon = config.icon
    return (
      <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1 w-fit" style={{ background: config.bg, color: config.color }}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    )
  }

  const getVerificationBadge = (status: string) => {
    const config = verificationStatusConfig[status] ?? verificationStatusConfig.incomplete
    return (
      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: config.bg, color: config.color }}>
        {config.label}
      </span>
    )
  }

  if (isGlobalMode) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <Globe className="w-10 h-10" style={{ color: '#334155' }} />
        <p className="text-sm" style={{ color: '#94a3b8' }}>Sélectionnez une instance dans le menu pour voir ses entreprises.</p>
      </div>
    )
  }

  if (isLoading) return <Loader />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5" style={{ color: '#818cf8' }} />
            Entreprises — {selectedServer.name}
          </h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            {totalCompanies} entreprise{totalCompanies > 1 ? 's' : ''} • {activeCompanies} active{activeCompanies > 1 ? 's' : ''}
          </p>
        </div>
        <button
          className="px-3 py-2 rounded-lg transition flex items-center gap-2"
          style={{ background: 'rgba(51, 65, 85, 0.3)', border: '1px solid #334155', color: '#94a3b8' }}
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Exporter</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>{error}</div>
      )}

      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Total entreprises</p>
          <p className="text-xl font-bold text-white">{totalCompanies}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Actives</p>
          <p className="text-xl font-bold" style={{ color: '#22c55e' }}>{activeCompanies}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Utilisateurs</p>
          <p className="text-xl font-bold text-white">{totalUsers}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Produits</p>
          <p className="text-xl font-bold text-white">{totalProducts}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>CA du mois</p>
          <p className="text-xl font-bold" style={{ color: '#22c55e' }}>{formatCurrency(totalRevenue)}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
          <input
            type="text"
            placeholder="Rechercher une entreprise (nom, email, pays)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
            style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
          />
        </div>
        <select
          value={selectedSubStatus}
          onChange={(e) => setSelectedSubStatus(e.target.value)}
          className="rounded-lg px-3 py-2.5 text-white text-sm outline-none transition"
          style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
        >
          <option value="all">Tous les abonnements</option>
          {Object.entries(subscriptionStatusConfig).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>
      </div>

      {/* Tableau des entreprises */}
      <div className="rounded-xl border overflow-hidden" style={{ background: '#1e293b', borderColor: '#334155' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: '#334155' }}>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Entreprise</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Plan</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Abonnement</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Utilisateurs</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Revenus (mois)</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((company) => (
                <tr key={company.id} className="border-b hover:bg-white/5 transition" style={{ borderColor: '#334155' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: 'rgba(99, 102, 241, 0.2)' }}>
                        {company.name.split(' ').map((w) => w[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">{company.name}</p>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0" style={{ color: '#64748b' }} />
                          <span className="text-xs truncate" style={{ color: '#64748b' }}>{company.country}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {company.subscription ? (
                      <div className="relative inline-flex items-center gap-1.5">
                        <select
                          value={company.subscription.plan_code}
                          onChange={(e) => handlePlanChange(company, e.target.value)}
                          disabled={changingPlanForId === company.id}
                          className="text-xs font-medium rounded-lg pl-2 pr-6 py-1 outline-none appearance-none cursor-pointer disabled:opacity-50"
                          style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818cf8' }}
                          title="Changer le plan de cette entreprise"
                        >
                          {!plans.some((p) => p.code === company.subscription!.plan_code) && (
                            <option value={company.subscription.plan_code}>{company.subscription.plan_name}</option>
                          )}
                          {plans.map((p) => (
                            <option key={p.code} value={p.code} style={{ color: '#0f172a' }}>{p.name}</option>
                          ))}
                        </select>
                        {changingPlanForId === company.id ? (
                          <Loader2 className="w-3 h-3 animate-spin absolute right-1.5 pointer-events-none" style={{ color: '#818cf8' }} />
                        ) : (
                          <ChevronDown className="w-3 h-3 absolute right-1.5 pointer-events-none" style={{ color: '#818cf8' }} />
                        )}
                      </div>
                    ) : (
                      <span className="text-xs" style={{ color: '#64748b' }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{getSubscriptionBadge(company.subscription?.status)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="w-3 h-3" style={{ color: '#64748b' }} />
                      <span className="text-white">{company.users_count}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold" style={{ color: '#22c55e' }}>{formatCurrency(parseFloat(company.monthly_revenue))}</p>
                      <p className="text-xs" style={{ color: '#64748b' }}>{company.monthly_orders} commande{company.monthly_orders > 1 ? 's' : ''}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => { setSelectedCompany(company); setIsModalOpen(true) }}
                      className="p-1.5 rounded transition hover:bg-white/10"
                      style={{ color: '#94a3b8' }}
                      title="Voir les détails"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredCompanies.length === 0 && (
          <div className="p-8 text-center">
            <Building2 className="w-12 h-12 mx-auto mb-2" style={{ color: '#334155' }} />
            <p className="text-sm" style={{ color: '#64748b' }}>Aucune entreprise trouvée.</p>
          </div>
        )}
      </div>

      {/* Modal détails entreprise */}
      {isModalOpen && selectedCompany && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            style={{ background: '#1e293b', border: '1px solid #334155' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white" style={{ background: 'rgba(99, 102, 241, 0.2)' }}>
                  {selectedCompany.name.split(' ').map((w) => w[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedCompany.name}</h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs flex items-center gap-1" style={{ color: '#64748b' }}>
                      <Mail className="w-3 h-3" />{selectedCompany.owner_email}
                    </span>
                    {selectedCompany.owner_phone && (
                      <span className="text-xs flex items-center gap-1" style={{ color: '#64748b' }}>
                        <Phone className="w-3 h-3" />{selectedCompany.owner_phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded hover:bg-white/10" style={{ color: '#94a3b8' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Abonnement</p>
                  <div className="mt-1">{getSubscriptionBadge(selectedCompany.subscription?.status)}</div>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Certification</p>
                  <div className="mt-1">{getVerificationBadge(selectedCompany.verification_status)}</div>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Plan</p>
                  <p className="text-sm font-semibold mt-1" style={{ color: '#818cf8' }}>{selectedCompany.subscription?.plan_name ?? '—'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs flex items-center gap-1" style={{ color: '#94a3b8' }}><Users className="w-3 h-3" />Utilisateurs</p>
                  <p className="text-xl font-bold text-white">{selectedCompany.users_count}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs flex items-center gap-1" style={{ color: '#94a3b8' }}><Package className="w-3 h-3" />Produits</p>
                  <p className="text-xl font-bold text-white">{selectedCompany.products_count}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs flex items-center gap-1" style={{ color: '#94a3b8' }}><ShoppingBag className="w-3 h-3" />Commandes (mois)</p>
                  <p className="text-xl font-bold text-white">{selectedCompany.monthly_orders}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs flex items-center gap-1" style={{ color: '#94a3b8' }}><DollarSign className="w-3 h-3" />Revenus (mois)</p>
                  <p className="text-xl font-bold" style={{ color: '#22c55e' }}>{formatCurrency(parseFloat(selectedCompany.monthly_revenue))}</p>
                </div>
              </div>

              {selectedCompany.subscription?.trial_end && (
                <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Fin d'essai</p>
                  <p className="text-sm font-medium text-white">
                    {new Date(selectedCompany.subscription.trial_end).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}

              <div className="p-3 rounded-lg flex items-center justify-between" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                <div>
                  <p className="text-xs flex items-center gap-1" style={{ color: '#94a3b8' }}><FileText className="w-3 h-3" />Documents de vérification</p>
                  <p className="text-sm text-white mt-1">{selectedCompany.documents_count} document{selectedCompany.documents_count > 1 ? 's' : ''} soumis</p>
                </div>
              </div>

              <div className="p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Créée le</p>
                <p className="text-sm text-white">
                  {new Date(selectedCompany.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t" style={{ borderColor: '#334155' }}>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition"
                style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8' }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
