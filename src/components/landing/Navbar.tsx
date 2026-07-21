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
        isScrolled 
          ? 'bg-dark-950/80 backdrop-blur-md border-b border-dark-800/40 py-3' 
          : 'bg-transparent py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-dark-900/50 p-1.5 border border-dark-800/60 overflow-hidden shadow-md transition-transform group-hover:scale-105">
              <div className="absolute inset-0 bg-primary-500/10 blur-md rounded-full" />
              <img 
                src="/logos/NOXIA_Orbit_Logo.svg" 
                alt="NOXIA" 
                className="relative w-full h-full object-contain"
              />
            </div>
            <span className="text-xl font-display font-bold tracking-wide text-white">
              NOXIA<span className="text-primary-500">.</span>
            </span>
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-dark-300">
            <a href="#features" className="hover:text-white transition duration-200">Fonctionnalités</a>
            <a href="#pricing" className="hover:text-white transition duration-200">Tarifs</a>
            <a href="#demo" className="hover:text-white transition duration-200">Démo</a>
            <a href="#faq" className="hover:text-white transition duration-200">FAQ</a>
            <a href="/documentation" className="hover:text-white transition duration-200">Documentation</a>
            <a href="#contact" className="hover:text-white transition duration-200">Contact</a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <a href="/login" className="text-sm font-semibold text-dark-300 hover:text-white transition duration-200">
              Connexion
            </a>
            <a 
              href="/register" 
              className="px-5 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-400 hover:to-indigo-500 text-white shadow-lg shadow-primary-500/15 hover:shadow-primary-500/25 transition-all transform hover:-translate-y-0.5"
            >
              Essai gratuit
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="md:hidden text-dark-300 hover:text-white p-2 rounded-lg hover:bg-white/5 transition"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        'md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )} onClick={() => setIsOpen(false)}>
        <div className={cn(
          'absolute right-0 top-0 h-full w-64 glass-panel border-l border-dark-800/60 p-6 pt-20 flex flex-col gap-4 transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )} onClick={(e) => e.stopPropagation()}>
          <a href="#features" className="block text-dark-300 hover:text-white py-2 font-medium" onClick={() => setIsOpen(false)}>Fonctionnalités</a>
          <a href="#pricing" className="block text-dark-300 hover:text-white py-2 font-medium" onClick={() => setIsOpen(false)}>Tarifs</a>
          <a href="#demo" className="block text-dark-300 hover:text-white py-2 font-medium" onClick={() => setIsOpen(false)}>Démo</a>
          <a href="#faq" className="block text-dark-300 hover:text-white py-2 font-medium" onClick={() => setIsOpen(false)}>FAQ</a>
          <a href="/documentation" className="block text-dark-300 hover:text-white py-2 font-medium" onClick={() => setIsOpen(false)}>Documentation</a>
          <a href="#contact" className="block text-dark-300 hover:text-white py-2 font-medium" onClick={() => setIsOpen(false)}>Contact</a>
          <div className="pt-4 border-t border-dark-800/60 space-y-3 mt-auto">
            <a href="/login" className="block text-center py-2.5 rounded-xl text-sm font-semibold text-dark-300 hover:text-white hover:bg-white/5 transition">Connexion</a>
            <a href="/register" className="block text-center px-4 py-3 text-sm font-bold rounded-xl bg-gradient-to-r from-primary-500 to-indigo-600 text-white shadow-md shadow-primary-500/10">Essai gratuit</a>
          </div>
        </div>
      </div>
    </nav>
  )
}