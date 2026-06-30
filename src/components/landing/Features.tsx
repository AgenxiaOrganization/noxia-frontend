'use client'

import { Package, CreditCard, Bot, MessageSquare, FileBarChart, Users } from 'lucide-react'

const features = [
  {
    icon: Package,
    title: 'Gestion des Stocks',
    description: 'Suivez vos stocks en temps réel. Alertes automatiques quand un produit atteint le seuil critique. Transferts entre établissements.',
    color: '#6366f1'
  },
  {
    icon: CreditCard,
    title: 'Caisse Tactile (POS)',
    description: 'Interface de vente optimisée. Multi-caisses, tickets, factures, multi-paiements (espèces, Mobile Money, carte bancaire).',
    color: '#22c55e'
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
    description: 'Rapports journaliers, hebdomadaires, mensuels. Export PDF et Excel. Envoi automatique par email ou messagerie.',
    color: '#f59e0b'
  },
  {
    icon: Users,
    title: "Gestion d'Équipe",
    description: 'Rôles et permissions granulaires. Suivi des performances. Historique d\'audit complet. Liaison WhatsApp automatisée.',
    color: '#ec4899'
  }
]

export function Features() {
  return (
    <section 
      id="features"
      className="py-20"
      style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #312e81 70%, #4f46e5 100%)' 
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-lg" style={{ color: '#94a3b8' }}>
            Une plateforme complète pour piloter votre établissement sans ouvrir de logiciel.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div 
                key={index} 
                className="group rounded-2xl p-6 transition-all hover:border-primary-500/50"
                style={{ 
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition"
                  style={{ 
                    background: `${feature.color}20`,
                    color: feature.color
                  }}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-white">{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}