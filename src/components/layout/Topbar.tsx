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
    <header className="h-14 border-b border-dark-700 flex items-center justify-between px-4 sm:px-6 bg-dark-800/50 shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="md:hidden text-dark-300 hover:text-white">
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="font-semibold text-sm truncate max-w-[120px] sm:max-w-none">Tableau de bord</h2>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative cursor-pointer">
          <Bell className="w-5 h-5 text-dark-400" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">3</span>
        </div>
        <span className="text-xs text-dark-400 hidden sm:block">{time}</span>
      </div>
    </header>
  )
}