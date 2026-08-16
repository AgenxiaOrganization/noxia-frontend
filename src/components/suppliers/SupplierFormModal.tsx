'use client'

import { useState } from 'react'
import { X, Check } from 'lucide-react'
import type { Supplier } from '@/lib/api/inventory'
import type { SupplierProductRef } from './types'

export interface SupplierFormPayload {
  name: string
  phone: string
  email: string
  address: string
  product_ids: number[]
}

interface SupplierFormModalProps {
  supplier: Supplier | null
  products: SupplierProductRef[]
  isSaving: boolean
  onSubmit: (payload: SupplierFormPayload) => void
  onClose: () => void
}

function initialFormState(supplier: Supplier | null, products: SupplierProductRef[]): SupplierFormPayload {
  if (supplier) {
    const associatedProductIds = products.filter(p => p.supplier === supplier.id).map(p => p.id)
    return {
      name: supplier.name,
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      product_ids: associatedProductIds,
    }
  }
  return { name: '', phone: '', email: '', address: '', product_ids: [] }
}

/** Formulaire d'ajout/édition fournisseur, partagé entre l'espace gérant et super-admin. */
export default function SupplierFormModal({ supplier, products, isSaving, onSubmit, onClose }: SupplierFormModalProps) {
  const [formData, setFormData] = useState<SupplierFormPayload>(() => initialFormState(supplier, products))

  const productsByCategory = products.reduce((acc: Record<string, SupplierProductRef[]>, product) => {
    const categoryName = product.category_name || 'Autre'
    if (!acc[categoryName]) acc[categoryName] = []
    acc[categoryName].push(product)
    return acc
  }, {})

  const toggleProduct = (productId: number) => {
    setFormData(prev => ({
      ...prev,
      product_ids: prev.product_ids.includes(productId)
        ? prev.product_ids.filter(id => id !== productId)
        : [...prev.product_ids, productId],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: '#1e293b', border: '1px solid #334155' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">{supplier ? 'Modifier le distributeur' : 'Ajouter un distributeur'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Nom du distributeur *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition bg-slate-900 border border-slate-700 focus:border-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Téléphone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition bg-slate-900 border border-slate-700 focus:border-indigo-500"
                placeholder="+241 ..."
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition bg-slate-900 border border-slate-700 focus:border-indigo-500"
                placeholder="contact@distributeur.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Adresse / Détails</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition h-16 resize-none bg-slate-900 border border-slate-700 focus:border-indigo-500"
              placeholder="Libreville, Gabon..."
            />
          </div>

          <div>
            <label className="block text-xs mb-1.5" style={{ color: '#94a3b8' }}>Produits fournis (cocher pour associer)</label>
            <div className="w-full rounded-lg border border-slate-700 p-3 max-h-48 overflow-y-auto space-y-3 bg-slate-900">
              {Object.keys(productsByCategory).length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-2">Aucun produit dans le catalogue.</p>
              ) : (
                Object.keys(productsByCategory).map((catName) => (
                  <div key={catName} className="space-y-1.5">
                    <h4 className="text-xs font-semibold text-indigo-400 border-b border-slate-800 pb-0.5">{catName}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {productsByCategory[catName].map((product) => {
                        const isChecked = formData.product_ids.includes(product.id)
                        return (
                          <label
                            key={product.id}
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border cursor-pointer select-none transition text-xs ${
                              isChecked ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-200' : 'bg-slate-800/30 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <input type="checkbox" checked={isChecked} onChange={() => toggleProduct(product.id)} className="hidden" />
                            <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${isChecked ? 'bg-indigo-600 border-indigo-500' : 'border-slate-600'}`}>
                              {isChecked && <Check className="w-2.5 h-2.5 text-white" />}
                            </div>
                            <span className="truncate">{product.name}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium transition bg-transparent border border-slate-700 text-slate-400 hover:text-white" disabled={isSaving}>
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition flex items-center justify-center gap-2"
              style={{ background: '#4f46e5', boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)' }}
              disabled={isSaving}
            >
              {isSaving ? 'Enregistrement...' : supplier ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
