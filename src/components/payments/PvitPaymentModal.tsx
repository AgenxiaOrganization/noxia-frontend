'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Loader2, CheckCircle2, XCircle, ArrowLeft, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import {
  initiatePvitPayment, getPvitTransactionStatus,
  type Plan, type PvitMethod, type PvitTransaction, type BillingPeriod,
} from '@/lib/api/subscription'
import { PaymentMethodLogo } from './PaymentMethodLogo'

/**
 * Modal de paiement MyPVit — composant autonome et reutilisable : ne
 * connait que `plan` en entree et remonte `onSuccess()` une fois le
 * paiement confirme. Deux flux distincts cote MyPVit (voir
 * subscriptions/payments/services.py::initiate_payment cote backend) :
 *
 * - Mobile Money (Airtel/Moov) : POST /rest, confirmation exclusivement
 *   par webhook — ce composant sonde GET .../transactions/{reference}/
 *   jusqu'a SUCCESS/FAILED pendant que le client valide sur son telephone.
 * - Carte (Visa/Mastercard) : POST /link, la reponse contient une URL de
 *   formulaire bancaire PVit — ce composant redirige immediatement le
 *   navigateur vers cette URL (pas de polling, le client quitte la page).
 */

const POLL_INTERVAL_MS = 4000
const POLL_TIMEOUT_MS = 3 * 60 * 1000 // 3 minutes — au-dela, statut incertain (voir doc MyPVit)

type Step = 'select-method' | 'enter-number' | 'processing' | 'redirecting' | 'success' | 'failed' | 'timeout'

const methodOptions: { value: PvitMethod; label: string; hint: string; disabled?: boolean }[] = [
  { value: 'AIRTEL_MONEY', label: 'Airtel Money', hint: 'Paiement mobile' },
  { value: 'MOOV_MONEY', label: 'Moov Money', hint: 'Paiement mobile' },
  { value: 'VISA_MASTERCARD', label: 'Visa / Mastercard', hint: 'Bientôt disponible', disabled: true },
]

