'use client'

import { useState, useEffect } from 'react'
import {
  Settings, Save, Globe, Shield, Bell, Users, 
  DollarSign, Mail, Server, Database, Cloud, 
  Lock, Key, Eye, EyeOff, CheckCircle, XCircle,
  AlertTriangle, Zap, Target, Award, Gift, Crown,
  TrendingUp, TrendingDown, BarChart3, PieChart,
  Download, Upload, RefreshCw, Plus, Trash2,
  Edit, MoreVertical, ChevronDown, Activity,
  Phone,
  Send,
  Smartphone,
  X
} from 'lucide-react'

// Types
interface SystemSettings {
  general: {
    platformName: string
    platformUrl: string
    supportEmail: string
    supportPhone: string
    defaultCurrency: string
    defaultLanguage: string
    timezone: string
    maintenanceMode: boolean
  }
  security: {
    twoFactorRequired: boolean
    sessionTimeout: number
    maxLoginAttempts: number
    passwordPolicy: {
      minLength: number
      requireUppercase: boolean
      requireLowercase: boolean
      requireNumbers: boolean
      requireSpecialChars: boolean
    }
    ipWhitelist: string[]
    rateLimiting: {
      enabled: boolean
      maxRequests: number
      timeWindow: number
    }
  }
  payment: {
    provider: 'stripe' | 'paypal' | 'mobile_money' | 'other'
    currencies: string[]
    taxRate: number
    commissionRate: number
    paymentGateways: {
      id: string
      name: string
      enabled: boolean
      config: Record<string, string>
    }[]
  }
  subscription: {
    plans: {
      id: string
      name: string
      code: string
      price: number
      trialDays: number
      features: string[]
      isActive: boolean
    }[]
    trialPeriod: number
    autoRenewDefault: boolean
    gracePeriod: number
  }
  notification: {
    email: {
      smtpHost: string
      smtpPort: number
      smtpUser: string
      smtpPassword: string
      fromEmail: string
      fromName: string
      encryption: 'tls' | 'ssl' | 'none'
    }
    channels: {
      whatsapp: { enabled: boolean; apiKey: string; phoneNumber: string }
      telegram: { enabled: boolean; botToken: string; botUsername: string }
      sms: { enabled: boolean; provider: string; apiKey: string }
    }
    templates: {
      id: string
      name: string
      subject: string
      body: string
      type: 'welcome' | 'payment' | 'subscription' | 'alert' | 'custom'
    }[]
  }
  integration: {
    n8n: {
      webhookUrl: string
      apiKey: string
      enabled: boolean
    }
    google: {
      clientId: string
      clientSecret: string
      enabled: boolean
    }
    analytics: {
      enabled: boolean
      trackingId: string
    }
  }
  storage: {
    provider: 'local' | 's3' | 'r2'
    config: Record<string, string>
    maxFileSize: number
    allowedFileTypes: string[]
  }
}

