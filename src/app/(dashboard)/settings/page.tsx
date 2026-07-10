'use client'

import { useState } from 'react'
import {
  Settings, Building2, MapPin, Phone, Mail,
  CreditCard, Shield, Bell, Globe, Users,
  Key, Save, Eye, EyeOff, CheckCircle, DollarSign,
  FileText, Upload, Check, X, Clock, AlertCircle,
  FileCheck, FileX, FileClock, Download
} from 'lucide-react'

// --- Données Mockées ---
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

// Documents mockés
const mockDocuments = [
  {
    id: 1,
    name: 'Registre de commerce',
    type: 'registre_commerce',
    status: 'en_attente',
    uploadDate: '2026-07-08',
    fileName: 'registre_commerce.pdf',
    size: '2.4 MB'
  },
  {
    id: 2,
    name: 'Attestation fiscale',
    type: 'attestation_fiscale',
    status: 'verifie',
    uploadDate: '2026-07-05',
    fileName: 'attestation_fiscale.pdf',
    size: '1.8 MB'
  },
  {
    id: 3,
    name: 'Licence d\'exploitation',
    type: 'licence_exploitation',
    status: 'rejete',
    uploadDate: '2026-07-01',
    fileName: 'licence_exploitation.pdf',
    size: '3.1 MB',
    rejectionReason: 'Document illisible, veuillez fournir une copie claire'
  },
  {
    id: 4,
    name: 'Pièce d\'identité du gérant',
    type: 'piece_identite',
    status: 'a_verifier',
    uploadDate: '2026-07-08',
    fileName: 'cni_gerant.pdf',
    size: '1.2 MB'
  },
]

const documentTypes = [
  { value: 'registre_commerce', label: 'Registre de commerce' },
  { value: 'attestation_fiscale', label: 'Attestation fiscale' },
  { value: 'licence_exploitation', label: "Licence d'exploitation" },
  { value: 'piece_identite', label: "Pièce d'identité du gérant" },
  { value: 'nif', label: 'NIF (Numéro d\'Identification Fiscale)' },
  { value: 'statuts', label: 'Statuts de l\'entreprise' },
  { value: 'autre', label: 'Autre' },
]

