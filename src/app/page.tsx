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
import { Footer } from '@/components/landing/Footer'
import { AssistantButton } from '@/components/landing/AssistantButton'

export default function Home() {
  return (
    <>
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