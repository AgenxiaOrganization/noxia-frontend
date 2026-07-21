'use client'

import { useState, useEffect, useRef } from 'react'

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
      className="p-5 rounded-2xl border border-dark-800/40 glass-card flex flex-col h-[320px] justify-between relative overflow-hidden"
    >
      <div>
        <div className="flex items-center justify-between mb-3 border-b border-dark-800/30 pb-2">
          <h3 className="font-display font-bold text-sm text-primary-500 tracking-tight">Dernières transactions</h3>
          <span className="text-xs font-semibold flex items-center gap-1.5 text-accent-500">
            <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse bg-accent-500" />
            Live
          </span>
        </div>
      </div>
      
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto space-y-2 pr-1 my-2 max-h-[200px] scrollbar-thin"
      >
        {transactions.length === 0 ? (
          <p className="text-xs text-center mt-10 text-dark-500 font-medium">Aucune transaction récente.</p>
        ) : (
          transactions.map((t, i) => {
            const dateObj = new Date(t.date)
            const timeStr = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            
            const methodLabels: Record<string, string> = {
              cash: 'Espèces',
              mobile_money: 'Mobile Money',
              card: 'Carte bancaire',
              other: 'Autre'
            }
            const methodLabel = methodLabels[t.method] || t.method || 'Espèces'

            return (
              <div 
                key={i} 
                className={`flex items-center justify-between text-sm py-2 border-b border-dark-800/20 transition-all duration-300 gap-2 ${
                  i === 0 ? 'bg-primary-500/5 rounded-lg px-2 border-b-transparent' : ''
                }`} 
              >
                {/* Gauche : Heure + Caissier */}
                <div className="flex items-center gap-1.5 min-w-0 shrink-0">
                  <span className="text-[10px] text-dark-400 font-mono font-medium">{timeStr}</span>
                  <span className="text-white truncate font-semibold text-xs max-w-[70px]">{t.cashier}</span>
                </div>

                {/* Milieu : Articles vendus (Tronqué) */}
                <div className="flex-1 min-w-0 px-2">
                  <span 
                    className="text-[10px] text-dark-400 font-medium truncate block max-w-[160px]" 
                    title={t.items}
                  >
                    {t.items || '---'}
                  </span>
                </div>

                {/* Droite : Montant + Mode de paiement */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold text-accent-500 text-xs">{Number(t.amount).toLocaleString()} F</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-dark-950/60 border border-dark-800/60 text-dark-400 font-bold whitespace-nowrap">
                    {methodLabel}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
      
      <div className="text-[10px] text-dark-500 font-medium pt-1 border-t border-dark-800/10">
        {transactions.length} transactions • Mise à jour en direct
      </div>
    </div>
  )
}