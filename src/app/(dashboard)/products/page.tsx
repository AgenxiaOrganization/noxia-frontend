'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, Search, Edit, Trash2, Package, Coffee, Utensils, Sparkles, 
  X, Save, AlertCircle, Check, PlusCircle, MinusCircle 
} from 'lucide-react'

// --- Données Mockées (à remplacer par l'API) ---
const mockSuppliers = [
  { id: 1, name: 'Brasserie du Gabon' },
  { id: 2, name: 'Distriboissons SA' },
  { id: 3, name: 'FoodPro Gabon' },
  { id: 4, name: 'Coca-Cola Gabon' },
]

const mockProducts = [
  { 
    id: 1, 
    name: 'Bière Castel 65cl', 
    category: 'boisson', 
    subCategory: 'casier', 
    pricePerUnit: 1500, 
    unitsPerPackage: 24, 
    stock: 48, 
    unit: 'unité',
    supplierId: 1, 
    characteristics: { 'Type': 'Lager', 'Contenance': '65cl' } 
  },
  { 
    id: 2, 
    name: 'Whisky Jack Daniel\'s', 
    category: 'boisson', 
    subCategory: 'unite', 
    pricePerUnit: 25000, 
    unitsPerPackage: 1, 
    stock: 8, 
    unit: 'bouteille',
    supplierId: 2, 
    characteristics: { 'Taux d\'alcool': '40%', 'Volume': '70cl' } 
  },
]

