'use client'

import { useEffect, useRef } from 'react'

export function SalesChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Données simulées
    const data = [200000, 250000, 180000, 300000, 280000, 400000, 350000]
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    
    const w = canvas.width
    const h = canvas.height
    const padding = 40
    const chartW = w - padding * 2
    const chartH = h - padding * 2
    const max = Math.max(...data) * 1.2
    const barW = chartW / data.length - 8

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

    // Bars
    data.forEach((value, i) => {
      const x = padding + (chartW / data.length) * i + 4
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
    })

    // Titre
    ctx.fillStyle = '#94a3b8'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('Ventes de la semaine', padding, 20)

  }, [])

  return (
    <div 
      className="p-4 rounded-xl border"
      style={{ 
        background: '#1e293b',
        borderColor: '#334155'
      }}
    >
      <canvas ref={canvasRef} width={500} height={250} className="w-full h-auto" />
    </div>
  )
}