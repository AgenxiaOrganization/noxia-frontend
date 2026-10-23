'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'

export function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 24, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as const
      }
    }
  }

  return (
    <section 
      className="relative min-h-screen flex items-center pt-6 pb-2 overflow-hidden bg-dark-950 github-grid"
      aria-label="Section principale de présentation"
    >
      {/* Lueurs d'arrière-plan de style GitHub (radial glows) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-[10%] left-[5%] w-[600px] h-[600px] github-glow-indigo rounded-full opacity-60 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[10%] right-[5%] w-[800px] h-[800px] github-glow-emerald rounded-full opacity-40 animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute top-[30%] left-[40%] w-[300px] h-[300px] bg-violet-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Colonne Gauche - Textes et CTA */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 space-y-6 text-left"
          >
            {/* Badge Beta avec ligne connectrice style GitHub */}
            <div className="relative inline-block pb-6">
              <motion.div 
                variants={itemVariants}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-dark-900/60 border border-primary-500/30 text-primary-400 backdrop-blur-md shadow-inner"
              >
                <span className="w-2 h-2 rounded-full bg-accent-400 animate-ping" aria-hidden="true" />
                <span className="w-1.5 h-1.5 rounded-full bg-accent-500 absolute left-[18px]" aria-hidden="true" />
                Lancement beta
              </motion.div>
            </div>
            
            {/* Titre Principal avec effet typographique GitHub */}
            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold leading-[1.05] text-white tracking-tight"
            >
              Le&nbsp;
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-indigo-400 to-accent-400 select-none">
                Pilier intelligent
              </span>
              &nbsp;pour votre bar ou restaurant
            </motion.h1>
            {/* Description */}
            <motion.p 
              variants={itemVariants}
              className="text-base sm:text-lg text-dark-300 max-w-xl leading-relaxed font-medium"
            >
              Gérer vos stocks, vos ventes et votre équipe n'a jamais été aussi simple. 
              Pilotez tout depuis votre téléphone, WhatsApp ou Telegram.
            </motion.p>
            
            {/* Boutons CTA Style GitHub */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 pt-2"
            >
              <a 
                href="/register" 
                className="px-8 py-4 rounded-xl text-white font-bold text-base bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-400 hover:to-indigo-500 shadow-xl shadow-primary-500/20 hover:shadow-primary-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all text-center flex items-center justify-center gap-2 group relative overflow-hidden"
                aria-label="Démarrer gratuitement avec NOXIA"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                Démarrer gratuitement
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
              </a>
            </motion.div>

            {/* Preuve sociale / Avis */}
            <motion.div 
              variants={itemVariants}
              className="flex items-center gap-4 pt-6 text-sm text-dark-400"
              aria-label="Plus de 15 établissements utilisent NOXIA"
            >
              <div className="flex -space-x-2.5" role="img" aria-label="Avatars de clients NOXIA">
                {['JD', 'MK', 'AL'].map((initials, i) => (
                  <div 
                    key={i} 
                    className="w-8 h-8 rounded-full border-2 border-dark-950 flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-primary-500 to-indigo-600 shadow-md"
                    aria-hidden="true"
                  >
                    {initials}
                  </div>
                ))}
                <div 
                  className="w-8 h-8 rounded-full border-2 border-dark-950 flex items-center justify-center text-xs font-bold bg-dark-900 text-dark-400 border-dark-800/80"
                  aria-hidden="true"
                >
                  +12
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Colonne Droite - Visuel NOXIA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative"
          >
            <div className="absolute inset-0 bg-primary-500/15 blur-[100px] rounded-3xl" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-2xl border border-dark-800/80 shadow-2xl">
              <Image
                src="/images/noxia/hero-noxia.jpg"
                alt="Une gérante d'établissement utilise la plateforme NOXIA sur tablette"
                width={886}
                height={420}
                priority
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="w-full h-auto object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}