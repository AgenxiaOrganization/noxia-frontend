import { Suspense } from 'react'
import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { Problem } from '@/components/landing/Problem'
import { Bento } from '@/components/landing/Bento'
import { WhatsAppSection } from '@/components/landing/WhatsAppSection'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Pricing } from '@/components/landing/Pricing'
import { Showcase } from '@/components/landing/Showcase'
import { FAQ } from '@/components/landing/FAQ'
import { FinalCTA } from '@/components/landing/FinalCTA'
import { ContactSection } from '@/components/landing/ContactSection'
import { Footer } from '@/components/landing/Footer'
import { LandingEffects } from '@/components/landing/LandingEffects'
import { LazyAssistant } from '@/components/landing/LazyAssistant'
import { faqs } from '@/components/landing/faq-data'
import { getLandingData } from '@/components/landing/landing-data'
import '@/components/landing/landing.css'

// Pas de police web : la police système s'affiche immédiatement. Mesuré :
// Inter (48 ko, préchargée) retardait le premier affichage et redessinait le
// titre à son arrivée (LCP plus tardif). Règle : la vitesse passe avant tout.

// Plans et établissements relus au plus toutes les 5 minutes (voir landing-data.ts).
export const revalidate = 300

// FAQPage (JSON-LD) : reprend les vraies questions de la section FAQ pour
// que Google puisse les afficher comme extraits enrichis dans ses résultats.
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer },
  })),
}

export default async function Home() {
  const { plans, registry, showcase, trialDays } = await getLandingData()

  return (
    <div className="nx-root">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Navbar />
      {/* Une frontière <Suspense> par section : rien n'attend côté serveur (le
          HTML est identique), mais React hydrate chaque section dans sa propre
          tâche et laisse le navigateur répondre entre deux (TBT plus faible). */}
      <main>
        <Hero showcase={showcase} />
        <Suspense><Problem /></Suspense>
        <Suspense><Bento /></Suspense>
        <Suspense><WhatsAppSection /></Suspense>
        <Suspense><HowItWorks /></Suspense>
        <Suspense><Pricing plans={plans} registry={registry} /></Suspense>
        <Suspense><Showcase data={showcase} /></Suspense>
        <Suspense><FAQ /></Suspense>
        <Suspense><FinalCTA trialDays={trialDays} /></Suspense>
        <Suspense><ContactSection /></Suspense>
      </main>
      <Suspense><Footer /></Suspense>
      <LandingEffects />
      <LazyAssistant />
    </div>
  )
}
