'use client'

import { useState, useEffect, useContext } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Users, TrendingUp, AlertTriangle, DollarSign,
  BarChart3, PieChart, ShoppingBag, Target, Zap,
  Server, Globe, Loader2, Mail, Phone, ExternalLink, Building2, BellRing,
} from 'lucide-react'
import { ControleApiError, fetchControleDashboard, type DashboardStats, type ExpiredTrial } from '@/lib/controleApi'
import { sendManualNotification } from '@/lib/superAdminClient'
import { ServerContext } from './layout'
import CompanyDashboard from '@/components/super-admin/CompanyDashboard'

function formatCurrency(amount: number) {
  return amount.toLocaleString() + ' FCFA'
}

function TrialAlertRow({ trial }: { trial: ExpiredTrial }) {
  const [isSending, setIsSending] = useState(false)
  // Compteur optimiste : la vraie valeur vient du resume Celery (rafraichi
  // toutes les 10 min), donc on l'incremente localement des le clic reussi
  // pour un retour immediat, sans attendre le prochain cycle du resume.
  const [reminderCount, setReminderCount] = useState(trial.manual_reminder_count)
  const isExpired = trial.status === 'expired'
  const statusColor = isExpired ? '#ef4444' : '#f59e0b'
  const statusBg = isExpired ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.08)'
  const statusLabel = isExpired ? `Expiré depuis ${trial.days_overdue} j` : `Expire dans ${Math.max(0, -trial.days_overdue)} j`

  const whatsappNumber = trial.owner_phone.replace(/[^\d+]/g, '')

  const handleRelaunch = async () => {
    try {
      setIsSending(true)
      await sendManualNotification(trial.instance_code, trial.company_id, {
        category: 'notification',
        type: 'sub_reminder',
        title: isExpired ? 'Votre essai a expiré' : 'Votre essai arrive à expiration',
        message: isExpired
          ? `Votre période d'essai est terminée depuis ${trial.days_overdue} jour${trial.days_overdue > 1 ? 's' : ''}. Renouvelez votre abonnement pour continuer à utiliser NOXIA sans interruption.`
          : `Votre période d'essai se termine dans ${Math.max(0, -trial.days_overdue)} jour${Math.abs(trial.days_overdue) > 1 ? 's' : ''}. Pensez à choisir un abonnement pour continuer à utiliser NOXIA.`,
        link: '/subscription',
      })
      setReminderCount((c) => c + 1)
      toast.success(`Notification envoyée à ${trial.company_name}.`)
    } catch (err) {
      console.error(err)
      toast.error("Erreur lors de l'envoi de la notification.")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="p-2.5 rounded-lg" style={{ background: statusBg }}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{trial.company_name}</p>
          <div className="flex items-center gap-2 flex-wrap mt-0.5">
            <span className="text-xs" style={{ color: '#64748b' }}>{trial.owner_email}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
              {trial.instance_name}
            </span>
            {reminderCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
                <BellRing className="w-2.5 h-2.5" />
                Relancé {reminderCount}×
              </span>
            )}
          </div>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full shrink-0 font-medium" style={{ background: `${statusColor}20`, color: statusColor }}>
          {statusLabel}
        </span>
      </div>
      <div className="flex items-center gap-1.5 mt-2">
        <button
          onClick={handleRelaunch}
          disabled={isSending}
          className="px-2.5 py-1 rounded text-xs font-medium transition flex items-center gap-1.5 disabled:opacity-50"
          style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}
          title="Envoyer une notification de relance dans son espace"
        >
          {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BellRing className="w-3.5 h-3.5" />}
          Relancer
        </button>
        <a
          href={`mailto:${trial.owner_email}`}
          className="p-1.5 rounded transition hover:bg-white/10"
          style={{ color: '#94a3b8' }}
          title="Envoyer un email"
        >
          <Mail className="w-3.5 h-3.5" />
        </a>
        {whatsappNumber && (
          <a
            href={`https://wa.me/${whatsappNumber.replace('+', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded transition hover:bg-white/10"
            style={{ color: '#94a3b8' }}
            title="Contacter sur WhatsApp"
          >
            <Phone className="w-3.5 h-3.5" />
          </a>
        )}
        <Link
          href={`/super-admin/entreprises?search=${encodeURIComponent(trial.company_name)}`}
          className="p-1.5 rounded transition hover:bg-white/10 ml-auto flex items-center gap-1 text-xs"
          style={{ color: '#818cf8' }}
          title="Voir l'établissement"
        >
          <Building2 className="w-3.5 h-3.5" />
          Voir
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  )
}

export default function SuperAdminDashboard() {
  const { isGlobalMode, selectedServer, selectedCompany } = useContext(ServerContext)

  if (!isGlobalMode && selectedCompany) {
    return <CompanyDashboard instanceCode={selectedServer.id} company={selectedCompany} />
  }

  return <GlobalDashboard />
}

function GlobalDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchControleDashboard()
      .then(setStats)
      .catch((err) => {
        setError(err instanceof ControleApiError ? err.message : 'Erreur de chargement du tableau de bord.')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#818cf8' }} />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <AlertTriangle className="w-6 h-6" style={{ color: '#ef4444' }} />
        <p className="text-sm" style={{ color: '#94a3b8' }}>{error ?? 'Impossible de charger le tableau de bord.'}</p>
      </div>
    )
  }

  const expiredCount = stats.expiredTrials.filter((t) => t.status === 'expired').length
  const expiringSoonCount = stats.expiredTrials.length - expiredCount

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="w-6 h-6" style={{ color: '#818cf8' }} />
            Vue Globale
          </h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            Tous les serveurs • {stats.totalCompanies} entreprises • {stats.totalUsers} utilisateurs
          </p>
        </div>
      </div>

      {/* Stats par serveur */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {stats.serversStats.map((server) => (
          <div key={server.id} className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
            <div className="flex items-center gap-2 mb-1">
              <Server className="w-3 h-3" style={{ color: '#818cf8' }} />
              <span className="text-xs font-medium text-white">{server.name}</span>
            </div>
            <p className="text-lg font-bold text-white">{server.companies}</p>
            <p className="text-xs" style={{ color: '#64748b' }}>entreprises</p>
            <div className="flex justify-between mt-1 text-xs">
              <span style={{ color: '#64748b' }}>{server.users} users</span>
              <span style={{ color: '#22c55e' }}>{formatCurrency(server.revenue)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#94a3b8' }}>MRR Global</p>
            <DollarSign className="w-4 h-4" style={{ color: '#22c55e' }} />
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(stats.mrr)}</p>
          <p className="text-xs mt-1" style={{ color: '#64748b' }}>Abonnements actifs</p>
        </div>

        <div className="p-4 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#94a3b8' }}>Commandes mois</p>
            <ShoppingBag className="w-4 h-4" style={{ color: '#818cf8' }} />
          </div>
          <p className="text-2xl font-bold text-white">{stats.monthlyOrders}</p>
          <p className="text-xs mt-1" style={{ color: '#64748b' }}>Commandes passées</p>
        </div>

        <div className="p-4 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#94a3b8' }}>Commission</p>
            <Zap className="w-4 h-4" style={{ color: '#f59e0b' }} />
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(stats.commission)}</p>
          <p className="text-xs mt-1" style={{ color: '#64748b' }}>{stats.commissionRate}% sur les transactions</p>
        </div>

        <div className="p-4 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#94a3b8' }}>Activation</p>
            <Target className="w-4 h-4" style={{ color: '#8b5cf6' }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: '#8b5cf6' }}>{stats.activationRate}%</p>
          <p className="text-xs mt-1" style={{ color: '#64748b' }}>Boutiques avec &gt;1 produit</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
              {stats.activeCompaniesWithOrders} boutiques actives
            </span>
          </div>
        </div>
      </div>

      {/* Statistiques détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-white">Conversion & Activation</h3>
            <BarChart3 className="w-4 h-4" style={{ color: '#64748b' }} />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: '#94a3b8' }}>Taux de conversion</span>
                <span className="font-bold" style={{ color: '#22c55e' }}>{stats.conversionRate}%</span>
              </div>
              <div className="w-full h-2 rounded-full mt-1" style={{ background: '#334155' }}>
                <div className="h-2 rounded-full" style={{ width: `${stats.conversionRate}%`, background: 'linear-gradient(90deg, #22c55e, #4ade80)' }} />
              </div>
              <p className="text-xs mt-1" style={{ color: '#64748b' }}>Trial → Payant</p>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: '#94a3b8' }}>Taux d'activation</span>
                <span className="font-bold" style={{ color: '#8b5cf6' }}>{stats.activationRate}%</span>
              </div>
              <div className="w-full h-2 rounded-full mt-1" style={{ background: '#334155' }}>
                <div className="h-2 rounded-full" style={{ width: `${stats.activationRate}%`, background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)' }} />
              </div>
              <p className="text-xs mt-1" style={{ color: '#64748b' }}>Boutiques avec &gt;1 produit</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: '#334155' }}>
              <span style={{ color: '#94a3b8' }}>Boutiques actives</span>
              <span className="font-bold text-white">{stats.activeCompanies}</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: '#94a3b8' }}>Avec commandes (30j)</span>
              <span className="font-bold text-white">{stats.activeCompaniesWithOrders}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-white">Répartition des plans</h3>
            <PieChart className="w-4 h-4" style={{ color: '#64748b' }} />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: '#22c55e' }} />
                <span style={{ color: '#94a3b8' }}>Essai gratuit</span>
              </div>
              <span className="font-medium text-white">{stats.planDistribution.essai}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: '#818cf8' }} />
                <span style={{ color: '#94a3b8' }}>Découverte</span>
              </div>
              <span className="font-medium text-white">{stats.planDistribution.decouverte}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: '#f59e0b' }} />
                <span style={{ color: '#94a3b8' }}>Business</span>
              </div>
              <span className="font-medium text-white">{stats.planDistribution.business}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: '#8b5cf6' }} />
                <span style={{ color: '#94a3b8' }}>Pro</span>
              </div>
              <span className="font-medium text-white">{stats.planDistribution.pro}</span>
            </div>
            <div className="pt-2 border-t flex items-center justify-between" style={{ borderColor: '#334155' }}>
              <span className="text-sm font-medium" style={{ color: '#94a3b8' }}>Total MRR</span>
              <span className="text-sm font-bold text-white">{formatCurrency(stats.mrr)}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-white">Revenus</h3>
            <DollarSign className="w-4 h-4" style={{ color: '#22c55e' }} />
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs" style={{ color: '#94a3b8' }}>Revenus clients (cumul)</p>
              <p className="text-xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="flex items-center justify-between text-sm py-1 border-t" style={{ borderColor: '#334155' }}>
              <span style={{ color: '#94a3b8' }}>Commission ({stats.commissionRate}%)</span>
              <span className="font-medium" style={{ color: '#f59e0b' }}>{formatCurrency(stats.commission)}</span>
            </div>
            <div className="flex items-center justify-between text-sm py-1 border-t" style={{ borderColor: '#334155' }}>
              <span style={{ color: '#94a3b8' }}>Ce mois-ci</span>
              <span className="font-medium text-white">{formatCurrency(stats.monthlyRevenue)}</span>
            </div>
            <div className="flex items-center justify-between text-sm py-1 border-t" style={{ borderColor: '#334155' }}>
              <span style={{ color: '#94a3b8' }}>Moyenne par boutique</span>
              <span className="font-medium text-white">{formatCurrency(Math.round(stats.monthlyRevenue / Math.max(1, stats.activeCompanies)))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Essais à relancer — données réelles (Subscription.trial_end) */}
      <div className="p-4 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-white">Essais à relancer</h3>
          <div className="flex items-center gap-2">
            {expiredCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                {expiredCount} expiré{expiredCount > 1 ? 's' : ''}
              </span>
            )}
            {expiringSoonCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                {expiringSoonCount} bientôt
              </span>
            )}
          </div>
        </div>
        {stats.expiredTrials.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="w-10 h-10 mx-auto mb-2" style={{ color: '#334155' }} />
            <p className="text-sm" style={{ color: '#64748b' }}>Aucun essai à relancer pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[320px] overflow-y-auto">
            {stats.expiredTrials.map((trial) => (
              <TrialAlertRow key={`${trial.instance_code}-${trial.company_id}`} trial={trial} />
            ))}
          </div>
        )}
      </div>

      {/* Résumé utilisateurs — dérivé des vraies stats agrégées */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl border text-center" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Utilisateurs total</p>
        </div>
        <div className="p-3 rounded-xl border text-center" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-2xl font-bold text-white">{stats.activeCompanies}</p>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Entreprises actives</p>
        </div>
        <div className="p-3 rounded-xl border text-center" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-2xl font-bold text-white">{stats.monthlyOrders}</p>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Commandes ce mois</p>
        </div>
        <div className="p-3 rounded-xl border text-center" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <p className="text-2xl font-bold" style={{ color: '#ef4444' }}>{stats.expiredTrials.length}</p>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Essais à relancer</p>
        </div>
      </div>
    </div>
  )
}
