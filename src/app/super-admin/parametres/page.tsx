'use client'

import { useState, useEffect } from 'react'
import {
  Settings, Save, Globe, Shield, Users, 
  DollarSign, Mail, Server, Cloud, 
  Lock, Key, Eye, EyeOff, CheckCircle, XCircle,
  AlertTriangle, Zap, Target, Award, Gift, Crown,
  TrendingUp, TrendingDown, BarChart3, PieChart,
  Download, Upload, RefreshCw, Plus, Trash2,
  Edit, MoreVertical, ChevronDown, Activity,
  Phone, Send, Smartphone, X, Copy, Check,
  Star, Sparkles, Rocket, Zap as ZapIcon
} from 'lucide-react'

// Types
interface Plan {
  id: string
  name: string
  code: string
  price: number
  trialDays: number
  features: string[]
  isActive: boolean
  description: string
  popular?: boolean
  color: string
}

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
    rateLimiting: {
      enabled: boolean
      maxRequests: number
      timeWindow: number
    }
  }
  subscription: {
    plans: Plan[]
    trialPeriod: number
    autoRenewDefault: boolean
    gracePeriod: number
    promoCode: {
      enabled: boolean
      code: string
      discount: number
      validUntil: string
      maxUses: number
      used: number
    }
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
    rateLimiting: {
      enabled: true,
      maxRequests: 100,
      timeWindow: 60
    }
  },
  subscription: {
    plans: [
      { 
        id: 'essai', 
        name: 'Essai', 
        code: 'TRIAL', 
        price: 0, 
        trialDays: 30, 
        features: ['Toutes les fonctionnalités'], 
        isActive: true, 
        description: 'Découvrez NOXIA en conditions réelles',
        popular: false,
        color: '#22c55e'
      },
      { 
        id: 'starter', 
        name: 'Starter', 
        code: 'STARTER', 
        price: 5000, 
        trialDays: 0, 
        features: ['Tableau de bord', 'Gestion des ventes', 'Gestion des stocks', 'Rapports basiques'], 
        isActive: true, 
        description: 'Pour les petits établissements',
        popular: false,
        color: '#818cf8'
      },
      { 
        id: 'premium', 
        name: 'Premium', 
        code: 'PREMIUM', 
        price: 11000, 
        trialDays: 0, 
        features: ['Tout Starter +', 'Rapports avancés', 'Multi-utilisateurs', 'Multi-caisses', 'Assistant IA'], 
        isActive: true, 
        description: 'Pour les établissements en croissance',
        popular: true,
        color: '#f59e0b'
      },
      { 
        id: 'business', 
        name: 'Business', 
        code: 'BUSINESS', 
        price: 14000, 
        trialDays: 0, 
        features: ['Tout Premium +', 'Support prioritaire', 'Multi-établissements', 'API publique'], 
        isActive: true, 
        description: 'Pour les groupes et franchises',
        popular: false,
        color: '#8b5cf6'
      }
    ],
    trialPeriod: 30,
    autoRenewDefault: true,
    gracePeriod: 5,
    promoCode: {
      enabled: true,
      code: 'NOXIA2026',
      discount: 20,
      validUntil: '2026-12-31',
      maxUses: 100,
      used: 37
    }
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
  }
}

const planColors = {
  'Essai': '#22c55e',
  'Starter': '#818cf8',
  'Premium': '#f59e0b',
  'Business': '#8b5cf6'
}

// Couleurs prédéfinies pour les plans
const presetColors = [
  '#22c55e', '#818cf8', '#f59e0b', '#8b5cf6', 
  '#ef4444', '#ec4899', '#3b82f6', '#14b8a6', '#f97316', '#6366f1'
]

