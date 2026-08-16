'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, Search, Trash2, Package, Coffee, Utensils, Sparkles,
  X, Save, AlertCircle, Check, PlusCircle, MinusCircle 
} from 'lucide-react'
import { getProducts, createProduct, updateProduct, deleteProduct as deleteProductApi, getCategories, createCategory, createCategoryCharacteristic, uploadProductPhoto } from '../../../lib/api/catalog'
import { getSuppliers, createSupplier, Supplier } from '../../../lib/api/inventory'
import { ensureArray } from '@/lib/api'
import { useWebSockets } from '../../../lib/hooks/useWebSockets'
import Loader from '@/components/ui/Loader'
import { FeatureLockedScreen, isFeatureNotIncludedError } from '@/components/ui/FeatureLockedScreen'
import ProductGrid from '@/components/products/ProductGrid'
import ProductFormModal from '@/components/products/ProductFormModal'
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
  photo?: string | null
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categoriesData, setCategoriesData] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFeatureLocked, setIsFeatureLocked] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Modale Produit
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCharacteristicsModalOpen, setIsCharacteristicsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const [isSaving, setIsSaving] = useState(false)

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
      // Les fournisseurs (inventory.suppliers) sont une fonctionnalite
      // separee du catalogue (catalog.products) — un plan peut autoriser
      // l'une sans l'autre (ex: Starter), donc on isole cet appel pour
      // qu'un 403 dessus ne bloque pas toute la page produits.
      const [rawCats, rawProds] = await Promise.all([
        getCategories(),
        getProducts()
      ])
      const rawSuppliers = await getSuppliers().catch((e) => {
        if (!isFeatureNotIncludedError(e)) console.error('Erreur chargement fournisseurs', e)
        return []
      })

      let apiCategories = ensureArray<any>(rawCats)
      let apiSuppliers = ensureArray<Supplier>(rawSuppliers)
      let apiProducts = ensureArray<any>(rawProds)

      if (apiCategories.length === 0 && apiProducts.length === 0) {
        await seedDefaultData()
        const [freshCats, freshProds] = await Promise.all([
          getCategories(),
          getProducts()
        ])
        const freshSuppliers = await getSuppliers().catch(() => [])
        apiCategories = ensureArray<any>(freshCats)
        apiSuppliers = ensureArray<Supplier>(freshSuppliers)
        apiProducts = ensureArray<any>(freshProds)
      }

      setCategoriesData(apiCategories)
      setSuppliers(apiSuppliers)
      setIsFeatureLocked(false)

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
            characteristics: p.attributes || {},
            photo: p.photo ?? null,
          }
        }))
      } else {
        setProducts([])
      }
    } catch (e) {
      if (isFeatureNotIncludedError(e)) {
        setIsFeatureLocked(true)
      } else {
        console.error('Erreur chargement catalogue', e)
      }
    } finally {
      if (!silent) setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const categories = ['all', ...categoriesData.map(c => c.name)]

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const openModal = (product: Product | null = null) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  // Sauvegarder le produit
  const handleSubmit = async (apiData: Record<string, unknown>, photoFile: File | null) => {
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

      const saved = await savePromise
      if (photoFile) {
        try {
          await uploadProductPhoto(saved.id, photoFile)
        } catch (photoErr) {
          console.error('Erreur upload photo produit', photoErr)
          toast.error("Le produit a été enregistré, mais l'envoi de la photo a échoué.")
        }
      }
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
  if (isFeatureLocked) {
    return <FeatureLockedScreen featureLabel="Catalogue produits" />
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
      <ProductGrid products={filteredProducts} onEdit={openModal} onDelete={deleteProduct} />

      {/* MODAL D'AJOUT / MODIFICATION */}
      {isModalOpen && (
        <ProductFormModal
          product={editingProduct}
          categories={categoriesData}
          suppliers={suppliers}
          isSaving={isSaving}
          onSubmit={handleSubmit}
          onClose={() => setIsModalOpen(false)}
        />
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