import type { Metadata } from 'next'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'

export const metadata: Metadata = {
  title: 'Mentions légales - NOXIA',
  description: "Mentions légales de la plateforme NOXIA, éditée par Agenxia.",
}

// Bloc requis par l'Ordonnance n°0011/PR/2026 (Art. 4 et 25) mais qui ne peut
// pas être rempli tant que la société n'est pas immatriculée (pas de RCCM,
// pas de capital social, pas de siège social légal). À remplacer dès
// l'immatriculation — ne jamais publier de valeurs inventées à la place.
const TODO = 'À compléter après immatriculation'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-2 py-1">
      <dt className="font-medium text-white shrink-0">{label} :</dt>
      <dd style={{ color: value === TODO ? '#f59e0b' : '#94a3b8' }}>{value}</dd>
    </div>
  )
}

export default function MentionsLegalesPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-sm leading-relaxed" style={{ color: '#cbd5e1' }}>
        <h1 className="text-3xl font-bold text-white mb-8">Mentions légales</h1>

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-3">Éditeur</h2>
          <dl>
            <Row label="Raison sociale" value="Agenxia" />
            <Row label="Forme juridique" value={TODO + ' (SARL en cours d’immatriculation)'} />
            <Row label="Numéro RCCM" value={TODO} />
            <Row label="Capital social" value={TODO} />
            <Row label="Siège social" value={TODO} />
            <Row label="Téléphone" value="+241 74 82 16 35" />
            <Row label="E-mail" value="contact@noxia.ga" />
            <Row label="Responsable de la publication" value={TODO} />
          </dl>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-3">Hébergeur</h2>
          <dl>
            <Row label="Raison sociale" value="CloudStore Africa" />
            <Row label="Pays" value="Gabon" />
            <Row label="Adresse" value={TODO} />
            <Row label="Téléphone" value={TODO} />
          </dl>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-3">Nature du service</h2>
          <p>
            NOXIA est une plateforme logicielle (SaaS) de gestion destinée aux
            professionnels de l&apos;hospitalité (bars, snack-bars, boîtes de
            nuit) : gestion des stocks, des ventes, des finances et des
            équipes. L&apos;accès aux fonctionnalités de gestion est réservé
            aux comptes professionnels créés par les établissements clients et
            leur personnel autorisé.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-3">Contenus générés par intelligence artificielle</h2>
          <p>
            NOXIA propose un assistant conversationnel basé sur
            l&apos;intelligence artificielle. Les réponses de cet assistant
            sont signalées comme telles au fil de la conversation,
            conformément à la réglementation en vigueur relative aux contenus
            générés par IA.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">Droit applicable</h2>
          <p>
            Les présentes mentions légales sont soumises au droit gabonais.
          </p>
        </section>
      </main>
      <Footer />
    </>
  )
}
