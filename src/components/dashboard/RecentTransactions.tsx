const transactions = [
  { product: 'Whisky Jack Daniel\'s', amount: 25000, payment: 'Espèces', time: '10:32' },
  { product: 'Bière Castel x3', amount: 4500, payment: 'Mobile Money', time: '10:15' },
  { product: 'Cocktail Mojito x2', amount: 10000, payment: 'Carte', time: '09:45' },
  { product: 'Champagne Moet', amount: 45000, payment: 'Espèces', time: '09:10' },
  { product: 'Brochettes Poulet x4', amount: 14000, payment: 'Mobile Money', time: '08:50' },
]

export function RecentTransactions() {
  return (
    <div 
      className="p-4 rounded-xl border"
      style={{ 
        background: '#1e293b',
        borderColor: '#334155'
      }}
    >
      <h3 className="font-semibold text-sm mb-4 text-white">Dernières transactions</h3>
      <div className="space-y-2">
        {transactions.map((t, i) => (
          <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b" style={{ borderColor: '#334155' }}>
            <div>
              <span className="text-white">{t.product}</span>
              <span className="text-xs ml-2" style={{ color: '#64748b' }}>{t.time}</span>
            </div>
            <div className="text-right">
              <span className="font-medium" style={{ color: '#22c55e' }}>{t.amount.toLocaleString()} F</span>
              <span className="text-xs ml-2" style={{ color: '#64748b' }}>{t.payment}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}