'use client'

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
      className="relative min-h-screen flex items-center pt-28 pb-20 overflow-hidden bg-dark-950 github-grid"
    >
      {/* Lueurs d'arrière-plan de style GitHub (radial glows) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
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
                <span className="w-2 h-2 rounded-full bg-accent-400 animate-ping" />
                <span className="w-1.5 h-1.5 rounded-full bg-accent-500 absolute left-[18px]" />
                Lancement beta — Rejoignez les premiers clients
              </motion.div>
            </div>
            
            {/* Titre Principal avec effet typographique GitHub */}
            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold leading-[1.05] text-white tracking-tight"
            >
              L'
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-indigo-400 to-accent-400 select-none">
                OS intelligent
              </span> 
              pour votre bar ou restaurant
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
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                Démarrer gratuitement
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
              <a 
                href="#demo" 
                className="px-8 py-4 rounded-xl text-dark-200 hover:text-white font-bold text-base border border-dark-800 hover:border-dark-700 bg-dark-900/40 hover:bg-dark-900/80 hover:scale-[1.01] active:scale-[0.99] transition-all text-center flex items-center justify-center gap-2 backdrop-blur-md"
              >
                <Play className="w-4 h-4 fill-current text-primary-400" />
                Voir la démo
              </a>
            </motion.div>

            {/* Preuve sociale / Avis */}
            <motion.div 
              variants={itemVariants}
              className="flex items-center gap-4 pt-6 text-sm text-dark-400"
            >
              <div className="flex -space-x-2.5">
                {['JD', 'MK', 'AL'].map((initials, i) => (
                  <div 
                    key={i} 
                    className="w-8 h-8 rounded-full border-2 border-dark-950 flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-primary-500 to-indigo-600 shadow-md"
                  >
                    {initials}
                  </div>
                ))}
                <div 
                  className="w-8 h-8 rounded-full border-2 border-dark-950 flex items-center justify-center text-xs font-bold bg-dark-900 text-dark-400 border-dark-800/80"
                >
                  +12
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Colonne Droite - Dashboard Preview */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative hidden lg:block"
          >
            {/* Lueur arrière de la maquette style GitHub */}
            <div className="absolute inset-0 bg-primary-500/15 blur-[100px] rounded-3xl" />

            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative p-2 rounded-2xl github-border-gradient shadow-2xl overflow-hidden glass-panel"
            >
              <div className="rounded-xl overflow-hidden border border-dark-800/80 bg-dark-950/90">
                {/* En-tête de fenêtre façon macOS/GitHub */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-dark-800/60 bg-dark-900/60 backdrop-blur-sm">
                  <div className="flex gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/60"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/60"></span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-dark-400 select-none">NOXIA PORTAL</span>
                  <div className="w-8"></div>
                </div>

                {/* Contenu Dashboard Preview */}
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl p-4 border border-dark-800/40 bg-dark-900/20 backdrop-blur-sm">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-dark-400">CA du jour</p>
                      <p className="text-xl font-display font-extrabold text-accent-400 mt-1">450 000 FCFA</p>
                    </div>
                    <div className="rounded-xl p-4 border border-dark-800/40 bg-dark-900/20 backdrop-blur-sm">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-dark-400">Ventes</p>
                      <p className="text-xl font-display font-extrabold text-primary-400 mt-1">127</p>
                    </div>
                  </div>

                  <div className="rounded-xl p-4 border border-dark-800/40 bg-dark-900/20 backdrop-blur-sm space-y-3">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-dark-400">Dernières transactions</p>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">Whisky Jack Daniel's</span>
                        <span className="text-accent-400 font-semibold font-mono">25 000 F</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-dark-800/10 pt-2">
                        <span className="text-white font-medium">Bière Castel x3</span>
                        <span className="text-accent-400 font-semibold font-mono">4 500 F</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-dark-800/10 pt-2">
                        <span className="text-white font-medium">Cocktail Mojito x2</span>
                        <span className="text-accent-400 font-semibold font-mono">10 000 F</span>
                      </div>
                    </div>
                  </div>

                  <div 
                    className="flex items-center gap-2 rounded-xl p-3 text-xs border border-red-500/15 bg-red-500/5 text-red-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse shrink-0" />
                    <span className="font-medium truncate">Stock critique : Bière Castel (8 restants)</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Badge flottant Sync avec bordure dégradée fine */}
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute -bottom-4 -right-4 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-2xl github-border-gradient glass-panel"
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500"></span>
                </span>
                Sync en temps réel
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}