const transactions = [
  { product: 'Whisky Jack Daniel\'s', amount: 25000, payment: 'Espèces', time: '10:32', employee: 'Jean M.' },
  { product: 'Bière Castel x3', amount: 4500, payment: 'Mobile Money', time: '10:15', employee: 'Marie K.' },
  { product: 'Cocktail Mojito x2', amount: 10000, payment: 'Carte', time: '09:45', employee: 'Chloé R.' },
  { product: 'Champagne Moet', amount: 45000, payment: 'Espèces', time: '09:10', employee: 'François T.' },
  { product: 'Brochettes Poulet x4', amount: 14000, payment: 'Mobile Money', time: '08:50', employee: 'Pierre O.' },
  { product: 'Whisky Jack Daniel\'s', amount: 25000, payment: 'Carte', time: '08:20', employee: 'Sophie N.' },
  { product: 'Cocktail Mojito', amount: 5000, payment: 'Espèces', time: '07:55', employee: 'Jean M.' },
  { product: 'Bière Guinness x2', amount: 4000, payment: 'Mobile Money', time: '07:30', employee: 'Marie K.' },
]

export function RecentTransactions() {
  return (
    <div 
      className="p-4 rounded-xl border flex flex-col h-[300px]"
      style={{ 
        background: '#1e293b',
        borderColor: '#334155'
      }}
    >
      <h3 className="font-semibold text-sm mb-3 text-white">Dernières transactions</h3>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {transactions.map((t, i) => (
          <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b" style={{ borderColor: '#334155' }}>
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
    </div>
  )
}