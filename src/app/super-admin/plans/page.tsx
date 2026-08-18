'use client'

import { useState, useEffect, useContext, FormEvent } from 'react'
import {
  CreditCard, Plus, X, Trash2, Pencil, Star, Gift, Check, GripVertical,
  Shield, Tag, Percent, ArrowUp, ArrowDown, Eye, EyeOff, Globe, Lock,
} from 'lucide-react'
import { ServerContext } from '../layout'
import { getPlatformUser } from '@/lib/platformAuth'
import {
  listInstancePlans, createInstancePlan, updateInstancePlan, deleteInstancePlan,
  listInstanceFeatureRegistry,
  type InstancePlan, type PlanPayload, type PlanFeatureInput, type FeatureRegistryEntry,
} from '@/lib/api/plans'
import Loader from '@/components/ui/Loader'
import { toast } from 'sonner'

const emptyFeature = (): PlanFeatureInput => ({ label: '', included: true })

interface FormState {
  code: string
  name: string
  description: string
  price: string
  hasDiscount: boolean
  original_price: string
  discount_ends_at: string
  hasYearlyOffer: boolean
  yearly_price: string
  yearly_discount_percent: string
  trial_days: string
  period_label: string
  is_free: boolean
  is_featured: boolean
  badge_label: string
  cta_label: string
  is_active: boolean
  // Cles du registre EXPLICITEMENT decochees pour ce plan (modele deny-list :
  // une cle absente d'ici reste accessible, voir PlanFeaturePermission).
  excludedFeatureKeys: Set<string>
  // Fonctionnalites decoratives libres (sans lien avec un endpoint reel),
  // ex: "Support prioritaire 24/7" — affichees sur le comparatif public.
  freeFeatures: PlanFeatureInput[]
}

function emptyForm(): FormState {
  return {
    code: '', name: '', description: '', price: '0',
    hasDiscount: false, original_price: '', discount_ends_at: '',
    hasYearlyOffer: false, yearly_price: '', yearly_discount_percent: '',
    trial_days: '0', period_label: 'mois',
    is_free: false, is_featured: false, badge_label: '', cta_label: 'Choisir ce plan',
    is_active: true,
    excludedFeatureKeys: new Set(),
    freeFeatures: [emptyFeature()],
  }
}

function planToForm(plan: InstancePlan): FormState {
  const features = Array.isArray(plan.features) ? plan.features : []
  const freeFeatures: PlanFeatureInput[] = features
    .filter((f) => !f.key)
    .map((f) => ({ label: f.label, included: f.included }))
  return {
    code: plan.code,
    name: plan.name,
    description: plan.description,
    price: plan.price,
    hasDiscount: plan.original_price !== null,
    original_price: plan.original_price ?? '',
    discount_ends_at: plan.discount_ends_at ? plan.discount_ends_at.slice(0, 16) : '',
    hasYearlyOffer: plan.yearly_price !== null,
    yearly_price: plan.yearly_price ?? '',
    yearly_discount_percent: String(plan.yearly_discount_percent ?? 0),
    trial_days: String(plan.trial_days),
    period_label: plan.period_label,
    is_free: plan.is_free,
    is_featured: plan.is_featured,
    badge_label: plan.badge_label,
    cta_label: plan.cta_label,
    is_active: plan.is_active,
    // Cle absente du plan = incluse par defaut (modele deny-list, voir
    // PlanFeaturePermission cote backend) : la checkbox doit refleter cet
    // etat par defaut plutot que de partir decochee.
    excludedFeatureKeys: new Set(
      features.filter((f) => f.key && !f.included).map((f) => f.key as string),
    ),
    freeFeatures: freeFeatures.length > 0 ? freeFeatures : [emptyFeature()],
  }
}

function formatFcfa(value: string | number): string {
  const n = typeof value === 'string' ? parseFloat(value) : value
  if (Number.isNaN(n)) return '0'
  return n.toLocaleString('fr-FR')
}