// Données mockées
const mockSettings: SystemSettings = {
  general: {
    platformName: 'NOXIA',
    platformUrl: 'https://noxia.io',
    supportEmail: 'support@noxia.io',
    supportPhone: '+241 77 00 00 00',
    defaultCurrency: 'FCFA',
    defaultLanguage: 'fr',
    timezone: 'Africa/Libreville',
    maintenanceMode: false
  },
  security: {
    twoFactorRequired: false,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true
    },
    ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
    rateLimiting: {
      enabled: true,
      maxRequests: 100,
      timeWindow: 60
    }
  },
  payment: {
    provider: 'mobile_money',
    currencies: ['FCFA', 'EUR', 'USD'],
    taxRate: 18,
    commissionRate: 3,
    paymentGateways: [
      { id: 'stripe', name: 'Stripe', enabled: true, config: { apiKey: 'pk_test_...' } },
      { id: 'paypal', name: 'PayPal', enabled: false, config: { clientId: '...' } },
      { id: 'mobile_money', name: 'Mobile Money', enabled: true, config: { provider: 'Orange Money' } }
    ]
  },
  subscription: {
    plans: [
      { id: 'essai', name: 'Essai', code: 'TRIAL', price: 0, trialDays: 30, features: ['Toutes les fonctionnalités'], isActive: true },
      { id: 'starter', name: 'Starter', code: 'STARTER', price: 5000, trialDays: 0, features: ['Tableau de bord', 'Gestion des ventes', 'Gestion des stocks', 'Rapports basiques'], isActive: true },
      { id: 'premium', name: 'Premium', code: 'PREMIUM', price: 11000, trialDays: 0, features: ['Tout Starter +', 'Rapports avancés', 'Multi-utilisateurs', 'Multi-caisses', 'Assistant IA'], isActive: true },
      { id: 'business', name: 'Business', code: 'BUSINESS', price: 14000, trialDays: 0, features: ['Tout Premium +', 'Support prioritaire', 'Multi-établissements', 'API publique'], isActive: true }
    ],
    trialPeriod: 30,
    autoRenewDefault: true,
    gracePeriod: 5
  },
  notification: {
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: 'noreply@noxia.io',
      smtpPassword: '********',
      fromEmail: 'noreply@noxia.io',
      fromName: 'NOXIA',
      encryption: 'tls'
    },
    channels: {
      whatsapp: { enabled: true, apiKey: 'WA_API_KEY', phoneNumber: '+24166000000' },
      telegram: { enabled: true, botToken: 'TELEGRAM_BOT_TOKEN', botUsername: 'NOXIABot' },
      sms: { enabled: false, provider: 'Twilio', apiKey: 'TWILIO_API_KEY' }
    },
    templates: [
      { id: 'welcome', name: 'Bienvenue', subject: 'Bienvenue sur NOXIA', body: 'Bonjour {{name}}, bienvenue sur NOXIA !', type: 'welcome' },
      { id: 'payment', name: 'Confirmation de paiement', subject: 'Paiement confirmé', body: 'Votre paiement de {{amount}} a été confirmé.', type: 'payment' },
      { id: 'subscription_expiry', name: 'Expiration abonnement', subject: 'Votre abonnement expire', body: 'Votre abonnement expire dans {{days}} jours.', type: 'subscription' }
    ]
  },
  integration: {
    n8n: {
      webhookUrl: 'https://n8n.noxia.io/webhook',
      apiKey: 'N8N_API_KEY',
      enabled: true
    },
    google: {
      clientId: 'GOOGLE_CLIENT_ID',
      clientSecret: 'GOOGLE_CLIENT_SECRET',
      enabled: true
    },
    analytics: {
      enabled: true,
      trackingId: 'UA-XXXXXXXX-X'
    }
  },
  storage: {
    provider: 'r2',
    config: {
      endpoint: 'https://account.r2.cloudflarestorage.com',
      bucket: 'noxia-storage',
      accessKey: 'R2_ACCESS_KEY',
      secretKey: 'R2_SECRET_KEY'
    },
    maxFileSize: 10,
    allowedFileTypes: ['pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx']
  }
}

const planColors = {
  'Essai': '#22c55e',
  'Starter': '#818cf8',
  'Premium': '#f59e0b',
  'Business': '#8b5cf6'
}

