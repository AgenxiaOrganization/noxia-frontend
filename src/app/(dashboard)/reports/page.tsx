'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  FileBarChart, Download, Calendar, TrendingUp, TrendingDown,
  DollarSign, ShoppingBag, Users, Award, Package, ChevronDown,
  Printer, FileText, Loader2, Sparkles, RefreshCw
} from 'lucide-react'
import { getSales, Sale, downloadSalesReportPDF, downloadSalesReportExcel } from '@/lib/api/sales'
import { toast } from 'sonner'

const logoBase64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiB3aWR0aD0iNjQiIGhlaWdodD0iNjQiPgogIDxkZWZzPgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzYzNjZmMSIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMxMGI5ODEiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxjaXJjbGUgY3g9IjI1NiIgY3k9IjI1NiIgcj0iMTkwIiBmaWxsPSJub25lIiBzdHJva2U9InVybCgjZykiIHN0cm9rZS13aWR0aD0iMTIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWRhc2hhcnJheT0iOTgwIDEyMCIvPgogIDxjaXJjbGUgY3g9IjQwNSIgY3k9IjE0MCIgcj0iMTEiIGZpbGw9IiMyREQ0RkYiLz4KICA8Y2lyY2xlIGN4PSIxMDciIGN5PSIzNzIiIHI9IjExIiBmaWxsPSIjMkRENEZGIi8+CiAgPHBhdGggZD0iTTE2MCAzNDAgTTE2MCAxNzAgUTE2MCAxNTAgMTgwIDE1MCBMMjA1IDE1MCBMMzA3IDI4NSBMMzA3IDE3MCBRMzA3IDE1MCAzMjcgMTUwIEwzNTIgMTUwIFEzNzIgMTUwIDM3MiAxNzAgTDM3MiAzNDAgUTM3MiAzNjAgMzUyIDM2MCBMMzI0IDM2MCBMMjI1IDIyOCBMMjI1IDM0MCBRMjI1IDM2MCAyMDUgMzYwIEwxODAgMzYwIFExNjAgMzYwIDE2MCAzNDBaIiBmaWxsPSJ1cmwoI2cpIi8+Cjwvc3ZnPg=="

const getLogoPngDataUrl = (): string => {
  if (typeof window === 'undefined') return ''
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  // Dessiner le gradient
  const grad = ctx.createLinearGradient(0, 0, 128, 128)
  grad.addColorStop(0, '#6366f1')
  grad.addColorStop(1, '#10b981')

  // Cercle orbite
  ctx.strokeStyle = grad
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(64, 64, 48, 0, 2 * Math.PI)
  ctx.stroke()

  // Nœuds bleus
  ctx.fillStyle = '#2dd4ff'
  ctx.beginPath()
  ctx.arc(98, 30, 3, 0, 2 * Math.PI)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(30, 98, 3, 0, 2 * Math.PI)
  ctx.fill()

  // Lettre N au centre
  ctx.fillStyle = grad
  ctx.font = 'bold 44px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('N', 64, 64)

  return canvas.toDataURL('image/png')
}