export default function SuperAdminPlans() {
  const { isGlobalMode, selectedServer } = useContext(ServerContext)
  const platformUser = getPlatformUser()
  const isSuperAdmin = platformUser?.role === 'super_admin'

  const [plans, setPlans] = useState<InstancePlan[]>([])
  const [featureRegistry, setFeatureRegistry] = useState<FeatureRegistryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())

  const loadData = () => {
    if (isGlobalMode) return
    setIsLoading(true)
    setError(null)
    Promise.all([listInstancePlans(selectedServer.id), listInstanceFeatureRegistry(selectedServer.id)])
      .then(([list, registry]) => {
        setPlans([...list].sort((a, b) => a.display_order - b.display_order))
        setFeatureRegistry(registry)
      })
      .catch((e) => {
        console.error('Erreur chargement des plans', e)
        setError('Impossible de charger le catalogue de plans de cette instance.')
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(loadData, [selectedServer.id, isGlobalMode])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm())
    setIsFormOpen(true)
  }

  const openEdit = (plan: InstancePlan) => {
    setEditingId(plan.id)
    setForm(planToForm(plan))
    setIsFormOpen(true)
  }

  const updateFreeFeature = (index: number, patch: Partial<PlanFeatureInput>) => {
    setForm((f) => ({
      ...f,
      freeFeatures: f.freeFeatures.map((feat, i) => (i === index ? { ...feat, ...patch } : feat)),
    }))
  }

  const addFreeFeature = () => setForm((f) => ({ ...f, freeFeatures: [...f.freeFeatures, emptyFeature()] }))
  const removeFreeFeature = (index: number) =>
    setForm((f) => ({ ...f, freeFeatures: f.freeFeatures.filter((_, i) => i !== index) }))

  const toggleRegistryFeature = (key: string) => {
    setForm((f) => {
      const next = new Set(f.excludedFeatureKeys)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return { ...f, excludedFeatureKeys: next }
    })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      const payload: PlanPayload = {
        code: form.code.trim().toLowerCase(),
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price) || 0,
        original_price: form.hasDiscount && form.original_price ? parseFloat(form.original_price) : null,
        discount_ends_at: form.hasDiscount && form.discount_ends_at ? new Date(form.discount_ends_at).toISOString() : null,
        yearly_price: form.hasYearlyOffer && form.yearly_price ? parseFloat(form.yearly_price) : null,
        yearly_discount_percent: form.hasYearlyOffer ? (parseInt(form.yearly_discount_percent, 10) || 0) : 0,
        trial_days: parseInt(form.trial_days, 10) || 0,
        period_label: form.period_label.trim(),
        is_free: form.is_free,
        is_featured: form.is_featured,
        badge_label: form.badge_label.trim(),
        cta_label: form.cta_label.trim() || 'Choisir ce plan',
        is_active: form.is_active,
        // Modele deny-list : on n'envoie que les cles EXPLICITEMENT
        // decochees (included: false) — les cles absentes restent
        // accessibles par defaut (voir PlanFeaturePermission cote backend).
        features: [
          ...Array.from(form.excludedFeatureKeys).map((key) => ({ key, included: false })),
          ...form.freeFeatures.filter((feat) => (feat.label ?? '').trim().length > 0),
        ],
      }

      if (editingId) {
        await updateInstancePlan(selectedServer.id, editingId, payload)
        toast.success(`Plan "${payload.name}" mis à jour pour ${selectedServer.name}.`)
      } else {
        const created = await createInstancePlan(selectedServer.id, payload)
        await updateInstancePlan(selectedServer.id, created.id, { display_order: plans.length })
        toast.success(`Plan "${payload.name}" créé pour ${selectedServer.name}.`)
      }
      setIsFormOpen(false)
      loadData()
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (plan: InstancePlan) => {
    if (!confirm(`Supprimer le plan "${plan.name}" ? S'il a déjà des abonnés, il sera désactivé plutôt que supprimé.`)) return
    try {
      await deleteInstancePlan(selectedServer.id, plan.id)
      toast.success('Plan supprimé (ou désactivé si des abonnés y sont rattachés).')
      loadData()
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la suppression.')
    }
  }

  const handleToggleActive = async (plan: InstancePlan) => {
    try {
      await updateInstancePlan(selectedServer.id, plan.id, { is_active: !plan.is_active })
      toast.success(plan.is_active ? 'Plan masqué de la landing.' : 'Plan visible sur la landing.')
      loadData()
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour.')
    }
  }

  const handleReorder = async (plan: InstancePlan, direction: -1 | 1) => {
    const sorted = [...plans].sort((a, b) => a.display_order - b.display_order)
    const index = sorted.findIndex((p) => p.id === plan.id)
    const swapWith = sorted[index + direction]
    if (!swapWith) return
    try {
      await Promise.all([
        updateInstancePlan(selectedServer.id, plan.id, { display_order: swapWith.display_order }),
        updateInstancePlan(selectedServer.id, swapWith.id, { display_order: plan.display_order }),
      ])
      loadData()
    } catch (err) {
      console.error(err)
      toast.error('Erreur lors du réordonnancement.')
    }
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <Shield className="w-10 h-10" style={{ color: '#334155' }} />
        <p className="text-sm" style={{ color: '#94a3b8' }}>
          La gestion des plans d'abonnement est réservée aux comptes super-admin.
        </p>
      </div>
    )
  }

  if (isGlobalMode) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <Globe className="w-10 h-10" style={{ color: '#334155' }} />
        <p className="text-sm" style={{ color: '#94a3b8' }}>
          Sélectionnez une instance dans le menu pour paramétrer ses plans d'abonnement — chaque
          pays a sa propre offre commerciale (prix, essais, promotions).
        </p>
      </div>
    )
  }

  if (isLoading) return <Loader />

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Plans d'abonnement — {selectedServer.name}</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            Offre commerciale propre à cette instance — chaque changement est immédiatement reflété
            sur la landing page de {selectedServer.name}.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition bg-primary-500 hover:brightness-110 active:scale-95 flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Ajouter un plan
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center gap-2 rounded-2xl border border-dark-800/40 glass-card">
            <CreditCard className="w-10 h-10" style={{ color: '#334155' }} />
            <p className="text-sm" style={{ color: '#64748b' }}>Aucun plan configuré pour cette instance.</p>
          </div>
        ) : (
          plans.map((plan, index) => {
            // Defensif : `features` doit etre une liste {label, included} —
            // au cas ou une donnee mal formee (ancien format, edition
            // manuelle en base) atteigne quand meme cette page.
            const planFeatures = Array.isArray(plan.features) ? plan.features : []
            return (
            <div
              key={plan.id}
              className="rounded-2xl border p-5 relative flex flex-col"
              style={{
                background: plan.is_featured ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(49, 46, 129, 0.1))' : '#1e293b',
                borderColor: plan.is_featured ? '#6366f1' : '#334155',
                opacity: plan.is_active ? 1 : 0.55,
              }}
            >
              {plan.badge_label && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1"
                  style={{ background: plan.is_free ? '#22c55e' : '#6366f1' }}
                >
                  {plan.is_free ? <Gift className="w-3 h-3" /> : <Star className="w-3 h-3" />}
                  {plan.badge_label}
                </div>
              )}

              <div className="flex items-start justify-between mt-2 gap-2">
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-white truncate">{plan.name}</h3>
                  <p className="text-xs font-mono" style={{ color: '#64748b' }}>{plan.code}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleReorder(plan, -1)} disabled={index === 0} className="p-1 rounded transition hover:bg-white/5 disabled:opacity-20" title="Monter">
                    <ArrowUp className="w-3.5 h-3.5" style={{ color: '#94a3b8' }} />
                  </button>
                  <button onClick={() => handleReorder(plan, 1)} disabled={index === plans.length - 1} className="p-1 rounded transition hover:bg-white/5 disabled:opacity-20" title="Descendre">
                    <ArrowDown className="w-3.5 h-3.5" style={{ color: '#94a3b8' }} />
                  </button>
                </div>
              </div>

              <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>{plan.description || 'Aucune description'}</p>

              <div className="my-3">
                {plan.has_active_discount && plan.original_price && (
                  <span className="text-sm line-through mr-2" style={{ color: '#64748b' }}>
                    {formatFcfa(plan.original_price)} FCFA
                  </span>
                )}
                <span className={`text-2xl font-bold ${plan.is_free ? 'text-green-400' : 'text-white'}`}>
                  {parseFloat(plan.price) === 0 ? 'Gratuit' : formatFcfa(plan.price) + ' FCFA'}
                </span>
                {parseFloat(plan.price) > 0 && (
                  <span className="text-xs" style={{ color: '#94a3b8' }}>/{plan.period_label}</span>
                )}
                {plan.has_active_discount && (
                  <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#f59e0b' }}>
                    <Percent className="w-3 h-3" />
                    Remise active{plan.discount_ends_at ? ` jusqu'au ${new Date(plan.discount_ends_at).toLocaleDateString('fr-FR')}` : ''}
                  </p>
                )}
                {plan.yearly_price !== null && (
                  <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#818cf8' }}>
                    <Percent className="w-3 h-3" />
                    Annuel : {formatFcfa(plan.yearly_price)} FCFA{plan.yearly_discount_percent > 0 ? ` (-${plan.yearly_discount_percent}%)` : ''}
                  </p>
                )}
              </div>

              <ul className="space-y-1.5 mb-4 text-xs flex-1">
                {planFeatures.slice(0, 5).map((feat, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-3 h-3 shrink-0" style={{ color: feat.included ? '#22c55e' : '#475569' }} />
                    <span style={{ color: feat.included ? '#cbd5e1' : '#475569' }}>{feat.label}</span>
                  </li>
                ))}
                {planFeatures.length > 5 && (
                  <li className="text-xs" style={{ color: '#64748b' }}>+{planFeatures.length - 5} autres</li>
                )}
              </ul>

              <div className="flex items-center gap-2 pt-3 border-t" style={{ borderColor: '#334155' }}>
                <button
                  onClick={() => openEdit(plan)}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5"
                  style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Modifier
                </button>
                <button
                  onClick={() => handleToggleActive(plan)}
                  className="p-2 rounded-lg transition hover:bg-white/5"
                  title={plan.is_active ? 'Masquer de la landing' : 'Afficher sur la landing'}
                >
                  {plan.is_active ? <Eye className="w-4 h-4" style={{ color: '#94a3b8' }} /> : <EyeOff className="w-4 h-4" style={{ color: '#64748b' }} />}
                </button>
                <button
                  onClick={() => handleDelete(plan)}
                  className="p-2 rounded-lg transition hover:bg-red-500/10"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" style={{ color: '#f87171' }} />
                </button>
              </div>
            </div>
            )
          })
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl my-8 p-6 rounded-2xl border border-dark-800/60 bg-dark-900 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-dark-800/60">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary-400" />
                {editingId ? 'Modifier le plan' : 'Nouveau plan'} — {selectedServer.name}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-dark-400">Code (identifiant unique)</label>
                  <input
                    type="text" required maxLength={30} pattern="[a-z0-9\-]+" disabled={!!editingId}
                    value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                    placeholder="premium-plus"
                    className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none bg-dark-950/50 border border-dark-800/60 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-dark-400">Nom affiché</label>
                  <input
                    type="text" required
                    value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Premium"
                    className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none bg-dark-950/50 border border-dark-800/60 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-dark-400">Description courte</label>
                <input
                  type="text"
                  value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Pour les établissements en croissance"
                  className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none bg-dark-950/50 border border-dark-800/60 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-dark-400">Prix (FCFA)</label>
                  <input
                    type="number" min="0" step="1" required
                    value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none bg-dark-950/50 border border-dark-800/60 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-dark-400">Période affichée</label>
                  <input
                    type="text"
                    value={form.period_label} onChange={(e) => setForm((f) => ({ ...f, period_label: e.target.value }))}
                    placeholder="mois"
                    className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none bg-dark-950/50 border border-dark-800/60 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition"
                  />
                </div>
              </div>

              <div className="rounded-lg p-3 space-y-3" style={{ background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox" checked={form.hasDiscount}
                    onChange={(e) => setForm((f) => ({ ...f, hasDiscount: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm font-semibold flex items-center gap-1.5" style={{ color: '#f59e0b' }}>
                    <Tag className="w-3.5 h-3.5" />
                    Activer une promotion / remise
                  </span>
                </label>
                {form.hasDiscount && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-dark-400">Prix barré (FCFA)</label>
                      <input
                        type="number" min="0" step="1"
                        value={form.original_price} onChange={(e) => setForm((f) => ({ ...f, original_price: e.target.value }))}
                        placeholder="5000"
                        className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none bg-dark-950/50 border border-dark-800/60 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-dark-400">Fin de la promo (optionnel)</label>
                      <input
                        type="datetime-local"
                        value={form.discount_ends_at} onChange={(e) => setForm((f) => ({ ...f, discount_ends_at: e.target.value }))}
                        className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none bg-dark-950/50 border border-dark-800/60 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-lg p-3 space-y-3" style={{ background: 'rgba(99, 102, 241, 0.06)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox" checked={form.hasYearlyOffer}
                    onChange={(e) => setForm((f) => ({ ...f, hasYearlyOffer: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm font-semibold flex items-center gap-1.5" style={{ color: '#818cf8' }}>
                    <Percent className="w-3.5 h-3.5" />
                    Proposer un engagement annuel
                  </span>
                </label>
                {form.hasYearlyOffer && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-dark-400">Prix annuel (FCFA)</label>
                      <input
                        type="number" min="0" step="1"
                        value={form.yearly_price} onChange={(e) => setForm((f) => ({ ...f, yearly_price: e.target.value }))}
                        placeholder="50000"
                        className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none bg-dark-950/50 border border-dark-800/60 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-dark-400">Réduction affichée (%)</label>
                      <input
                        type="number" min="0" max="100" step="1"
                        value={form.yearly_discount_percent} onChange={(e) => setForm((f) => ({ ...f, yearly_discount_percent: e.target.value }))}
                        placeholder="20"
                        className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none bg-dark-950/50 border border-dark-800/60 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-dark-400">Jours d'essai gratuit</label>
                  <input
                    type="number" min="0" step="1"
                    value={form.trial_days} onChange={(e) => setForm((f) => ({ ...f, trial_days: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none bg-dark-950/50 border border-dark-800/60 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-dark-400">Badge (optionnel)</label>
                  <input
                    type="text"
                    value={form.badge_label} onChange={(e) => setForm((f) => ({ ...f, badge_label: e.target.value }))}
                    placeholder="Recommandé"
                    className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none bg-dark-950/50 border border-dark-800/60 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-dark-400">Texte du bouton</label>
                <input
                  type="text"
                  value={form.cta_label} onChange={(e) => setForm((f) => ({ ...f, cta_label: e.target.value }))}
                  placeholder="Choisir Premium"
                  className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none bg-dark-950/50 border border-dark-800/60 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition"
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_free} onChange={(e) => setForm((f) => ({ ...f, is_free: e.target.checked }))} className="rounded" />
                  <span className="text-sm text-white">Plan gratuit</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))} className="rounded" />
                  <span className="text-sm text-white">Mis en avant</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} className="rounded" />
                  <span className="text-sm text-white">Visible sur la landing</span>
                </label>
              </div>

              <div>
                <label className="text-xs font-semibold text-dark-400 flex items-center gap-1.5 mb-1">
                  <Lock className="w-3 h-3" />
                  Accès aux fonctionnalités (contrôle réel de l'API)
                </label>
                <p className="text-xs mb-2" style={{ color: '#64748b' }}>
                  Décochez pour bloquer réellement l'accès de ce plan aux endpoints correspondants. Une fonctionnalité non listée ici reste accessible par défaut.
                </p>
                <div className="space-y-1.5 max-h-56 overflow-y-auto rounded-lg p-2" style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
                  {featureRegistry.length === 0 ? (
                    <p className="text-xs text-center py-3" style={{ color: '#64748b' }}>Registre de fonctionnalités indisponible.</p>
                  ) : (
                    featureRegistry.map((entry) => {
                      const included = !form.excludedFeatureKeys.has(entry.key)
                      return (
                        <label key={entry.key} className="flex items-start gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-white/5 transition">
                          <input
                            type="checkbox" checked={included}
                            onChange={() => toggleRegistryFeature(entry.key)}
                            className="mt-0.5 rounded"
                          />
                          <div className="min-w-0">
                            <p className="text-sm" style={{ color: included ? '#e2e8f0' : '#64748b' }}>{entry.label}</p>
                            <p className="text-xs" style={{ color: '#64748b' }}>{entry.description}</p>
                          </div>
                        </label>
                      )
                    })
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-dark-400">Autres fonctionnalités affichées (décoratives)</label>
                  <button type="button" onClick={addFreeFeature} className="text-xs flex items-center gap-1 text-primary-400 hover:text-primary-300 transition">
                    <Plus className="w-3 h-3" /> Ajouter
                  </button>
                </div>
                <p className="text-xs mb-2" style={{ color: '#64748b' }}>
                  Texte libre visible sur le comparatif public, sans contrôle d'accès associé (ex: "Support prioritaire 24/7").
                </p>
                <div className="space-y-2">
                  {form.freeFeatures.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <GripVertical className="w-3.5 h-3.5 shrink-0" style={{ color: '#475569' }} />
                      <button
                        type="button"
                        onClick={() => updateFreeFeature(i, { included: !feat.included })}
                        className="p-1.5 rounded shrink-0 transition"
                        style={{ background: feat.included ? 'rgba(34, 197, 94, 0.15)' : 'rgba(100, 116, 139, 0.15)' }}
                        title={feat.included ? 'Incluse' : 'Non incluse'}
                      >
                        <Check className="w-3.5 h-3.5" style={{ color: feat.included ? '#22c55e' : '#64748b' }} />
                      </button>
                      <input
                        type="text"
                        value={feat.label ?? ''}
                        onChange={(e) => updateFreeFeature(i, { label: e.target.value })}
                        placeholder="Support prioritaire 24/7"
                        className="flex-1 rounded-lg px-3 py-1.5 text-white text-sm outline-none bg-dark-950/50 border border-dark-800/60 focus:border-primary-500 transition"
                      />
                      <button type="button" onClick={() => removeFreeFeature(i)} className="p-1.5 rounded shrink-0 transition hover:bg-red-500/10">
                        <X className="w-3.5 h-3.5" style={{ color: '#f87171' }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-dark-800/60">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-5 py-2 rounded-lg text-sm font-medium transition border border-dark-800/60 text-dark-400 hover:text-white hover:bg-white/5">
                  Annuler
                </button>
                <button type="submit" disabled={isSaving} className="px-5 py-2 rounded-lg text-white text-sm font-semibold transition bg-primary-500 hover:brightness-110 active:scale-95 flex items-center gap-1.5 disabled:opacity-50">
                  {editingId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {editingId ? 'Enregistrer' : 'Créer le plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
