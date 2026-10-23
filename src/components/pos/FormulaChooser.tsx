import { Layers, Package, X } from 'lucide-react'
import { Product } from './types'

interface FormulaChooserProps {
  product: Product | null
  onChoose: (formulaId: number | null) => void
  onClose: () => void
}

/** Choix « à l'unité » ou « par formule » quand le produit a des formules actives. */
export default function FormulaChooser({ product, onChoose, onClose }: FormulaChooserProps) {
  if (!product) return null
  const isService = product.unit === 'service' || product.stock === -1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl p-4 glass-card border border-dark-800/60 bg-dark-900" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-white truncate">{product.name}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full text-dark-400 hover:text-white hover:bg-white/5">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          <button
            onClick={() => onChoose(null)}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-dark-800/60 hover:border-primary-500 transition text-left"
          >
            <span className="flex items-center gap-2 text-sm text-white"><Package className="w-4 h-4 text-primary-400" /> À l&apos;unité</span>
            <span className="text-sm font-bold text-accent-500">{product.price.toLocaleString()} F</span>
          </button>
          {(product.formulas || []).map(f => {
            const notEnough = !isService && product.stock >= 0 && product.stock < f.unitsSold
            const saving = f.unitsSold * product.price - f.price
            return (
              <button
                key={f.id}
                onClick={() => onChoose(f.id)}
                disabled={notEnough}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-primary-500/30 bg-primary-500/5 hover:border-primary-500 transition text-left disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-sm text-white font-semibold"><Layers className="w-4 h-4 text-primary-400" /> {f.name}</span>
                  <span className="block text-xs text-dark-400">
                    {f.unitsSold} unités{saving > 0 ? ` • économie ${saving.toLocaleString()} F` : ''}{notEnough ? ' • stock insuffisant' : ''}
                  </span>
                </span>
                <span className="text-sm font-bold text-accent-500 shrink-0">{f.price.toLocaleString()} F</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
