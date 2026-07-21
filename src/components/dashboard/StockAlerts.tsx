export function StockAlerts({ alerts = [] }: { alerts: any[] }) {
  return (
    <div 
      className="p-5 rounded-2xl border border-dark-800/40 glass-card h-full relative overflow-hidden flex flex-col"
    >
      <h3 className="font-display font-bold text-sm text-primary-500 mb-4 tracking-tight">Alertes stock</h3>
      <div className="space-y-2 flex-1">
        {alerts.length === 0 ? (
          <p className="text-xs text-center py-4 text-dark-500 font-medium">Aucun produit en alerte.</p>
        ) : (
          alerts.map((a, i) => (
            <div 
              key={i} 
              className="flex items-center justify-between p-2.5 rounded-xl text-sm bg-red-500/10 border border-red-500/20"
            >
              <div className="flex items-center gap-2">
                <span className="text-red-500 font-bold">⚠</span>
                <span className="text-white font-medium">{a.product_name}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-red-500">
                  {a.quantity} / {a.threshold} unités
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}