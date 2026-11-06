import { EyeOff, PackageX, Wallet } from 'lucide-react'

const PROBLEMS = [
  {
    icon: PackageX,
    title: 'Des bouteilles qui disparaissent',
    text: "Le stock ne colle jamais avec les ventes, et personne ne sait dire où est passée la différence.",
  },
  {
    icon: Wallet,
    title: 'Des écarts de caisse en fin de soirée',
    text: "Impossible de savoir quel caissier a encaissé quoi, ni à quelle heure, une fois la soirée terminée.",
  },
  {
    icon: EyeOff,
    title: "Aucune vue quand vous êtes absent",
    text: "Dès que vous quittez l'établissement, vous attendez le lendemain pour connaître votre recette.",
  },
]

export function Problem() {
  return (
    <section className="nx-section nx-cv" aria-labelledby="problem-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl" data-reveal>
          <p className="nx-eyebrow">Le constat</p>
          <h2 id="problem-title" className="mt-4 text-3xl sm:text-4xl font-bold text-white">
            Ce que vous ne voyez pas vous coûte de l&apos;argent chaque soir
          </h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {PROBLEMS.map((problem, index) => (
            <article key={problem.title} className="nx-card-soft p-6" data-reveal style={{ ['--d' as string]: `${index * 90}ms` }}>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-400/20">
                <problem.icon className="w-5 h-5 text-rose-300" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-white">{problem.title}</h3>
              <p className="mt-2 text-slate-400 leading-relaxed">{problem.text}</p>
            </article>
          ))}
        </div>
        <p className="mt-10 text-lg text-slate-300 max-w-3xl" data-reveal>
          Avec NOXIA, <strong className="text-white">chaque vente, chaque mouvement de stock et chaque caissier sont tracés</strong>.
          Fini les pertes et les vols invisibles.
        </p>
      </div>
    </section>
  )
}
