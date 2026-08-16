'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import type { SupplierOrder } from '@/lib/api/inventory'

interface SupplierOrdersTableProps {
  orders: SupplierOrder[]
  onUpdateStatus: (orderId: number, status: 'pending' | 'shipped' | 'delivered') => void
  onDelete: (orderId: number) => void
  onBulkDelete: (ids: number[]) => void
}

/** Table des commandes fournisseurs récentes, partagée entre l'espace gérant et super-admin. */
export default function SupplierOrdersTable({ orders, onUpdateStatus, onDelete, onBulkDelete }: SupplierOrdersTableProps) {
  const [activeStatusMenu, setActiveStatusMenu] = useState<number | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  const selectAll = () => {
    setSelectedIds(selectedIds.length === orders.length ? [] : orders.map(o => o.id))
  }

  return (
    <div className="rounded-xl border p-4" style={{ background: '#1e293b', borderColor: '#334155' }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-white">Commandes récentes</h3>
        {selectedIds.length > 0 && (
          <button
            onClick={() => { onBulkDelete(selectedIds); setSelectedIds([]) }}
            className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 text-xs font-semibold rounded-lg flex items-center gap-1 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Supprimer la sélection ({selectedIds.length})
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        {orders.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-sm">Aucune commande enregistrée.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: '#334155' }}>
                <th className="px-3 py-2 text-left w-10">
                  <input
                    type="checkbox"
                    checked={orders.length > 0 && selectedIds.length === orders.length}
                    onChange={selectAll}
                    className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Date & Heure</th>
                <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Fournisseur</th>
                <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Canal</th>
                <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Produits</th>
                <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Total</th>
                <th className="px-3 py-2 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Statut</th>
                <th className="px-3 py-2 text-right text-xs w-20" style={{ color: '#94a3b8' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const orderDate = order.created_at
                  ? new Date(order.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : 'ND'

                let parsedList: any[] = []
                if (Array.isArray(order.products_list)) {
                  parsedList = order.products_list
                } else if (typeof order.products_list === 'string') {
                  try {
                    const jsonP = JSON.parse(order.products_list)
                    if (Array.isArray(jsonP)) parsedList = jsonP
                    else if (jsonP && typeof jsonP === 'object') parsedList = [jsonP]
                    else parsedList = [{ name: order.products_list }]
                  } catch {
                    parsedList = [{ name: order.products_list }]
                  }
                } else if (order.products_list && typeof order.products_list === 'object') {
                  parsedList = [order.products_list]
                }

                const productsSummary = parsedList.length > 0
                  ? parsedList.map(p => {
                      if (typeof p === 'object' && p !== null) {
                        const name = p.name || 'Produit'
                        const qty = p.quantity !== undefined && p.quantity !== null && p.quantity !== '' ? ` x${p.quantity}` : ''
                        return `${name}${qty}`
                      }
                      return String(p)
                    }).filter(Boolean).join(', ')
                  : 'Aucun produit'

                const sourceKey = (order.source || '').toLowerCase()
                const sourceBadge = sourceKey.includes('telegram') ? { label: 'Telegram', icon: '✈️', style: 'bg-sky-500/20 text-sky-300 border-sky-500/30' }
                  : sourceKey.includes('whatsapp') ? { label: 'WhatsApp', icon: '💬', style: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' }
                  : sourceKey.includes('bot') ? { label: 'Assistant Web', icon: '🤖', style: 'bg-purple-500/20 text-purple-300 border-purple-500/30' }
                  : { label: 'App Web', icon: '🖥️', style: 'bg-slate-700/50 text-slate-300 border-slate-600' }

                const totalValue = typeof order.total_amount === 'string' ? parseFloat(order.total_amount) : order.total_amount

                return (
                  <tr key={order.id} className="border-b" style={{ borderColor: '#334155' }}>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(order.id)}
                        onChange={() => toggleSelect(order.id)}
                        className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-2" style={{ color: '#94a3b8' }}>{orderDate}</td>
                    <td className="px-3 py-2 text-white font-medium">{order.supplier_name}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium border ${sourceBadge.style}`}>
                        <span>{sourceBadge.icon}</span>
                        <span>{sourceBadge.label}</span>
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-300 max-w-xs truncate" title={productsSummary}>{productsSummary}</td>
                    <td className="px-3 py-2 font-semibold" style={{ color: '#22c55e' }}>{totalValue.toLocaleString('fr-FR')} F</td>
                    <td className="px-3 py-2 relative">
                      <button
                        onClick={() => setActiveStatusMenu(activeStatusMenu === order.id ? null : order.id)}
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold transition cursor-pointer select-none border flex items-center gap-1.5 ${
                          order.status === 'pending' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                          : order.status === 'shipped' ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 hover:bg-sky-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'pending' ? 'bg-amber-400' : order.status === 'shipped' ? 'bg-sky-400' : 'bg-emerald-400'}`} />
                        {order.status === 'pending' ? 'En attente' : order.status === 'shipped' ? 'Expédiée' : 'Livrée'}
                      </button>

                      {activeStatusMenu === order.id && (
                        <div className="absolute right-0 top-full mt-1 w-36 rounded-xl shadow-2xl border p-1.5 z-50" style={{ background: '#0f172a', borderColor: '#334155' }}>
                          {(['pending', 'shipped', 'delivered'] as const).map((status) => (
                            <button
                              key={status}
                              onClick={() => { setActiveStatusMenu(null); onUpdateStatus(order.id, status) }}
                              className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition font-medium flex items-center gap-2 ${
                                order.status === status
                                  ? status === 'pending' ? 'bg-amber-500/20 text-amber-300' : status === 'shipped' ? 'bg-sky-500/20 text-sky-300' : 'bg-emerald-500/20 text-emerald-300'
                                  : 'text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full ${status === 'pending' ? 'bg-amber-400' : status === 'shipped' ? 'bg-sky-400' : 'bg-emerald-400'}`} />
                              {status === 'pending' ? 'En attente' : status === 'shipped' ? 'Expédiée' : 'Livrée'}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button onClick={() => onDelete(order.id)} className="p-1 text-red-400 hover:bg-red-500/10 rounded-lg transition" title="Supprimer la commande">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