const statusConfig = {
  en_attente: {
    label: 'En attente',
    icon: Clock,
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.15)'
  },
  verifie: {
    label: 'Vérifié',
    icon: FileCheck,
    color: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.15)'
  },
  rejete: {
    label: 'Rejeté',
    icon: FileX,
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)'
  },
  a_verifier: {
    label: 'À vérifier',
    icon: FileClock,
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.15)'
  },
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [company, setCompany] = useState(mockCompany)
  const [isSaving, setIsSaving] = useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [documents, setDocuments] = useState(mockDocuments)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState('registre_commerce')

  // --- Gestion des documents ---
  const handleFileUpload = () => {
    if (!selectedFile) {
      alert('Veuillez sélectionner un fichier.')
      return
    }

    setIsUploading(true)
    setTimeout(() => {
      const typeLabel = documentTypes.find(t => t.value === documentType)?.label || documentType
      const newDoc = {
        id: Date.now(),
        name: typeLabel,
        type: documentType,
        status: 'en_attente',
        uploadDate: new Date().toISOString().split('T')[0],
        fileName: selectedFile.name,
        size: (selectedFile.size / 1024 / 1024).toFixed(1) + ' MB'
      }
      setDocuments([...documents, newDoc])
      setSelectedFile(null)
      setDocumentType('registre_commerce')
      setIsUploading(false)
      alert('📄 Document soumis avec succès ! Il sera vérifié par notre équipe.')
    }, 1500)
  }

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig]
    if (!config) return null
    const Icon = config.icon
    return (
      <span 
        className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
        style={{ background: config.bg, color: config.color }}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    )
  }

  // --- Gestion générale ---
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
      {/* HEADER */}
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

      {/* TABS */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'general', label: 'Général', icon: Building2 },
          { id: 'documents', label: 'Documents', icon: FileText },
          { id: 'finance', label: 'Finances', icon: CreditCard },
          { id: 'security', label: 'Sécurité', icon: Shield },
          { id: 'notifications', label: 'Notifications', icon: Bell },
        ].map(tab => {
          const Icon = tab.icon
          const isDocuments = tab.id === 'documents'
          const pendingDocs = documents.filter(d => d.status === 'en_attente' || d.status === 'a_verifier').length
          
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
              {isDocuments && pendingDocs > 0 && (
                <span 
                  className="w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold"
                  style={{ background: '#ef4444', color: '#fff' }}
                >
                  {pendingDocs}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* CONTENU DES ONGLETS */}

      {/* ===== GÉNÉRAL ===== */}
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

      {/* ===== DOCUMENTS ===== */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          {/* Upload de document */}
          <div 
            className="rounded-xl border p-4"
            style={{ 
              background: '#1e293b',
              borderColor: '#334155'
            }}
          >
            <h3 className="font-semibold text-sm text-white mb-3 flex items-center gap-2">
              <Upload className="w-4 h-4" style={{ color: '#818cf8' }} />
              Soumettre un document
            </h3>
            <p className="text-xs mb-3" style={{ color: '#94a3b8' }}>
              Déposez les documents de votre établissement pour vérification.
            </p>

            <div className="space-y-3">
              {/* Type de document - SELECT */}
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Type de document</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                  style={{ 
                    background: 'rgba(51, 65, 85, 0.5)',
                    border: '1px solid #334155'
                  }}
                >
                  {documentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Upload de fichier */}
              <div 
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition hover:border-primary-500"
                style={{ borderColor: '#334155' }}
                onClick={() => document.getElementById('fileInput')?.click()}
              >
                <input
                  id="fileInput"
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0])
                    }
                  }}
                  accept=".pdf,.png,.jpg,.jpeg"
                />
                <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: '#64748b' }} />
                <p className="text-sm" style={{ color: '#94a3b8' }}>
                  {selectedFile ? selectedFile.name : 'Cliquez pour sélectionner un fichier'}
                </p>
                <p className="text-xs" style={{ color: '#64748b' }}>
                  PDF, PNG, JPG (max 10 MB)
                </p>
              </div>

              <button
                onClick={handleFileUpload}
                disabled={isUploading || !selectedFile}
                className="w-full py-2.5 rounded-lg text-white text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ 
                  background: '#4f46e5',
                  boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
                }}
              >
                {isUploading ? (
                  'Envoi en cours...'
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Soumettre le document
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Liste des documents */}
          <div 
            className="rounded-xl border p-4"
            style={{ 
              background: '#1e293b',
              borderColor: '#334155'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-white">Documents soumis</h3>
              <span className="text-xs" style={{ color: '#94a3b8' }}>
                {documents.length} documents
              </span>
            </div>

            <div className="space-y-3">
              {documents.map((doc) => {
                const status = statusConfig[doc.status as keyof typeof statusConfig]
                const StatusIcon = status?.icon || FileText
                const typeLabel = documentTypes.find(t => t.value === doc.type)?.label || doc.type
                
                return (
                  <div 
                    key={doc.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg border"
                    style={{ 
                      background: 'rgba(51, 65, 85, 0.2)',
                      borderColor: doc.status === 'rejete' ? 'rgba(239, 68, 68, 0.2)' : '#334155'
                    }}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(99, 102, 241, 0.15)' }}
                      >
                        <FileText className="w-5 h-5" style={{ color: '#818cf8' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-white truncate">{doc.name}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                          <span className="text-xs" style={{ color: '#94a3b8' }}>
                            {doc.fileName} • {doc.size}
                          </span>
                          <span className="text-xs" style={{ color: '#64748b' }}>
                            {doc.uploadDate}
                          </span>
                          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(51,65,85,0.3)', color: '#94a3b8' }}>
                            {typeLabel}
                          </span>
                        </div>
                        {doc.status === 'rejete' && doc.rejectionReason && (
                          <p className="text-xs mt-1" style={{ color: '#ef4444' }}>
                            ⚠️ {doc.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-2 sm:mt-0">
                      {getStatusBadge(doc.status)}
                      <button
                        className="p-1.5 rounded hover:bg-white/10 transition"
                        style={{ color: '#94a3b8' }}
                        title="Télécharger"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}

              {documents.length === 0 && (
                <div className="text-center py-6">
                  <FileText className="w-12 h-12 mx-auto mb-2" style={{ color: '#334155' }} />
                  <p className="text-sm" style={{ color: '#64748b' }}>Aucun document soumis</p>
                </div>
              )}
            </div>

            {/* Légende des statuts */}
            <div className="mt-4 pt-4 border-t flex flex-wrap gap-4" style={{ borderColor: '#334155' }}>
              {Object.entries(statusConfig).map(([key, config]) => {
                const Icon = config.icon
                return (
                  <div key={key} className="flex items-center gap-1.5 text-xs">
                    <Icon className="w-3 h-3" style={{ color: config.color }} />
                    <span style={{ color: config.color }}>{config.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===== FINANCES ===== */}
      {activeTab === 'finance' && (
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
      )}

      {/* ===== SÉCURITÉ ===== */}
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

      {/* ===== NOTIFICATIONS ===== */}
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
  )
}