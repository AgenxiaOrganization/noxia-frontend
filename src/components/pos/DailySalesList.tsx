'use client'

import { useState } from 'react'
import { Sale } from '../../lib/api/sales'
import { 
  Receipt, 
  Search, 
  RefreshCw, 
  Clock, 
  User, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  TrendingUp, 
  Sparkles,
  ShoppingBag,
  Eye
} from 'lucide-react'

interface DailySalesListProps {
  sales: Sale[]
  isLoading: boolean
  onRefresh: () => void
  onViewReceipt: (sale: Sale) => void
}

export default function DailySalesList({
  sales,
  isLoading,
  onRefresh,
  onViewReceipt
}: DailySalesListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMethod, setSelectedMethod] = useState<string>('all')

  // Filtrer les encaissements de la journée (depuis minuit)
  const todayStr = new Date().toISOString().slice(0, 10)
  
  const todaySales = sales.filter(s => {
    if (!s.created_at) return true
    const saleDateStr = new Date(s.created_at).toISOString().slice(0, 10)
    return saleDateStr === todayStr
  })

  // Statistiques de la journée
  const totalAmountToday = todaySales.reduce((acc, s) => acc + (parseFloat(s.total_amount) || 0), 0)
  const countToday = todaySales.length

  const cashTotal = todaySales
    .filter(s => s.payment_method === 'cash')
    .reduce((acc, s) => acc + (parseFloat(s.total_amount) || 0), 0)

  const mobileTotal = todaySales
    .filter(s => s.payment_method === 'mobile_money')
    .reduce((acc, s) => acc + (parseFloat(s.total_amount) || 0), 0)

  const cardTotal = todaySales
    .filter(s => s.payment_method === 'card')
    .reduce((acc, s) => acc + (parseFloat(s.total_amount) || 0), 0)

  // Filtrage utilisateur
  const filteredSales = todaySales.filter(s => {
    const cashierMatch = (s.cashier_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    const itemsMatch = (s.items || []).some(item => 
      (item.product_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    const matchesSearch = cashierMatch || itemsMatch

    const matchesMethod = selectedMethod === 'all' || s.payment_method === selectedMethod

    return matchesSearch && matchesMethod
  })

  const getPaymentBadge = (method: string) => {
    switch (method) {
      case 'mobile_money':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Smartphone className="w-3.5 h-3.5" />
            Mobile Money
          </span>
        )
      case 'card':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            <CreditCard className="w-3.5 h-3.5" />
            Carte bancaire
          </span>
        )
      case 'cash':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <Banknote className="w-3.5 h-3.5" />
            Espèces
          </span>
        )
    }
  }

  return (
    <div className="bg-dark-900 border border-dark-800/80 rounded-2xl p-4 sm:p-6 space-y-5 shadow-xl">
      {/* En-tête de la section avec statut temps réel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Encaissements du jour</h2>
              {/* Badge En Direct WebSocket */}
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                En temps réel
              </span>
            </div>
            <p className="text-xs text-dark-400">Flux en direct des ventes encaissées aujourd'hui</p>
          </div>
        </div>

        {/* Bouton Rafraîchir */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-dark-700 bg-dark-800 hover:bg-dark-700 text-xs text-dark-300 hover:text-white transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Cartes de Synthèse Rapide */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-950/20 border border-emerald-500/20 space-y-1">
          <div className="flex items-center justify-between text-xs text-emerald-400/80 font-medium">
            <span>Total Encaissé Aujourd'hui</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-black text-emerald-400">
            {totalAmountToday.toLocaleString('fr-FR')} FCFA
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-dark-800/60 border border-dark-700/60 space-y-1">
          <div className="flex items-center justify-between text-xs text-dark-400 font-medium">
            <span>Ventes de la journée</span>
            <ShoppingBag className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-xl font-bold text-white">
            {countToday} <span className="text-xs font-normal text-dark-400">transaction(s)</span>
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-dark-800/60 border border-dark-700/60 space-y-1">
          <div className="flex items-center justify-between text-xs text-dark-400 font-medium">
            <span>Encaissements Espèces</span>
            <Banknote className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-lg font-bold text-white">
            {cashTotal.toLocaleString('fr-FR')} FCFA
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-dark-800/60 border border-dark-700/60 space-y-1">
          <div className="flex items-center justify-between text-xs text-dark-400 font-medium">
            <span>Mobile Money / Carte</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-lg font-bold text-white">
            {(mobileTotal + cardTotal).toLocaleString('fr-FR')} FCFA
          </p>
        </div>
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-dark-400" />
          <input
            type="text"
            placeholder="Rechercher par caissier ou produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-dark-950 border border-dark-800 text-white placeholder-dark-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Filtres par Mode de Paiement */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          {[
            { id: 'all', label: 'Tous' },
            { id: 'cash', label: 'Espèces' },
            { id: 'mobile_money', label: 'Mobile Money' },
            { id: 'card', label: 'Carte' }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setSelectedMethod(filter.id)}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition cursor-pointer ${
                selectedMethod === filter.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-dark-800 text-dark-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tableau des Encaissements */}
      <div className="overflow-x-auto rounded-xl border border-dark-800 bg-dark-950/50">
        <table className="w-full text-left text-xs text-dark-300">
          <thead className="bg-dark-800/80 text-dark-400 font-semibold border-b border-dark-800">
            <tr>
              <th className="px-4 py-3">Heure</th>
              <th className="px-4 py-3">Caissier</th>
              <th className="px-4 py-3">Articles encaissés</th>
              <th className="px-4 py-3">Paiement</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-800/60">
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-dark-500">
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                      <span>Chargement des encaissements...</span>
                    </div>
                  ) : (
                    <span>Aucun encaissement enregistré aujourd'hui.</span>
                  )}
                </td>
              </tr>
            ) : (
              filteredSales.map((sale) => {
                const timeStr = sale.created_at
                  ? new Date(sale.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                  : '--:--'
                
                const itemsSummary = (sale.items || [])
                  .map(item => `${item.product_name || 'Produit'} x${parseFloat(item.quantity || '1')}`)
                  .join(', ') || 'Articles enregistrés'

                const totalVal = parseFloat(sale.total_amount || '0')

                return (
                  <tr 
                    key={sale.id}
                    className="hover:bg-dark-800/40 transition group"
                  >
                    {/* Heure */}
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-dark-200">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-dark-400" />
                        <span>{timeStr}</span>
                      </div>
                    </td>

                    {/* Caissier */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-white font-medium">
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{sale.cashier_name || 'Caissier'}</span>
                      </div>
                    </td>

                    {/* Articles */}
                    <td className="px-4 py-3 max-w-xs truncate text-dark-300" title={itemsSummary}>
                      {itemsSummary}
                    </td>

                    {/* Mode de paiement */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getPaymentBadge(sale.payment_method)}
                    </td>

                    {/* Montant total */}
                    <td className="px-4 py-3 whitespace-nowrap text-right font-black text-emerald-400 text-sm">
                      +{totalVal.toLocaleString('fr-FR')} FCFA
                    </td>

                    {/* Action Reçu */}
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <button
                        onClick={() => onViewReceipt(sale)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-dark-800 hover:bg-indigo-600/30 text-dark-300 hover:text-indigo-300 border border-dark-700 hover:border-indigo-500/40 transition cursor-pointer text-[11px] font-medium"
                        title="Voir le reçu"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Reçu</span>
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
