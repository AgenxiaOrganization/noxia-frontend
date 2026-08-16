'use client'

import { useContext, useEffect, useState } from 'react'
import { Package, Plus, Search, Globe, Building2 } from 'lucide-react'
import { ServerContext } from '../layout'
import { createSuperAdminClient } from '@/lib/superAdminClient'
import { createCatalogApi, uploadInstanceProductPhoto, type Product as CatalogProduct, type Category } from '@/lib/api/catalog'
import { createInventoryApi, type Supplier } from '@/lib/api/inventory'
import { ensureArray } from '@/lib/api'
import ProductGrid from '@/components/products/ProductGrid'
import ProductFormModal, { type ProductFormValue } from '@/components/products/ProductFormModal'
import Loader from '@/components/ui/Loader'
import { toast } from 'sonner'

function mapProduct(p: CatalogProduct): ProductFormValue {
  const isCasier = p.packagings && p.packagings.length > 0 && p.packagings[0].name === 'Casier'
  return {
    id: p.id,
    name: p.name,
    category: p.category_name || 'boisson',
    categoryId: p.category ?? undefined,
    subCategory: isCasier ? 'casier' : 'unite',
    pricePerUnit: parseFloat(p.price),
    cratePrice: p.crate_price !== null && p.crate_price !== undefined ? p.crate_price : '',
    unitsPerPackage: isCasier ? p.packagings![0].units_per_package : 1,
    stock: p.stock ?? 0,
    unit: p.unit,
    supplierId: (p as any).supplier ?? null,
    minStock: p.min_stock ?? 10,
    characteristics: p.attributes || {},
    photo: p.photo ?? null,
  }
}

export default function SuperAdminProduits() {
  const { selectedServer, isGlobalMode, selectedCompany } = useContext(ServerContext)

  const [products, setProducts] = useState<ProductFormValue[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductFormValue | null>(null)

  const loadData = () => {
    if (isGlobalMode || !selectedCompany) {
      setProducts([])
      return
    }

    let cancelled = false
    const client = createSuperAdminClient(selectedServer.id, selectedCompany.id)
    const catalogApi = createCatalogApi(client)
    const inventoryApi = createInventoryApi(client)

    setIsLoading(true)
    setError(null)
    Promise.all([catalogApi.getProducts(), catalogApi.getCategories(), inventoryApi.getSuppliers()])
      .then(([rawProducts, rawCategories, rawSuppliers]) => {
        if (cancelled) return
        setProducts(ensureArray<CatalogProduct>(rawProducts).map(mapProduct))
        setCategories(ensureArray<Category>(rawCategories))
        setSuppliers(ensureArray<Supplier>(rawSuppliers))
      })
      .catch((e) => {
        if (cancelled) return
        console.error('Erreur chargement catalogue (super-admin)', e)
        setError("Impossible de charger les produits de cette entreprise.")
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }

  useEffect(loadData, [selectedServer.id, selectedCompany, isGlobalMode])

  const openModal = (product: ProductFormValue | null = null) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleSubmit = async (apiData: Record<string, unknown>, photoFile: File | null) => {
    if (!selectedCompany) return
    const catalogApi = createCatalogApi(createSuperAdminClient(selectedServer.id, selectedCompany.id))
    try {
      setIsSaving(true)
      const savePromise = editingProduct
        ? catalogApi.updateProduct(editingProduct.id, apiData)
        : catalogApi.createProduct(apiData)

      toast.promise(savePromise, {
        loading: editingProduct ? 'Modification du produit...' : 'Création du produit...',
        success: editingProduct ? 'Produit modifié avec succès !' : 'Produit créé avec succès !',
        error: 'Erreur lors de la sauvegarde.',
      })

      const saved = await savePromise
      if (photoFile) {
        try {
          await uploadInstanceProductPhoto(selectedServer.id, selectedCompany.id, saved.id, photoFile)
        } catch (photoErr) {
          console.error('Erreur upload photo produit (super-admin)', photoErr)
          toast.error("Le produit a été enregistré, mais l'envoi de la photo a échoué.")
        }
      }
      setIsModalOpen(false)
      loadData()
    } catch (e) {
      console.error('Erreur lors de la sauvegarde du produit (super-admin)', e)
    } finally {
      setIsSaving(false)
    }
  }

  const deleteProduct = async (id: number) => {
    if (!selectedCompany || !confirm('Supprimer ce produit ?')) return
    const catalogApi = createCatalogApi(createSuperAdminClient(selectedServer.id, selectedCompany.id))
    const deletePromise = catalogApi.deleteProduct(id)
    toast.promise(deletePromise, {
      loading: 'Suppression du produit en cours...',
      success: 'Produit supprimé avec succès !',
      error: 'Erreur lors de la suppression.',
    })
    await deletePromise
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))

  if (isGlobalMode) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <Globe className="w-10 h-10" style={{ color: '#334155' }} />
        <p className="text-sm" style={{ color: '#94a3b8' }}>
          Sélectionnez une instance dans le menu pour voir ses produits.
        </p>
        <p className="text-xs" style={{ color: '#64748b' }}>
          La vue « Global » ne montre pas de catalogue — chaque instance a le sien.
        </p>
      </div>
    )
  }

  if (!selectedCompany) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <Building2 className="w-10 h-10" style={{ color: '#334155' }} />
        <p className="text-sm" style={{ color: '#94a3b8' }}>
          Sélectionnez une entreprise dans le menu pour voir ses produits.
        </p>
      </div>
    )
  }

  if (isLoading) return <Loader />

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Produits — {selectedCompany.name}</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            {products.length} produits • {products.filter(p => p.stock <= (p.minStock ?? 10) && p.stock >= 0).length} alertes stock
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] flex items-center gap-2"
          style={{ background: '#4f46e5', boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)' }}
        >
          <Plus className="w-4 h-4" />
          Ajouter un produit
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>
          {error}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
          style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
        />
      </div>

      {filteredProducts.length === 0 ? (
        <div className="p-8 text-center">
          <Package className="w-12 h-12 mx-auto mb-2" style={{ color: '#334155' }} />
          <p className="text-sm" style={{ color: '#64748b' }}>Aucun produit trouvé pour cette entreprise</p>
        </div>
      ) : (
        <ProductGrid
          products={filteredProducts}
          onEdit={openModal}
          onDelete={deleteProduct}
        />
      )}

      {isModalOpen && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          suppliers={suppliers}
          isSaving={isSaving}
          onSubmit={handleSubmit}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  )
}
