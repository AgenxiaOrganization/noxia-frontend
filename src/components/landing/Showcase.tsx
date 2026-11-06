import Image from 'next/image'
import Link from 'next/link'
import { BadgeCheck } from 'lucide-react'
import type { Showcase as ShowcaseData, ShowcaseCompany } from './landing-data'

const RING_COLORS = ['#818cf8', '#4ade80', '#c084fc', '#fbbf24', '#f472b6', '#60a5fa']

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

// Logos optimisés par next/image (redimensionnés, AVIF/WebP) seulement pour
// les hôtes déclarés dans next.config.ts (Cloudflare R2) ; un logo de 2 Mo
// devient quelques ko. Ailleurs (stockage local en développement) : <img> différé.
function isOptimizable(url: string) {
  try {
    return new URL(url).hostname.endsWith('.r2.dev')
  } catch {
    return false
  }
}

function CompanyLogo({ company }: { company: ShowcaseCompany }) {
  if (!company.logo) {
    return <span className="text-base font-bold text-white">{initialsOf(company.name)}</span>
  }
  if (isOptimizable(company.logo)) {
    return <Image src={company.logo} alt="" width={64} height={64} sizes="64px" className="h-full w-full rounded-full object-cover" />
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={company.logo} alt="" width={64} height={64} loading="lazy" decoding="async" className="h-full w-full rounded-full object-cover" />
}

/** Vrais établissements clients (API /companies/showcase/), jamais de faux témoignage. */
export function Showcase({ data }: { data: ShowcaseData | null }) {
  if (!data || data.results.length === 0) return null
  return (
    <section className="nx-section nx-cv" aria-labelledby="showcase-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto" data-reveal>
          <p className="nx-eyebrow">Ils utilisent NOXIA</p>
          <h2 id="showcase-title" className="mt-4 text-3xl sm:text-4xl font-bold text-white">Des établissements qui pilotent déjà avec NOXIA</h2>
          <p className="mt-4 text-lg text-slate-400">
            <span className="font-bold text-indigo-300">{data.total_companies}</span> établissement{data.total_companies > 1 ? 's' : ''} inscrit{data.total_companies > 1 ? 's' : ''} sur la plateforme.
          </p>
        </div>
      </div>

      {/* Défilement automatique en boucle (CSS, transform seul) : la liste est
          doublée pour boucler sans saut ; la copie est cachée aux lecteurs
          d'écran. Pause au survol, au focus et au toucher ; liste fixe et
          défilable à la main si l'utilisateur demande moins de mouvement. */}
      <div className="nx-anim nx-marquee mt-12" data-reveal>
        <ul
          className="nx-marquee-track"
          style={{ ['--nx-marquee-duration' as string]: `${Math.max(20, data.results.length * 5)}s` }}
          aria-label="Établissements clients de NOXIA"
        >
          {[false, true].map((copy) =>
            data.results.map((company) => (
              <li
                key={`${copy ? 'b' : 'a'}-${company.id}`}
                className={`nx-card-soft relative flex-shrink-0 w-[240px] mr-5 p-5 flex flex-col items-center text-center gap-3 ${copy ? 'nx-marquee-copy' : ''}`}
                aria-hidden={copy || undefined}
              >
                {company.verified && company.verification_code && (
                  <Link
                    href={`/verify-doc?code=${encodeURIComponent(company.verification_code)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Voir la certification de cet établissement"
                    tabIndex={copy ? -1 : undefined}
                    className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-400/30"
                    aria-label={`Voir la certification de ${company.name}`}
                  >
                    <BadgeCheck className="w-4 h-4 text-emerald-300" aria-hidden="true" />
                  </Link>
                )}
                <span
                  className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full"
                  style={{ background: '#0b1020', boxShadow: `0 0 0 2px #05060f, 0 0 0 4px ${RING_COLORS[company.id % RING_COLORS.length]}` }}
                >
                  <CompanyLogo company={company} />
                </span>
                <p className="font-semibold text-sm text-white leading-tight">{company.name}</p>
                <p className="text-xs text-slate-400">{company.type_display} · {company.country}</p>
                <p className="rounded-full px-2.5 py-1 text-[11px] font-medium text-slate-400 bg-white/5 border border-white/10">
                  Client depuis {company.client_since_year}
                </p>
              </li>
            )),
          )}
        </ul>
      </div>
    </section>
  )
}
