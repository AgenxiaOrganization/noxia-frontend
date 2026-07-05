'use client'

import { useState } from 'react'
import {
  Truck, Plus, Search, Edit, Trash2, 
  Phone, Mail, Send, Package, AlertTriangle,
  Building2, User, MessageSquare
} from 'lucide-react'

// Données mockées
const mockSuppliers = [
  { 
    id: 1, 
    name: 'Brasserie du Gabon', 
    contact: 'M. Mbadinga', 
    phone: '+241 66 00 00 01', 
    email: 'commandes@brassgabon.ga', 
    whatsapp: '+241 66 00 00 01',
    products: ['Bière Castel 65cl', 'Bière Guinness 65cl'],
    categories: ['Boissons']
  },
  { 
    id: 2, 
    name: 'Distriboissons SA', 
    contact: 'Mme Obiang', 
    phone: '+241 66 00 00 02', 
    email: 'ventes@distriboissons.ga', 
    whatsapp: '+241 66 00 00 02',
    products: ['Whisky Jack Daniel\'s', 'Vodka Absolut', 'Champagne Moet'],
    categories: ['Boissons']
  },
  { 
    id: 3, 
    name: 'Vins & Spiritueux', 
    contact: 'M. Nguema', 
    phone: '+241 66 00 00 03', 
    email: 'contact@vinsspiritueux.ga', 
    whatsapp: '+241 66 00 00 03',
    products: ['Vin Rouge Bordeaux', 'Champagne Moet'],
    categories: ['Boissons']
  },
  { 
    id: 4, 
    name: 'Coca-Cola Gabon', 
    contact: 'Service Commercial', 
    phone: '+241 66 00 00 04', 
    email: 'commandes@cocacola.ga', 
    whatsapp: '+241 66 00 00 04',
    products: ['Coca-Cola 33cl', 'Jus d\'Orange'],
    categories: ['Boissons']
  },
  { 
    id: 5, 
    name: 'FoodPro Gabon', 
    contact: 'Mme Mba', 
    phone: '+241 66 00 00 05', 
    email: 'commandes@foodpro.ga', 
    whatsapp: '+241 66 00 00 05',
    products: ['Brochettes Poulet', 'Burger Classic'],
    categories: ['Nourriture']
  },
]

const mockOrders = [
  { id: 1, supplier: 'Brasserie du Gabon', items: 'Bière Castel x24, Guinness x12', status: 'En attente', date: '2026-06-28', total: 48000 },
  { id: 2, supplier: 'Distriboissons SA', items: 'Whisky Jack x6', status: 'Expédiée', date: '2026-06-27', total: 90000 },
  { id: 3, supplier: 'FoodPro Gabon', items: 'Brochettes x30, Burgers x20', status: 'Livrée', date: '2026-06-25', total: 52000 },
]

