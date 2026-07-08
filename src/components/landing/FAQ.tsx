'use client'

import { useState } from 'react'
import { ChevronDown, Bot, Send } from 'lucide-react'
import { motion } from 'framer-motion'

const faqs = [
  {
    question: 'Comment fonctionne l\'essai gratuit ?',
    answer: 'Vous bénéficiez de 30 jours d\'essai gratuit avec accès à toutes les fonctionnalités du plan Business. Aucune carte bancaire n\'est requise pour commencer.'
  },
  {
    question: 'Puis-je changer de plan à tout moment ?',
    answer: 'Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Le changement prend effet immédiatement et vos données sont préservées.'
  },
  {
    question: 'Comment mes employés accèdent-ils au bot ?',
    answer: 'Vous créez leurs comptes depuis le tableau de bord. Chaque employé reçoit un ID unique à envoyer au bot WhatsApp. Leurs permissions sont automatiquement appliquées.'
  },
  {
    question: 'Mes données sont-elles sécurisées ?',
    answer: 'Absolument. Chaque client a un espace de données isolé. Toutes les communications sont chiffrées en HTTPS. Sauvegardes quotidiennes automatiques.'
  },
  {
    question: 'NOXIA fonctionne-t-il hors ligne ?',
    answer: 'L\'application mobile native (iOS/Android) dispose d\'un mode hors ligne qui synchronise les données dès que la connexion est rétablie.'
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [botQuestion, setBotQuestion] = useState('')
  const [botReply, setBotReply] = useState<string | null>(null)

  const getBotReply = (question: string) => {
    const lower = question.toLowerCase()
    const replies: Record<string, string> = {
      'essai': '📋 L\'essai gratuit de 30 jours vous donne accès à TOUTES les fonctionnalités de NOXIA. Aucune carte bancaire requise. Profitez-en pour découvrir tout ce que NOXIA peut faire pour votre établissement !',
      'plan': '🔄 Oui, vous pouvez changer de plan à tout moment depuis l\'espace "Abonnement". Le changement est immédiat et vos données sont conservées.',
      'employe': '👥 Vous créez les comptes employés depuis le tableau de bord. Chaque employé reçoit un ID unique (EMP-XXX) qu\'il envoie au bot pour activer sa session.',
      'securite': '🔒 Vos données sont protégées par chiffrement HTTPS, isolation des données par client, sauvegardes quotidiennes et authentification sécurisée.',
      'hors ligne': '📱 L\'application mobile native (iOS/Android) fonctionne hors ligne et synchronise automatiquement les données à la reconnexion.',
      'commande': '📝 Commandes disponibles : stock [nom], recette, alertes, meilleur, employes, aide'
    }

    for (const [key, reply] of Object.entries(replies)) {
      if (lower.includes(key)) {
        return reply
      }
    }
    return '🤖 Je suis l\'assistant NOXIA. Posez-moi une question sur :\n• L\'essai gratuit\n• Les plans d\'abonnement\n• Les employés\n• La sécurité\n• Le mode hors ligne\n• Les commandes disponibles'
  }

  const handleBotQuestion = () => {
    if (!botQuestion.trim()) return
    const reply = getBotReply(botQuestion)
    setBotReply(reply)
  }

  const handleFAQClick = (question: string) => {
    setBotQuestion(question)
    const reply = getBotReply(question)
    setBotReply(reply)
  }

  return (
    <section 
      id="faq" 
      className="py-20"
      style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #312e81 70%, #4f46e5 100%)' 
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
            Cliquez sur une question pour voir la réponse du bot
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* FAQ Liste */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="rounded-xl p-4 sm:p-5 cursor-pointer transition-all hover:border-primary-500"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  border: openIndex === index ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)'
                }}
                onClick={() => {
                  setOpenIndex(openIndex === index ? null : index)
                  handleFAQClick(faq.question)
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white">{faq.question}</span>
                  <ChevronDown 
                    className={`w-5 h-5 transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''}`}
                    style={{ color: '#94a3b8' }}
                  />
                </div>
                {openIndex === index && (
                  <p className="text-sm mt-3" style={{ color: '#94a3b8' }}>{faq.answer}</p>
                )}
              </motion.div>
            ))}
          </div>

          {/* Bot intégré */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="rounded-xl border p-4 sm:p-6 flex flex-col h-[400px]"
            style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)',
              borderColor: 'rgba(255,255,255,0.1)'
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
                <Bot className="w-4 h-4" style={{ color: '#818cf8' }} />
              </div>
              <span className="font-semibold text-sm text-white">Assistant NOXIA</span>
              <span className="text-xs ml-auto" style={{ color: '#22c55e' }}>● En ligne</span>
            </div>

            <div 
              className="flex-1 overflow-y-auto space-y-3 p-3 rounded-lg"
              style={{ background: 'rgba(0,0,0,0.2)' }}
            >
              {!botReply && (
                <div className="text-center py-8">
                  <Bot className="w-12 h-12 mx-auto mb-2" style={{ color: '#334155' }} />
                  <p className="text-sm" style={{ color: '#64748b' }}>
                    Posez une question ou cliquez sur une FAQ
                  </p>
                </div>
              )}
              {botReply && (
                <div className="flex justify-start">
                  <div className="max-w-[90%] px-4 py-3 rounded-xl rounded-bl-sm text-sm whitespace-pre-line" style={{ background: 'rgba(51,65,85,0.5)', color: '#f1f5f9' }}>
                    {botReply}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={botQuestion}
                onChange={(e) => setBotQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleBotQuestion()}
                placeholder="Posez votre question..."
                className="flex-1 rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                style={{
                  background: 'rgba(51, 65, 85, 0.5)',
                  border: '1px solid #334155'
                }}
              />
              <button
                onClick={handleBotQuestion}
                className="px-4 py-2.5 rounded-lg text-white text-sm font-semibold transition"
                style={{
                  background: '#4f46e5',
                  boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
                }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}