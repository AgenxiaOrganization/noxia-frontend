'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// Le widget de discussion n'est pas utile au premier affichage : son code
// n'est téléchargé qu'à la première interaction (défilement, toucher, clavier)
// ou au bout de 6 s, jamais pendant le chargement de la page.
const AssistantButton = dynamic(() => import('./AssistantButton').then((m) => m.AssistantButton), { ssr: false })

const EVENTS = ['pointerdown', 'keydown', 'touchstart', 'scroll'] as const

export function LazyAssistant() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const start = () => setReady(true)
    const timer = setTimeout(start, 6000)
    EVENTS.forEach((type) => window.addEventListener(type, start, { once: true, passive: true }))
    return () => {
      clearTimeout(timer)
      EVENTS.forEach((type) => window.removeEventListener(type, start))
    }
  }, [])

  return ready ? <AssistantButton /> : null
}
