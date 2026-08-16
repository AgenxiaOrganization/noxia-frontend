'use client'

import { useState } from 'react'

export interface StockAdjustmentTarget {
  name: string
  stock: number
  unit?: string
  subCategory: string
  unitsPerPackage: number
  stockItemId?: number | null
  packagings?: { id: number; name: string; units_per_package: number }[]
}

export interface StockAdjustmentPayload {
  stock_item: number
  movement_type: 'entry' | 'exit'
  quantity?: number
  packaging?: number
  packaging_quantity?: number
  reason: string
}

interface StockAdjustmentModalProps {
  product: StockAdjustmentTarget
  type: 'add' | 'remove'
  isSaving: boolean
  onSubmit: (payload: StockAdjustmentPayload) => void
  onClose: () => void
}

/**
 * Modal d'ajustement de stock (+ / -), partagée entre (dashboard)/stock et
 * super-admin/stock. Construit le mouvement de stock (unités ou casiers) et
 * délègue l'envoi au parent via `onSubmit`.
 */
export default function StockAdjustmentModal({ product, type, isSaving, onSubmit, onClose }: StockAdjustmentModalProps) {
  const [adjustmentQty, setAdjustmentQty] = useState(1)
  const [adjustmentTypeQty, setAdjustmentTypeQty] = useState<'unit' | 'package'>('unit')
  const [unitsPerPackageInput, setUnitsPerPackageInput] = useState(product.unitsPerPackage || 12)
  const [adjustmentNote, setAdjustmentNote] = useState(type === 'add' ? 'Approvisionnement' : 'Sortie manuelle')

  const handleSubmit = () => {
    if (!product.stockItemId) return

    let qtyToAdjust = adjustmentQty
    let unitLabel = ''
    let packagingId: number | null = null

    if (product.subCategory === 'casier' && adjustmentTypeQty === 'package') {
      const casierPkg = product.packagings?.find(pkg => pkg.name === 'Casier')
      if (casierPkg) {
        packagingId = casierPkg.id
        qtyToAdjust = adjustmentQty * unitsPerPackageInput
        unitLabel = ` (${adjustmentQty} casier${adjustmentQty > 1 ? 's' : ''} × ${unitsPerPackageInput} unités = ${qtyToAdjust} unités)`
      }
    }

    onSubmit({
      stock_item: product.stockItemId,
      movement_type: type === 'add' ? 'entry' : 'exit',
      quantity: packagingId ? undefined : qtyToAdjust,
      packaging: packagingId ?? undefined,
      packaging_quantity: packagingId ? adjustmentQty : undefined,
      reason: adjustmentNote + unitLabel,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6"
        style={{ background: '#1e293b', border: '1px solid #334155' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-white mb-4">
          {type === 'add' ? 'Ajouter du stock' : 'Retirer du stock'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Produit</label>
            <input
              type="text"
              value={product.name}
              disabled
              className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition opacity-60"
              style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
            />
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Stock actuel</label>
            <p className="text-lg font-bold text-white">
              {product.stock >= 0 ? `${product.stock} ${product.unit}s` : 'Illimité'}
            </p>
            {product.subCategory === 'casier' && product.stock >= 0 && (
              <p className="text-xs" style={{ color: '#64748b' }}>
                Soit {Math.floor(product.stock / product.unitsPerPackage)} casier(s) de {product.unitsPerPackage} unités
              </p>
            )}
          </div>

          {product.subCategory === 'casier' && (
            <div>
              <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Ajuster en</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustmentTypeQty('unit')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${adjustmentTypeQty === 'unit' ? 'border' : 'border-transparent'}`}
                  style={{
                    background: adjustmentTypeQty === 'unit' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(51, 65, 85, 0.3)',
                    borderColor: adjustmentTypeQty === 'unit' ? '#6366f1' : 'transparent',
                    color: adjustmentTypeQty === 'unit' ? '#818cf8' : '#94a3b8',
                  }}
                >
                  Unités
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustmentTypeQty('package')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${adjustmentTypeQty === 'package' ? 'border' : 'border-transparent'}`}
                  style={{
                    background: adjustmentTypeQty === 'package' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(51, 65, 85, 0.3)',
                    borderColor: adjustmentTypeQty === 'package' ? '#6366f1' : 'transparent',
                    color: adjustmentTypeQty === 'package' ? '#818cf8' : '#94a3b8',
                  }}
                >
                  Casiers
                </button>
              </div>
            </div>
          )}

          <div>
            {product.subCategory === 'casier' && adjustmentTypeQty === 'package' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Nbr de casiers</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={adjustmentQty}
                      onChange={(e) => setAdjustmentQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition bg-slate-900 border border-slate-700 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Unités par casier</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={unitsPerPackageInput}
                      onChange={(e) => setUnitsPerPackageInput(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition bg-slate-900 border border-slate-700 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-indigo-500/20 text-center" style={{ background: 'rgba(99, 102, 241, 0.05)' }}>
                  <p className="text-xs text-slate-300">Total à {type === 'add' ? 'ajouter' : 'retirer'} :</p>
                  <p className="text-lg font-bold text-indigo-400 mt-0.5">
                    {adjustmentQty} casier{adjustmentQty > 1 ? 's' : ''} × {unitsPerPackageInput} = {adjustmentQty * unitsPerPackageInput} unités
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Quantité (en unités)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={adjustmentQty}
                  onChange={(e) => setAdjustmentQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                  style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Note</label>
            <input
              type="text"
              value={adjustmentNote}
              onChange={(e) => setAdjustmentNote(e.target.value)}
              placeholder={type === 'add' ? 'Approvisionnement' : 'Sortie manuelle'}
              className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
              style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
            />
          </div>

          <div className="flex gap-3 pt-3 border-t" style={{ borderColor: '#334155' }}>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02] hover:bg-slate-700/50 active:scale-[0.98]"
              style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8' }}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2"
              style={{
                background: type === 'add' ? '#22c55e' : '#ef4444',
                boxShadow: type === 'add' ? '0 10px 25px -5px rgba(34, 197, 94, 0.3)' : '0 10px 25px -5px rgba(239, 68, 68, 0.3)',
              }}
            >
              {isSaving ? (
                <>
                  <img src="/logos/NOXIA_Orbit_Logo.svg" alt="NOXIA" className="w-4 h-4 animate-spin" />
                  Validation...
                </>
              ) : (
                'Valider'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
