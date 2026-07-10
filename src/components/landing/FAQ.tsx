'use client'

import { useState } from 'react'
import { ChevronDown, Bot } from 'lucide-react'
import { motion } from 'framer-motion'

const faqs = [
  {
    question: 'Comment fonctionne l\'essai gratuit ?',
    answer: 'Vous bénéficiez de 30 jours d\'essai gratuit avec accès à toutes les fonctionnalités du plan Business. Aucune carte bancaire n\'est requise pour commencer.',
    trigger: 'essai gratuit'
  },
  {
    question: 'Puis-je changer de plan à tout moment ?',
    answer: 'Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Le changement prend effet immédiatement et vos données sont préservées.',
    trigger: 'changer de plan'
  },
  {
    question: 'Comment mes employés accèdent-ils au bot ?',
    answer: 'Vous créez leurs comptes depuis le tableau de bord. Chaque employé reçoit un ID unique à envoyer au bot WhatsApp. Leurs permissions sont automatiquement appliquées.',
    trigger: 'employés accèdent'
  },
  {
    question: 'Mes données sont-elles sécurisées ?',
    answer: 'Absolument. Chaque client a un espace de données isolé. Toutes les communications sont chiffrées en HTTPS. Sauvegardes quotidiennes automatiques.',
    trigger: 'données sécurisées'
  },
  {
    question: 'NOXIA fonctionne-t-il hors ligne ?',
    answer: 'L\'application mobile native (iOS/Android) dispose d\'un mode hors ligne qui synchronise les données dès que la connexion est rétablie.',
    trigger: 'hors ligne'
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  // Fonction pour ouvrir le chatbot et envoyer la question
  const handleFAQClick = (question: string, trigger: string) => {
    // 1. Ouvrir la bulle du chatbot
    const chatbotButton = document.querySelector('.chatbot-trigger') as HTMLElement
    if (chatbotButton) {
      chatbotButton.click()
    }

    // 2. Attendre que le chat s'ouvre, puis envoyer la question
    setTimeout(() => {
      // Trouver l'input du chatbot
      const input = document.querySelector('.chatbot-input') as HTMLInputElement
      if (input) {
        // Mettre la question dans l'input
        input.value = trigger
        // Déclencher l'événement input pour mettre à jour l'état
        input.dispatchEvent(new Event('input', { bubbles: true }))
        
        // 3. Simuler l'envoi après un court délai
        setTimeout(() => {
          const sendButton = document.querySelector('.chatbot-send') as HTMLElement
          if (sendButton) {
            sendButton.click()
          }
        }, 300)
      } else {
        // Fallback: si l'input n'est pas trouvé, ouvrir le chat et alert
        alert(`🤖 Question envoyée au chatbot : "${question}"`)
      }
    }, 500)
  }

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
            Cliquez sur une question pour la poser directement à notre assistant
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
              onClick={() => {
                setOpenIndex(openIndex === index ? null : index)
                // Envoyer la question au chatbot
                handleFAQClick(faq.question, faq.trigger)
              }}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-white group-hover:text-primary-400 transition">
                  {faq.question}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                    <Bot className="w-3 h-3 inline mr-1" />
                    Poser au bot
                  </span>
                  <ChevronDown 
                    className={`w-5 h-5 transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''}`}
                    style={{ color: '#94a3b8' }}
                  />
                </div>
              </div>
              {openIndex === index && (
                <div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                  <p className="text-sm" style={{ color: '#94a3b8' }}>{faq.answer}</p>
                  <p className="text-xs mt-2" style={{ color: '#22c55e' }}>
                    ✅ Question envoyée à l&apos;assistant
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}