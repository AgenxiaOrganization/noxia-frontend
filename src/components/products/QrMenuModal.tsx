'use client'

import { useEffect, useRef, useState } from 'react'
import { X, QrCode, Download, ExternalLink, Copy, Check, Loader2, Lock } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { getQrMenuSettings, enableQrMenu, type QrMenuSettings } from '@/lib/api/catalog'
import { isFeatureNotIncludedError } from '@/components/ui/FeatureLockedScreen'
import { toast } from 'sonner'

interface QrMenuModalProps {
  companyName?: string
  onClose: () => void
}

/**
 * Modal "Menu par QR code" : décrit la fonctionnalité, permet de l'activer
 * en un clic (génère le QR/l'URL publique côté backend si pas déjà fait —
 * QrMenuSettingsView.post est idempotent), et propose le téléchargement du
 * QR code en PNG à imprimer et afficher en établissement.
 */
export default function QrMenuModal({ companyName = 'etablissement', onClose }: QrMenuModalProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isActivating, setIsActivating] = useState(false)
  const [settings, setSettings] = useState<QrMenuSettings | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [copied, setCopied] = useState(false)
  const canvasWrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    getQrMenuSettings()
      .then((data) => { if (!cancelled) setSettings(data) })
      .catch((e) => {
        if (cancelled) return
        if (isFeatureNotIncludedError(e)) {
          setIsLocked(true)
        } else {
          toast.error('Impossible de charger le statut du menu QR.')
        }
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [])

  const handleActivate = async () => {
    setIsActivating(true)
    try {
      const data = await enableQrMenu()
      setSettings(data)
      toast.success('Menu QR activé !')
    } catch (e) {
      if (isFeatureNotIncludedError(e)) {
        setIsLocked(true)
      } else {
        toast.error("Erreur lors de l'activation du menu QR.")
      }
    } finally {
      setIsActivating(false)
    }
  }

  const handleCopy = () => {
    if (!settings?.menu_url) return
    navigator.clipboard.writeText(settings.menu_url)
    setCopied(true)
    toast.success('Lien du menu copié.')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const canvas = canvasWrapperRef.current?.querySelector('canvas')
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `menu-qr-${companyName.toLowerCase().replace(/\s+/g, '-')}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]" style={{ background: '#1e293b', border: '1px solid #334155' }}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
              <QrCode className="w-4.5 h-4.5" style={{ color: '#818cf8' }} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Menu par QR code</h2>
              <p className="text-xs text-slate-400">Vitrine publique de votre catalogue</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5">
          <p className="text-sm leading-relaxed" style={{ color: '#cbd5e1' }}>
            Générez un QR code à imprimer et afficher dans votre établissement. Vos clients le
            scannent avec leur téléphone et accèdent instantanément à une page listant vos
            boissons, plats et services — avec photos et prix — sans avoir à demander à la
            caisse. La page s&apos;adapte automatiquement aux téléphones (parfaitement responsive).
          </p>

          {isLoading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            </div>
          )}

          {!isLoading && isLocked && (
            <div className="rounded-xl p-4 flex flex-col items-center text-center gap-3" style={{ background: 'rgba(100, 116, 139, 0.1)', border: '1px solid rgba(100, 116, 139, 0.2)' }}>
              <Lock className="w-6 h-6" style={{ color: '#94a3b8' }} />
              <p className="text-sm font-semibold text-white">Fonctionnalité non incluse dans votre plan</p>
              <p className="text-xs" style={{ color: '#94a3b8' }}>
                Passez à un plan supérieur pour activer le menu par QR code.
              </p>
              <a
                href="/subscription"
                className="mt-1 px-4 py-2 rounded-lg text-xs font-semibold text-white transition"
                style={{ background: '#4f46e5' }}
              >
                Voir les plans
              </a>
            </div>
          )}

          {!isLoading && !isLocked && settings && !settings.enabled && (
            <button
              onClick={handleActivate}
              disabled={isActivating}
              className="w-full py-3 rounded-xl text-white text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: '#4f46e5', boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)' }}
            >
              {isActivating ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
              {isActivating ? 'Activation...' : 'Activer le menu QR'}
            </button>
          )}

          {!isLoading && !isLocked && settings?.enabled && settings.menu_url && (
            <div className="flex flex-col items-center gap-4">
              <div ref={canvasWrapperRef} className="p-4 rounded-xl bg-white">
                <QRCodeCanvas value={settings.menu_url} size={180} />
              </div>

              <div className="w-full space-y-2">
                <button
                  onClick={handleDownload}
                  className="w-full py-2.5 rounded-xl text-white text-sm font-semibold transition flex items-center justify-center gap-2"
                  style={{ background: '#4f46e5', boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)' }}
                >
                  <Download className="w-4 h-4" />
                  Télécharger le QR code (PNG)
                </button>
                <div className="flex gap-2">
                  <a
                    href={settings.menu_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', border: '1px solid #334155' }}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Aperçu du menu
                  </a>
                  <button
                    onClick={handleCopy}
                    className="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', border: '1px solid #334155' }}
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copier le lien
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
