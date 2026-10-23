'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { LayoutDashboard, Package, QrCode, Users } from 'lucide-react'

// Nom plutôt que composant : la carte est aussi utilisée depuis des composants serveur,
// qui ne peuvent pas transmettre de fonction à un composant client.
const ICONS = { package: Package, qrCode: QrCode, dashboard: LayoutDashboard, users: Users }

interface LandingImageCardProps {
  src: string
  alt: string
  title: string
  description: string
  icon: keyof typeof ICONS
  color: string
  /** Proportions communes aux cartes d'une même rangée, pour aligner les légendes. */
  aspectClassName: string
  /** Cadrage dans le cadre (ex. « object-[30%_center] »). */
  objectClassName?: string
  /** Rogne le haut de l'image (en %), pour masquer un défaut du fichier source. */
  cropTopPercent?: number
  index?: number
}

export function LandingImageCard({
  src, alt, title, description, icon, color, aspectClassName, objectClassName = 'object-center',
  cropTopPercent = 0, index = 0,
}: LandingImageCardProps) {
  const Icon = ICONS[icon]
  return (
    <motion.figure
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-2xl border border-slate-50/10 bg-slate-950 shadow-xl shadow-black/30"
    >
      <div className={`relative overflow-hidden ${aspectClassName}`}>
        <div className="absolute inset-x-0 bottom-0" style={{ top: `-${cropTopPercent}%` }}>
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className={`object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.04] ${objectClassName}`}
          />
        </div>
        {/* Fondu vers la légende et léger voile coloré au survol */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" aria-hidden="true" />
        <div
          className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: `radial-gradient(circle at 70% 20%, ${color}55, transparent 60%)` }}
          aria-hidden="true"
        />
      </div>

      <figcaption className="relative -mt-8 flex items-start gap-3.5 px-5 pb-5 sm:px-6 sm:pb-6">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border backdrop-blur-md transition-transform duration-300 group-hover:-translate-y-0.5"
          style={{ background: `${color}26`, borderColor: `${color}55`, color }}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 pt-0.5">
          <h3 className="font-display text-base font-bold tracking-tight text-slate-50 sm:text-lg">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-300">{description}</p>
        </div>
      </figcaption>

      {/* Liseré lumineux à la couleur de la carte, révélé au survol */}
      <span
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ boxShadow: `inset 0 0 0 1px ${color}66, 0 20px 50px -25px ${color}` }}
        aria-hidden="true"
      />
    </motion.figure>
  )
}
