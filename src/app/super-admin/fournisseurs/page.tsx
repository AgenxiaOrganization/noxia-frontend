'use client'

import { useContext, useEffect, useState } from 'react'
import { Truck, Plus, Search, Globe, Building2 } from 'lucide-react'
import { ServerContext } from '../layout'
import { createSuperAdminClient } from '@/lib/superAdminClient'
import { createCatalogApi, type Product as CatalogProduct } from '@/lib/api/catalog'
import { createInventoryApi, type Supplier, type SupplierOrder } from '@/lib/api/inventory'
import { ensureArray } from '@/lib/api'
import Loader from '@/components/ui/Loader'
import SupplierGrid from '@/components/suppliers/SupplierGrid'
import SupplierFormModal, { type SupplierFormPayload } from '@/components/suppliers/SupplierFormModal'
import SupplierContactModal from '@/components/suppliers/SupplierContactModal'
import SupplierOrdersTable from '@/components/suppliers/SupplierOrdersTable'
import { toast } from 'sonner'

export default function SuperAdminFournisseurs() {
  const { selectedServer, isGlobalMode, selectedCompany } = useContext(ServerContext)

  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [orders, setOrders] = useState<SupplierOrder[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [contactMethod, setContactMethod] = useState<'email' | 'whatsapp'>('email')
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [contactSupplierData, setContactSupplierData] = useState<Supplier | null>(null)

  const getClient = () => createSuperAdminClient(selectedServer.id, selectedCompany!.id)

  const loadData = () => {
    if (isGlobalMode || !selectedCompany) {
      setSuppliers([])
      setProducts([])
      setOrders([])
      return
    }

    let cancelled = false
    const client = getClient()
    const catalogApi = createCatalogApi(client)
    const inventoryApi = createInventoryApi(client)

    setIsLoading(true)
    setError(null)
    Promise.all([inventoryApi.getSuppliers(), catalogApi.getProducts(), inventoryApi.getSupplierOrders()])
      .then(([rawSuppliers, rawProducts, rawOrders]) => {
        if (cancelled) return
        setSuppliers(ensureArray<Supplier>(rawSuppliers))
        setProducts(ensureArray<CatalogProduct>(rawProducts))
        setOrders(ensureArray<SupplierOrder>(rawOrders))
      })
      .catch((e) => {
        if (cancelled) return
        console.error('Erreur chargement fournisseurs (super-admin)', e)
        setError('Impossible de charger les fournisseurs de cette entreprise.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }

  useEffect(loadData, [selectedServer.id, selectedCompany, isGlobalMode])

  const openModal = (supplier: Supplier | null = null) => {
    setEditingSupplier(supplier)
    setIsModalOpen(true)
  }

  const handleSubmit = async (payload: SupplierFormPayload) => {
    if (!selectedCompany) return
    const inventoryApi = createInventoryApi(getClient())
    try {
      setIsSaving(true)
      if (editingSupplier) {
        await inventoryApi.updateSupplier(editingSupplier.id, payload)
        toast.success('Distributeur modifié avec succès !')
      } else {
        await inventoryApi.createSupplier(payload)
        toast.success('Distributeur créé avec succès !')
      }
      setIsModalOpen(false)
      loadData()
    } catch (err) {
      console.error('Erreur de sauvegarde du distributeur (super-admin)', err)
      toast.error('Erreur lors de la sauvegarde.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!selectedCompany || !confirm('Supprimer ce distributeur ?')) return
    try {
      await createInventoryApi(getClient()).deleteSupplier(id)
      toast.success('Distributeur supprimé avec succès !')
      loadData()
    } catch (err) {
      console.error('Erreur lors du retrait du distributeur (super-admin)', err)
      toast.error('Erreur lors de la suppression.')
    }
  }

  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.address && s.address.toLowerCase().includes(searchTerm.toLowerCase()))
    const supplierProducts = products.filter(p => (p as any).supplier === s.id)
    const matchesProducts = supplierProducts.some((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesSearch || matchesProducts
  })

  const openContactModal = (supplier: Supplier, method: 'email' | 'whatsapp') => {
    if (method === 'email' && !supplier.email) {
      toast.error("Ce fournisseur n'a pas d'adresse e-mail configurée.")
      return
    }
    if (method === 'whatsapp' && !supplier.phone) {
      toast.error("Ce fournisseur n'a pas de numéro de téléphone configuré.")
      return
    }
    setContactMethod(method)
    setContactSupplierData(supplier)
    setIsContactModalOpen(true)
  }

  const handleSendEmail = async (payload: { message: string; products: { name: string; quantity: string | number }[] }) => {
    if (!contactSupplierData || !selectedCompany) return
    const inventoryApi = createInventoryApi(getClient())
    try {
      setIsSaving(true)
      const contactPromise = inventoryApi.contactSupplier(contactSupplierData.id, payload)
      toast.promise(contactPromise, {
        loading: "Envoi de l'e-mail et création de la commande...",
        success: 'E-mail de contact envoyé et commande enregistrée !',
        error: "Erreur lors de l'envoi de l'e-mail.",
      })
      await contactPromise
      setIsContactModalOpen(false)
      loadData()
    } catch (err) {
      console.error('Erreur de contact (super-admin)', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSendWhatsapp = ({ orderPayload, waUrl }: { orderPayload: Record<string, unknown>; waUrl: string }) => {
    if (!selectedCompany) return
    createInventoryApi(getClient()).createSupplierOrder(orderPayload as any).then(() => {
      loadData()
    }).catch(err => {
      console.error("Erreur lors de l'enregistrement de la commande en base (super-admin)", err)
      toast.error("La commande n'a pas pu être enregistrée en base locale, mais le message WhatsApp a été préparé.")
    })
    window.open(waUrl, '_blank')
    setIsContactModalOpen(false)
  }

  const handleUpdateOrderStatus = async (orderId: number, newStatus: 'pending' | 'shipped' | 'delivered') => {
    if (!selectedCompany) return
    const updatePromise = createInventoryApi(getClient()).updateSupplierOrderStatus(orderId, newStatus)
    toast.promise(updatePromise, {
      loading: 'Mise à jour du statut...',
      success: () => newStatus === 'delivered'
        ? 'Commande livrée ! Le stock du produit a été mis à jour automatiquement.'
        : 'Statut de la commande mis à jour avec succès !',
      error: 'Erreur lors du changement de statut.',
    })
    try {
      await updatePromise
      loadData()
    } catch (err) {
      console.error('Erreur lors du changement de statut de la commande (super-admin)', err)
    }
  }

  const handleDeleteOrder = async (orderId: number) => {
    if (!selectedCompany || !confirm('Supprimer cette commande récente ?')) return
    try {
      await createInventoryApi(getClient()).deleteSupplierOrder(orderId)
      toast.success('Commande supprimée avec succès !')
      loadData()
    } catch (err) {
      console.error('Erreur lors de la suppression de la commande (super-admin)', err)
      toast.error('Erreur lors de la suppression.')
    }
  }

  const handleBulkDeleteOrders = async (ids: number[]) => {
    if (!selectedCompany || ids.length === 0) return
    if (confirm(`Supprimer les ${ids.length} commandes sélectionnées ?`)) {
      try {
        await createInventoryApi(getClient()).bulkDeleteSupplierOrders(ids)
        toast.success(`${ids.length} commandes supprimées avec succès !`)
        loadData()
      } catch (err) {
        console.error('Erreur lors de la suppression groupée des commandes (super-admin)', err)
        toast.error('Erreur lors de la suppression.')
      }
    }
  }

  if (isGlobalMode) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <Globe className="w-10 h-10" style={{ color: '#334155' }} />
        <p className="text-sm" style={{ color: '#94a3b8' }}>Sélectionnez une instance dans le menu pour voir ses fournisseurs.</p>
      </div>
    )
  }

  if (!selectedCompany) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <Building2 className="w-10 h-10" style={{ color: '#334155' }} />
        <p className="text-sm" style={{ color: '#94a3b8' }}>Sélectionnez une entreprise dans le menu pour voir ses fournisseurs.</p>
      </div>
    )
  }

  if (isLoading) return <Loader />

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Distributeurs — {selectedCompany.name}</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            {suppliers.length} fournisseurs • {orders.filter(o => o.status === 'pending').length} commandes en attente
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
          style={{ background: '#4f46e5', boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)' }}
        >
          <Plus className="w-4 h-4" />
          Ajouter un distributeur
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
          placeholder="Rechercher un distributeur ou un produit fourni..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
          style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
        />
      </div>

      <SupplierGrid
        suppliers={filteredSuppliers}
        products={products as any}
        onEdit={openModal}
        onDelete={handleDelete}
        onContact={openContactModal}
      />

      <SupplierOrdersTable
        orders={orders}
        onUpdateStatus={handleUpdateOrderStatus}
        onDelete={handleDeleteOrder}
        onBulkDelete={handleBulkDeleteOrders}
      />

      {isModalOpen && (
        <SupplierFormModal
          supplier={editingSupplier}
          products={products as any}
          isSaving={isSaving}
          onSubmit={handleSubmit}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {isContactModalOpen && contactSupplierData && (
        <SupplierContactModal
          supplier={contactSupplierData}
          method={contactMethod}
          companyName={selectedCompany.name}
          products={products as any}
          isSaving={isSaving}
          onSendEmail={handleSendEmail}
          onSendWhatsapp={handleSendWhatsapp}
          onClose={() => setIsContactModalOpen(false)}
        />
      )}
    </div>
  )
}
