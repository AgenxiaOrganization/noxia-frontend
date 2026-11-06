import { Plus } from 'lucide-react'
import { faqs } from './faq-data'

/** Accordéon natif (<details>) : accessible au clavier, aucun JavaScript. */
export function FAQ() {
  return (
    <section id="faq" className="nx-section nx-cv" aria-labelledby="faq-title">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center" data-reveal>
          <p className="nx-eyebrow">FAQ</p>
          <h2 id="faq-title" className="mt-4 text-3xl sm:text-4xl font-bold text-white">Questions fréquentes</h2>
        </div>
        <div className="mt-12 space-y-3">
          {faqs.map((faq, index) => (
            <details key={faq.question} className="nx-faq nx-card-soft" data-reveal style={{ ['--d' as string]: `${Math.min(index, 4) * 60}ms` }}>
              <summary className="flex items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-white">
                {faq.question}
                <Plus className="nx-faq-icon w-5 h-5 shrink-0 text-indigo-300" aria-hidden="true" />
              </summary>
              <div className="nx-faq-body px-5 pb-5 text-slate-400 leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
