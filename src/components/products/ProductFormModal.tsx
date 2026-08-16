'use client'

import { useEffect, useState } from 'react'
import { ImagePlus, Plus, Search, Sparkles, X } from 'lucide-react'
import type { Supplier } from '@/lib/api/inventory'

export interface ProductFormCategory {
  id: number
  name: string
  type: 'boisson' | 'nourriture' | 'service'
  characteristics?: { id: number; name: string; attributes: Record<string, string> }[]
}

export interface ProductFormValue {
  id: number
  name: string
  category: string
  categoryId?: number
  subCategory: string
  pricePerUnit: number
  cratePrice?: number | string | null
  unitsPerPackage: number
  stock: number
  unit?: string
  supplierId?: number | null
  minStock?: number
  characteristics?: Record<string, string>
  photo?: string | null
}

/** Construit le payload attendu par POST/PUT /catalog/products/, à partir du formulaire. */
export function buildProductApiPayload(formData: FormState, categories: ProductFormCategory[]) {
  const categoryType = categories.find(c => c.id === formData.categoryId)?.type
  const isService = categoryType === 'service' || formData.category?.toLowerCase().includes('service')

  let unitVal: 'unite' | 'bouteille' | 'casier' | 'plat' | 'portion' | 'service' = 'unite'
  if (isService) {
    unitVal = 'service'
  } else if (categoryType === 'nourriture') {
    unitVal = 'plat'
  } else if (formData.unit && ['unite', 'bouteille', 'casier', 'plat', 'portion', 'service'].includes(formData.unit)) {
    unitVal = formData.unit as any
  }

  return {
    name: formData.name,
    category: formData.categoryId,
    price: formData.pricePerUnit?.toString() || '0',
    crate_price: formData.cratePrice !== '' && formData.cratePrice !== null && formData.cratePrice !== undefined ? formData.cratePrice.toString() : null,
    unit: unitVal,
    is_active: true,
    brand: '',
    alcohol_percentage: null,
    volume_cl: null,
    attributes: formData.characteristics,
    initial_stock: isService ? -1 : (formData.subCategory === 'casier' ? formData.stock * formData.unitsPerPackage : formData.stock),
    initial_min_stock: isService ? 0 : formData.minStock,
    units_per_package: formData.subCategory === 'casier' ? formData.unitsPerPackage : 1,
    supplier: formData.supplierId,
  }
}

interface FormState {
  name: string
  category: string
  categoryId: number | undefined
  subCategory: string
  pricePerUnit: number
  cratePrice: string | number
  unitsPerPackage: number
  stock: number
  unit: string
  supplierId: number | null
  minStock: number
  characteristics: Record<string, string>
}

function initialFormState(product: ProductFormValue | null, categories: ProductFormCategory[]): FormState {
  if (product) {
    return {
      name: product.name,
      category: product.category,
      categoryId: product.categoryId,
      subCategory: product.subCategory || 'casier',
      pricePerUnit: product.pricePerUnit,
      cratePrice: product.cratePrice !== null && product.cratePrice !== undefined ? product.cratePrice : '',
      unitsPerPackage: product.unitsPerPackage || 1,
      stock: product.subCategory === 'casier' ? Math.floor(product.stock / (product.unitsPerPackage || 1)) : product.stock,
      unit: product.unit || 'unite',
      supplierId: product.supplierId ?? null,
      minStock: product.minStock || 10,
      characteristics: product.characteristics || {},
    }
  }
  return {
    name: '',
    category: categories.length > 0 ? categories[0].name : 'boisson',
    categoryId: categories.length > 0 ? categories[0].id : undefined,
    subCategory: 'casier',
    pricePerUnit: 0,
    cratePrice: '',
    unitsPerPackage: 1,
    stock: 0,
    unit: 'unité',
    supplierId: null,
    minStock: 10,
    characteristics: {},
  }
}

interface ProductFormModalProps {
  product: ProductFormValue | null
  categories: ProductFormCategory[]
  suppliers: Supplier[]
  isSaving: boolean
  onSubmit: (apiData: ReturnType<typeof buildProductApiPayload>, photoFile: File | null) => void
  onClose: () => void
}

/**
 * Formulaire d'ajout/édition produit, partagé entre (dashboard)/products et
 * super-admin/produits. Gère son propre état de formulaire ; le composant
 * parent ne fournit que les données de référence (catégories, fournisseurs)
 * et reçoit le payload prêt à envoyer via `onSubmit`, ainsi que le fichier
 * photo choisi (facultatif — `null` si non modifié) : l'upload est un appel
 * multipart séparé géré par le parent (voir uploadProductPhoto), le payload
 * JSON principal ne transite jamais le fichier lui-même.
 */
