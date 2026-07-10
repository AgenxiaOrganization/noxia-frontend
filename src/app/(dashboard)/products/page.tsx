'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, Search, Edit, Trash2, Package, Coffee, Utensils, Sparkles, 
  X, Save, AlertCircle, Check, PlusCircle, MinusCircle 
} from 'lucide-react'

// --- Types ---
interface Product {
  id: number
  name: string
  category: string
  subCategory: string
  pricePerUnit: number
  unitsPerPackage: number
  stock: number
  unit: string
  supplierId: number | null
  minStock: number
  characteristics: Record<string, string>
}

interface Supplier {
  id: number
  name: string
}

// --- Données Mockées ---
const mockSuppliers: Supplier[] = [
  { id: 1, name: 'Brasserie du Gabon' },
  { id: 2, name: 'Distriboissons SA' },
  { id: 3, name: 'FoodPro Gabon' },
  { id: 4, name: 'Coca-Cola Gabon' },
]

// Caractéristiques prédéfinies par catégorie/sous-catégorie
const predefinedCharacteristics: Record<string, Record<string, string>> = {
  'biere': { 'Type': 'Lager', 'Contenance': '65cl', 'Taux d\'alcool': '5%' },
  'whisky': { 'Taux d\'alcool': '40%', 'Volume': '70cl', 'Origine': 'Écosse' },
  'vodka': { 'Taux d\'alcool': '37.5%', 'Volume': '70cl', 'Origine': 'France' },
  'champagne': { 'Type': 'Brut', 'Volume': '75cl', 'Région': 'Champagne' },
  'cola': { 'Type': 'Cola', 'Contenance': '33cl', 'Sucré': 'Oui' },
  'jus': { 'Type': 'Jus', 'Contenance': '33cl', 'Naturel': 'Oui' },
  'cocktail': { 'Type': 'Cocktail', 'Volume': 'Verre', 'Alcool': 'Oui' },
  'plats': { 'Type': 'Plat', 'Poids': '200g', 'Végétarien': 'Non' },
  'snacks': { 'Type': 'Snack', 'Poids': '150g', 'Végétarien': 'Oui' },
  'chicha': { 'Durée': '1h', 'Parfums': 'Multiples' },
  'default': { 'Type': 'Standard' }
}

