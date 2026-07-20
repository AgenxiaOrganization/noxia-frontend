'use client'

import { useState, useEffect, useRef } from 'react'

// Plus de génération de données factices.

export function RecentTransactions({ transactions = [] }: { transactions: any[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)

  // Scroll auto
  useEffect(() => {
    if (containerRef.current && isAtBottom) {
      containerRef.current.scrollTop = 0
    }
  }, [transactions, isAtBottom])

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop } = containerRef.current
      setIsAtBottom(scrollTop === 0)
    }
  }



  return (
    <div 
      className="p-4 rounded-xl border flex flex-col h-full min-h-[300px]"
      style={{ 
        background: '#1e293b',
        borderColor: '#334155'
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-white">Dernières transactions</h3>
        <span className="text-xs" style={{ color: '#22c55e' }}>
          <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse mr-1" style={{ background: '#22c55e' }} />
          Live
        </span>
      </div>
      
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto space-y-2 pr-1"
      >
        {transactions.length === 0 ? (
          <p className="text-sm text-center mt-10" style={{ color: '#64748b' }}>Aucune transaction récente.</p>
        ) : (
          transactions.map((t, i) => {
            const dateObj = new Date(t.date)
            const timeStr = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            return (
              <div 
                key={i} 
                className={`flex items-center justify-between text-sm py-1.5 border-b transition-all duration-300 ${
                  i === 0 ? 'bg-green-500/5 rounded-lg px-2' : ''
                }`} 
                style={{ borderColor: '#334155' }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs" style={{ color: '#94a3b8' }}>{timeStr}</span>
                  <span className="text-white truncate">{t.cashier}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-medium" style={{ color: '#22c55e' }}>{Number(t.amount).toLocaleString()} F</span>
                  <span className="text-xs" style={{ color: '#64748b' }}>{t.method === 'cash' ? 'Espèces' : t.method}</span>
                </div>
              </div>
            )
          })
        )}
      </div>
      
      <div className="mt-2 text-xs" style={{ color: '#64748b' }}>
        {transactions.length} transactions • Mise à jour en direct
      </div>
    </div>
  )
}