interface KPICardProps {
  label: string
  value: string | number
  color?: string
  icon?: React.ReactNode
  subtitle?: string
}

export function KPICard({ label, value, icon, subtitle }: KPICardProps) {
  return (
    <div 
      className="p-5 rounded-2xl glass-card hover:glass-card-hover relative overflow-hidden group border border-dark-800/40 hover:border-primary-500/20"
    >
      {/* Lueur d'arrière-plan interactive - couleur constante du thème */}
      <div 
        className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-10 bg-primary-500 transition-all duration-300 group-hover:scale-125 group-hover:opacity-20"
      />
      
      <div className="flex items-center justify-between mb-3 relative z-10">
        <p className="text-xs uppercase tracking-wider text-dark-400 font-bold">{label}</p>
        {icon && (
          <span 
            className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.02] text-dark-300 transition-colors duration-200 group-hover:text-white"
          >
            {icon}
          </span>
        )}
      </div>
      
      <div className="relative z-10">
        <p 
          className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-primary-500"
        >
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-dark-500 font-medium mt-1.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-dark-500 inline-block shrink-0" />
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}