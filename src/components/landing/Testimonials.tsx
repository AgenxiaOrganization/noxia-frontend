'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const testimonials = [
  {
    quote: "NOXIA a transformé la gestion de notre bar. Le suivi des stocks en temps réel nous fait économiser des milliers de FCFA chaque mois.",
    name: "Jean-Daniel M.",
    role: "Bar Le Premium, Libreville",
    initials: "JD",
    color: "#6366f1"
  },
  {
    quote: "La gestion via WhatsApp est révolutionnaire. Je peux vérifier mes stocks et mes ventes sans même ouvrir mon ordinateur.",
    name: "Marie K.",
    role: "Snack Le Délice, Port-Gentil",
    initials: "MK",
    color: "#22c55e"
  },
  {
    quote: "L'assistant IA est bluffant. Je lui pose des questions en français et il me répond instantanément avec les chiffres exacts.",
    name: "Alain B.",
    role: "Boîte de nuit Le VIP, Franceville",
    initials: "AL",
    color: "#8b5cf6"
  },
  {
    quote: "NOXIA nous a permis de réduire nos pertes de stock de 40% en seulement un mois.",
    name: "Claire N.",
    role: "Restaurant La Terrasse, Libreville",
    initials: "CN",
    color: "#f59e0b"
  },
  {
    quote: "Le support est exceptionnel et les mises à jour apportent constamment de nouvelles fonctionnalités.",
    name: "Michel O.",
    role: "Snack Le Coin, Port-Gentil",
    initials: "MO",
    color: "#ec4899"
  },
  {
    quote: "Multi-établissements est un vrai plus pour gérer notre groupe de 3 bars.",
    name: "Sophie L.",
    role: "Groupe VIP, Franceville",
    initials: "SL",
    color: "#3b82f6"
  },
]

export function Testimonials() {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    let scrollInterval: NodeJS.Timeout

    const startAutoScroll = () => {
      scrollInterval = setInterval(() => {
        if (scrollContainer) {
          const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth
          if (scrollContainer.scrollLeft >= maxScroll - 1) {
            scrollContainer.scrollTo({ left: 0, behavior: 'smooth' })
          } else {
            scrollContainer.scrollBy({ left: 200, behavior: 'smooth' })
          }
        }
      }, 3000)
    }

    startAutoScroll()

    const handleMouseEnter = () => clearInterval(scrollInterval)
    const handleMouseLeave = () => startAutoScroll()

    scrollContainer.addEventListener('mouseenter', handleMouseEnter)
    scrollContainer.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      clearInterval(scrollInterval)
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter)
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <section 
      className="py-20"
      style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #312e81 70%, #4f46e5 100%)' 
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
            Ils nous font confiance
          </h2>
          <p className="text-lg" style={{ color: '#94a3b8' }}>
            Plus de 50 établissements utilisent NOXIA au quotidien
          </p>
        </motion.div>

        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 scroll-smooth"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="min-w-[280px] sm:min-w-[320px] rounded-2xl p-6 flex-shrink-0 transition-all hover:scale-105"
              style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <p className="text-sm mb-4 leading-relaxed" style={{ color: '#cbd5e1' }}>
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: t.color }}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">{t.name}</p>
                  <p className="text-xs" style={{ color: '#64748b' }}>{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}