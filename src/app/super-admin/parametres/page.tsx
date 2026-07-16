'use client'

import { useState } from 'react'
import { Save, Globe, Shield, Bell, Users, Settings, DollarSign, Mail } from 'lucide-react'

export default function SuperAdminParametres() {
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Paramètres Super Admin</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            Configuration globale de la plateforme
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
          <Save className="w-4 h-4" />
          {isSaving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>

      {showSaveSuccess && (
        <div 
          className="rounded-lg p-3 flex items-center gap-2 animate-fade-in"
          style={{ 
            background: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.2)'
          }}
        >
          <span style={{ color: '#22c55e' }}>✅</span>
          <span className="text-sm" style={{ color: '#22c55e' }}>
            Paramètres enregistrés avec succès !
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Configuration générale */}
        <div 
          className="rounded-xl border p-4"
          style={{ 
            background: '#1e293b',
            borderColor: '#334155'
          }}
        >
          <h3 className="font-semibold text-sm text-white mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4" style={{ color: '#818cf8' }} />
            Configuration générale
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Nom de la plateforme</label>
              <input
                type="text"
                defaultValue="NOXIA"
                className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                style={{ 
                  background: 'rgba(51, 65, 85, 0.5)',
                  border: '1px solid #334155'
                }}
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Email de contact</label>
              <input
                type="email"
                defaultValue="support@noxia.io"
                className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                style={{ 
                  background: 'rgba(51, 65, 85, 0.5)',
                  border: '1px solid #334155'
                }}
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Devise par défaut</label>
              <select
                defaultValue="FCFA"
                className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
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
        </div>

        {/* Sécurité */}
        <div 
          className="rounded-xl border p-4"
          style={{ 
            background: '#1e293b',
            borderColor: '#334155'
          }}
        >
          <h3 className="font-semibold text-sm text-white mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" style={{ color: '#818cf8' }} />
            Sécurité
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 rounded-lg border" style={{ borderColor: '#334155' }}>
              <div>
                <p className="text-sm text-white">Authentification 2FA</p>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Obligatoire pour tous les admins</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all" style={{ background: '#4f46e5' }} />
              </label>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg border" style={{ borderColor: '#334155' }}>
              <div>
                <p className="text-sm text-white">Session max</p>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Durée de session utilisateur</p>
              </div>
              <select
                defaultValue="60"
                className="rounded-lg px-3 py-1 text-white text-sm outline-none transition"
                style={{ 
                  background: 'rgba(51, 65, 85, 0.5)',
                  border: '1px solid #334155'
                }}
              >
                <option value="30">30 min</option>
                <option value="60">60 min</option>
                <option value="120">120 min</option>
                <option value="480">480 min</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div 
          className="rounded-xl border p-4"
          style={{ 
            background: '#1e293b',
            borderColor: '#334155'
          }}
        >
          <h3 className="font-semibold text-sm text-white mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4" style={{ color: '#818cf8' }} />
            Notifications
          </h3>
          <div className="space-y-2">
            {[
              { label: 'Alerte stock critique', default: true },
              { label: 'Paiement échoué', default: true },
              { label: 'Nouvelle entreprise', default: true },
              { label: 'Expiration abonnement', default: true },
              { label: 'Logs de sécurité', default: false },
            ].map((notif, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg border" style={{ borderColor: '#334155' }}>
                <span className="text-sm text-white">{notif.label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={notif.default} className="sr-only peer" />
                  <div className="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all" style={{ background: notif.default ? '#4f46e5' : '#334155' }} />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div 
          className="rounded-xl border p-4"
          style={{ 
            background: '#1e293b',
            borderColor: '#334155'
          }}
        >
          <h3 className="font-semibold text-sm text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4" style={{ color: '#818cf8' }} />
            Plans d'abonnement
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Essai', price: 0, period: '30 jours' },
              { name: 'Starter', price: 5000, period: 'mois' },
              { name: 'Premium', price: 11000, period: 'mois' },
              { name: 'Business', price: 14000, period: 'mois' },
            ].map((plan, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg border" style={{ borderColor: '#334155' }}>
                <span className="text-sm text-white flex-1">{plan.name}</span>
                <input
                  type="number"
                  defaultValue={plan.price}
                  className="w-24 rounded-lg px-2 py-1 text-white text-sm outline-none transition"
                  style={{ 
                    background: 'rgba(51, 65, 85, 0.5)',
                    border: '1px solid #334155'
                  }}
                />
                <span className="text-xs" style={{ color: '#94a3b8' }}>FCFA</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}