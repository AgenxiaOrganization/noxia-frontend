'use client'

import { useEffect } from 'react'
import '@n8n/chat/style.css'
import { createChat } from '@n8n/chat'
import { usePathname } from 'next/navigation'
import { getAccessToken } from '../../lib/auth'

export default function N8nChatWidget() {
  const pathname = usePathname()

  useEffect(() => {
    // Si on est sur la page de l'assistant IA, ne pas afficher la bulle flottante
    if (pathname === '/assistant') {
      return
    }

    // Définir la méthode globale de simulation d'envoi de message suggéré
    (window as any).sendN8nSuggestedMessage = (messageText: string) => {
      const querySelectorDeep = (selector: string): HTMLElement | null => {
        const standardEl = document.querySelector(selector) as HTMLElement
        if (standardEl) return standardEl
        let foundElement: HTMLElement | null = null
        const searchNode = (node: Node) => {
          if (foundElement) return
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as Element
            if (el.matches && el.matches(selector)) {
              foundElement = el as HTMLElement
              return
            }
            if (el.shadowRoot) {
              const found = el.shadowRoot.querySelector(selector) as HTMLElement
              if (found) {
                foundElement = found
                return
              }
              for (let i = 0; i < el.shadowRoot.childNodes.length; i++) {
                searchNode(el.shadowRoot.childNodes[i])
              }
            }
          }
          for (let i = 0; i < node.childNodes.length; i++) {
            searchNode(node.childNodes[i])
          }
        }
        searchNode(document.body)
        return foundElement
      }

      const chatInput = querySelectorDeep('.chat-inputs textarea, .chat-inputs input, textarea, input') as HTMLTextAreaElement | HTMLInputElement
      if (chatInput) {
        chatInput.value = messageText
        chatInput.dispatchEvent(new Event('input', { bubbles: true }))
        chatInput.focus()
        
        setTimeout(() => {
          const sendButton = querySelectorDeep('.chat-input-send-button, .chat-inputs button, button[type="submit"]') as HTMLButtonElement
          if (sendButton) {
            sendButton.click()
          }
        }, 100)
      }
    }

    // Garde anti-doublons pour éviter d'instancier plusieurs fois le widget de chat n8n dans le DOM
    if (document.querySelector('.n8n-chat') || document.querySelector('.n8n-chat-button') || document.getElementById('n8n-chat')) {
      return
    }

    const token = getAccessToken()
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api/v1'

    createChat({
      webhookUrl: `${apiBaseUrl}/companies/assistant/chat/`,
      webhookConfig: {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      },
      initialMessages: [
        '👋 Bonjour ! Je suis votre Assistant IA NOXIA.',
        'Je peux vous aider à analyser vos ventes, suivre vos stocks ou surveiller vos performances en temps réel.',
        '💡 **Voici ce que vous pouvez me demander :**\n\n' +
        '• *« Quel est le chiffre d\'affaires d\'aujourd\'hui ? »*\n' +
        '• *« Quels produits sont en stock critique ou en rupture ? »*\n' +
        '• *« Donne-moi le classement des meilleures ventes de la journée. »*\n' +
        '• *« Qui est connecté en caisse actuellement ? »*\n' +
        '• *« Quelle est la performance de mon établissement ce mois-ci ? »*'
      ],
      i18n: {
        en: {
          title: 'Assistant NOXIA',
          subtitle: 'En ligne',
          inputPlaceholder: 'Écrivez votre message...',
          getStarted: 'Démarrer la discussion',
          footer: 'Assistant Intelligent NOXIA',
          closeButtonTooltip: 'Fermer la discussion'
        }
      }
    })

    // Intervalle pour transformer de manière asynchrone les questions d'introduction en boutons cliquables
    const transformStarterQuestions = () => {
      const shadowRoots: ShadowRoot[] = []
      const findShadowRoots = (node: Node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as Element
          if (el.shadowRoot) {
            shadowRoots.push(el.shadowRoot)
            findShadowRoots(el.shadowRoot)
          }
        }
        for (let i = 0; i < node.childNodes.length; i++) {
          findShadowRoots(node.childNodes[i])
        }
      }
      findShadowRoots(document.body)

      shadowRoots.forEach(sr => {
        const elements = sr.querySelectorAll('p, li, span, div.message')
        elements.forEach(el => {
          if (el.getAttribute('data-starters-transformed') === 'true') {
            return
          }

          const html = el.innerHTML
          const regex = /«([^»]+)»/g
          if (regex.test(html)) {
            const newHtml = html.replace(regex, (match, p1) => {
              const cleanedText = p1.replace(/'/g, "\\'").replace(/"/g, '&quot;')
              return `<button class="n8n-starter-btn" style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); color: #818cf8; padding: 4px 10px; margin: 3px 0; border-radius: 6px; cursor: pointer; text-align: left; font-size: 11px; display: inline-block; font-family: inherit; transition: all 0.2s; font-weight: 500;" onmouseover="this.style.background='rgba(99, 102, 241, 0.2)'; this.style.borderColor='rgba(99, 102, 241, 0.5)';" onmouseout="this.style.background='rgba(99, 102, 241, 0.1)'; this.style.borderColor='rgba(99, 102, 241, 0.3)';" onclick="window.sendN8nSuggestedMessage('${cleanedText}')">${match}</button>`
            })
            el.innerHTML = newHtml
            el.setAttribute('data-starters-transformed', 'true')
          }
        })
      })
    }

    const interval = setInterval(transformStarterQuestions, 500)

    return () => {
      clearInterval(interval)
      delete (window as any).sendN8nSuggestedMessage
    }
  }, [pathname])

  return (
    <style dangerouslySetInnerHTML={{ __html: `
      /* Harmonisation avec la charte graphique violette/indigo de NOXIA */
      :root {
        --chat--color--primary: #6366f1 !important;
        --chat--color--primary-shade-50: #4f46e5 !important;
        --chat--color--primary-shade-100: #4338ca !important;
      }

      /* Personnalisation premium de la bulle flottante avec le logo officiel NOXIA */
      .n8n-chat-button {
        background-color: #6366f1 !important;
        background-image: url('/logos/NOXIA_Orbit_Logo.svg') !important;
        background-repeat: no-repeat !important;
        background-position: center !important;
        background-size: 60% !important;
        box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        transition: all 0.3s ease !important;
      }

      /* Masquage de l'icône de robot par défaut d'n8n dans la bulle fermée */
      .n8n-chat-button:not(.n8n-chat-button-open) svg {
        display: none !important;
      }

      .n8n-chat-button:hover {
        transform: scale(1.08) !important;
        box-shadow: 0 6px 24px rgba(99, 102, 241, 0.5) !important;
      }

      /* Style de la boîte de chat */
      .n8n-chat-wrapper {
        border-radius: 16px !important;
        overflow: hidden !important;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
      }

      /* En-tête de la boîte de chat aux couleurs de Noxia */
      .n8n-chat-header {
        background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%) !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
        display: flex !important;
        align-items: center !important;
        padding: 16px !important;
      }

      /* Remplacement de l'avatar et injection du logo Noxia dans le titre */
      .n8n-chat-header-title {
        font-family: inherit !important;
        font-weight: 600 !important;
        color: #ffffff !important;
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
      }

      /* Injection du logo officiel de Noxia à gauche du titre */
      .n8n-chat-header-title::before {
        content: "" !important;
        display: inline-block !important;
        width: 24px !important;
        height: 24px !important;
        background-image: url('/logos/NOXIA_Orbit_Logo.svg') !important;
        background-repeat: no-repeat !important;
        background-position: center !important;
        background-size: contain !important;
      }

      /* Masquage de l'avatar d'origine n8n */
      .n8n-chat-header-avatar, .n8n-chat-avatar {
        display: none !important;
      }

      .n8n-chat-header-subtitle {
        color: #a5b4fc !important;
        margin-left: 32px !important; /* Alignement avec le titre décalé */
      }
    `}} />
  )
}