export default function SuppliersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<any>(null)
  const [selectedSupplier, setSelectedSupplier] = useState<number | null>(null)

  const filteredSuppliers = mockSuppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.products.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getStockStatus = (supplierId: number) => {
    // Simuler des alertes de stock pour les produits du fournisseur
    const alerts = {
      1: ['Bière Guinness 65cl'],
      2: ['Whisky Jack Daniel\'s', 'Champagne Moet'],
      3: ['Champagne Moet'],
      4: [],
      5: [],
    }
    return alerts[supplierId as keyof typeof alerts] || []
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Distributeurs</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            {mockSuppliers.length} fournisseurs • {mockOrders.filter(o => o.status === 'En attente').length} commandes en attente
          </p>
        </div>
        <button
          onClick={() => { setEditingSupplier(null); setIsModalOpen(true); }}
          className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition flex items-center gap-2"
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
          placeholder="Rechercher un distributeur..."
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.map((supplier) => {
          const alerts = getStockStatus(supplier.id)
          return (
            <div 
              key={supplier.id}
              className="rounded-xl border p-4 transition-all hover:border-primary-500"
              style={{ 
                background: '#1e293b',
                borderColor: alerts.length > 0 ? '#ef4444' : '#334155'
              }}
            >
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
                    <p className="text-xs" style={{ color: '#94a3b8' }}>{supplier.categories.join(', ')}</p>
                  </div>
                </div>
                {alerts.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1 bg-red-500/20 text-red-400">
                    <AlertTriangle className="w-3 h-3" />
                    {alerts.length}
                  </span>
                )}
              </div>

              <div className="space-y-1 text-sm">
                <p className="flex items-center gap-2" style={{ color: '#94a3b8' }}>
                  <User className="w-3 h-3" />
                  {supplier.contact}
                </p>
                <p className="flex items-center gap-2" style={{ color: '#94a3b8' }}>
                  <Phone className="w-3 h-3" />
                  {supplier.phone}
                </p>
                <p className="flex items-center gap-2" style={{ color: '#94a3b8' }}>
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{supplier.email}</span>
                </p>
              </div>

              <div className="mt-3 pt-3 border-t" style={{ borderColor: '#334155' }}>
                <p className="text-xs mb-1" style={{ color: '#94a3b8' }}>Produits fournis</p>
                <div className="flex flex-wrap gap-1">
                  {supplier.products.map((product, i) => (
                    <span 
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{ 
                        background: 'rgba(51, 65, 85, 0.5)',
                        color: '#94a3b8'
                      }}
                    >
                      {product}
                    </span>
                  ))}
                </div>
              </div>

              {alerts.length > 0 && (
                <div className="mt-2 p-2 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <p className="text-xs" style={{ color: '#fca5a5' }}>
                    ⚠️ Stock critique : {alerts.join(', ')}
                  </p>
                </div>
              )}

              <div className="flex gap-2 mt-3 pt-3 border-t" style={{ borderColor: '#334155' }}>
                <button
                  onClick={() => {
                    // Simulation d'envoi d'alerte
                    alert(`Alerte envoyée à ${supplier.name} (${supplier.whatsapp})\nProduits: ${alerts.join(', ') || 'Aucun produit critique'}`)
                  }}
                  className="flex-1 py-1.5 rounded text-xs font-medium transition flex items-center justify-center gap-1"
                  style={{ 
                    background: alerts.length > 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(51, 65, 85, 0.3)',
                    color: alerts.length > 0 ? '#22c55e' : '#64748b'
                  }}
                >
                  <Send className="w-3 h-3" />
                  {alerts.length > 0 ? 'Alerte WhatsApp' : 'Contacter'}
                </button>
                <button
                  onClick={() => { setEditingSupplier(supplier); setIsModalOpen(true); }}
                  className="flex-1 py-1.5 rounded text-xs font-medium transition flex items-center justify-center gap-1"
                  style={{ 
                    background: 'rgba(51, 65, 85, 0.3)',
                    color: '#94a3b8'
                  }}
                >
                  <Edit className="w-3 h-3" />
                  Modifier
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Commandes récentes */}
      <div 
        className="rounded-xl border p-4"
        style={{ background: '#1e293b', borderColor: '#334155' }}
      >
        <h3 className="font-semibold text-sm text-white mb-3">Commandes récentes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: '#334155' }}>
                <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Date</th>
                <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Fournisseur</th>
                <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Produits</th>
                <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Total</th>
                <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {mockOrders.map((order) => (
                <tr key={order.id} className="border-b" style={{ borderColor: '#334155' }}>
                  <td className="px-3 py-2" style={{ color: '#94a3b8' }}>{order.date}</td>
                  <td className="px-3 py-2 text-white">{order.supplier}</td>
                  <td className="px-3 py-2" style={{ color: '#94a3b8' }}>{order.items}</td>
                  <td className="px-3 py-2 font-semibold" style={{ color: '#22c55e' }}>
                    {order.total.toLocaleString()} F
                  </td>
                  <td className="px-3 py-2">
                    <span 
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        order.status === 'En attente' ? 'bg-orange-500/20 text-orange-400' :
                        order.status === 'Expédiée' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-green-500/20 text-green-400'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'ajout/modification */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            style={{ 
              background: '#1e293b',
              border: '1px solid #334155'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-white mb-4">
              {editingSupplier ? 'Modifier le distributeur' : 'Ajouter un distributeur'}
            </h2>

            <form className="space-y-3" onSubmit={(e) => {
              e.preventDefault()
              // TODO: Appel API
              setIsModalOpen(false)
            }}>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Nom du distributeur</label>
                <input
                  type="text"
                  defaultValue={editingSupplier?.name || ''}
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                  style={{ 
                    background: 'rgba(51, 65, 85, 0.5)',
                    border: '1px solid #334155'
                  }}
                  required
                />
              </div>

              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Personne contact</label>
                <input
                  type="text"
                  defaultValue={editingSupplier?.contact || ''}
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                  style={{ 
                    background: 'rgba(51, 65, 85, 0.5)',
                    border: '1px solid #334155'
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Téléphone</label>
                  <input
                    type="text"
                    defaultValue={editingSupplier?.phone || '+241 '}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{ 
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid #334155'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>WhatsApp</label>
                  <input
                    type="text"
                    defaultValue={editingSupplier?.whatsapp || '+241 '}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{ 
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid #334155'
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Email</label>
                <input
                  type="email"
                  defaultValue={editingSupplier?.email || ''}
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                  style={{ 
                    background: 'rgba(51, 65, 85, 0.5)',
                    border: '1px solid #334155'
                  }}
                />
              </div>

              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Produits fournis (séparés par des virgules)</label>
                <input
                  type="text"
                  defaultValue={editingSupplier?.products.join(', ') || ''}
                  placeholder="Bière Castel, Guinness, Whisky..."
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                  style={{ 
                    background: 'rgba(51, 65, 85, 0.5)',
                    border: '1px solid #334155'
                  }}
                />
              </div>

              <div className="flex gap-3 pt-3">
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
                  {editingSupplier ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}