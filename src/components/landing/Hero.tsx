'use client'

import Image from 'next/image'
import { MotionConfig, motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1] as const

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.25 },
  },
}

const itemVariants = {
  hidden: { y: 24, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.7, ease: EASE } },
}

export function Hero() {
  return (
    // reducedMotion="user" : sans déplacement ni zoom si le système demande moins d'animations.
    <MotionConfig reducedMotion="user">
      <section
        className="relative isolate flex min-h-screen supports-[height:100svh]:min-h-[100svh] items-end overflow-hidden bg-slate-950 pb-14 pt-28 sm:pb-20 lg:items-center lg:pb-16"
        aria-label="Section principale de présentation"
      >
        {/* Photographie : zoom d'entrée très lent, joué une seule fois */}
        <motion.div
          className="absolute inset-0 -z-20"
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ scale: { duration: 18, ease: 'easeOut' }, opacity: { duration: 1.2, ease: 'easeOut' } }}
          aria-hidden="true"
        >
          <Image
            src="/images/noxia/noxiaHero.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[70%_center] lg:object-[88%_center]"
          />
        </motion.div>

        {/* Voiles de lisibilité : vertical sur mobile/tablette, latéral sur grand écran */}
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/10 lg:hidden" />
          <div className="absolute inset-0 hidden bg-gradient-to-r from-slate-950/95 via-slate-950/70 via-45% to-transparent lg:block" />
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-slate-950/80 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-dark-950 to-transparent" />
          <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_55%,rgba(2,6,23,0.45)_100%)]" />
          {/* Touches violet/bleu de l'identité NOXIA */}
          <motion.div
            className="absolute -left-40 top-1/4 h-[520px] w-[520px] rounded-full bg-primary-500/20 blur-[140px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 0.6, ease: 'easeOut' }}
          />
          <div className="absolute bottom-0 left-1/3 h-[320px] w-[480px] rounded-full bg-indigo-600/15 blur-[120px]" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-xl space-y-6 text-left lg:max-w-2xl"
          >
            <motion.div
              variants={itemVariants}
              className="relative inline-flex items-center gap-2 rounded-full border border-primary-400/30 bg-slate-950/50 px-3.5 py-1.5 text-xs font-semibold text-indigo-200 shadow-inner backdrop-blur-md"
            >
              <span className="h-2 w-2 rounded-full bg-accent-400 motion-safe:animate-ping" aria-hidden="true" />
              <span className="absolute left-[18px] h-1.5 w-1.5 rounded-full bg-accent-500" aria-hidden="true" />
              Lancement beta
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-50 [text-shadow:0_2px_24px_rgba(2,6,23,0.55)] sm:text-5xl lg:text-6xl"
            >
              Le&nbsp;
              <span className="select-none bg-gradient-to-r from-violet-300 via-indigo-300 to-sky-300 bg-clip-text text-transparent">
                Pilier intelligent
              </span>
              &nbsp;pour votre bar ou restaurant
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="max-w-xl text-base font-medium leading-relaxed text-slate-200 [text-shadow:0_1px_12px_rgba(2,6,23,0.6)] sm:text-lg"
            >
              Gérer vos stocks, vos ventes et votre équipe n&apos;a jamais été aussi simple.
              Pilotez tout depuis votre téléphone, WhatsApp ou Telegram.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col gap-4 pt-2 sm:flex-row">
              <a
                href="/register"
                className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-primary-500 to-indigo-600 px-8 py-4 text-center text-base font-bold text-slate-50 shadow-xl shadow-primary-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:from-primary-400 hover:to-indigo-500 hover:shadow-2xl hover:shadow-primary-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                aria-label="Démarrer gratuitement avec NOXIA"
              >
                <span className="absolute inset-0 bg-slate-50/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
                <span className="relative">Démarrer gratuitement</span>
                <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </a>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex items-center gap-4 pt-4 text-sm text-slate-300"
              aria-label="Plus de 15 établissements utilisent NOXIA"
            >
              <div className="flex -space-x-2.5" role="img" aria-label="Avatars de clients NOXIA">
                {['JD', 'MK', 'AL'].map((initials) => (
                  <div
                    key={initials}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-950 bg-gradient-to-br from-primary-500 to-indigo-600 text-xs font-bold text-slate-50 shadow-md"
                    aria-hidden="true"
                  >
                    {initials}
                  </div>
                ))}
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-950 bg-slate-900/90 text-xs font-bold text-slate-300"
                  aria-hidden="true"
                >
                  +12
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </MotionConfig>
  )
}
