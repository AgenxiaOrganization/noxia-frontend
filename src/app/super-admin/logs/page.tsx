import { Search, FileText, Clock, Filter } from 'lucide-react'

// Données mockées
const mockLogs = [
  { id: 1, action: 'Connexion', user: 'Super Admin', target: 'Système', details: 'Connexion réussie', time: '2026-07-10 10:30:00', type: 'info' },
  { id: 2, action: 'Création entreprise', user: 'Super Admin', target: 'Bar Le Soleil', details: 'Nouvelle entreprise créée', time: '2026-07-10 10:15:00', type: 'success' },
  { id: 3, action: 'Modification abonnement', user: 'Super Admin', target: 'Restaurant La Terrasse', details: 'Passage de Premium à Starter', time: '2026-07-10 09:45:00', type: 'warning' },
  { id: 4, action: 'Échec paiement', user: 'Système', target: 'Snack Le Délice', details: 'Paiement échoué - carte expirée', time: '2026-07-10 09:00:00', type: 'error' },
  { id: 5, action: 'Suppression utilisateur', user: 'Super Admin', target: 'Jean M.', details: 'Utilisateur supprimé', time: '2026-07-10 08:30:00', type: 'warning' },
]

export default function SuperAdminLogs() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Journal d'audit</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            {mockLogs.length} événements enregistrés
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition flex items-center gap-2"
            style={{ 
              background: 'rgba(51, 65, 85, 0.5)',
              border: '1px solid #334155'
            }}
          >
            <Filter className="w-4 h-4" />
            Filtrer
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
        <input
          type="text"
          placeholder="Rechercher dans les logs..."
          className="w-full rounded-lg px-4 py-2.5 pl-10 text-white text-sm outline-none transition"
          style={{ 
            background: 'rgba(51, 65, 85, 0.5)',
            border: '1px solid #334155'
          }}
        />
      </div>

      <div 
        className="rounded-xl border overflow-hidden"
        style={{ 
          background: '#1e293b',
          borderColor: '#334155'
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: '#334155' }}>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Heure</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Utilisateur</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Cible</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Détails</th>
                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Type</th>
              </tr>
            </thead>
            <tbody>
              {mockLogs.map((log) => (
                <tr key={log.id} className="border-b" style={{ borderColor: '#334155' }}>
                  <td className="px-4 py-3 text-xs" style={{ color: '#94a3b8' }}>{log.time}</td>
                  <td className="px-4 py-3 text-white">{log.action}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#94a3b8' }}>{log.user}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#94a3b8' }}>{log.target}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#94a3b8' }}>{log.details}</td>
                  <td className="px-4 py-3">
                    <span 
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: log.type === 'error' ? 'rgba(239, 68, 68, 0.15)' :
                                  log.type === 'warning' ? 'rgba(245, 158, 11, 0.15)' :
                                  log.type === 'success' ? 'rgba(34, 197, 94, 0.15)' :
                                  'rgba(99, 102, 241, 0.15)',
                        color: log.type === 'error' ? '#ef4444' :
                               log.type === 'warning' ? '#f59e0b' :
                               log.type === 'success' ? '#22c55e' :
                               '#818cf8'
                      }}
                    >
                      {log.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}