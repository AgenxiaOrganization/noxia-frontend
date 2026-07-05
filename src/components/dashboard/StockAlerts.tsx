const alerts = [
  { product: 'Bière Guinness', stock: 12, threshold: 15 },
  { product: 'Whisky Jack Daniel\'s', stock: 8, threshold: 5 },
  { product: 'Champagne Moet', stock: 6, threshold: 3 },
]

export function StockAlerts() {
  return (
    <div 
      className="p-4 rounded-xl border"
      style={{ 
        background: '#1e293b',
        borderColor: '#334155'
      }}
    >
      <h3 className="font-semibold text-sm mb-4 text-white">Alertes stock</h3>
      <div className="space-y-2">
        {alerts.map((a, i) => (
          <div 
            key={i} 
            className="flex items-center justify-between p-2 rounded-lg text-sm"
            style={{ 
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}
          >
            <div className="flex items-center gap-2">
              <span style={{ color: '#f87171' }}>⚠</span>
              <span className="text-white">{a.product}</span>
            </div>
            <div className="text-right">
              <span className="text-xs" style={{ color: '#fca5a5' }}>
                {a.stock} / {a.threshold} unités
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}