'use client'

import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav 
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-300',
        isScrolled ? 'bg-dark-900/95 backdrop-blur-[10px] border-b border-dark-700' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg">
              <img 
                src="/logos/NOXIA_Orbit_Logo.svg" 
                alt="NOXIA" 
                className="w-6 h-6"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              NOXIA<span className="text-primary-400">.</span>
            </span>
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-dark-300">
            <a href="#features" className="hover:text-white transition">Fonctionnalités</a>
            <a href="#pricing" className="hover:text-white transition">Tarifs</a>
            <a href="#demo" className="hover:text-white transition">Démo</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
            <a href="/documentation" className="hover:text-white transition">Documentation</a>
            <a href="#contact" className="hover:text-white transition">Contact</a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <a href="/login" className="text-sm font-medium text-dark-300 hover:text-white transition">
              Connexion
            </a>
            <a href="/register" className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary-600 hover:bg-primary-500 transition shadow-lg shadow-primary-600/25 text-white">
              Essai gratuit
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="md:hidden text-dark-300 hover:text-white p-1"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        'md:hidden fixed inset-0 z-40 bg-black/60 transition-opacity',
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )} onClick={() => setIsOpen(false)}>
        <div className={cn(
          'absolute right-0 top-0 h-full w-64 bg-dark-800 p-6 pt-20 space-y-4 transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )} onClick={(e) => e.stopPropagation()}>
          <a href="#features" className="block text-dark-300 hover:text-white py-2" onClick={() => setIsOpen(false)}>Fonctionnalités</a>
          <a href="#pricing" className="block text-dark-300 hover:text-white py-2" onClick={() => setIsOpen(false)}>Tarifs</a>
          <a href="#demo" className="block text-dark-300 hover:text-white py-2" onClick={() => setIsOpen(false)}>Démo</a>
          <a href="#faq" className="block text-dark-300 hover:text-white py-2" onClick={() => setIsOpen(false)}>FAQ</a>
          <a href="/documentation" className="block text-dark-300 hover:text-white py-2" onClick={() => setIsOpen(false)}>Documentation</a>
          <a href="#contact" className="block text-dark-300 hover:text-white py-2" onClick={() => setIsOpen(false)}>Contact</a>
          <div className="pt-4 border-t border-dark-700 space-y-2">
            <a href="/login" className="block text-sm font-medium text-dark-300 hover:text-white">Connexion</a>
            <a href="/register" className="block text-center px-4 py-2 text-sm font-semibold rounded-lg bg-primary-600 hover:bg-primary-500 transition text-white">Essai gratuit</a>
          </div>
        </div>
      </div>
    </nav>
  )
}