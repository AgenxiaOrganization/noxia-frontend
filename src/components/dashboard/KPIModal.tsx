'use client'

import { X } from 'lucide-react'

interface KPIModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  data: Array<{ label: string; value: string | number; date?: string }>
}

export function KPIModal({ isOpen, onClose, title, data }: KPIModalProps) {
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg rounded-2xl p-6 max-h-[80vh] overflow-y-auto"
        style={{ 
          background: '#1e293b',
          border: '1px solid #334155'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition" style={{ color: '#94a3b8' }}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-2">
          {data.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#334155' }}>
              <div>
                <span className="text-sm text-white">{item.label}</span>
                {item.date && <span className="text-xs ml-2" style={{ color: '#64748b' }}>{item.date}</span>}
              </div>
              <span className="text-sm font-semibold" style={{ color: '#22c55e' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}