const mockProducts: Product[] = [
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
    minStock: 20,
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
    minStock: 5,
    characteristics: { 'Taux d\'alcool': '40%', 'Volume': '70cl' } 
  },
  { 
    id: 3, 
    name: 'Coca-Cola 33cl', 
    category: 'boisson', 
    subCategory: 'casier', 
    pricePerUnit: 1000, 
    unitsPerPackage: 12, 
    stock: 120, 
    unit: 'unité',
    supplierId: 4,
    minStock: 30,
    characteristics: { 'Type': 'Cola', 'Contenance': '33cl' } 
  },
]

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // État du formulaire
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    category: 'boisson',
    subCategory: 'casier',
    pricePerUnit: 0,
    unitsPerPackage: 1,
    stock: 0,
    unit: 'unité',
    supplierId: null,
    minStock: 10,
    characteristics: {},
  })

  // États pour les champs flexibles
  const [charKey, setCharKey] = useState('')
  const [charValue, setCharValue] = useState('')
  const [newSupplierName, setNewSupplierName] = useState('')
  const [showNewSupplierInput, setShowNewSupplierInput] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers)

  const categories = ['all', ...new Set(products.map(p => p.category))]

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Déterminer les caractéristiques prédéfinies en fonction du nom du produit
  const getPredefinedCharacteristics = (name: string, category: string): Record<string, string> => {
    const lowerName = name.toLowerCase()
    
    if (lowerName.includes('biere') || lowerName.includes('castel') || lowerName.includes('guinness')) {
      return { ...predefinedCharacteristics['biere'] }
    }
    if (lowerName.includes('whisky') || lowerName.includes('jack')) {
      return { ...predefinedCharacteristics['whisky'] }
    }
    if (lowerName.includes('vodka') || lowerName.includes('absolut')) {
      return { ...predefinedCharacteristics['vodka'] }
    }
    if (lowerName.includes('champagne') || lowerName.includes('moet')) {
      return { ...predefinedCharacteristics['champagne'] }
    }
    if (lowerName.includes('coca') || lowerName.includes('cola')) {
      return { ...predefinedCharacteristics['cola'] }
    }
    if (lowerName.includes('jus') || lowerName.includes('orange')) {
      return { ...predefinedCharacteristics['jus'] }
    }
    if (lowerName.includes('cocktail') || lowerName.includes('mojito') || lowerName.includes('pina')) {
      return { ...predefinedCharacteristics['cocktail'] }
    }
    if (lowerName.includes('brochette') || lowerName.includes('poulet')) {
      return { ...predefinedCharacteristics['plats'] }
    }
    if (lowerName.includes('burger') || lowerName.includes('snack')) {
      return { ...predefinedCharacteristics['snacks'] }
    }
    if (lowerName.includes('chicha')) {
      return { ...predefinedCharacteristics['chicha'] }
    }
    
    return { ...predefinedCharacteristics['default'] }
  }

  // Mettre à jour les caractéristiques quand le nom change
  useEffect(() => {
    if (formData.name.trim()) {
      const newChars = getPredefinedCharacteristics(formData.name, formData.category)
      setFormData(prev => ({
        ...prev,
        characteristics: { ...newChars }
      }))
    }
  }, [formData.name, formData.category])

  // --- Logique du formulaire ---
  const openModal = (product: Product | null = null) => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        subCategory: product.subCategory || 'casier',
        pricePerUnit: product.pricePerUnit,
        unitsPerPackage: product.unitsPerPackage || 1,
        stock: product.stock,
        unit: product.unit,
        supplierId: product.supplierId,
        minStock: product.minStock || 10,
        characteristics: product.characteristics || {},
      })
      setEditingProduct(product)
    } else {
      setFormData({
        name: '',
        category: 'boisson',
        subCategory: 'casier',
        pricePerUnit: 0,
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
      if (!['casier', 'unite'].includes(formData.subCategory)) {
        setFormData(prev => ({ ...prev, subCategory: 'casier' }))
      }
    } else {
      setFormData(prev => ({ ...prev, subCategory: 'unite' }))
    }
  }, [formData.category])

  // Ajouter un fournisseur à la volée
  const addNewSupplier = () => {
    if (newSupplierName.trim()) {
      const newSupplier: Supplier = { id: Date.now(), name: newSupplierName.trim() }
      setSuppliers([...suppliers, newSupplier])
      setFormData({ ...formData, supplierId: newSupplier.id })
      setNewSupplierName('')
      setShowNewSupplierInput(false)
    }
  }

  // Sauvegarder le produit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    let totalStock = formData.stock
    if (formData.subCategory === 'casier') {
      totalStock = formData.unitsPerPackage * formData.stock
    }

    const productData: Product = {
      id: editingProduct ? editingProduct.id : Date.now(),
      name: formData.name,
      category: formData.category,
      subCategory: formData.subCategory,
      pricePerUnit: formData.pricePerUnit,
      unitsPerPackage: formData.subCategory === 'casier' ? formData.unitsPerPackage : 1,
      stock: totalStock,
      unit: formData.subCategory === 'casier' ? 'unité' : 'pièce',
      supplierId: formData.supplierId,
      minStock: formData.minStock,
      characteristics: formData.characteristics,
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

  // --- Rendu ---
  return (
    <div className="p-4 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Produits</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            {products.length} produits • {products.filter(p => p.stock <= p.minStock && p.stock >= 0).length} alertes stock
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
          const isLowStock = product.stock >= 0 && product.stock <= product.minStock
          const isOutOfStock = product.stock === 0
          const isInfinite = product.stock < 0

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
                      isInfinite ? 'bg-blue-500/20 text-blue-400' :
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
                    {isInfinite ? '∞' : product.stock} {product.unit}s
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

              {/* Sous-catégorie */}
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>
                    {formData.subCategory === 'casier' ? 'Nombre de casiers' : '-'}
                  </label>
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
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Seuil alerte</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid #334155'
                    }}
                  />
                </div>
              </div>

              {formData.subCategory === 'casier' && (
                <p className="text-xs" style={{ color: '#22c55e' }}>
                  Total en stock : {formData.unitsPerPackage * formData.stock} unités
                </p>
              )}

              {/* Fournisseur */}
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Fournisseur</label>
                <div className="flex gap-2">
                  <select
                    value={formData.supplierId || ''}
                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value ? parseInt(e.target.value) : null })}
                    className="flex-1 rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
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

              {/* Caractéristiques avec pré-remplissage */}
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