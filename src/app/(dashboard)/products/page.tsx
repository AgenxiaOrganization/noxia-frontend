'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, Search, Edit, Trash2, Package, Coffee, Utensils, Sparkles, 
  X, Save, AlertCircle, Check, PlusCircle, MinusCircle 
} from 'lucide-react'
import { getProducts, createProduct, updateProduct, deleteProduct as deleteProductApi, getCategories, createCategory, createCategoryCharacteristic } from '../../../lib/api/catalog'
import { getSuppliers, createSupplier, Supplier } from '../../../lib/api/inventory'
import { ensureArray } from '@/lib/api'
import { useWebSockets } from '../../../lib/hooks/useWebSockets'
import Loader from '@/components/ui/Loader'
import { toast } from 'sonner'

// --- Types ---
interface Product {
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
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categoriesData, setCategoriesData] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Modale Produit
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCharacteristicsModalOpen, setIsCharacteristicsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  
  // Modale Catégorie
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatType, setNewCatType] = useState<'boisson' | 'nourriture' | 'service'>('boisson')
  
  // Modale Caractéristiques
  const [isCharModalOpen, setIsCharModalOpen] = useState(false)
  const [selectedCatForChar, setSelectedCatForChar] = useState<any | null>(null)
  const [charModelName, setCharModelName] = useState('')
  const [charAttributesList, setCharAttributesList] = useState<{ key: string, value: string }[]>([
    { key: '', value: '' }
  ])

  // Modale Fournisseur
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false)
  const [supplierForm, setSupplierForm] = useState({ name: '', phone: '', email: '', address: '' })

  const [isSaving, setIsSaving] = useState(false)

  // Form State Produit
  const [formData, setFormData] = useState({
    name: '',
    category: 'boisson',
    categoryId: undefined as number | undefined,
    subCategory: 'unite',
    pricePerUnit: 0,
    cratePrice: '' as string | number,
    unitsPerPackage: 12,
    stock: 0,
    unit: 'unite',
    supplierId: null as number | null,
    minStock: 10,
    characteristics: {} as Record<string, string>
  })

  // Websocket pour les alertes de stock faible en temps réel
  useWebSockets('/ws/notifications/', (data: any) => {
    const notif = data?.notification || data
    if (notif?.category === 'alert' || notif?.type === 'stock_low' || notif?.type === 'stock_out' || notif?.product_name) {
      toast.warning(notif.title || `Alerte Stock : ${notif.product_name || 'Un produit'} est sous le seuil`)
    }
  })

  const seedDefaultData = async () => {
    try {
      let cats = ensureArray<any>(await getCategories())
      if (cats.length === 0) {
        const catBoissons = await createCategory({ name: 'Boissons', type: 'boisson' })
        const catNourriture = await createCategory({ name: 'Nourriture', type: 'nourriture' })
        const catServices = await createCategory({ name: 'Services', type: 'service' })
        cats = [catBoissons, catNourriture, catServices]
      }

      const catBoisson = cats.find((c: any) => c.type === 'boisson')
      const catNourriture = cats.find((c: any) => c.type === 'nourriture')
      const catService = cats.find((c: any) => c.type === 'service')

      if (catBoisson && (!catBoisson.characteristics || catBoisson.characteristics.length === 0)) {
        await createCategoryCharacteristic(catBoisson.id, {
          name: 'Bière',
          attributes: { "alcool": "5%", "volume": "65cl" }
        })
        await createCategoryCharacteristic(catBoisson.id, {
          name: 'Whisky',
          attributes: { "origine": "Écosse", "âge": "12 ans" }
        })
      }

      if (catNourriture && (!catNourriture.characteristics || catNourriture.characteristics.length === 0)) {
        await createCategoryCharacteristic(catNourriture.id, {
          name: 'Plat Chaud',
          attributes: { "accompagnement": "Frites", "option": "Salade" }
        })
      }

      const defaultProducts = [
        {
          category: catBoisson?.id || null,
          name: 'Bière Castel 65cl',
          unit: 'unite' as const,
          price: '1500',
          initial_stock: 48,
          initial_min_stock: 10,
          units_per_package: 12
        },
        {
          category: catBoisson?.id || null,
          name: 'Bière Guinness 65cl',
          unit: 'unite' as const,
          price: '2000',
          initial_stock: 12,
          initial_min_stock: 10,
          units_per_package: 12
        },
        {
          category: catBoisson?.id || null,
          name: 'Whisky Jack Daniel\'s',
          unit: 'bouteille' as const,
          price: '25000',
          initial_stock: 8,
          initial_min_stock: 2
        },
        {
          category: catNourriture?.id || null,
          name: 'Burger Classic',
          unit: 'plat' as const,
          price: '4000',
          initial_stock: 30,
          initial_min_stock: 5
        },
        {
          category: catService?.id || null,
          name: 'Chicha Session',
          unit: 'service' as const,
          price: '10000',
          initial_stock: 0,
          initial_min_stock: 0
        }
      ]

      for (const p of defaultProducts) {
        await createProduct(p)
      }
    } catch (err) {
      console.error('Erreur lors du peuplement automatique de la base de données', err)
    }
  }

  const loadData = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true)
      const [rawCats, rawSuppliers, rawProds] = await Promise.all([
        getCategories(),
        getSuppliers(),
        getProducts()
      ])

      let apiCategories = ensureArray<any>(rawCats)
      let apiSuppliers = ensureArray<Supplier>(rawSuppliers)
      let apiProducts = ensureArray<any>(rawProds)

      if (apiCategories.length === 0 && apiProducts.length === 0) {
        await seedDefaultData()
        const [freshCats, freshSuppliers, freshProds] = await Promise.all([
          getCategories(),
          getSuppliers(),
          getProducts()
        ])
        apiCategories = ensureArray<any>(freshCats)
        apiSuppliers = ensureArray<Supplier>(freshSuppliers)
        apiProducts = ensureArray<any>(freshProds)
      }

      setCategoriesData(apiCategories)
      setSuppliers(apiSuppliers)

      if (apiProducts.length > 0) {
        setProducts(apiProducts.map((p: any) => {
          const isCasier = p.packagings && p.packagings.length > 0 && p.packagings[0].name === 'Casier';
          return {
            id: p.id,
            name: p.name,
            category: p.category_name || 'boisson',
            categoryId: p.category,
            subCategory: isCasier ? 'casier' : 'unite',
            pricePerUnit: parseFloat(p.price),
            cratePrice: p.crate_price !== null && p.crate_price !== undefined ? p.crate_price : '',
            unitsPerPackage: isCasier ? p.packagings[0].units_per_package : 1,
            stock: p.stock !== undefined ? p.stock : 0,
            unit: p.unit,
            supplierId: p.supplier || null,
            minStock: p.min_stock !== undefined ? p.min_stock : 10,
            characteristics: p.attributes || {}
          }
        }))
      } else {
        setProducts([])
      }
    } catch (e) {
      console.error('Erreur chargement catalogue', e)
    } finally {
      if (!silent) setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // États pour les champs flexibles
  const [charKey, setCharKey] = useState('')
  const [charValue, setCharValue] = useState('')
  const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState(false)
  const [templateSearchTerm, setTemplateSearchTerm] = useState('')

  const currentCategory = categoriesData.find(c => Number(c.id) === Number(formData.categoryId))
  const currentCategoryCharacteristics = currentCategory?.characteristics || []

  const categories = ['all', ...categoriesData.map(c => c.name)]

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // La sélection d'un modèle (article) de caractéristique se fait manuellement dans le formulaire

  // --- Logique du formulaire ---
  const openModal = (product: Product | null = null) => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        categoryId: product.categoryId,
        subCategory: product.subCategory || 'casier',
        pricePerUnit: product.pricePerUnit,
        cratePrice: product.cratePrice !== null && product.cratePrice !== undefined ? product.cratePrice : '',
        unitsPerPackage: product.unitsPerPackage || 1,
        stock: product.subCategory === 'casier'
          ? Math.floor(product.stock / (product.unitsPerPackage || 1))
          : product.stock,
        unit: product.unit || 'unite',
        supplierId: product.supplierId ?? null,
        minStock: product.minStock || 10,
        characteristics: product.characteristics || {},
      })
      setEditingProduct(product)
    } else {
      setFormData({
        name: '',
        category: categoriesData.length > 0 ? categoriesData[0].name : 'boisson',
        categoryId: categoriesData.length > 0 ? categoriesData[0].id : undefined,
        subCategory: 'casier',
        pricePerUnit: 0,
        cratePrice: '',
        unitsPerPackage: 1,
        stock: 0,
        unit: 'unité',
        supplierId: null,
        minStock: 10,
        characteristics: {},
      })
      setEditingProduct(null)
      setCharKey('')
      setCharValue('')
    }
    setIsTemplateDropdownOpen(false)
    setTemplateSearchTerm('')
    setIsModalOpen(true)
  }

  // Ajouter une caractéristique
  const addCharacteristic = () => {
    if (charKey.trim() && charValue.trim()) {
      setFormData({
        ...formData,
        characteristics: {
          ...formData.characteristics,
          [charKey.trim()]: charValue.trim()
        }
      })
      setCharKey('')
      setCharValue('')
    }
  }

  // Supprimer une caractéristique
  const removeCharacteristic = (key: string) => {
    const newChars = { ...formData.characteristics }
    delete newChars[key]
    setFormData({
      ...formData,
      characteristics: newChars
    })
  }

  // Mise à jour du champ "Sous-catégorie" quand la catégorie change
  useEffect(() => {
    const isBoisson = categoriesData.find(c => c.id === formData.categoryId)?.type === 'boisson' || formData.category?.toLowerCase().includes('boisson');
    if (isBoisson) {
      if (!['casier', 'unite'].includes(formData.subCategory)) {
        setFormData(prev => ({ ...prev, subCategory: 'casier' }))
      }
    } else {
      setFormData(prev => ({ ...prev, subCategory: 'unite' }))
    }
  }, [formData.categoryId, formData.category, categoriesData])

  // Sauvegarder le produit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const categoryType = categoriesData.find(c => c.id === formData.categoryId)?.type;
    const isService = categoryType === 'service' || formData.category?.toLowerCase().includes('service');

    let unitVal: 'unite' | 'bouteille' | 'casier' | 'plat' | 'portion' | 'service' = 'unite';
    if (isService) {
      unitVal = 'service';
    } else if (categoryType === 'nourriture') {
      unitVal = 'plat';
    } else if (formData.unit && ['unite', 'bouteille', 'casier', 'plat', 'portion', 'service'].includes(formData.unit)) {
      unitVal = formData.unit as any;
    }

    const apiData: any = {
      name: formData.name,
      category: formData.categoryId,
      price: formData.pricePerUnit?.toString() || "0",
      crate_price: formData.cratePrice !== '' && formData.cratePrice !== null && formData.cratePrice !== undefined ? formData.cratePrice.toString() : null,
      unit: unitVal,
      is_active: true,
      brand: '',
      alcohol_percentage: null,
      volume_cl: null,
      attributes: formData.characteristics,
      initial_stock: isService ? -1 : (formData.subCategory === 'casier'
        ? formData.stock * formData.unitsPerPackage
        : formData.stock),
      initial_min_stock: isService ? 0 : formData.minStock,
      units_per_package: formData.subCategory === 'casier' ? formData.unitsPerPackage : 1,
      supplier: formData.supplierId
    }

    try {
      setIsSaving(true)
      const savePromise = editingProduct
        ? updateProduct(editingProduct.id, apiData)
        : createProduct(apiData)

      toast.promise(savePromise, {
        loading: editingProduct ? "Modification du produit..." : "Création du produit...",
        success: editingProduct ? "✅ Produit modifié avec succès !" : "✅ Produit créé avec succès !",
        error: "❌ Erreur lors de la sauvegarde."
      })

      await savePromise
      setIsModalOpen(false)
      await loadData(true)
    } catch (e) {
      console.error('Erreur lors de la sauvegarde du produit', e)
    } finally {
      setIsSaving(false)
    }
  }

  // Supprimer un produit
  const deleteProduct = async (id: number) => {
    if (confirm('Supprimer ce produit ?')) {
      const deletePromise = deleteProductApi(id)
      toast.promise(deletePromise, {
        loading: 'Suppression du produit en cours...',
        success: '✅ Produit supprimé avec succès !',
        error: 'Erreur lors de la suppression.'
      })
      await deletePromise
      await loadData(true)
    }
  }

  // --- Rendu ---
  if (isLoading) {
    return <Loader />
  }

  return (
    <div className="p-4 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Produits</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            {products.length} produits • {products.filter(p => p.stock <= (p.minStock ?? 10) && p.stock >= 0).length} alertes stock
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsCharacteristicsModalOpen(true)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 border border-slate-700"
            style={{
              background: 'rgba(51, 65, 85, 0.5)',
              color: '#94a3b8'
            }}
          >
            <Sparkles className="w-4 h-4" />
            Modèles de caractéristiques
          </button>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] flex items-center gap-2"
            style={{
              background: '#4f46e5',
              boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
            }}
          >
            <Plus className="w-4 h-4" />
            Ajouter un produit
          </button>
        </div>
      </div>

      {/* FILTRES ET RECHERCHE */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
            style={{
              background: 'rgba(51, 65, 85, 0.5)',
              border: '1px solid #334155'
            }}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${selectedCategory === cat ? 'border' : 'border-transparent'
                }`}
              style={{
                background: selectedCategory === cat ? 'rgba(99, 102, 241, 0.15)' : 'rgba(51, 65, 85, 0.3)',
                borderColor: selectedCategory === cat ? '#6366f1' : 'transparent',
                color: selectedCategory === cat ? '#818cf8' : '#94a3b8'
              }}
            >
              {cat === 'all' ? 'Tous' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* LISTE DES PRODUITS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredProducts.map((product) => {
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
                borderColor: isOutOfStock ? '#ef4444' : isLowStock ? '#f59e0b' : '#334155'
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-medium text-sm text-white truncate max-w-[150px]">{product.name}</h3>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>
                    {product.category} • {product.subCategory === 'casier' ? 'Par casier' : 'À l\'unité'}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${isOutOfStock ? 'bg-red-500/20 text-red-400' :
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

              {/* Seuil d'alerte */}
              {!isInfinite && (
                <p className="text-xs" style={{ color: '#64748b' }}>
                  Seuil alerte: {product.minStock} {product.unit}s
                </p>
              )}

              {/* Caractéristiques */}
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

              <div className="flex gap-2 mt-3 pt-3 border-t" style={{ borderColor: '#334155' }}>
                <button
                  onClick={() => openModal(product)}
                  className="flex-1 py-1.5 rounded text-xs font-medium transition flex items-center justify-center gap-1"
                  style={{
                    background: 'rgba(51, 65, 85, 0.5)',
                    color: '#94a3b8'
                  }}
                >
                  <Edit className="w-3 h-3" />
                  Modifier
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="flex-1 py-1.5 rounded text-xs font-medium transition flex items-center justify-center gap-1"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#f87171'
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                  Supprimer
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* MODAL D'AJOUT / MODIFICATION */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            style={{
              background: '#1e293b',
              border: '1px solid #334155'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-white mb-4">
              {editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nom */}
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Nom du produit *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                  style={{
                    background: 'rgba(51, 65, 85, 0.5)',
                    border: '1px solid #334155'
                  }}
                  required
                />
                <p className="text-xs mt-1" style={{ color: '#64748b' }}>
                  💡 Les caractéristiques seront automatiquement suggérées en fonction du nom
                </p>
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Catégorie *</label>
                <select
                  value={formData.categoryId || ''}
                  onChange={(e) => {
                    const catId = parseInt(e.target.value);
                    const catName = categoriesData.find(c => c.id === catId)?.name || 'boisson';
                    setFormData({ ...formData, categoryId: catId, category: catName })
                  }}
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                  style={{
                    background: 'rgba(51, 65, 85, 0.5)',
                    border: '1px solid #334155'
                  }}
                >
                  <option value="" disabled>Sélectionner une catégorie</option>
                  {categoriesData.map(c => (
                     <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Sous-catégorie */}
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>
                  Type de vente *
                </label>
                {(categoriesData.find(c => c.id === formData.categoryId)?.type === 'boisson' || formData.category?.toLowerCase().includes('boisson')) ? (
                  <select
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid #334155'
                    }}
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
                    style={{
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid #334155'
                    }}
                  />
                )}
              </div>

              {/* Prix, Quantité, Stock, Seuil */}
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
                    style={{
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid #334155'
                    }}
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
                      style={{
                        background: 'rgba(99, 102, 241, 0.1)',
                      }}
                    />
                  </div>
                )}

                {(categoriesData.find(c => c.id === formData.categoryId)?.type === 'service' || formData.category?.toLowerCase().includes('service')) ? (
                  <div className="col-span-1 sm:col-span-4 p-3 rounded-xl flex items-center gap-2.5" style={{ background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                    <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-white">Produit de type Service (Chicha, VIP, Pass...)</p>
                      <p className="text-xs text-slate-300">Le stock est automatiquement géré comme <strong>Illimité</strong> (aucun décompte physique d'unités à la caisse).</p>
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
                            style={{
                              background: 'rgba(51, 65, 85, 0.5)',
                              border: '1px solid #334155'
                            }}
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
                            style={{
                              background: 'rgba(51, 65, 85, 0.5)',
                              border: '1px solid #334155'
                            }}
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
                          style={{
                            background: 'rgba(51, 65, 85, 0.5)',
                            border: '1px solid #334155'
                          }}
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
                        style={{
                          background: 'rgba(51, 65, 85, 0.5)',
                          border: '1px solid #334155'
                        }}
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

              {/* Fournisseur */}
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Fournisseur</label>
                <select
                  value={formData.supplierId || ''}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                  style={{
                    background: 'rgba(51, 65, 85, 0.5)',
                    border: '1px solid #334155'
                  }}
                >
                  <option value="">Aucun</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Caractéristiques avec modèles */}
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Caractéristiques</label>
                
                {/* Sélecteur de modèle custom avec recherche */}
                {formData.categoryId && currentCategoryCharacteristics.length > 0 && (
                  <div className="mb-3 relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsTemplateDropdownOpen(!isTemplateDropdownOpen)
                        setTemplateSearchTerm('')
                      }}
                      className="w-full flex items-center justify-between rounded-lg px-4 py-2.5 text-left text-sm outline-none transition"
                      style={{
                        background: 'rgba(51, 65, 85, 0.5)',
                        border: '1px dashed #6366f1',
                        color: '#818cf8'
                      }}
                    >
                      <span>+ Charger depuis un modèle existant...</span>
                      <Search className="w-4 h-4 opacity-60" />
                    </button>

                    {isTemplateDropdownOpen && (
                      <div
                        className="absolute left-0 right-0 mt-1 rounded-lg border z-50 overflow-hidden shadow-2xl"
                        style={{
                          background: '#1e293b',
                          borderColor: '#334155'
                        }}
                      >
                        {/* Barre de recherche */}
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

                        {/* Liste des modèles */}
                        <div className="max-h-48 overflow-y-auto py-1">
                          {currentCategoryCharacteristics
                            .filter((char: any) => char.name.toLowerCase().includes(templateSearchTerm.toLowerCase()))
                            .map((char: any) => (
                              <button
                                key={char.id}
                                type="button"
                                onClick={() => {
                                  if (char.attributes) {
                                    setFormData(prev => ({
                                      ...prev,
                                      characteristics: { ...prev.characteristics, ...char.attributes }
                                    }))
                                  }
                                  setIsTemplateDropdownOpen(false)
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-indigo-600 transition"
                              >
                                {char.name}
                              </button>
                            ))}
                          {currentCategoryCharacteristics
                            .filter((char: any) => char.name.toLowerCase().includes(templateSearchTerm.toLowerCase())).length === 0 && (
                              <p className="px-4 py-2 text-xs text-slate-500 italic">Aucun modèle trouvé</p>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-xs mb-2" style={{ color: '#64748b' }}>
                  Tapez une clé (ex: Volume) et sa valeur (ex: 75cl), ou chargez un modèle ci-dessus.
                </p>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={charKey}
                    onChange={(e) => setCharKey(e.target.value)}
                    placeholder="Clé (ex: Taux d'alcool)"
                    className="flex-1 rounded-lg px-4 py-2 text-white text-sm outline-none transition"
                    style={{
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid #334155'
                    }}
                  />
                  <input
                    type="text"
                    value={charValue}
                    onChange={(e) => setCharValue(e.target.value)}
                    placeholder="Valeur (ex: 40%)"
                    className="flex-1 rounded-lg px-4 py-2 text-white text-sm outline-none transition"
                    style={{
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid #334155'
                    }}
                  />
                  <button
                    type="button"
                    onClick={addCharacteristic}
                    disabled={!charKey.trim() || !charValue.trim()}
                    className="px-3 py-2 rounded-lg text-xs font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: '#818cf8'
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1">
                  {Object.entries(formData.characteristics || {}).map(([key, value]) => (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                      style={{ background: 'rgba(51, 65, 85, 0.5)', color: '#94a3b8' }}
                    >
                      {key}: {value}
                      <button
                        type="button"
                        onClick={() => removeCharacteristic(key)}
                        className="hover:text-red-400"
                      >
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
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02] hover:bg-slate-700/50 active:scale-[0.98]"
                  style={{
                    background: 'transparent',
                    border: '1px solid #334155',
                    color: '#94a3b8'
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{
                    background: '#4f46e5',
                    boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  {isSaving ? (
                    <>
                      <img src="/logos/NOXIA_Orbit_Logo.svg" alt="NOXIA" className="w-4 h-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    editingProduct ? 'Modifier' : 'Ajouter'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GESTION DES CARACTERISTIQUES PAR CATEGORIE */}
      {isCharacteristicsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]" style={{ background: '#1e293b', border: '1px solid #334155' }}>
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div>
                <h2 className="text-lg font-bold text-white">Modèles de caractéristiques</h2>
                <p className="text-xs text-slate-400">Configurez les champs par défaut pour chaque catégorie</p>
              </div>
              <button onClick={() => setIsCharacteristicsModalOpen(false)} className="p-2 hover:bg-slate-700 rounded-full transition text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              <div className="space-y-6">
                {categoriesData.map(cat => (
                  <div key={cat.id} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                    <h3 className="font-bold text-indigo-400 mb-3 text-sm">{cat.name}</h3>
                    
                    {cat.characteristics && cat.characteristics.length > 0 ? (
                      <div className="space-y-4 mb-4">
                        {cat.characteristics.map((char: any) => (
                          <div key={char.id} className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white font-medium text-sm">{char.name}</span>
                              <button 
                                onClick={async () => {
                                  if (confirm(`Supprimer le modèle "${char.name}" ?`)) {
                                    try {
                                      const { deleteCategoryCharacteristic } = await import('../../../lib/api/catalog');
                                      await deleteCategoryCharacteristic(cat.id, char.id);
                                      loadData();
                                    } catch (e) {
                                      console.error(e);
                                      alert("Erreur");
                                    }
                                  }
                                }}
                                className="text-red-400 hover:text-red-300 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            
                            {/* Liste des attributs pour cet article */}
                            <div className="space-y-1 mb-2">
                              {Object.entries(char.attributes || {}).map(([key, val]) => (
                                <div key={key} className="flex justify-between text-xs items-center bg-slate-900/50 px-2 py-1 rounded">
                                  <span className="text-slate-300"><span className="text-indigo-300 font-medium">{key}</span>: {val as string}</span>
                                  <button
                                    onClick={async () => {
                                      try {
                                        const { createCategoryCharacteristic } = await import('../../../lib/api/catalog');
                                        const newAttrs = { ...char.attributes };
                                        delete newAttrs[key];
                                        // On utilise createCategoryCharacteristic mais en fait c'est un update.
                                        // Wait, we need an update API ! Let's use PUT.
                                        const { put } = await import('../../../lib/api');
                                        await put(`/catalog/categories/${cat.id}/characteristics/${char.id}/`, { name: char.name, attributes: newAttrs });
                                        loadData();
                                      } catch (e) { console.error(e); }
                                    }}
                                    className="text-red-400 hover:text-red-300"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                            
                            {/* Ajouter un attribut à cet article */}
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                placeholder="Clé (ex: Volume)"
                                id={`attrKey-${char.id}`}
                                className="w-1/3 rounded px-2 py-1 text-xs bg-slate-900 border border-slate-700 text-white"
                              />
                              <input 
                                type="text"
                                placeholder="Valeur (ex: 75cl)"
                                id={`attrVal-${char.id}`}
                                className="w-1/3 rounded px-2 py-1 text-xs bg-slate-900 border border-slate-700 text-white"
                              />
                              <button 
                                onClick={async () => {
                                  const keyInput = document.getElementById(`attrKey-${char.id}`) as HTMLInputElement;
                                  const valInput = document.getElementById(`attrVal-${char.id}`) as HTMLInputElement;
                                  if (keyInput && keyInput.value.trim()) {
                                    try {
                                      const { put } = await import('../../../lib/api');
                                      const newAttrs = { ...char.attributes, [keyInput.value.trim()]: valInput?.value?.trim() || '' };
                                      await put(`/catalog/categories/${cat.id}/characteristics/${char.id}/`, { name: char.name, attributes: newAttrs });
                                      keyInput.value = '';
                                      if(valInput) valInput.value = '';
                                      loadData();
                                    } catch (e) { console.error(e); }
                                  }
                                }}
                                className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium"
                              >
                                Ajouter attr.
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 mb-4 italic">Aucun modèle (article) configuré pour cette catégorie.</p>
                    )}

                    <div className="flex gap-2 border-t border-slate-700 pt-3">
                      <input 
                        type="text"
                        placeholder="Nouvel article (ex: Bière, Whisky)..."
                        id={`newCharName-${cat.id}`}
                        className="flex-1 rounded px-3 py-1.5 text-sm bg-slate-900 border border-slate-700 text-white"
                      />
                      <button 
                        onClick={async () => {
                          const input = document.getElementById(`newCharName-${cat.id}`) as HTMLInputElement;
                          if (input && input.value.trim()) {
                            try {
                              const { createCategoryCharacteristic } = await import('../../../lib/api/catalog');
                              await createCategoryCharacteristic(cat.id, { name: input.value.trim(), attributes: {} });
                              input.value = '';
                              loadData();
                            } catch (e) {
                              console.error(e);
                              alert("Erreur lors de l'ajout.");
                            }
                          }
                        }}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm font-medium transition"
                      >
                        Créer le modèle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}