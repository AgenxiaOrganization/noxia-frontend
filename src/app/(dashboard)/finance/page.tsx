'use client'

import { useState } from 'react'
import {
  DollarSign, TrendingUp, TrendingDown, Wallet, 
  Users, Receipt, Building2, Coffee, CreditCard,
  Download, Calendar, ChevronDown, ChevronRight,
  Plus, Search, Edit, Trash2
} from 'lucide-react'

// Données mockées
const mockCharges = [
  { id: 1, date: '2026-06-01', category: 'loyer', label: 'Loyer juin', amount: 500000 },
  { id: 2, date: '2026-06-15', category: 'electricite', label: 'Facture SEEG', amount: 85000 },
  { id: 3, date: '2026-06-20', category: 'approvisionnement', label: 'Commande boissons', amount: 350000 },
  { id: 4, date: '2026-06-25', category: 'divers', label: 'Entretien clim', amount: 45000 },
  { id: 5, date: '2026-06-28', category: 'approvisionnement', label: 'Commande nourriture', amount: 180000 },
]

const mockSales = [
  { id: 1, product: 'Bière Castel', category: 'boisson', amount: 4500, date: '2026-06-28' },
  { id: 2, product: 'Whisky Jack', category: 'boisson', amount: 25000, date: '2026-06-28' },
  { id: 3, product: 'Cocktail Mojito', category: 'boisson', amount: 5000, date: '2026-06-28' },
  { id: 4, product: 'Brochettes Poulet', category: 'nourriture', amount: 3500, date: '2026-06-28' },
  { id: 5, product: 'Champagne Moet', category: 'boisson', amount: 45000, date: '2026-06-27' },
  { id: 6, product: 'Burger Classic', category: 'nourriture', amount: 4000, date: '2026-06-27' },
  { id: 7, product: 'Vodka Absolut', category: 'boisson', amount: 20000, date: '2026-06-26' },
  { id: 8, product: 'Chicha Session', category: 'service', amount: 10000, date: '2026-06-26' },
]

const mockEmployees = [
  { name: 'Jean M.', salary: 150000, commission: 2, sales: 450000 },
  { name: 'Marie K.', salary: 120000, commission: 5, sales: 320000 },
  { name: 'François T.', salary: 250000, commission: 1, sales: 820000 },
  { name: 'Chloé R.', salary: 120000, commission: 5, sales: 410000 },
  { name: 'Sophie N.', salary: 150000, commission: 2, sales: 280000 },
  { name: 'Pierre O.', salary: 130000, commission: 0, sales: 0 },
  { name: 'Alice B.', salary: 200000, commission: 0, sales: 0 },
]

