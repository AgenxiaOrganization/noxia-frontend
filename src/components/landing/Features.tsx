'use client'

import { motion } from 'framer-motion'
import { Package, CreditCard, Bot, MessageSquare, FileBarChart, Users, QrCode, ShieldCheck, Eye } from 'lucide-react'

const features = [
  {
    icon: Package,
    title: 'Gestion des Stocks',
    description: 'Suivez vos stocks en temps réel. Alertes automatiques quand un produit atteint le seuil critique.',
    color: '#6366f1'
  },
  {
    icon: CreditCard,
    title: 'Caisse Tactile (POS)',
    description: 'Interface de vente optimisée. Multi-caisses, tickets, factures.',
    color: '#10b981'
  },
  {
    icon: Bot,
    title: 'Assistant IA',
    description: 'Posez des questions en langage naturel. "Quel est mon CA du jour ?" "Combien reste-t-il de bières ?" Réponses instantanées.',
    color: '#8b5cf6'
  },
  {
    icon: MessageSquare,
    title: 'WhatsApp & Telegram',
    description: 'Gérer tout depuis votre messagerie. Commandes, consultation des stocks, rapports. Aucun logiciel à ouvrir.',
    color: '#3b82f6'
  },
  {
    icon: FileBarChart,
    title: 'Rapports Automatiques',
    description: 'Rapports journaliers, hebdomadaires, mensuels. Export PDF et Excel.',
    color: '#f59e0b'
  },
  {
    icon: Users,
    title: "Gestion d'Équipe",
    description: 'Rôles et permissions granulaires. Suivi des performances. Historique d\'audit complet. Liaison WhatsApp automatisée et bien plus encore...',
    color: '#ec4899'
  },
  {
    icon: QrCode,
    title: 'Menu par QR Code',
    description: 'Générez un QR code à afficher en établissement. Vos clients scannent et consultent instantanément vos produits avec photos et prix, sans passer par la caisse.',
    color: '#06b6d4'
  },
  {
    icon: ShieldCheck,
    title: 'Documents Certifiés',
    description: 'Fiches de paie, factures et bilans financiers en PDF, chacun signé d\'un QR code de vérification pour prouver leur authenticité en un scan.',
    color: '#22c55e'
  },
  {
    icon: Eye,
    title: 'Supervision en Temps Réel',
    description: 'Définissez précisément les droits de chaque employé et gardez un œil sur tout : qui a fait quoi, à quelle heure, grâce au journal d\'audit détaillé de l\'établissement.',
    color: '#a855f7'
  }
]

export function Features() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.215, 0.610, 0.355, 1] as const
      }
    }
  }

  return (
    <section 
      id="features"
      className="py-24 relative overflow-hidden bg-dark-950/40 border-t border-dark-800/20"
    >
      {/* Lueurs radiales de décor arrière */}
      <div className="absolute inset-0 z-0">
        <div className="absolute left-[20%] top-[30%] w-[400px] h-[400px] rounded-full bg-primary-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute right-[10%] bottom-[20%] w-[500px] h-[500px] rounded-full bg-accent-500/5 blur-[150px] pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête de section animé */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold mb-4 text-white tracking-tight">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-base sm:text-lg text-dark-300 font-medium">
            Une plateforme complète pour piloter votre établissement sans ouvrir de logiciel complexe.
          </p>
        </motion.div>

        {/* Grille de cartes animée au scroll */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ y: -4 }}
                className="group rounded-2xl p-6 border border-dark-800/40 glass-card hover:glass-card-hover relative overflow-hidden transition-[border-color,box-shadow] duration-300"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${feature.color}40`
                  e.currentTarget.style.boxShadow = `0 20px 40px -20px ${feature.color}30`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = ''
                  e.currentTarget.style.boxShadow = ''
                }}
              >
                {/* Lueur de survol subtile aux couleurs du feature */}
                <div
                  className="absolute -right-10 -top-10 w-24 h-24 rounded-full blur-2xl opacity-10 transition-opacity duration-300 group-hover:opacity-30"
                  style={{ background: feature.color }}
                />

                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105"
                  style={{
                    background: `${feature.color}15`,
                    color: feature.color,
                    border: `1px solid ${feature.color}25`
                  }}
                >
                  <Icon className="w-5.5 h-5.5" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2 text-white tracking-tight">{feature.title}</h3>
                <p className="text-sm text-dark-300 leading-relaxed font-medium">{feature.description}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}