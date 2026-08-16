'use client'

import { useState } from 'react'
import { X, PlusCircle } from 'lucide-react'
import type { Supplier } from '@/lib/api/inventory'
import type { SupplierProductRef } from './types'

export interface ContactLine {
  name: string
  quantity: string | number
}

interface SupplierContactModalProps {
  supplier: Supplier
  method: 'email' | 'whatsapp'
  companyName: string
  products: SupplierProductRef[]
  isSaving: boolean
  /** Envoi email (n8n côté backend) — reçoit le message final et la liste produits. */
  onSendEmail: (payload: { message: string; products: ContactLine[] }) => void
  /**
   * Commande WhatsApp — reçoit le payload de commande à enregistrer, plus
   * l'URL wa.me déjà construite à ouvrir (le composant ne connaît pas la
   * politique d'ouverture de fenêtre du contexte appelant).
   */
  onSendWhatsapp: (payload: { orderPayload: Record<string, unknown>; waUrl: string }) => void
  onClose: () => void
}

/** Modal de commande fournisseur par email ou WhatsApp, partagée entre l'espace gérant et super-admin. */
export default function SupplierContactModal({
  supplier, method, companyName, products, isSaving, onSendEmail, onSendWhatsapp, onClose,
}: SupplierContactModalProps) {
  const supplierProducts = products.filter(p => p.supplier === supplier.id)
  const criticalProducts = products.filter(
    p => p.supplier === supplier.id && p.stock_item && parseFloat(String(p.stock_item.quantity_on_hand)) <= parseFloat(String(p.stock_item.alert_threshold)),
  )
  const initialLines: ContactLine[] = criticalProducts.length > 0
    ? criticalProducts.map(p => ({ name: p.name, quantity: 12 }))
    : [{ name: '', quantity: '' }]

  const [lines, setLines] = useState<ContactLine[]>(initialLines)
  const [message, setMessage] = useState(
    `Bonjour ${supplier.name},\n\nNous souhaitons passer commande pour les produits ci-dessous.\nMerci de nous confirmer la disponibilité et le délai de livraison.\n\nCordialement,\n${companyName}.`,
  )

  const addLine = () => setLines([...lines, { name: '', quantity: '' }])
  const removeLine = (index: number) => {
    const next = [...lines]
    next.splice(index, 1)
    setLines(next.length > 0 ? next : [{ name: '', quantity: '' }])
  }
  const updateLine = (index: number, field: 'name' | 'quantity', value: string) => {
    const next = [...lines]
    next[index] = { ...next[index], [field]: value }
    setLines(next)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validLines = lines.filter(l => l.name.trim() !== '')
    if (validLines.length === 0) return

    if (method === 'email') {
      onSendEmail({ message, products: validLines })
      return
    }

    let totalAmount = 0
    for (const line of validLines) {
      const prod = products.find(p => p.name === line.name)
      if (prod && prod.price !== undefined) {
        const qty = parseFloat(String(line.quantity)) || 0
        totalAmount += parseFloat(String(prod.price)) * qty
      }
    }

    const cleanPhone = (supplier.phone || '').replace(/[^0-9]/g, '')
    const prodListStr = validLines.map(l => `- ${l.name} (x${l.quantity})`).join('\n')
    const fullMessage = `${message}\n\nProduits commandés :\n${prodListStr}`
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(fullMessage)}`

    onSendWhatsapp({
      orderPayload: {
        supplier: supplier.id,
        status: 'pending',
        products_list: validLines,
        message,
        total_amount: totalAmount,
      },
      waUrl,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: '#1e293b', border: '1px solid #334155' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-lg font-semibold text-white">{method === 'email' ? 'Commander par E-mail' : 'Commander par WhatsApp'}</h2>
            <p className="text-xs text-indigo-400">{method === 'email' ? supplier.email : supplier.phone}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-300">Produits à commander</label>
              <button type="button" onClick={addLine} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition">
                <PlusCircle className="w-3.5 h-3.5" />
                Ajouter une ligne
              </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {lines.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <select
                    value={item.name}
                    onChange={(e) => updateLine(idx, 'name', e.target.value)}
                    className="flex-1 rounded-lg px-3 py-2 text-white text-xs outline-none bg-slate-900 border border-slate-700 focus:border-indigo-500"
                    required
                  >
                    <option value="">-- Choisir un produit --</option>
                    {supplierProducts.length > 0 && (
                      <optgroup label="Produits associés">
                        {supplierProducts.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                      </optgroup>
                    )}
                    <optgroup label="Autres produits du catalogue">
                      {products.filter(p => p.supplier !== supplier.id).map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </optgroup>
                  </select>

                  <input
                    type="text"
                    value={item.quantity}
                    onChange={(e) => updateLine(idx, 'quantity', e.target.value)}
                    className="w-20 rounded-lg px-3 py-2 text-white text-xs outline-none bg-slate-900 border border-slate-700 focus:border-indigo-500 text-center"
                    placeholder="Qté"
                    required
                  />

                  <button type="button" onClick={() => removeLine(idx)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition" disabled={lines.length <= 1 && item.name === ''}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Message personnalisé</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition h-28 resize-none bg-slate-900 border border-slate-700 focus:border-indigo-500"
              required
            />
          </div>

          <div className="flex gap-3 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium transition bg-transparent border border-slate-700 text-slate-400 hover:text-white" disabled={isSaving}>
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition flex items-center justify-center gap-2"
              style={{
                background: method === 'email' ? '#22c55e' : '#25D366',
                boxShadow: method === 'email' ? '0 10px 25px -5px rgba(34, 197, 94, 0.3)' : '0 10px 25px -5px rgba(37, 211, 102, 0.3)',
              }}
              disabled={isSaving}
            >
              {isSaving ? 'Envoi...' : method === 'email' ? 'Envoyer la commande' : 'Envoyer par WhatsApp'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
