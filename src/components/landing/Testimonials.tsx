'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { BadgeCheck, MapPin, Store } from 'lucide-react'
import Link from 'next/link'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api/v1'

type ShowcaseCompany = {
  id: number
  name: string
  type: string
  type_display: string
  country: string
  logo: string | null
  client_since_year: number
  verified: boolean
  verification_code: string | null
}

type ShowcaseResponse = {
  total_companies: number
  results: ShowcaseCompany[]
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #6366f1, #818cf8)',
  'linear-gradient(135deg, #22c55e, #4ade80)',
  'linear-gradient(135deg, #8b5cf6, #c084fc)',
  'linear-gradient(135deg, #f59e0b, #fbbf24)',
  'linear-gradient(135deg, #ec4899, #f472b6)',
  'linear-gradient(135deg, #3b82f6, #60a5fa)',
]

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

function gradientFor(id: number) {
  return AVATAR_GRADIENTS[id % AVATAR_GRADIENTS.length]
}

/** Compteur qui s'anime de 0 jusqu'à `value` une fois la donnée réelle chargée. */
function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (v) => Math.round(v))

  useEffect(() => {
    const unsubscribe = rounded.on('change', (v) => setDisplay(v))
    const controls = animate(motionValue, value, { duration: 1.4, ease: 'easeOut' })
    return () => {
      unsubscribe()
      controls.stop()
    }
  }, [value, motionValue, rounded])

  return <span>{display}</span>
}

function CompanyCard({ company, index }: { company: ShowcaseCompany; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      viewport={{ once: true, amount: 0.3 }}
      whileHover={{ y: -6, borderColor: 'rgba(129, 140, 248, 0.4)' }}
      className="relative min-w-[240px] sm:min-w-[260px] rounded-2xl p-5 flex-shrink-0 flex flex-col items-center text-center gap-3 transition-shadow hover:shadow-2xl"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {company.verified && company.verification_code && (
        <Link
          href={`/verify-doc?code=${encodeURIComponent(company.verification_code)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          title="Voir la certification de cet établissement"
          className="absolute top-3 right-3 flex items-center justify-center w-6 h-6 rounded-full transition hover:scale-110"
          style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)' }}
        >
          <BadgeCheck className="w-3.5 h-3.5" style={{ color: '#4ade80' }} />
        </Link>
      )}

      <div
        className="w-16 h-16 rounded-full flex items-center justify-center p-0.5"
        style={{ background: gradientFor(company.id) }}
      >
        {company.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={company.logo}
            alt={company.name}
            className="w-full h-full rounded-full object-cover"
            style={{ border: '2px solid #1e293b' }}
          />
        ) : (
          <div
            className="w-full h-full rounded-full flex items-center justify-center text-base font-bold text-white"
            style={{ border: '2px solid #1e293b' }}
          >
            {initialsOf(company.name)}
          </div>
        )}
      </div>

      <div>
        <p className="font-semibold text-sm text-white leading-tight">{company.name}</p>
        <p className="flex items-center justify-center gap-1 text-xs mt-1" style={{ color: '#64748b' }}>
          <MapPin className="w-3 h-3" />
          {company.country}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-center">
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium"
          style={{
            background: 'rgba(99, 102, 241, 0.15)',
            color: '#a5b4fc',
            border: '1px solid rgba(99, 102, 241, 0.25)',
          }}
        >
          <Store className="w-3 h-3" />
          {company.type_display}
        </span>
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium"
          style={{
            background: 'rgba(255,255,255,0.05)',
            color: '#94a3b8',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          Client depuis {company.client_since_year}
        </span>
      </div>
    </motion.div>
  )
}

function SkeletonCard({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="min-w-[240px] sm:min-w-[260px] rounded-2xl p-5 flex-shrink-0 flex flex-col items-center gap-3 animate-pulse"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="w-16 h-16 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
      <div className="w-24 h-3 rounded" style={{ background: 'rgba(255,255,255,0.08)' }} />
      <div className="w-16 h-2.5 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
      <div className="w-20 h-4 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
    </motion.div>
  )
}

export function Testimonials() {
  const [data, setData] = useState<ShowcaseResponse | null>(null)
  const [error, setError] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false

    fetch(`${BASE_URL}/companies/showcase/`)
      .then((res) => {
        if (!res.ok) throw new Error('showcase fetch failed')
        return res.json()
      })
      .then((json: ShowcaseResponse) => {
        if (!cancelled) setData(json)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // Défilement horizontal automatique, en boucle, avec pause au survol —
  // seulement une fois les vraies cartes chargées (pas pendant le skeleton).
  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer || !data || data.results.length === 0) return

    let scrollInterval: ReturnType<typeof setInterval>

    const startAutoScroll = () => {
      scrollInterval = setInterval(() => {
        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth
        if (scrollContainer.scrollLeft >= maxScroll - 1) {
          scrollContainer.scrollTo({ left: 0, behavior: 'smooth' })
        } else {
          scrollContainer.scrollBy({ left: 260, behavior: 'smooth' })
        }
      }, 2800)
    }

    startAutoScroll()

    const handleMouseEnter = () => clearInterval(scrollInterval)
    const handleMouseLeave = () => startAutoScroll()

    scrollContainer.addEventListener('mouseenter', handleMouseEnter)
    scrollContainer.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      clearInterval(scrollInterval)
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter)
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [data])

  // Rien de crédible à montrer tant que la liste réelle n'est pas chargée,
  // et pas de fallback fictif en cas d'échec — la section disparaît plutôt
  // que d'afficher de faux établissements.
  if (error || (data && data.results.length === 0)) return null

  return (
    <section
      className="py-20 overflow-hidden relative"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #312e81 70%, #4f46e5 100%)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
            Ils nous font confiance
          </h2>
          <p className="text-lg" style={{ color: '#94a3b8' }}>
            {data ? (
              <>
                Plus de{' '}
                <span className="font-bold" style={{ color: '#a5b4fc' }}>
                  <AnimatedCounter value={data.total_companies} />
                </span>{' '}
                établissements utilisent NOXIA au quotidien
              </>
            ) : (
              'Des établissements utilisent NOXIA au quotidien'
            )}
          </p>
        </motion.div>
      </div>

      <div className="relative">
        {/* Dégradés de fondu sur les bords, pour suggérer que la liste continue. */}
        <div
          className="hidden sm:block absolute left-0 top-0 bottom-4 w-16 sm:w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #1e293b, transparent)' }}
        />
        <div
          className="hidden sm:block absolute right-0 top-0 bottom-4 w-16 sm:w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #4f46e5, transparent)' }}
        />

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-4 scroll-smooth px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {data
            ? data.results.map((company, index) => (
                <CompanyCard key={company.id} company={company} index={index} />
              ))
            : Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} index={index} />)}
        </div>
      </div>
    </section>
  )
}
