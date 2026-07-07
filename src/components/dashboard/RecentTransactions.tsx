'use client'

import { useState, useEffect, useRef } from 'react'

const mockEmployees = ['Jean M.', 'Marie K.', 'Chloé R.', 'François T.', 'Pierre O.', 'Sophie N.']
const mockProducts = ['Whisky Jack', 'Bière Castel', 'Cocktail Mojito', 'Champagne Moet', 'Brochettes', 'Burger Classic']
const mockPayments = ['Espèces', 'Mobile Money', 'Carte']

// Générer une transaction aléatoire
const generateRandomTransaction = () => {
  const now = new Date()
  const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const amount = Math.floor(Math.random() * 45000) + 1500
  const product = mockProducts[Math.floor(Math.random() * mockProducts.length)]
  const employee = mockEmployees[Math.floor(Math.random() * mockEmployees.length)]
  const payment = mockPayments[Math.floor(Math.random() * mockPayments.length)]
  
  return {
    product,
    amount,
    payment,
    time,
    employee,
    id: Date.now() + Math.random()
  }
}

// Générer 15 transactions initiales
const generateInitialTransactions = () => {
  const transactions = []
  for (let i = 0; i < 15; i++) {
    const t = generateRandomTransaction()
    const d = new Date()
    d.setMinutes(d.getMinutes() - Math.floor(Math.random() * 120))
    t.time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    transactions.push(t)
  }
  return transactions.sort((a, b) => {
    const [aH, aM] = a.time.split(':').map(Number)
    const [bH, bM] = b.time.split(':').map(Number)
    return (bH * 60 + bM) - (aH * 60 + aM)
  })
}

export function RecentTransactions() {
  const [transactions, setTransactions] = useState(generateInitialTransactions)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)

  // Ajouter une nouvelle transaction toutes les 3-8 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      const newTransaction = generateRandomTransaction()
      setTransactions(prev => [newTransaction, ...prev])
      
      // Limiter à 50 transactions pour éviter de surcharger
      setTransactions(prev => prev.slice(0, 50))
    }, 3000 + Math.random() * 5000)

    return () => clearInterval(interval)
  }, [])

  // Scroll auto si on est en bas
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
  className="p-4 rounded-xl border flex flex-col h-full"
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
        style={{ maxHeight: '330px' }}
      >
        {transactions.map((t, i) => (
          <div 
            key={t.id} 
            className={`flex items-center justify-between text-sm py-1.5 border-b transition-all duration-300 ${
              i === 0 ? 'bg-green-500/5 rounded-lg px-2' : ''
            }`} 
            style={{ borderColor: '#334155' }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs" style={{ color: '#94a3b8' }}>{t.time}</span>
              <span className="text-white truncate">{t.employee}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-medium" style={{ color: '#22c55e' }}>{t.amount.toLocaleString()} F</span>
              <span className="text-xs" style={{ color: '#64748b' }}>{t.payment}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-2 text-xs" style={{ color: '#64748b' }}>
        {transactions.length} transactions • Mise à jour en direct
      </div>
    </div>
  )
}