export default function SuperAdminParametres() {
  const [settings, setSettings] = useState<SystemSettings>(mockSettings)
  const [activeTab, setActiveTab] = useState('general')
  const [isSaving, setIsSaving] = useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [newPlan, setNewPlan] = useState({ name: '', code: '', price: 0, trialDays: 0 })

  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setShowSaveSuccess(true)
      setTimeout(() => setShowSaveSuccess(false), 3000)
    }, 1500)
  }

  const handleAddPlan = () => {
    if (!newPlan.name.trim()) return
    const plan = {
      id: newPlan.code.toLowerCase(),
      name: newPlan.name,
      code: newPlan.code.toUpperCase(),
      price: newPlan.price,
      trialDays: newPlan.trialDays,
      features: [],
      isActive: true
    }
    setSettings({
      ...settings,
      subscription: {
        ...settings.subscription,
        plans: [...settings.subscription.plans, plan]
      }
    })
    setNewPlan({ name: '', code: '', price: 0, trialDays: 0 })
  }

  const handleDeletePlan = (planId: string) => {
    if (confirm(`Supprimer le plan "${planId}" ?`)) {
      setSettings({
        ...settings,
        subscription: {
          ...settings.subscription,
          plans: settings.subscription.plans.filter(p => p.id !== planId)
        }
      })
    }
  }

  return (
    <div className={`space-y-6 transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Paramètres Super Admin</h1>
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
          <CheckCircle className="w-4 h-4" style={{ color: '#22c55e' }} />
          <span className="text-sm" style={{ color: '#22c55e' }}>
            Paramètres enregistrés avec succès !
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'general', label: 'Général', icon: Globe },
          { id: 'security', label: 'Sécurité', icon: Shield },
          { id: 'payment', label: 'Paiements', icon: DollarSign },
          { id: 'subscription', label: 'Abonnements', icon: Crown },
          { id: 'notification', label: 'Notifications', icon: Bell },
          { id: 'integration', label: 'Intégrations', icon: Cloud },
          { id: 'storage', label: 'Stockage', icon: Database }
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
        {/* ===== GÉNÉRAL ===== */}
        {activeTab === 'general' && (
          <div className="rounded-xl border p-4" style={{ background: '#1e293b', borderColor: '#334155' }}>
            <h3 className="font-semibold text-sm text-white mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4" style={{ color: '#818cf8' }} />
              Configuration générale
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Nom de la plateforme</label>
                <input
                  type="text"
                  value={settings.general.platformName}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, platformName: e.target.value }
                  })}
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                  style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>URL de la plateforme</label>
                <input
                  type="url"
                  value={settings.general.platformUrl}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, platformUrl: e.target.value }
                  })}
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                  style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Email de support</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                  <input
                    type="email"
                    value={settings.general.supportEmail}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, supportEmail: e.target.value }
                    })}
                    className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
                    style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Téléphone de support</label>
                <input
                  type="text"
                  value={settings.general.supportPhone}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, supportPhone: e.target.value }
                  })}
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                  style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Devise par défaut</label>
                <select
                  value={settings.general.defaultCurrency}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, defaultCurrency: e.target.value }
                  })}
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                  style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                >
                  <option value="FCFA">FCFA</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Fuseau horaire</label>
                <select
                  value={settings.general.timezone}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, timezone: e.target.value }
                  })}
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                  style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                >
                  <option value="Africa/Libreville">Africa/Libreville</option>
                  <option value="Africa/Douala">Africa/Douala</option>
                  <option value="Africa/Abidjan">Africa/Abidjan</option>
                  <option value="Africa/Dakar">Africa/Dakar</option>
                  <option value="Europe/Paris">Europe/Paris</option>
                </select>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
              <label className="flex items-center gap-3 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.general.maintenanceMode}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, maintenanceMode: e.target.checked }
                  })}
                  className="accent-primary-500"
                />
                <span className="text-white">Mode maintenance</span>
                <span className="text-xs" style={{ color: '#94a3b8' }}>Désactive l'accès à la plateforme pour les utilisateurs</span>
              </label>
            </div>
          </div>
        )}

        {/* ===== SÉCURITÉ ===== */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            <div className="rounded-xl border p-4" style={{ background: '#1e293b', borderColor: '#334155' }}>
              <h3 className="font-semibold text-sm text-white mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4" style={{ color: '#818cf8' }} />
                Politique de sécurité
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Durée de session (minutes)</label>
                  <input
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                    })}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Tentatives de connexion max</label>
                  <input
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, maxLoginAttempts: parseInt(e.target.value) }
                    })}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                  />
                </div>
              </div>
              <div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                <label className="flex items-center gap-3 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.security.twoFactorRequired}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, twoFactorRequired: e.target.checked }
                    })}
                    className="accent-primary-500"
                  />
                  <span className="text-white">Authentification à deux facteurs obligatoire</span>
                </label>
              </div>
              <div className="mt-3">
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Politique de mot de passe</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                    <span className="text-xs text-white">Min. {settings.security.passwordPolicy.minLength} caractères</span>
                  </div>
                  {[
                    { key: 'requireUppercase', label: 'Majuscule' },
                    { key: 'requireLowercase', label: 'Minuscule' },
                    { key: 'requireNumbers', label: 'Chiffre' },
                    { key: 'requireSpecialChars', label: 'Caractère spécial' }
                  ].map((req) => (
                    <div key={req.key} className="p-2 rounded-lg text-center" style={{ background: settings.security.passwordPolicy[req.key as keyof typeof settings.security.passwordPolicy] ? 'rgba(34, 197, 94, 0.15)' : 'rgba(51, 65, 85, 0.3)' }}>
                      <span className="text-xs" style={{ color: settings.security.passwordPolicy[req.key as keyof typeof settings.security.passwordPolicy] ? '#22c55e' : '#64748b' }}>
                        {settings.security.passwordPolicy[req.key as keyof typeof settings.security.passwordPolicy] ? '✅' : '❌'} {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="rounded-xl border p-4" style={{ background: '#1e293b', borderColor: '#334155' }}>
              <h3 className="font-semibold text-sm text-white mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4" style={{ color: '#818cf8' }} />
                Rate Limiting
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Requêtes max par fenêtre</label>
                  <input
                    type="number"
                    value={settings.security.rateLimiting.maxRequests}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: {
                        ...settings.security,
                        rateLimiting: { ...settings.security.rateLimiting, maxRequests: parseInt(e.target.value) }
                      }
                    })}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Fenêtre de temps (secondes)</label>
                  <input
                    type="number"
                    value={settings.security.rateLimiting.timeWindow}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: {
                        ...settings.security,
                        rateLimiting: { ...settings.security.rateLimiting, timeWindow: parseInt(e.target.value) }
                      }
                    })}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                  />
                </div>
              </div>
              <div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                <label className="flex items-center gap-3 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.security.rateLimiting.enabled}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: {
                        ...settings.security,
                        rateLimiting: { ...settings.security.rateLimiting, enabled: e.target.checked }
                      }
                    })}
                    className="accent-primary-500"
                  />
                  <span className="text-white">Activer le rate limiting</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ===== PAIEMENTS ===== */}
        {activeTab === 'payment' && (
          <div className="rounded-xl border p-4" style={{ background: '#1e293b', borderColor: '#334155' }}>
            <h3 className="font-semibold text-sm text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4" style={{ color: '#818cf8' }} />
              Configuration des paiements
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Fournisseur de paiement</label>
                <select
                  value={settings.payment.provider}
                  onChange={(e) => setSettings({
                    ...settings,
                    payment: { ...settings.payment, provider: e.target.value as any }
                  })}
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                  style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                >
                  <option value="stripe">Stripe</option>
                  <option value="paypal">PayPal</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Taux de TVA (%)</label>
                <input
                  type="number"
                  value={settings.payment.taxRate}
                  onChange={(e) => setSettings({
                    ...settings,
                    payment: { ...settings.payment, taxRate: parseFloat(e.target.value) }
                  })}
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                  style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Commission (%)</label>
                <input
                  type="number"
                  value={settings.payment.commissionRate}
                  onChange={(e) => setSettings({
                    ...settings,
                    payment: { ...settings.payment, commissionRate: parseFloat(e.target.value) }
                  })}
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                  style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ===== ABONNEMENTS ===== */}
        {activeTab === 'subscription' && (
          <div className="space-y-4">
            <div className="rounded-xl border p-4" style={{ background: '#1e293b', borderColor: '#334155' }}>
              <h3 className="font-semibold text-sm text-white mb-4 flex items-center gap-2">
                <Crown className="w-4 h-4" style={{ color: '#818cf8' }} />
                Plans d'abonnement
              </h3>
              <div className="space-y-3">
                {settings.subscription.plans.map((plan) => (
                  <div key={plan.id} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: '#334155' }}>
                    <div className="flex items-center gap-3">
                      <span 
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ 
                          background: `${planColors[plan.name as keyof typeof planColors] || '#6366f1'}20`,
                          color: planColors[plan.name as keyof typeof planColors] || '#6366f1'
                        }}
                      >
                        {plan.name}
                      </span>
                      <span className="text-sm text-white">{plan.price.toLocaleString()} FCFA</span>
                      {plan.trialDays > 0 && (
                        <span className="text-xs" style={{ color: '#22c55e' }}>{plan.trialDays} jours d'essai</span>
                      )}
                      <span className={`text-xs ${plan.isActive ? 'text-green-400' : 'text-red-400'}`}>
                        {plan.isActive ? '✅ Actif' : '❌ Inactif'}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button className="p-1 rounded hover:bg-white/10" style={{ color: '#94a3b8' }}>
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeletePlan(plan.id)} className="p-1 rounded hover:bg-red-500/20" style={{ color: '#f87171' }}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg border border-dashed" style={{ borderColor: '#334155' }}>
                <p className="text-xs mb-2" style={{ color: '#94a3b8' }}>Ajouter un plan</p>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    placeholder="Nom"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                    className="flex-1 min-w-[120px] rounded-lg px-4 py-2 text-white text-sm outline-none transition"
                    style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                  />
                  <input
                    type="text"
                    placeholder="Code"
                    value={newPlan.code}
                    onChange={(e) => setNewPlan({ ...newPlan, code: e.target.value.toUpperCase() })}
                    className="w-24 rounded-lg px-4 py-2 text-white text-sm outline-none transition"
                    style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                  />
                  <input
                    type="number"
                    placeholder="Prix"
                    value={newPlan.price || ''}
                    onChange={(e) => setNewPlan({ ...newPlan, price: parseInt(e.target.value) || 0 })}
                    className="w-24 rounded-lg px-4 py-2 text-white text-sm outline-none transition"
                    style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                  />
                  <input
                    type="number"
                    placeholder="Jours essai"
                    value={newPlan.trialDays || ''}
                    onChange={(e) => setNewPlan({ ...newPlan, trialDays: parseInt(e.target.value) || 0 })}
                    className="w-24 rounded-lg px-4 py-2 text-white text-sm outline-none transition"
                    style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                  />
                  <button
                    onClick={handleAddPlan}
                    className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition"
                    style={{ background: '#4f46e5', boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)' }}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="rounded-xl border p-4" style={{ background: '#1e293b', borderColor: '#334155' }}>
              <h3 className="font-semibold text-sm text-white mb-4">Paramètres d'abonnement</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Période d'essai (jours)</label>
                  <input
                    type="number"
                    value={settings.subscription.trialPeriod}
                    onChange={(e) => setSettings({
                      ...settings,
                      subscription: { ...settings.subscription, trialPeriod: parseInt(e.target.value) }
                    })}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Période de grâce (jours)</label>
                  <input
                    type="number"
                    value={settings.subscription.gracePeriod}
                    onChange={(e) => setSettings({
                      ...settings,
                      subscription: { ...settings.subscription, gracePeriod: parseInt(e.target.value) }
                    })}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                  />
                </div>
                <div className="flex items-end p-3 rounded-lg" style={{ background: 'rgba(99, 102, 241, 0.05)' }}>
                  <label className="flex items-center gap-3 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.subscription.autoRenewDefault}
                      onChange={(e) => setSettings({
                        ...settings,
                        subscription: { ...settings.subscription, autoRenewDefault: e.target.checked }
                      })}
                      className="accent-primary-500"
                    />
                    <span className="text-white">Renouvellement auto par défaut</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== NOTIFICATIONS ===== */}
        {activeTab === 'notification' && (
          <div className="space-y-4">
            <div className="rounded-xl border p-4" style={{ background: '#1e293b', borderColor: '#334155' }}>
              <h3 className="font-semibold text-sm text-white mb-4 flex items-center gap-2">
                <Mail className="w-4 h-4" style={{ color: '#818cf8' }} />
                Configuration email
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Serveur SMTP</label>
                  <input
                    type="text"
                    value={settings.notification.email.smtpHost}
                    onChange={(e) => setSettings({
                      ...settings,
                      notification: {
                        ...settings.notification,
                        email: { ...settings.notification.email, smtpHost: e.target.value }
                      }
                    })}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Port SMTP</label>
                  <input
                    type="number"
                    value={settings.notification.email.smtpPort}
                    onChange={(e) => setSettings({
                      ...settings,
                      notification: {
                        ...settings.notification,
                        email: { ...settings.notification.email, smtpPort: parseInt(e.target.value) }
                      }
                    })}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Utilisateur SMTP</label>
                  <input
                    type="text"
                    value={settings.notification.email.smtpUser}
                    onChange={(e) => setSettings({
                      ...settings,
                      notification: {
                        ...settings.notification,
                        email: { ...settings.notification.email, smtpUser: e.target.value }
                      }
                    })}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Mot de passe SMTP</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={settings.notification.email.smtpPassword}
                      onChange={(e) => setSettings({
                        ...settings,
                        notification: {
                          ...settings.notification,
                          email: { ...settings.notification.email, smtpPassword: e.target.value }
                        }
                      })}
                      className="w-full rounded-lg px-4 py-2.5 pr-10 text-white text-sm outline-none transition"
                      style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: '#64748b' }}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-xl border p-4" style={{ background: '#1e293b', borderColor: '#334155' }}>
              <h3 className="font-semibold text-sm text-white mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4" style={{ color: '#818cf8' }} />
                Canaux de notification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: 'whatsapp', label: 'WhatsApp', icon: Smartphone },
                  { key: 'telegram', label: 'Telegram', icon: Send },
                  { key: 'sms', label: 'SMS', icon: Phone }
                ].map((channel) => {
                  const config = settings.notification.channels[channel.key as keyof typeof settings.notification.channels]
                  return (
                    <div key={channel.key} className="p-3 rounded-lg border" style={{ borderColor: '#334155' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white">{channel.label}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.enabled}
                            onChange={(e) => setSettings({
                              ...settings,
                              notification: {
                                ...settings.notification,
                                channels: {
                                  ...settings.notification.channels,
                                  [channel.key]: { ...config, enabled: e.target.checked }
                                }
                              }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all" style={{ background: config.enabled ? '#4f46e5' : '#334155' }} />
                        </label>
                      </div>
                      <input
                        type="text"
                        placeholder="Clé API"
                        value={(config as any).apiKey || ''}
                        onChange={(e) => setSettings({
                          ...settings,
                          notification: {
                            ...settings.notification,
                            channels: {
                              ...settings.notification.channels,
                              [channel.key]: { ...config, apiKey: e.target.value }
                            }
                          }
                        })}
                        className="w-full rounded-lg px-3 py-1.5 text-white text-xs outline-none transition"
                        style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===== INTÉGRATIONS ===== */}
        {activeTab === 'integration' && (
          <div className="rounded-xl border p-4" style={{ background: '#1e293b', borderColor: '#334155' }}>
            <h3 className="font-semibold text-sm text-white mb-4 flex items-center gap-2">
              <Cloud className="w-4 h-4" style={{ color: '#818cf8' }} />
              Intégrations
            </h3>
            <div className="space-y-4">
              <div className="p-3 rounded-lg border" style={{ borderColor: '#334155' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">n8n</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.integration.n8n.enabled}
                      onChange={(e) => setSettings({
                        ...settings,
                        integration: {
                          ...settings.integration,
                          n8n: { ...settings.integration.n8n, enabled: e.target.checked }
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all" style={{ background: settings.integration.n8n.enabled ? '#4f46e5' : '#334155' }} />
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Webhook URL"
                  value={settings.integration.n8n.webhookUrl}
                  onChange={(e) => setSettings({
                    ...settings,
                    integration: {
                      ...settings.integration,
                      n8n: { ...settings.integration.n8n, webhookUrl: e.target.value }
                    }
                  })}
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                  style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                />
                <input
                  type="password"
                  placeholder="Clé API"
                  value={settings.integration.n8n.apiKey}
                  onChange={(e) => setSettings({
                    ...settings,
                    integration: {
                      ...settings.integration,
                      n8n: { ...settings.integration.n8n, apiKey: e.target.value }
                    }
                  })}
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition mt-2"
                  style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                />
              </div>
              <div className="p-3 rounded-lg border" style={{ borderColor: '#334155' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">Google OAuth</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.integration.google.enabled}
                      onChange={(e) => setSettings({
                        ...settings,
                        integration: {
                          ...settings.integration,
                          google: { ...settings.integration.google, enabled: e.target.checked }
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all" style={{ background: settings.integration.google.enabled ? '#4f46e5' : '#334155' }} />
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Client ID"
                  value={settings.integration.google.clientId}
                  onChange={(e) => setSettings({
                    ...settings,
                    integration: {
                      ...settings.integration,
                      google: { ...settings.integration.google, clientId: e.target.value }
                    }
                  })}
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                  style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                />
                <input
                  type="password"
                  placeholder="Client Secret"
                  value={settings.integration.google.clientSecret}
                  onChange={(e) => setSettings({
                    ...settings,
                    integration: {
                      ...settings.integration,
                      google: { ...settings.integration.google, clientSecret: e.target.value }
                    }
                  })}
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition mt-2"
                  style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ===== STOCKAGE ===== */}
        {activeTab === 'storage' && (
          <div className="rounded-xl border p-4" style={{ background: '#1e293b', borderColor: '#334155' }}>
            <h3 className="font-semibold text-sm text-white mb-4 flex items-center gap-2">
              <Database className="w-4 h-4" style={{ color: '#818cf8' }} />
              Configuration du stockage
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Fournisseur de stockage</label>
                <select
                  value={settings.storage.provider}
                  onChange={(e) => setSettings({
                    ...settings,
                    storage: { ...settings.storage, provider: e.target.value as any }
                  })}
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                  style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                >
                  <option value="local">Local</option>
                  <option value="s3">AWS S3</option>
                  <option value="r2">Cloudflare R2</option>
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Taille max fichier (MB)</label>
                <input
                  type="number"
                  value={settings.storage.maxFileSize}
                  onChange={(e) => setSettings({
                    ...settings,
                    storage: { ...settings.storage, maxFileSize: parseInt(e.target.value) }
                  })}
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                  style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Types de fichiers autorisés</label>
              <div className="flex flex-wrap gap-2">
                {settings.storage.allowedFileTypes.map((type) => (
                  <span key={type} className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                    .{type}
                    <button
                      onClick={() => setSettings({
                        ...settings,
                        storage: {
                          ...settings.storage,
                          allowedFileTypes: settings.storage.allowedFileTypes.filter(t => t !== type)
                        }
                      })}
                      className="hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={() => {
                    const newType = prompt('Nouveau type de fichier (ex: pdf)')
                    if (newType) {
                      setSettings({
                        ...settings,
                        storage: {
                          ...settings.storage,
                          allowedFileTypes: [...settings.storage.allowedFileTypes, newType]
                        }
                      })
                    }
                  }}
                  className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: 'rgba(51, 65, 85, 0.3)', color: '#94a3b8' }}
                >
                  <Plus className="w-3 h-3" />
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}