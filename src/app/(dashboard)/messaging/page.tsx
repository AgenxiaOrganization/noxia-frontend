'use client'

import { useState } from 'react'
import {
  MessageSquare, Send, Smartphone, Users,
  Key, Copy, Check, RefreshCw, Power,
  Bot, Radio, Phone, Menu, X, Play, Video
} from 'lucide-react'

// --- Données Mockées ---
const mockEmployees = [
  { id: 1, name: 'Jean M.', role: 'caissier', phone: '+241 77 00 00 01', active: true, employeeId: 'EMP-001' },
  { id: 2, name: 'Marie K.', role: 'serveur', phone: '+241 77 00 00 02', active: true, employeeId: 'EMP-002' },
  { id: 3, name: 'Pierre O.', role: 'magasinier', phone: '+241 77 00 00 03', active: true, employeeId: 'EMP-003' },
  { id: 4, name: 'Sophie N.', role: 'caissier', phone: '+241 77 00 00 04', active: true, employeeId: 'EMP-004' },
  { id: 5, name: 'David L.', role: 'serveur', phone: '+241 77 00 00 05', active: false, employeeId: 'EMP-005' },
]

const mockMessages = [
  { id: 1, sender: 'bot', message: 'Bienvenue sur NOXIA ! Veuillez activer votre session.', time: '10:00' },
  { id: 2, sender: 'user', message: 'NOX-1234567890', time: '10:01' },
  { id: 3, sender: 'bot', message: '✅ Entreprise vérifiée : Bar Le Premium. Veuillez entrer votre ID employé.', time: '10:01' },
  { id: 4, sender: 'user', message: 'EMP-001', time: '10:02' },
  { id: 5, sender: 'bot', message: '✅ Session activée ! Bienvenue Jean M. (Caissier).\n\nCommandes disponibles : stock, recette, alertes, meilleur, employes, aide', time: '10:02' },
]

const availableCommands = [
  { command: 'stock [nom]', description: 'Consulter le stock d\'un produit' },
  { command: 'recette', description: 'CA du jour' },
  { command: 'alertes', description: 'Produits en stock critique' },
  { command: 'meilleur', description: 'Top ventes du jour' },
  { command: 'employes', description: 'Liste des employés actifs' },
  { command: 'aide', description: 'Afficher toutes les commandes' },
]

