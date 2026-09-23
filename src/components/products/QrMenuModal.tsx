'use client'

import { useEffect, useRef, useState } from 'react'
import { X, QrCode, Download, ExternalLink, Copy, Check, Loader2, Lock, ImagePlus, Trash2 } from 'lucide-react'
import QRCodeStyling from 'qr-code-styling'
import { getQrMenuSettings, enableQrMenu, type QrMenuSettings } from '@/lib/api/catalog'
import { isFeatureNotIncludedError } from '@/components/ui/FeatureLockedScreen'
import { getCompany } from '@/lib/auth'
import { toast } from 'sonner'

const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024 // 2 Mo

interface QrMenuModalProps {
  companyName?: string
  onClose: () => void
}

const QR_SIZE = 260
// Proportion du QR occupée par l'image/bandeau central. 0.4 est proche du
// maximum raisonnable avec errorCorrectionLevel 'H' (30% de redondance) :
// au-delà, hideBackgroundDots peut recouvrir trop de modules porteurs
// d'information et rendre le QR imprévisible à scanner, malgré excavate.
const IMAGE_SIZE_RATIO = 0.4

/** Dessine un badge "SCANNEZ-MOI" (fond blanc arrondi + texte indigo) sur un
 * canvas caché et le renvoie en data URL — c'est ainsi qu'on obtient un
 * insert textuel au centre du QR : qr-code-styling n'a pas de notion de
 * "texte central" native, seulement une image (voir `image` dans Options),
 * donc on fabrique nous-mêmes cette image plutôt que d'ajouter une
 * dépendance de rendu de texte supplémentaire. */
function buildScanMeBadge(size: number): string {
  const canvas = document.createElement('canvas')
  const scale = 3 // sur-échantillonnage pour un rendu net une fois redimensionné dans le QR
  canvas.width = size * scale
  canvas.height = size * scale
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  ctx.scale(scale, scale)

  ctx.fillStyle = '#ffffff'
  const radius = size * 0.18
  ctx.beginPath()
  ctx.moveTo(radius, 0)
  ctx.arcTo(size, 0, size, size, radius)
  ctx.arcTo(size, size, 0, size, radius)
  ctx.arcTo(0, size, 0, 0, radius)
  ctx.arcTo(0, 0, size, 0, radius)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = '#4338ca'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `700 ${size * 0.135}px system-ui, sans-serif`
  ctx.fillText('SCANNEZ', size / 2, size * 0.4)
  ctx.font = `800 ${size * 0.2}px system-ui, sans-serif`
  ctx.fillText('MOI', size / 2, size * 0.66)

  return canvas.toDataURL('image/png')
}

/**
 * Modal "Menu par QR code" : décrit la fonctionnalité, permet de l'activer
 * en un clic (génère le QR/l'URL publique côté backend si pas déjà fait —
 * QrMenuSettingsView.post est idempotent), et propose le téléchargement du
 * QR code en PNG à imprimer et afficher en établissement. Le QR lui-même est
 * stylisé (viseurs arrondis, points ronds) via qr-code-styling, qui rend
 * dans un <canvas>/<svg> qu'il gère lui-même (pas un composant React
 * déclaratif standard) — piloté ici en impératif via useRef/useEffect.
 */
export default function QrMenuModal({ companyName, onClose }: QrMenuModalProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isActivating, setIsActivating] = useState(false)
  const [settings, setSettings] = useState<QrMenuSettings | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [copied, setCopied] = useState(false)
  // Image choisie localement par l'utilisateur pour le centre du QR — jamais
  // le logo distant de l'établissement (R2/S3) : un fichier local évite tout
  // souci CORS lors de l'export (téléchargement PNG/SVG) et fonctionne même
  // sans logo configuré. null = badge "SCANNEZ-MOI" généré par défaut.
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null)
  const [resolvedCompanyName, setResolvedCompanyName] = useState(companyName ?? 'établissement')
  const qrContainerRef = useRef<HTMLDivElement>(null)
  const qrInstanceRef = useRef<QRCodeStyling | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!companyName) {
      const name = getCompany()?.name
      if (name) setResolvedCompanyName(name)
    }
  }, [companyName])

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // permet de resélectionner le même fichier ensuite
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Merci de choisir un fichier image.')
      return
    }
    if (file.size > MAX_LOGO_SIZE_BYTES) {
      toast.error('Image trop lourde (2 Mo maximum).')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setLogoDataUrl(reader.result as string)
    reader.onerror = () => toast.error("Impossible de lire cette image.")
    reader.readAsDataURL(file)
  }

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

  // Construit/rafraîchit le rendu du QR (image centrale + valeur encodée) —
  // qr-code-styling n'étant pas un composant React déclaratif, on pilote
  // nous-mêmes son cycle de vie : une seule instance créée au premier rendu,
  // puis `update()` à chaque changement plutôt que de tout redétruire.
  useEffect(() => {
    if (!settings?.enabled || !settings.menu_url || !qrContainerRef.current) return

    const centerImage = logoDataUrl ?? buildScanMeBadge(200)
    const options = {
      width: QR_SIZE,
      height: QR_SIZE,
      type: 'canvas' as const,
      data: settings.menu_url,
      margin: 8,
      image: centerImage || undefined,
      qrOptions: { errorCorrectionLevel: 'H' as const },
      imageOptions: { imageSize: IMAGE_SIZE_RATIO, hideBackgroundDots: true, margin: 6, crossOrigin: 'anonymous' },
      dotsOptions: { type: 'dots' as const, color: '#1e1b4b' },
      cornersSquareOptions: { type: 'extra-rounded' as const, color: '#4338ca' },
      cornersDotOptions: { type: 'dot' as const, color: '#4338ca' },
      backgroundOptions: { color: '#ffffff' },
    }

    if (!qrInstanceRef.current) {
      qrInstanceRef.current = new QRCodeStyling(options)
      qrContainerRef.current.innerHTML = ''
      qrInstanceRef.current.append(qrContainerRef.current)
    } else {
      qrInstanceRef.current.update(options)
    }
  }, [settings?.enabled, settings?.menu_url, logoDataUrl])

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
    if (!qrInstanceRef.current) return
    qrInstanceRef.current.download({
      name: `menu-qr-${resolvedCompanyName.toLowerCase().replace(/\s+/g, '-')}`,
      extension: 'png',
    })
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
              <div
                className="relative p-4 rounded-2xl"
                style={{
                  background: '#ffffff',
                  boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(99, 102, 241, 0.15)',
                }}
              >
                <div ref={qrContainerRef} style={{ width: QR_SIZE, height: QR_SIZE }} />
              </div>
              <p className="text-xs text-center -mt-1" style={{ color: '#64748b' }}>
                {resolvedCompanyName}
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoSelect}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
                  style={{ background: 'rgba(99, 102, 241, 0.12)', color: '#818cf8' }}
                >
                  <ImagePlus className="w-3.5 h-3.5" />
                  {logoDataUrl ? "Changer l'image" : 'Remplacer par votre logo'}
                </button>
                {logoDataUrl && (
                  <button
                    onClick={() => setLogoDataUrl(null)}
                    className="p-1.5 rounded-lg transition"
                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}
                    title="Revenir au badge par défaut"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
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
