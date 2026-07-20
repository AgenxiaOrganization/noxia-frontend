'use client'

import { useEffect, useRef } from 'react'

export function SalesChart({ data = [], period = 'day' }: { data: any[], period: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

    const values = data.map(d => Number(d.value))
    const labels = data.map(d => d.label)
    const max = data.length > 0 ? Math.max(...values, 1000) * 1.2 : 1000
    const barW = data.length > 0 ? chartW / values.length - 8 : 0

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
    }

    if (data.length > 0) {
      // Bars
      values.forEach((value, i) => {
        const x = padding + (chartW / values.length) * i + 4
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
        ctx.fillText(labels[i], x + barW / 2, padding + chartH + 20)
      })
    } else {
      // Empty state text
      ctx.fillStyle = '#64748b'
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Aucune donnée disponible', w / 2, h / 2)
    }

    // Titre
    ctx.fillStyle = '#94a3b8'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'left'
    const title = period === 'day' ? 'Ventes par heure' : period === 'week' ? 'Ventes de la semaine' : period === 'month' ? 'Ventes du mois' : 'Ventes de l\'année'
    ctx.fillText(title, padding, 20)

  }, [data, period])

  return (
    <div 
      className="p-4 rounded-xl border h-full"
      style={{ 
        background: '#1e293b',
        borderColor: '#334155'
      }}
    >
      <canvas ref={canvasRef} width={500} height={250} className="w-full h-auto" />
    </div>
  )
}