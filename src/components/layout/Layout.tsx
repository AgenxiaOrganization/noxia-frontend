'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './Topbar'

export function Layout({ children, banner }: { children: React.ReactNode; banner?: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('noxia_theme') || 'indigo'
    const savedBg = localStorage.getItem('noxia_bg') || 'slate'
    const savedCollapse = localStorage.getItem('noxia_sidebar_collapsed') === 'true'
    const root = document.documentElement
    
    // Accent Theme
    root.classList.remove('theme-indigo', 'theme-emerald', 'theme-ocean', 'theme-white-pure', 'theme-white-soft')
    if (savedTheme !== 'indigo') {
      root.classList.add(`theme-${savedTheme}`)
    }
    
    // Background Theme
    root.classList.remove('bg-slate', 'bg-oled', 'bg-abysse', 'bg-white-pure', 'bg-white-soft')
    if (savedBg !== 'slate') {
      root.classList.add(`bg-${savedBg}`)
    }

    setSidebarCollapsed(savedCollapse)
  }, [])

  const toggleSidebarCollapse = () => {
    const val = !sidebarCollapsed
    setSidebarCollapsed(val)
    localStorage.setItem('noxia_sidebar_collapsed', String(val))
  }

  return (
    <div className="flex h-screen bg-dark-950 text-white">
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {banner}
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}