export default function SuperAdminParametres() {
  const [settings, setSettings] = useState<SystemSettings>(mockSettings)
  const [activeTab, setActiveTab] = useState('general')
  const [isSaving, setIsSaving] = useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  // État pour l'édition d'un plan
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)
  const [newPlan, setNewPlan] = useState<Partial<Plan>>({
    name: '',
    code: '',
    price: 0,
    trialDays: 0,
    features: [],
    description: '',
    isActive: true,
    popular: false,
    color: '#6366f1'
  })
  const [newFeature, setNewFeature] = useState('')

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

  // --- Gestion des plans ---
  const openPlanModal = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan)
      setNewPlan({ ...plan })
    } else {
      setEditingPlan(null)
      setNewPlan({
        name: '',
        code: '',
        price: 0,
        trialDays: 0,
        features: [],
        description: '',
        isActive: true,
        popular: false,
        color: '#6366f1'
      })
    }
    setNewFeature('')
    setIsPlanModalOpen(true)
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setNewPlan({
        ...newPlan,
        features: [...(newPlan.features || []), newFeature.trim()]
      })
      setNewFeature('')
    }
  }

  const removeFeature = (index: number) => {
    setNewPlan({
      ...newPlan,
      features: (newPlan.features || []).filter((_, i) => i !== index)
    })
  }

  const savePlan = () => {
    if (!newPlan.name || !newPlan.code) return
    
    const planData: Plan = {
      id: editingPlan?.id || newPlan.code.toLowerCase(),
      name: newPlan.name,
      code: newPlan.code.toUpperCase(),
      price: newPlan.price || 0,
      trialDays: newPlan.trialDays || 0,
      features: newPlan.features || [],
      isActive: newPlan.isActive !== undefined ? newPlan.isActive : true,
      description: newPlan.description || '',
      popular: newPlan.popular || false,
      color: newPlan.color || '#6366f1'
    }

    let updatedPlans: Plan[]
    if (editingPlan) {
      updatedPlans = settings.subscription.plans.map(p => 
        p.id === editingPlan.id ? planData : p
      )
    } else {
      updatedPlans = [...settings.subscription.plans, planData]
    }

    setSettings({
      ...settings,
      subscription: {
        ...settings.subscription,
        plans: updatedPlans
      }
    })
    setIsPlanModalOpen(false)
    setEditingPlan(null)
  }

  const deletePlan = (planId: string) => {
    if (confirm(`Supprimer le plan "${settings.subscription.plans.find(p => p.id === planId)?.name}" ?`)) {
      setSettings({
        ...settings,
        subscription: {
          ...settings.subscription,
          plans: settings.subscription.plans.filter(p => p.id !== planId)
        }
      })
    }
  }

  const togglePlanActive = (planId: string) => {
    setSettings({
      ...settings,
      subscription: {
        ...settings.subscription,
        plans: settings.subscription.plans.map(p =>
          p.id === planId ? { ...p, isActive: !p.isActive } : p
        )
      }
    })
  }

  const togglePlanPopular = (planId: string) => {
    setSettings({
      ...settings,
      subscription: {
        ...settings.subscription,
        plans: settings.subscription.plans.map(p =>
          p.id === planId ? { ...p, popular: !p.popular } : p
        )
      }
    })
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + ' FCFA'
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
          { id: 'subscription', label: 'Abonnements', icon: Crown },
          { id: 'integration', label: 'Intégrations', icon: Cloud }
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

        {/* ===== ABONNEMENTS ===== */}
        {activeTab === 'subscription' && (
          <div className="space-y-4">
            {/* Plans */}
            <div className="rounded-xl border p-4" style={{ background: '#1e293b', borderColor: '#334155' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                  <Crown className="w-4 h-4" style={{ color: '#818cf8' }} />
                  Plans d'abonnement
                </h3>
                <button
                  onClick={() => openPlanModal()}
                  className="px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition flex items-center gap-1"
                  style={{ background: '#4f46e5', boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)' }}
                >
                  <Plus className="w-3 h-3" />
                  Ajouter un plan
                </button>
              </div>

              <div className="space-y-3">
                {settings.subscription.plans.map((plan) => (
                  <div key={plan.id} className="flex items-center justify-between p-3 rounded-lg border transition hover:border-primary-500" style={{ borderColor: plan.isActive ? '#334155' : 'rgba(51,65,85,0.3)' }}>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span 
                        className="text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
                        style={{ 
                          background: `${plan.color || planColors[plan.name as keyof typeof planColors] || '#6366f1'}20`,
                          color: plan.color || planColors[plan.name as keyof typeof planColors] || '#6366f1'
                        }}
                      >
                        {plan.popular && <Star className="w-3 h-3 fill-current" />}
                        {plan.name}
                      </span>
                      <span className="text-sm text-white">{formatCurrency(plan.price)}</span>
                      {plan.trialDays > 0 && (
                        <span className="text-xs" style={{ color: '#22c55e' }}>{plan.trialDays} jours d'essai</span>
                      )}
                      <span className={`text-xs ${plan.isActive ? 'text-green-400' : 'text-red-400'}`}>
                        {plan.isActive ? '✅ Actif' : '❌ Inactif'}
                      </span>
                      {plan.popular && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                          Populaire
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => togglePlanPopular(plan.id)} className="p-1 rounded hover:bg-white/10" style={{ color: '#f59e0b' }} title="Marquer comme populaire">
                        <Star className={`w-4 h-4 ${plan.popular ? 'fill-current' : ''}`} />
                      </button>
                      <button onClick={() => togglePlanActive(plan.id)} className="p-1 rounded hover:bg-white/10" style={{ color: plan.isActive ? '#f87171' : '#22c55e' }} title={plan.isActive ? 'Désactiver' : 'Activer'}>
                        {plan.isActive ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      </button>
                      <button onClick={() => openPlanModal(plan)} className="p-1 rounded hover:bg-white/10" style={{ color: '#94a3b8' }}>
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => deletePlan(plan.id)} className="p-1 rounded hover:bg-red-500/20" style={{ color: '#f87171' }}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Paramètres d'abonnement */}
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

            {/* Code promo */}
            <div className="rounded-xl border p-4" style={{ background: '#1e293b', borderColor: '#334155' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                  <Gift className="w-4 h-4" style={{ color: '#818cf8' }} />
                  Code promo
                </h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.subscription.promoCode.enabled}
                    onChange={(e) => setSettings({
                      ...settings,
                      subscription: {
                        ...settings.subscription,
                        promoCode: { ...settings.subscription.promoCode, enabled: e.target.checked }
                      }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all" style={{ background: settings.subscription.promoCode.enabled ? '#4f46e5' : '#334155' }} />
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Code</label>
                  <input
                    type="text"
                    value={settings.subscription.promoCode.code}
                    onChange={(e) => setSettings({
                      ...settings,
                      subscription: {
                        ...settings.subscription,
                        promoCode: { ...settings.subscription.promoCode, code: e.target.value.toUpperCase() }
                      }
                    })}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Réduction (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.subscription.promoCode.discount}
                    onChange={(e) => setSettings({
                      ...settings,
                      subscription: {
                        ...settings.subscription,
                        promoCode: { ...settings.subscription.promoCode, discount: parseInt(e.target.value) }
                      }
                    })}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Valable jusqu'au</label>
                  <input
                    type="date"
                    value={settings.subscription.promoCode.validUntil}
                    onChange={(e) => setSettings({
                      ...settings,
                      subscription: {
                        ...settings.subscription,
                        promoCode: { ...settings.subscription.promoCode, validUntil: e.target.value }
                      }
                    })}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Utilisations</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={settings.subscription.promoCode.used}
                        onChange={(e) => setSettings({
                          ...settings,
                          subscription: {
                            ...settings.subscription,
                            promoCode: { ...settings.subscription.promoCode, used: parseInt(e.target.value) }
                          }
                        })}
                        className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                        style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                      />
                      <span className="text-xs" style={{ color: '#64748b' }}>/ {settings.subscription.promoCode.maxUses}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSettings({
                      ...settings,
                      subscription: {
                        ...settings.subscription,
                        promoCode: { ...settings.subscription.promoCode, used: 0 }
                      }
                    })}
                    className="px-3 py-2.5 rounded-lg text-xs font-medium transition whitespace-nowrap"
                    style={{ background: 'rgba(51,65,85,0.3)', color: '#94a3b8' }}
                  >
                    Réinitialiser
                  </button>
                </div>
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
      </div>

      {/* MODAL PLAN */}
      {isPlanModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setIsPlanModalOpen(false)}
        >
          <div 
            className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            style={{ 
              background: '#1e293b',
              border: '1px solid #334155'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                {editingPlan ? 'Modifier le plan' : 'Ajouter un plan'}
              </h2>
              <button onClick={() => setIsPlanModalOpen(false)} className="p-1 rounded hover:bg-white/10" style={{ color: '#94a3b8' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Nom du plan *</label>
                  <input
                    type="text"
                    value={newPlan.name || ''}
                    onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Code *</label>
                  <input
                    type="text"
                    value={newPlan.code || ''}
                    onChange={(e) => setNewPlan({ ...newPlan, code: e.target.value.toUpperCase() })}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Prix (FCFA)</label>
                  <input
                    type="number"
                    value={newPlan.price || ''}
                    onChange={(e) => setNewPlan({ ...newPlan, price: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Jours d'essai</label>
                  <input
                    type="number"
                    value={newPlan.trialDays || ''}
                    onChange={(e) => setNewPlan({ ...newPlan, trialDays: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Couleur</label>
                  <select
                    value={newPlan.color || '#6366f1'}
                    onChange={(e) => setNewPlan({ ...newPlan, color: e.target.value })}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                  >
                    {presetColors.map(color => (
                      <option key={color} value={color}>
                        <span className="w-4 h-4 rounded-full inline-block" style={{ background: color }} />
                        {color}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Description</label>
                <input
                  type="text"
                  value={newPlan.description || ''}
                  onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                  style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                />
              </div>

              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Fonctionnalités</label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {(newPlan.features || []).map((feature, index) => (
                    <span key={index} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                      {feature}
                      <button onClick={() => removeFeature(index)} className="hover:text-red-400">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {(newPlan.features || []).length === 0 && (
                    <span className="text-xs" style={{ color: '#64748b' }}>Aucune fonctionnalité</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Ajouter une fonctionnalité..."
                    className="flex-1 rounded-lg px-4 py-2 text-white text-sm outline-none transition"
                    style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                    onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                  />
                  <button
                    onClick={addFeature}
                    className="px-3 py-2 rounded-lg text-white text-xs font-semibold transition"
                    style={{ background: '#4f46e5', boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)' }}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPlan.isActive !== undefined ? newPlan.isActive : true}
                    onChange={(e) => setNewPlan({ ...newPlan, isActive: e.target.checked })}
                    className="accent-primary-500"
                  />
                  <span className="text-white">Actif</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPlan.popular || false}
                    onChange={(e) => setNewPlan({ ...newPlan, popular: e.target.checked })}
                    className="accent-primary-500"
                  />
                  <span className="text-white">Populaire</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t" style={{ borderColor: '#334155' }}>
                <button
                  onClick={() => setIsPlanModalOpen(false)}
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
                  onClick={savePlan}
                  className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition"
                  style={{ 
                    background: '#4f46e5',
                    boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  {editingPlan ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}