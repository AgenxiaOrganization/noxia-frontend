'use client'

import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
// Styles des boutons (.nx-btn-*) : la Navbar sert aussi aux pages légales.
import './landing.css'

const LINKS = [
  { href: '/#features', label: 'Fonctionnalités' },
  { href: '/#whatsapp', label: 'WhatsApp' },
  { href: '/#pricing', label: 'Tarifs' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/#contact', label: 'Contact' },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Fond de la barre dès qu'on quitte le haut de page : une sentinelle de 1 px
  // observée, plutôt qu'un écouteur de défilement appelé à chaque image.
  useEffect(() => {
    const sentinel = document.createElement('div')
    sentinel.setAttribute('aria-hidden', 'true')
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:12px;pointer-events:none'
    document.body.prepend(sentinel)
    const observer = new IntersectionObserver(([entry]) => setIsScrolled(!entry.isIntersecting))
    observer.observe(sentinel)
    return () => {
      observer.disconnect()
      sentinel.remove()
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen])

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-colors duration-300 ${
        isScrolled ? 'bg-[#05060f] md:bg-[#05060f]/75 md:backdrop-blur-md border-b border-white/[0.06]' : 'bg-transparent'
      }`}
      aria-label="Navigation principale"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2.5" aria-label="NOXIA - Retour à l'accueil">
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center p-1"
              style={{ background: '#020617', border: '1px solid #1e293b' }}
            >
              <img src="/logos/NOXIA_Orbit_Logo.svg" alt="" width={28} height={28} className="w-full h-full" />
            </span>
            <span className="text-lg font-bold tracking-wide text-white">
              NOXIA<span className="text-[#818cf8]" aria-hidden="true">.</span>
            </span>
          </a>

          <div className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-300">
            {LINKS.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-white transition-colors">{link.label}</a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a href="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-2 py-2">
              Connexion
            </a>
            <a href="/register" className="nx-btn-primary !py-2.5 !px-4 text-sm">
              Commencer
            </a>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            className="md:hidden text-slate-200 p-2 rounded-lg hover:bg-white/5"
            aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            {isOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={`md:hidden fixed inset-0 top-16 z-40 bg-black/60 transition-opacity duration-200 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden={!isOpen}
      >
        <div
          className={`absolute right-0 top-0 h-full w-72 max-w-[85vw] p-6 flex flex-col gap-1 border-l border-white/10 transition-transform duration-200 ease-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ background: '#0b1020' }}
          onClick={(e) => e.stopPropagation()}
        >
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              tabIndex={isOpen ? 0 : -1}
              className="block text-slate-200 hover:text-white py-3 text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-5 mt-auto border-t border-white/10 space-y-3">
            <a href="/login" tabIndex={isOpen ? 0 : -1} className="block text-center py-3 rounded-xl text-sm font-semibold text-slate-200 hover:bg-white/5">
              Connexion
            </a>
            <a href="/register" tabIndex={isOpen ? 0 : -1} className="nx-btn-primary w-full text-sm">
              Commencer
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}
