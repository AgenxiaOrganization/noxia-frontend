import Image from 'next/image'
import type { PvitMethod } from '@/lib/api/subscription'

/**
 * Logos des moyens de paiement supportes par MyPVit — fichiers reels dans
 * public/logos/, reutilisables partout ou un moyen de paiement doit etre
 * affiche (modal, recapitulatif, facture...). Visa et Mastercard sont deux
 * logos distincts affiches cote a cote (MyPVit ne les separe pas au niveau
 * API — un seul `service: VISA_MASTERCARD` — mais visuellement ce sont deux
 * marques differentes, pas un logo compose unique).
 */

const LOGO_SRC: Record<PvitMethod, string | string[]> = {
  AIRTEL_MONEY: '/logos/airtel-money.png',
  MOOV_MONEY: '/logos/moov-money.png',
  VISA_MASTERCARD: ['/logos/visa.png', '/logos/mstercard.jpg'],
}

export function PaymentMethodLogo({ method, className = 'h-5' }: { method: PvitMethod; className?: string }) {
  const src = LOGO_SRC[method]
  if (Array.isArray(src)) {
    return (
      <span className={`inline-flex items-center gap-2.5 ${className}`}>
        {src.map((s) => (
          <span key={s} className="relative h-full aspect-[3/2]">
            <Image src={s} alt="" fill sizes="48px" className="object-contain" unoptimized />
          </span>
        ))}
      </span>
    )
  }
  return (
    <span className={`relative inline-block ${className} aspect-[16/9]`}>
      <Image src={src} alt="" fill sizes="80px" className="object-contain" unoptimized />
    </span>
  )
}

export default PaymentMethodLogo
