import { 
  Building2, Users, CreditCard, TrendingUp, 
  Activity, AlertTriangle, CheckCircle, Clock
} from 'lucide-react'

// Données mockées
const stats = [
  { label: 'Entreprises', value: '156', change: '+12%', icon: Building2, color: '#818cf8' },
  { label: 'Utilisateurs', value: '1 247', change: '+8%', icon: Users, color: '#22c55e' },
  { label: 'Abonnements actifs', value: '142', change: '+5%', icon: CreditCard, color: '#f59e0b' },
  { label: 'Revenus mensuels', value: '1 234 000 F', change: '+15%', icon: TrendingUp, color: '#22c55e' },
]

const recentActivities = [
  { id: 1, action: 'Nouvelle entreprise inscrite', company: 'Bar Le Soleil', user: 'Jean M.', time: 'Il y a 5 min', status: 'success' },
  { id: 2, action: 'Abonnement Premium activé', company: 'Snack Le Délice', user: 'Marie K.', time: 'Il y a 15 min', status: 'success' },
  { id: 3, action: 'Tentative de connexion suspecte', company: 'Boîte VIP', user: 'Inconnu', time: 'Il y a 30 min', status: 'warning' },
  { id: 4, action: 'Nouvel utilisateur ajouté', company: 'Restaurant La Terrasse', user: 'Admin', time: 'Il y a 1h', status: 'success' },
  { id: 5, action: 'Paiement échoué', company: 'Bar Le Premium', user: 'François T.', time: 'Il y a 2h', status: 'error' },
]

const pendingActions = [
  { id: 1, label: 'Documents à vérifier', count: 7, color: '#f59e0b' },
  { id: 2, label: 'Abonnements expirant', count: 3, color: '#ef4444' },
  { id: 3, label: 'Nouvelles demandes', count: 12, color: '#818cf8' },
]

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Tableau de bord</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            Vue d'ensemble de la plateforme NOXIA
          </p>
        </div>
        <div className="flex gap-2">
          <span className="text-xs px-3 py-1 rounded-full flex items-center gap-1" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
            <Activity className="w-3 h-3" />
            Système opérationnel
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div 
              key={i}
              className="p-4 rounded-xl border"
              style={{ 
                background: '#1e293b',
                borderColor: '#334155'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs" style={{ color: '#94a3b8' }}>{stat.label}</p>
                <Icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs" style={{ color: '#22c55e' }}>{stat.change}</p>
            </div>
          )
        })}
      </div>

      {/* Actions en attente */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {pendingActions.map((action) => (
          <div 
            key={action.id}
            className="p-3 rounded-xl border flex items-center justify-between"
            style={{ 
              background: '#1e293b',
              borderColor: '#334155'
            }}
          >
            <span className="text-sm" style={{ color: '#94a3b8' }}>{action.label}</span>
            <span 
              className="text-sm font-bold px-2 py-0.5 rounded-full"
              style={{ 
                background: `${action.color}20`,
                color: action.color
              }}
            >
              {action.count}
            </span>
          </div>
        ))}
      </div>

      {/* Activités récentes */}
      <div 
        className="rounded-xl border p-4"
        style={{ 
          background: '#1e293b',
          borderColor: '#334155'
        }}
      >
        <h3 className="font-semibold text-sm text-white mb-3">Activités récentes</h3>
        <div className="space-y-2">
          {recentActivities.map((activity) => (
            <div 
              key={activity.id}
              className="flex items-center justify-between p-2 rounded-lg text-sm"
              style={{ 
                background: activity.status === 'error' 
                  ? 'rgba(239, 68, 68, 0.05)' 
                  : activity.status === 'warning'
                  ? 'rgba(245, 158, 11, 0.05)'
                  : 'rgba(34, 197, 94, 0.05)'
              }}
            >
              <div className="flex items-center gap-3">
                {activity.status === 'success' && <CheckCircle className="w-4 h-4" style={{ color: '#22c55e' }} />}
                {activity.status === 'warning' && <AlertTriangle className="w-4 h-4" style={{ color: '#f59e0b' }} />}
                {activity.status === 'error' && <AlertTriangle className="w-4 h-4" style={{ color: '#ef4444' }} />}
                <div>
                  <span className="text-white">{activity.action}</span>
                  <span className="text-xs ml-2" style={{ color: '#94a3b8' }}>{activity.company}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs" style={{ color: '#64748b' }}>{activity.user}</span>
                <span className="text-xs" style={{ color: '#64748b' }}>{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}