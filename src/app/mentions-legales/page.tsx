import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'

export const metadata: Metadata = {
  // Le gabarit du layout racine ajoute « | NOXIA » : titre affiche « Mentions légales | NOXIA ».
  title: 'Mentions légales',
  description:
    "Mentions légales de NOXIA, plateforme éditée par AGENXIA (Libreville, Gabon).",
  robots: { index: true, follow: true },
  alternates: { canonical: '/mentions-legales' },
}

const EDITOR = 'Jacques Danis BOUSSENGUI MBOUALA'
const EMAIL = 'agenxia3@gmail.com'
const PHONE_DISPLAY = '+241 74 82 16 35'
const PHONE_LINK = '+24174821635'

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-2 py-1.5">
      <dt className="font-medium text-white shrink-0">{label} :</dt>
      <dd className="break-words" style={{ color: '#94a3b8' }}>{children}</dd>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
      {children}
    </section>
  )
}

const linkClass = 'text-primary-400 hover:underline'

export default function MentionsLegalesPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-sm leading-relaxed" style={{ color: '#cbd5e1' }}>
        <h1 className="text-3xl font-bold text-white mb-2">Mentions légales</h1>
        <p className="mb-10" style={{ color: '#94a3b8' }}>Dernière mise à jour : 6 novembre 2026</p>

        <Section title="Éditeur de la plateforme">
          <p className="mb-4">
            NOXIA est une plateforme éditée par <strong className="text-white">AGENXIA</strong>.
          </p>
          <dl>
            <Row label="Nom commercial">AGENXIA</Row>
            <Row label="Forme juridique">Entreprise individuelle</Row>
            <Row label="NIF">202601059686M</Row>
            <Row label="N° RCCM / d'identification">2026-A10-05514</Row>
            <Row label="Adresse">Quartier Bambouchine, BP 111, Libreville, Gabon</Row>
            <Row label="Téléphone"><a href={`tel:${PHONE_LINK}`} className={linkClass}>{PHONE_DISPLAY}</a></Row>
            <Row label="E-mail"><a href={`mailto:${EMAIL}`} className={linkClass}>{EMAIL}</a></Row>
            <Row label="Directeur de la publication">{EDITOR}</Row>
          </dl>
        </Section>

        <Section title="Hébergement">
          <dl>
            <Row label="Hébergeur">CloudStore Africa, plateforme de la société ST Digital</Row>
            <Row label="Siège social">Immeuble Entrelec, Bali, 1er arrondissement, Douala, Cameroun</Row>
            <Row label="Lieu d'hébergement">Datacenter de Nkok, Essassa, Gabon</Row>
            <Row label="Téléphone"><a href="tel:+237678221620" className={linkClass}>+237 6 78 22 16 20</a></Row>
            <Row label="E-mail"><a href="mailto:info@st.digital" className={linkClass}>info@st.digital</a></Row>
            <Row label="Site web">
              <a href="https://cloudstore.africa" target="_blank" rel="noopener noreferrer" className={linkClass}>cloudstore.africa</a>
            </Row>
          </dl>
        </Section>

        <Section title="Propriété intellectuelle">
          <p>
            La marque NOXIA, ainsi que l&apos;ensemble des contenus, du logiciel et de l&apos;interface de la
            plateforme, sont la propriété de l&apos;éditeur. Toute reproduction, représentation, modification ou
            diffusion, totale ou partielle, sans autorisation écrite préalable de l&apos;éditeur est interdite.
          </p>
        </Section>

        <Section title="Données personnelles">
          <p>
            NOXIA traite les données des comptes professionnels (établissements, utilisateurs, opérations de caisse
            et de stock) afin de fournir le service. Chaque utilisateur peut demander l&apos;accès, la rectification
            ou la suppression de ses données en écrivant à{' '}
            <a href={`mailto:${EMAIL}`} className={linkClass}>{EMAIL}</a>.
          </p>
          <p className="mt-2">
            Pour en savoir plus, consultez notre{' '}
            <Link href="/politique-confidentialite" className={linkClass}>politique de confidentialité</Link>.
          </p>
        </Section>

        <Section title="Intelligence artificielle">
          <p>
            NOXIA propose un assistant conversationnel (WhatsApp, Telegram, web) qui s&apos;appuie sur des modèles
            d&apos;intelligence artificielle. Les réponses générées par l&apos;assistant sont produites
            automatiquement et signalées comme telles.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Pour toute question : <a href={`mailto:${EMAIL}`} className={linkClass}>{EMAIL}</a> ou{' '}
            <a href={`tel:${PHONE_LINK}`} className={linkClass}>{PHONE_DISPLAY}</a>.
          </p>
        </Section>
      </main>
      <Footer />
    </>
  )
}
