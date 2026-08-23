'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Beer, UtensilsCrossed, Sparkles, ArrowLeft, ImageOff, Loader2, MapPin } from 'lucide-react'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api/v1'

type MenuProduct = {
  id: number
  name: string
  price: string
  photo: string | null
  brand: string
  alcohol_percentage: string | null
  volume_cl: number | null
  attributes: Record<string, string>
}

type MenuCategory = {
  id: number
  name: string
  type: 'boisson' | 'nourriture' | 'service'
  products: MenuProduct[]
}

type MenuResponse = {
  company_name: string
  company_logo: string | null
  categories: MenuCategory[]
}

const CATEGORY_ICONS: Record<string, typeof Beer> = {
  boisson: Beer,
  nourriture: UtensilsCrossed,
  service: Sparkles,
}

const CATEGORY_COLORS: Record<string, string> = {
  boisson: '#3b82f6',
  nourriture: '#f59e0b',
  service: '#8b5cf6',
}

function formatPrice(price: string) {
  const n = parseFloat(price)
  if (Number.isNaN(n)) return price
  return `${n.toLocaleString('fr-FR')} F`
}

export default function PublicMenuPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [data, setData] = useState<MenuResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<MenuCategory | null>(null)

  useEffect(() => {
    if (!slug) return
    let cancelled = false

    fetch(`${BASE_URL}/catalog/public-menu/${encodeURIComponent(slug)}/`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => null)
          throw new Error(body?.detail || 'Menu introuvable.')
        }
        return res.json()
      })
      .then((json: MenuResponse) => { if (!cancelled) setData(json) })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : 'Menu introuvable.') })

    return () => { cancelled = true }
  }, [slug])

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: '#0f172a' }}>
        <ImageOff className="w-10 h-10 mb-3" style={{ color: '#64748b' }} />
        <p className="text-white font-semibold">{error}</p>
        <p className="text-sm mt-1" style={{ color: '#64748b' }}>Vérifiez le QR code ou le lien utilisé.</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f172a' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#818cf8' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}>
      {/* Header établissement */}
      <div className="px-4 pt-8 pb-6 text-center">
        {data.company_logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.company_logo}
            alt={data.company_name}
            className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
            style={{ border: '2px solid rgba(255,255,255,0.15)' }}
          />
        ) : (
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}
          >
            {data.company_name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <h1 className="text-xl font-bold text-white">{data.company_name}</h1>
        <p className="flex items-center justify-center gap-1 text-xs mt-1" style={{ color: '#64748b' }}>
          <MapPin className="w-3 h-3" />
          Notre carte
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!activeCategory ? (
          <motion.div
            key="categories"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 pb-10 max-w-lg mx-auto space-y-3"
          >
            {data.categories.length === 0 && (
              <p className="text-center text-sm py-10" style={{ color: '#64748b' }}>
                Aucun produit disponible pour le moment.
              </p>
            )}
            {data.categories.map((category) => {
              const Icon = CATEGORY_ICONS[category.type] ?? Sparkles
              const color = CATEGORY_COLORS[category.type] ?? '#6366f1'
              return (
                <motion.button
                  key={category.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveCategory(category)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}26` }}
                  >
                    <Icon className="w-6 h-6" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">{category.name}</p>
                    <p className="text-xs" style={{ color: '#64748b' }}>
                      {category.products.length} produit{category.products.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </motion.button>
              )
            })}
          </motion.div>
        ) : (
          <motion.div
            key="products"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="px-4 pb-10 max-w-lg mx-auto"
          >
            <button
              onClick={() => setActiveCategory(null)}
              className="flex items-center gap-1.5 text-sm mb-4 py-2"
              style={{ color: '#94a3b8' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Retour aux catégories
            </button>
            <h2 className="text-lg font-bold text-white mb-3">{activeCategory.name}</h2>

            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
              {activeCategory.products.map((product) => (
                <div
                  key={product.id}
                  className="rounded-2xl overflow-hidden flex flex-col"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <div className="aspect-square w-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    {product.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.photo} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageOff className="w-8 h-8" style={{ color: '#334155' }} />
                    )}
                  </div>
                  <div className="p-3 flex-1 flex flex-col gap-1">
                    <p className="font-semibold text-sm text-white leading-tight">{product.name}</p>
                    {(product.volume_cl || product.alcohol_percentage) && (
                      <p className="text-[11px]" style={{ color: '#64748b' }}>
                        {[
                          product.volume_cl ? `${product.volume_cl}cl` : null,
                          product.alcohol_percentage ? `${product.alcohol_percentage}°` : null,
                        ].filter(Boolean).join(' • ')}
                      </p>
                    )}
                    <p className="font-bold text-sm mt-auto" style={{ color: '#a5b4fc' }}>
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center pb-6">
        <p className="text-[10px]" style={{ color: '#475569' }}>
          Menu propulsé par NOXIA
        </p>
      </div>
    </div>
  )
}