export default function ProductFormModal({ product, categories, suppliers, isSaving, onSubmit, onClose }: ProductFormModalProps) {
  const [formData, setFormData] = useState<FormState>(() => initialFormState(product, categories))
  const [charKey, setCharKey] = useState('')
  const [charValue, setCharValue] = useState('')
  const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState(false)
  const [templateSearchTerm, setTemplateSearchTerm] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  useEffect(() => {
    setFormData(initialFormState(product, categories))
    setCharKey('')
    setCharValue('')
    setIsTemplateDropdownOpen(false)
    setTemplateSearchTerm('')
    setPhotoFile(null)
    setPhotoPreview(product?.photo ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const currentCategory = categories.find(c => Number(c.id) === Number(formData.categoryId))
  const currentCategoryCharacteristics = currentCategory?.characteristics || []
  const categoryType = categories.find(c => c.id === formData.categoryId)?.type
  const isBoisson = categoryType === 'boisson' || formData.category?.toLowerCase().includes('boisson')
  const isService = categoryType === 'service' || formData.category?.toLowerCase().includes('service')

  useEffect(() => {
    if (isBoisson) {
      if (!['casier', 'unite'].includes(formData.subCategory)) {
        setFormData(prev => ({ ...prev, subCategory: 'casier' }))
      }
    } else if (formData.subCategory !== 'unite') {
      setFormData(prev => ({ ...prev, subCategory: 'unite' }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.categoryId, formData.category])

  const addCharacteristic = () => {
    if (charKey.trim() && charValue.trim()) {
      setFormData(prev => ({ ...prev, characteristics: { ...prev.characteristics, [charKey.trim()]: charValue.trim() } }))
      setCharKey('')
      setCharValue('')
    }
  }

  const removeCharacteristic = (key: string) => {
    setFormData(prev => {
      const next = { ...prev.characteristics }
      delete next[key]
      return { ...prev, characteristics: next }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(buildProductApiPayload(formData, categories), photoFile)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: '#1e293b', border: '1px solid #334155' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-white mb-4">
          {product ? 'Modifier le produit' : 'Ajouter un produit'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Nom du produit *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
              style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
              required
            />
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>
              Photo du produit <span className="text-[10px] text-slate-400 font-normal">(Opt.)</span>
            </label>
            <div
              className="flex items-center gap-3 rounded-lg p-3 cursor-pointer transition hover:border-indigo-500"
              style={{ background: 'rgba(51, 65, 85, 0.3)', border: '1px dashed #334155' }}
              onClick={() => document.getElementById('productPhotoInput')?.click()}
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Aperçu" className="w-14 h-14 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                  <ImagePlus className="w-6 h-6" style={{ color: '#818cf8' }} />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm text-white truncate">{photoFile ? photoFile.name : photoPreview ? 'Changer la photo' : 'Ajouter une photo'}</p>
                <p className="text-xs" style={{ color: '#64748b' }}>JPG, PNG ou WEBP (max 5 Mo)</p>
              </div>
              <input
                id="productPhotoInput" type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Catégorie *</label>
            <select
              value={formData.categoryId || ''}
              onChange={(e) => {
                const catId = parseInt(e.target.value)
                const catName = categories.find(c => c.id === catId)?.name || 'boisson'
                setFormData({ ...formData, categoryId: catId, category: catName })
              }}
              className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
              style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
            >
              <option value="" disabled>Sélectionner une catégorie</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Type de vente *</label>
            {isBoisson ? (
              <select
                value={formData.subCategory}
                onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
              >
                <option value="casier">Par Casier</option>
                <option value="unite">À l'Unité</option>
              </select>
            ) : (
              <input
                type="text"
                value="À l'unité"
                disabled
                className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition opacity-60"
                style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
              />
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Prix unitaire (F) *</label>
              <input
                type="number"
                min="0"
                step="50"
                value={formData.pricePerUnit}
                onChange={(e) => setFormData({ ...formData, pricePerUnit: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg px-3 py-2.5 text-white text-sm outline-none transition"
                style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                required
              />
            </div>

            {formData.subCategory === 'casier' && (
              <div>
                <label className="block text-xs mb-1" style={{ color: '#818cf8' }}>
                  Prix du casier (F) <span className="text-[10px] text-slate-400 font-normal">(Opt.)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  placeholder="ex: 4000"
                  value={formData.cratePrice}
                  onChange={(e) => setFormData({ ...formData, cratePrice: e.target.value })}
                  className="w-full rounded-lg px-3 py-2.5 text-white text-sm outline-none transition border border-indigo-500/40 focus:border-indigo-400"
                  style={{ background: 'rgba(99, 102, 241, 0.1)' }}
                />
              </div>
            )}

            {isService ? (
              <div className="col-span-1 sm:col-span-4 p-3 rounded-xl flex items-center gap-2.5" style={{ background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-white">Produit de type Service (Chicha, VIP, Pass...)</p>
                  <p className="text-xs text-slate-300">Le stock est automatiquement géré comme <strong>Illimité</strong>.</p>
                </div>
              </div>
            ) : (
              <>
                {formData.subCategory === 'casier' ? (
                  <>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Nb unités/casier *</label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={formData.unitsPerPackage}
                        onChange={(e) => setFormData({ ...formData, unitsPerPackage: parseInt(e.target.value) || 1 })}
                        className="w-full rounded-lg px-3 py-2.5 text-white text-sm outline-none transition"
                        style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Nombre de casiers</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                        className="w-full rounded-lg px-3 py-2.5 text-white text-sm outline-none transition"
                        style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Quantité en stock</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.stock < 0 ? 0 : formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-lg px-3 py-2.5 text-white text-sm outline-none transition"
                      style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Seuil alerte</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg px-3 py-2.5 text-white text-sm outline-none transition"
                    style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                  />
                </div>
              </>
            )}
          </div>

          {formData.subCategory === 'casier' && (
            <p className="text-xs" style={{ color: '#22c55e' }}>
              Total en stock : {formData.unitsPerPackage * formData.stock} unités
            </p>
          )}

          <div>
            <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Fournisseur</label>
            <select
              value={formData.supplierId || ''}
              onChange={(e) => setFormData({ ...formData, supplierId: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
              style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
            >
              <option value="">Aucun</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Caractéristiques</label>

            {formData.categoryId && currentCategoryCharacteristics.length > 0 && (
              <div className="mb-3 relative">
                <button
                  type="button"
                  onClick={() => { setIsTemplateDropdownOpen(!isTemplateDropdownOpen); setTemplateSearchTerm('') }}
                  className="w-full flex items-center justify-between rounded-lg px-4 py-2.5 text-left text-sm outline-none transition"
                  style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px dashed #6366f1', color: '#818cf8' }}
                >
                  <span>+ Charger depuis un modèle existant...</span>
                  <Search className="w-4 h-4 opacity-60" />
                </button>

                {isTemplateDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-1 rounded-lg border z-50 overflow-hidden shadow-2xl" style={{ background: '#1e293b', borderColor: '#334155' }}>
                    <div className="p-2 border-b" style={{ borderColor: '#334155' }}>
                      <input
                        type="text"
                        placeholder="Rechercher un modèle..."
                        value={templateSearchTerm}
                        onChange={(e) => setTemplateSearchTerm(e.target.value)}
                        className="w-full rounded-md px-3 py-1.5 bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-indigo-500"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto py-1">
                      {currentCategoryCharacteristics
                        .filter((char) => char.name.toLowerCase().includes(templateSearchTerm.toLowerCase()))
                        .map((char) => (
                          <button
                            key={char.id}
                            type="button"
                            onClick={() => {
                              if (char.attributes) {
                                setFormData(prev => ({ ...prev, characteristics: { ...prev.characteristics, ...char.attributes } }))
                              }
                              setIsTemplateDropdownOpen(false)
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-white hover:bg-indigo-600 transition"
                          >
                            {char.name}
                          </button>
                        ))}
                      {currentCategoryCharacteristics.filter((char) => char.name.toLowerCase().includes(templateSearchTerm.toLowerCase())).length === 0 && (
                        <p className="px-4 py-2 text-xs text-slate-500 italic">Aucun modèle trouvé</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={charKey}
                onChange={(e) => setCharKey(e.target.value)}
                placeholder="Clé (ex: Taux d'alcool)"
                className="flex-1 rounded-lg px-4 py-2 text-white text-sm outline-none transition"
                style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
              />
              <input
                type="text"
                value={charValue}
                onChange={(e) => setCharValue(e.target.value)}
                placeholder="Valeur (ex: 40%)"
                className="flex-1 rounded-lg px-4 py-2 text-white text-sm outline-none transition"
                style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
              />
              <button
                type="button"
                onClick={addCharacteristic}
                disabled={!charKey.trim() || !charValue.trim()}
                className="px-3 py-2 rounded-lg text-xs font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-1">
              {Object.entries(formData.characteristics || {}).map(([key, value]) => (
                <span key={key} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(51, 65, 85, 0.5)', color: '#94a3b8' }}>
                  {key}: {value}
                  <button type="button" onClick={() => removeCharacteristic(key)} className="hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            {(!formData.characteristics || Object.keys(formData.characteristics).length === 0) && (
              <p className="text-xs mt-1" style={{ color: '#64748b' }}>Aucune caractéristique ajoutée</p>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t" style={{ borderColor: '#334155' }}>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02] hover:bg-slate-700/50 active:scale-[0.98]"
              style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8' }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: '#4f46e5', boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)' }}
            >
              {isSaving ? (
                <>
                  <img src="/logos/NOXIA_Orbit_Logo.svg" alt="NOXIA" className="w-4 h-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                product ? 'Modifier' : 'Ajouter'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