export default function PvitPaymentModal({
  plan,
  billingPeriod = 'monthly',
  onClose,
  onSuccess,
}: {
  plan: Plan
  billingPeriod?: BillingPeriod
  onClose: () => void
  onSuccess: () => void
}) {
  const displayAmount = billingPeriod === 'yearly' && plan.yearly_price
    ? Number(plan.yearly_price)
    : Number(plan.price)
  const periodSuffix = billingPeriod === 'yearly' ? 'an' : plan.period_label

  const [step, setStep] = useState<Step>('select-method')
  const [method, setMethod] = useState<PvitMethod | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [transaction, setTransaction] = useState<PvitTransaction | null>(null)
  const [failureReason, setFailureReason] = useState('')
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollDeadline = useRef<number>(0)

  useEffect(() => () => { if (pollTimer.current) clearInterval(pollTimer.current) }, [])

  const stopPolling = () => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current)
      pollTimer.current = null
    }
  }

  const startPolling = (reference: string) => {
    pollDeadline.current = Date.now() + POLL_TIMEOUT_MS
    pollTimer.current = setInterval(async () => {
      if (Date.now() > pollDeadline.current) {
        stopPolling()
        setStep('timeout')
        return
      }
      try {
        const current = await getPvitTransactionStatus(reference)
        setTransaction(current)
        if (current.status === 'success') {
          stopPolling()
          setStep('success')
          toast.success(`Paiement confirmé : plan ${current.plan_name} activé.`)
          onSuccess()
        } else if (current.status === 'failed') {
          stopPolling()
          setFailureReason(current.failure_reason)
          setStep('failed')
        }
      } catch (err) {
        console.error('Erreur polling statut paiement', err)
      }
    }, POLL_INTERVAL_MS)
  }

  const handleSelectMethod = (selected: PvitMethod) => {
    if (methodOptions.find((o) => o.value === selected)?.disabled) return
    setMethod(selected)
    if (selected === 'VISA_MASTERCARD') {
      submitPayment(selected, '')
    } else {
      setStep('enter-number')
    }
  }

  const submitPayment = async (selectedMethod: PvitMethod, number: string) => {
    setIsSubmitting(true)
    setStep('processing')
    try {
      const created = await initiatePvitPayment(plan.code, selectedMethod, number, billingPeriod)
      setTransaction(created)
      if (selectedMethod === 'VISA_MASTERCARD') {
        if (!created.redirect_url) {
          throw new Error("Le lien de paiement carte n'a pas pu être généré.")
        }
        setStep('redirecting')
        window.location.href = created.redirect_url
        return
      }
      startPolling(created.merchant_reference)
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'initiation du paiement.")
      setStep(selectedMethod === 'VISA_MASTERCARD' ? 'select-method' : 'enter-number')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitNumber = (e: React.FormEvent) => {
    e.preventDefault()
    if (!method || !phoneNumber.trim()) return
    submitPayment(method, phoneNumber.trim())
  }

  const handleRetry = () => {
    stopPolling()
    setTransaction(null)
    setFailureReason('')
    setStep('select-method')
    setMethod(null)
  }

  const isBlocking = step === 'processing' || step === 'redirecting'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={isBlocking ? undefined : onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-7 sm:p-8"
        style={{ background: '#1e293b', border: '1px solid #334155', boxShadow: '0 25px 60px -15px rgba(0,0,0,0.5)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Payer l'abonnement</h2>
            <p className="text-sm mt-0.5" style={{ color: '#94a3b8' }}>
              {plan.name} — <span className="font-semibold" style={{ color: '#a5b4fc' }}>{displayAmount.toLocaleString()} FCFA</span>/{periodSuffix}
            </p>
          </div>
          {!isBlocking && (
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition" style={{ color: '#94a3b8' }}>
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {step === 'select-method' && (
          <div className="space-y-3">
            <p className="text-sm mb-3" style={{ color: '#94a3b8' }}>Choisissez un moyen de paiement</p>
            {methodOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSelectMethod(opt.value)}
                disabled={opt.disabled}
                className="w-full flex items-center gap-4 p-4 rounded-xl border transition"
                style={{
                  borderColor: '#334155',
                  opacity: opt.disabled ? 0.5 : 1,
                  cursor: opt.disabled ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!opt.disabled) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <div className="w-24 h-14 rounded-xl flex items-center justify-center shrink-0 px-3" style={{ background: 'white' }}>
                  <PaymentMethodLogo method={opt.value} className="h-8" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-base font-semibold text-white">{opt.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: opt.disabled ? '#f59e0b' : '#64748b' }}>{opt.hint}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 'enter-number' && method && (
          <form onSubmit={handleSubmitNumber} className="space-y-4">
            <button
              type="button"
              onClick={() => setStep('select-method')}
              className="flex items-center gap-1.5 text-sm transition hover:text-white"
              style={{ color: '#94a3b8' }}
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Changer de moyen
            </button>

            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #334155' }}>
              <div className="w-16 h-10 rounded-lg flex items-center justify-center shrink-0 px-2" style={{ background: 'white' }}>
                <PaymentMethodLogo method={method} className="h-6" />
              </div>
              <p className="text-sm font-medium text-white">{methodOptions.find((o) => o.value === method)?.label}</p>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: '#94a3b8' }}>
                Numéro de téléphone
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Ex: 066123456"
                autoFocus
                className="w-full rounded-xl px-4 py-3.5 text-white text-base outline-none transition"
                style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !phoneNumber.trim()}
              className="w-full py-3.5 rounded-xl text-white text-base font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2 hover:brightness-110"
              style={{ background: '#4f46e5', boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)' }}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Payer {displayAmount.toLocaleString()} FCFA
            </button>
          </form>
        )}

        {step === 'processing' && (
          <div className="flex flex-col items-center text-center py-8 gap-3">
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#818cf8' }} />
            <p className="text-sm font-medium text-white">
              {transaction ? 'En attente de confirmation…' : 'Initiation du paiement…'}
            </p>
            <p className="text-xs max-w-xs" style={{ color: '#94a3b8' }}>
              Validez la transaction depuis votre téléphone (code PIN opérateur).
            </p>
          </div>
        )}

        {step === 'redirecting' && (
          <div className="flex flex-col items-center text-center py-8 gap-3">
            <ExternalLink className="w-10 h-10" style={{ color: '#818cf8' }} />
            <p className="text-sm font-medium text-white">Redirection vers le paiement sécurisé…</p>
            <p className="text-xs max-w-xs" style={{ color: '#94a3b8' }}>
              Vous allez être redirigé vers le formulaire bancaire de PVit pour finaliser votre paiement par carte.
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center text-center py-8 gap-3">
            <CheckCircle2 className="w-12 h-12" style={{ color: '#22c55e' }} />
            <p className="text-sm font-semibold text-white">Paiement confirmé !</p>
            <p className="text-xs" style={{ color: '#94a3b8' }}>Le plan {plan.name} est maintenant actif.</p>
            <button
              onClick={onClose}
              className="mt-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ background: '#4f46e5' }}
            >
              Fermer
            </button>
          </div>
        )}

        {(step === 'failed' || step === 'timeout') && (
          <div className="flex flex-col items-center text-center py-8 gap-3">
            <XCircle className="w-12 h-12" style={{ color: '#ef4444' }} />
            <p className="text-sm font-semibold text-white">
              {step === 'failed' ? 'Paiement échoué' : 'Statut incertain'}
            </p>
            <p className="text-xs max-w-xs" style={{ color: '#94a3b8' }}>
              {step === 'failed'
                ? failureReason || 'La transaction a été refusée ou annulée.'
                : "Nous n'avons pas reçu de confirmation à temps. Vérifiez votre abonnement dans quelques minutes avant de réessayer."}
            </p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleRetry}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                style={{ background: '#4f46e5' }}
              >
                Réessayer
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ border: '1px solid #334155', color: '#94a3b8' }}
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
