'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'

const faqs = [
  {
    question: "Comment fonctionne l'essai gratuit ?",
    answer:
      "L'essai gratuit dure 30 jours et donne accès à l'ensemble des fonctionnalités du plan Business dès l'inscription : caisse (POS), gestion des stocks, catalogue produits, bots WhatsApp/Telegram et assistant IA. Aucune carte bancaire n'est demandée pour démarrer. À la fin des 30 jours, vous choisissez le plan qui correspond à votre activité — si vous ne renouvelez pas, votre compte reste accessible en lecture le temps de récupérer vos données, sans perte d'historique.",
  },
  {
    question: 'Puis-je changer de plan à tout moment ?',
    answer:
      "Oui. Vous pouvez passer à un plan supérieur ou inférieur directement depuis votre espace Abonnement, sans interruption de service. Le changement est appliqué immédiatement et l'ensemble de vos données (produits, stocks, historique de ventes, employés) est conservé intégralement, quel que soit le plan choisi.",
  },
  {
    question: 'Comment mes employés accèdent-ils au bot ?',
    answer:
      "Depuis votre tableau de bord, vous créez le compte de chaque employé et lui attribuez un rôle (caissier, serveur, gérant...). Un identifiant de liaison unique est généré automatiquement : l'employé l'envoie une seule fois au bot WhatsApp ou Telegram de l'établissement pour associer son numéro à son compte. Ses permissions (ce qu'il peut consulter ou modifier) sont ensuite appliquées automatiquement selon son rôle, sans configuration supplémentaire.",
  },
  {
    question: 'Mes données sont-elles sécurisées ?',
    answer:
      "Oui. Chaque établissement dispose d'un espace de données strictement isolé — aucune donnée ne peut être partagée ou consultée entre deux entreprises clientes. Toutes les communications transitent en HTTPS chiffré, les mots de passe et identifiants sensibles sont chiffrés en base, et des sauvegardes automatiques de la base de données sont réalisées quotidiennement.",
  },
  {
    question: 'NOXIA fonctionne-t-il hors ligne ?',
    answer:
      "NOXIA est une application web accessible depuis un navigateur, elle nécessite donc une connexion internet pour fonctionner (comme la caisse, les stocks et les bots reposent sur des données synchronisées en temps réel). En revanche, la gestion via WhatsApp/Telegram reste disponible dès qu'une connexion mobile basique est présente, ce qui couvre la majorité des usages terrain même avec un réseau limité.",
  },
  {
    question: "Quels types d'établissements peuvent utiliser NOXIA ?",
    answer:
      "NOXIA est conçu pour les bars, snack-bars, boîtes de nuit et restaurants. La plateforme s'adapte aussi bien à un établissement unique qu'à un groupe multi-établissements, avec un tableau de bord centralisé pour suivre l'activité de chaque site séparément ou dans leur ensemble.",
  },
  {
    question: "Y a-t-il des frais cachés ou d'engagement ?",
    answer:
      "Non. Le prix affiché pour chaque plan est le prix final, sans frais d'installation ni surcoût caché. L'abonnement est sans engagement de durée : vous pouvez l'annuler à tout moment depuis votre espace Abonnement, sans pénalité.",
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section
      id="faq"
      className="py-20"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #312e81 70%, #4f46e5 100%)'
      }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
            Questions fréquentes
          </h2>
          <p className="text-lg" style={{ color: '#94a3b8' }}>
            Tout ce qu'il faut savoir avant de vous lancer
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="rounded-xl p-4 sm:p-5 cursor-pointer transition-all hover:border-primary-500 group"
              style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                border: openIndex === index ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)'
              }}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <div className="flex justify-between items-center gap-4">
                <span className="font-semibold text-white group-hover:text-primary-400 transition">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''}`}
                  style={{ color: '#94a3b8' }}
                />
              </div>
              {openIndex === index && (
                <div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                  <p className="text-sm leading-relaxed" style={{ color: '#cbd5e1' }}>{faq.answer}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
