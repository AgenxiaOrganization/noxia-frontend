'use client'

import { useState, useEffect } from 'react'
import {
  Truck, Plus, Search, Edit, Trash2, 
  Phone, Mail, Send, AlertTriangle,
  MapPin, X, PlusCircle, Check
} from 'lucide-react'
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
  SupplierOrder
} from '../../../lib/api/inventory'
import { getProducts } from '../../../lib/api/catalog'
import Loader from '@/components/ui/Loader'
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
  const [isSaving, setIsSaving] = useState(false)
  const [activeContactMenu, setActiveContactMenu] = useState<number | null>(null)
  const [activeStatusMenu, setActiveStatusMenu] = useState<number | null>(null)
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([])


  // États pour la modal de contact e-mail/WhatsApp
  const [contactMethod, setContactMethod] = useState<'email' | 'whatsapp'>('email')

  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [contactSupplierData, setContactSupplierData] = useState<Supplier | null>(null)
  const [contactForm, setContactForm] = useState({
    message: '',
    products: [] as { name: string; quantity: string | number }[]
  })

  // Formulaire d'état pour l'ajout/modification de fournisseur
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    product_ids: [] as number[]
  })

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [apiSuppliers, apiProducts, apiOrders] = await Promise.all([
        getSuppliers(),
        getProducts(),
        getSupplierOrders()
      ])

      const suppliersList = apiSuppliers && (apiSuppliers as any).results ? (apiSuppliers as any).results : (apiSuppliers || [])
      const productsList = apiProducts && (apiProducts as any).results ? (apiProducts as any).results : (apiProducts || [])
      const ordersList = apiOrders && (apiOrders as any).results ? (apiOrders as any).results : (apiOrders || [])

      setSuppliers(suppliersList)
      setProducts(productsList)
      setOrders(ordersList)
    } catch (e) {
      console.error('Erreur lors du chargement des fournisseurs, produits et commandes', e)
      toast.error('Erreur lors du chargement des données.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Ouvrir le modal d'ajout/modification
  const openModal = (supplier: Supplier | null = null) => {
    if (supplier) {
      // Trouver les IDs des produits associés à ce fournisseur
      const associatedProductIds = products.filter(p => p.supplier === supplier.id).map(p => p.id)
      setFormData({
        name: supplier.name,
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
        product_ids: associatedProductIds
      })
      setEditingSupplier(supplier)
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        product_ids: []
      })
      setEditingSupplier(null)
    }
    setIsModalOpen(true)
  }

  // Sauvegarder (Créer / Modifier le fournisseur)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Le nom du distributeur est requis.')
      return
    }

    try {
      setIsSaving(true)
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, formData)
        toast.success('Distributeur modifié avec succès !')
      } else {
        await createSupplier(formData)
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

  // Supprimer un distributeur
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

  // Obtenir les produits fournis par un fournisseur
  const getSupplierProducts = (supplierId: number) => {
    return products.filter(p => p.supplier === supplierId)
  }

  // Obtenir les alertes de stock critique pour les produits d'un fournisseur
  const getSupplierAlerts = (supplierId: number) => {
    return products
      .filter(p => p.supplier === supplierId && p.stock_item && parseFloat(p.stock_item.quantity_on_hand) <= parseFloat(p.stock_item.alert_threshold))
      .map(p => p.name)
  }

  // Filtrer les distributeurs
  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.address && s.address.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const supplierProducts = getSupplierProducts(s.id)
    const matchesProducts = supplierProducts.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesSearch || matchesProducts
  })

  // Gérer la modal de contact e-mail/WhatsApp
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

    // Récupérer les produits en stock critique pour ce fournisseur
    const criticalProducts = products.filter(p => p.supplier === supplier.id && p.stock_item && parseFloat(p.stock_item.quantity_on_hand) <= parseFloat(p.stock_item.alert_threshold))
    
    // Pré-remplir la liste des produits à commander avec les produits critiques
    const initialProducts: { name: string; quantity: string | number }[] = criticalProducts.map(p => ({
      name: p.name,
      quantity: 12 // Quantité par défaut (ex: un carton ou 12 bouteilles)
    }))

    // S'il n'y a pas de produits critiques, proposer une ligne de commande vide
    if (initialProducts.length === 0) {
      initialProducts.push({ name: '', quantity: '' })
    }

    const company = getCompany()
    const companyName = company ? company.name : 'Notre établissement'
    const defaultMessage = `Bonjour ${supplier.name},\n\nNous souhaitons passer commande pour les produits ci-dessous.\nMerci de nous confirmer la disponibilité et le délai de livraison.\n\nCordialement,\n${companyName}.`


    setContactSupplierData(supplier)
    setContactForm({
      message: defaultMessage,
      products: initialProducts
    })
    setIsContactModalOpen(true)
  }

  const handleAddProductLine = () => {
    setContactForm({
      ...contactForm,
      products: [...contactForm.products, { name: '', quantity: '' }]
    })
  }

  const handleRemoveProductLine = (index: number) => {
    const newProducts = [...contactForm.products]
    newProducts.splice(index, 1)
    setContactForm({
      ...contactForm,
      products: newProducts.length > 0 ? newProducts : [{ name: '', quantity: '' }]
    })
  }

  const handleProductLineChange = (index: number, field: 'name' | 'quantity', value: string) => {
    const newProducts = [...contactForm.products]
    newProducts[index] = {
      ...newProducts[index],
      [field]: value
    }
    setContactForm({
      ...contactForm,
      products: newProducts
    })
  }

  // Soumettre le contact (E-mail ou WhatsApp)
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactSupplierData) return

    const validProducts = contactForm.products.filter(p => p.name.trim() !== '')
    if (validProducts.length === 0) {
      toast.error('Veuillez ajouter au moins un produit à commander.')
      return
    }

    try {
      setIsSaving(true)

      if (contactMethod === 'email') {
        // Envoi E-mail via n8n (qui crée aussi la commande en arrière-plan)
        const contactPromise = contactSupplier(contactSupplierData.id, {
          message: contactForm.message,
          products: validProducts
        })

        toast.promise(contactPromise, {
          loading: "Envoi de l'e-mail et création de la commande...",
          success: "E-mail de contact envoyé et commande enregistrée !",
          error: "Erreur lors de l'envoi de l'e-mail."
        })

        await contactPromise
      } else {
        // Commande par WhatsApp
        // 1. Calculer le montant total estimé
        let totalAmount = 0
        for (const p_info of validProducts) {
          const prod = products.find(p => p.name === p_info.name)
          if (prod) {
            const qty = parseFloat(String(p_info.quantity)) || 0
            totalAmount += parseFloat(prod.price) * qty
          }
        }

        // 2. Enregistrer la commande locale dans le backend (en arrière-plan)
        createSupplierOrder({
          supplier: contactSupplierData.id,
          status: 'pending',
          products_list: validProducts,
          message: contactForm.message,
          total_amount: totalAmount
        }).then(() => {
          loadData()
        }).catch(err => {
          console.error("Erreur lors de l'enregistrement de la commande en base", err)
          toast.error("La commande n'a pas pu être enregistrée en base locale, mais le message WhatsApp a été préparé.")
        })

        // 3. Rediriger immédiatement vers WhatsApp (synchrone pour éviter le blocage du popup blocker)
        const cleanPhone = contactSupplierData.phone!.replace(/[^0-9]/g, '')
        const prodListStr = validProducts.map(p => `- ${p.name} (x${p.quantity})`).join('\n')
        const fullMessage = `${contactForm.message}\n\nProduits commandés :\n${prodListStr}`

        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(fullMessage)}`, '_blank')
      }

      setIsContactModalOpen(false)
      loadData()
    } catch (err) {
      console.error("Erreur de contact", err)
    } finally {
      setIsSaving(false)
    }
  }


  // Changer le statut d'une commande
  const handleUpdateOrderStatus = async (orderId: number, newStatus: 'pending' | 'shipped' | 'delivered') => {
    try {
      await updateSupplierOrderStatus(orderId, newStatus)
      toast.success('Statut de la commande mis à jour !')
      setActiveStatusMenu(null)
      loadData()
    } catch (err) {
      console.error('Erreur lors du changement de statut de la commande', err)
      toast.error('Erreur lors de la mise à jour.')
    }
  }

  // Supprimer individuellement une commande récente
  const handleDeleteOrder = async (orderId: number) => {
    if (confirm('Supprimer cette commande récente ?')) {
      try {
        await deleteSupplierOrder(orderId)
        toast.success('Commande supprimée avec succès !')
        setSelectedOrderIds(selectedOrderIds.filter(id => id !== orderId))
        loadData()
      } catch (err) {
        console.error('Erreur lors de la suppression de la commande', err)
        toast.error('Erreur lors de la suppression.')
      }
    }
  }

  // Supprimer en bloc les commandes sélectionnées
  const handleBulkDeleteOrders = async () => {
    if (selectedOrderIds.length === 0) return
    if (confirm(`Supprimer les ${selectedOrderIds.length} commandes sélectionnées ?`)) {
      try {
        await bulkDeleteSupplierOrders(selectedOrderIds)
        toast.success(`${selectedOrderIds.length} commandes supprimées avec succès !`)
        setSelectedOrderIds([])
        loadData()
      } catch (err) {
        console.error('Erreur lors de la suppression groupée des commandes', err)
        toast.error('Erreur lors de la suppression.')
      }
    }
  }

  const handleToggleSelectOrder = (orderId: number) => {
    if (selectedOrderIds.includes(orderId)) {
      setSelectedOrderIds(selectedOrderIds.filter(id => id !== orderId))
    } else {
      setSelectedOrderIds([...selectedOrderIds, orderId])
    }
  }

  const handleSelectAllOrders = () => {
    if (selectedOrderIds.length === orders.length) {
      setSelectedOrderIds([])
    } else {
      setSelectedOrderIds(orders.map(o => o.id))
    }
  }


  // Toggle de la sélection d'un produit fourni
  const handleToggleProduct = (productId: number) => {
    const isSelected = formData.product_ids.includes(productId)
    if (isSelected) {
      setFormData({
        ...formData,
        product_ids: formData.product_ids.filter(id => id !== productId)
      })
    } else {
      setFormData({
        ...formData,
        product_ids: [...formData.product_ids, productId]
      })
    }
  }

  // Regrouper les produits par catégorie
  const productsByCategory = products.reduce((acc: { [key: string]: any[] }, product) => {
    const categoryName = product.category_name || 'Autre'
    if (!acc[categoryName]) {
      acc[categoryName] = []
    }
    acc[categoryName].push(product)
    return acc
  }, {})

  if (isLoading) {
    return <Loader />
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
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
          style={{ 
            background: '#4f46e5',
            boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
          }}
        >
          <Plus className="w-4 h-4" />
          Ajouter un distributeur
        </button>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
        <input
          type="text"
          placeholder="Rechercher un distributeur ou un produit fourni..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
          style={{ 
            background: 'rgba(51, 65, 85, 0.5)',
            border: '1px solid #334155'
          }}
        />
      </div>

      {/* Liste des distributeurs */}
      {filteredSuppliers.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          Aucun distributeur trouvé.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((supplier) => {
            const supplierProducts = getSupplierProducts(supplier.id)
            const alerts = getSupplierAlerts(supplier.id)
            
            // Catégories uniques fournies
            const categories = Array.from(
              new Set(supplierProducts.map(p => p.category_name).filter(Boolean))
            )

            return (
              <div 
                key={supplier.id}
                className="rounded-xl border p-4 transition-all hover:border-primary-500 flex flex-col justify-between"
                style={{ 
                  background: '#1e293b',
                  borderColor: alerts.length > 0 ? '#ef4444' : '#334155'
                }}
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(99, 102, 241, 0.15)' }}
                      >
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
                          <span 
                            key={product.id}
                            className="text-[10px] px-2 py-0.5 rounded-full"
                            style={{ 
                              background: 'rgba(51, 65, 85, 0.5)',
                              color: '#94a3b8'
                            }}
                          >
                            {product.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {alerts.length > 0 && (
                    <div className="mt-3 p-2 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                      <p className="text-xs" style={{ color: '#fca5a5' }}>
                        ⚠️ Stock critique : {alerts.join(', ')}
                      </p>
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
                        color: alerts.length > 0 ? '#22c55e' : '#94a3b8'
                      }}
                    >
                      <Send className="w-3 h-3" />
                      {alerts.length > 0 ? 'Alerte WhatsApp' : 'Contacter'}
                    </button>

                    {activeContactMenu === supplier.id && (
                      <div 
                        className="absolute bottom-full left-0 mb-1 w-48 rounded-lg shadow-xl border p-1 z-10"
                        style={{ background: '#1e293b', borderColor: '#334155' }}
                      >
                        <button
                          onClick={() => {
                            setActiveContactMenu(null)
                            openContactModal(supplier, 'email')
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-white rounded hover:bg-slate-700 transition"
                        >
                          Par E-mail
                        </button>
                        <button
                          onClick={() => {
                            setActiveContactMenu(null)
                            openContactModal(supplier, 'whatsapp')
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-white rounded hover:bg-slate-700 transition"
                        >
                          Par WhatsApp
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => openModal(supplier)}
                    className="py-1.5 px-3 rounded text-xs font-medium transition flex items-center justify-center gap-1"
                    style={{ 
                      background: 'rgba(51, 65, 85, 0.3)',
                      color: '#94a3b8'
                    }}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(supplier.id)}
                    className="py-1.5 px-3 rounded text-xs font-medium transition flex items-center justify-center gap-1"
                    style={{ 
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#f87171'
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Commandes récentes */}
      <div 
        className="rounded-xl border p-4"
        style={{ background: '#1e293b', borderColor: '#334155' }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-white">Commandes récentes</h3>
          {selectedOrderIds.length > 0 && (
            <button
              onClick={handleBulkDeleteOrders}
              className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 text-xs font-semibold rounded-lg flex items-center gap-1 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Supprimer la sélection ({selectedOrderIds.length})
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          {orders.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm">
              Aucune commande enregistrée.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: '#334155' }}>
                  <th className="px-3 py-2 text-left w-10">
                    <input
                      type="checkbox"
                      checked={orders.length > 0 && selectedOrderIds.length === orders.length}
                      onChange={handleSelectAllOrders}
                      className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Date</th>
                  <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Fournisseur</th>
                  <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Produits</th>
                  <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Total</th>
                  <th className="px-3 py-2 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Statut</th>
                  <th className="px-3 py-2 text-right text-xs w-20" style={{ color: '#94a3b8' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const orderDate = order.created_at ? new Date(order.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric', month: '2-digit', day: '2-digit'
                  }) : 'ND'
                  
                  const productsSummary = order.products_list
                    .map(p => `${p.name} x${p.quantity}`)
                    .join(', ')

                  const totalValue = typeof order.total_amount === 'string' ? parseFloat(order.total_amount) : order.total_amount

                  return (
                    <tr key={order.id} className="border-b" style={{ borderColor: '#334155' }}>
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.includes(order.id)}
                          onChange={() => handleToggleSelectOrder(order.id)}
                          className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="px-3 py-2" style={{ color: '#94a3b8' }}>{orderDate}</td>
                      <td className="px-3 py-2 text-white font-medium">{order.supplier_name}</td>
                      <td className="px-3 py-2 text-slate-300 max-w-xs truncate" title={productsSummary}>
                        {productsSummary}
                      </td>
                      <td className="px-3 py-2 font-semibold" style={{ color: '#22c55e' }}>
                        {totalValue.toLocaleString('fr-FR')} F
                      </td>
                      <td className="px-3 py-2 relative">
                        <button
                          onClick={() => setActiveStatusMenu(activeStatusMenu === order.id ? null : order.id)}
                          className={`text-xs px-2 py-0.5 rounded-full font-medium transition cursor-pointer select-none ${
                            order.status === 'pending' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                            order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            'bg-green-500/20 text-green-400 border border-green-500/30'
                          }`}
                        >
                          {order.status === 'pending' ? 'En attente' :
                           order.status === 'shipped' ? 'Expédiée' : 'Livrée'}
                        </button>

                        {activeStatusMenu === order.id && (
                          <div 
                            className="absolute right-0 bottom-full mb-1 w-32 rounded-lg shadow-xl border p-1 z-10"
                            style={{ background: '#1e293b', borderColor: '#334155' }}
                          >
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'pending')}
                              className="w-full text-left px-2 py-1 text-xs text-orange-400 rounded hover:bg-slate-700 transition"
                            >
                              En attente
                            </button>
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                              className="w-full text-left px-2 py-1 text-xs text-blue-400 rounded hover:bg-slate-700 transition"
                            >
                              Expédiée
                            </button>
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                              className="w-full text-left px-2 py-1 text-xs text-green-400 rounded hover:bg-slate-700 transition"
                            >
                              Livrée
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-1 text-red-400 hover:bg-red-500/10 rounded-lg transition"
                          title="Supprimer la commande"
                        >
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

      {/* Modal d'ajout/modification de distributeur */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            style={{ 
              background: '#1e293b',
              border: '1px solid #334155'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">
                {editingSupplier ? 'Modifier le distributeur' : 'Ajouter un distributeur'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
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

              {/* Sélection des produits fournis */}
              <div>
                <label className="block text-xs mb-1.5" style={{ color: '#94a3b8' }}>
                  Produits fournis (cocher pour associer)
                </label>
                <div 
                  className="w-full rounded-lg border border-slate-700 p-3 max-h-48 overflow-y-auto space-y-3 bg-slate-900"
                >
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
                                  isChecked 
                                    ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-200' 
                                    : 'bg-slate-800/30 border-slate-800 text-slate-400 hover:border-slate-700'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleProduct(product.id)}
                                  className="hidden"
                                />
                                <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${
                                  isChecked ? 'bg-indigo-600 border-indigo-500' : 'border-slate-600'
                                }`}>
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
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium transition bg-transparent border border-slate-700 text-slate-400 hover:text-white"
                  disabled={isSaving}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition flex items-center justify-center gap-2"
                  style={{ 
                    background: '#4f46e5',
                    boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
                  }}
                  disabled={isSaving}
                >
                  {isSaving ? 'Enregistrement...' : editingSupplier ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de contact e-mail/WhatsApp interactive */}
      {isContactModalOpen && contactSupplierData && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setIsContactModalOpen(false)}
        >
          <div 
            className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            style={{ 
              background: '#1e293b',
              border: '1px solid #334155'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {contactMethod === 'email' ? 'Commander par E-mail' : 'Commander par WhatsApp'}
                </h2>
                <p className="text-xs text-indigo-400">
                  {contactMethod === 'email' ? contactSupplierData.email : contactSupplierData.phone}
                </p>
              </div>
              <button onClick={() => setIsContactModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleContactSubmit}>
              {/* Saisie dynamique des produits */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Produits à commander
                  </label>
                  <button
                    type="button"
                    onClick={handleAddProductLine}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Ajouter une ligne
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {contactForm.products.map((item, idx) => {
                    const supplierProducts = getSupplierProducts(contactSupplierData.id)
                    return (
                      <div key={idx} className="flex gap-2 items-center">
                        <select
                          value={item.name}
                          onChange={(e) => handleProductLineChange(idx, 'name', e.target.value)}
                          className="flex-1 rounded-lg px-3 py-2 text-white text-xs outline-none bg-slate-900 border border-slate-700 focus:border-indigo-500"
                          required
                        >
                          <option value="">-- Choisir un produit --</option>
                          {/* D'abord les produits associés à ce fournisseur */}
                          {supplierProducts.length > 0 && (
                            <optgroup label="Produits associés">
                              {supplierProducts.map(p => (
                                <option key={p.id} value={p.name}>{p.name}</option>
                              ))}
                            </optgroup>
                          )}
                          {/* Ensuite tous les autres produits pour flexibilité */}
                          <optgroup label="Autres produits du catalogue">
                            {products.filter(p => p.supplier !== contactSupplierData.id).map(p => (
                              <option key={p.id} value={p.name}>{p.name}</option>
                            ))}
                          </optgroup>
                        </select>

                        <input
                          type="text"
                          value={item.quantity}
                          onChange={(e) => handleProductLineChange(idx, 'quantity', e.target.value)}
                          className="w-20 rounded-lg px-3 py-2 text-white text-xs outline-none bg-slate-900 border border-slate-700 focus:border-indigo-500 text-center"
                          placeholder="Qté"
                          required
                        />

                        <button
                          type="button"
                          onClick={() => handleRemoveProductLine(idx)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition"
                          disabled={contactForm.products.length <= 1 && item.name === ''}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Message de contact prédéfini */}
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Message personnalisé</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition h-28 resize-none bg-slate-900 border border-slate-700 focus:border-indigo-500"
                  required
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium transition bg-transparent border border-slate-700 text-slate-400 hover:text-white"
                  disabled={isSaving}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition flex items-center justify-center gap-2"
                  style={{ 
                    background: contactMethod === 'email' ? '#22c55e' : '#25D366',
                    boxShadow: contactMethod === 'email' 
                      ? '0 10px 25px -5px rgba(34, 197, 94, 0.3)' 
                      : '0 10px 25px -5px rgba(37, 211, 102, 0.3)'
                  }}
                  disabled={isSaving}
                >
                  {isSaving ? 'Envoi...' : contactMethod === 'email' ? 'Envoyer la commande' : 'Envoyer par WhatsApp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}