'use client'

import { useEffect, useRef } from 'react'

export function SalesChart({ data = [], period = 'day' }: { data: any[], period: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Récupère la couleur du thème active
    const themePrimaryRaw = getComputedStyle(document.documentElement).getPropertyValue('--theme-primary').trim() || '99 102 241'
    const themePrimaryClean = themePrimaryRaw.replace(/\s+/g, ',')
    const themePrimary = themePrimaryRaw.includes('#') ? themePrimaryRaw : `rgb(${themePrimaryClean})`
    const themePrimaryFade = themePrimaryRaw.includes('#') ? themePrimaryRaw + '15' : `rgba(${themePrimaryClean}, 0.15)`

    const w = canvas.width
    const h = canvas.height
    const padding = 35
    const chartW = w - padding * 2
    const chartH = h - padding * 2 - 10

    const values = data.map(d => Number(d.value))
    const labels = data.map(d => d.label)
    const max = data.length > 0 ? Math.max(...values, 1000) * 1.2 : 1000
    const barW = data.length > 0 ? chartW / values.length - 8 : 0

    // Efface le fond pour garder la transparence du verre
    ctx.clearRect(0, 0, w, h)

    // Lignes de grille ultra-fines et discrètes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.lineWidth = 0.5
    for (let i = 0; i < 4; i++) {
      const y = padding + (chartH / 4) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(w - padding, y)
      ctx.stroke()
    }

    if (data.length > 0) {
      // Dessin des barres avec le gradient de couleur du thème actif
      values.forEach((value, i) => {
        const x = padding + (chartW / values.length) * i + 4
        const barH = (value / max) * chartH
        const y = padding + chartH - barH

        const gradient = ctx.createLinearGradient(x, y, x, padding + chartH)
        gradient.addColorStop(0, themePrimary)
        gradient.addColorStop(1, themePrimaryFade) // 15% opacité
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.roundRect(x, y, barW, barH, 4)
        ctx.fill()

        // Labels textuels sous les barres
        ctx.fillStyle = '#64748b'
        ctx.font = '10px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(labels[i], x + barW / 2, padding + chartH + 15)
      })
    } else {
      // État vide
      ctx.fillStyle = '#475569'
      ctx.font = '11px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Aucune donnée disponible', w / 2, h / 2)
    }

  }, [data, period])

  const title = period === 'day' 
    ? 'Ventes par heure' 
    : period === 'week' 
      ? 'Ventes de la semaine' 
      : period === 'month' 
        ? 'Ventes du mois' 
        : 'Ventes de l\'année'

  return (
    <div 
      className="p-5 rounded-2xl border border-dark-800/40 glass-card h-[320px] flex flex-col justify-between relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-display font-bold text-sm text-primary-500 tracking-tight">{title}</h3>
      </div>
      <div className="flex-1 relative w-full h-[220px]">
        <canvas ref={canvasRef} width={500} height={200} className="w-full h-full object-contain" />
      </div>
    </div>
  )
}