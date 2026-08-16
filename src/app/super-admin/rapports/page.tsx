'use client'

import { useState, useEffect, useRef, useContext } from 'react'
import {
  FileBarChart, Download, TrendingUp,
  DollarSign, ShoppingBag, Users, Award, Package,
  Printer, FileText, Loader2, Sparkles, RefreshCw, Globe, Building2,
} from 'lucide-react'
import { ServerContext } from '../layout'
import { createSuperAdminClient, getProxyDownloadTarget } from '@/lib/superAdminClient'
import { createSalesApi, type Sale, downloadSalesReportPDF, downloadSalesReportExcel } from '@/lib/api/sales'
import { toast } from 'sonner'

export default function SuperAdminRapports() {
  const { selectedServer, isGlobalMode, selectedCompany } = useContext(ServerContext)

  const [sales, setSales] = useState<Sale[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<'jour' | 'semaine' | 'mois' | 'an'>('semaine')
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const loadSales = () => {
    if (isGlobalMode || !selectedCompany) {
      setSales([])
      return
    }
    let cancelled = false
    setIsLoading(true)
    setError(null)
    createSalesApi(createSuperAdminClient(selectedServer.id, selectedCompany.id)).getSales()
      .then((data) => { if (!cancelled) setSales(Array.isArray(data) ? data : []) })
      .catch((e) => {
        if (cancelled) return
        console.error('Erreur chargement rapports (super-admin)', e)
        setError('Impossible de charger les statistiques de cette entreprise.')
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }

  useEffect(loadSales, [selectedServer.id, selectedCompany, isGlobalMode])

  const getFilteredSales = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return sales.filter(s => {
      if (!s.created_at) return false
      const sDate = new Date(s.created_at)
      if (period === 'jour') return sDate >= today
      if (period === 'semaine') return sDate >= new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      if (period === 'mois') return sDate.getMonth() === now.getMonth() && sDate.getFullYear() === now.getFullYear()
      return sDate.getFullYear() === now.getFullYear()
    })
  }

  const filteredSales = getFilteredSales()
  const totalSales = filteredSales.reduce((acc, s) => acc + parseFloat(s.total_amount), 0)
  const totalTransactions = filteredSales.length
  const averageTicket = totalTransactions > 0 ? Math.round(totalSales / totalTransactions) : 0

  const categorySales = filteredSales.reduce((acc, s) => {
    s.items.forEach(item => {
      const cat = item.product_category || 'boisson'
      const amt = parseFloat(item.subtotal || '0') || (parseFloat(item.unit_price) * parseFloat(item.quantity))
      acc[cat] = (acc[cat] || 0) + amt
    })
    return acc
  }, {} as Record<string, number>)

  const productSales = filteredSales.reduce((acc, s) => {
    s.items.forEach(item => {
      const name = item.product_name || `Produit #${item.product}`
      const amt = parseFloat(item.subtotal || '0') || (parseFloat(item.unit_price) * parseFloat(item.quantity))
      acc[name] = (acc[name] || 0) + amt
    })
    return acc
  }, {} as Record<string, number>)
  const topProducts = Object.entries(productSales).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const employeeSales = filteredSales.reduce((acc, s) => {
    const name = s.cashier_name || 'Caissier Externe'
    acc[name] = (acc[name] || 0) + parseFloat(s.total_amount)
    return acc
  }, {} as Record<string, number>)
  const topEmployees = Object.entries(employeeSales).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const getChartData = () => {
    let labels: string[] = []
    let data: number[] = []
    if (period === 'jour') {
      labels = ['08h-10h', '10h-12h', '12h-14h', '14h-16h', '16h-18h', '18h-20h', '20h-22h', '22h-00h', '00h-08h']
      data = Array(labels.length).fill(0)
      filteredSales.forEach(s => {
        if (!s.created_at) return
        const hour = new Date(s.created_at).getHours()
        const amount = parseFloat(s.total_amount)
        if (hour >= 8 && hour < 10) data[0] += amount
        else if (hour >= 10 && hour < 12) data[1] += amount
        else if (hour >= 12 && hour < 14) data[2] += amount
        else if (hour >= 14 && hour < 16) data[3] += amount
        else if (hour >= 16 && hour < 18) data[4] += amount
        else if (hour >= 18 && hour < 20) data[5] += amount
        else if (hour >= 20 && hour < 22) data[6] += amount
        else if (hour >= 22 || hour < 0) data[7] += amount
        else data[8] += amount
      })
    } else if (period === 'semaine') {
      labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
      data = Array(7).fill(0)
      filteredSales.forEach(s => {
        if (!s.created_at) return
        const dayIdx = (new Date(s.created_at).getDay() + 6) % 7
        data[dayIdx] += parseFloat(s.total_amount)
      })
    } else if (period === 'mois') {
      labels = ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4']
      data = Array(4).fill(0)
      filteredSales.forEach(s => {
        if (!s.created_at) return
        const dateNum = new Date(s.created_at).getDate()
        const amount = parseFloat(s.total_amount)
        if (dateNum <= 7) data[0] += amount
        else if (dateNum <= 14) data[1] += amount
        else if (dateNum <= 21) data[2] += amount
        else data[3] += amount
      })
    } else {
      labels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
      data = Array(12).fill(0)
      filteredSales.forEach(s => {
        if (!s.created_at) return
        data[new Date(s.created_at).getMonth()] += parseFloat(s.total_amount)
      })
    }
    return { labels, data }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let accentColor = '#818cf8'
    let accentColorLight = 'rgba(129, 140, 248, 0.1)'
    try {
      const rootStyles = getComputedStyle(document.documentElement)
      const primaryVar = rootStyles.getPropertyValue('--theme-primary').trim()
      if (primaryVar) {
        const formattedVar = primaryVar.replace(/\s+/g, ',')
        accentColor = `rgb(${formattedVar})`
        accentColorLight = `rgba(${formattedVar}, 0.12)`
      }
    } catch (e) { console.error(e) }

    const { labels, data } = getChartData()
    const maxVal = Math.max(...data, 1000) * 1.15
    const w = canvas.width
    const h = canvas.height
    const paddingLeft = 60, paddingRight = 20, paddingTop = 40, paddingBottom = 40
    const chartW = w - paddingLeft - paddingRight
    const chartH = h - paddingTop - paddingBottom

    ctx.clearRect(0, 0, w, h)
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = paddingTop + (chartH / 4) * i
      ctx.beginPath()
      ctx.moveTo(paddingLeft, y)
      ctx.lineTo(w - paddingRight, y)
      ctx.stroke()
      ctx.fillStyle = '#94a3b8'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(Math.round(maxVal - (maxVal / 4) * i).toLocaleString() + ' F', paddingLeft - 10, y + 3)
    }
    if (data.length === 0) return

    if (chartType === 'bar') {
      const barW = Math.max(8, (chartW / data.length) - 10)
      data.forEach((val, i) => {
        const x = paddingLeft + (chartW / data.length) * i + ((chartW / data.length) - barW) / 2
        const barH = (val / maxVal) * chartH
        const y = paddingTop + chartH - barH
        const gradient = ctx.createLinearGradient(x, y, x, paddingTop + chartH)
        gradient.addColorStop(0, accentColor)
        gradient.addColorStop(1, accentColorLight)
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.roundRect(x, y, barW, barH, 4)
        ctx.fill()
        if (val > 0) {
          ctx.fillStyle = '#f1f5f9'
          ctx.font = '9px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText((val / 1000).toFixed(0) + 'k', x + barW / 2, y - 6)
        }
        ctx.fillStyle = '#94a3b8'
        ctx.font = '10px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(labels[i], x + barW / 2, paddingTop + chartH + 20)
      })
    } else {
      ctx.beginPath()
      ctx.strokeStyle = accentColor
      ctx.lineWidth = 3
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      const points = data.map((val, i) => ({
        x: paddingLeft + (chartW / (data.length - 1 || 1)) * i,
        y: paddingTop + chartH - (val / maxVal) * chartH,
      }))
      points.forEach((pt, i) => { if (i === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y) })
      ctx.stroke()
      const fillGradient = ctx.createLinearGradient(0, paddingTop, 0, paddingTop + chartH)
      fillGradient.addColorStop(0, accentColorLight)
      fillGradient.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.beginPath()
      ctx.moveTo(points[0].x, paddingTop + chartH)
      points.forEach(pt => ctx.lineTo(pt.x, pt.y))
      ctx.lineTo(points[points.length - 1].x, paddingTop + chartH)
      ctx.closePath()
      ctx.fillStyle = fillGradient
      ctx.fill()
      points.forEach((pt, i) => {
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, 4, 0, 2 * Math.PI)
        ctx.fillStyle = accentColor
        ctx.fill()
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, 2, 0, 2 * Math.PI)
        ctx.fillStyle = '#ffffff'
        ctx.fill()
        ctx.fillStyle = '#94a3b8'
        ctx.font = '10px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(labels[i], pt.x, paddingTop + chartH + 20)
      })
    }
  }, [filteredSales, period, chartType])

  const handleExportExcel = async () => {
    if (!selectedCompany) return
    try {
      const target = getProxyDownloadTarget(selectedServer.id, selectedCompany.id, `/sales/reports/excel/?period=${encodeURIComponent(period)}`)
      await downloadSalesReportExcel(period, target)
      toast.success(`Rapport de ventes Excel (.xlsx) pour la période [${period.toUpperCase()}] téléchargé avec succès !`)
    } catch (err) {
      toast.error("Échec de l'export Excel serveur pour cette entreprise.")
    }
  }

  const handleExportPDF = async () => {
    if (!selectedCompany) return
    try {
      const target = getProxyDownloadTarget(selectedServer.id, selectedCompany.id, `/sales/reports/pdf/?period=${encodeURIComponent(period)}`)
      await downloadSalesReportPDF(period, target)
      toast.success(`Rapport d'activité PDF pour la période [${period.toUpperCase()}] téléchargé avec succès !`)
    } catch (err) {
      window.print()
    }
  }

  if (isGlobalMode) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <Globe className="w-10 h-10" style={{ color: '#334155' }} />
        <p className="text-sm" style={{ color: '#94a3b8' }}>Sélectionnez une instance dans le menu pour voir ses rapports.</p>
      </div>
    )
  }

  if (!selectedCompany) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <Building2 className="w-10 h-10" style={{ color: '#334155' }} />
        <p className="text-sm" style={{ color: '#94a3b8' }}>Sélectionnez une entreprise dans le menu pour voir ses rapports.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        <p className="text-sm text-dark-400">Génération des analyses financières en cours...</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-500 flex items-center gap-2">Rapports & Analyses — {selectedCompany.name}</h1>
          <p className="text-sm mt-1 text-dark-400">Performance financière et suivi de l'établissement</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleExportPDF} className="px-4 py-2 rounded-xl text-white text-xs font-bold transition flex items-center gap-2 bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/10 active:scale-95">
            <Printer className="w-4 h-4" />Imprimer / PDF
          </button>
          <button onClick={handleExportExcel} className="px-4 py-2 rounded-xl text-white text-xs font-bold transition flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/10 active:scale-95">
            <Download className="w-4 h-4" />Excel
          </button>
          <button onClick={loadSales} className="p-2 rounded-xl text-dark-300 hover:text-white transition bg-white/5 border border-dark-800/40 hover:bg-white/10 active:scale-95" title="Rafraîchir">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>{error}</div>
      )}

      <div className="flex gap-2 pb-2 overflow-x-auto">
        {([
          { id: 'jour', label: "Aujourd'hui" },
          { id: 'semaine', label: '7 derniers jours' },
          { id: 'mois', label: 'Mois courant' },
          { id: 'an', label: 'Année civile' },
        ] as const).map(p => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${period === p.id ? 'bg-primary-500/15 border border-primary-500/30 text-primary-400 font-bold' : 'bg-dark-900 border border-dark-800/40 text-dark-300 hover:text-white hover:bg-white/5'}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-dark-800/40 glass-card">
          <div className="flex items-center gap-2 mb-2"><DollarSign className="w-4.5 h-4.5 text-accent-500" /><p className="text-xs text-dark-400 font-medium">Chiffre d'affaires</p></div>
          <p className="text-xl font-bold text-white">{totalSales.toLocaleString()} FCFA</p>
        </div>
        <div className="p-4 rounded-2xl border border-dark-800/40 glass-card">
          <div className="flex items-center gap-2 mb-2"><ShoppingBag className="w-4.5 h-4.5 text-primary-400" /><p className="text-xs text-dark-400 font-medium">Nombre de ventes</p></div>
          <p className="text-xl font-bold text-white">{totalTransactions}</p>
        </div>
        <div className="p-4 rounded-2xl border border-dark-800/40 glass-card">
          <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4.5 h-4.5 text-amber-500" /><p className="text-xs text-dark-400 font-medium">Panier moyen</p></div>
          <p className="text-xl font-bold text-white">{averageTicket.toLocaleString()} FCFA</p>
        </div>
        <div className="p-4 rounded-2xl border border-dark-800/40 glass-card">
          <div className="flex items-center gap-2 mb-2"><Award className="w-4.5 h-4.5 text-purple-400" /><p className="text-xs text-dark-400 font-medium">Meilleur vendeur</p></div>
          <p className="text-xl font-bold text-white truncate">{topEmployees[0]?.[0] || '---'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-dark-800/40 p-5 glass-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary-400" />Évolution des ventes ({period})</h3>
            <select value={chartType} onChange={(e) => setChartType(e.target.value as 'bar' | 'line')} className="px-3 py-1.5 rounded-xl text-xs outline-none bg-dark-950 border border-dark-800/60 text-dark-300">
              <option value="bar">Histogramme</option>
              <option value="line">Courbe</option>
            </select>
          </div>
          <canvas ref={canvasRef} width={600} height={300} className="w-full h-auto" />
        </div>

        <div className="rounded-2xl border border-dark-800/40 p-5 glass-card">
          <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2"><Package className="w-4 h-4 text-primary-400" />Top 5 Produits</h3>
          <div className="space-y-3">
            {topProducts.length === 0 ? <p className="text-xs text-dark-400 text-center py-6">Aucun produit vendu</p> : topProducts.map(([product, amount], i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2"><span className="text-xs font-extrabold text-dark-400">#{i + 1}</span><span className="text-white truncate max-w-[130px] font-medium">{product}</span></div>
                <span className="font-bold text-accent-500">{amount.toLocaleString()} F</span>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-5 border-t border-dark-800/30">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-dark-400 mb-3 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-yellow-500" />Répartition par catégorie</h4>
            <div className="space-y-2">
              {Object.keys(categorySales).length === 0 ? <p className="text-xs text-dark-400 text-center py-2">Aucune donnée</p> : Object.entries(categorySales).map(([cat, amount]) => (
                <div key={cat} className="flex items-center justify-between text-xs font-semibold"><span className="text-dark-300 capitalize">{cat}s</span><span className="text-white">{amount.toLocaleString()} FCFA</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-dark-800/40 p-5 glass-card">
          <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-primary-400" />Performance des Employés</h3>
          <div className="space-y-4">
            {topEmployees.length === 0 ? <p className="text-xs text-dark-400 text-center py-6">Aucune vente enregistrée par un employé</p> : topEmployees.map(([emp, amount], i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold text-white" style={{ background: ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][i % 5] }}>
                    {emp.split(' ').map(w => w[0]).join('').toUpperCase()}
                  </div>
                  <span className="text-white font-medium">{emp}</span>
                </div>
                <span className="font-bold text-accent-500">{amount.toLocaleString()} FCFA</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-dark-800/40 p-5 glass-card">
          <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2"><FileBarChart className="w-4 h-4 text-primary-400" />Résumé Analytique (Période)</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-dark-800/20"><span className="text-dark-400 font-medium">Volume d'affaires total</span><span className="text-white font-bold">{totalSales.toLocaleString()} FCFA</span></div>
            <div className="flex justify-between py-2 border-b border-dark-800/20"><span className="text-dark-400 font-medium">Nombre de transactions facturées</span><span className="text-white font-bold">{totalTransactions}</span></div>
            <div className="flex justify-between py-2 border-b border-dark-800/20"><span className="text-dark-400 font-medium">Valeur panier moyen</span><span className="text-white font-bold">{averageTicket.toLocaleString()} FCFA</span></div>
            <div className="flex justify-between py-2"><span className="text-dark-400 font-medium">Catégorie dominante</span><span className="text-white font-bold capitalize">{Object.entries(categorySales).sort((a, b) => b[1] - a[1])[0]?.[0] || '---'}</span></div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-dark-800/40 p-5 glass-card w-full mt-6">
        <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-primary-400" />Détail analytique des transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-dark-800/60 text-xs font-bold text-dark-400 uppercase tracking-wider">
                <th className="pb-3 pr-2">ID Vente</th>
                <th className="pb-3 px-2">Date & Heure</th>
                <th className="pb-3 px-2">Caisse</th>
                <th className="pb-3 px-2">Caissier</th>
                <th className="pb-3 px-2">Articles vendus</th>
                <th className="pb-3 pl-2 text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800/20 text-xs text-dark-300">
              {filteredSales.length === 0 ? (
                <tr><td colSpan={6} className="py-6 text-center text-dark-500">Aucune transaction sur cette période.</td></tr>
              ) : filteredSales.map((s) => {
                const dateFormatted = s.created_at ? new Date(s.created_at).toLocaleString() : ''
                const itemsString = s.items.map(item => `${parseFloat(item.quantity)}x ${item.product_name}`).join(', ')
                return (
                  <tr key={s.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-3 pr-2 font-mono font-bold text-white">#{s.id}</td>
                    <td className="py-3 px-2 whitespace-nowrap">{dateFormatted}</td>
                    <td className="py-3 px-2 whitespace-nowrap">{s.cash_register_name || 'Caisse Principale'}</td>
                    <td className="py-3 px-2 whitespace-nowrap">{s.cashier_name || 'Caissier'}</td>
                    <td className="py-3 px-2 max-w-xs truncate" title={itemsString}>{itemsString}</td>
                    <td className="py-3 pl-2 text-right font-bold text-accent-500 whitespace-nowrap">{parseFloat(s.total_amount).toLocaleString()} FCFA</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
