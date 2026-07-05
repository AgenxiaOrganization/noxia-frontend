'use client'

import { useState } from 'react'
import {
  Settings, Building2, MapPin, Phone, Mail,
  CreditCard, Shield, Bell, Globe, Users,
  Key, Save, Eye, EyeOff, CheckCircle
} from 'lucide-react'

// Données mockées
const mockCompany = {
  name: 'Bar Le Premium',
  address: 'Avenue de l\'Indépendance, Libreville',
  phone: '+241 77 00 00 00',
  email: 'contact@barlepremium.ga',
  currency: 'FCFA',
  country: 'Gabon',
  tva: 18,
  timezone: 'Africa/Libreville',
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [company, setCompany] = useState(mockCompany)
  const [isSaving, setIsSaving] = useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setShowSaveSuccess(true)
      setTimeout(() => setShowSaveSuccess(false), 3000)
    }, 1000)
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Paramètres</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            Gérez la configuration de votre établissement
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition flex items-center gap-2 disabled:opacity-50"
          style={{ 
            background: '#4f46e5',
            boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
          }}
        >
          {isSaving ? (
            'Enregistrement...'
          ) : (
            <>
              <Save className="w-4 h-4" />
              Enregistrer
            </>
          )}
        </button>
      </div>

      {/* Success notification */}
      {showSaveSuccess && (
        <div 
          className="rounded-lg p-3 flex items-center gap-2 animate-fade-in"
          style={{ 
            background: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.2)'
          }}
        >
          <CheckCircle className="w-4 h-4" style={{ color: '#22c55e' }} />
          <span className="text-sm" style={{ color: '#22c55e' }}>
            Paramètres enregistrés avec succès !
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'general', label: 'Général', icon: Building2 },
          { id: 'finance', label: 'Finances', icon: CreditCard },
          { id: 'security', label: 'Sécurité', icon: Shield },
          { id: 'notifications', label: 'Notifications', icon: Bell },
        ].map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id ? 'border' : 'border-transparent'
              }`}
              style={{
                background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.15)' : 'rgba(51, 65, 85, 0.3)',
                borderColor: activeTab === tab.id ? '#6366f1' : 'transparent',
                color: activeTab === tab.id ? '#818cf8' : '#94a3b8'
              }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Contenu des onglets */}
      <div className="space-y-4">
        {/* GÉNÉRAL */}
        {activeTab === 'general' && (
          <div 
            className="rounded-xl border p-4"
            style={{ 
              background: '#1e293b',
              borderColor: '#334155'
            }}
          >
            <h3 className="font-semibold text-sm text-white mb-4">Informations de l'établissement</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Nom de l'établissement</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                  <input
                    type="text"
                    value={company.name}
                    onChange={(e) => setCompany({ ...company, name: e.target.value })}
                    className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
                    style={{ 
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid #334155'
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Adresse</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                  <input
                    type="text"
                    value={company.address}
                    onChange={(e) => setCompany({ ...company, address: e.target.value })}
                    className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
                    style={{ 
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid #334155'
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                    <input
                      type="text"
                      value={company.phone}
                      onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                      className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
                      style={{ 
                        background: 'rgba(51, 65, 85, 0.5)',
                        border: '1px solid #334155'
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                    <input
                      type="email"
                      value={company.email}
                      onChange={(e) => setCompany({ ...company, email: e.target.value })}
                      className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
                      style={{ 
                        background: 'rgba(51, 65, 85, 0.5)',
                        border: '1px solid #334155'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Pays</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                    <select
                      value={company.country}
                      onChange={(e) => setCompany({ ...company, country: e.target.value })}
                      className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
                      style={{ 
                        background: 'rgba(51, 65, 85, 0.5)',
                        border: '1px solid #334155'
                      }}
                    >
                      <option value="Gabon">Gabon</option>
                      <option value="Cameroun">Cameroun</option>
                      <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                      <option value="Sénégal">Sénégal</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Fuseau horaire</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                    <select
                      value={company.timezone}
                      onChange={(e) => setCompany({ ...company, timezone: e.target.value })}
                      className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
                      style={{ 
                        background: 'rgba(51, 65, 85, 0.5)',
                        border: '1px solid #334155'
                      }}
                    >
                      <option value="Africa/Libreville">Africa/Libreville</option>
                      <option value="Africa/Douala">Africa/Douala</option>
                      <option value="Africa/Abidjan">Africa/Abidjan</option>
                      <option value="Africa/Dakar">Africa/Dakar</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FINANCES */}
        {activeTab === 'finance' && (
          <div className="space-y-4">
            <div 
              className="rounded-xl border p-4"
              style={{ 
                background: '#1e293b',
                borderColor: '#334155'
              }}
            >
              <h3 className="font-semibold text-sm text-white mb-4">Configuration financière</h3>
              
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Devise</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                      <select
                        value={company.currency}
                        onChange={(e) => setCompany({ ...company, currency: e.target.value })}
                        className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
                        style={{ 
                          background: 'rgba(51, 65, 85, 0.5)',
                          border: '1px solid #334155'
                        }}
                      >
                        <option value="FCFA">FCFA</option>
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>TVA (%)</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                      <input
                        type="number"
                        value={company.tva}
                        onChange={(e) => setCompany({ ...company, tva: parseInt(e.target.value) || 0 })}
                        className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
                        style={{ 
                          background: 'rgba(51, 65, 85, 0.5)',
                          border: '1px solid #334155'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg" style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>
                    💡 La TVA sera automatiquement calculée sur toutes les ventes et apparaîtra dans les rapports financiers.
                  </p>
                </div>
              </div>
            </div>

            <div 
              className="rounded-xl border p-4"
              style={{ 
                background: '#1e293b',
                borderColor: '#334155'
              }}
            >
              <h3 className="font-semibold text-sm text-white mb-4">Moyens de paiement</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { name: 'Espèces', icon: '💵', active: true },
                  { name: 'Mobile Money', icon: '📱', active: true },
                  { name: 'Carte bancaire', icon: '💳', active: false },
                ].map((method, i) => (
                  <div 
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg border"
                    style={{ 
                      background: method.active ? 'rgba(34, 197, 94, 0.05)' : 'rgba(51, 65, 85, 0.3)',
                      borderColor: method.active ? 'rgba(34, 197, 94, 0.2)' : '#334155'
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{method.icon}</span>
                      <span className="text-sm text-white">{method.name}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={method.active} className="sr-only peer" />
                      <div className="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all" style={{ background: method.active ? '#4f46e5' : '#334155' }} />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SÉCURITÉ */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            <div 
              className="rounded-xl border p-4"
              style={{ 
                background: '#1e293b',
                borderColor: '#334155'
              }}
            >
              <h3 className="font-semibold text-sm text-white mb-4">Sécurité du compte</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: '#334155' }}>
                  <div className="flex items-center gap-3">
                    <Key className="w-4 h-4" style={{ color: '#818cf8' }} />
                    <div>
                      <p className="text-sm text-white">Authentification à deux facteurs (2FA)</p>
                      <p className="text-xs" style={{ color: '#94a3b8' }}>Ajoutez une couche de sécurité supplémentaire</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all" style={{ background: '#334155' }} />
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: '#334155' }}>
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4" style={{ color: '#818cf8' }} />
                    <div>
                      <p className="text-sm text-white">Journal d'audit</p>
                      <p className="text-xs" style={{ color: '#94a3b8' }}>Conservez un historique de toutes les actions</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all" style={{ background: '#4f46e5' }} />
                  </label>
                </div>
              </div>
            </div>

            <div 
              className="rounded-xl border p-4"
              style={{ 
                background: '#1e293b',
                borderColor: '#334155'
              }}
            >
              <h3 className="font-semibold text-sm text-white mb-4">Changer le mot de passe</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Mot de passe actuel</label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                      style={{ 
                        background: 'rgba(51, 65, 85, 0.5)',
                        border: '1px solid #334155'
                      }}
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }}>
                      <EyeOff className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Nouveau mot de passe</label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                      style={{ 
                        background: 'rgba(51, 65, 85, 0.5)',
                        border: '1px solid #334155'
                      }}
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }}>
                      <EyeOff className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <button
                  className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition"
                  style={{ 
                    background: '#4f46e5',
                    boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  Changer le mot de passe
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div 
            className="rounded-xl border p-4"
            style={{ 
              background: '#1e293b',
              borderColor: '#334155'
            }}
          >
            <h3 className="font-semibold text-sm text-white mb-4">Préférences de notification</h3>
            
            <div className="space-y-3">
              {[
                { label: 'Alertes stock faible', description: 'Quand un produit atteint le seuil critique', default: true },
                { label: 'Rapports quotidiens', description: 'Résumé des ventes et performances', default: true },
                { label: 'Alertes de caisse', description: 'Écarts et fermetures de caisse', default: false },
                { label: 'Mises à jour du système', description: 'Nouvelles fonctionnalités et améliorations', default: true },
                { label: 'Commandes fournisseurs', description: 'Confirmation et suivi des commandes', default: true },
              ].map((notif, i) => (
                <div 
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg border"
                  style={{ borderColor: '#334155' }}
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4" style={{ color: '#818cf8' }} />
                    <div>
                      <p className="text-sm text-white">{notif.label}</p>
                      <p className="text-xs" style={{ color: '#94a3b8' }}>{notif.description}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={notif.default} className="sr-only peer" />
                    <div className="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all" style={{ background: notif.default ? '#4f46e5' : '#334155' }} />
                  </label>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
              <p className="text-xs" style={{ color: '#94a3b8' }}>
                📱 Les notifications sont envoyées via les canaux configurés dans la section Messagerie.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}