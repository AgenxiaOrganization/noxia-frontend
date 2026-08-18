'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Settings, Building2, MapPin, Phone, Mail,
  CreditCard, Shield, Bell, Globe, Users,
  Key, Save, Eye, EyeOff, CheckCircle, DollarSign,
  FileText, Upload, Check, X, Clock, AlertCircle,
  FileCheck, FileX, FileClock, Download, User, Camera,
  BadgeCheck, Fingerprint
} from 'lucide-react'
import { getUser, getCompany, getMembership, saveSession } from '@/lib/auth'
import { getMe, updateMe, uploadMyPhoto } from '@/lib/api'
import {
  updateCompanyMe, getVerificationDocuments, deleteVerificationDocument,
  uploadVerificationDocument, uploadCompanyLogo, type VerificationDocument,
} from '@/lib/api/companies'
import { toast } from 'sonner'
import { countriesData, timezonesList, splitPhoneNumber } from '@/lib/countriesData'

// Reflete VerificationDocument.DocumentType (noxia-backend/companies/models.py)
// — a garder synchronise avec le backend si de nouveaux types y sont ajoutes.
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

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [company, setCompany] = useState({
    id: 0,
    name: '',
    type: 'bar',
    address: '',
    phone: '',
    currency: 'XAF',
    email: '',
    country: 'Gabon',
    timezone: 'Africa/Libreville',
    tva: 18,
  })
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [documents, setDocuments] = useState<VerificationDocument[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [deletingDocId, setDeletingDocId] = useState<number | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState('rccm')

  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: '',
    employeeId: '',
    company: '',
    companyId: '',
  })
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

  // States pour les indicatifs pays et numéros séparés
  const [companyPhonePrefix, setCompanyPhonePrefix] = useState('+241')
  const [companyPhoneNumber, setCompanyPhoneNumber] = useState('')
  const [profilePhonePrefix, setProfilePhonePrefix] = useState('+241')
  const [profilePhoneNumber, setProfilePhoneNumber] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tab = params.get('tab')
      if (tab) {
        setActiveTab(tab)
      }
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fresh = await getMe()
        setProfile({
          first_name: fresh.user.first_name || '',
          last_name: fresh.user.last_name || '',
          email: fresh.user.email || '',
          phone: fresh.user.phone || '',
          role: fresh.membership?.role || 'Employé',
          employeeId: fresh.membership?.activation_code || '---',
          company: fresh.company?.name || '---',
          companyId: fresh.company?.messaging_code || '---',
        })
        
        const pPhone = splitPhoneNumber(fresh.user.phone || '')
        setProfilePhonePrefix(pPhone.prefix)
        setProfilePhoneNumber(pPhone.number)
        setPhotoUrl(fresh.membership?.photo_profile || null)

        if (fresh.company) {
          setCompany({
            id: fresh.company.id,
            name: fresh.company.name || '',
            type: fresh.company.type || 'bar',
            address: fresh.company.address || '',
            phone: fresh.company.phone || '',
            currency: fresh.company.currency || 'XAF',
            email: fresh.company.email || '',
            country: fresh.company.country || 'Gabon',
            timezone: fresh.company.timezone || 'Africa/Libreville',
            tva: fresh.company.tva_rate ?? 18,
          })
          setLogoUrl(fresh.company.logo || null)

          const cPhone = splitPhoneNumber(fresh.company.phone || '')
          setCompanyPhonePrefix(cPhone.prefix)
          setCompanyPhoneNumber(cPhone.number)
        }
        
        if (fresh.membership) {
          const role = fresh.membership.role
          const comp = fresh.company
          let perms: string[] = []
          
          const defaultPerms: Record<string, string[]> = {
            administrateur: ['ventes', 'stock', 'rapports', 'parametres', 'employes'],
            responsable: ['ventes', 'stock', 'rapports', 'parametres'],
            gerant: ['ventes', 'stock', 'rapports'],
            caissier: ['ventes'],
            serveur: ['ventes'],
            magasinier: ['stock'],
            comptable: ['rapports']
          }
          
          if (comp && comp.role_permissions && comp.role_permissions[role]) {
            perms = comp.role_permissions[role]
          } else {
            perms = defaultPerms[role] || []
          }
          setUserPermissions(perms)
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchData()

    getVerificationDocuments()
      .then(setDocuments)
      .catch((err) => console.error('Erreur chargement documents', err))
  }, [])

  // Un type deja soumis (en attente ou approuve) ne doit plus pouvoir etre
  // resoumis — unique_together(company, document_type) cote backend. Un
  // document rejete reste re-televersable (voir VerificationDocumentSerializer.create
  // qui remet automatiquement le document rejete a PENDING).
  const availableDocumentTypes = useMemo(() => {
    const lockedTypes = new Set(
      documents.filter((d) => d.status !== 'rejected').map((d) => d.document_type)
    )
    return documentTypes.filter((t) => !lockedTypes.has(t.value))
  }, [documents])

  useEffect(() => {
    if (availableDocumentTypes.length === 0) return
    if (!availableDocumentTypes.some((t) => t.value === documentType)) {
      setDocumentType(availableDocumentTypes[0].value)
    }
  }, [availableDocumentTypes, documentType])

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const fullPhone = `${profilePhonePrefix} ${profilePhoneNumber}`.trim()
      const fresh = await updateMe({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: fullPhone,
      })
      
      const accessToken = localStorage.getItem('noxia_access') || ''
      const refreshToken = localStorage.getItem('noxia_refresh') || ''
      saveSession({
        status: 'authenticated',
        access: accessToken,
        refresh: refreshToken,
        user: fresh.user,
        company: fresh.company,
        membership: fresh.membership,
      })
      
      toast.success("✅ Profil mis à jour avec succès !")
    } catch (err: any) {
      toast.error(err.message || "Erreur de mise à jour")
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setIsUploadingLogo(true)
    try {
      const updatedComp = await uploadCompanyLogo(file)
      setLogoUrl(updatedComp.logo || null)

      const currentUser = getUser()
      const currentMembership = getMembership()
      const accessToken = localStorage.getItem('noxia_access') || ''
      const refreshToken = localStorage.getItem('noxia_refresh') || ''
      if (currentUser) {
        saveSession({
          status: 'authenticated',
          access: accessToken,
          refresh: refreshToken,
          user: currentUser,
          company: updatedComp,
          membership: currentMembership,
        })
      }

      toast.success('Logo mis à jour.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'envoi du logo.")
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setIsUploadingPhoto(true)
    try {
      const fresh = await uploadMyPhoto(file)
      setPhotoUrl(fresh.membership?.photo_profile || null)

      const accessToken = localStorage.getItem('noxia_access') || ''
      const refreshToken = localStorage.getItem('noxia_refresh') || ''
      saveSession({
        status: 'authenticated',
        access: accessToken,
        refresh: refreshToken,
        user: fresh.user,
        company: fresh.company,
        membership: fresh.membership,
      })

      toast.success('Photo de profil mise à jour.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'envoi de la photo.")
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  // --- Gestion des documents ---
  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error('Veuillez sélectionner un fichier.')
      return
    }
    setIsUploading(true)
    try {
      const doc = await uploadVerificationDocument(documentType, selectedFile)
      setDocuments((prev) => [doc, ...prev.filter((d) => d.document_type !== doc.document_type)])
      setSelectedFile(null)
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
      await deleteVerificationDocument(doc.id)
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
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const fullPhone = `${companyPhonePrefix} ${companyPhoneNumber}`.trim()
      const updatedComp = await updateCompanyMe({
        name: company.name,
        type: company.type,
        address: company.address,
        phone: fullPhone,
        email: company.email,
        currency: company.currency,
        country: company.country,
        timezone: company.timezone,
        tva_rate: company.tva,
      })

      setCompany(prev => ({
        ...prev,
        ...updatedComp,
        tva: updatedComp.tva_rate ?? prev.tva,
      }))
      setLogoUrl(updatedComp.logo || logoUrl)
      
      const currentUser = getUser()
      const currentMembership = getMembership()
      if (currentUser) {
        const accessToken = localStorage.getItem('noxia_access') || ''
        const refreshToken = localStorage.getItem('noxia_refresh') || ''
        saveSession({
          status: 'authenticated',
          access: accessToken,
          refresh: refreshToken,
          user: currentUser,
          company: updatedComp,
          membership: currentMembership,
        })
      }

      toast.success("✅ Établissement mis à jour avec succès !")
      setShowSaveSuccess(true)
      setTimeout(() => setShowSaveSuccess(false), 3000)
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la sauvegarde")
    } finally {
      setIsSaving(false)
    }
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
          { id: 'profile', label: 'Mon Profil', icon: User },
          { id: 'general', label: 'Général', icon: Building2 },
          { id: 'documents', label: 'Documents', icon: FileText },
          { id: 'finance', label: 'Finances', icon: CreditCard },
          { id: 'security', label: 'Sécurité', icon: Shield },
          { id: 'notifications', label: 'Notifications', icon: Bell },
        ].map(tab => {
          const Icon = tab.icon
          const isDocuments = tab.id === 'documents'
          const pendingDocs = documents.filter(d => d.status === 'pending').length
          
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

      {/* ===== MON PROFIL ===== */}
      {activeTab === 'profile' && (
        <div className="space-y-4 animate-fade-in">
          {/* Carte d'identité */}
          <div
            className="rounded-xl border p-5 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.12), #1e293b 55%)',
              borderColor: '#334155',
            }}
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="relative shrink-0">
                <div
                  className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center border-2"
                  style={{ borderColor: '#4f46e5', background: 'rgba(51, 65, 85, 0.5)' }}
                >
                  {photoUrl ? (
                    <img src={photoUrl} alt="Photo de profil" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10" style={{ color: '#64748b' }} />
                  )}
                  {isUploadingPhoto && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl" style={{ background: 'rgba(15, 23, 42, 0.7)' }}>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <label
                  htmlFor="profilePhotoInput"
                  className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition hover:opacity-90"
                  style={{ background: '#4f46e5', border: '2px solid #1e293b' }}
                  title="Changer la photo de profil"
                >
                  <Camera className="w-4 h-4 text-white" />
                </label>
                <input
                  id="profilePhotoInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                  disabled={isUploadingPhoto}
                />
              </div>

              <div className="flex-1 w-full text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <h2 className="text-lg font-bold text-white">
                    {profile.first_name || profile.last_name ? `${profile.first_name} ${profile.last_name}`.trim() : 'Mon profil'}
                  </h2>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize w-fit mx-auto sm:mx-0 flex items-center gap-1"
                    style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}
                  >
                    <BadgeCheck className="w-3 h-3" />
                    {profile.role}
                  </span>
                </div>
                <p className="text-sm mt-0.5" style={{ color: '#94a3b8' }}>{profile.email}</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
                  <div className="p-2.5 rounded-lg" style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
                    <p className="text-[11px] flex items-center justify-center sm:justify-start gap-1" style={{ color: '#64748b' }}>
                      <Building2 className="w-3 h-3" /> Établissement
                    </p>
                    <p className="text-sm font-medium text-white mt-0.5">{profile.company}</p>
                  </div>
                  <div className="p-2.5 rounded-lg" style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
                    <p className="text-[11px] flex items-center justify-center sm:justify-start gap-1" style={{ color: '#64748b' }}>
                      <Fingerprint className="w-3 h-3" /> ID Établissement
                    </p>
                    <code className="text-sm font-mono text-indigo-300 mt-0.5 block">{profile.companyId}</code>
                  </div>
                  {profile.role !== 'administrateur' && (
                    <div className="p-2.5 rounded-lg" style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
                      <p className="text-[11px] flex items-center justify-center sm:justify-start gap-1" style={{ color: '#64748b' }}>
                        <Key className="w-3 h-3" /> ID Employé
                      </p>
                      <code className="text-sm font-mono text-indigo-300 mt-0.5 block">{profile.employeeId}</code>
                    </div>
                  )}
                </div>
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
            <h3 className="font-semibold text-sm text-white mb-4">Informations personnelles</h3>
            
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Prénom</label>
                  <input
                    type="text"
                    value={profile.first_name}
                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{ 
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid #334155'
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Nom de famille</label>
                  <input
                    type="text"
                    value={profile.last_name}
                    onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{ 
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid #334155'
                    }}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Adresse email (non modifiable)</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none opacity-50 cursor-not-allowed"
                    style={{ 
                      background: 'rgba(51, 65, 85, 0.3)',
                      border: '1px solid #334155'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>Téléphone</label>
                  <div className="flex gap-2">
                    <select
                      value={profilePhonePrefix}
                      onChange={(e) => setProfilePhonePrefix(e.target.value)}
                      className="rounded-lg px-2 py-2.5 text-white text-sm outline-none transition shrink-0"
                      style={{ 
                        background: 'rgba(51, 65, 85, 0.5)',
                        border: '1px solid #334155',
                        width: '90px'
                      }}
                    >
                      {countriesData.map((c, index) => (
                        <option key={`${c.code}-${c.prefix}-${index}`} value={c.prefix}>
                          {c.code} ({c.prefix})
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={profilePhoneNumber}
                      onChange={(e) => setProfilePhoneNumber(e.target.value)}
                      placeholder="Ex: 77000000"
                      className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                      style={{ 
                        background: 'rgba(51, 65, 85, 0.5)',
                        border: '1px solid #334155'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition flex items-center gap-2 disabled:opacity-50"
                  style={{ 
                    background: '#4f46e5',
                    boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Enregistrement...' : 'Mettre à jour le profil'}
                </button>
              </div>
            </form>
          </div>

          <div>
            {/* Mes Permissions */}
            <div
              className="rounded-xl border p-4"
              style={{
                background: '#1e293b',
                borderColor: '#334155'
              }}
            >
              <h3 className="font-semibold text-sm text-white mb-3">Mes Habilitations & Permissions</h3>

              <div className="space-y-2">
                {[
                  { id: 'ventes', label: 'Ventes', desc: 'Accès à la caisse (POS) et encaissement' },
                  { id: 'stock', label: 'Stock', desc: "Consultation et ajustement de l'inventaire" },
                  { id: 'rapports', label: 'Rapports', desc: 'Accès aux statistiques financières et rapports' },
                  { id: 'parametres', label: 'Paramètres', desc: "Configuration générale et documents d'établissement" },
                  { id: 'employes', label: 'Employés', desc: "Gestion des employés et de leurs habilitations" },
                ].map(perm => {
                  const hasPerm = userPermissions.includes(perm.id) || profile.role === 'administrateur'
                  return (
                    <div 
                      key={perm.id} 
                      className="flex items-center justify-between p-2.5 rounded-lg border text-xs"
                      style={{ 
                        borderColor: '#334155',
                        background: hasPerm ? 'rgba(34, 197, 94, 0.03)' : 'rgba(239, 68, 68, 0.02)'
                      }}
                    >
                      <div className="space-y-0.5">
                        <span className="font-semibold block text-white">{perm.label}</span>
                        <span className="block text-[10px]" style={{ color: '#64748b' }}>{perm.desc}</span>
                      </div>
                      <span 
                        className={`px-2.5 py-0.5 rounded-full font-semibold ${
                          hasPerm ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {hasPerm ? 'Autorisé' : 'Refusé'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

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

          <div className="flex items-center gap-4 mb-5">
            <div className="relative shrink-0">
              <div
                className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center border-2"
                style={{ borderColor: '#4f46e5', background: 'rgba(51, 65, 85, 0.5)' }}
              >
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo de l'établissement" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-8 h-8" style={{ color: '#64748b' }} />
                )}
                {isUploadingLogo && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl" style={{ background: 'rgba(15, 23, 42, 0.7)' }}>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <label
                htmlFor="companyLogoInput"
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition hover:opacity-90"
                style={{ background: '#4f46e5', border: '2px solid #1e293b' }}
                title="Changer le logo de l'établissement"
              >
                <Camera className="w-3.5 h-3.5 text-white" />
              </label>
              <input
                id="companyLogoInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
                disabled={isUploadingLogo}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Logo de l'établissement</p>
              <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                JPG, PNG ou WEBP, 5 Mo maximum.
              </p>
            </div>
          </div>

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
                <div className="flex gap-2">
                  <select
                    value={companyPhonePrefix}
                    onChange={(e) => setCompanyPhonePrefix(e.target.value)}
                    className="rounded-lg px-2 py-2.5 text-white text-sm outline-none transition shrink-0"
                    style={{ 
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid #334155',
                      width: '90px'
                    }}
                  >
                    {countriesData.map((c, index) => (
                      <option key={`${c.code}-${c.prefix}-${index}`} value={c.prefix}>
                        {c.code} ({c.prefix})
                      </option>
                    ))}
                  </select>
                  <div className="relative w-full">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
                    <input
                      type="text"
                      value={companyPhoneNumber}
                      onChange={(e) => setCompanyPhoneNumber(e.target.value)}
                      placeholder="Ex: 77000000"
                      className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
                      style={{ 
                        background: 'rgba(51, 65, 85, 0.5)',
                        border: '1px solid #334155'
                      }}
                    />
                  </div>
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
                    onChange={(e) => {
                      const newCountry = e.target.value
                      const match = countriesData.find(c => c.name === newCountry)
                      setCompany({
                        ...company,
                        country: newCountry,
                        timezone: match ? match.timezone : company.timezone
                      })
                    }}
                    className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
                    style={{ 
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid #334155'
                    }}
                  >
                    {countriesData.map((c, index) => (
                      <option key={`${c.code}-${index}`} value={c.name}>
                        {c.name}
                      </option>
                    ))}
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
                    {timezonesList.map(tz => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
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
                {availableDocumentTypes.length > 0 ? (
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition"
                    style={{
                      background: 'rgba(51, 65, 85, 0.5)',
                      border: '1px solid #334155'
                    }}
                  >
                    {availableDocumentTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p
                    className="text-sm rounded-lg px-4 py-2.5 flex items-center gap-2"
                    style={{ background: 'rgba(34, 197, 94, 0.08)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.2)' }}
                  >
                    <Check className="w-4 h-4" />
                    Tous les types de documents ont déjà été soumis.
                  </p>
                )}
              </div>

              {/* Upload de fichier */}
              {availableDocumentTypes.length > 0 && (
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
              )}

              {availableDocumentTypes.length > 0 && (
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
              )}
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
                const typeLabel = doc.document_type_display || documentTypes.find(t => t.value === doc.document_type)?.label || doc.document_type
                const fileName = doc.file.split('/').pop() || doc.file
                return (
                  <div
                    key={doc.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg border"
                    style={{
                      background: 'rgba(51, 65, 85, 0.2)',
                      borderColor: doc.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : '#334155'
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
                        <p className="font-medium text-sm text-white truncate">{typeLabel}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                          <span className="text-xs truncate" style={{ color: '#94a3b8' }}>
                            {fileName}
                          </span>
                          <span className="text-xs" style={{ color: '#64748b' }}>
                            {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        {doc.status === 'rejected' && doc.rejection_reason && (
                          <p className="text-xs mt-1" style={{ color: '#ef4444' }}>
                            ⚠️ {doc.rejection_reason}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-2 sm:mt-0">
                      {getStatusBadge(doc.status)}
                      <a
                        href={doc.file} target="_blank" rel="noopener noreferrer"
                        className="p-1.5 rounded hover:bg-white/10 transition"
                        style={{ color: '#94a3b8' }}
                        title="Télécharger"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDeleteDocument(doc)}
                        disabled={deletingDocId === doc.id}
                        className="p-1.5 rounded hover:bg-red-500/10 transition disabled:opacity-50"
                        style={{ color: '#f87171' }}
                        title="Supprimer"
                      >
                        <X className="w-4 h-4" />
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