export default function MessagingPage() {
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState('chat')
  const [messages, setMessages] = useState(mockMessages)
  const [isWhatsAppActive, setIsWhatsAppActive] = useState(true)
  const [isTelegramActive, setIsTelegramActive] = useState(false)
  const [showVideo, setShowVideo] = useState(false)

  // Infos de l'entreprise (mockées)
  const companyId = 'NOX-1234567890'
  const userId = 'EMP-001'
  const botNumber = '+241 66 00 00 10'
  const telegramLink = `https://t.me/NOXIABot?start=${companyId}_${userId}`

  const sendMessage = () => {
    if (!message.trim()) return
    
    setMessages([...messages, {
      id: messages.length + 1,
      sender: 'user',
      message: message,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }])
    
    setTimeout(() => {
      const botReply = getBotReply(message)
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        sender: 'bot',
        message: botReply,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      }])
    }, 800 + Math.random() * 700)
    
    setMessage('')
  }

  const getBotReply = (msg: string) => {
    const lower = msg.toLowerCase()
    if (lower.includes('stock') || lower.includes('reste')) {
      return '📦 Stock actuel :\n• Bière Castel: 48 unités\n• Bière Guinness: 12 unités ⚠️\n• Whisky Jack: 8 unités\n• Coca-Cola: 120 unités'
    }
    if (lower.includes('recette') || lower.includes('ca') || lower.includes('chiffre')) {
      return '💰 CA du jour : 450 000 FCFA\n📊 Transactions : 127\n🏆 Meilleure vente : Whisky Jack Daniel\'s (87 ventes)'
    }
    if (lower.includes('alerte')) {
      return '⚠️ Produits en alerte :\n• Bière Guinness: 12/15 unités\n• Jus d\'Orange: 0/15 unités (rupture)'
    }
    if (lower.includes('meilleur') || lower.includes('top')) {
      return '🏆 Top produits :\n1. Whisky Jack: 87 ventes\n2. Bière Castel: 63 ventes\n3. Cocktail Mojito: 42 ventes'
    }
    if (lower.includes('employe')) {
      return '👥 Employés actifs :\n• Jean M. (Caissier)\n• Marie K. (Serveur)\n• Pierre O. (Magasinier)\n• Sophie N. (Caissier)'
    }
    if (lower.includes('aide') || lower.includes('help')) {
      return '📋 Commandes disponibles :\n• stock [nom] - Consulter le stock\n• recette - CA du jour\n• alertes - Produits critiques\n• meilleur - Top ventes\n• employes - Liste employés\n• aide - Cette aide'
    }
    return `🤖 Je n'ai pas compris votre demande. Tapez "aide" pour voir les commandes disponibles.`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="p-4 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Messagerie</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            Gérez vos communications via WhatsApp et Telegram
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsWhatsAppActive(!isWhatsAppActive)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
              isWhatsAppActive ? 'text-white' : 'text-dark-300'
            }`}
            style={{ 
              background: isWhatsAppActive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(51, 65, 85, 0.3)',
              border: isWhatsAppActive ? '1px solid #22c55e' : '1px solid #334155'
            }}
          >
            <Smartphone className="w-4 h-4" style={{ color: isWhatsAppActive ? '#22c55e' : '#64748b' }} />
            WhatsApp {isWhatsAppActive ? '✓ Actif' : 'Inactif'}
          </button>
          <button
            onClick={() => setIsTelegramActive(!isTelegramActive)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
              isTelegramActive ? 'text-white' : 'text-dark-300'
            }`}
            style={{ 
              background: isTelegramActive ? 'rgba(59, 130, 246, 0.15)' : 'rgba(51, 65, 85, 0.3)',
              border: isTelegramActive ? '1px solid #3b82f6' : '1px solid #334155'
            }}
          >
            <Send className="w-4 h-4" style={{ color: isTelegramActive ? '#3b82f6' : '#64748b' }} />
            Telegram {isTelegramActive ? '✓ Actif' : 'Inactif'}
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'chat', label: 'Chat avec le bot', icon: MessageSquare },
          { id: 'activation', label: 'Activation', icon: Power },
          { id: 'employees', label: 'Liaison employés', icon: Users },
          { id: 'commands', label: 'Commandes', icon: Menu },
        ].map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id ? 'border' : 'border-transparent'
              }`}
              style={{
                background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.15)' : 'rgba(51, 65, 85, 0.3)',
                borderColor: activeTab === tab.id ? '#6366f1' : 'transparent',
                color: activeTab === tab.id ? '#818cf8' : '#94a3b8'
              }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* CHAT AVEC LE BOT */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div 
              className="rounded-xl border flex flex-col h-[500px]"
              style={{ 
                background: '#1e293b',
                borderColor: '#334155'
              }}
            >
              {/* Chat header */}
              <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#334155' }}>
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5" style={{ color: '#818cf8' }} />
                  <span className="font-semibold text-white">Assistant NOXIA</span>
                  <span className="text-xs" style={{ color: '#22c55e' }}>● En ligne</span>
                </div>
                <button
                  onClick={() => setShowVideo(!showVideo)}
                  className="px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1"
                  style={{ 
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: '#818cf8'
                  }}
                >
                  <Play className="w-3 h-3" />
                  {showVideo ? 'Masquer la démo' : 'Voir la démo'}
                </button>
              </div>
              
              {/* Vidéo de simulation */}
              {showVideo && (
                <div 
                  className="p-4 border-b" 
                  style={{ borderColor: '#334155', background: 'rgba(0,0,0,0.3)' }}
                >
                  <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(99, 102, 241, 0.2)' }}>
                      <Video className="w-6 h-6" style={{ color: '#818cf8' }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">Simulation d'interaction avec le bot</p>
                      <div className="flex items-center gap-2 mt-1 text-xs" style={{ color: '#94a3b8' }}>
                        <span>1. Envoyer l'ID Entreprise</span>
                        <span className="text-primary-400">→</span>
                        <span>2. Envoyer l'ID Employé</span>
                        <span className="text-primary-400">→</span>
                        <span>3. Conversation active</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-xs" style={{ color: '#22c55e' }}>Simulation en cours</span>
                    </div>
                  </div>
                  {/* Messages de démonstration */}
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex justify-end">
                      <div className="max-w-[80%] px-3 py-1.5 rounded-xl rounded-br-sm" style={{ background: '#4f46e5', color: '#fff' }}>
                        NOX-1234567890
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="max-w-[80%] px-3 py-1.5 rounded-xl rounded-bl-sm" style={{ background: 'rgba(51,65,85,0.5)', color: '#f1f5f9' }}>
                        ✅ Entreprise vérifiée : Bar Le Premium. Veuillez entrer votre ID employé.
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="max-w-[80%] px-3 py-1.5 rounded-xl rounded-br-sm" style={{ background: '#4f46e5', color: '#fff' }}>
                        EMP-001
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="max-w-[80%] px-3 py-1.5 rounded-xl rounded-bl-sm" style={{ background: 'rgba(51,65,85,0.5)', color: '#f1f5f9' }}>
                        ✅ Session activée ! Bienvenue Jean M. (Caissier). Commandes disponibles : stock, recette...
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] px-4 py-2 rounded-xl ${
                        msg.sender === 'user' 
                          ? 'rounded-br-sm' 
                          : 'rounded-bl-sm'
                      }`}
                      style={{
                        background: msg.sender === 'user' 
                          ? '#4f46e5' 
                          : 'rgba(51, 65, 85, 0.5)',
                        color: msg.sender === 'user' ? '#ffffff' : '#f1f5f9'
                      }}
                    >
                      <p className="text-sm whitespace-pre-line">{msg.message}</p>
                      <p className="text-[10px] mt-1" style={{ 
                        color: msg.sender === 'user' ? 'rgba(255,255,255,0.6)' : '#64748b'
                      }}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Input */}
              <div className="p-4 border-t" style={{ borderColor: '#334155' }}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Votre message..."
                    className="flex-1 rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{ 
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid #334155'
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    className="px-4 py-2.5 rounded-lg text-white text-sm font-semibold transition"
                    style={{ 
                      background: '#4f46e5',
                      boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
                    }}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Commandes rapides */}
          <div 
            className="rounded-xl border p-4"
            style={{ 
              background: '#1e293b',
              borderColor: '#334155'
            }}
          >
            <h3 className="font-semibold text-sm text-white mb-3">Commandes rapides</h3>
            <div className="space-y-2">
              {availableCommands.slice(0, 5).map((cmd, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setMessage(cmd.command)
                    setTimeout(() => sendMessage(), 100)
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm transition"
                  style={{ 
                    background: 'rgba(51, 65, 85, 0.3)',
                    color: '#94a3b8'
                  }}
                >
                  <span className="font-medium text-white">{cmd.command}</span>
                  <span className="ml-2 text-xs" style={{ color: '#64748b' }}>
                    {cmd.description}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t" style={{ borderColor: '#334155' }}>
              <p className="text-xs" style={{ color: '#64748b' }}>
                💡 Tapez <span className="text-white">"aide"</span> pour voir toutes les commandes
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVATION */}
      {activeTab === 'activation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* WhatsApp */}
          <div 
            className="rounded-xl border p-4"
            style={{ 
              background: '#1e293b',
              borderColor: '#334155'
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="w-5 h-5" style={{ color: '#22c55e' }} />
              <h3 className="font-semibold text-white">WhatsApp</h3>
              <span 
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isWhatsAppActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}
              >
                {isWhatsAppActive ? 'Actif' : 'Inactif'}
              </span>
            </div>

            <div className="space-y-3">
              <div 
                className="rounded-lg p-3"
                style={{ background: 'rgba(51, 65, 85, 0.3)' }}
              >
                <p className="text-xs" style={{ color: '#94a3b8' }}>Numéro du bot</p>
                <p className="font-semibold text-white">{botNumber}</p>
              </div>
              
              <div 
                className="rounded-lg p-3"
                style={{ background: 'rgba(51, 65, 85, 0.3)' }}
              >
                <p className="text-xs" style={{ color: '#94a3b8' }}>ID Entreprise</p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="font-mono text-sm" style={{ color: '#818cf8' }}>{companyId}</code>
                  <button
                    onClick={() => copyToClipboard(companyId)}
                    className="p-1 rounded hover:bg-white/10 transition"
                    style={{ color: '#94a3b8' }}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div 
                className="rounded-lg p-3"
                style={{ background: 'rgba(51, 65, 85, 0.3)' }}
              >
                <p className="text-xs" style={{ color: '#94a3b8' }}>Votre ID Employé</p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="font-mono text-sm" style={{ color: '#818cf8' }}>{userId}</code>
                  <button
                    onClick={() => copyToClipboard(userId)}
                    className="p-1 rounded hover:bg-white/10 transition"
                    style={{ color: '#94a3b8' }}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1 text-xs" style={{ color: '#94a3b8' }}>
                <p className="font-medium text-white">Procédure d'activation :</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Contactez le numéro <span className="text-white">{botNumber}</span> sur WhatsApp</li>
                  <li>Envoyez l'ID Entreprise : <span className="font-mono text-primary-400">{companyId}</span></li>
                  <li>Envoyez votre ID Employé : <span className="font-mono text-primary-400">{userId}</span></li>
                  <li>Le bot vérifie et active votre session</li>
                  <li>Vous recevez une confirmation et pouvez converser</li>
                </ol>
              </div>

              <button
                className="w-full py-2 rounded-lg text-white text-sm font-semibold transition"
                style={{ 
                  background: isWhatsAppActive ? 'rgba(34, 197, 94, 0.15)' : '#22c55e',
                  border: isWhatsAppActive ? '1px solid #22c55e' : 'none',
                  color: isWhatsAppActive ? '#22c55e' : '#ffffff'
                }}
                onClick={() => {
                  if (!isWhatsAppActive) {
                    setIsWhatsAppActive(true)
                    alert('WhatsApp activé avec succès ! 🎉')
                  } else {
                    alert('WhatsApp est déjà actif.')
                  }
                }}
              >
                {isWhatsAppActive ? '✓ WhatsApp actif' : 'Activer WhatsApp'}
              </button>
            </div>
          </div>

          {/* Telegram */}
          <div 
            className="rounded-xl border p-4"
            style={{ 
              background: '#1e293b',
              borderColor: '#334155'
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Send className="w-5 h-5" style={{ color: '#3b82f6' }} />
              <h3 className="font-semibold text-white">Telegram</h3>
              <span 
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isTelegramActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}
              >
                {isTelegramActive ? 'Actif' : 'Inactif'}
              </span>
            </div>

            <div className="space-y-3">
              <div 
                className="rounded-lg p-3"
                style={{ background: 'rgba(51, 65, 85, 0.3)' }}
              >
                <p className="text-xs" style={{ color: '#94a3b8' }}>Nom du bot</p>
                <p className="font-semibold text-white">@NOXIABot</p>
              </div>
              
              <div 
                className="rounded-lg p-3"
                style={{ background: 'rgba(51, 65, 85, 0.3)' }}
              >
                <p className="text-xs" style={{ color: '#94a3b8' }}>Lien d'invitation</p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-sm font-mono truncate" style={{ color: '#3b82f6' }}>
                    {telegramLink}
                  </code>
                  <button
                    onClick={() => copyToClipboard(telegramLink)}
                    className="p-1 rounded hover:bg-white/10 transition"
                    style={{ color: '#94a3b8' }}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1 text-xs" style={{ color: '#94a3b8' }}>
                <p className="font-medium text-white">Procédure d'activation :</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Ouvrez le lien <span className="text-white">@NOXIABot</span> sur Telegram</li>
                  <li>Envoyez <span className="font-mono text-primary-400">/start</span></li>
                  <li>Le lien contient déjà vos IDs, activation automatique</li>
                  <li>Vous recevez une confirmation</li>
                </ol>
              </div>

              <button
                className="w-full py-2 rounded-lg text-white text-sm font-semibold transition"
                style={{ 
                  background: isTelegramActive ? 'rgba(59, 130, 246, 0.15)' : '#3b82f6',
                  border: isTelegramActive ? '1px solid #3b82f6' : 'none',
                  color: isTelegramActive ? '#3b82f6' : '#ffffff'
                }}
                onClick={() => {
                  if (!isTelegramActive) {
                    setIsTelegramActive(true)
                    alert('Telegram activé avec succès ! 🎉')
                  } else {
                    alert('Telegram est déjà actif.')
                  }
                }}
              >
                {isTelegramActive ? '✓ Telegram actif' : 'Activer Telegram'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIAISON EMPLOYÉS */}
      {activeTab === 'employees' && (
        <div 
          className="rounded-xl border p-4"
          style={{ 
            background: '#1e293b',
            borderColor: '#334155'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Liaison des employés</h3>
            <button
              className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition flex items-center gap-2"
              style={{ 
                background: '#4f46e5',
                boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
              }}
            >
              <RefreshCw className="w-4 h-4" />
              Générer tous les IDs
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: '#334155' }}>
                  <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Employé</th>
                  <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Rôle</th>
                  <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>ID Employé</th>
                  <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Statut</th>
                  <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {mockEmployees.map((emp) => (
                  <tr key={emp.id} className="border-b" style={{ borderColor: '#334155' }}>
                    <td className="px-3 py-2 text-white">{emp.name}</td>
                    <td className="px-3 py-2">
                      <span 
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ 
                          background: 'rgba(99, 102, 241, 0.15)',
                          color: '#818cf8'
                        }}
                      >
                        {emp.role}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {emp.employeeId ? (
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono" style={{ color: '#818cf8' }}>
                            {emp.employeeId}
                          </code>
                          <button
                            onClick={() => copyToClipboard(emp.employeeId!)}
                            className="p-0.5 rounded hover:bg-white/10 transition"
                            style={{ color: '#94a3b8' }}
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: '#64748b' }}>Non généré</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span 
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          emp.active 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {emp.active ? '✓ Actif' : '✗ Inactif'}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        className={`text-xs px-2 py-1 rounded transition ${
                          emp.active ? 'bg-green-500/20 text-green-400' : 'bg-primary-500/20 text-primary-400'
                        }`}
                      >
                        {emp.active ? 'Régénérer' : 'Générer'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
            <p className="text-sm" style={{ color: '#94a3b8' }}>
              <Key className="w-4 h-4 inline mr-2" style={{ color: '#818cf8' }} />
              Les IDs sont valables 24h. L'employé doit envoyer son ID au bot pour activer sa session.
            </p>
          </div>
        </div>
      )}

      {/* COMMANDES */}
      {activeTab === 'commands' && (
        <div 
          className="rounded-xl border p-4"
          style={{ 
            background: '#1e293b',
            borderColor: '#334155'
          }}
        >
          <h3 className="font-semibold text-sm text-white mb-3">Commandes disponibles</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {availableCommands.map((cmd, i) => (
              <div 
                key={i}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ 
                  background: 'rgba(51, 65, 85, 0.3)',
                  border: '1px solid #334155'
                }}
              >
                <div>
                  <code className="text-sm font-mono text-white">{cmd.command}</code>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>{cmd.description}</p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('chat')
                    setMessage(cmd.command.split(' ')[0])
                    setTimeout(() => {
                      const chatInput = document.querySelector('input[placeholder="Votre message..."]') as HTMLInputElement
                      if (chatInput) {
                        chatInput.value = cmd.command.split(' ')[0]
                        sendMessage()
                      }
                    }, 300)
                  }}
                  className="px-2 py-1 rounded text-xs transition"
                  style={{ 
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: '#818cf8'
                  }}
                >
                  Utiliser
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}