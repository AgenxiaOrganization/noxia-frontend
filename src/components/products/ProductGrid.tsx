'use client'

import { Edit, Trash2 } from 'lucide-react'
import type { ProductCardData } from './types'

interface ProductGridProps<T extends ProductCardData> {
  products: T[]
  onEdit: (product: T) => void
  onDelete: (id: number) => void
  canEdit?: boolean
  canDelete?: boolean
  /** Rendu additionnel dans l'entête de la carte (ex: badge entreprise côté super-admin). */
  renderExtra?: (product: T) => React.ReactNode
}

/**
 * Grille de cartes produit, partagée entre l'espace gérant ((dashboard)) et
 * l'espace super-admin — seule la source des données et la scope (une
 * entreprise vs. l'entreprise choisie) diffèrent entre les deux.
 */
export default function ProductGrid<T extends ProductCardData>({
  products,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
  renderExtra,
}: ProductGridProps<T>) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {products.map((product) => {
        const isServiceUnit = product.unit === 'service' || product.category?.toLowerCase().includes('service')
        const isInfinite = product.stock < 0 || isServiceUnit
        const isLowStock = !isInfinite && product.stock >= 0 && product.stock <= (product.minStock ?? 10)
        const isOutOfStock = !isInfinite && product.stock === 0

        return (
          <div
            key={product.id}
            className="rounded-xl p-4 border transition-all hover:border-primary-500"
            style={{
              background: '#1e293b',
              borderColor: isOutOfStock ? '#ef4444' : isLowStock ? '#f59e0b' : '#334155',
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start gap-2.5 min-w-0">
                {product.photo ? (
                  <img
                    src={product.photo}
                    alt={product.name}
                    className="w-11 h-11 rounded-lg object-cover shrink-0 border"
                    style={{ borderColor: '#334155' }}
                  />
                ) : (
                  <div
                    className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold uppercase"
                    style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8' }}
                  >
                    {product.name.slice(0, 2)}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-medium text-sm text-white truncate max-w-[150px]">{product.name}</h3>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>
                    {product.category} • {product.subCategory === 'casier' ? 'Par casier' : "À l'unité"}
                  </p>
                  {renderExtra?.(product)}
                </div>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isOutOfStock ? 'bg-red-500/20 text-red-400' :
                  isLowStock ? 'bg-orange-500/20 text-orange-400' :
                  isInfinite ? 'bg-indigo-500/20 text-indigo-300' :
                  'bg-green-500/20 text-green-400'
                }`}
              >
                {isOutOfStock ? 'Rupture' : isLowStock ? 'Stock faible' : isInfinite ? 'Illimité' : 'OK'}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm mb-2">
              <div>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Prix unitaire</p>
                <p className="font-semibold text-white">{product.pricePerUnit.toLocaleString()} F</p>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: '#94a3b8' }}>Stock</p>
                <p className={`font-semibold ${isLowStock && !isInfinite ? 'text-orange-400' : 'text-white'}`}>
                  {isInfinite ? 'Illimité' : `${product.stock} ${product.unit}s`}
                </p>
              </div>
            </div>

            {!isInfinite && (
              <p className="text-xs" style={{ color: '#64748b' }}>
                Seuil d'alerte: {product.minStock} {product.unit}s
              </p>
            )}

            {product.characteristics && Object.keys(product.characteristics).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t" style={{ borderColor: '#334155' }}>
                {Object.entries(product.characteristics).map(([key, value]) => (
                  <span
                    key={key}
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#94a3b8' }}
                  >
                    {key}: {value}
                  </span>
                ))}
              </div>
            )}

            {(canEdit || canDelete) && (
              <div className="flex gap-2 mt-3 pt-3 border-t" style={{ borderColor: '#334155' }}>
                {canEdit && (
                  <button
                    onClick={() => onEdit(product)}
                    className="flex-1 py-1.5 rounded text-xs font-medium transition flex items-center justify-center gap-1"
                    style={{ background: 'rgba(51, 65, 85, 0.5)', color: '#94a3b8' }}
                  >
                    <Edit className="w-3 h-3" />
                    Modifier
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => onDelete(product.id)}
                    className="flex-1 py-1.5 rounded text-xs font-medium transition flex items-center justify-center gap-1"
                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}
                  >
                    <Trash2 className="w-3 h-3" />
                    Supprimer
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
