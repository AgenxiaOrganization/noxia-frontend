import { ArrowRight, MessageCircle } from 'lucide-react'
import { WHATSAPP_URL } from './links'

export function FinalCTA({ trialDays }: { trialDays: number | null }) {
  return (
    <section className="nx-section nx-cv" aria-labelledby="cta-title">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="nx-card relative overflow-hidden px-6 py-14 sm:px-14 text-center" data-reveal>
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{ background: 'radial-gradient(ellipse 70% 80% at 50% 0%, rgba(99, 102, 241, 0.28), transparent 70%)' }}
          />
          <h2 id="cta-title" className="relative text-3xl sm:text-4xl font-bold text-white">
            Reprenez le contrôle de votre établissement dès ce soir
          </h2>
          <p className="relative mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
            {trialDays !== null
              ? `Essayez NOXIA gratuitement pendant ${trialDays} jours, sans carte bancaire.`
              : 'Créez votre compte en quelques minutes, sans carte bancaire.'}
          </p>
          <div className="relative mt-9 flex flex-col sm:flex-row justify-center gap-3">
            <a href="/register" className="nx-btn-primary text-base">
              Essayer NOXIA <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="nx-btn-secondary text-base">
              <MessageCircle className="w-4 h-4 text-[#25d366]" aria-hidden="true" /> Poser une question sur WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
