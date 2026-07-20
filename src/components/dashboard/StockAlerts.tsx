export function StockAlerts({ alerts = [] }: { alerts: any[] }) {
  return (
    <div 
      className="p-4 rounded-xl border h-full"
      style={{ 
        background: '#1e293b',
        borderColor: '#334155'
      }}
    >
      <h3 className="font-semibold text-sm mb-4 text-white">Alertes stock</h3>
      <div className="space-y-2">
        {alerts.length === 0 ? (
          <p className="text-sm text-center py-4" style={{ color: '#64748b' }}>Aucun produit en alerte.</p>
        ) : (
          alerts.map((a, i) => (
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
              <span className="text-white">{a.product_name}</span>
            </div>
            <div className="text-right">
              <span className="text-xs" style={{ color: '#fca5a5' }}>
                {a.quantity} / {a.threshold} unités
              </span>
            </div>
          </div>
        )))}
      </div>
    </div>
  )
}