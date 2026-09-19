'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClipboardList, Phone, Clock, User, Check, X, AlertTriangle, PackageCheck, StickyNote, Search, Loader2, Boxes } from 'lucide-react'
import { getPreOrders, processPreOrder, cancelPreOrder, PreOrder } from '../../../lib/api/sales'
import { invalidateApiCache } from '@/lib/api'
import { useWebSockets } from '../../../lib/hooks/useWebSockets'
import Loader from '@/components/ui/Loader'
import { FeatureLockedScreen, isFeatureNotIncludedError } from '@/components/ui/FeatureLockedScreen'
import { toast } from 'sonner'

const STATUS_LABELS: Record<PreOrder['status'], string> = {
  pending: 'En attente',
  processed: 'Traitée',
  expired: 'Expirée',
  cancelled: 'Annulée',
}

const STATUS_STYLES: Record<PreOrder['status'], string> = {
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  processed: 'bg-accent-500/15 text-accent-400 border-accent-500/30',
  expired: 'bg-dark-600/30 text-dark-400 border-dark-600/40',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
}

const cardVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.35, delay: Math.min(i * 0.04, 0.3), ease: [0.22, 1, 0.36, 1] as const },
  }),
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.2 } },
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

function formatAmount(value: string) {
  const n = parseFloat(value)
  if (Number.isNaN(n)) return value
  return `${n.toLocaleString('fr-FR')} F`
}

const HISTORY_TIME_LABELS: Record<PreOrder['status'], string> = {
  pending: 'Créée',
  processed: 'Encaissée',
  cancelled: 'Annulée',
  expired: 'Expirée',
}

// Heure a afficher dans l'historique : `processed_at` pour une action
// humaine (staff a encaisse ou annule), `updated_at` pour l'expiration
// automatique (Celery, voir sales.tasks.expire_stale_preorders — ne
// renseigne jamais processed_at, ce n'est pas une action du staff).
function historyTimestamp(preorder: PreOrder): string {
  return preorder.processed_at ?? preorder.updated_at
}

// Compare la recherche a la date formattee affichee (JJ/MM) en plus du nom
// et du telephone — permet de retrouver "19/09" sans avoir a connaitre le
// format ISO stocke en base.
function matchesSearch(preorder: PreOrder, query: string): boolean {
  if (!query) return true
  const q = query.trim().toLowerCase()
  if (preorder.customer_name.toLowerCase().includes(q)) return true
  if (preorder.customer_phone?.toLowerCase().includes(q)) return true
  const requestedDate = formatDateTime(preorder.requested_for).toLowerCase()
  const createdDate = formatDateTime(preorder.created_at).toLowerCase()
  return requestedDate.includes(q) || createdDate.includes(q)
}

