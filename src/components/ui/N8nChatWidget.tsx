'use client'

import { useEffect } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import '@n8n/chat/style.css'
import { createChat } from '@n8n/chat'
import { usePathname } from 'next/navigation'
import { getAccessToken, getMembership } from '../../lib/auth'
import AdminChatPanel from './AdminChatPanel'

const SESSION_STORAGE_KEY = 'n8n-chat/sessionId'
const EXPANDED_STORAGE_KEY = 'noxia_assistant_expanded'
const MODE_STORAGE_KEY = 'noxia_widget_mode'
const HOST_SELECTOR = '.n8n-chat, #n8n-chat'

const STARTER_SUGGESTIONS = [
  "Chiffre d'affaires du jour",
  'Stock critique',
  'Meilleures ventes',
  'Qui est en caisse ?',
]

type WidgetMode = 'assistant' | 'admin'

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
          '👋 Bonjour ! Comment puis-je vous aider aujourd\'hui ?',
        ],
        i18n: {
          en: {
            title: 'NOXIA',
            // Marquage requis par l'Ordonnance n°0011/PR/2026 (Art. 32/53,
            // Gabon) : mention visible en permanence, sans action
            // supplémentaire de l'utilisateur, tant que le chat est ouvert.
            // Volontairement courte pour tenir sur une seule ligne à côté
            // du titre, y compris sur les petits écrans.
            subtitle: 'Réponses générées par IA',
            inputPlaceholder: 'Écrivez votre message...',
            getStarted: 'Démarrer la discussion',
            footer: 'Assistant Intelligent NOXIA',
            closeButtonTooltip: 'Fermer la discussion'
          }
        }
      })
    }

    mountChat()

    // Injecte les boutons personnalisés (effacer l'historique, agrandir) une fois le
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
        // Inséré juste avant le bouton fermer natif (jamais après) pour
        // garder l'ordre visuel titre → actions → fermer.
        const closeBtn = heading.querySelector('.chat-close-button')
        heading.insertBefore(actions, closeBtn)
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

    // Chips de suggestions rendues nativement en React (remplace l'ancien
    // mécanisme de transformation regex/DOM des questions « ... » générées
    // par le bot, fragile et coûteux en polling permanent). Affichées
    // au-dessus du champ de saisie tant qu'aucun message n'a été envoyé.
    let chipsRoot: Root | null = null
    const mountSuggestionChips = () => {
      const footer = querySelectorDeep('.chat-footer')
      if (!footer || footer.querySelector('.noxia-chips-host')) return
      const hasUserMessage = !!querySelectorDeep('.chat-message-from-user')
      if (hasUserMessage) return

      const host = document.createElement('div')
      host.className = 'noxia-chips-host'
      footer.insertBefore(host, footer.firstChild)
      chipsRoot = createRoot(host)
      chipsRoot.render(
        <div className="noxia-chips">
          {STARTER_SUGGESTIONS.map((label) => (
            <button
              key={label}
              type="button"
              className="noxia-chip"
              onClick={() => {
                const handler = (window as unknown as Record<string, unknown>).sendN8nSuggestedMessage
                if (typeof handler === 'function') (handler as (text: string) => void)(label)
                host.remove()
              }}
            >
              {label}
            </button>
          ))}
        </div>,
      )
    }

    // Switch de mode (Assistant IA / Contacter l'administration), réservé
    // aux administrateurs d'établissement — injecté une seule fois dans le
    // header, à côté des contrôles agrandir/effacer déjà présents. `setMode`
    // est déclarée avant mountModeSwitch/applyMode pour être réutilisable
    // par le bouton de retour du panneau admin (AdminChatPanel.onBackToAssistant),
    // qui doit basculer le mode sans dépendre du switch du header (pas
    // toujours dans le cadre visible selon le scroll/la hauteur d'écran).
    let modeSwitchRoot: Root | null = null
    let adminPanelRoot: Root | null = null
    const isAdmin = getMembership()?.role === 'administrateur'

    const renderSwitch = (mode: WidgetMode) => {
      if (!modeSwitchRoot) return
      modeSwitchRoot.render(
        <div className="noxia-mode-switch">
          <button
            type="button"
            className={mode === 'assistant' ? 'is-active' : ''}
            onClick={() => setMode('assistant')}
          >
            Assistant IA
          </button>
          <button
            type="button"
            className={mode === 'admin' ? 'is-active' : ''}
            onClick={() => setMode('admin')}
          >
            Administration
          </button>
        </div>,
      )
    }

    const applyMode = (mode: WidgetMode) => {
      const chatWindow = querySelectorDeep('.chat-window')
      const header = querySelectorDeep('.chat-header')
      // .chat-body (liste de messages) et .chat-footer (saisie de
      // l'assistant IA) sont tous deux masqués en mode admin : le panneau
      // AdminChatPanel a sa propre zone de saisie, jamais les deux affichées
      // ensemble.
      const body = querySelectorDeep('.chat-body')
      const footer = querySelectorDeep('.chat-footer')
      if (!chatWindow || !body) return

      let adminHost = chatWindow.querySelector('.noxia-admin-chat-host') as HTMLElement | null
      if (mode === 'admin') {
        body.style.display = 'none'
        if (footer) footer.style.display = 'none'
        // Hauteur réelle du header (variable selon la présence du switch
        // de mode et du sous-titre) : positionne .noxia-admin-chat-host
        // juste en dessous, jamais une valeur fixe approximative.
        if (header) {
          chatWindow.style.setProperty('--noxia-header-height', `${header.offsetHeight}px`)
        }
        if (!adminHost) {
          adminHost = document.createElement('div')
          adminHost.className = 'noxia-admin-chat-host'
          chatWindow.appendChild(adminHost)
          adminPanelRoot = createRoot(adminHost)
          adminPanelRoot.render(<AdminChatPanel onBackToAssistant={() => setMode('assistant')} />)
        }
        adminHost.style.display = 'flex'
      } else {
        body.style.display = ''
        if (footer) footer.style.display = ''
        if (adminHost) adminHost.style.display = 'none'
      }
    }

    const setMode = (mode: WidgetMode) => {
      localStorage.setItem(MODE_STORAGE_KEY, mode)
      renderSwitch(mode)
      applyMode(mode)
    }

    const mountModeSwitch = () => {
      if (!isAdmin) return
      const header = querySelectorDeep('.chat-header')
      if (!header || header.querySelector('.noxia-mode-switch-host')) return

      const host = document.createElement('div')
      host.className = 'noxia-mode-switch-host'
      header.appendChild(host)
      modeSwitchRoot = createRoot(host)

      const initialMode: WidgetMode =
        (localStorage.getItem(MODE_STORAGE_KEY) as WidgetMode | null) ?? 'assistant'
      renderSwitch(initialMode)
      applyMode(initialMode)
    }

    // Filet de sécurité en plus du CSS (--chat--window--height: min(...)) :
    // `vh` en CSS mesure la hauteur du viewport SANS tenir compte de la
    // barre d'adresse mobile (qui peut être rétractée ou non), donc peut
    // sous-estimer l'espace réellement pris par le navigateur et laisser
    // la fenêtre déborder en haut sur certains téléphones. On mesure ici la
    // position réelle du wrapper (getBoundingClientRect, fiable car basé
    // sur le rendu effectif) et on force une max-height inline si son haut
    // sort du viewport visible (window.innerHeight, mesure JS fiable).
    const clampWindowHeight = () => {
      const wrapper = querySelectorDeep('.chat-window-wrapper')
      const win = querySelectorDeep('.chat-window')
      if (!wrapper || !win) return
      const rect = wrapper.getBoundingClientRect()
      if (rect.top < 8) {
        const overflow = 8 - rect.top
        const currentHeight = win.getBoundingClientRect().height
        win.style.setProperty('max-height', `${currentHeight - overflow}px`, 'important')
      }
    }

    const interval = setInterval(() => {
      injectCustomControls()
      mountSuggestionChips()
      mountModeSwitch()
      clampWindowHeight()
    }, 400)

    window.addEventListener('resize', clampWindowHeight)

    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', clampWindowHeight)
      delete (window as unknown as Record<string, unknown>).sendN8nSuggestedMessage
      // root.unmount() appelé de façon synchrone dans le cleanup d'un AUTRE
      // effet peut tomber en plein rendu React en cours ("Attempted to
      // synchronously unmount a root while React was already rendering").
      // Différer d'un tick laisse le rendu courant se terminer avant de
      // démonter — removeExistingWidget() (juste après) retire de toute
      // façon les éléments DOM hôtes, donc rien n'est visible entre-temps.
      const rootsToUnmount = [chipsRoot, modeSwitchRoot, adminPanelRoot]
      setTimeout(() => {
        rootsToUnmount.forEach((root) => root?.unmount())
      }, 0)
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

    /* min() plutôt qu'une valeur fixe : le composant applique height/width
       directement depuis ces variables sans les re-clamper lui-même, et son
       .chat-window-wrapper (position: fixed, bottom: 84px, flex-direction:
       column) empile .chat-window ET le bouton toggle (~60px + marge) sans
       "top" explicite — sur un écran bas, un total trop grand pousse donc le
       haut hors du viewport plutôt que d'être coupé. On retranche
       explicitement bottom (84px) + toggle (~76px avec sa marge) + une
       marge de sécurité (24px) de la hauteur disponible, plutôt qu'une
       valeur approximative unique. */
    --chat--window--width: min(384px, calc(100vw - 24px));
    --chat--window--height: min(600px, calc(100vh - 84px - 76px - 24px));
    --chat--window--bottom: 84px;
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

    /* Non définie par défaut par le composant tiers (retombe sur transparent,
       laissant apparaître un fond blanc derrière le footer) — nécessaire
       depuis l'ajout des chips de suggestions dans le footer. */
    --chat--footer--background: #0d0c18;

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
    /* Borne toujours à la fenêtre, y compris hors du mode "agrandi" (géré
       en JS pour la taille cible, mais jamais au-delà de l'espace réel
       disponible — sinon débordement sur mobile). */
    max-width: calc(100vw - 24px) !important;
    max-height: calc(100vh - 90px) !important;
  }

  @media (max-width: 480px) {
    .chat-window-wrapper {
      right: 12px !important;
      left: 12px !important;
      bottom: 84px !important;
    }

    .chat-window {
      width: 100% !important;
      max-width: 100% !important;
    }
  }

  .chat-window-wrapper {
    transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1), height 0.28s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }

  /* En-tête : titre + sous-titre sur une ligne, boutons personnalisés sur
     une deuxième ligne dédiée (.noxia-header-actions et
     .noxia-mode-switch-host, tous deux enfants directs de .chat-header) —
     jamais superposés au titre, quelle que soit la largeur de la fenêtre. */
  .chat-header {
    position: relative !important;
    display: flex !important;
    flex-direction: column !important;
    flex-shrink: 0 !important; /* jamais compressé par .chat-layout quand l'espace manque — le switch de mode doit rester entièrement visible */
    padding: 14px 16px !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
  }

  /* h1, .noxia-header-actions (agrandir/effacer, injectés juste avant le
     bouton fermer) et .chat-close-button natif se partagent cette même
     ligne flex — jamais de position absolue, qui avait provoqué le
     chevauchement avec le titre sur les petites largeurs. */
  .chat-heading {
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
  }

  .chat-heading h1 {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    min-width: 0 !important;
    flex: 1 1 auto !important;
    font-size: 1rem !important;
    letter-spacing: -0.01em !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
  }

  /* Logo officiel NOXIA à gauche du titre, dans une pastille dédiée */
  .chat-heading h1::before {
    content: "" !important;
    display: inline-flex !important;
    width: 24px !important;
    height: 24px !important;
    flex-shrink: 0 !important;
    border-radius: 7px !important;
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
    margin: 3px 0 0 32px !important; /* alignement avec le titre décalé par le logo */
    font-size: 0.72rem !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    opacity: 0.75 !important;
  }

  .chat-header p::before {
    content: "" !important;
    width: 6px !important;
    height: 6px !important;
    flex-shrink: 0 !important;
    border-radius: 50% !important;
    background: #22c55e !important;
    box-shadow: 0 0 6px rgba(34, 197, 94, 0.8) !important;
  }

  /* Boutons agrandir/effacer : simples enfants flex de .chat-heading,
     entre le titre et le bouton fermer natif — jamais en position
     absolute (source du chevauchement avec le titre sur petites largeurs). */
  .noxia-header-actions {
    flex-shrink: 0 !important;
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

  /* .chat-inputs-controls est un simple flex sans align-items : on l'aligne
     nous-mêmes pour que le bouton d'envoi reste centré verticalement face
     au champ de saisie, qui fait --chat--textarea--height (50px) de haut. */
  .chat-inputs-controls {
    align-items: center !important;
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

  /* ─── Chips de suggestions (remplace les anciennes questions « ... » injectées dans les messages) ─── */
  .noxia-chips-host {
    padding: 0 12px 8px !important;
  }

  .noxia-chips {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 6px !important;
  }

  .noxia-chip {
    background: rgba(255, 255, 255, 0.06) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    color: #c7d2fe !important;
    padding: 6px 12px !important;
    border-radius: 999px !important;
    cursor: pointer !important;
    font-size: 12px !important;
    font-family: inherit !important;
    font-weight: 500 !important;
    transition: background 0.15s ease, border-color 0.15s ease !important;
  }

  .noxia-chip:hover {
    background: rgba(99, 102, 241, 0.16) !important;
    border-color: rgba(99, 102, 241, 0.4) !important;
  }

  /* ─── Switch de mode Assistant IA / Administration ───────────────────── */
  .noxia-mode-switch-host {
    width: 100% !important;
    margin-top: 10px !important;
  }

  .noxia-mode-switch {
    display: flex !important;
    background: rgba(255, 255, 255, 0.06) !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    border-radius: 10px !important;
    padding: 3px !important;
    gap: 2px !important;
  }

  .noxia-mode-switch button {
    flex: 1 !important;
    background: transparent !important;
    border: none !important;
    color: rgba(255, 255, 255, 0.55) !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    font-family: inherit !important;
    padding: 6px 10px !important;
    border-radius: 7px !important;
    cursor: pointer !important;
    transition: background 0.15s ease, color 0.15s ease !important;
  }

  .noxia-mode-switch button.is-active {
    background: rgba(99, 102, 241, 0.9) !important;
    color: #ffffff !important;
  }

  /* ─── Panneau "Contacter l'administration NOXIA" ─────────────────────── */
  /* .chat-window a display:flex en flex-direction:row (valeur par défaut,
     non surchargée par le composant tiers) avec un seul enfant normalement
     (.chat-layout) : y ajouter .noxia-admin-chat-host comme second enfant
     flex le place à CÔTÉ de .chat-layout au lieu de le recouvrir, même une
     fois .chat-body/.chat-footer masqués (l'espace du switch de mode et du
     header reste géré par .chat-layout, qu'on ne démonte jamais). Positionné
     en absolute par-dessus le corps du chat pour éviter ce partage de ligne
     flex, ancré sous le header (dont la hauteur varie avec le switch de
     mode) plutôt qu'à une position fixe. */
  .chat-window {
    position: relative !important;
  }

  .noxia-admin-chat-host {
    position: absolute !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    top: var(--noxia-header-height, 0px) !important;
    background: #0d0c18 !important;
  }

  .noxia-admin-chat {
    display: flex !important;
    flex-direction: column !important;
    height: 100% !important;
    min-height: 0 !important;
  }

  .noxia-admin-chat-status {
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
    padding: 8px 12px 8px 18px !important;
    font-size: 11px !important;
    color: rgba(255, 255, 255, 0.5) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
  }

  /* Bouton de retour vers l'Assistant IA, toujours visible dans le panneau
     admin lui-même — indépendant du switch du header, qui peut sortir du
     cadre visible sur certains écrans/scrolls (voir clampWindowHeight). */
  .noxia-admin-chat-back {
    display: flex !important;
    align-items: center !important;
    gap: 4px !important;
    background: rgba(255, 255, 255, 0.08) !important;
    border: none !important;
    color: #c7d2fe !important;
    font-size: 11px !important;
    font-weight: 600 !important;
    font-family: inherit !important;
    padding: 5px 10px 5px 8px !important;
    border-radius: 999px !important;
    cursor: pointer !important;
    margin-right: auto !important;
    transition: background 0.15s ease !important;
  }

  .noxia-admin-chat-back:hover {
    background: rgba(255, 255, 255, 0.16) !important;
  }

  .noxia-admin-chat-dot {
    width: 6px !important;
    height: 6px !important;
    border-radius: 50% !important;
    background: #64748b !important;
  }

  .noxia-admin-chat-dot.is-online {
    background: #22c55e !important;
    box-shadow: 0 0 6px rgba(34, 197, 94, 0.8) !important;
  }

  .noxia-admin-chat-messages {
    flex: 1 !important;
    min-height: 0 !important;
    overflow-y: auto !important;
    padding: 18px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 10px !important;
    /* Barre de scroll fine cohérente avec le thème sombre — la barre
       native (épaisse, grise) casse visuellement le cadrage sur Chrome/
       Edge (scrollbar-width n'a pas d'effet dans ces navigateurs). */
    scrollbar-width: thin !important;
    scrollbar-color: rgba(255, 255, 255, 0.15) transparent !important;
  }

  .noxia-admin-chat-messages::-webkit-scrollbar {
    width: 6px !important;
  }

  .noxia-admin-chat-messages::-webkit-scrollbar-track {
    background: transparent !important;
  }

  .noxia-admin-chat-messages::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15) !important;
    border-radius: 999px !important;
  }

  .noxia-admin-chat-messages::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.25) !important;
  }

  .noxia-admin-chat-empty {
    color: rgba(255, 255, 255, 0.5) !important;
    font-size: 13px !important;
    line-height: 1.5 !important;
    text-align: center !important;
    margin: auto !important;
    max-width: 260px !important;
  }

  .noxia-admin-chat-msg {
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 4px !important;
  }

  .noxia-admin-chat-msg--inbound {
    align-items: flex-end !important;
  }

  .noxia-admin-chat-msg-bubble {
    max-width: 80% !important;
    padding: 10px 13px !important;
    border-radius: 14px !important;
    background: #1a1830 !important;
    border: 1px solid rgba(255, 255, 255, 0.06) !important;
  }

  .noxia-admin-chat-msg--inbound .noxia-admin-chat-msg-bubble {
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important;
    border: none !important;
  }

  .noxia-admin-chat-msg-sender {
    display: block !important;
    font-size: 10px !important;
    font-weight: 600 !important;
    opacity: 0.65 !important;
    margin-bottom: 2px !important;
  }

  .noxia-admin-chat-msg-bubble p {
    margin: 0 !important;
    font-size: 13px !important;
    line-height: 1.5 !important;
    color: #f1f5f9 !important;
  }

  .noxia-admin-chat-msg-meta {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
  }

  .noxia-admin-chat-msg-pending {
    font-size: 10px !important;
    color: rgba(255, 255, 255, 0.4) !important;
  }

  .noxia-admin-chat-msg-delete {
    background: none !important;
    border: none !important;
    color: rgba(255, 255, 255, 0.35) !important;
    font-size: 10px !important;
    font-family: inherit !important;
    cursor: pointer !important;
    padding: 0 !important;
    transition: color 0.15s ease !important;
  }

  .noxia-admin-chat-msg-delete:hover {
    color: #f87171 !important;
  }

  .noxia-admin-chat-input {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    padding: 12px !important;
    border-top: 1px solid rgba(255, 255, 255, 0.06) !important;
  }

  .noxia-admin-chat-input input {
    flex: 1 !important;
    background: #15132a !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 10px !important;
    padding: 10px 14px !important;
    color: #f1f5f9 !important;
    font-size: 13px !important;
    font-family: inherit !important;
    outline: none !important;
  }

  .noxia-admin-chat-input button {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 38px !important;
    height: 38px !important;
    border-radius: 10px !important;
    border: none !important;
    background: #6366f1 !important;
    color: #ffffff !important;
    cursor: pointer !important;
    flex-shrink: 0 !important;
    transition: background 0.15s ease !important;
  }

  .noxia-admin-chat-input button:hover:not(:disabled) {
    background: #4f46e5 !important;
  }

  .noxia-admin-chat-input button:disabled {
    opacity: 0.4 !important;
    cursor: not-allowed !important;
  }
`
