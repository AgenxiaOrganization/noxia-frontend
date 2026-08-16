'use client'

import { useState, useEffect, useContext } from 'react'
import {
  Building2, MapPin, Phone, Mail, CreditCard, Globe, DollarSign,
  FileText, Upload, Download, Save, CheckCircle, Users, Trash2,
  Clock, FileCheck, FileX, Globe as GlobeIcon2,
} from 'lucide-react'
import { ServerContext } from '../layout'
import { createSuperAdminClient } from '@/lib/superAdminClient'
import {
  createCompaniesApi, uploadInstanceVerificationDocument,
  type VerificationDocument,
} from '@/lib/api/companies'
import { toast } from 'sonner'
import { countriesData, timezonesList, splitPhoneNumber } from '@/lib/countriesData'
import Loader from '@/components/ui/Loader'
import PlatformUsersSection from '@/components/super-admin/PlatformUsersSection'

// Reflete VerificationDocument.DocumentType (companies/models.py) — a garder
// synchronise avec le backend si de nouveaux types y sont ajoutes.
const documentTypes = [
  { value: 'rccm', label: 'Extrait RCCM (registre de commerce)' },
  { value: 'nif', label: 'Attestation NIF (immatriculation fiscale)' },
  { value: 'id_card', label: "Pièce d'identité du responsable (CNI/Passeport)" },
  { value: 'proof_of_address', label: 'Justificatif du siège social' },
  { value: 'operating_license', label: "Licence d'exploitation / patente" },
  { value: 'establishment_photo', label: "Photo de l'établissement" },
  { value: 'other', label: 'Autre document' },
]

