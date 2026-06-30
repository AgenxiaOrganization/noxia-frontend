'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'Comment fonctionne l\'essai gratuit ?',
    answer: 'Vous bénéficiez de 5 jours d\'essai gratuit avec accès à toutes les fonctionnalités du plan Starter. Aucune carte bancaire n\'est requise pour commencer.'
  },
  {
    question: 'Puis-je changer de plan à tout moment ?',
    answer: 'Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Le changement prend effet immédiatement et vos données sont préservées.'
  },
  {
    question: 'Comment mes employés accèdent-ils à WhatsApp ?',
    answer: 'Vous créez leurs comptes depuis le tableau de bord. Chaque employé reçoit un ID unique à envoyer au bot WhatsApp. Leurs permissions sont automatiquement appliquées.'
  },
  {
    question: 'Mes données sont-elles sécurisées ?',
    answer: 'Absolument. Chaque client a un espace de données isolé. Toutes les communications sont chiffrées en HTTPS. Sauvegardes quotidiennes automatiques.'
  },
  {
    question: 'NOXIA fonctionne-t-il hors ligne ?',
    answer: 'L\'application mobile native (iOS/Android) dispose d\'un mode hors ligne qui synchronise les données dès que la connexion est rétablie.'
  }
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section 
      className="py-20"
      style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #312e81 70%, #4f46e5 100%)' 
      }}
      id="faq"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-white">
          Questions fréquentes
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div 
                key={index}
                className="rounded-xl p-4 sm:p-5 cursor-pointer transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white">{faq.question}</span>
                  <ChevronDown 
                    className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    style={{ color: '#94a3b8' }}
                  />
                </div>
                {isOpen && (
                  <p className="text-sm mt-3" style={{ color: '#94a3b8' }}>{faq.answer}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}