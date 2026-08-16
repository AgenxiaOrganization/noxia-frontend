'use client'

import { useState } from 'react'
import { Truck, Edit, Trash2, Send, Phone, Mail, MapPin, AlertTriangle } from 'lucide-react'
import type { Supplier } from '@/lib/api/inventory'
import type { SupplierProductRef } from './types'

interface SupplierGridProps {
  suppliers: Supplier[]
  products: SupplierProductRef[]
  onEdit: (supplier: Supplier) => void
  onDelete: (id: number) => void
  onContact: (supplier: Supplier, method: 'email' | 'whatsapp') => void
}

/** Grille de cartes fournisseur, partagée entre l'espace gérant et super-admin. */
export default function SupplierGrid({ suppliers, products, onEdit, onDelete, onContact }: SupplierGridProps) {
  const [activeContactMenu, setActiveContactMenu] = useState<number | null>(null)

  const getSupplierProducts = (supplierId: number) => products.filter(p => p.supplier === supplierId)
  const getSupplierAlerts = (supplierId: number) =>
    products
      .filter(p => p.supplier === supplierId && p.stock_item && parseFloat(String(p.stock_item.quantity_on_hand)) <= parseFloat(String(p.stock_item.alert_threshold)))
      .map(p => p.name)

  if (suppliers.length === 0) {
    return <div className="text-center py-10 text-slate-400">Aucun distributeur trouvé.</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {suppliers.map((supplier) => {
        const supplierProducts = getSupplierProducts(supplier.id)
        const alerts = getSupplierAlerts(supplier.id)
        const categories = Array.from(new Set(supplierProducts.map(p => p.category_name).filter(Boolean)))

        return (
          <div
            key={supplier.id}
            className="rounded-xl border p-4 transition-all hover:border-primary-500 flex flex-col justify-between"
            style={{ background: '#1e293b', borderColor: alerts.length > 0 ? '#ef4444' : '#334155' }}
          >
            <div>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
                    <Truck className="w-5 h-5" style={{ color: '#818cf8' }} />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{supplier.name}</h3>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>
                      {categories.length > 0 ? categories.join(', ') : 'Général'}
                    </p>
                  </div>
                </div>
                {alerts.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1 bg-red-500/20 text-red-400">
                    <AlertTriangle className="w-3 h-3" />
                    {alerts.length}
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-sm mt-3">
                {supplier.phone && (
                  <p className="flex items-center gap-2" style={{ color: '#94a3b8' }}>
                    <Phone className="w-3 h-3 text-slate-400" />
                    {supplier.phone}
                  </p>
                )}
                {supplier.email && (
                  <p className="flex items-center gap-2" style={{ color: '#94a3b8' }}>
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span className="truncate">{supplier.email}</span>
                  </p>
                )}
                {supplier.address && (
                  <p className="flex items-center gap-2 text-xs" style={{ color: '#94a3b8' }}>
                    <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{supplier.address}</span>
                  </p>
                )}
              </div>

              {supplierProducts.length > 0 && (
                <div className="mt-3 pt-3 border-t" style={{ borderColor: '#334155' }}>
                  <p className="text-xs mb-1" style={{ color: '#94a3b8' }}>Produits fournis</p>
                  <div className="flex flex-wrap gap-1">
                    {supplierProducts.map((product) => (
                      <span key={product.id} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(51, 65, 85, 0.5)', color: '#94a3b8' }}>
                        {product.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {alerts.length > 0 && (
                <div className="mt-3 p-2 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <p className="text-xs" style={{ color: '#fca5a5' }}>⚠️ Stock critique : {alerts.join(', ')}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4 pt-3 border-t relative" style={{ borderColor: '#334155' }}>
              <div className="flex-1 relative">
                <button
                  onClick={() => setActiveContactMenu(activeContactMenu === supplier.id ? null : supplier.id)}
                  className="w-full py-1.5 rounded text-xs font-medium transition flex items-center justify-center gap-1"
                  style={{
                    background: alerts.length > 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(51, 65, 85, 0.3)',
                    color: alerts.length > 0 ? '#22c55e' : '#94a3b8',
                  }}
                >
                  <Send className="w-3 h-3" />
                  {alerts.length > 0 ? 'Alerte WhatsApp' : 'Contacter'}
                </button>

                {activeContactMenu === supplier.id && (
                  <div className="absolute bottom-full left-0 mb-1 w-48 rounded-lg shadow-xl border p-1 z-10" style={{ background: '#1e293b', borderColor: '#334155' }}>
                    <button
                      onClick={() => { setActiveContactMenu(null); onContact(supplier, 'email') }}
                      className="w-full text-left px-3 py-1.5 text-xs text-white rounded hover:bg-slate-700 transition"
                    >
                      Par E-mail
                    </button>
                    <button
                      onClick={() => { setActiveContactMenu(null); onContact(supplier, 'whatsapp') }}
                      className="w-full text-left px-3 py-1.5 text-xs text-white rounded hover:bg-slate-700 transition"
                    >
                      Par WhatsApp
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => onEdit(supplier)}
                className="py-1.5 px-3 rounded text-xs font-medium transition flex items-center justify-center gap-1"
                style={{ background: 'rgba(51, 65, 85, 0.3)', color: '#94a3b8' }}
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(supplier.id)}
                className="py-1.5 px-3 rounded text-xs font-medium transition flex items-center justify-center gap-1"
                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
