'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Mail, User, MessageSquare, Phone } from 'lucide-react'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api/v1'

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Relaie vers le proxy public Django (ContactFormProxyView,
      // /companies/contact/) qui route vers le webhook n8n dédié — jamais
      // d'appel direct navigateur -> n8n (même pattern qu'AssistantButton).
      const res = await fetch(`${BASE_URL}/companies/contact/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(data?.detail || "L'envoi a échoué. Veuillez réessayer.")
      }

      setSubmitted(true)
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
      setTimeout(() => setSubmitted(false), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "L'envoi a échoué. Veuillez réessayer.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <section 
      id="contact" 
      className="py-20 scroll-mt-16"
      style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #312e81 70%, #4f46e5 100%)' 
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
            Contactez-nous
          </h2>
          <p className="text-lg" style={{ color: '#94a3b8' }}>
            Une question ? Besoin d'un devis personnalisé ? N'hésitez pas à nous écrire.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="rounded-2xl p-6 sm:p-8 border"
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            borderColor: 'rgba(255,255,255,0.1)'
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Nom complet *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Jean Dupont"
                    className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
                    style={{
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid #334155'
                    }}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contact@monbar.com"
                    className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
                    style={{
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid #334155'
                    }}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+241 77 00 00 00"
                    className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
                    style={{
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid #334155'
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Sujet *</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Demande d'information"
                    className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
                    style={{
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid #334155'
                    }}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Message *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                placeholder="Décrivez votre demande..."
                className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition resize-none"
                style={{
                  background: 'rgba(51, 65, 85, 0.5)',
                  border: '1px solid #334155'
                }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl text-white font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
              style={{
                background: '#4f46e5',
                boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
              }}
            >
              {isSubmitting ? (
                'Envoi en cours...'
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Envoyer le message
                </>
              )}
            </button>

            {submitted && (
              <p className="text-center text-sm animate-fade-in" style={{ color: '#22c55e' }}>
                ✅ Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.
              </p>
            )}
            {error && (
              <p className="text-center text-sm animate-fade-in" style={{ color: '#f87171' }}>
                ⚠️ {error}
              </p>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  )
}