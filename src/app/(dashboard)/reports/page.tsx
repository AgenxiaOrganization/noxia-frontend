'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  FileBarChart, Download, Calendar, TrendingUp, TrendingDown,
  DollarSign, ShoppingBag, Users, Award, Package, ChevronDown
} from 'lucide-react'

// Données mockées
const mockSales = [
  { id: 1, product: 'Bière Castel', category: 'boisson', amount: 4500, date: '2026-06-28' },
  { id: 2, product: 'Whisky Jack', category: 'boisson', amount: 25000, date: '2026-06-28' },
  { id: 3, product: 'Cocktail Mojito', category: 'boisson', amount: 5000, date: '2026-06-28' },
  { id: 4, product: 'Brochettes Poulet', category: 'nourriture', amount: 3500, date: '2026-06-28' },
  { id: 5, product: 'Champagne Moet', category: 'boisson', amount: 45000, date: '2026-06-27' },
  { id: 6, product: 'Bière Guinness', category: 'boisson', amount: 2000, date: '2026-06-27' },
  { id: 7, product: 'Burger Classic', category: 'nourriture', amount: 4000, date: '2026-06-27' },
  { id: 8, product: 'Vodka Absolut', category: 'boisson', amount: 20000, date: '2026-06-26' },
  { id: 9, product: 'Jus d\'Orange', category: 'boisson', amount: 1500, date: '2026-06-26' },
  { id: 10, product: 'Chicha Session', category: 'service', amount: 10000, date: '2026-06-26' },
  { id: 11, product: 'Bière Castel', category: 'boisson', amount: 3000, date: '2026-06-25' },
  { id: 12, product: 'Cocktail Pina Colada', category: 'boisson', amount: 6000, date: '2026-06-25' },
  { id: 13, product: 'Entree VIP', category: 'service', amount: 15000, date: '2026-06-25' },
  { id: 14, product: 'Whisky Jack', category: 'boisson', amount: 25000, date: '2026-06-24' },
  { id: 15, product: 'Brochettes Poulet', category: 'nourriture', amount: 7000, date: '2026-06-24' },
]

const mockEmployees = [
  { name: 'Jean M.', sales: 450000 },
  { name: 'Marie K.', sales: 320000 },
  { name: 'François T.', sales: 820000 },
  { name: 'Chloé R.', sales: 410000 },
  { name: 'Sophie N.', sales: 280000 },
]

