'use client'

import { useState, useEffect, useContext } from 'react'
import { ServerContext } from '../layout'
import {
  listInstancePaymentReviews, confirmInstancePayment, type ProxyPaymentReview,
} from '@/lib/superAdminClient'
import { getPlatformUser } from '@/lib/platformAuth'
import Loader from '@/components/ui/Loader'
import { toast } from 'sonner'
import { Wallet, Building2, Check, Globe, Loader2, Copy, RefreshCw } from 'lucide-react'

const STATUS_STYLE: Record<string, { background: string; color: string }> = {
  success: { background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' },
  failed: { background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' },
  expired: { background: 'rgba(100, 116, 139, 0.2)', color: '#94a3b8' },
}
const PENDING_STYLE = { background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }

const OUTCOME_MESSAGE: Record<string, string> = {
  success: 'Paiement confirmé : abonnement prolongé.',
  late_success: 'Paiement confirmé (succès tardif) : abonnement prolongé.',
  needs_review: "Montant inférieur au dû : paiement gardé à examiner, abonnement non prolongé.",
  already_success: 'Ce paiement était déjà confirmé.',
}

function formatXaf(amount: string) {
  return `${Number(amount).toLocaleString('fr-FR')} FCFA`
}

export default function SuperAdminPaiements() {
  const { selectedServer, isGlobalMode } = useContext(ServerContext)

  const [payments, setPayments] = useState<ProxyPaymentReview[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Lu apres hydratation (localStorage), comme super-admin/entreprises.
  const [canConfirm, setCanConfirm] = useState(false)
  const [confirming, setConfirming] = useState<ProxyPaymentReview | null>(null)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => setCanConfirm(getPlatformUser()?.role === 'super_admin'), [])

  const loadData = () => {
    if (isGlobalMode) {
      setPayments([])
      return
    }
    let cancelled = false
    setIsLoading(true)
    setError(null)
    listInstancePaymentReviews(selectedServer.id)
      .then((list) => { if (!cancelled) setPayments(list) })
      .catch((e) => {
        if (cancelled) return
        console.error('Erreur chargement des paiements à examiner', e)
        setError('Impossible de charger les paiements de cette instance.')
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }

  useEffect(loadData, [selectedServer.id, isGlobalMode])

  const openConfirm = (payment: ProxyPaymentReview) => {
    setConfirming(payment)
    setAmount(String(Math.round(Number(payment.amount))))
    setNote('')
  }

  const copy = (value: string) => {
    navigator.clipboard?.writeText(value).then(() => toast.success('Copié.'), () => undefined)
  }

  const handleConfirm = async () => {
    if (!confirming || !amount || note.trim().length < 5) return
    setIsSubmitting(true)
    try {
      const { outcome, transaction } = await confirmInstancePayment(
        selectedServer.id, confirming.merchant_reference, amount, note.trim(),
      )
      setPayments((prev) => (
        outcome === 'needs_review'
          ? prev.map((p) => (p.id === transaction.id ? transaction : p))
          : prev.filter((p) => p.id !== transaction.id)
      ))
      const message = OUTCOME_MESSAGE[outcome] ?? `Résultat : ${outcome}`
      if (outcome === 'needs_review') toast.warning(message)
      else toast.success(`${confirming.company_name} — ${message}`)
      setConfirming(null)
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la confirmation.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isGlobalMode) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <Globe className="w-10 h-10" style={{ color: '#334155' }} />
        <p className="text-sm" style={{ color: '#94a3b8' }}>Sélectionnez une instance dans le menu pour voir ses paiements à examiner.</p>
      </div>
    )
  }

  if (isLoading) return <Loader />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wallet className="w-5 h-5" style={{ color: '#818cf8' }} />
            Paiements à examiner — {selectedServer.name}
          </h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            Abonnements payés via MyPVit non confirmés automatiquement (60 derniers jours).
            Vérifiez chaque paiement sur le tableau de bord MyPVit avant de le confirmer.
          </p>
        </div>
        <button
          onClick={loadData}
          className="px-3 py-2 rounded-lg text-sm transition flex items-center gap-1.5 hover:bg-white/5 self-start"
          style={{ border: '1px solid #334155', color: '#94a3b8' }}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Actualiser
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>{error}</div>
      )}

      <div className="grid gap-3">
        {payments.map((payment) => {
          const confirmable = payment.status !== 'success'
          return (
            <div
              key={payment.id}
              className="p-4 rounded-xl border flex flex-col lg:flex-row lg:items-center gap-4"
              style={{ background: '#1e293b', borderColor: '#334155' }}
            >
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white">{formatXaf(payment.amount)}</span>
                  <span className="text-sm" style={{ color: '#cbd5e1' }}>{payment.plan_name} • {payment.method_display}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={STATUS_STYLE[payment.status] ?? PENDING_STYLE}>
                    {payment.status === 'success' ? 'Réussi — à examiner' : payment.status_display}
                  </span>
                  {payment.callback_received && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(34, 197, 94, 0.12)', color: '#4ade80' }}>
                      Rappel MyPVit reçu
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-wrap text-xs" style={{ color: '#94a3b8' }}>
                  <Building2 className="w-3 h-3 shrink-0" style={{ color: '#64748b' }} />
                  <span className="truncate">{payment.company_name}</span>
                  <span style={{ color: '#475569' }}>•</span>
                  <span>
                    {new Date(payment.created_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-wrap text-xs font-mono" style={{ color: '#64748b' }}>
                  <button onClick={() => copy(payment.merchant_reference)} className="flex items-center gap-1 hover:text-white transition" title="Référence NOXIA">
                    {payment.merchant_reference} <Copy className="w-3 h-3" />
                  </button>
                  {payment.pvit_transaction_id && (
                    <button onClick={() => copy(payment.pvit_transaction_id)} className="flex items-center gap-1 hover:text-white transition" title="Identifiant MyPVit">
                      {payment.pvit_transaction_id} <Copy className="w-3 h-3" />
                    </button>
                  )}
                </div>
                {(payment.review_reason || payment.failure_reason) && (
                  <p className="text-xs" style={{ color: '#f59e0b' }}>{payment.review_reason || payment.failure_reason}</p>
                )}
              </div>

              {canConfirm && confirmable && (
                <button
                  onClick={() => openConfirm(payment)}
                  className="px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 shrink-0 self-start lg:self-center"
                  style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}
                >
                  <Check className="w-3.5 h-3.5" />
                  Confirmer le paiement
                </button>
              )}
            </div>
          )
        })}

        {payments.length === 0 && !error && (
          <div className="p-8 text-center rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
            <Wallet className="w-12 h-12 mx-auto mb-2" style={{ color: '#334155' }} />
            <p className="text-sm" style={{ color: '#64748b' }}>Aucun paiement à examiner.</p>
          </div>
        )}
      </div>

      {confirming && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => !isSubmitting && setConfirming(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 space-y-4"
            style={{ background: '#1e293b', border: '1px solid #334155' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Confirmer le paiement</h2>
              <p className="text-sm" style={{ color: '#94a3b8' }}>
                {confirming.company_name} — {confirming.plan_name} — {formatXaf(confirming.amount)}
              </p>
            </div>
            <ol className="text-xs space-y-1 list-decimal pl-4" style={{ color: '#cbd5e1' }}>
              <li>Sur mypvit.pro, ouvrez l&apos;historique des transactions (pas les rapatriements).</li>
              <li>
                Retrouvez <span className="font-mono">{confirming.pvit_transaction_id || confirming.merchant_reference}</span>
                {' '}et vérifiez qu&apos;elle est <b>réussie</b>.
              </li>
              <li>Saisissez le montant affiché par MyPVit. L&apos;abonnement n&apos;est prolongé que s&apos;il couvre le montant dû.</li>
            </ol>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: '#94a3b8' }}>Montant lu sur MyPVit (FCFA)</label>
              <input
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none"
                style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: '#94a3b8' }}>Note (obligatoire, gardée dans le journal)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Ex : vu réussi sur MyPVit le 02/11 à 21:30"
                className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none resize-none"
                style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirming(null)}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition"
                style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8' }}
              >
                Annuler
              </button>
              <button
                onClick={handleConfirm}
                disabled={!amount || note.trim().length < 5 || isSubmitting}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
