'use client'

import { useEffect } from 'react'

/**
 * Unique script d'effets de la landing (quelques centaines d'octets, sans
 * bibliothèque). Il ne rend rien : la page est entièrement lisible sans lui.
 * - apparitions au défilement : [data-reveal] hors écran caché puis révélé une fois ;
 * - maquettes animées (.nx-anim) en pause hors écran (.is-playing) ;
 * - animations arrêtées quand l'onglet est caché ;
 * - zoom de la photo du hero coupé sur les appareils faibles (.nx-lite) ;
 * - lueur qui suit le curseur ([data-glow]), souris uniquement.
 * Aucun écouteur de défilement : IntersectionObserver et pointermove passif.
 */
export function LandingEffects() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.nx-root')
    if (!root || !('IntersectionObserver' in window)) return
    const html = document.documentElement

    const nav = navigator as Navigator & { deviceMemory?: number }
    if ((nav.deviceMemory !== undefined && nav.deviceMemory <= 2) || (nav.hardwareConcurrency ?? 8) <= 4) {
      root.classList.add('nx-lite')
    }

    // Apparitions au défilement, sans mesure forcée ni classe globale : au
    // premier passage de l'observateur (asynchrone), seuls les éléments encore
    // hors écran sont cachés (.is-pending) ; ceux déjà visibles ne clignotent pas.
    // Démarré seulement une fois le navigateur libre (voir markReady) : les
    // sections sont hydratées une à une (<Suspense>) et React signale toute
    // classe ajoutée avant leur hydratation.
    const seen = new WeakSet<Element>()
    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target
          if (entry.isIntersecting) {
            el.classList.remove('is-pending')
            revealObserver.unobserve(el)
          } else if (!seen.has(el)) {
            el.classList.add('is-pending')
          }
          seen.add(el)
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
    )

    // Maquettes animées : chaque bloc ne s'anime qu'à l'écran et onglet visible
    // (classe posée bloc par bloc : pas de recalcul des styles de toute la page).
    const visible = new Set<Element>()
    const sync = (el: Element) => el.classList.toggle('is-playing', visible.has(el) && !document.hidden)
    const playObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target)
          else visible.delete(entry.target)
          sync(entry.target)
        }
      },
      { threshold: 0 },
    )

    const onVisibility = () => root.querySelectorAll('.nx-anim').forEach(sync)
    document.addEventListener('visibilitychange', onVisibility)

    // Défilement doux des ancres (natif, jamais de scroll-jacking), sauf mouvement réduit.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const previousScrollBehavior = html.style.scrollBehavior
    if (!reduceMotion) html.style.scrollBehavior = 'smooth'

    // Apparitions et animations décoratives ne démarrent qu'une fois le
    // navigateur libre : jamais pendant le premier affichage ni l'hydratation.
    const markReady = () => {
      root.querySelectorAll('[data-reveal]').forEach((el) => revealObserver.observe(el))
      root.querySelectorAll('.nx-anim').forEach((el) => playObserver.observe(el))
    }
    const hasIdle = typeof window.requestIdleCallback === 'function'
    const idleId = hasIdle ? window.requestIdleCallback(markReady, { timeout: 3000 }) : 0
    const timerId = hasIdle ? undefined : setTimeout(markReady, 1500)

    let frame = 0
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || frame) return
      const target = (event.target as Element | null)?.closest<HTMLElement>('[data-glow]')
      if (!target) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const box = target.getBoundingClientRect()
        target.style.setProperty('--mx', `${event.clientX - box.left}px`)
        target.style.setProperty('--my', `${event.clientY - box.top}px`)
      })
    }
    // Saut d'ancre (/#pricing...) : rendre d'abord toutes les sections (content-visibility)
    // pour que la position calculée soit exacte. Une seule fois, au premier clic.
    // Classe sur la racine (déjà hydratée), jamais sur les sections elles-mêmes.
    const renderAllSections = () => root.classList.add('nx-cv-off')
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest('a[href*="#"]')
      if (link) renderAllSections()
    }
    document.addEventListener('click', onClick, { capture: true })
    if (window.location.hash) renderAllSections()

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (finePointer) root.addEventListener('pointermove', onPointerMove, { passive: true })

    return () => {
      revealObserver.disconnect()
      playObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      root.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('click', onClick, { capture: true })
      if (frame) cancelAnimationFrame(frame)
      if (hasIdle) window.cancelIdleCallback(idleId)
      if (timerId) clearTimeout(timerId)
      html.style.scrollBehavior = previousScrollBehavior
    }
  }, [])

  return null
}