export default function ReportsPage() {
  const [period, setPeriod] = useState('week')
  const [chartType, setChartType] = useState('bar')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Calculs des KPIs
  const totalSales = mockSales.reduce((acc, s) => acc + s.amount, 0)
  const totalTransactions = mockSales.length
  const averageTicket = Math.round(totalSales / totalTransactions)
  
  const categorySales = mockSales.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + s.amount
    return acc
  }, {} as Record<string, number>)

  // Top produits
  const productSales = mockSales.reduce((acc, s) => {
    acc[s.product] = (acc[s.product] || 0) + s.amount
    return acc
  }, {} as Record<string, number>)

  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Top employés
  const topEmployees = mockEmployees.sort((a, b) => b.sales - a.sales).slice(0, 5)

  // Ventes par jour (7 derniers jours)
  const dailySales = [450000, 380000, 520000, 490000, 610000, 580000, 720000]
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  // Dessiner le graphique
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    const padding = 40
    const chartW = w - padding * 2
    const chartH = h - padding * 2
    const max = Math.max(...dailySales) * 1.2
    const barW = chartW / dailySales.length - 8

    // Fond
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(0, 0, w, h)

    // Lignes de grille
    ctx.strokeStyle = '#334155'
    ctx.lineWidth = 0.5
    for (let i = 0; i < 4; i++) {
      const y = padding + (chartH / 4) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(w - padding, y)
      ctx.stroke()
      
      // Labels des valeurs
      ctx.fillStyle = '#64748b'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(Math.round(max - (max / 4) * i).toLocaleString(), padding - 8, y + 4)
    }

    // Barres
    dailySales.forEach((value, i) => {
      const x = padding + (chartW / dailySales.length) * i + 4
      const barH = (value / max) * chartH
      const y = padding + chartH - barH

      const gradient = ctx.createLinearGradient(x, y, x, padding + chartH)
      gradient.addColorStop(0, '#818cf8')
      gradient.addColorStop(1, '#4f46e5')
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.roundRect(x, y, barW, barH, 4)
      ctx.fill()

      // Labels des jours
      ctx.fillStyle = '#94a3b8'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(days[i], x + barW / 2, padding + chartH + 20)
      
      // Valeurs au-dessus des barres
      ctx.fillStyle = '#f1f5f9'
      ctx.font = '10px sans-serif'
      ctx.fillText((value / 1000).toFixed(0) + 'k', x + barW / 2, y - 6)
    })

    // Titre
    ctx.fillStyle = '#94a3b8'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('Ventes de la semaine', padding, 20)

  }, [])

  const handleExport = (format: string) => {
    alert(`Simulation: Rapport exporté en ${format.toUpperCase()}`)
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Rapports & Analyses</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            Performance de l'établissement
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('pdf')}
            className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition flex items-center gap-2"
            style={{ 
              background: '#ef4444',
              boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.3)'
            }}
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition flex items-center gap-2"
            style={{ 
              background: '#22c55e',
              boxShadow: '0 10px 25px -5px rgba(34, 197, 94, 0.3)'
            }}
          >
            <Download className="w-4 h-4" />
            Excel
          </button>
        </div>
      </div>

      {/* Période */}
      <div className="flex gap-2">
        {['jour', 'semaine', 'mois', 'trimestre', 'an'].map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              period === p ? 'border' : 'border-transparent'
            }`}
            style={{
              background: period === p ? 'rgba(99, 102, 241, 0.15)' : 'rgba(51, 65, 85, 0.3)',
              borderColor: period === p ? '#6366f1' : 'transparent',
              color: period === p ? '#818cf8' : '#94a3b8'
            }}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4" style={{ color: '#22c55e' }} />
            <p className="text-xs" style={{ color: '#94a3b8' }}>Chiffre d'affaires</p>
          </div>
          <p className="text-xl font-bold text-white">{totalSales.toLocaleString()} FCFA</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag className="w-4 h-4" style={{ color: '#818cf8' }} />
            <p className="text-xs" style={{ color: '#94a3b8' }}>Nombre de ventes</p>
          </div>
          <p className="text-xl font-bold text-white">{totalTransactions}</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4" style={{ color: '#f59e0b' }} />
            <p className="text-xs" style={{ color: '#94a3b8' }}>Panier moyen</p>
          </div>
          <p className="text-xl font-bold text-white">{averageTicket.toLocaleString()} FCFA</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4" style={{ color: '#8b5cf6' }} />
            <p className="text-xs" style={{ color: '#94a3b8' }}>Meilleur vendeur</p>
          </div>
          <p className="text-xl font-bold text-white">{topEmployees[0]?.name || '-'}</p>
        </div>
      </div>

      {/* Graphique */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div 
          className="lg:col-span-2 rounded-xl border p-4"
          style={{ background: '#1e293b', borderColor: '#334155' }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-white">Évolution des ventes</h3>
            <select 
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="px-2 py-1 rounded text-xs outline-none"
              style={{ 
                background: 'rgba(51, 65, 85, 0.5)',
                border: '1px solid #334155',
                color: '#94a3b8'
              }}
            >
              <option value="bar">Barres</option>
              <option value="line">Ligne</option>
            </select>
          </div>
          <canvas ref={canvasRef} width={500} height={280} className="w-full h-auto" />
        </div>

        {/* Top produits */}
        <div 
          className="rounded-xl border p-4"
          style={{ background: '#1e293b', borderColor: '#334155' }}
        >
          <h3 className="font-semibold text-sm text-white mb-3">Top produits</h3>
          <div className="space-y-2">
            {topProducts.map(([product, amount], i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold" style={{ color: '#64748b' }}>#{i + 1}</span>
                  <span className="text-white truncate max-w-[120px]">{product}</span>
                </div>
                <span className="font-semibold" style={{ color: '#22c55e' }}>
                  {amount.toLocaleString()} FCFA
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t" style={{ borderColor: '#334155' }}>
            <h4 className="text-xs font-medium text-white mb-2">Par catégorie</h4>
            {Object.entries(categorySales).map(([cat, amount]) => (
              <div key={cat} className="flex items-center justify-between text-xs">
                <span style={{ color: '#94a3b8' }}>{cat}</span>
                <span style={{ color: '#f1f5f9' }}>{amount.toLocaleString()} FCFA</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top employés + Détails */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div 
          className="rounded-xl border p-4"
          style={{ background: '#1e293b', borderColor: '#334155' }}
        >
          <h3 className="font-semibold text-sm text-white mb-3">Top employés</h3>
          <div className="space-y-2">
            {topEmployees.map((emp, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ 
                      background: ['#6366f1', '#818cf8', '#22c55e', '#f59e0b', '#8b5cf6'][i] 
                    }}
                  >
                    {emp.name.split(' ').map(w => w[0]).join('')}
                  </div>
                  <span className="text-white">{emp.name}</span>
                </div>
                <span className="font-semibold" style={{ color: '#22c55e' }}>
                  {emp.sales.toLocaleString()} FCFA
                </span>
              </div>
            ))}
          </div>
        </div>

        <div 
          className="rounded-xl border p-4"
          style={{ background: '#1e293b', borderColor: '#334155' }}
        >
          <h3 className="font-semibold text-sm text-white mb-3">Résumé des ventes</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b" style={{ borderColor: '#334155' }}>
              <span style={{ color: '#94a3b8' }}>Total des ventes</span>
              <span className="text-white font-semibold">{totalSales.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between py-1 border-b" style={{ borderColor: '#334155' }}>
              <span style={{ color: '#94a3b8' }}>Nombre de transactions</span>
              <span className="text-white">{totalTransactions}</span>
            </div>
            <div className="flex justify-between py-1 border-b" style={{ borderColor: '#334155' }}>
              <span style={{ color: '#94a3b8' }}>Panier moyen</span>
              <span className="text-white">{averageTicket.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between py-1">
              <span style={{ color: '#94a3b8' }}>Meilleur jour</span>
              <span className="text-white">Samedi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}