'use client'

import { useState, useEffect } from 'react'
import { Truck, Plus, Search } from 'lucide-react'
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  contactSupplier,
  getSupplierOrders,
  createSupplierOrder,
  updateSupplierOrderStatus,
  deleteSupplierOrder,
  bulkDeleteSupplierOrders,
  Supplier,
  SupplierOrder,
} from '../../../lib/api/inventory'
import { getProducts } from '../../../lib/api/catalog'
import Loader from '@/components/ui/Loader'
import { FeatureLockedScreen, isFeatureNotIncludedError } from '@/components/ui/FeatureLockedScreen'
import SupplierGrid from '@/components/suppliers/SupplierGrid'
import SupplierFormModal, { type SupplierFormPayload } from '@/components/suppliers/SupplierFormModal'
import SupplierContactModal from '@/components/suppliers/SupplierContactModal'
import SupplierOrdersTable from '@/components/suppliers/SupplierOrdersTable'
import { toast } from 'sonner'
import { getCompany } from '../../../lib/auth'

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<SupplierOrder[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFeatureLocked, setIsFeatureLocked] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [contactMethod, setContactMethod] = useState<'email' | 'whatsapp'>('email')
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [contactSupplierData, setContactSupplierData] = useState<Supplier | null>(null)

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [apiSuppliers, apiProducts, apiOrders] = await Promise.all([
        getSuppliers(),
        getProducts(),
        getSupplierOrders(),
      ])

      const suppliersList = apiSuppliers && (apiSuppliers as any).results ? (apiSuppliers as any).results : (apiSuppliers || [])
      const productsList = apiProducts && (apiProducts as any).results ? (apiProducts as any).results : (apiProducts || [])
      const ordersList = apiOrders && (apiOrders as any).results ? (apiOrders as any).results : (apiOrders || [])

      setSuppliers(suppliersList)
      setProducts(productsList)
      setOrders(ordersList)
      setIsFeatureLocked(false)
    } catch (e) {
      if (isFeatureNotIncludedError(e)) {
        setIsFeatureLocked(true)
      } else {
        console.error('Erreur lors du chargement des fournisseurs, produits et commandes', e)
        toast.error('Erreur lors du chargement des données.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const openModal = (supplier: Supplier | null = null) => {
    setEditingSupplier(supplier)
    setIsModalOpen(true)
  }

  const handleSubmit = async (payload: SupplierFormPayload) => {
    try {
      setIsSaving(true)
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, payload)
        toast.success('Distributeur modifié avec succès !')
      } else {
        await createSupplier(payload)
        toast.success('Distributeur créé avec succès !')
      }
      setIsModalOpen(false)
      loadData()
    } catch (err) {
      console.error('Erreur de sauvegarde du distributeur', err)
      toast.error('Erreur lors de la sauvegarde.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Supprimer ce distributeur ?')) {
      try {
        await deleteSupplier(id)
        toast.success('Distributeur supprimé avec succès !')
        loadData()
      } catch (err) {
        console.error('Erreur lors du retrait du distributeur', err)
        toast.error('Erreur lors de la suppression.')
      }
    }
  }

  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.address && s.address.toLowerCase().includes(searchTerm.toLowerCase()))
    const supplierProducts = products.filter(p => p.supplier === s.id)
    const matchesProducts = supplierProducts.some((p: any) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
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
    if (!contactSupplierData) return
    try {
      setIsSaving(true)
      const contactPromise = contactSupplier(contactSupplierData.id, payload)
      toast.promise(contactPromise, {
        loading: "Envoi de l'e-mail et création de la commande...",
        success: 'E-mail de contact envoyé et commande enregistrée !',
        error: "Erreur lors de l'envoi de l'e-mail.",
      })
      await contactPromise
      setIsContactModalOpen(false)
      loadData()
    } catch (err) {
      console.error('Erreur de contact', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSendWhatsapp = ({ orderPayload, waUrl }: { orderPayload: Record<string, unknown>; waUrl: string }) => {
    createSupplierOrder(orderPayload as any).then(() => {
      loadData()
    }).catch(err => {
      console.error("Erreur lors de l'enregistrement de la commande en base", err)
      toast.error("La commande n'a pas pu être enregistrée en base locale, mais le message WhatsApp a été préparé.")
    })
    window.open(waUrl, '_blank')
    setIsContactModalOpen(false)
  }

  const handleUpdateOrderStatus = async (orderId: number, newStatus: 'pending' | 'shipped' | 'delivered') => {
    const updatePromise = updateSupplierOrderStatus(orderId, newStatus)
    toast.promise(updatePromise, {
      loading: 'Mise à jour du statut...',
      success: () => newStatus === 'delivered'
        ? '✅ Commande livrée ! Le stock du produit a été mis à jour automatiquement.'
        : '✅ Statut de la commande mis à jour avec succès !',
      error: '❌ Erreur lors du changement de statut.',
    })
    try {
      await updatePromise
      await loadData()
    } catch (err) {
      console.error('Erreur lors du changement de statut de la commande', err)
    }
  }

  const handleDeleteOrder = async (orderId: number) => {
    if (confirm('Supprimer cette commande récente ?')) {
      try {
        await deleteSupplierOrder(orderId)
        toast.success('Commande supprimée avec succès !')
        loadData()
      } catch (err) {
        console.error('Erreur lors de la suppression de la commande', err)
        toast.error('Erreur lors de la suppression.')
      }
    }
  }

  const handleBulkDeleteOrders = async (ids: number[]) => {
    if (ids.length === 0) return
    if (confirm(`Supprimer les ${ids.length} commandes sélectionnées ?`)) {
      try {
        await bulkDeleteSupplierOrders(ids)
        toast.success(`${ids.length} commandes supprimées avec succès !`)
        loadData()
      } catch (err) {
        console.error('Erreur lors de la suppression groupée des commandes', err)
        toast.error('Erreur lors de la suppression.')
      }
    }
  }

  const company = getCompany()
  const companyName = company ? company.name : 'Notre établissement'

  if (isLoading) {
    return <Loader />
  }
  if (isFeatureLocked) {
    return <FeatureLockedScreen featureLabel="Fournisseurs & commandes" />
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Distributeurs</h1>
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
        products={products}
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
          products={products}
          isSaving={isSaving}
          onSubmit={handleSubmit}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {isContactModalOpen && contactSupplierData && (
        <SupplierContactModal
          supplier={contactSupplierData}
          method={contactMethod}
          companyName={companyName}
          products={products}
          isSaving={isSaving}
          onSendEmail={handleSendEmail}
          onSendWhatsapp={handleSendWhatsapp}
          onClose={() => setIsContactModalOpen(false)}
        />
      )}
    </div>
  )
}
