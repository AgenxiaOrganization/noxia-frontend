interface KPICardProps {
  label: string
  value: string | number
  color: string
  icon?: React.ReactNode
  subtitle?: string
}

export function KPICard({ label, value, color, icon, subtitle }: KPICardProps) {
  return (
    <div 
      className="p-4 rounded-xl border transition-all hover:border-primary-500"
      style={{ 
        background: '#1e293b',
        borderColor: '#334155'
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm" style={{ color: '#94a3b8' }}>{label}</p>
        {icon && <span style={{ color: '#64748b' }}>{icon}</span>}
      </div>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      {subtitle && <p className="text-xs mt-1" style={{ color: '#64748b' }}>{subtitle}</p>}
    </div>
  )
}