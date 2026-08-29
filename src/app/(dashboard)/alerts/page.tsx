'use client'

import { useState, useEffect, FormEvent } from 'react'
import {
  Bell, AlertTriangle, CheckCircle, XCircle,
  Package, Smartphone, Mail, MessageSquare,
  Settings, Search, Clock, Zap, X
} from 'lucide-react'
import React from 'react'
import { getStockItems, patchStockItem, createStockMovement, StockItem } from '../../../lib/api/inventory'
import Loader from '@/components/ui/Loader'
import { toast } from 'sonner'

// --- Types ---
interface Alert {
  id: number
  type: 'stock_faible' | 'stock_epuise'
  product: string
  stock: number | null
  threshold: number | null
  status: 'critique' | 'actif' | 'resolue'
  date: string
  channels: string[]
}

const channelIcons = {
  whatsapp: MessageSquare,
  email: Mail,
  push: Smartphone
}

const channelLabels = {
  whatsapp: 'WhatsApp',
  email: 'Email',
  push: 'Push'
}

export default function AlertsPage() {
  const [stockItems, setStockItems] = useState<StockItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  // Modals pour la résolution rapide d'alerte de stock
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false)
  const [selectedStockItem, setSelectedStockItem] = useState<StockItem | null>(null)
  const [adjustQty, setAdjustQty] = useState(10)
  const [adjustNote, setAdjustNote] = useState('Approvisionnement suite alerte')

  const loadData = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true)
      const apiStockItems = await getStockItems()
      setStockItems(apiStockItems || [])
    } catch (err) {
      console.error('Erreur chargement des donnees de stock pour alertes', err)
      toast.error("Erreur lors de la récupération des alertes.")
    } finally {
      if (!silent) setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Construction dynamique des alertes à partir des articles de stock
  const alerts: Alert[] = []

  stockItems.forEach(item => {
    const qty = parseFloat(item.quantity_on_hand as string)
    const threshold = parseFloat(item.alert_threshold as string)

    if (qty <= threshold) {
      const isOutOfStock = qty === 0
      alerts.push({
        id: item.id, // On utilise l'ID du stock item
        type: isOutOfStock ? 'stock_epuise' : 'stock_faible',
        product: item.product_name || 'Produit inconnu',
        stock: qty,
        threshold: threshold,
        status: isOutOfStock ? 'critique' : 'actif',
        date: item.updated_at ? new Date(item.updated_at).toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : new Date().toLocaleString(),
        channels: ['whatsapp', 'email', 'push']
      })
    }
  })

  const filteredAlerts = alerts.filter(a => {
    const matchesSearch = a.product.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || a.type === filterType
    return matchesSearch && matchesType
  })

  const activeAlerts = alerts.filter(a => a.status === 'actif' || a.status === 'critique')
  const criticalAlerts = alerts.filter(a => a.status === 'critique')

  // Mise à jour à la volée du seuil d'alerte
  const handleThresholdChange = async (itemId: number, newThreshold: number) => {
    try {
      const savePromise = patchStockItem(itemId, { alert_threshold: newThreshold })
      toast.promise(savePromise, {
        loading: "Mise à jour du seuil d'alerte...",
        success: "✅ Seuil mis à jour avec succès !",
        error: "❌ Erreur lors de la mise à jour."
      })
      await savePromise
      await loadData(true)
    } catch (err) {
      console.error(err)
    }
  }

  // Ouvrir la modal d'ajustement rapide pour résoudre l'alerte de stock
  const openAdjustmentModal = (alertId: number) => {
    const item = stockItems.find(si => si.id === alertId)
    if (item) {
      setSelectedStockItem(item)
      // Proposer d'ajouter de quoi combler le seuil + 10 unités
      const curStock = parseFloat(item.quantity_on_hand as string)
      const threshold = parseFloat(item.alert_threshold as string)
      setAdjustQty(Math.max(10, Math.ceil(threshold - curStock + 10)))
      setAdjustNote('Réapprovisionnement suite alerte')
      setIsAdjustmentModalOpen(true)
    }
  }

  // Soumettre l'ajustement de stock pour résoudre l'alerte
  const handleQuickAdjustmentSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedStockItem) return

    try {
      setIsSaving(true)
      const adjustPromise = createStockMovement({
        stock_item: selectedStockItem.id,
        movement_type: 'entry',
        quantity: adjustQty,
        reason: adjustNote
      })

      toast.promise(adjustPromise, {
        loading: "Enregistrement de l'ajustement de stock...",
        success: "✅ Stock ajouté, l'alerte est résolue !",
        error: "❌ Erreur de validation du stock."
      })

      await adjustPromise
      setIsAdjustmentModalOpen(false)
      setSelectedStockItem(null)
      await loadData(true)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <Loader />
  }

  return (
    <div className="p-4 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Alertes</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            {activeAlerts.length} alertes actives • {criticalAlerts.length} critiques
          </p>
        </div>
      </div>

      {/* STATS RAPIDES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl border border-dark-800/40 glass-card">
          <p className="text-xs text-dark-400 font-medium">Alertes actives</p>
          <p className="text-xl font-bold text-orange-400 mt-0.5">{activeAlerts.length}</p>
        </div>
        <div className="p-3 rounded-xl border border-dark-800/40 glass-card">
          <p className="text-xs text-dark-400 font-medium">Critiques</p>
          <p className="text-xl font-bold text-red-400 mt-0.5">{criticalAlerts.length}</p>
        </div>
        <div className="p-3 rounded-xl border border-dark-800/40 glass-card">
          <p className="text-xs text-dark-400 font-medium">Stock faible</p>
          <p className="text-xl font-bold text-orange-400 mt-0.5">
            {alerts.filter(a => a.type === 'stock_faible').length}
          </p>
        </div>
        <div className="p-3 rounded-xl border border-dark-800/40 glass-card">
          <p className="text-xs text-dark-400 font-medium">Ruptures</p>
          <p className="text-xl font-bold text-red-400 mt-0.5">
            {alerts.filter(a => a.type === 'stock_epuise').length}
          </p>
        </div>
      </div>

      {/* FILTRES */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
          <input
            type="text"
            placeholder="Rechercher une alerte..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition bg-dark-900 border border-dark-800/60 focus:border-primary-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {['all', 'stock_faible', 'stock_epuise'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                filterType === type
                  ? 'bg-primary-500/10 border border-primary-500/30 text-primary-400 font-bold'
                  : 'bg-dark-900 border border-dark-800/40 text-dark-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {type === 'all' ? 'Tous' :
               type === 'stock_faible' ? 'Stock faible' :
               'Rupture'}
            </button>
          ))}
        </div>
      </div>

      {/* LISTE DES ALERTES (Vue dynamique) */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 mx-auto mb-2" style={{ color: '#334155' }} />
            <p className="text-sm" style={{ color: '#64748b' }}>Aucune alerte active</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const Icon = alert.type === 'stock_faible' ? AlertTriangle : XCircle
            
            const statusColor = alert.status === 'critique' ? '#ef4444' : 
                                alert.status === 'actif' ? '#f59e0b' : 
                                '#22c55e'
            
            const statusLabel = alert.status === 'critique' ? 'Critique' : 
                                alert.status === 'actif' ? 'Active' : 
                                'Résolue'

            const bgColor = alert.status === 'critique' ? 'rgba(239, 68, 68, 0.08)' : 
                            'rgba(245, 158, 11, 0.05)'

            const stockValue = alert.stock ?? 0
            const thresholdValue = alert.threshold ?? 1
            const progress = Math.min(100, (stockValue / thresholdValue) * 100)
            const barColor = stockValue <= thresholdValue / 2 ? '#ef4444' : '#f59e0b'

            return (
              <div 
                key={alert.id}
                className="rounded-xl border p-4 transition-all hover:border-primary-500"
                style={{ 
                  background: bgColor,
                  borderColor: alert.status === 'critique' ? '#ef4444' : 'var(--theme-border)'
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  {/* Colonne gauche : Icône + Infos */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: alert.type === 'stock_faible' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)'
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: statusColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-white">{alert.product}</span>
                        <span 
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ 
                            background: `${statusColor}20`,
                            color: statusColor
                          }}
                        >
                          {statusLabel}
                        </span>
                        <span className="text-xs text-dark-400">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {alert.date}
                        </span>
                      </div>
                      
                      {/* Détails de l'alerte */}
                      {alert.type === 'stock_faible' && alert.stock !== null && alert.threshold !== null && (
                        <div className="mt-1 flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-dark-400">Stock actuel :</span>
                            <span className="text-xs font-semibold text-orange-400">{alert.stock} unités</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-dark-400">Seuil :</span>
                            <span className="text-xs font-semibold text-white">{alert.threshold} unités</span>
                          </div>
                          {/* Barre de progression avec valeurs sécurisées */}
                          <div className="flex-1 min-w-[100px] max-w-[200px]">
                            <div className="w-full h-1.5 rounded-full bg-dark-700">
                              <div 
                                className="h-1.5 rounded-full transition-all"
                                style={{
                                  width: `${progress}%`,
                                  background: barColor
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {alert.type === 'stock_epuise' && (
                        <div className="mt-1 flex items-center gap-3 flex-wrap">
                          <span className="text-xs font-semibold text-red-400">⚠️ Produit en rupture !</span>
                          <span className="text-xs" style={{ color: '#94a3b8' }}>
                            Seuil : {alert.threshold ?? 'N/A'} unités
                          </span>
                        </div>
                      )}
                      
                    </div>
                  </div>

                  {/* Colonne droite : Canaux et Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 shrink-0">
                    <div className="flex items-center gap-1">
                      {alert.channels.map((channel) => {
                        const ChanIcon = channelIcons[channel as keyof typeof channelIcons]
                        return (
                          <span 
                            key={channel}
                            className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                            style={{ 
                              background: 'rgba(51, 65, 85, 0.3)',
                              color: '#94a3b8'
                            }}
                          >
                            <ChanIcon className="w-3 h-3" />
                            {channelLabels[channel as keyof typeof channelLabels]}
                          </span>
                        )
                      })}
                    </div>
                    
                    <button
                      onClick={() => openAdjustmentModal(alert.id)}
                      className="px-3 py-1 rounded text-xs font-medium transition flex items-center gap-1 hover:brightness-110 active:scale-95"
                      style={{
                        background: alert.type === 'stock_epuise' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                        color: alert.type === 'stock_epuise' ? '#ef4444' : '#22c55e'
                      }}
                    >
                      {alert.type === 'stock_epuise' ? <Zap className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                      {alert.type === 'stock_epuise' ? 'Agir' : 'Résoudre'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* CONFIGURATION DES SEUILS DYNAMIQUES */}
      <div 
        className="rounded-2xl border border-dark-800/40 glass-card p-5 animate-fade-in"
      >
        <h3 className="font-display font-bold text-sm text-primary-500 mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary-400" />
          Seuils d'alerte par produit
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-800/20">
                <th className="px-3 py-2 text-left text-xs text-dark-400">Produit</th>
                <th className="px-3 py-2 text-left text-xs text-dark-400">Stock actuel</th>
                <th className="px-3 py-2 text-left text-xs text-dark-400">Seuil d'alerte</th>
                <th className="px-3 py-2 text-left text-xs text-dark-400">Statut</th>
              </tr>
            </thead>
            <tbody>
              {stockItems.map((item) => {
                const qty = parseFloat(item.quantity_on_hand as string)
                const threshold = parseFloat(item.alert_threshold as string)
                const isLow = qty >= 0 && qty <= threshold
                const isOut = qty === 0

                return (
                  <tr key={item.id} className="border-b border-dark-800/10 transition hover:bg-white/[0.02]">
                    <td className="px-3 py-2 text-white font-medium">{item.product_name}</td>
                    <td className={`px-3 py-2 font-semibold ${isOut ? 'text-red-500' : isLow ? 'text-orange-500' : 'text-dark-400'}`}>
                      {qty >= 0 ? `${qty} ${item.unit || 'unités'}` : 'Illimité'}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        defaultValue={threshold}
                        onBlur={(e) => {
                          const val = parseInt(e.target.value)
                          if (!isNaN(val) && val !== threshold) {
                            handleThresholdChange(item.id, val)
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = parseInt((e.target as HTMLInputElement).value)
                            if (!isNaN(val) && val !== threshold) {
                              handleThresholdChange(item.id, val)
                            }
                          }
                        }}
                        className="w-20 rounded-lg px-2.5 py-1 text-white text-xs outline-none bg-dark-950/40 border border-dark-800/60 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <span 
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                          isOut ? 'bg-red-500/20 text-red-400' :
                          isLow ? 'bg-orange-500/20 text-orange-400' :
                          'bg-green-500/20 text-green-400'
                        }`}
                      >
                        {isOut ? 'Rupture' : isLow ? 'Alerte' : 'OK'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CANAUX DE NOTIFICATION */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: MessageSquare, name: 'WhatsApp', desc: 'Responsable, Magasinier', active: true },
          { icon: Mail, name: 'Email', desc: 'Responsable, Comptable', active: true },
          { icon: Smartphone, name: 'Push', desc: 'Tous les rôles', active: true },
        ].map((channel, i) => (
          <div 
            key={i}
            className="rounded-2xl border border-dark-800/40 glass-card p-5 text-center transition hover:border-primary-500"
          >
            <div className="flex items-center justify-center gap-2">
              <channel.icon className="w-5 h-5 text-primary-400" />
              <span className="font-medium text-white">{channel.name}</span>
            </div>
            <p className="text-xs text-dark-400 mt-1">{channel.desc}</p>
            <label className="flex items-center justify-center gap-2 mt-3 text-xs cursor-pointer select-none text-dark-400 hover:text-white">
              <input type="checkbox" defaultChecked={channel.active} className="accent-primary-500 rounded" />
              <span>Actif</span>
            </label>
          </div>
        ))}
      </div>

      {/* QUICK ADJUSTMENT MODAL */}
      {isAdjustmentModalOpen && selectedStockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="w-full max-w-md p-6 rounded-2xl border border-dark-800/60 bg-dark-900 shadow-2xl animate-scale-in"
          >
            <div className="flex items-center justify-between pb-3 border-b border-dark-800/60">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                Réapprovisionnement rapide
              </h2>
              <button 
                onClick={() => {
                  setIsAdjustmentModalOpen(false)
                  setSelectedStockItem(null)
                }}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAdjustmentSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-dark-400">
                  Produit
                </label>
                <input 
                  type="text" 
                  disabled 
                  value={selectedStockItem.product_name || ''} 
                  className="w-full rounded-lg px-3 py-2 bg-dark-950/40 border border-dark-800/60 text-dark-400 text-sm cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-dark-400">
                    Stock actuel
                  </label>
                  <p className="text-sm font-bold text-orange-500 p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/10">
                    {selectedStockItem.quantity_on_hand} {selectedStockItem.unit || 'unités'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-dark-400">
                    Seuil d'alerte
                  </label>
                  <p className="text-sm font-bold text-white p-2.5 rounded-lg bg-dark-950/30 border border-dark-800/30">
                    {selectedStockItem.alert_threshold} {selectedStockItem.unit || 'unités'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-dark-400">
                  Quantité à ajouter ({selectedStockItem.unit || 'unités'})
                </label>
                <input 
                  type="number" 
                  min="1"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(parseInt(e.target.value) || 1)}
                  className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none bg-dark-950/50 border border-dark-800/60 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-dark-400">
                  Motif / Note d'ajustement
                </label>
                <input 
                  type="text" 
                  required
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none bg-dark-950/50 border border-dark-800/60 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-dark-800/60">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdjustmentModalOpen(false)
                    setSelectedStockItem(null)
                  }}
                  className="px-5 py-2 rounded-lg text-sm font-medium transition border border-dark-800/60 text-dark-400 hover:text-white hover:bg-white/5"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg text-white text-sm font-semibold transition bg-primary-500 hover:brightness-110 active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Valider l'ajustement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}