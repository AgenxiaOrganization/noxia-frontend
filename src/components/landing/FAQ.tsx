'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { faqs } from './faq-data'

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section
      id="faq"
      className="py-20"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #312e81 70%, #4f46e5 100%)'
      }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
            Questions fréquentes
          </h2>
          <p className="text-lg" style={{ color: '#94a3b8' }}>
            Tout ce qu'il faut savoir avant de vous lancer
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            const contentId = `faq-content-${index}`
            const buttonId = `faq-button-${index}`

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="rounded-xl p-4 sm:p-5 transition-all hover:border-primary-500 group"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  border: isOpen ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <button
                  id={buttonId}
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  className="w-full flex justify-between items-center gap-4 text-left cursor-pointer"
                >
                  <span className="font-semibold text-white group-hover:text-primary-400 transition">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    style={{ color: '#94a3b8' }}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div 
                    id={contentId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="mt-3 p-3 rounded-lg" 
                    style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)' }}
                  >
                    <p className="text-sm leading-relaxed" style={{ color: '#cbd5e1' }}>{faq.answer}</p>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}