'use client'

import { useState, useEffect } from 'react'
import { Bot, X, Send, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Données mockées pour le chat
const mockMessages = [
  { 
    id: 1, 
    sender: 'assistant', 
    message: 'Bonjour ! Je suis l\'assistant NOXIA. Je peux vous aider sur :\n• Votre chiffre d\'affaires\n• Les stocks et inventaires\n• Les alertes et ruptures\n• Les performances employés\n• Les analyses financières\n\nPosez votre question en langage naturel !',
    time: '10:00'
  },
]

const mockResponses: Record<string, string> = {
  'ca': 'Votre chiffre d\'affaires du jour est de **450 000 FCFA** (127 transactions).\n\n📊 Détails :\n• Boissons : 320 000 FCFA\n• Nourriture : 85 000 FCFA\n• Services : 45 000 FCFA\n\n📈 Évolution : +12% par rapport à hier.',
  'biere': 'Il reste **48 bières Castel** (4 casiers).\n\n🔔 Seuil d\'alerte : 20 unités\n📦 Stock suffisant pour environ 3 jours.\n\n💡 Conseil : Prévoir un réapprovisionnement dans 48h.',
  'rupture': '⚠️ Produits en rupture ou stock critique :\n\n🔴 **Jus d\'Orange** : 0 unités (RUPTURE)\n🟡 **Bière Guinness** : 12/15 unités\n🟡 **Champagne Moet** : 6/8 unités\n\n📢 Alertes envoyées aux distributeurs.',
  'meilleur serveur': '🏆 Classement des serveurs ce mois-ci :\n\n1️⃣ **François T.** : 820 000 FCFA (Gérant)\n2️⃣ **Chloé R.** : 410 000 FCFA (Serveur)\n3️⃣ **Jean M.** : 380 000 FCFA (Caissier)\n4️⃣ **Marie K.** : 320 000 FCFA (Serveur)\n5️⃣ **Sophie N.** : 280 000 FCFA (Caissier)\n\n🎯 Commission totale versée : 24 500 FCFA',
  'inventaire': '📦 **Inventaire des boissons alcoolisées** :\n\n🥃 **Whisky Jack Daniel\'s** : 8 bouteilles (500 000 FCFA)\n🥃 **Vodka Absolut** : 15 bouteilles (165 000 FCFA)\n🍾 **Champagne Moet** : 6 bouteilles (168 000 FCFA)\n🍷 **Vin Rouge Bordeaux** : 20 bouteilles (90 000 FCFA)\n\n💰 Valeur totale : 923 000 FCFA\n📊 Rotation : 65% sur 30 jours',
  'marge': '📊 **Analyse marge bénéficiaire** :\n\n💰 CA total : 450 000 FCFA\n📦 Coût des ventes : 198 000 FCFA\n💵 Marge brute : 252 000 FCFA\n📈 Taux de marge : 56%\n\n📊 Par catégorie :\n• Boissons : 58% (marge élevée)\n• Nourriture : 45% (marge moyenne)\n• Services : 72% (marge excellente)\n\n💡 Opportunité : Augmenter les prix des cocktails de 10%.',
  'caisse': '🏧 **Performance des caisses** :\n\n1️⃣ **Caisse Principale** : 245 000 FCFA (54%)\n2️⃣ **Caisse VIP** : 156 000 FCFA (35%)\n3️⃣ **Caisse Terrasse** : 89 000 FCFA (20%)\n\n📊 Répartition par mode de paiement :\n• Espèces : 48% (216 000 FCFA)\n• Mobile Money : 35% (157 500 FCFA)\n• Carte : 17% (76 500 FCFA)',
  'rapport semaine': '📋 **Rapport hebdomadaire (22-28 Juin)** :\n\n📊 Chiffre d\'affaires : 3 150 000 FCFA\n📈 Évolution : +8% vs semaine précédente\n\n🏆 Top produits :\n1. Whisky Jack : 175 000 FCFA\n2. Bière Castel : 94 500 FCFA\n3. Cocktail Mojito : 85 000 FCFA\n\n👥 Fréquentation : 892 clients\n📱 45% des commandes via WhatsApp\n\n🔮 Projection semaine prochaine : 3 400 000 FCFA',
}

const getMockResponse = (question: string): string => {
  const lower = question.toLowerCase()
  
  if (lower.includes('ca') || lower.includes('chiffre') || lower.includes('recette')) {
    return mockResponses['ca']
  }
  if (lower.includes('biere') || lower.includes('stock') && lower.includes('castel')) {
    return mockResponses['biere']
  }
  if (lower.includes('rupture') || lower.includes('critique') || lower.includes('alerte')) {
    return mockResponses['rupture']
  }
  if (lower.includes('serveur') || lower.includes('meilleur') && lower.includes('employe')) {
    return mockResponses['meilleur serveur']
  }
  if (lower.includes('inventaire') || lower.includes('alcool')) {
    return mockResponses['inventaire']
  }
  if (lower.includes('marge') || lower.includes('benefice') || lower.includes('financier')) {
    return mockResponses['marge']
  }
  if (lower.includes('caisse') || lower.includes('pos')) {
    return mockResponses['caisse']
  }
  if (lower.includes('semaine') || lower.includes('rapport') && lower.includes('hebdomadaire')) {
    return mockResponses['rapport semaine']
  }
  
  return `Je n'ai pas compris votre demande. Voici quelques exemples de questions que je peux traiter :

• Quel est mon CA du jour ?
• Combien reste-t-il de bières Castel ?
• Quels produits sont en rupture ?
• Qui est le meilleur serveur ?
• Fais l'inventaire des boissons.
• Quelle est ma marge bénéficiaire ?
• Rapport de la semaine.`
}

export function AssistantButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState(mockMessages)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Scroll automatique
  const scrollToBottom = () => {
    const container = document.getElementById('assistant-chat-messages')
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

  // Si on est sur la page assistant, ne pas afficher la bulle
  if (typeof window !== 'undefined' && window.location.pathname === '/assistant') {
    return null
  }

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center hover:scale-110"
        style={{
          background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
          boxShadow: '0 10px 40px rgba(99, 102, 241, 0.4)'
        }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Bot className="w-7 h-7 text-white" />
        )}
        {/* Petite notification */}
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-dark-900" />
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
            id="assistant-chat-messages"
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
                className="flex-1 rounded-lg px-3 py-2 text-white text-sm outline-none transition"
                style={{ 
                  background: 'rgba(51, 65, 85, 0.5)',
                  border: '1px solid #334155'
                }}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="px-3 py-2 rounded-lg text-white text-sm font-semibold transition disabled:opacity-50"
                style={{ 
                  background: '#4f46e5',
                  boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
                }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-1 mt-2 flex-wrap">
              {['CA du jour', 'Stock Castel', 'Rupture', 'Meilleur serveur'].map((q, i) => (
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

          {/* Lien vers la page complète */}
          <div className="p-2 border-t text-center" style={{ borderColor: '#334155' }}>
            <button
              onClick={() => {
                setIsOpen(false)
                router.push('/assistant')
              }}
              className="text-xs transition hover:underline"
              style={{ color: '#818cf8' }}
            >
              Ouvrir en plein écran <Sparkles className="w-3 h-3 inline" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}