export default function ReportsPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState<'jour' | 'semaine' | 'mois' | 'an'>('semaine')
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Charger les ventes
  const loadSales = async () => {
    setIsLoading(true)
    try {
      const data = await getSales()
      if (data && typeof data === 'object' && 'results' in data) {
        setSales((data as any).results || [])
      } else if (Array.isArray(data)) {
        setSales(data)
      } else {
        setSales([])
      }
    } catch (e) {
      console.error(e)
      toast.error("Impossible de charger les statistiques de vente.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSales()
  }, [])

  // Filtrer les ventes selon la période
  const getFilteredSales = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    return sales.filter(s => {
      if (!s.created_at) return false
      const sDate = new Date(s.created_at)

      if (period === 'jour') {
        return sDate >= today
      } else if (period === 'semaine') {
        const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        return sDate >= oneWeekAgo
      } else if (period === 'mois') {
        return sDate.getMonth() === now.getMonth() && sDate.getFullYear() === now.getFullYear()
      } else { // an
        return sDate.getFullYear() === now.getFullYear()
      }
    })
  }

  const filteredSales = getFilteredSales()

  // Calculs des indicateurs (KPIs)
  const totalSales = filteredSales.reduce((acc, s) => acc + parseFloat(s.total_amount), 0)
  const totalTransactions = filteredSales.length
  const averageTicket = totalTransactions > 0 ? Math.round(totalSales / totalTransactions) : 0

  // Répartition par catégorie
  const categorySales = filteredSales.reduce((acc, s) => {
    s.items.forEach(item => {
      const cat = item.product_category || 'boisson'
      const amt = parseFloat(item.subtotal || '0') || (parseFloat(item.unit_price) * parseFloat(item.quantity))
      acc[cat] = (acc[cat] || 0) + amt
    })
    return acc
  }, {} as Record<string, number>)

  // Meilleurs produits vendus (Top 5)
  const productSales = filteredSales.reduce((acc, s) => {
    s.items.forEach(item => {
      const name = item.product_name || `Produit #${item.product}`
      const amt = parseFloat(item.subtotal || '0') || (parseFloat(item.unit_price) * parseFloat(item.quantity))
      acc[name] = (acc[name] || 0) + amt
    })
    return acc
  }, {} as Record<string, number>)

  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Classement des caissiers (Top Employés)
  const employeeSales = filteredSales.reduce((acc, s) => {
    const name = s.cashier_name || 'Caissier Externe'
    acc[name] = (acc[name] || 0) + parseFloat(s.total_amount)
    return acc
  }, {} as Record<string, number>)

  const topEmployees = Object.entries(employeeSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Agrégation pour le graphique
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
    } else { // an
      labels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
      data = Array(12).fill(0)
      filteredSales.forEach(s => {
        if (!s.created_at) return
        const month = new Date(s.created_at).getMonth()
        data[month] += parseFloat(s.total_amount)
      })
    }

    return { labels, data }
  }

  // Tracer le graphique adaptatif
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Obtenir la couleur d'accent actuelle du thème pour le dessin du graphique
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
    } catch (e) {
      console.error(e)
    }

    const { labels, data } = getChartData()
    const maxVal = Math.max(...data, 1000) * 1.15

    const w = canvas.width
    const h = canvas.height
    const paddingLeft = 60
    const paddingRight = 20
    const paddingTop = 40
    const paddingBottom = 40
    const chartW = w - paddingLeft - paddingRight
    const chartH = h - paddingTop - paddingBottom

    ctx.clearRect(0, 0, w, h)

    // Lignes de grille
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

      const points = data.map((val, i) => {
        const x = paddingLeft + (chartW / (data.length - 1 || 1)) * i
        const y = paddingTop + chartH - (val / maxVal) * chartH
        return { x, y }
      })

      points.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y)
        else ctx.lineTo(pt.x, pt.y)
      })
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

  // --- Exports réels ---
  const handleExportExcel = async () => {
    try {
      await downloadSalesReportExcel(period)
      toast.success(`Rapport de ventes Excel (.xlsx) pour la période [${period.toUpperCase()}] téléchargé avec succès !`)
    } catch (err) {
      if (filteredSales.length === 0) {
        toast.error("Aucune donnée disponible à exporter.")
        return
      }

      const logoPng = getLogoPngDataUrl()
      const excelHtml = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
        <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
        <style>
          body { font-family: Arial, sans-serif; }
          .title { font-size: 18px; font-weight: bold; color: #4f46e5; }
          .subtitle { font-size: 11px; color: #64748b; margin-bottom: 15px; }
          .th { background-color: #1e1b4b; color: #ffffff; font-weight: bold; text-align: center; padding: 8px; border: 1px solid #cbd5e1; }
          .td { padding: 6px; border: 1px solid #cbd5e1; vertical-align: middle; }
          .kpi-title { font-weight: bold; background-color: #f8fafc; }
          .kpi-val { font-weight: bold; color: #059669; }
          .currency { mso-number-format:"\\#\\,\\#\\#0\\ \\FCFA"; text-align: right; }
        </style>
        </head>
        <body>
          <table>
            <tr>
              <td colspan="7" class="title">NOXIA - RAPPORT DE VENTES POS (.XLSX)</td>
            </tr>
            <tr>
              <td colspan="7" class="subtitle">Analyse d'activité | Généré le : ${new Date().toLocaleString()} | Période : ${period.toUpperCase()}</td>
            </tr>
            <tr></tr>
            <tr>
              <td class="kpi-title" colspan="3">Chiffre d'Affaires Brut :</td>
              <td class="kpi-val" colspan="4">${totalSales.toLocaleString()} FCFA</td>
            </tr>
            <tr>
              <td class="kpi-title" colspan="3">Nombre Total de Transactions :</td>
              <td class="kpi-val" colspan="4">${totalTransactions}</td>
            </tr>
            <tr>
              <td class="kpi-title" colspan="3">Panier Moyen / Ticket :</td>
              <td class="kpi-val" colspan="4">${averageTicket.toLocaleString()} FCFA</td>
            </tr>
            <tr></tr>
            <!-- En-têtes -->
            <tr>
              <td class="th">ID Vente</td>
              <td class="th">Caisse POS</td>
              <td class="th">Caissier / Agent</td>
              <td class="th">Date & Heure</td>
              <td class="th">Moyen de Paiement</td>
              <td class="th">Montant Total</td>
              <td class="th">Articles vendus</td>
            </tr>
            ${filteredSales.map(s => {
              const dateFormatted = s.created_at ? new Date(s.created_at).toLocaleString() : ''
              const itemsString = s.items.map(item => `${parseFloat(item.quantity)}x ${item.product_name}`).join(', ')
              return `
                <tr>
                  <td class="td">#${s.id}</td>
                  <td class="td">${s.cash_register_name || 'Caisse Principale'}</td>
                  <td class="td">${s.cashier_name || 'Caissier'}</td>
                  <td class="td">${dateFormatted}</td>
                  <td class="td">${s.payment_method === 'cash' ? 'Espèces' : s.payment_method}</td>
                  <td class="td currency">${parseFloat(s.total_amount)}</td>
                  <td class="td">${itemsString}</td>
                </tr>
              `
            }).join('')}
          </table>
        </body>
        </html>
      `

      const blob = new Blob(['\ufeff' + excelHtml], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `Rapport_Ventes_${period}_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success("Rapport Excel (.xlsx) exporté avec succès !")
    }
  }

  const handleExportWord = () => {
    if (filteredSales.length === 0) {
      toast.error("Aucune donnée disponible à exporter.")
      return
    }

    const logoPng = getLogoPngDataUrl()
    const verifUrl = typeof window !== 'undefined' ? `${window.location.origin}/verify-doc` : 'http://127.0.0.1:3000/verify-doc'
    const docHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>Rapport d'Activité Ventes Noxia</title>
      <style>
        body { font-family: Arial, sans-serif; color: #1e293b; padding: 20px; }
        .header-table { width: 100%; border: none; margin-bottom: 20px; }
        .logo-td { width: 80px; text-align: left; vertical-align: middle; }
        .title-td { text-align: left; vertical-align: middle; }
        .title { color: #4f46e5; font-size: 24px; font-weight: bold; margin: 0; }
        .subtitle { color: #64748b; font-size: 12px; margin: 5px 0 0 0; }
        table.data-table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        table.data-table th, table.data-table td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-size: 12px; }
        table.data-table th { background-color: #1e1b4b; color: white; font-weight: bold; }
        .summary-box { margin-top: 20px; background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
        .footer-box { margin-top: 30px; border-top: 2px solid #4f46e5; padding-top: 10px; font-size: 11px; color: #64748b; }
      </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td class="logo-td">
              <img src="${logoPng}" width="60" height="60" alt="NOXIA" />
            </td>
            <td class="title-td">
              <div class="title">NOXIA Smart SaaS - RAPPORT DE VENTES</div>
              <div class="subtitle">Généré le : ${new Date().toLocaleString()} | Période d'analyse : ${period.toUpperCase()}</div>
            </td>
          </tr>
        </table>
        
        <div class="summary-box">
          <h3 style="margin-top: 0; color: #4f46e5;">Synthèse & Indicateurs Clés (KPIs)</h3>
          <p style="margin: 5px 0;"><strong>Chiffre d'affaires Brut :</strong> ${totalSales.toLocaleString()} FCFA</p>
          <p style="margin: 5px 0;"><strong>Nombre total de ventes :</strong> ${totalTransactions}</p>
          <p style="margin: 5px 0;"><strong>Panier moyen par ticket :</strong> ${averageTicket.toLocaleString()} FCFA</p>
        </div>

        <h2 style="margin-top: 30px; font-size: 16px; border-bottom: 2px solid #6366f1; padding-bottom: 5px;">Détail analytique des transactions POS</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>ID Vente</th>
              <th>Date & Heure</th>
              <th>Caisse</th>
              <th>Caissier</th>
              <th>Articles vendus</th>
              <th>Montant Total</th>
            </tr>
          </thead>
          <tbody>
            ${filteredSales.map(s => {
              const dateFormatted = s.created_at ? new Date(s.created_at).toLocaleString() : ''
              const itemsString = s.items.map(item => `${parseFloat(item.quantity)}x ${item.product_name}`).join(', ')
              return `
                <tr>
                  <td>#${s.id}</td>
                  <td>${dateFormatted}</td>
                  <td>${s.cash_register_name || 'Caisse Principale'}</td>
                  <td>${s.cashier_name || 'Caissier'}</td>
                  <td>${itemsString}</td>
                  <td>${parseFloat(s.total_amount).toLocaleString()} FCFA</td>
                </tr>
              `
            }).join('')}
          </tbody>
        </table>

        <div class="footer-box">
          <p><strong>DOCUMENT CERTIFIÉ CONFORME NOXIA SMART SAAS</strong></p>
          <p>Vérification d'authenticité en ligne : <a href="${verifUrl}">${verifUrl}</a></p>
        </div>
      </body>
      </html>
    `

    const blob = new Blob(['\ufeff' + docHtml], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Rapport_Ventes_${period}.doc`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Rapport Word (.doc) certifié exporté avec succès !")
  }

  const handleExportPDF = async () => {
    try {
      await downloadSalesReportPDF(period)
      toast.success(`Rapport d'activité PDF pour la période [${period.toUpperCase()}] téléchargé avec succès !`)
    } catch (err) {
      window.print()
    }
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
    <div className="p-4 sm:p-6 space-y-6 print-full">
      {/* Balise de style d'impression pour un PDF parfait */}
      <style jsx global>{`
        @media print {
          header, aside, .no-print, button, select {
            display: none !important;
          }
          main, .print-full {
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            color: black !important;
          }
          .glass-card {
            background: none !important;
            border: 1px solid #cbd5e1 !important;
            color: black !important;
          }
          h1, h2, h3, p, span, td, th {
            color: black !important;
          }
        }
      `}</style>

      {/* HEADER D'IMPRESSION (Exclusif au PDF, masqué sur ordinateur) */}
      <div className="hidden print:flex items-center justify-between border-b border-dark-800/40 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <img src={logoBase64} width="50" height="50" alt="NOXIA" />
          <div>
            <h1 className="text-xl font-bold text-black font-display leading-tight">NOXIA - RAPPORT D'ACTIVITÉ</h1>
            <p className="text-xs text-dark-500">Performance et analyses financières</p>
          </div>
        </div>
        <div className="text-right text-xs text-dark-500">
          <p><strong>Rapport généré le :</strong> {new Date().toLocaleString()}</p>
          <p><strong>Période d'analyse :</strong> {period.toUpperCase()}</p>
        </div>
      </div>

      {/* HEADER ÉCRAN (Masqué lors de l'impression) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-primary-500 flex items-center gap-2">
            <img src={logoBase64} width="32" height="32" alt="NOXIA" className="animate-pulse" />
            Rapports & Analyses
          </h1>
          <p className="text-sm mt-1 text-dark-400">
            Performance financière et suivi de l'établissement
          </p>
        </div>
        
        {/* BOUTONS EXPORTS */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 rounded-xl text-white text-xs font-bold transition flex items-center gap-2 bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/10 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            Imprimer / PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 rounded-xl text-white text-xs font-bold transition flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/10 active:scale-95"
          >
            <Download className="w-4 h-4" />
            Excel
          </button>
          <button
            onClick={handleExportWord}
            className="px-4 py-2 rounded-xl text-white text-xs font-bold transition flex items-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/10 active:scale-95"
          >
            <FileText className="w-4 h-4" />
            Word
          </button>
          <button
            onClick={loadSales}
            className="p-2 rounded-xl text-dark-300 hover:text-white transition bg-white/5 border border-dark-800/40 hover:bg-white/10 active:scale-95"
            title="Rafraîchir"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* FILTRE PÉRIODES */}
      <div className="flex gap-2 pb-2 overflow-x-auto no-print">
        {([
          { id: 'jour', label: "Aujourd'hui" },
          { id: 'semaine', label: '7 derniers jours' },
          { id: 'mois', label: 'Mois courant' },
          { id: 'an', label: 'Année civile' }
        ] as const).map(p => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              period === p.id 
                ? 'bg-primary-500/15 border border-primary-500/30 text-primary-400 font-bold' 
                : 'bg-dark-900 border border-dark-800/40 text-dark-300 hover:text-white hover:bg-white/5'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* STATS RAPIDES (KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-dark-800/40 glass-card">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4.5 h-4.5 text-accent-500" />
            <p className="text-xs text-dark-400 font-medium">Chiffre d'affaires</p>
          </div>
          <p className="text-xl font-bold text-white">{totalSales.toLocaleString()} FCFA</p>
        </div>
        <div className="p-4 rounded-2xl border border-dark-800/40 glass-card">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="w-4.5 h-4.5 text-primary-400" />
            <p className="text-xs text-dark-400 font-medium">Nombre de ventes</p>
          </div>
          <p className="text-xl font-bold text-white">{totalTransactions}</p>
        </div>
        <div className="p-4 rounded-2xl border border-dark-800/40 glass-card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4.5 h-4.5 text-amber-500" />
            <p className="text-xs text-dark-400 font-medium">Panier moyen</p>
          </div>
          <p className="text-xl font-bold text-white">{averageTicket.toLocaleString()} FCFA</p>
        </div>
        <div className="p-4 rounded-2xl border border-dark-800/40 glass-card">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4.5 h-4.5 text-purple-400" />
            <p className="text-xs text-dark-400 font-medium">Meilleur vendeur</p>
          </div>
          <p className="text-xl font-bold text-white truncate">{topEmployees[0]?.[0] || '---'}</p>
        </div>
      </div>

      {/* GRAPHIC & TOP PRODUCTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Le Graphique */}
        <div className="lg:col-span-2 rounded-2xl border border-dark-800/40 p-5 glass-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary-400" />
              Évolution des ventes ({period})
            </h3>
            <select 
              value={chartType}
              onChange={(e) => setChartType(e.target.value as 'bar' | 'line')}
              className="px-3 py-1.5 rounded-xl text-xs outline-none bg-dark-950 border border-dark-800/60 text-dark-300 no-print"
            >
              <option value="bar">Histogramme</option>
              <option value="line">Courbe</option>
            </select>
          </div>
          <canvas ref={canvasRef} width={600} height={300} className="w-full h-auto" />
        </div>

        {/* Top Produits */}
        <div className="rounded-2xl border border-dark-800/40 p-5 glass-card">
          <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-primary-400" />
            Top 5 Produits
          </h3>
          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-xs text-dark-400 text-center py-6">Aucun produit vendu</p>
            ) : (
              topProducts.map(([product, amount], i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-dark-400">#{i + 1}</span>
                    <span className="text-white truncate max-w-[130px] font-medium">{product}</span>
                  </div>
                  <span className="font-bold text-accent-500">
                    {amount.toLocaleString()} F
                  </span>
                </div>
              ))
            )}
          </div>
          
          {/* Par Catégorie */}
          <div className="mt-5 pt-5 border-t border-dark-800/30">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-dark-400 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
              Répartition par catégorie
            </h4>
            <div className="space-y-2">
              {Object.keys(categorySales).length === 0 ? (
                <p className="text-xs text-dark-400 text-center py-2">Aucune donnée</p>
              ) : (
                Object.entries(categorySales).map(([cat, amount]) => (
                  <div key={cat} className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-dark-300 capitalize">{cat}s</span>
                    <span className="text-white">{amount.toLocaleString()} FCFA</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TOP CAISSIERS & RÉSUMÉ ANALYTIQUE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Caissiers */}
        <div className="rounded-2xl border border-dark-800/40 p-5 glass-card">
          <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary-400" />
            Performance des Employés
          </h3>
          <div className="space-y-4">
            {topEmployees.length === 0 ? (
              <p className="text-xs text-dark-400 text-center py-6">Aucune vente enregistrée par un employé</p>
            ) : (
              topEmployees.map(([emp, amount], i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold text-white"
                      style={{ 
                        background: ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][i % 5] 
                      }}
                    >
                      {emp.split(' ').map(w => w[0]).join('').toUpperCase()}
                    </div>
                    <span className="text-white font-medium">{emp}</span>
                  </div>
                  <span className="font-bold text-accent-500">
                    {amount.toLocaleString()} FCFA
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Résumé Analytique */}
        <div className="rounded-2xl border border-dark-800/40 p-5 glass-card">
          <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
            <FileBarChart className="w-4 h-4 text-primary-400" />
            Résumé Analytique (Période)
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-dark-800/20">
              <span className="text-dark-400 font-medium">Volume d'affaires total</span>
              <span className="text-white font-bold">{totalSales.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between py-2 border-b border-dark-800/20">
              <span className="text-dark-400 font-medium">Nombre de transactions facturées</span>
              <span className="text-white font-bold">{totalTransactions}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-dark-800/20">
              <span className="text-dark-400 font-medium">Valeur panier moyen</span>
              <span className="text-white font-bold">{averageTicket.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-dark-400 font-medium">Catégorie dominante</span>
              <span className="text-white font-bold capitalize">
                {Object.entries(categorySales).sort((a, b) => b[1] - a[1])[0]?.[0] || '---'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* TABLEAU ANALYTIQUE DÉTAILLÉ (Aussi affiché lors de l'impression PDF) */}
      <div className="rounded-2xl border border-dark-800/40 p-5 glass-card w-full mt-6">
        <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary-400" />
          Détail analytique des transactions
        </h3>
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
                <tr>
                  <td colSpan={6} className="py-6 text-center text-dark-500">
                    Aucune transaction sur cette période.
                  </td>
                </tr>
              ) : (
                filteredSales.map((s) => {
                  const dateFormatted = s.created_at ? new Date(s.created_at).toLocaleString() : ''
                  const itemsString = s.items.map(item => `${parseFloat(item.quantity)}x ${item.product_name}`).join(', ')
                  return (
                    <tr key={s.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-3 pr-2 font-mono font-bold text-white">#{s.id}</td>
                      <td className="py-3 px-2 whitespace-nowrap">{dateFormatted}</td>
                      <td className="py-3 px-2 whitespace-nowrap">{s.cash_register_name || 'Caisse Principale'}</td>
                      <td className="py-3 px-2 whitespace-nowrap">{s.cashier_name || 'Caissier'}</td>
                      <td className="py-3 px-2 max-w-xs truncate" title={itemsString}>{itemsString}</td>
                      <td className="py-3 pl-2 text-right font-bold text-accent-500 whitespace-nowrap">
                        {parseFloat(s.total_amount).toLocaleString()} FCFA
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}