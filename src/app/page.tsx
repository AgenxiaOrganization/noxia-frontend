import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Pricing } from '@/components/landing/Pricing'
import { FeatureComparison } from '@/components/landing/FeatureComparison'
import { Testimonials } from '@/components/landing/Testimonials'
import { CTA } from '@/components/landing/CTA'
import { ContactSection } from '@/components/landing/ContactSection'
import { FAQ } from '@/components/landing/FAQ'
import { faqs } from '@/components/landing/faq-data'
import { Footer } from '@/components/landing/Footer'
import { AssistantButton } from '@/components/landing/AssistantButton'

// FAQPage (JSON-LD) : reprend les vraies questions de la section FAQ pour
// que Google puisse les afficher comme extraits enrichis (accordéon) directement
// dans les résultats de recherche, sans qu'un visiteur ait besoin de cliquer.
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer },
  })),
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <FeatureComparison />
      <Testimonials />
      <CTA />
      <ContactSection />
      <FAQ />
      <Footer />
      <AssistantButton />
    </>
  )
}