export default function PreOrdersPage() {
  const [preorders, setPreorders] = useState<PreOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFeatureLocked, setIsFeatureLocked] = useState(false)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [confirmingPreorder, setConfirmingPreorder] = useState<PreOrder | null>(null)

  const loadData = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true)
      const data = await getPreOrders()
      setPreorders(data)
      setIsFeatureLocked(false)
    } catch (e) {
      if (isFeatureNotIncludedError(e)) {
        setIsFeatureLocked(true)
      } else {
        console.error('Erreur lors du chargement de la file d\'attente', e)
        toast.error('Erreur lors du chargement des commandes en ligne.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Une nouvelle commande client (menu QR public) declenche un broadcast
  // WebSocket dedie (voir catalog.views._broadcast_preorder_update,
  // groupe `preorders_company_{id}`) — la file d'attente doit apparaitre
  // instantanement sans que le staff ait besoin de rafraichir la page.
  useWebSockets('/ws/preorders/', () => {
    invalidateApiCache('/sales')
    loadData(true)
  })

  const handleProcess = async (preorder: PreOrder) => {
    try {
      setProcessingId(preorder.id)
      await processPreOrder(preorder.id)
      toast.success(`Commande de ${preorder.customer_name} encaissée avec succès !`)
      setConfirmingPreorder(null)
      loadData(true)
    } catch (e) {
      console.error('Erreur lors du traitement de la commande', e)
      toast.error(e instanceof Error ? e.message : 'Erreur lors du traitement de la commande.')
    } finally {
      setProcessingId(null)
    }
  }

  const handleCancel = async (preorder: PreOrder) => {
    if (!confirm(`Annuler la commande de ${preorder.customer_name} ?`)) return
    try {
      setProcessingId(preorder.id)
      await cancelPreOrder(preorder.id)
      toast.success('Commande annulée.')
      loadData(true)
    } catch (e) {
      console.error('Erreur lors de l\'annulation de la commande', e)
      toast.error(e instanceof Error ? e.message : 'Erreur lors de l\'annulation.')
    } finally {
      setProcessingId(null)
    }
  }

  const filtered = useMemo(
    () => preorders.filter((p) => matchesSearch(p, searchQuery)),
    [preorders, searchQuery],
  )

  if (isLoading) return <Loader />
  if (isFeatureLocked) {
    return <FeatureLockedScreen featureLabel="Commandes en ligne (file d'attente)" />
  }

  const pending = filtered.filter((p) => p.status === 'pending')
  const history = filtered.filter((p) => p.status !== 'pending')

  return (
    <div className="p-3 xs:p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary-500/15 border border-primary-500/30 flex items-center justify-center shrink-0">
            <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-display font-bold text-white">File d&apos;attente</h1>
            <p className="text-xs sm:text-sm text-dark-400 truncate">
              Commandes passées en temps réel depuis votre menu QR code.
            </p>
          </div>
        </div>

        <div className="relative sm:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, téléphone, date..."
            className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm text-white outline-none bg-dark-800/60 border border-dark-700/60 focus:border-primary-500/50 transition-colors placeholder:text-dark-500"
          />
        </div>
      </div>

      <section className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xs sm:text-sm font-semibold text-dark-300 uppercase tracking-wide">
            En attente
          </h2>
          <span className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-primary-500/15 text-primary-400 border border-primary-500/30">
            {pending.length > 0 && (
              <span className="relative flex w-1.5 h-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary-500" />
              </span>
            )}
            {pending.length}
          </span>
        </div>

        {pending.length === 0 ? (
          <div className="rounded-2xl border border-dark-800/60 bg-dark-900/50 p-8 sm:p-12 text-center">
            {searchQuery ? (
              <>
                <Search className="w-7 h-7 sm:w-8 sm:h-8 mx-auto mb-2 text-dark-600" />
                <p className="text-xs sm:text-sm text-dark-400">Aucune commande en attente ne correspond à « {searchQuery} ».</p>
              </>
            ) : (
              <>
                <ClipboardList className="w-7 h-7 sm:w-8 sm:h-8 mx-auto mb-2 text-dark-600" />
                <p className="text-xs sm:text-sm text-dark-400">Aucune commande en attente pour le moment.</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
            <AnimatePresence initial={false}>
              {pending.map((preorder, i) => (
                <motion.div
                  key={preorder.id}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className="rounded-2xl border border-dark-800/60 bg-dark-900/60 p-3.5 sm:p-4 flex flex-col gap-2.5 sm:gap-3 hover:border-primary-500/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <User className="w-4 h-4 text-primary-400 shrink-0" />
                      <span className="font-semibold text-white text-sm sm:text-base truncate">{preorder.customer_name}</span>
                    </div>
                    <span className={`shrink-0 text-[10px] sm:text-[11px] font-medium px-2 py-1 rounded-full border ${STATUS_STYLES[preorder.status]}`}>
                      {STATUS_LABELS[preorder.status]}
                    </span>
                  </div>

                  {preorder.customer_phone && (
                    <a
                      href={`tel:${preorder.customer_phone}`}
                      className="flex items-center gap-2 text-xs text-dark-400 hover:text-primary-400 transition-colors w-fit"
                    >
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      {preorder.customer_phone}
                    </a>
                  )}

                  <div className="flex items-center gap-2 text-xs text-dark-400">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    Souhaité pour le {formatDateTime(preorder.requested_for)}
                  </div>

                  <div className="rounded-xl bg-dark-800/50 p-2.5 sm:p-3 space-y-1 max-h-32 overflow-y-auto">
                    {preorder.items.map((item) => (
                      <div key={item.id} className="flex justify-between gap-2 text-xs text-dark-200">
                        <span className="truncate">{item.quantity} × {item.product_name}</span>
                        <span className="text-dark-400 shrink-0">{formatAmount(item.subtotal ?? '0')}</span>
                      </div>
                    ))}
                  </div>

                  {preorder.note && (
                    <div className="flex items-start gap-1.5 text-xs italic text-dark-400">
                      <StickyNote className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{preorder.note}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 gap-2">
                    <span className="font-display font-bold text-primary-400 text-sm sm:text-base">{formatAmount(preorder.total_amount)}</span>
                    <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-amber-400 text-right">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Expire {formatDateTime(preorder.expires_at)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setConfirmingPreorder(preorder)}
                      disabled={processingId === preorder.id}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-accent-500/15 text-accent-400 border border-accent-500/30 py-2.5 sm:py-2 text-xs sm:text-sm font-medium hover:bg-accent-500/25 active:scale-[0.98] transition disabled:opacity-50"
                    >
                      <PackageCheck className="w-4 h-4" />
                      Encaisser
                    </button>
                    <button
                      onClick={() => handleCancel(preorder)}
                      disabled={processingId === preorder.id}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-2.5 sm:py-2 text-sm font-medium hover:bg-red-500/20 active:scale-[0.98] transition disabled:opacity-50"
                      aria-label="Annuler la commande"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {history.length > 0 && (
        <section className="space-y-3 sm:space-y-4">
          <h2 className="text-xs sm:text-sm font-semibold text-dark-300 uppercase tracking-wide">
            Historique récent
          </h2>
          <div className="rounded-2xl border border-dark-800/60 bg-dark-900/50 divide-y divide-dark-800/60 overflow-hidden">
            {history.map((preorder) => (
              <div key={preorder.id} className="flex items-center justify-between gap-2 p-3 sm:p-3.5 text-sm">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <Check className="w-4 h-4 text-dark-600 shrink-0" />
                  <span className="text-dark-300 truncate">{preorder.customer_name}</span>
                  <span className="text-dark-500 text-xs shrink-0 hidden xs:inline">
                    {HISTORY_TIME_LABELS[preorder.status]} {formatDateTime(historyTimestamp(preorder))}
                  </span>
                </div>
                <span className={`shrink-0 text-[10px] sm:text-[11px] font-medium px-2 py-1 rounded-full border ${STATUS_STYLES[preorder.status]}`}>
                  {STATUS_LABELS[preorder.status]}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="text-[11px] text-dark-600 text-center px-4">
        Les commandes traitées, annulées ou expirées sont automatiquement supprimées après 7 jours.
      </p>

      {/* Confirmation d'encaissement — rappelle explicitement que le stock
          sera decremente maintenant (pas avant, voir decision produit :
          aucune reservation a la creation de la commande). */}
      <AnimatePresence>
        {confirmingPreorder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => processingId === null && setConfirmingPreorder(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl p-5 sm:p-6 bg-dark-900 border border-dark-700/60 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent-500/15 border border-accent-500/30 flex items-center justify-center shrink-0">
                  <PackageCheck className="w-5 h-5 text-accent-400" />
                </div>
                <h3 className="font-display text-white font-bold text-base">Confirmer l&apos;encaissement</h3>
              </div>

              <p className="text-sm text-dark-300 mb-3">
                Confirmez-vous l&apos;encaissement de la commande de <strong className="text-white">{confirmingPreorder.customer_name}</strong> ?
              </p>

              <div className="rounded-xl bg-dark-800/50 p-3 mb-4 space-y-1">
                {confirmingPreorder.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs text-dark-200">
                    <span>{item.quantity} × {item.product_name}</span>
                    <span className="text-dark-400">{formatAmount(item.subtotal ?? '0')}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-bold pt-1.5 mt-1.5 border-t border-dark-700/60">
                  <span className="text-white">Total</span>
                  <span className="text-primary-400">{formatAmount(confirmingPreorder.total_amount)}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl p-3 mb-5 bg-amber-500/10 border border-amber-500/25">
                <Boxes className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  Le stock de ces produits sera déduit immédiatement et pris en compte dans le tableau de bord
                  et les rapports de ventes.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmingPreorder(null)}
                  disabled={processingId === confirmingPreorder.id}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-dark-700/60 text-dark-300 hover:text-white hover:bg-white/5 transition disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleProcess(confirmingPreorder)}
                  disabled={processingId === confirmingPreorder.id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-accent-500 to-emerald-600 hover:from-accent-400 hover:to-emerald-500 shadow-lg shadow-accent-500/25 transition disabled:opacity-60"
                >
                  {processingId === confirmingPreorder.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <PackageCheck className="w-4 h-4" />}
                  Confirmer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
