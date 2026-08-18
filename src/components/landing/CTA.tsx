'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Mail } from 'lucide-react'

export function CTA() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)
      setEmail('')
    }
  }

  return (
    <section 
      className="py-20"
      style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #312e81 70%, #4f46e5 100%)' 
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Bloc principal CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="rounded-3xl p-6 sm:p-12 shadow-2xl text-center"
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)'
          }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
            Prêt à transformer votre gestion ?
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-lg mx-auto">
            Rejoignez les établissements qui pilotent leur activité avec NOXIA. Essai gratuit de 30 jours.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="/register" 
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:shadow-xl transition transform hover:-translate-y-0.5"
              style={{ 
                background: '#ffffff',
                color: '#4f46e5'
              }}
            >
              Démarrer maintenant
            </a>
            <a 
              href="#contact" 
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl border border-white/30 text-white font-semibold text-base sm:text-lg hover:bg-white/10 transition"
            >
              Parler à un conseiller
            </a>
          </div>
          <p className="text-white/50 text-sm mt-6">
            Sans engagement. Carte bancaire non requise pour l'essai gratuit.
          </p>
        </motion.div>

        {/* Bloc email en dessous */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-8 rounded-2xl p-6 border text-center"
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            borderColor: 'rgba(255,255,255,0.1)'
          }}
        >
          <p className="text-sm mb-3" style={{ color: '#94a3b8' }}>
             Recevez nos actualités et offres exclusives
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre email"
                className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
                style={{
                  background: 'rgba(51, 65, 85, 0.5)',
                  border: '1px solid #334155'
                }}
                required
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg text-white text-sm font-semibold transition flex items-center justify-center gap-2"
              style={{
                background: '#4f46e5',
                boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
              }}
            >
              <Send className="w-4 h-4" />
              S'inscrire
            </button>
          </form>
          {submitted && (
            <p className="text-xs mt-2 animate-fade-in" style={{ color: '#22c55e' }}>
              ✅ Merci ! Vous êtes maintenant inscrit à la newsletter.
            </p>
          )}
        </motion.div>
      </div>
    </section>
  )
}