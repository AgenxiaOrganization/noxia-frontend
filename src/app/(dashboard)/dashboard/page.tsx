export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      <div className="p-4 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
        <p className="text-sm" style={{ color: '#94a3b8' }}>CA du jour</p>
        <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>0 FCFA</p>
      </div>
      <div className="p-4 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
        <p className="text-sm" style={{ color: '#94a3b8' }}>Ventes</p>
        <p className="text-2xl font-bold" style={{ color: '#818cf8' }}>0</p>
      </div>
      <div className="p-4 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
        <p className="text-sm" style={{ color: '#94a3b8' }}>Stock</p>
        <p className="text-2xl font-bold" style={{ color: '#f59e0b' }}>0</p>
      </div>
      <div className="p-4 rounded-xl border" style={{ background: '#1e293b', borderColor: '#334155' }}>
        <p className="text-sm" style={{ color: '#94a3b8' }}>Employés</p>
        <p className="text-2xl font-bold" style={{ color: '#8b5cf6' }}>0</p>
      </div>
    </div>
  );
}