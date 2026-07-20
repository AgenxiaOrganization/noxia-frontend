'use client'

import { useState, useEffect } from 'react'
import {
  MessageSquare, Send, Smartphone, Users,
  Key, Copy, Check, RefreshCw, Power,
  Bot, Radio, Phone, Menu, X, Play, Video,
  Mail
} from 'lucide-react'
import { getMe } from '@/lib/api'
import { getEmployees, regenerateEmployeeCode, sendEmployeeCode, updateCompanyMe, deleteBotSession } from '@/lib/api/companies'
import { toast } from 'sonner'

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



export default function MessagingPage() {
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState('chat')
  const [messages, setMessages] = useState(mockMessages)
  const [isWhatsAppActive, setIsWhatsAppActive] = useState(true)
  const [isTelegramActive, setIsTelegramActive] = useState(false)
  const [showVideo, setShowVideo] = useState(false)

  // États dynamiques
  const [companyId, setCompanyId] = useState('---')
  const [userId, setUserId] = useState('---')
  const [demoPlatform, setDemoPlatform] = useState<'whatsapp' | 'telegram'>('whatsapp')
  const [employees, setEmployees] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const botNumber = '+1 (XXX) XXX-XXXX'
  const telegramLink = `https://t.me/noxia_user_bot?start=${companyId}_${userId}`

  const loadData = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true)
      const [freshMe, apiEmployees] = await Promise.all([
        getMe(),
        getEmployees()
      ])

      if (freshMe.company) {
        setCompanyId(freshMe.company.messaging_code || '---')
        setIsWhatsAppActive(freshMe.company.whatsapp_bot_active ?? true)
        setIsTelegramActive(freshMe.company.telegram_bot_active ?? false)
      }
      if (freshMe.membership) {
        setUserId(freshMe.membership.activation_code || '---')
      }

      setEmployees((apiEmployees || []).map((emp: any) => ({
        id: emp.id,
        name: `${emp.user?.first_name || ''} ${emp.user?.last_name || ''}`.trim() || emp.user?.email || 'Nom inconnu',
        role: emp.role,
        phone: emp.user?.phone || '',
        email: emp.user?.email || '',
        active: emp.is_active,
        employeeId: emp.activation_code || '',
        activation_code_expires_at: emp.activation_code_expires_at,
        is_activation_code_expired: emp.is_activation_code_expired,
        botSessions: emp.bot_sessions || [],
        isBotLinked: emp.bot_sessions && emp.bot_sessions.length > 0
      })))
    } catch (err) {
      console.error(err)
      toast.error("Erreur lors de la récupération des données de messagerie")
    } finally {
      if (!silent) setIsLoading(false)
    }
  }

  const toggleWhatsAppBot = async (active: boolean) => {
    try {
      await updateCompanyMe({ whatsapp_bot_active: active })
      setIsWhatsAppActive(active)
      toast.success(active ? '✅ Bot WhatsApp activé avec succès ! 🎉' : '⚠️ Bot WhatsApp désactivé.')
    } catch (err) {
      console.error(err)
      toast.error("Impossible de modifier le statut de WhatsApp au serveur.")
    }
  }

  const toggleTelegramBot = async (active: boolean) => {
    try {
      await updateCompanyMe({ telegram_bot_active: active })
      setIsTelegramActive(active)
      toast.success(active ? '✅ Bot Telegram activé avec succès ! 🎉' : '⚠️ Bot Telegram désactivé.')
    } catch (err) {
      console.error(err)
      toast.error("Impossible de modifier le statut de Telegram au serveur.")
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRegenerateId = async (employee: any) => {
    try {
      const promise = regenerateEmployeeCode(employee.id, 720)
      toast.promise(promise, {
        loading: `Régénération de l'ID pour ${employee.name}...`,
        success: `✅ Nouvel ID généré pour ${employee.name} !`,
        error: "❌ Erreur lors de la régénération de l'ID."
      })
      await promise
      await loadData(true)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSendId = async (employee: any) => {
    if (!employee.employeeId) {
      toast.error("Cet employé n'a pas d'ID valide. Veuillez d'abord en générer un.")
      return
    }
    try {
      const promise = sendEmployeeCode(employee.id)
      toast.promise(promise, {
        loading: `Envoi de l'e-mail de connexion à ${employee.name}...`,
        success: `✅ E-mail de connexion envoyé à ${employee.name} !`,
        error: "❌ Erreur lors de l'envoi de l'e-mail."
      })
      await promise
    } catch (err) {
      console.error(err)
    }
  }

  const handleUnlinkSession = async (sessionId: number, employeeName: string, platformLabel: string) => {
    try {
      const promise = deleteBotSession(sessionId)
      toast.promise(promise, {
        loading: `Déliaison du compte ${platformLabel} de ${employeeName}...`,
        success: `✅ Compte ${platformLabel} délié avec succès !`,
        error: "❌ Impossible de délier ce compte."
      })
      await promise
      await loadData(true)
    } catch (err) {
      console.error(err)
    }
  }

  const handleGenerateAllIds = async () => {
    const toRegenerate = employees.filter(emp => !emp.employeeId)
    if (toRegenerate.length === 0) {
      toast.info("Tous les employés ont déjà un ID généré.")
      return
    }
    
    try {
      const promises = toRegenerate.map(emp => regenerateEmployeeCode(emp.id, 720))
      toast.promise(Promise.all(promises), {
        loading: "Génération des IDs pour tous les employés...",
        success: "✅ Tous les IDs ont été générés avec succès !",
        error: "❌ Erreur lors de la génération de certains IDs."
      })
      await Promise.all(promises)
      await loadData(true)
    } catch (err) {
      console.error(err)
    }
  }



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

  const copyToClipboard = (text: string, label = "Contenu") => {
    navigator.clipboard.writeText(text)
    toast.success(`✅ ${label} copié dans le presse-papiers !`)
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
            onClick={() => toggleWhatsAppBot(!isWhatsAppActive)}
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
            onClick={() => toggleTelegramBot(!isTelegramActive)}
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
          { id: 'chat', label: 'Simulation d\'activation', icon: MessageSquare },
          { id: 'activation', label: 'Activation', icon: Power },
          { id: 'employees', label: 'Liaison employés', icon: Users },
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

      {/* SIMULATION D'ACTIVATION (GIFS) */}
      {activeTab === 'chat' && (
        <div className="w-full flex justify-center">
          <div 
            className="rounded-xl border p-6 flex flex-col items-center gap-4 w-full max-w-[600px]"
            style={{ 
              background: '#1e293b',
              borderColor: '#334155'
            }}
          >
            <div className="flex flex-col sm:flex-row w-full gap-3 items-start sm:items-center justify-between border-b pb-4" style={{ borderColor: '#334155' }}>
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-400" />
                <span className="font-semibold text-white">Simulation de liaison bot</span>
              </div>
              <div className="flex gap-2 w-full sm:w-auto justify-start sm:justify-end">
                <button
                  onClick={() => setDemoPlatform('whatsapp')}
                  className="text-xs px-3 py-1.5 rounded-lg transition font-semibold flex-1 sm:flex-initial text-center"
                  style={{ 
                    background: demoPlatform === 'whatsapp' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(51, 65, 85, 0.3)',
                    color: demoPlatform === 'whatsapp' ? '#22c55e' : '#94a3b8',
                    border: demoPlatform === 'whatsapp' ? '1px solid #22c55e' : '1px solid #334155'
                  }}
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => setDemoPlatform('telegram')}
                  className="text-xs px-3 py-1.5 rounded-lg transition font-semibold flex-1 sm:flex-initial text-center"
                  style={{ 
                    background: demoPlatform === 'telegram' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(51, 65, 85, 0.3)',
                    color: demoPlatform === 'telegram' ? '#3b82f6' : '#94a3b8',
                    border: demoPlatform === 'telegram' ? '1px solid #3b82f6' : '1px solid #334155'
                  }}
                >
                  Telegram
                </button>
              </div>
            </div>
            
            {/* Conteneur GIF Premium Agrandi et Adaptatif */}
            <div className="w-full flex justify-center border border-slate-700/50 rounded-xl overflow-hidden shadow-2xl bg-black/20 p-2 max-w-[480px]">
              <img 
                src={demoPlatform === 'whatsapp' ? "/logos/simulation_liaison_whatsapp.gif" : "/logos/simulation_liaison_telegram.gif"} 
                alt="Simulation de liaison"
                className="rounded-lg shadow-inner w-full h-auto max-h-[600px] object-contain"
              />
            </div>
            
            <p className="text-xs text-center mt-2" style={{ color: '#64748b' }}>
              Cette animation montre comment l'employé lie sa messagerie {demoPlatform === 'whatsapp' ? 'WhatsApp' : 'Telegram'} personnelle à l'établissement.
            </p>
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
                    onClick={() => copyToClipboard(companyId, "ID Entreprise")}
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
                    onClick={() => copyToClipboard(userId, "ID Employé")}
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
                onClick={() => toggleWhatsAppBot(!isWhatsAppActive)}
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
                <p className="font-semibold text-white">@noxia_user_bot</p>
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
                    onClick={() => copyToClipboard(telegramLink, "Lien d'invitation")}
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
                  <li>Ouvrez le lien <span className="text-white">@noxia_user_bot</span> sur Telegram</li>
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
                onClick={() => toggleTelegramBot(!isTelegramActive)}
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
            <div>
              <h3 className="font-semibold text-white">Liaison des employés</h3>
              <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                Liste des employés ayant connecté leur bot WhatsApp ou Telegram.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: '#334155' }}>
                  <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Employé</th>
                  <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Rôle</th>
                  <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Sessions connectées</th>
                  <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Statut</th>
                  <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-sm" style={{ color: '#64748b' }}>
                      <RefreshCw className="w-5 h-5 animate-spin inline mr-2 text-primary-400" />
                      Chargement des liaisons...
                    </td>
                  </tr>
                ) : employees.filter(emp => emp.isBotLinked).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-sm" style={{ color: '#64748b' }}>
                      Aucun employé n'a encore lié son bot.
                    </td>
                  </tr>
                ) : (
                  employees.filter(emp => emp.isBotLinked).map((emp) => (
                    <tr key={emp.id} className="border-b" style={{ borderColor: '#334155' }}>
                      <td className="px-3 py-2 text-white">
                        <div>
                          <p className="font-medium text-white">{emp.name}</p>
                          <p className="text-xs" style={{ color: '#64748b' }}>{emp.email}</p>
                        </div>
                      </td>
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
                        <div className="flex flex-col gap-2">
                          {emp.botSessions.map((session: any) => (
                            <div key={session.id} className="flex items-center gap-2 text-xs">
                              <span 
                                className="px-2 py-0.5 rounded font-medium"
                                style={{ 
                                  background: session.platform === 'whatsapp' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                                  color: session.platform === 'whatsapp' ? '#22c55e' : '#3b82f6'
                                }}
                              >
                                {session.platform_display}
                              </span>
                              <code className="font-mono text-white bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                                {session.external_id}
                              </code>
                              <button
                                onClick={() => handleUnlinkSession(session.id, emp.name, session.platform_display)}
                                className="text-red-400 hover:text-red-300 transition-colors p-0.5 hover:bg-red-500/10 rounded"
                                title="Délier ce compte"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span 
                          className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400"
                        >
                          ✓ Lié & Actif
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRegenerateId(emp)}
                            className="text-xs px-2.5 py-1 rounded transition hover:opacity-90 font-medium"
                            style={{ 
                              background: 'rgba(99, 102, 241, 0.15)',
                              color: '#818cf8',
                              border: '1px solid rgba(99, 102, 241, 0.3)'
                            }}
                          >
                            Régénérer ID
                          </button>
                          <button
                            onClick={() => handleSendId(emp)}
                            className="text-xs px-2.5 py-1 rounded transition flex items-center gap-1 hover:bg-white/10"
                            style={{ 
                              background: 'rgba(255, 255, 255, 0.05)',
                              color: '#94a3b8',
                              border: '1px solid #334155'
                            }}
                            title="Renvoyer les accès de connexion par e-mail"
                          >
                            <Mail className="w-3 h-3" />
                            Renvoyer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
            <p className="text-sm" style={{ color: '#94a3b8' }}>
              <Key className="w-4 h-4 inline mr-2" style={{ color: '#818cf8' }} />
              Les IDs sont valables 1 mois. L'employé doit envoyer son ID au bot pour activer sa session.
            </p>
          </div>
        </div>
      )}

    </div>
  )
}