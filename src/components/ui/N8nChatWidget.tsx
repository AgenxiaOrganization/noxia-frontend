'use client'

import { useEffect } from 'react'
import '@n8n/chat/style.css'
import { createChat } from '@n8n/chat'
import { usePathname } from 'next/navigation'
import { getAccessToken } from '../../lib/auth'

const SESSION_STORAGE_KEY = 'n8n-chat/sessionId'
const EXPANDED_STORAGE_KEY = 'noxia_assistant_expanded'
const HOST_SELECTOR = '.n8n-chat, #n8n-chat'

function generateSessionId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

// Cherche un élément dans le DOM léger ou à l'intérieur des shadow roots imbriqués
// (le widget @n8n/chat se monte comme un Vue custom element avec Shadow DOM).
function querySelectorDeep(selector: string): HTMLElement | null {
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

function removeExistingWidget() {
  document.querySelectorAll(HOST_SELECTOR).forEach((el) => el.remove())
}

// Cible strictement le champ de saisie du widget de chat, jamais un autre champ
// de la page (ex. la barre de recherche produits) : on ne descend dans
// .chat-inputs qu'après l'avoir localisé explicitement, sans repli générique
// vers "textarea, input" qui matcherait le premier champ trouvé dans le DOM.
function getChatInputField(): HTMLTextAreaElement | HTMLInputElement | null {
  const chatInputs = querySelectorDeep('.chat-inputs')
  if (!chatInputs) return null
  return chatInputs.querySelector('textarea, input')
}

function getChatSendButton(): HTMLButtonElement | null {
  const chatInputs = querySelectorDeep('.chat-inputs')
  if (!chatInputs) return null
  return chatInputs.querySelector('.chat-input-send-button, button[type="submit"], button')
}

export default function N8nChatWidget() {
  const pathname = usePathname()

  useEffect(() => {
    // Si on est sur la page de l'assistant IA, ne pas afficher la bulle flottante
    if (pathname === '/assistant') {
      return
    }

    // Définit la méthode globale de simulation d'envoi de message suggéré
    ;(window as unknown as Record<string, unknown>).sendN8nSuggestedMessage = (messageText: string) => {
      const chatInput = getChatInputField()
      if (chatInput) {
        chatInput.value = messageText
        chatInput.dispatchEvent(new Event('input', { bubbles: true }))
        chatInput.focus()

        setTimeout(() => {
          getChatSendButton()?.click()
        }, 100)
      }
    }

    // Repart toujours d'un DOM propre : évite qu'un widget resté monté (double
    // exécution de l'effet en React StrictMode, hot-reload) bloque le remontage
    // et empêche l'injection des contrôles personnalisés.
    removeExistingWidget()

    const token = getAccessToken()
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api/v1'

    const mountChat = () => {
      let sessionId = localStorage.getItem(SESSION_STORAGE_KEY)
      if (!sessionId) {
        sessionId = generateSessionId()
        localStorage.setItem(SESSION_STORAGE_KEY, sessionId)
      }

      createChat({
        webhookUrl: `${apiBaseUrl}/companies/assistant/chat/`,
        webhookConfig: {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        },
        sessionId,
        loadPreviousSession: true,
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
    }

    mountChat()

    // Injecte les boutons personnalisés (effacer l'historique, agrandir, micro) une fois le
    // widget monté, et les réinjecte si le DOM du widget est reconstruit par n8n/Vue.
    const injectCustomControls = () => {
      const heading = querySelectorDeep('.chat-heading')
      if (heading && !heading.querySelector('.noxia-header-actions')) {
        const actions = document.createElement('div')
        actions.className = 'noxia-header-actions'

        const expandBtn = document.createElement('button')
        expandBtn.type = 'button'
        expandBtn.className = 'noxia-header-btn noxia-expand-btn'
        expandBtn.title = 'Agrandir la fenêtre'
        expandBtn.setAttribute('aria-label', 'Agrandir la fenêtre de discussion')
        expandBtn.innerHTML = EXPAND_ICON

        const isExpanded = localStorage.getItem(EXPANDED_STORAGE_KEY) === 'true'
        const applyExpandedState = (expanded: boolean) => {
          // Le composant tiers lit --chat--window--width/height en cascade CSS
          // normale (pas fiable à contrôler de l'extérieur : dépend d'où ses
          // propres variables par défaut sont redéclarées). On fixe donc la
          // taille directement en style inline + priorité "important" sur les
          // deux éléments concernés, ce qui bat toute règle externe.
          const wrapperEl = expandBtn.closest('.chat-window-wrapper') as HTMLElement | null
          const windowEl = wrapperEl?.querySelector('.chat-window') as HTMLElement | null
          const width = 'min(480px, calc(100vw - 32px))'
          const height = 'min(760px, calc(100vh - 100px))'
          for (const el of [wrapperEl, windowEl]) {
            if (!el) continue
            if (expanded) {
              el.style.setProperty('width', width, 'important')
              el.style.setProperty('height', height, 'important')
              el.style.setProperty('max-width', width, 'important')
              el.style.setProperty('max-height', height, 'important')
            } else {
              el.style.removeProperty('width')
              el.style.removeProperty('height')
              el.style.removeProperty('max-width')
              el.style.removeProperty('max-height')
            }
          }
          expandBtn.classList.toggle('is-active', expanded)
          expandBtn.title = expanded ? 'Réduire la fenêtre' : 'Agrandir la fenêtre'
          expandBtn.innerHTML = expanded ? COLLAPSE_ICON : EXPAND_ICON
          localStorage.setItem(EXPANDED_STORAGE_KEY, String(expanded))
        }
        applyExpandedState(isExpanded)
        expandBtn.addEventListener('click', (evt) => {
          evt.preventDefault()
          evt.stopPropagation()
          applyExpandedState(!expandBtn.classList.contains('is-active'))
        })

        const clearBtn = document.createElement('button')
        clearBtn.type = 'button'
        clearBtn.className = 'noxia-header-btn noxia-clear-btn'
        clearBtn.title = 'Effacer la conversation'
        clearBtn.setAttribute('aria-label', 'Effacer l\'historique de la conversation')
        clearBtn.innerHTML = TRASH_ICON
        clearBtn.addEventListener('click', () => {
          if (!window.confirm('Effacer tout l\'historique de cette conversation avec l\'Assistant NOXIA ?')) {
            return
          }
          localStorage.removeItem(SESSION_STORAGE_KEY)
          removeExistingWidget()
          mountChat()
        })

        actions.appendChild(expandBtn)
        actions.appendChild(clearBtn)
        heading.appendChild(actions)
      }

      const inputControls = querySelectorDeep('.chat-inputs-controls')
      if (inputControls && !inputControls.querySelector('.noxia-mic-btn')) {
        const micBtn = buildMicButton()
        // Toujours juste avant le bouton d'envoi, même quand le bouton de
        // pièce jointe (optionnel, activé par allowFileUploads) est présent.
        const sendButton = inputControls.querySelector('.chat-input-send-button')
        inputControls.insertBefore(micBtn, sendButton)
      }

      // Padding interne des bulles de message en style inline : la variable
      // --chat--message--padding seule ne suffisait pas à surclasser le
      // padding par défaut du composant sur les messages déjà rendus.
      const messageHost = querySelectorDeep('.chat-messages-list')
      messageHost?.querySelectorAll<HTMLElement>('.chat-message').forEach((msg) => {
        if (msg.dataset.noxiaPadded) return
        msg.style.setProperty('padding', '12px 16px', 'important')
        msg.style.setProperty('line-height', '1.55', 'important')
        msg.dataset.noxiaPadded = 'true'
      })
    }

    const interval = setInterval(injectCustomControls, 400)

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

    const starterInterval = setInterval(transformStarterQuestions, 500)

    return () => {
      clearInterval(interval)
      clearInterval(starterInterval)
      delete (window as unknown as Record<string, unknown>).sendN8nSuggestedMessage
      removeExistingWidget()
    }
  }, [pathname])

  return (
    <style dangerouslySetInnerHTML={{ __html: WIDGET_STYLES }} />
  )
}

const EXPAND_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>'
const COLLAPSE_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>'
const TRASH_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>'
const MIC_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><path d="M12 18v4"/><path d="M8 22h8"/></svg>'
const MIC_ACTIVE_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6"/></svg>'

type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult: ((event: unknown) => void) | null
  onerror: ((event: unknown) => void) | null
  onend: (() => void) | null
}

function buildMicButton(): HTMLButtonElement {
  const micBtn = document.createElement('button')
  micBtn.type = 'button'
  micBtn.className = 'noxia-mic-btn'
  micBtn.title = 'Dicter un message'
  micBtn.setAttribute('aria-label', 'Dicter un message vocal')
  micBtn.innerHTML = MIC_ICON

  const SpeechRecognitionCtor =
    (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike })
      .SpeechRecognition ??
    (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition

  if (!SpeechRecognitionCtor) {
    micBtn.disabled = true
    micBtn.title = 'Dictée vocale non disponible sur ce navigateur'
    micBtn.classList.add('is-disabled')
    return micBtn
  }

  let recognition: SpeechRecognitionLike | null = null
  let isListening = false
  // Texte déjà présent dans le champ avant le début de la dictée en cours :
  // les résultats provisoires viennent le compléter sans jamais l'écraser.
  let baseText = ''

  // Ancré structurellement sur le bouton lui-même (closest), jamais par une
  // recherche globale dans la page : garantit qu'on écrit uniquement dans le
  // champ du widget de chat auquel ce bouton micro appartient physiquement,
  // même si d'autres champs .chat-inputs-like existent ailleurs sur la page.
  const getOwnChatInput = (): HTMLTextAreaElement | HTMLInputElement | null => {
    const chatInputsEl = micBtn.closest('.chat-inputs')
    return chatInputsEl ? chatInputsEl.querySelector('textarea, input') : null
  }

  const writeToInput = (transcript: string) => {
    const chatInput = getOwnChatInput()
    if (!chatInput) return
    const prefix = baseText ? `${baseText} ` : ''
    chatInput.value = prefix + transcript
    chatInput.dispatchEvent(new Event('input', { bubbles: true }))
  }

  const stopListening = () => {
    isListening = false
    micBtn.classList.remove('is-listening')
    micBtn.innerHTML = MIC_ICON
    recognition?.stop()
  }

  micBtn.addEventListener('click', (evt) => {
    evt.preventDefault()
    evt.stopPropagation()

    if (isListening) {
      stopListening()
      return
    }

    const chatInput = getOwnChatInput()
    baseText = chatInput?.value.trim() ?? ''

    recognition = new SpeechRecognitionCtor()
    recognition.lang = 'fr-FR'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event: unknown) => {
      const results = (event as { results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }).results
      if (!results) return
      // Concatène tous les segments reconnus depuis le début de cette écoute
      // (finaux + en cours) pour afficher une transcription vivante dans le champ.
      let transcript = ''
      for (let i = 0; i < results.length; i++) {
        transcript += results[i][0].transcript
      }
      writeToInput(transcript.trim())
    }
    recognition.onerror = () => stopListening()
    recognition.onend = () => {
      getOwnChatInput()?.focus()
      stopListening()
    }

    isListening = true
    micBtn.classList.add('is-listening')
    micBtn.innerHTML = MIC_ACTIVE_ICON
    recognition.start()
  })

  return micBtn
}

const WIDGET_STYLES = `
  /* ─── Palette NOXIA sur les variables officielles du widget ──────────────
     Toute la mécanique de layout (tailles, transitions, wrapper) reste celle
     du composant ; on ne fait que reteinter son thème plutôt que d'écraser
     des règles de structure à coups de !important dispersés. */
  .n8n-chat {
    --chat--color--primary: #6366f1;
    --chat--color--primary-shade-50: #4f46e5;
    --chat--color--secondary: #22c55e;
    --chat--color-secondary-shade-50: #16a34a;
    --chat--color-dark: #e5e7eb;
    --chat--color-light: #12101f;
    --chat--color-light-shade-50: #1a1830;
    --chat--color-light-shade-100: rgba(255, 255, 255, 0.08);
    --chat--color-medium: rgba(255, 255, 255, 0.18);
    --chat--color-typing: #a5b4fc;

    --chat--spacing: 1rem;
    --chat--border-radius: 0.75rem;
    --chat--font-family: inherit;

    --chat--window--width: 384px;
    --chat--window--height: 600px;
    --chat--window--border: 1px solid rgba(255, 255, 255, 0.08);
    --chat--window--border-radius: 20px;

    --chat--header--background: linear-gradient(135deg, #201c47 0%, #2f2a63 100%);
    --chat--header--color: #ffffff;
    --chat--header--padding: 16px 20px;
    --chat--heading--font-size: 1.05rem;
    --chat--subtitle--font-size: 0.78rem;

    --chat--body--background: #0d0c18;

    --chat--message--font-size: 0.9rem;
    --chat--message--border-radius: 14px;
    --chat--message--padding: 0.7rem 0.9rem;
    --chat--message--bot--background: #1a1830;
    --chat--message--bot--color: #e5e7eb;
    --chat--message--bot--border: 1px solid rgba(255, 255, 255, 0.06);
    --chat--message--user--background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    --chat--message--user--color: #ffffff;

    --chat--input--background: #15132a;
    --chat--input--border: 1px solid rgba(255, 255, 255, 0.1);
    --chat--input--text-color: #f1f5f9;
    --chat--input--container--background: #15132a;
    --chat--input--container--border: 1px solid rgba(255, 255, 255, 0.1);
    --chat--input--placeholder--font-size: 0.85rem;
    --chat--input--send--button--background: transparent;
    --chat--input--send--button--color: #818cf8;
    --chat--input--send--button--background-hover: rgba(99, 102, 241, 0.15);
    --chat--input--send--button--color-hover: #a5b4fc;

    --chat--toggle--size: 60px;
    --chat--toggle--background: #6366f1;
    --chat--toggle--hover--background: #4f46e5;
    --chat--toggle--active--background: #4338ca;
    --chat--toggle--color: #ffffff;
  }

  /* Fenêtre principale : glassmorphism cohérent avec le reste du dashboard NOXIA.
     La taille (width/height) est gérée en JS via style inline sur .chat-window
     et .chat-window-wrapper (voir applyExpandedState) : la cascade CSS seule
     ne suffisait pas à surclasser les variables par défaut du composant. */
  .chat-window {
    background: rgba(13, 12, 24, 0.85) !important;
    backdrop-filter: blur(20px) !important;
    -webkit-backdrop-filter: blur(20px) !important;
    box-shadow: 0 20px 60px -12px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(99, 102, 241, 0.08) inset !important;
    transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1), height 0.28s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }

  .chat-window-wrapper {
    transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1), height 0.28s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }

  /* En-tête */
  .chat-header {
    position: relative !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
  }

  .chat-heading {
    display: flex !important;
    align-items: flex-start !important;
    justify-content: space-between !important;
    gap: 8px !important;
    padding-right: 78px !important; /* place pour les boutons personnalisés + fermer */
  }

  .chat-heading h1 {
    display: flex !important;
    align-items: center !important;
    gap: 9px !important;
    letter-spacing: -0.01em !important;
  }

  /* Logo officiel NOXIA à gauche du titre, dans une pastille dédiée */
  .chat-heading h1::before {
    content: "" !important;
    display: inline-flex !important;
    width: 26px !important;
    height: 26px !important;
    flex-shrink: 0 !important;
    border-radius: 8px !important;
    background: rgba(255, 255, 255, 0.12) !important;
    background-image: url('/logos/NOXIA_Orbit_Logo.svg') !important;
    background-repeat: no-repeat !important;
    background-position: center !important;
    background-size: 62% !important;
  }

  .chat-header p {
    display: flex !important;
    align-items: center !important;
    gap: 5px !important;
    margin: 6px 0 0 35px !important; /* alignement avec le titre décalé par le logo */
    opacity: 0.85 !important;
  }

  .chat-header p::before {
    content: "" !important;
    width: 6px !important;
    height: 6px !important;
    border-radius: 50% !important;
    background: #22c55e !important;
    box-shadow: 0 0 6px rgba(34, 197, 94, 0.8) !important;
  }

  .chat-close-button {
    opacity: 0.75 !important;
    transition: opacity 0.2s ease !important;
  }

  .chat-close-button:hover {
    opacity: 1 !important;
  }

  /* Messages : meilleur contraste et respiration que le thème par défaut */
  .chat-messages-list {
    padding: 18px !important;
    gap: 10px !important;
  }

  .chat-message {
    line-height: 1.5 !important;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15) !important;
  }

  /* Zone de saisie */
  .chat-footer {
    border-top: 1px solid rgba(255, 255, 255, 0.06) !important;
    padding: 12px !important;
  }

  .chat-inputs {
    border-radius: 14px !important;
    padding: 4px 6px 4px 12px !important;
  }

  .chat-input:focus {
    outline: none !important;
  }

  /* ─── Contrôles personnalisés NOXIA (agrandir / effacer) ─────────────────── */
  .noxia-header-actions {
    display: flex !important;
    align-items: center !important;
    gap: 4px !important;
    flex-shrink: 0 !important;
    margin-top: 1px !important;
  }

  .noxia-header-btn {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 28px !important;
    height: 28px !important;
    border-radius: 8px !important;
    border: none !important;
    background: rgba(255, 255, 255, 0.08) !important;
    color: #c7d2fe !important;
    cursor: pointer !important;
    transition: background 0.2s ease, color 0.2s ease, transform 0.15s ease !important;
    padding: 0 !important;
  }

  .noxia-header-btn:hover {
    background: rgba(255, 255, 255, 0.18) !important;
    color: #ffffff !important;
    transform: translateY(-1px) !important;
  }

  .noxia-header-btn.is-active {
    background: rgba(99, 102, 241, 0.4) !important;
    color: #ffffff !important;
  }

  /* ─── Bouton micro (note vocale) ───────────────────────────────────────── */
  /* .chat-inputs-controls est un simple flex sans align-items : on l'aligne
     nous-mêmes pour que le micro soit centré comme le bouton d'envoi voisin,
     qui lui fait --chat--textarea--height (50px) de haut. */
  .chat-inputs-controls {
    align-items: center !important;
  }

  .noxia-mic-btn {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 38px !important;
    height: 38px !important;
    border-radius: 50% !important;
    border: none !important;
    background: rgba(99, 102, 241, 0.14) !important;
    color: #818cf8 !important;
    cursor: pointer !important;
    margin: 0 2px !important;
    transition: background 0.2s ease, color 0.2s ease, transform 0.15s ease !important;
    flex-shrink: 0 !important;
  }

  .noxia-mic-btn:hover {
    background: rgba(99, 102, 241, 0.24) !important;
    transform: scale(1.05) !important;
  }

  .noxia-mic-btn.is-listening {
    background: #ef4444 !important;
    color: #ffffff !important;
    animation: noxia-mic-pulse 1.4s ease-in-out infinite !important;
  }

  .noxia-mic-btn.is-disabled {
    opacity: 0.35 !important;
    cursor: not-allowed !important;
  }

  @keyframes noxia-mic-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.45); }
    50% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
  }

  /* ─── Bulle flottante (bouton d'ouverture/fermeture) ──────────────────── */
  /* Fond blanc plein pour faire ressortir le logo NOXIA (coloré indigo/violet),
     qui se fondait dans le fond indigo par défaut du bouton. */
  .chat-window-toggle {
    background-color: #ffffff !important;
    background-image: url('/logos/NOXIA_Orbit_Logo.svg') !important;
    background-repeat: no-repeat !important;
    background-position: center !important;
    background-size: 60% !important;
    box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.35) !important;
    border: 1px solid rgba(99, 102, 241, 0.2) !important;
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease !important;
  }

  .chat-window-toggle svg {
    display: none !important;
  }

  .chat-window-toggle:hover {
    transform: scale(1.07) !important;
    box-shadow: 0 10px 30px -4px rgba(99, 102, 241, 0.65) !important;
  }
`
