'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
// import { TopBar } from './TopBar'
import { TopBar } from './Topbar' // Correction du nom du fichier pour correspondre à la casse exacte

export function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen" style={{ background: '#0f172a' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}