'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Beer, UtensilsCrossed, Sparkles, ArrowLeft, ImageOff, Loader2, MapPin,
  ShoppingBag, Plus, Minus, X, Clock, CheckCircle2, ChevronRight,
  CircleAlert, CircleX, Info,
} from 'lucide-react'
import { createPublicPreOrder } from '@/lib/api/catalog'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api/v1'

type Availability = 'in_stock' | 'low_stock' | 'out_of_stock' | 'unlimited'

type MenuProduct = {
  id: number
  name: string
  price: string
  photo: string | null
  brand: string
  alcohol_percentage: string | null
  volume_cl: number | null
  attributes: Record<string, string>
  availability: Availability
  max_order_quantity: number | null
  category_type: 'boisson' | 'nourriture' | 'service' | null
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

type CartLine = { product: MenuProduct; quantity: number }

const CATEGORY_ICONS: Record<string, typeof Beer> = {
  boisson: Beer,
  nourriture: UtensilsCrossed,
  service: Sparkles,
}

const CATEGORY_STYLES: Record<string, { text: string; bg: string; border: string; glow: string }> = {
  boisson: { text: 'text-primary-400', bg: 'bg-primary-500/15', border: 'border-primary-500/25', glow: 'rgba(99,102,241,0.35)' },
  nourriture: { text: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/25', glow: 'rgba(245,158,11,0.3)' },
  service: { text: 'text-accent-400', bg: 'bg-accent-500/15', border: 'border-accent-500/25', glow: 'rgba(16,185,129,0.3)' },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

// Statut simplifie uniquement (voir catalog.serializers.PublicMenuProductSerializer.get_availability)
// — jamais la quantite exacte de stock exposee a un client anonyme.
const AVAILABILITY_CONFIG: Record<Availability, { label: string; icon: typeof CircleAlert; text: string; bg: string } | null> = {
  in_stock: null, // cas le plus frequent : ne pas surcharger l'UI d'un badge "disponible" partout
  unlimited: null,
  low_stock: { label: 'Stock limité', icon: CircleAlert, text: 'text-amber-400', bg: 'bg-amber-500/15' },
  out_of_stock: { label: 'Rupture de stock', icon: CircleX, text: 'text-red-400', bg: 'bg-red-500/15' },
}

const ATTRIBUTE_LABELS: Record<string, string> = {
  couleur: 'Couleur',
  origine: 'Origine',
  temperature_service: 'Température de service',
  epice: 'Niveau épicé',
  temps_preparation_min: 'Préparation',
  allergenes: 'Allergènes',
}

function formatPrice(price: string | number) {
  const n = typeof price === 'number' ? price : parseFloat(price)
  if (Number.isNaN(n)) return String(price)
  return `${n.toLocaleString('fr-FR')} F`
}

// Le Gabon est en WAT (UTC+1 fixe, jamais de changement d'heure) — la
// commande doit toujours etre datee dans ce fuseau, jamais celui de
// l'appareil du client (potentiellement different s'il visite depuis
// l'etranger, ou simplement mal regle). `Intl` calcule l'heure actuelle a
// Libreville sans dependre du fuseau systeme du navigateur.
const GABON_UTC_OFFSET_MINUTES = 60

function nowInGabon(): Date {
  const utcNow = Date.now()
  return new Date(utcNow + GABON_UTC_OFFSET_MINUTES * 60 * 1000)
}

function gabonDateTimeToIso(dateStr: string, timeStr: string): string {
  // "2026-09-19" + "14:00" interprete comme 14:00 heure du Gabon (UTC+1) →
  // 13:00 UTC, quel que soit le fuseau de l'appareil qui execute ce code.
  const naiveUtcMs = new Date(`${dateStr}T${timeStr}:00Z`).getTime()
  return new Date(naiveUtcMs - GABON_UTC_OFFSET_MINUTES * 60 * 1000).toISOString()
}

export default function PublicMenuPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [data, setData] = useState<MenuResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<MenuCategory | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<MenuProduct | null>(null)
  const [cart, setCart] = useState<CartLine[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState<{ expiresAt: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [requestedDate, setRequestedDate] = useState('')
  const [requestedTime, setRequestedTime] = useState('')
  const [note, setNote] = useState('')
  const [stockNotice, setStockNotice] = useState<{ productId: number; message: string } | null>(null)

  // Message de limite de stock auto-disparaissant — evite un toast externe
  // sur une page publique qui n'utilise pas sonner ailleurs.
  useEffect(() => {
    if (!stockNotice) return
    const t = setTimeout(() => setStockNotice(null), 3500)
    return () => clearTimeout(t)
  }, [stockNotice])

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

  const cartTotal = useMemo(
    () => cart.reduce((sum, line) => sum + parseFloat(line.product.price) * line.quantity, 0),
    [cart],
  )
  const cartCount = useMemo(() => cart.reduce((sum, line) => sum + line.quantity, 0), [cart])

  // "Aujourd'hui" et "heure actuelle" toujours juges en heure du Gabon
  // (voir nowInGabon) — jamais celle de l'appareil du client.
  const todayInGabon = useMemo(() => nowInGabon().toISOString().slice(0, 10), [])
  const isToday = requestedDate === todayInGabon
  // Heure minimale selectionnable sur le champ <input type="time"> quand la
  // date choisie est aujourd'hui — empeche de choisir une heure deja passee
  // (ex: commander "pour 13h" alors qu'il est deja 15h au Gabon).
  const minTimeToday = useMemo(() => nowInGabon().toISOString().slice(11, 16), [])

  // Regle d'expiration signalee au client : si le creneau choisi tombe le
  // jour meme, la commande expire 24h apres si le staff ne l'a pas traitee ;
  // si c'est une date ulterieure, elle expire 48h apres ce creneau (voir
  // sales.models.PreOrder.compute_expiry, meme regle cote backend).
  const expiryNoticeHours = requestedDate ? (isToday ? 24 : 48) : 24

  // Les services (categorie "Services" du catalogue) sont consultables sur
  // le menu mais non commandables a distance — decision produit explicite.
  // Le backend revalide de toute facon (voir PreOrderCreateSerializer.validate),
  // ce controle cote client n'est qu'un retour immediat pour l'UX.
  function isOrderable(product: MenuProduct): boolean {
    return product.category_type !== 'service'
  }

  // Limite cote client basee sur `max_order_quantity` (uniquement renseigne
  // quand le stock est bas/en rupture, voir catalog.serializers) — le
  // backend revalide de toute facon a l'envoi (le stock peut changer entre
  // temps), ce controle n'est qu'un retour immediat pour l'UX. Retourne
  // `true` si l'ajout a reussi, pour que l'appelant (ex: fiche detail) sache
  // s'il doit fermer sa modal ou laisser le message d'erreur visible.
  function addToCart(product: MenuProduct): boolean {
    if (!isOrderable(product)) return false
    const currentQty = cart.find((l) => l.product.id === product.id)?.quantity ?? 0
    if (product.max_order_quantity !== null && currentQty >= product.max_order_quantity) {
      setStockNotice({
        productId: product.id,
        message: product.max_order_quantity > 0
          ? `Il ne reste que ${product.max_order_quantity} ${product.name} en stock.`
          : `${product.name} est en rupture de stock.`,
      })
      return false
    }
    setCart((prev) => {
      const existing = prev.find((l) => l.product.id === product.id)
      if (existing) {
        return prev.map((l) => (l.product.id === product.id ? { ...l, quantity: l.quantity + 1 } : l))
      }
      return [...prev, { product, quantity: 1 }]
    })
    return true
  }

  function quantityInCart(productId: number) {
    return cart.find((l) => l.product.id === productId)?.quantity ?? 0
  }

  function updateQuantity(productId: number, delta: number) {
    if (delta > 0) {
      const line = cart.find((l) => l.product.id === productId)
      if (line?.product.max_order_quantity !== null && line?.product.max_order_quantity !== undefined
        && line.quantity >= line.product.max_order_quantity) {
        setStockNotice({
          productId,
          message: line.product.max_order_quantity > 0
            ? `Il ne reste que ${line.product.max_order_quantity} ${line.product.name} en stock.`
            : `${line.product.name} est en rupture de stock.`,
        })
        return
      }
    }
    setCart((prev) => prev
      .map((l) => (l.product.id === productId ? { ...l, quantity: l.quantity + delta } : l))
      .filter((l) => l.quantity > 0))
  }

  async function handleSubmitOrder() {
    setFormError(null)
    if (!customerName.trim()) {
      setFormError('Merci d’indiquer votre nom.')
      return
    }
    if (!requestedDate || !requestedTime) {
      setFormError('Merci de choisir une date et une heure.')
      return
    }
    const requestedForIso = gabonDateTimeToIso(requestedDate, requestedTime)
    if (Number.isNaN(new Date(requestedForIso).getTime())) {
      setFormError('Date ou heure invalide.')
      return
    }
    // Meme jour + heure deja passee (heure du Gabon) : rejete cote client
    // pour un retour immediat, mais le backend revalide de toute facon
    // (voir catalog.serializers.PreOrderCreateSerializer.validate).
    if (isToday && requestedTime < minTimeToday) {
      setFormError('L’heure choisie est déjà passée pour aujourd’hui. Choisissez une heure à venir.')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createPublicPreOrder(slug, {
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim() || undefined,
        requested_for: requestedForIso,
        note: note.trim() || undefined,
        items: cart.map((l) => ({ product: l.product.id, quantity: l.quantity })),
      })
      setOrderSuccess({ expiresAt: result.expires_at })
      setCart([])
      setIsOrderFormOpen(false)
      setIsCartOpen(false)
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Impossible d’envoyer votre commande.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-dark-950 github-grid">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-dark-900/60 border border-dark-800/60 mb-4">
          <ImageOff className="w-7 h-7 text-dark-500" />
        </div>
        <p className="text-white font-display font-bold text-lg">{error}</p>
        <p className="text-sm mt-1.5 text-dark-400">Vérifiez le QR code ou le lien utilisé.</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-dark-950 relative overflow-x-hidden">
      {/* Ambiance de fond — meme langage visuel que le dashboard/landing NOXIA */}
      <div className="absolute inset-0 z-0 github-grid pointer-events-none" aria-hidden="true" />
      <div className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] max-w-[500px] max-h-[500px] github-glow-indigo rounded-full pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-[10%] right-[-15%] w-[60vw] h-[60vw] max-w-[420px] max-h-[420px] github-glow-emerald rounded-full pointer-events-none" aria-hidden="true" />

      {/* Message de limite de stock (auto-disparaissant) */}
      <AnimatePresence>
        {stockNotice && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-4 left-4 right-4 z-50 max-w-sm mx-auto flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 backdrop-blur-xl shadow-xl"
          >
            <CircleAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-xs text-amber-200 font-medium">{stockNotice.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* En-tete etablissement */}
        <motion.header
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="px-5 pt-10 pb-7 text-center"
        >
          {data.company_logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.company_logo}
              alt={data.company_name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover mx-auto mb-4 border border-dark-700/60 shadow-2xl shadow-primary-500/10"
            />
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-display font-bold text-white bg-gradient-to-br from-primary-500 to-indigo-600 shadow-2xl shadow-primary-500/20">
              {data.company_name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            {data.company_name}
          </h1>
          <p className="flex items-center justify-center gap-1.5 text-xs sm:text-sm mt-2 text-dark-400 font-medium">
            <MapPin className="w-3.5 h-3.5 text-primary-400" />
            Carte digitale — commande directe
          </p>
        </motion.header>

        <AnimatePresence mode="wait">
          {!activeCategory ? (
            <motion.div
              key="categories"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 sm:px-6 pb-32 space-y-3"
            >
              {data.categories.length === 0 && (
                <p className="text-center text-sm py-16 text-dark-500">
                  Aucun produit disponible pour le moment.
                </p>
              )}
              {data.categories.map((category, i) => {
                const Icon = CATEGORY_ICONS[category.type] ?? Sparkles
                const style = CATEGORY_STYLES[category.type] ?? CATEGORY_STYLES.service
                return (
                  <motion.button
                    key={category.id}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveCategory(category)}
                    className="group w-full flex items-center gap-4 p-4 sm:p-5 rounded-2xl text-left glass-card hover:glass-card-hover"
                  >
                    <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 border ${style.bg} ${style.border}`}>
                      <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${style.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-white text-base sm:text-lg">{category.name}</p>
                      <p className="text-xs sm:text-sm text-dark-400 mt-0.5">
                        {category.products.length} produit{category.products.length > 1 ? 's' : ''} disponible{category.products.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-dark-600 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </motion.button>
                )
              })}
            </motion.div>
          ) : (
            <motion.div
              key="products"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="px-4 sm:px-6 pb-32"
            >
              <button
                onClick={() => setActiveCategory(null)}
                className="flex items-center gap-1.5 text-sm mb-4 py-2 text-dark-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Toutes les catégories
              </button>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white mb-4">{activeCategory.name}</h2>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {activeCategory.products.map((product, i) => {
                  const qty = quantityInCart(product.id)
                  const isOut = product.availability === 'out_of_stock'
                  const badge = AVAILABILITY_CONFIG[product.availability]
                  return (
                    <motion.div
                      key={product.id}
                      custom={i}
                      initial="hidden"
                      animate="visible"
                      variants={fadeUp}
                      onClick={() => setSelectedProduct(product)}
                      className="group rounded-2xl overflow-hidden flex flex-col glass-card hover:glass-card-hover cursor-pointer"
                    >
                      <div className="aspect-square w-full flex items-center justify-center relative overflow-hidden bg-dark-900/60">
                        {product.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.photo}
                            alt={product.name}
                            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isOut ? 'opacity-40 grayscale' : ''}`}
                          />
                        ) : (
                          <ImageOff className="w-8 h-8 text-dark-700" />
                        )}
                        {qty > 0 && (
                          <span className="absolute top-2 right-2 min-w-[22px] h-[22px] px-1.5 rounded-full bg-primary-500 text-white text-[11px] font-bold flex items-center justify-center shadow-lg">
                            {qty}
                          </span>
                        )}
                        {badge && (
                          <span className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${badge.bg} ${badge.text}`}>
                            <badge.icon className="w-3 h-3" />
                            {badge.label}
                          </span>
                        )}
                      </div>
                      <div className="p-3 sm:p-3.5 flex-1 flex flex-col gap-1">
                        <p className="font-semibold text-sm text-white leading-tight line-clamp-2">{product.name}</p>
                        {(product.volume_cl || product.alcohol_percentage) && (
                          <p className="text-[11px] text-dark-500">
                            {[
                              product.volume_cl ? `${product.volume_cl}cl` : null,
                              product.alcohol_percentage ? `${product.alcohol_percentage}°` : null,
                            ].filter(Boolean).join(' • ')}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-auto pt-1.5">
                          <p className="font-display font-bold text-sm text-primary-300">
                            {formatPrice(product.price)}
                          </p>
                          {isOrderable(product) && (
                            <button
                              onClick={(e) => { e.stopPropagation(); addToCart(product) }}
                              disabled={isOut}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-primary-500 hover:bg-primary-400 active:scale-90 transition-all shadow-lg shadow-primary-500/30 disabled:opacity-30 disabled:pointer-events-none"
                              aria-label={`Ajouter ${product.name} à la commande`}
                            >
                              <Plus className="w-4 h-4 text-white" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center pb-8">
          <p className="text-[10px] text-dark-700 font-medium tracking-wide">
            Menu propulsé par NOXIA
          </p>
        </div>
      </div>

      {/* Fiche detail produit */}
      <AnimatePresence>
        {selectedProduct && (() => {
          const product = selectedProduct
          const isOut = product.availability === 'out_of_stock'
          const badge = AVAILABILITY_CONFIG[product.availability]
          const attributeEntries = Object.entries(product.attributes ?? {}).filter(([, v]) => v !== null && v !== '')
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 flex items-end sm:items-center sm:justify-center bg-black/70 backdrop-blur-sm"
              onClick={() => setSelectedProduct(null)}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full sm:max-w-md mx-auto rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto bg-dark-900 border-t sm:border border-x border-dark-700/60"
              >
                <div className="relative aspect-[4/3] sm:aspect-video w-full bg-dark-800/60 flex items-center justify-center">
                  {product.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.photo}
                      alt={product.name}
                      className={`w-full h-full object-cover ${isOut ? 'opacity-40 grayscale' : ''}`}
                    />
                  ) : (
                    <ImageOff className="w-10 h-10 text-dark-700" />
                  )}
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {badge && (
                    <span className={`absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                      <badge.icon className="w-3.5 h-3.5" />
                      {badge.label}
                    </span>
                  )}
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">{product.name}</h3>
                    {product.brand && (
                      <p className="text-sm text-dark-400 mt-0.5">{product.brand}</p>
                    )}
                  </div>

                  <p className="font-display text-2xl font-extrabold text-primary-300">
                    {formatPrice(product.price)}
                  </p>

                  {(product.volume_cl || product.alcohol_percentage || attributeEntries.length > 0) && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-dark-400 uppercase tracking-wide flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5" />
                        Caractéristiques
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {product.volume_cl && (
                          <div className="rounded-xl bg-dark-800/50 px-3 py-2">
                            <p className="text-[11px] text-dark-500">Volume</p>
                            <p className="text-sm text-white font-medium">{product.volume_cl}cl</p>
                          </div>
                        )}
                        {product.alcohol_percentage && (
                          <div className="rounded-xl bg-dark-800/50 px-3 py-2">
                            <p className="text-[11px] text-dark-500">Alcool</p>
                            <p className="text-sm text-white font-medium">{product.alcohol_percentage}°</p>
                          </div>
                        )}
                        {attributeEntries.map(([key, value]) => (
                          <div key={key} className="rounded-xl bg-dark-800/50 px-3 py-2">
                            <p className="text-[11px] text-dark-500">{ATTRIBUTE_LABELS[key] ?? key}</p>
                            <p className="text-sm text-white font-medium capitalize">{String(value)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {isOrderable(product) ? (
                    <button
                      onClick={() => { if (addToCart(product)) setSelectedProduct(null) }}
                      disabled={isOut}
                      className="w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-400 hover:to-indigo-500 shadow-lg shadow-primary-500/25 transition-all active:scale-[0.99]"
                    >
                      <Plus className="w-4 h-4" />
                      {isOut ? 'Indisponible pour le moment' : 'Ajouter à la commande'}
                    </button>
                  ) : (
                    <p className="text-xs text-center text-dark-500 py-2">
                      Ce service est proposé sur place, il ne peut pas être commandé en ligne.
                    </p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )
        })()}
      </AnimatePresence>

      {/* Bouton panier flottant */}
      <AnimatePresence>
        {cartCount > 0 && !isCartOpen && !isOrderFormOpen && !orderSuccess && (
          <motion.button
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-4 left-4 right-4 z-30 max-w-md mx-auto flex items-center justify-between px-5 py-4 rounded-2xl shadow-2xl shadow-primary-500/30 bg-gradient-to-r from-primary-500 to-indigo-600 active:scale-[0.98] transition-transform"
          >
            <span className="flex items-center gap-2.5 text-white font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
                {cartCount}
              </span>
              Voir ma commande
            </span>
            <span className="text-white font-display font-extrabold text-sm">{formatPrice(cartTotal)}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panier */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-end bg-black/70 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md sm:max-w-lg mx-auto rounded-t-3xl p-5 sm:p-6 max-h-[85vh] overflow-y-auto bg-dark-900 border-t border-x border-dark-700/60"
            >
              <div className="w-10 h-1 rounded-full bg-dark-700 mx-auto mb-5 sm:hidden" />
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-white font-bold text-lg">Votre commande</h3>
                <button onClick={() => setIsCartOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-12 text-center">
                  <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-dark-700" />
                  <p className="text-sm text-dark-500">Votre panier est vide.</p>
                </div>
              ) : (
                <div className="space-y-3 mb-5">
                  {cart.map((line) => (
                    <div key={line.product.id} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-dark-800/40">
                      <div className="min-w-0">
                        <p className="text-sm text-white font-medium truncate">{line.product.name}</p>
                        <p className="text-xs text-dark-500 mt-0.5">{formatPrice(line.product.price)}</p>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <button
                          onClick={() => updateQuantity(line.product.id, -1)}
                          className="w-7 h-7 rounded-full flex items-center justify-center bg-dark-700/60 hover:bg-dark-700 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5 text-white" />
                        </button>
                        <span className="text-sm text-white font-semibold w-4 text-center">{line.quantity}</span>
                        <button
                          onClick={() => updateQuantity(line.product.id, 1)}
                          className="w-7 h-7 rounded-full flex items-center justify-center bg-primary-500 hover:bg-primary-400 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cart.length > 0 && (
                <>
                  <div className="flex items-center justify-between py-4 border-t border-dark-800">
                    <span className="text-sm font-medium text-dark-400">Total</span>
                    <span className="text-xl font-display font-extrabold text-white">{formatPrice(cartTotal)}</span>
                  </div>
                  <button
                    onClick={() => { setIsCartOpen(false); setIsOrderFormOpen(true) }}
                    className="w-full py-3.5 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-400 hover:to-indigo-500 shadow-lg shadow-primary-500/25 transition-all active:scale-[0.99]"
                  >
                    Continuer
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formulaire de commande (nom, telephone, creneau) */}
      <AnimatePresence>
        {isOrderFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-end sm:items-center sm:justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => !isSubmitting && setIsOrderFormOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-md mx-auto rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto bg-dark-900 border-t sm:border border-x border-dark-700/60"
            >
              <div className="w-10 h-1 rounded-full bg-dark-700 mx-auto mb-5 sm:hidden" />
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-white font-bold text-lg">Vos coordonnées</h3>
                <button
                  onClick={() => !isSubmitting && setIsOrderFormOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="text-xs mb-1.5 block text-dark-400 font-medium">Votre nom *</label>
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ex : Jean Doe"
                    className="w-full rounded-xl px-3.5 py-3 text-sm text-white outline-none bg-dark-800/60 border border-dark-700/60 focus:border-primary-500/50 transition-colors placeholder:text-dark-600"
                  />
                </div>
                <div>
                  <label className="text-xs mb-1.5 block text-dark-400 font-medium">Téléphone (optionnel)</label>
                  <input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+241..."
                    className="w-full rounded-xl px-3.5 py-3 text-sm text-white outline-none bg-dark-800/60 border border-dark-700/60 focus:border-primary-500/50 transition-colors placeholder:text-dark-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs mb-1.5 block text-dark-400 font-medium">Date *</label>
                    <input
                      type="date"
                      value={requestedDate}
                      min={todayInGabon}
                      onChange={(e) => {
                        const nextDate = e.target.value
                        setRequestedDate(nextDate)
                        // Changer de date apres avoir choisi une heure deja
                        // passee pour "aujourd'hui" laisserait une heure
                        // invalide en memoire si on repasse sur aujourd'hui.
                        if (nextDate === todayInGabon && requestedTime && requestedTime < minTimeToday) {
                          setRequestedTime('')
                        }
                      }}
                      className="w-full rounded-xl px-3.5 py-3 text-sm text-white outline-none bg-dark-800/60 border border-dark-700/60 focus:border-primary-500/50 transition-colors [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="text-xs mb-1.5 block text-dark-400 font-medium">Heure *</label>
                    <input
                      type="time"
                      value={requestedTime}
                      min={isToday ? minTimeToday : undefined}
                      onChange={(e) => setRequestedTime(e.target.value)}
                      className="w-full rounded-xl px-3.5 py-3 text-sm text-white outline-none bg-dark-800/60 border border-dark-700/60 focus:border-primary-500/50 transition-colors [color-scheme:dark]"
                    />
                    {isToday && (
                      <p className="text-[11px] mt-1 text-dark-500">Heure du Gabon — à partir de {minTimeToday}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs mb-1.5 block text-dark-400 font-medium">Note (optionnel)</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Précisions sur votre commande..."
                    rows={2}
                    className="w-full rounded-xl px-3.5 py-3 text-sm text-white outline-none resize-none bg-dark-800/60 border border-dark-700/60 focus:border-primary-500/50 transition-colors placeholder:text-dark-600"
                  />
                </div>

                <div className="flex items-start gap-2.5 rounded-xl p-3.5 bg-amber-500/10 border border-amber-500/25">
                  <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <p className="text-xs text-amber-300/90 leading-relaxed">
                    Si votre commande n&apos;est pas traitée par l&apos;établissement, elle sera automatiquement
                    annulée <strong className="text-amber-200">{expiryNoticeHours}h après</strong> {expiryNoticeHours === 24 ? "l'heure choisie" : "la date choisie"}.
                  </p>
                </div>

                {formError && (
                  <p className="text-xs text-center text-red-400">{formError}</p>
                )}

                <button
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-60 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-400 hover:to-indigo-500 shadow-lg shadow-primary-500/25 transition-all active:scale-[0.99]"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Envoyer ma commande
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation */}
      <AnimatePresence>
        {orderSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
            onClick={() => setOrderSuccess(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl p-7 text-center bg-dark-900 border border-dark-700/60 shadow-2xl shadow-accent-500/10"
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-accent-500/15 border border-accent-500/25">
                <CheckCircle2 className="w-8 h-8 text-accent-400" />
              </div>
              <h3 className="font-display text-white font-bold text-lg mb-1.5">Commande envoyée !</h3>
              <p className="text-sm mb-5 text-dark-400 leading-relaxed">
                L&apos;établissement a reçu votre commande en temps réel. Présentez-vous au comptoir pour régler.
              </p>
              <p className="text-xs mb-5 text-amber-400/90">
                Expire automatiquement le {new Date(orderSuccess.expiresAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} si non traitée.
              </p>
              <button
                onClick={() => setOrderSuccess(null)}
                className="w-full py-3 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-400 hover:to-indigo-500 transition-all active:scale-[0.99]"
              >
                Fermer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