const mockCaisses = [
  { name: 'Caisse Principale', balance: 245000, status: 'ouverte' },
  { name: 'Caisse Terrasse', balance: 89000, status: 'ouverte' },
  { name: 'Caisse VIP', balance: 156000, status: 'fermee' },
]

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState('compta')
  const [selectedMonth, setSelectedMonth] = useState('2026-06')

  // Calculs comptabilité
  const totalRevenue = mockSales.reduce((acc, s) => acc + s.amount, 0)
  const totalCharges = mockCharges.reduce((acc, c) => acc + c.amount, 0)
  const netProfit = totalRevenue - totalCharges
  const margin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0

  // Ventes par catégorie
  const categoryRevenue = mockSales.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + s.amount
    return acc
  }, {} as Record<string, number>)

  // Calcul des salaires avec commissions
  const salaryData = mockEmployees.map(emp => {
    const commission = emp.sales * (emp.commission / 100)
    return {
      ...emp,
      commissionAmount: Math.round(commission),
      total: emp.salary + Math.round(commission)
    }
  })

  const totalPayroll = salaryData.reduce((acc, emp) => acc + emp.total, 0)

  // TVA (18% - Gabon)
  const tvaRate = 18
  const tvaAmount = Math.round(totalRevenue * (tvaRate / 100))

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Finances</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            Pilotage financier de l'établissement
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition flex items-center gap-2"
            style={{ 
              background: '#4f46e5',
              boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
            }}
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm outline-none transition"
            style={{ 
              background: 'rgba(51, 65, 85, 0.5)',
              border: '1px solid #334155',
              color: '#94a3b8'
            }}
          >
            <option value="2026-06">Juin 2026</option>
            <option value="2026-05">Mai 2026</option>
            <option value="2026-04">Avril 2026</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'compta', label: 'Comptabilité', icon: Receipt },
          { id: 'tresorerie', label: 'Trésorerie', icon: Wallet },
          { id: 'salaires', label: 'Salaires', icon: Users },
          { id: 'tva', label: 'TVA', icon: CreditCard },
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
        {/* COMPTABILITÉ */}
        {activeTab === 'compta' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Revenus totaux</p>
                <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>{totalRevenue.toLocaleString()} F</p>
              </div>
              <div className="p-4 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Charges totales</p>
                <p className="text-2xl font-bold" style={{ color: '#ef4444' }}>{totalCharges.toLocaleString()} F</p>
              </div>
              <div className="p-4 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Bénéfice net</p>
                <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-accent-400' : 'text-red-400'}`}>
                  {netProfit.toLocaleString()} F
                </p>
              </div>
              <div className="p-4 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Marge</p>
                <p className={`text-2xl font-bold ${margin >= 30 ? 'text-accent-400' : margin >= 15 ? 'text-orange-400' : 'text-red-400'}`}>
                  {margin}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-xl border p-4" style={{ background: '#1e293b', borderColor: '#334155' }}>
                <h3 className="font-semibold text-sm text-white mb-3">Revenus par source</h3>
                <div className="space-y-2">
                  {Object.entries(categoryRevenue).map(([cat, amount]) => (
                    <div key={cat} className="flex justify-between items-center py-1 border-b" style={{ borderColor: '#334155' }}>
                      <span style={{ color: '#94a3b8' }}>{cat}</span>
                      <span className="font-semibold" style={{ color: '#22c55e' }}>{amount.toLocaleString()} F</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 font-bold">
                    <span className="text-white">Total</span>
                    <span style={{ color: '#22c55e' }}>{totalRevenue.toLocaleString()} F</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-4" style={{ background: '#1e293b', borderColor: '#334155' }}>
                <h3 className="font-semibold text-sm text-white mb-3">Charges du mois</h3>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {mockCharges.map(charge => (
                    <div key={charge.id} className="flex justify-between items-center py-1 border-b" style={{ borderColor: '#334155' }}>
                      <div>
                        <span className="text-sm text-white">{charge.label}</span>
                        <span className="text-xs ml-2" style={{ color: '#64748b' }}>{charge.category}</span>
                      </div>
                      <span className="text-sm" style={{ color: '#ef4444' }}>{charge.amount.toLocaleString()} F</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 font-bold border-t" style={{ borderColor: '#334155' }}>
                    <span className="text-white">Total</span>
                    <span style={{ color: '#ef4444' }}>{totalCharges.toLocaleString()} F</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* TRÉSORERIE */}
        {activeTab === 'tresorerie' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {mockCaisses.map((caisse, i) => (
                <div key={i} className="p-4 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-white">{caisse.name}</h3>
                    <span 
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        caisse.status === 'ouverte' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {caisse.status}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-white">{caisse.balance.toLocaleString()} FCFA</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border p-4" style={{ background: '#1e293b', borderColor: '#334155' }}>
              <h3 className="font-semibold text-sm text-white mb-3">Mouvements de caisse</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b" style={{ borderColor: '#334155' }}>
                      <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Date</th>
                      <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Caisse</th>
                      <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Type</th>
                      <th className="px-3 py-2 text-right text-xs" style={{ color: '#94a3b8' }}>Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { date: '28/06', caisse: 'Principale', type: 'Vente', amount: 45000 },
                      { date: '28/06', caisse: 'Terrasse', type: 'Vente', amount: 12000 },
                      { date: '27/06', caisse: 'Principale', type: 'Dépense', amount: -15000 },
                      { date: '27/06', caisse: 'VIP', type: 'Vente', amount: 35000 },
                    ].map((m, i) => (
                      <tr key={i} className="border-b" style={{ borderColor: '#334155' }}>
                        <td className="px-3 py-2" style={{ color: '#94a3b8' }}>{m.date}</td>
                        <td className="px-3 py-2 text-white">{m.caisse}</td>
                        <td className="px-3 py-2" style={{ color: m.amount > 0 ? '#22c55e' : '#ef4444' }}>{m.type}</td>
                        <td className={`px-3 py-2 text-right font-semibold ${m.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {m.amount > 0 ? '+' : ''}{m.amount.toLocaleString()} F
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* SALAIRES */}
        {activeTab === 'salaires' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Masse salariale</p>
                <p className="text-2xl font-bold text-white">{totalPayroll.toLocaleString()} F</p>
              </div>
              <div className="p-4 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Employés actifs</p>
                <p className="text-2xl font-bold text-white">{mockEmployees.filter(e => e.sales > 0 || e.salary > 0).length}</p>
              </div>
              <div className="p-4 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Commission totale</p>
                <p className="text-2xl font-bold" style={{ color: '#f59e0b' }}>
                  {salaryData.reduce((acc, e) => acc + e.commissionAmount, 0).toLocaleString()} F
                </p>
              </div>
            </div>

            <div className="rounded-xl border overflow-hidden" style={{ background: '#1e293b', borderColor: '#334155' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b" style={{ borderColor: '#334155' }}>
                      <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Employé</th>
                      <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Salaire base</th>
                      <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Ventes</th>
                      <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Commission</th>
                      <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Total dû</th>
                      <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaryData.map((emp, i) => (
                      <tr key={i} className="border-b" style={{ borderColor: '#334155' }}>
                        <td className="px-3 py-2 font-medium text-white">{emp.name}</td>
                        <td className="px-3 py-2" style={{ color: '#94a3b8' }}>{emp.salary.toLocaleString()} F</td>
                        <td className="px-3 py-2" style={{ color: '#22c55e' }}>{emp.sales.toLocaleString()} F</td>
                        <td className="px-3 py-2" style={{ color: '#f59e0b' }}>{emp.commissionAmount.toLocaleString()} F</td>
                        <td className="px-3 py-2 font-bold text-white">{emp.total.toLocaleString()} F</td>
                        <td className="px-3 py-2">
                          <button className="text-xs px-2 py-1 rounded transition" style={{ background: 'rgba(51,65,85,0.5)', color: '#94a3b8' }}>
                            Fiche PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* TVA */}
        {activeTab === 'tva' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Total HT</p>
                <p className="text-2xl font-bold text-white">{totalRevenue.toLocaleString()} F</p>
              </div>
              <div className="p-4 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
                <p className="text-xs" style={{ color: '#94a3b8' }}>TVA ({tvaRate}%)</p>
                <p className="text-2xl font-bold" style={{ color: '#f59e0b' }}>{tvaAmount.toLocaleString()} F</p>
              </div>
              <div className="p-4 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Total TTC</p>
                <p className="text-2xl font-bold text-white">{(totalRevenue + tvaAmount).toLocaleString()} F</p>
              </div>
            </div>

            <div className="rounded-xl border p-4" style={{ background: '#1e293b', borderColor: '#334155' }}>
              <h3 className="font-semibold text-sm text-white mb-3">Déclaration TVA</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b" style={{ borderColor: '#334155' }}>
                      <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Période</th>
                      <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Base HT</th>
                      <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>TVA collectée</th>
                      <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Statut</th>
                      <th className="px-3 py-2 text-left text-xs" style={{ color: '#94a3b8' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { period: 'Juin 2026', base: totalRevenue, tva: tvaAmount, status: 'À déclarer' },
                      { period: 'Mai 2026', base: 1500000, tva: 270000, status: 'Déclaré' },
                      { period: 'Avril 2026', base: 1200000, tva: 216000, status: 'Clôturé' },
                    ].map((row, i) => (
                      <tr key={i} className="border-b" style={{ borderColor: '#334155' }}>
                        <td className="px-3 py-2 text-white">{row.period}</td>
                        <td className="px-3 py-2" style={{ color: '#94a3b8' }}>{row.base.toLocaleString()} F</td>
                        <td className="px-3 py-2" style={{ color: '#f59e0b' }}>{row.tva.toLocaleString()} F</td>
                        <td className="px-3 py-2">
                          <span 
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              row.status === 'À déclarer' ? 'bg-orange-500/20 text-orange-400' :
                              row.status === 'Déclaré' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-green-500/20 text-green-400'
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <button className="text-xs px-2 py-1 rounded transition" style={{ background: 'rgba(51,65,85,0.5)', color: '#94a3b8' }}>
                            Export
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}