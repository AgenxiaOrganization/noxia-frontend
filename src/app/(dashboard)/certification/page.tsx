'use client'

import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
  ShieldCheck, Clock, ShieldAlert, ShieldQuestion, FileText, ExternalLink,
  Copy, Check,
} from 'lucide-react'
import { getMe } from '@/lib/api'
import Loader from '@/components/ui/Loader'
import { toast } from 'sonner'
import Link from 'next/link'

type VerificationStatus = 'incomplete' | 'pending' | 'verified' | 'rejected'

const statusConfig: Record<VerificationStatus, { label: string; icon: typeof ShieldCheck; color: string; bg: string; description: string }> = {
  verified: {
    label: 'Établissement certifié',
    icon: ShieldCheck,
    color: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.15)',
    description: "Votre établissement a été vérifié et certifié par l'équipe NOXIA. Le badge et le QR code ci-dessous prouvent son authenticité.",
  },
  pending: {
    label: 'Vérification en cours',
    icon: Clock,
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.15)',
    description: "Vos documents ont été soumis et sont en cours de revue par l'équipe NOXIA. Vous serez notifié dès que la certification sera accordée.",
  },
  rejected: {
    label: 'Certification rejetée',
    icon: ShieldAlert,
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    description: "Votre demande de certification a été rejetée. Consultez le motif et corrigez vos documents dans Paramètres > Documents.",
  },
  incomplete: {
    label: 'Non certifié',
    icon: ShieldQuestion,
    color: '#64748b',
    bg: 'rgba(100, 116, 139, 0.15)',
    description: "Soumettez vos documents d'établissement dans Paramètres > Documents pour obtenir le badge « certifié » NOXIA.",
  },
}

export default function CertificationPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [companyName, setCompanyName] = useState('')
  const [status, setStatus] = useState<VerificationStatus>('incomplete')
  const [rejectionReason, setRejectionReason] = useState('')
  const [verificationCode, setVerificationCode] = useState<string | null>(null)
  const [reviewedAt, setReviewedAt] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState('')

  useEffect(() => { setOrigin(window.location.origin) }, [])

  useEffect(() => {
    let cancelled = false
    getMe()
      .then((fresh) => {
        if (cancelled || !fresh.company) return
        setCompanyName(fresh.company.name)
        setStatus((fresh.company.verification_status as VerificationStatus) || 'incomplete')
        setRejectionReason(fresh.company.verification_rejection_reason || '')
        setVerificationCode(fresh.company.verification_code ?? null)
        setReviewedAt(fresh.company.verification_reviewed_at ?? null)
      })
      .catch((e) => {
        console.error('Erreur chargement du statut de certification', e)
        toast.error('Impossible de charger le statut de certification.')
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (isLoading) return <Loader />

  const config = statusConfig[status] ?? statusConfig.incomplete
  const Icon = config.icon
  const verifyUrl = verificationCode && origin ? `${origin}/verify-doc?code=${encodeURIComponent(verificationCode)}` : null

  const handleCopy = () => {
    if (!verifyUrl) return
    navigator.clipboard.writeText(verifyUrl)
    setCopied(true)
    toast.success('Lien de vérification copié.')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center p-4 sm:p-6">
    <div className="space-y-6 max-w-3xl w-full mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary-400" />
          Certification NOXIA
        </h1>
        <p className="text-sm text-dark-300 mt-1">
          Statut de vérification officielle de {companyName || 'votre établissement'}.
        </p>
      </div>

      <div
        className="p-6 rounded-2xl border flex flex-col items-center text-center gap-4 glass-card"
        style={{ borderColor: config.color + '40' }}
      >
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: config.bg }}>
          <Icon className="w-8 h-8" style={{ color: config.color }} />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: config.color }}>{config.label}</span>
          <h2 className="text-xl font-bold text-white mt-1">{companyName}</h2>
        </div>
        <p className="text-sm text-dark-300 max-w-md">{config.description}</p>

        {status === 'rejected' && rejectionReason && (
          <div className="w-full p-3 rounded-lg text-sm text-left" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>
            <strong>Motif :</strong> {rejectionReason}
          </div>
        )}

        {status !== 'verified' && (
          <Link
            href="/settings?tab=documents"
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-95 bg-primary-500 hover:bg-primary-600 flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Gérer mes documents
          </Link>
        )}
      </div>

      {status === 'verified' && verifyUrl && (
        <div className="p-6 rounded-2xl border border-dark-800/40 glass-card flex flex-col sm:flex-row items-center gap-6">
          <div className="p-3 rounded-xl bg-white shrink-0">
            <QRCodeSVG value={verifyUrl} size={140} />
          </div>
          <div className="flex-1 space-y-3 text-center sm:text-left">
            <div>
              <p className="text-sm font-semibold text-white">Badge de vérification publique</p>
              <p className="text-xs text-dark-300 mt-1">
                Toute personne qui scanne ce QR code (ou visite le lien) peut confirmer que
                {' '}{companyName} est un établissement certifié par NOXIA — comme un badge vérifié
                Facebook/Instagram.
              </p>
            </div>
            {reviewedAt && (
              <p className="text-xs text-dark-400">
                Certifié depuis le {new Date(reviewedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-lg text-xs font-medium transition flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-dark-200"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Ouvrir la page de vérification
              </a>
              <button
                onClick={handleCopy}
                className="px-3 py-2 rounded-lg text-xs font-medium transition flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-dark-200"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-primary-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copier le lien
              </button>
            </div>
            <p className="text-[11px] font-mono text-dark-400">Code : {verificationCode}</p>
          </div>
        </div>
      )}
    </div>
    </div>
  )
}