// --- Composant Principal ---
export default function ProductsPage() {
  const [products, setProducts] = useState(mockProducts)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)

  // État du formulaire
  const [formData, setFormData] = useState({
    name: '',
    category: 'boisson',
    subCategory: 'casier', // 'casier' ou 'unite'
    pricePerUnit: 0,
    unitsPerPackage: 1,
    stock: 0,
    supplierId: '',
    characteristics: {} as Record<string, string>,
  })
  
  // État pour les champs flexibles
  const [charKey, setCharKey] = useState('')
  const [charValue, setCharValue] = useState('')
  const [newSupplierName, setNewSupplierName] = useState('')
  const [showNewSupplierInput, setShowNewSupplierInput] = useState(false)

  const categories = ['all', ...new Set(products.map(p => p.category))]

  // Filtrer les produits
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // --- Logique du formulaire ---
  const openModal = (product: any = null) => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        subCategory: product.subCategory || 'casier',
        pricePerUnit: product.pricePerUnit,
        unitsPerPackage: product.unitsPerPackage || 1,
        stock: product.stock,
        supplierId: product.supplierId?.toString() || '',
        characteristics: product.characteristics || {},
      })
      setEditingProduct(product)
    } else {
      // Reset pour un nouveau produit
      setFormData({
        name: '',
        category: 'boisson',
        subCategory: 'casier',
        pricePerUnit: 0,
        unitsPerPackage: 1,
        stock: 0,
        supplierId: '',
        characteristics: {},
      })
      setEditingProduct(null)
      setCharKey('')
      setCharValue('')
    }
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
    if (formData.category === 'boisson') {
      // Si c'est une boisson, on garde le choix entre casier/unite
      if (!['casier', 'unite'].includes(formData.subCategory)) {
        setFormData(prev => ({ ...prev, subCategory: 'casier' }))
      }
    } else {
      // Si c'est nourriture ou service, on force "unite" (pas de casier)
      setFormData(prev => ({ ...prev, subCategory: 'unite' }))
    }
  }, [formData.category])

  // Ajouter un fournisseur à la volée
  const addNewSupplier = () => {
    if (newSupplierName.trim()) {
      // Simulation d'ajout
      const newSupplier = { id: Date.now(), name: newSupplierName.trim() }
      mockSuppliers.push(newSupplier)
      setFormData({ ...formData, supplierId: newSupplier.id.toString() })
      setNewSupplierName('')
      setShowNewSupplierInput(false)
    }
  }

  // Sauvegarder le produit (Création ou Mise à jour)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Calcul du stock total (si casier)
    const totalStock = formData.subCategory === 'casier' 
      ? formData.unitsPerPackage * formData.stock 
      : formData.stock

    const productData = {
      ...formData,
      id: editingProduct ? editingProduct.id : Date.now(),
      stock: totalStock,
      unit: formData.subCategory === 'casier' ? 'unité' : 'bouteille/portion',
      supplierId: parseInt(formData.supplierId) || null,
    }

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? productData : p))
    } else {
      setProducts([...products, productData])
    }
    
    setIsModalOpen(false)
  }

  // Supprimer un produit
  const deleteProduct = (id: number) => {
    if (confirm('Supprimer ce produit ?')) {
      setProducts(products.filter(p => p.id !== id))
    }
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Produits</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            {products.length} produits • {products.filter(p => p.stock <= 10).length} alertes stock
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition flex items-center gap-2"
          style={{ 
            background: '#4f46e5',
            boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
          }}
        >
          <Plus className="w-4 h-4" />
          Ajouter un produit
        </button>
      </div>

      {/* Filtres et recherche */}
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
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                selectedCategory === cat ? 'border' : 'border-transparent'
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

      {/* Liste des produits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredProducts.map((product) => {
          const isLowStock = product.stock <= 10 && product.stock > 0
          const isOutOfStock = product.stock === 0

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
                    {product.category} • {product.subCategory}
                  </p>
                </div>
                <span 
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isOutOfStock ? 'bg-red-500/20 text-red-400' :
                    isLowStock ? 'bg-orange-500/20 text-orange-400' : 
                    'bg-green-500/20 text-green-400'
                  }`}
                >
                  {isOutOfStock ? 'Rupture' : isLowStock ? 'Stock faible' : 'OK'}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm mb-2">
                <div>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Prix unitaire</p>
                  <p className="font-semibold text-white">{product.pricePerUnit.toLocaleString()} F</p>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Stock</p>
                  <p className={`font-semibold ${isLowStock ? 'text-orange-400' : 'text-white'}`}>
                    {product.stock} {product.unit}s
                  </p>
                </div>
              </div>

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

      {/* MODAL Ajout/Modification */}
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
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Catégorie *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                  style={{ 
                    background: 'rgba(51, 65, 85, 0.5)',
                    border: '1px solid #334155'
                  }}
                >
                  <option value="boisson">Boisson</option>
                  <option value="nourriture">Nourriture</option>
                  <option value="service">Service</option>
                </select>
              </div>

              {/* Sous-catégorie (Dynamique) */}
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>
                  Type de vente *
                </label>
                {formData.category === 'boisson' ? (
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
                    value={formData.subCategory}
                    disabled
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition opacity-60"
                    style={{ 
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid #334155'
                    }}
                    placeholder="Vente à l'unité (produit non boisson)"
                  />
                )}
                {formData.category !== 'boisson' && (
                  <p className="text-xs mt-1" style={{ color: '#64748b' }}>Les produits non-boissons sont vendus à l'unité.</p>
                )}
              </div>

              {/* Prix, Quantité, Stock */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Prix unitaire (F) *</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={formData.pricePerUnit}
                    onChange={(e) => setFormData({ ...formData, pricePerUnit: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{ 
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid #334155'
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>
                    {formData.subCategory === 'casier' ? 'Nb unités/casier' : 'Quantité'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formData.subCategory === 'casier' ? formData.unitsPerPackage : formData.stock}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0
                      if (formData.subCategory === 'casier') {
                        setFormData({ ...formData, unitsPerPackage: val })
                      } else {
                        setFormData({ ...formData, stock: val })
                      }
                    }}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
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
                    value={formData.subCategory === 'casier' ? formData.stock : 0}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0
                      if (formData.subCategory === 'casier') {
                        setFormData({ ...formData, stock: val })
                      }
                    }}
                    disabled={formData.subCategory !== 'casier'}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition disabled:opacity-40"
                    style={{ 
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid #334155'
                    }}
                  />
                  {formData.subCategory === 'casier' && (
                    <p className="text-xs mt-1" style={{ color: '#22c55e' }}>
                      Total en stock : {formData.unitsPerPackage * formData.stock} unités
                    </p>
                  )}
                </div>
              </div>

              {/* Fournisseur (Select + Ajout rapide) */}
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Fournisseur</label>
                <div className="flex gap-2">
                  <select
                    value={formData.supplierId}
                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                    className="flex-1 rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{ 
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid #334155'
                    }}
                  >
                    <option value="">Aucun</option>
                    {mockSuppliers.map(s => (
                      <option key={s.id} value={s.id.toString()}>{s.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewSupplierInput(!showNewSupplierInput)}
                    className="px-3 py-2.5 rounded-lg text-xs font-medium transition"
                    style={{ 
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: '#818cf8'
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {showNewSupplierInput && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={newSupplierName}
                      onChange={(e) => setNewSupplierName(e.target.value)}
                      placeholder="Nom du nouveau fournisseur..."
                      className="flex-1 rounded-lg px-4 py-2 text-white text-sm outline-none transition"
                      style={{ 
                        background: 'rgba(51, 65, 85, 0.5)',
                        border: '1px solid #334155'
                      }}
                    />
                    <button
                      type="button"
                      onClick={addNewSupplier}
                      className="px-4 py-2 rounded-lg text-white text-xs font-semibold transition"
                      style={{ 
                        background: '#22c55e',
                        boxShadow: '0 10px 25px -5px rgba(34, 197, 94, 0.3)'
                      }}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewSupplierInput(false)}
                      className="px-4 py-2 rounded-lg text-xs font-medium transition"
                      style={{ 
                        background: 'transparent',
                        border: '1px solid #334155',
                        color: '#94a3b8'
                      }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Champs flexibles (Caractéristiques) */}
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Caractéristiques</label>
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
                    className="px-3 py-2 rounded-lg text-xs font-medium transition"
                    style={{ 
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: '#818cf8'
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Liste des caractéristiques ajoutées */}
                <div className="flex flex-wrap gap-1">
                  {Object.entries(formData.characteristics).map(([key, value]) => (
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
                {Object.keys(formData.characteristics).length === 0 && (
                  <p className="text-xs mt-1" style={{ color: '#64748b' }}>Aucune caractéristique ajoutée</p>
                )}
              </div>

              {/* Boutons de validation */}
              <div className="flex gap-3 pt-4 border-t" style={{ borderColor: '#334155' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium transition"
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
                  className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition"
                  style={{ 
                    background: '#4f46e5',
                    boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  {editingProduct ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}