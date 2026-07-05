'use client'

import { Menu, Bell } from 'lucide-react'
import { useState, useEffect } from 'react'

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const [time, setTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(now.toLocaleString('fr-FR', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }))
    }
    updateTime()
    const interval = setInterval(updateTime, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header 
      className="h-14 border-b flex items-center justify-between px-4 sm:px-6 shrink-0"
      style={{ 
        borderColor: '#1e293b',
        background: 'rgba(30, 41, 59, 0.5)'
      }}
    >
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick} 
          className="md:hidden hover:text-white transition"
          style={{ color: '#94a3b8' }}
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="font-semibold text-sm truncate max-w-[120px] sm:max-w-none text-white">
          Tableau de bord
        </h2>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative cursor-pointer">
          <Bell className="w-5 h-5" style={{ color: '#94a3b8' }} />
          <span 
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[10px] flex items-center justify-center font-bold"
            style={{ background: '#ef4444' }}
          >
            3
          </span>
        </div>
        <span className="text-xs hidden sm:block" style={{ color: '#94a3b8' }}>{time}</span>
      </div>
    </header>
  )
}