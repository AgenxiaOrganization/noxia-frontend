import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import type { Showcase } from './landing-data'

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

/**
 * Premier écran, rendu côté serveur : le titre s'affiche immédiatement, sans
 * attendre de JavaScript (avant, il restait invisible jusqu'au chargement de
 * Framer Motion). Seul le zoom lent de la photo est animé, en CSS.
 */
export function Hero({ showcase }: { showcase: Showcase | null }) {
  // Vrais établissements (API), jamais d'avatars ni de chiffre inventés.
  const companies = showcase?.results.slice(0, 3) ?? []
  const others = showcase ? Math.max(0, showcase.total_companies - companies.length) : 0

  return (
    <section
      className="relative isolate flex min-h-screen supports-[height:100svh]:min-h-[100svh] items-end overflow-hidden bg-slate-950 pb-14 pt-28 sm:pb-20 lg:items-center lg:pb-16"
      aria-labelledby="hero-title"
    >
      {/* Photographie : zoom d'entrée très lent, joué une seule fois */}
      <div className="nx-hero-zoom absolute inset-0 -z-20" aria-hidden="true">
        <Image
          src="/images/noxia/noxiaHero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_center] lg:object-[88%_center]"
        />
      </div>

      {/* Voiles de lisibilité : vertical sur mobile/tablette, latéral sur grand écran */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/10 lg:hidden" />
        <div className="absolute inset-0 hidden bg-gradient-to-r from-slate-950/95 via-slate-950/70 via-45% to-transparent lg:block" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-slate-950/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#05060f] to-transparent" />
        <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_55%,rgba(2,6,23,0.45)_100%)]" />
        {/* Touches violet/bleu de l'identité NOXIA (dégradés, sans flou coûteux) */}
        <div className="absolute -left-40 top-1/4 h-[520px] w-[520px] rounded-full [background:radial-gradient(circle,rgba(99,102,241,0.22),transparent_65%)]" />
        <div className="absolute bottom-0 left-1/3 h-[320px] w-[480px] rounded-full [background:radial-gradient(ellipse,rgba(79,70,229,0.16),transparent_65%)]" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl space-y-6 text-left lg:max-w-2xl">
          <p className="relative inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-slate-950/70 px-3.5 py-1.5 text-xs font-semibold text-indigo-200 shadow-inner">
            <span className="h-2 w-2 rounded-full bg-emerald-400 motion-safe:animate-ping" aria-hidden="true" />
            <span className="absolute left-[18px] h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            Lancement beta
          </p>

          <h1
            id="hero-title"
            className="text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-50 [text-shadow:0_2px_24px_rgba(2,6,23,0.55)] sm:text-5xl lg:text-6xl"
          >
            Le&nbsp;
            <span className="bg-gradient-to-r from-violet-300 via-indigo-300 to-sky-300 bg-clip-text text-transparent">
              Pilier intelligent
            </span>
            &nbsp;pour votre bar ou restaurant
          </h1>

          <p className="max-w-xl text-base font-medium leading-relaxed text-slate-200 [text-shadow:0_1px_12px_rgba(2,6,23,0.6)] sm:text-lg">
            Gérer vos stocks, vos ventes et votre équipe n&apos;a jamais été aussi simple.
            Pilotez tout depuis votre téléphone, WhatsApp ou Telegram.
          </p>

          <div className="flex flex-col gap-4 pt-2 sm:flex-row">
            <a
              href="/register"
              className="nx-btn-primary group px-8 py-4 text-base"
              aria-label="Démarrer gratuitement avec NOXIA"
            >
              Démarrer gratuitement
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </a>
          </div>

          {companies.length > 0 && (
            <div className="flex items-center gap-4 pt-4 text-sm text-slate-300">
              <div className="flex -space-x-2.5" aria-hidden="true">
                {companies.map((company) => (
                  <span
                    key={company.id}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-950 bg-gradient-to-br from-indigo-500 to-indigo-700 text-xs font-bold text-slate-50 shadow-md"
                  >
                    {initialsOf(company.name)}
                  </span>
                ))}
                {others > 0 && (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-950 bg-slate-900/90 text-xs font-bold text-slate-300">
                    +{others}
                  </span>
                )}
              </div>
              <p>
                {showcase!.total_companies} établissement{showcase!.total_companies > 1 ? 's' : ''} sur NOXIA
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