const statusConfig = {
  pending: { label: 'En attente', icon: Clock, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  approved: { label: 'Approuvé', icon: FileCheck, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' },
  rejected: { label: 'Rejeté', icon: FileX, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
}

export default function SuperAdminParametres() {
  const { selectedServer, isGlobalMode, selectedCompany } = useContext(ServerContext)

  const [activeTab, setActiveTab] = useState('general')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [company, setCompany] = useState({
    id: 0, name: '', type: 'bar', address: '', phone: '', currency: 'XAF',
    email: '', country: 'Gabon', timezone: 'Africa/Libreville', tva: 18,
  })
  const [companyPhonePrefix, setCompanyPhonePrefix] = useState('+241')
  const [companyPhoneNumber, setCompanyPhoneNumber] = useState('')

  const [documents, setDocuments] = useState<VerificationDocument[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [deletingDocId, setDeletingDocId] = useState<number | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState('rccm')

  const getApi = () => createCompaniesApi(createSuperAdminClient(selectedServer.id, selectedCompany!.id))

  useEffect(() => {
    if (isGlobalMode || !selectedCompany) return
    let cancelled = false
    setIsLoading(true)
    setError(null)
    const api = getApi()
    Promise.all([api.getCompanyMe(), api.getVerificationDocuments()])
      .then(([fresh, docs]) => {
        if (cancelled || !fresh) return
        setCompany({
          id: fresh.id,
          name: fresh.name || '',
          type: fresh.type || 'bar',
          address: fresh.address || '',
          phone: fresh.phone || '',
          currency: fresh.currency || 'XAF',
          email: fresh.email || '',
          country: fresh.country || 'Gabon',
          timezone: fresh.timezone || 'Africa/Libreville',
          tva: fresh.tva || 18,
        })
        const cPhone = splitPhoneNumber(fresh.phone || '')
        setCompanyPhonePrefix(cPhone.prefix)
        setCompanyPhoneNumber(cPhone.number)
        setDocuments(docs)
      })
      .catch((e) => {
        if (cancelled) return
        console.error('Erreur chargement paramètres (super-admin)', e)
        setError('Impossible de charger les paramètres de cette entreprise.')
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [selectedServer.id, selectedCompany, isGlobalMode])

  const handleSave = async () => {
    if (!selectedCompany) return
    setIsSaving(true)
    try {
      const fullPhone = `${companyPhonePrefix} ${companyPhoneNumber}`.trim()
      const updatedComp = await getApi().updateCompanyMe({
        name: company.name,
        type: company.type,
        address: company.address,
        phone: fullPhone,
        currency: company.currency,
        country: company.country,
        timezone: company.timezone,
      })
      setCompany(prev => ({ ...prev, ...updatedComp }))
      toast.success('Établissement mis à jour avec succès !')
      setShowSaveSuccess(true)
      setTimeout(() => setShowSaveSuccess(false), 3000)
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile || !selectedCompany) {
      toast.error('Veuillez sélectionner un fichier.')
      return
    }
    setIsUploading(true)
    try {
      const doc = await uploadInstanceVerificationDocument(selectedServer.id, selectedCompany.id, documentType, selectedFile)
      setDocuments((prev) => [doc, ...prev.filter((d) => d.document_type !== doc.document_type)])
      setSelectedFile(null)
      setDocumentType('rccm')
      toast.success('Document soumis avec succès ! Il sera vérifié par notre équipe.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'envoi du document.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteDocument = async (doc: VerificationDocument) => {
    if (!confirm(`Supprimer le document "${documentTypes.find(t => t.value === doc.document_type)?.label ?? doc.document_type}" ?`)) return
    try {
      setDeletingDocId(doc.id)
      await getApi().deleteVerificationDocument(doc.id)
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id))
      toast.success('Document supprimé.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la suppression.')
    } finally {
      setDeletingDocId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig]
    if (!config) return null
    const Icon = config.icon
    return (
      <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: config.bg, color: config.color }}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    )
  }

  // La gestion des comptes plateforme n'est liee a aucune instance/entreprise
  // (contrairement aux 3 autres onglets) : elle reste accessible meme en mode
  // Global ou sans etablissement selectionne.
  const needsCompanyScope = activeTab !== 'plateforme'
  const showGlobalGuard = needsCompanyScope && isGlobalMode
  const showCompanyGuard = needsCompanyScope && !isGlobalMode && !selectedCompany

  const tabs = [
    { id: 'general', label: 'Général', icon: Building2 },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'finance', label: 'Finances', icon: CreditCard },
    { id: 'plateforme', label: 'Comptes plateforme', icon: Users },
  ]

  if (isLoading && needsCompanyScope) return <Loader />

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">
            Paramètres{activeTab === 'plateforme' ? '' : selectedCompany ? ` — ${selectedCompany.name}` : ''}
          </h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            {activeTab === 'plateforme' ? 'Gérez les comptes super-admin/admin du back-office' : 'Gérez la configuration de cet établissement'}
          </p>
        </div>
        {activeTab !== 'plateforme' && !showGlobalGuard && !showCompanyGuard && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition flex items-center gap-2 disabled:opacity-50"
            style={{ background: '#4f46e5', boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)' }}
          >
            {isSaving ? 'Enregistrement...' : (<><Save className="w-4 h-4" />Enregistrer</>)}
          </button>
        )}
      </div>

      {error && activeTab !== 'plateforme' && (
        <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>{error}</div>
      )}

      {showSaveSuccess && (
        <div className="rounded-lg p-3 flex items-center gap-2" style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
          <CheckCircle className="w-4 h-4" style={{ color: '#22c55e' }} />
          <span className="text-sm" style={{ color: '#22c55e' }}>Paramètres enregistrés avec succès !</span>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isDocuments = tab.id === 'documents'
          const pendingDocs = documents.filter(d => d.status === 'pending').length
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'border' : 'border-transparent'}`}
              style={{ background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.15)' : 'rgba(51, 65, 85, 0.3)', borderColor: activeTab === tab.id ? '#6366f1' : 'transparent', color: activeTab === tab.id ? '#818cf8' : '#94a3b8' }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {isDocuments && pendingDocs > 0 && (
                <span className="w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold" style={{ background: '#ef4444', color: '#fff' }}>{pendingDocs}</span>
              )}
            </button>
          )
        })}
      </div>

      {activeTab === 'plateforme' && <PlatformUsersSection />}

      {showGlobalGuard && (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
          <Globe className="w-10 h-10" style={{ color: '#334155' }} />
          <p className="text-sm" style={{ color: '#94a3b8' }}>Sélectionnez une instance dans le menu pour voir ses paramètres.</p>
        </div>
      )}

      {showCompanyGuard && (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
          <Building2 className="w-10 h-10" style={{ color: '#334155' }} />
          <p className="text-sm" style={{ color: '#94a3b8' }}>Sélectionnez une entreprise dans le menu pour voir ses paramètres.</p>
        </div>
      )}

      {activeTab === 'general' && selectedCompany && (
        <div className="rounded-xl border p-4" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <h3 className="font-semibold text-sm text-white mb-4">Informations de l'établissement</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Nom de l'établissement</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                <input type="text" value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition" style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }} />
              </div>
            </div>

            <div>
              <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Adresse</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                <input type="text" value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition" style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Téléphone</label>
                <div className="flex gap-2">
                  <select value={companyPhonePrefix} onChange={(e) => setCompanyPhonePrefix(e.target.value)} className="rounded-lg px-2 py-2.5 text-white text-sm outline-none transition shrink-0" style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155', width: '90px' }}>
                    {countriesData.map((c, index) => (
                      <option key={`${c.code}-${c.prefix}-${index}`} value={c.prefix}>{c.code} ({c.prefix})</option>
                    ))}
                  </select>
                  <div className="relative w-full">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                    <input type="text" value={companyPhoneNumber} onChange={(e) => setCompanyPhoneNumber(e.target.value)} placeholder="Ex: 77000000" className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition" style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }} />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                  <input type="email" value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition" style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Pays</label>
                <div className="relative">
                  <GlobeIcon2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                  <select
                    value={company.country}
                    onChange={(e) => {
                      const newCountry = e.target.value
                      const match = countriesData.find(c => c.name === newCountry)
                      setCompany({ ...company, country: newCountry, timezone: match ? match.timezone : company.timezone })
                    }}
                    className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
                    style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}
                  >
                    {countriesData.map((c, index) => <option key={`${c.code}-${index}`} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Fuseau horaire</label>
                <div className="relative">
                  <GlobeIcon2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                  <select value={company.timezone} onChange={(e) => setCompany({ ...company, timezone: e.target.value })} className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition" style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}>
                    {timezonesList.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && selectedCompany && (
        <div className="space-y-4">
          <div className="rounded-xl border p-4" style={{ background: '#1e293b', borderColor: '#334155' }}>
            <h3 className="font-semibold text-sm text-white mb-3 flex items-center gap-2">
              <Upload className="w-4 h-4" style={{ color: '#818cf8' }} />
              Soumettre un document
            </h3>
            <p className="text-xs mb-3" style={{ color: '#94a3b8' }}>Déposez les documents de cet établissement pour vérification.</p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Type de document</label>
                <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition" style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}>
                  {documentTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
              </div>

              <div
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition hover:border-primary-500"
                style={{ borderColor: '#334155' }}
                onClick={() => document.getElementById('saFileInput')?.click()}
              >
                <input id="saFileInput" type="file" className="hidden" onChange={(e) => { if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]) }} accept=".pdf,.png,.jpg,.jpeg" />
                <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: '#64748b' }} />
                <p className="text-sm" style={{ color: '#94a3b8' }}>{selectedFile ? selectedFile.name : 'Cliquez pour sélectionner un fichier'}</p>
                <p className="text-xs" style={{ color: '#64748b' }}>PDF, PNG, JPG (max 10 MB)</p>
              </div>

              <button
                onClick={handleFileUpload}
                disabled={isUploading || !selectedFile}
                className="w-full py-2.5 rounded-lg text-white text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: '#4f46e5', boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)' }}
              >
                {isUploading ? 'Envoi en cours...' : (<><Upload className="w-4 h-4" />Soumettre le document</>)}
              </button>
            </div>
          </div>

          <div className="rounded-xl border p-4" style={{ background: '#1e293b', borderColor: '#334155' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-white">Documents soumis</h3>
              <span className="text-xs" style={{ color: '#94a3b8' }}>{documents.length} documents</span>
            </div>

            <div className="space-y-3">
              {documents.map((doc) => {
                const typeLabel = doc.document_type_display || documentTypes.find(t => t.value === doc.document_type)?.label || doc.document_type
                const fileName = doc.file.split('/').pop() || doc.file
                return (
                  <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg border" style={{ background: 'rgba(51, 65, 85, 0.2)', borderColor: doc.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : '#334155' }}>
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
                        <FileText className="w-5 h-5" style={{ color: '#818cf8' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-white truncate">{typeLabel}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                          <span className="text-xs truncate" style={{ color: '#94a3b8' }}>{fileName}</span>
                          <span className="text-xs" style={{ color: '#64748b' }}>{new Date(doc.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                        {doc.status === 'rejected' && doc.rejection_reason && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{doc.rejection_reason}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2 sm:mt-0">
                      {getStatusBadge(doc.status)}
                      <a href={doc.file} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-white/10 transition" style={{ color: '#94a3b8' }} title="Télécharger"><Download className="w-4 h-4" /></a>
                      <button
                        onClick={() => handleDeleteDocument(doc)}
                        disabled={deletingDocId === doc.id}
                        className="p-1.5 rounded hover:bg-red-500/10 transition disabled:opacity-50"
                        style={{ color: '#f87171' }}
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
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

      {activeTab === 'finance' && selectedCompany && (
        <div className="rounded-xl border p-4" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <h3 className="font-semibold text-sm text-white mb-4">Configuration financière</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Devise</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                  <select value={company.currency} onChange={(e) => setCompany({ ...company, currency: e.target.value })} className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition" style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }}>
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
                  <input type="number" value={company.tva} onChange={(e) => setCompany({ ...company, tva: parseInt(e.target.value) || 0 })} className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition" style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155' }} />
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg" style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
              <p className="text-xs" style={{ color: '#94a3b8' }}>La TVA sera automatiquement calculée sur toutes les ventes et apparaîtra dans les rapports financiers.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
