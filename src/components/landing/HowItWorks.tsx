import { LandingImageCard } from './LandingImageCard'

const STEPS = [
  {
    title: 'Créez votre compte',
    description: "Inscrivez votre établissement en quelques minutes et choisissez votre plan.",
  },
  {
    title: 'Configurez votre établissement',
    description: 'Ajoutez vos produits, vos caisses et votre équipe, avec un rôle pour chacun.',
  },
  {
    title: 'Pilotez de partout',
    description: "Liez votre WhatsApp ou Telegram avec votre identifiant unique, puis suivez tout depuis votre téléphone ou le tableau de bord.",
  },
]

export function HowItWorks() {
  return (
    <section className="nx-section nx-cv" aria-labelledby="how-it-works-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto" data-reveal>
          <p className="nx-eyebrow">Comment ça marche</p>
          <h2 id="how-it-works-title" className="mt-4 text-3xl sm:text-4xl font-bold text-white">
            Opérationnel en 3 étapes
          </h2>
        </div>

        <ol className="mt-14 grid gap-5 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="nx-card-soft relative p-6" data-reveal style={{ ['--d' as string]: `${index * 110}ms` }}>
              <div className="flex items-center gap-4" aria-hidden="true">
                <span className="nx-gradient-text text-5xl font-extrabold leading-none tracking-tight tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-indigo-400/60 via-emerald-400/30 to-transparent" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">
                <span className="sr-only">Étape {index + 1} : </span>
                {step.title}
              </h3>
              <p className="mt-2 text-slate-400 leading-relaxed">{step.description}</p>
            </li>
          ))}
        </ol>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <LandingImageCard
            index={0}
            src="/images/noxia/dashboard-noxia.jpg"
            alt="Un responsable consulte le tableau de bord NOXIA"
            title="Gardez le contrôle"
            description="Consultez vos indicateurs et suivez l'activité de votre établissement."
            icon="dashboard"
            color="#818cf8"
            aspectClassName="aspect-[2/1] md:aspect-[5/2]"
            objectClassName="object-[25%_center]"
          />
          {/* Le fichier source porte une bande violette en haut et un liseré à gauche : rognés au cadrage. */}
          <LandingImageCard
            index={1}
            src="/images/noxia/equipe-noxia.jpg"
            alt="Une équipe de restaurant collabore avec NOXIA"
            title="Une équipe mieux organisée"
            description="Facilitez la coordination entre les employés et les responsables."
            icon="users"
            color="#ec4899"
            aspectClassName="aspect-[2/1] md:aspect-[5/2]"
            objectClassName="object-[55%_bottom]"
            cropTopPercent={7}
          />
        </div>
      </div>
    </section>
  )
}
