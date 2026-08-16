'use client'

import { Package, Plus, Minus, TrendingUp, TrendingDown } from 'lucide-react'

export interface StockRow {
  id: number
  name: string
  category: string
  subCategory: string
  stock: number
  minStock: number
  maxStock: number
  unit: string
  cost: number
  supplier: string | null
  unitsPerPackage: number
  stockItemId?: number | null
}

export interface StockMovementRow {
  id: number
  product: string
  type: 'entree' | 'sortie'
  qty: number
  date: string
  user: string
}

interface StockTableProps {
  products: StockRow[]
  movements?: StockMovementRow[]
  onAdjust?: (product: StockRow, type: 'add' | 'remove') => void
}

/**
 * Table de stock + historique des mouvements, partagée entre l'espace
 * gérant et l'espace super-admin. `onAdjust` est optionnel : si absent, les
 * boutons +/- ne s'affichent pas (lecture seule).
 */
export default function StockTable({ products, movements = [], onAdjust }: StockTableProps) {
  return (
    <>
      <div className="rounded-xl border overflow-hidden" style={{ background: '#1e293b', borderColor: '#334155' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: '#334155' }}>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Produit</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Stock</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Seuil</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Valeur</th>
                {onAdjust && <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const isServiceUnit = product.unit === 'service' || product.category?.toLowerCase().includes('service')
                const isInfinite = product.stock < 0 || isServiceUnit
                const isLow = !isInfinite && product.stock >= 0 && product.stock <= product.minStock
                const isOut = !isInfinite && product.stock === 0
                const progress = product.maxStock > 0 ? (product.stock / product.maxStock) * 100 : 0

                return (
                  <tr key={product.id} className="border-b" style={{ borderColor: '#334155' }}>
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-medium text-white">{product.name}</span>
                        {product.supplier && (
                          <p className="text-xs" style={{ color: '#64748b' }}>{product.supplier}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8' }}>
                        {product.subCategory === 'casier' ? 'Casier' : 'Unité'}
                      </span>
                      {product.subCategory === 'casier' && (
                        <p className="text-xs" style={{ color: '#64748b' }}>
                          {product.unitsPerPackage} unités/casier
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {!isInfinite ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${isOut ? 'text-red-400' : isLow ? 'text-orange-400' : 'text-white'}`}>
                              {product.stock}
                            </span>
                            <span className="text-xs" style={{ color: '#64748b' }}>{product.unit}s</span>
                            {isOut && <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">RUPTURE</span>}
                            {isLow && !isOut && <span className="text-xs px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400">ALERTE</span>}
                          </div>
                          {product.maxStock > 0 && (
                            <div className="w-full h-1.5 rounded-full" style={{ background: '#334155' }}>
                              <div
                                className="h-1.5 rounded-full transition-all"
                                style={{
                                  width: `${Math.min(100, progress)}%`,
                                  background: isOut ? '#ef4444' : isLow ? '#f59e0b' : '#22c55e',
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: '#64748b' }}>Illimité</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#94a3b8' }}>
                      {product.minStock > 0 ? product.minStock : '-'}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#94a3b8' }}>
                      {product.stock >= 0 ? `${(product.stock * product.cost).toLocaleString()} F` : '-'}
                    </td>
                    {onAdjust && (
                      <td className="px-4 py-3">
                        {!isInfinite && product.stockItemId ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => onAdjust(product, 'add')}
                              className="p-1.5 rounded transition hover:bg-green-500/20"
                              style={{ color: '#22c55e' }}
                              title="Ajouter du stock"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onAdjust(product, 'remove')}
                              className="p-1.5 rounded transition hover:bg-red-500/20"
                              style={{ color: '#ef4444' }}
                              title="Retirer du stock"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">-</span>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto mb-2" style={{ color: '#334155' }} />
            <p className="text-sm" style={{ color: '#64748b' }}>Aucun produit trouvé</p>
          </div>
        )}
      </div>

      {movements.length > 0 && (
        <div className="rounded-xl border p-4" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <h3 className="font-semibold text-sm text-white mb-3">Mouvements récents</h3>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {movements.slice(0, 10).map((movement) => (
              <div
                key={movement.id}
                className="flex items-center justify-between p-2 rounded-lg text-sm"
                style={{
                  background: movement.type === 'entree' ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                  border: `1px solid ${movement.type === 'entree' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'}`,
                }}
              >
                <div className="flex items-center gap-3">
                  {movement.type === 'entree' ? (
                    <TrendingUp className="w-4 h-4" style={{ color: '#22c55e' }} />
                  ) : (
                    <TrendingDown className="w-4 h-4" style={{ color: '#ef4444' }} />
                  )}
                  <div>
                    <span className="text-white">{movement.product}</span>
                    <span className="text-xs ml-2" style={{ color: '#64748b' }}>{movement.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-semibold ${movement.type === 'entree' ? 'text-green-400' : 'text-red-400'}`}>
                    {movement.type === 'entree' ? '+' : '-'}{movement.qty}
                  </span>
                  <span className="text-xs" style={{ color: '#64748b' }}>{movement.user}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
