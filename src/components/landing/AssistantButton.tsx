'use client'

import { useState, useEffect } from 'react'
import { Bot, X, Send, Sparkles } from 'lucide-react'

// Données mockées pour le chat
const mockMessages = [
  { 
    id: 1, 
    sender: 'assistant', 
    message: 'Bonjour ! Je suis l\'assistant NOXIA. Je peux vous aider sur :\n• Le fonctionnement de la plateforme\n• Les plans d\'abonnement\n• La gestion des stocks\n• Les questions fréquentes\n\nPosez votre question en langage naturel !',
    time: '10:00'
  },
]

const getMockResponse = (question: string): string => {
  const lower = question.toLowerCase()
  
  if (lower.includes('prix') || lower.includes('tarif') || lower.includes('plan') || lower.includes('abonnement')) {
    return '📊 **Nos plans d\'abonnement :**\n\n• **Essai** : 30 jours gratuits (toutes les fonctionnalités)\n• **Starter** : 5 000 FCFA/mois\n• **Premium** : 11 000 FCFA/mois\n• **Business** : 14 000 FCFA/mois\n\n💡 Tous nos plans incluent la gestion des ventes, stocks, et l\'assistant IA.'
  }
  if (lower.includes('stock') || lower.includes('inventaire')) {
    return '📦 **Gestion des stocks :**\n\n• Suivi en temps réel\n• Alertes automatiques\n• Gestion des casiers et unités\n• Historique des mouvements\n• Valeur totale du stock\n\n🔔 Vous recevez des notifications quand un produit atteint le seuil critique.'
  }
  if (lower.includes('vente') || lower.includes('encaissement') || lower.includes('pos')) {
    return '💳 **Gestion des ventes (POS) :**\n\n• Interface tactile optimisée\n• Multi-caisses\n• Tickets et factures\n• Modes de paiement : Espèces, Mobile Money, Carte\n• Option "Autre" pour flexibilité\n• Mise à jour automatique du stock'
  }
  if (lower.includes('employe') || lower.includes('equipe')) {
    return '👥 **Gestion des employés :**\n\n• Création de comptes\n• Rôles et permissions (Drag & Drop)\n• ID unique par employé\n• Suivi des performances\n• Gestion des salaires et commissions\n• Liaison WhatsApp automatisée'
  }
  if (lower.includes('essaie') || lower.includes('gratuit') || lower.includes('demo')) {
    return '🎁 **Essai gratuit de 30 jours :**\n\n• Accès à TOUTES les fonctionnalités\n• Pas de carte bancaire requise\n• Support inclus\n• Annulation à tout moment\n\n👉 Cliquez sur "Essai gratuit" dans le menu pour commencer !'
  }
  if (lower.includes('aide') || lower.includes('help') || lower.includes('commande')) {
    return '📋 **Commandes disponibles :**\n\n• Plans / Tarifs\n• Stock\n• Ventes / POS\n• Employés\n• Essai gratuit\n\nPosez votre question en langage naturel !'
  }
  
  return `🤖 Je suis l'assistant NOXIA. Je peux vous renseigner sur :\n• Les plans et tarifs\n• La gestion des stocks\n• Le système de vente (POS)\n• La gestion des employés\n• L'essai gratuit de 30 jours\n\nQue voulez-vous savoir ?`
}

export function AssistantButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState(mockMessages)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const scrollToBottom = () => {
    const container = document.getElementById('landing-assistant-chat')
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100)
    }
  }, [isOpen, messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      sender: 'user',
      message: userMessage,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }])

    setIsLoading(true)

    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700))

    const response = getMockResponse(userMessage)

    setMessages(prev => [...prev, {
      id: prev.length + 1,
      sender: 'assistant',
      message: response,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }])

    setIsLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setIsOpen(!isOpen)}
className="chatbot-trigger fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center hover:scale-110"        style={{
          background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
          boxShadow: '0 10px 40px rgba(99, 102, 241, 0.4)'
        }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Bot className="w-7 h-7 text-white" />
        )}
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-dark-900 animate-pulse" />
      </button>

      {/* Modal du chat */}
      {isOpen && (
        <div 
          className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl shadow-2xl flex flex-col"
          style={{
            background: '#1e293b',
            border: '1px solid #334155',
            maxHeight: 'calc(100vh - 120px)',
            minHeight: '400px'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: '#334155' }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
                <Bot className="w-4 h-4" style={{ color: '#818cf8' }} />
              </div>
              <div>
                <span className="font-semibold text-sm text-white">Assistant NOXIA</span>
                <span className="text-xs ml-2" style={{ color: '#22c55e' }}>● En ligne</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-white/10 transition"
              style={{ color: '#94a3b8' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div 
            id="landing-assistant-chat"
            className="flex-1 overflow-y-auto p-4 space-y-3"
            style={{ maxHeight: '400px' }}
          >
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] px-4 py-2 rounded-xl ${
                    msg.sender === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'
                  }`}
                  style={{
                    background: msg.sender === 'user' ? '#4f46e5' : 'rgba(51, 65, 85, 0.5)',
                    color: msg.sender === 'user' ? '#ffffff' : '#f1f5f9'
                  }}
                >
                  <p className="text-sm whitespace-pre-line">{msg.message}</p>
                  <p className="text-[10px] mt-1 text-right" style={{ 
                    color: msg.sender === 'user' ? 'rgba(255,255,255,0.5)' : '#64748b'
                  }}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                  <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0s' }} />
                  <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t" style={{ borderColor: '#334155' }}>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Posez votre question..."
                className="chatbot-input flex-1 rounded-lg px-3 py-2 text-white text-sm outline-none transition"
                style={{ 
                  background: 'rgba(51, 65, 85, 0.5)',
                  border: '1px solid #334155'
                }}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
className="chatbot-send px-3 py-2 rounded-lg text-white text-sm font-semibold transition disabled:opacity-50"                style={{ 
                  background: '#4f46e5',
                  boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
                }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-1 mt-2 flex-wrap">
              {['Plans et tarifs', 'Gestion des stocks', 'Système de vente', 'Employés'].map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(q)
                    setTimeout(() => sendMessage(), 100)
                  }}
                  className="text-[10px] px-2 py-0.5 rounded-full transition"
                  style={{ 
                    background: 'rgba(51, 65, 85, 0.3)',
                    border: '1px solid #334155',
                    color: '#94a3b8'
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}