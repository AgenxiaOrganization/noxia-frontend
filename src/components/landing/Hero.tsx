export function Hero() {
  return (
    <section 
      className="min-h-screen flex items-center pt-16"
      style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #312e81 70%, #4f46e5 100%)' 
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div className="animate-slide-up">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6"
              style={{ 
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#818cf8'
              }}
            >
              <span 
                className="w-2 h-2 rounded-full animate-pulse-dot"
                style={{ background: '#22c55e' }}
              ></span>
              Lancement beta - Rejoignez les premiers clients
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 text-white">
              L'
              <span 
                className="text-transparent bg-clip-text"
                style={{ 
                  background: 'linear-gradient(to right, #818cf8, #4ade80)',
                  WebkitBackgroundClip: 'text'
                }}
              >
                OS intelligent
              </span> 
              pour votre bar ou restaurant
            </h1>
            
            <p className="text-base sm:text-lg mb-8 max-w-lg leading-relaxed" style={{ color: '#94a3b8' }}>
              Gérer vos stocks, vos ventes et votre équipe n'a jamais été aussi simple. 
              Pilotez tout depuis votre téléphone, WhatsApp ou Telegram.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <a 
                href="/register" 
                className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-white font-semibold text-base sm:text-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 text-center"
                style={{ 
                  background: 'linear-gradient(to right, #4f46e5, #6366f1)',
                  boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
                }}
              >
                Démarrer gratuitement
              </a>
              <a 
                href="#demo" 
                className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-white font-semibold text-base sm:text-lg hover:border-primary-500 transition text-center"
                style={{ 
                  border: '1px solid #334155',
                  color: '#94a3b8'
                }}
              >
                Voir la démo
              </a>
            </div>

            <div className="flex items-center gap-6 mt-8 text-sm" style={{ color: '#64748b' }}>
              <div className="flex -space-x-2">
                {['JD', 'MK', 'AL'].map((initials, i) => (
                  <div 
                    key={i} 
                    className="w-8 h-8 rounded-full border-2 border-dark-800 flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: '#6366f1' }}
                  >
                    {initials}
                  </div>
                ))}
                <div 
                  className="w-8 h-8 rounded-full border-2 border-dark-800 flex items-center justify-center text-xs"
                  style={{ background: '#475569', color: '#94a3b8' }}
                >
                  +12
                </div>
              </div>
              <span style={{ color: '#94a3b8' }}>Déjà 15 établissements nous font confiance</span>
            </div>
          </div>

          {/* Right Column - Dashboard Preview */}
          <div className="relative hidden lg:block animate-float">
            <div 
              className="rounded-2xl p-2 shadow-2xl"
              style={{ 
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <div className="rounded-xl overflow-hidden border border-dark-700" style={{ background: '#1e293b' }}>
                <div className="flex items-center gap-2 px-4 py-3 border-b border-dark-700" style={{ background: 'rgba(15, 23, 42, 0.5)' }}>
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }}></span>
                    <span className="w-3 h-3 rounded-full" style={{ background: '#eab308' }}></span>
                    <span className="w-3 h-3 rounded-full" style={{ background: '#22c55e' }}></span>
                  </div>
                  <span className="text-xs ml-3" style={{ color: '#94a3b8' }}>NOXIA Dashboard</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg p-3" style={{ background: 'rgba(51, 65, 85, 0.5)' }}>
                      <p className="text-xs" style={{ color: '#94a3b8' }}>CA du jour</p>
                      <p className="text-lg font-bold" style={{ color: '#22c55e' }}>450 000 FCFA</p>
                    </div>
                    <div className="rounded-lg p-3" style={{ background: 'rgba(51, 65, 85, 0.5)' }}>
                      <p className="text-xs" style={{ color: '#94a3b8' }}>Ventes</p>
                      <p className="text-lg font-bold" style={{ color: '#818cf8' }}>127</p>
                    </div>
                  </div>
                  <div className="rounded-lg p-3 space-y-2" style={{ background: 'rgba(51, 65, 85, 0.5)' }}>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>Dernières transactions</p>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span style={{ color: '#f1f5f9' }}>Whisky Jack Daniel's</span>
                        <span style={{ color: '#22c55e' }}>25 000 F</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: '#f1f5f9' }}>Bière Castel x3</span>
                        <span style={{ color: '#22c55e' }}>4 500 F</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: '#f1f5f9' }}>Cocktail Mojito x2</span>
                        <span style={{ color: '#22c55e' }}>10 000 F</span>
                      </div>
                    </div>
                  </div>
                  <div 
                    className="flex items-center gap-2 rounded-lg p-2.5 text-xs"
                    style={{ 
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)'
                    }}
                  >
                    <span style={{ color: '#f87171' }}>⚠</span>
                    <span style={{ color: '#fca5a5' }}>Stock faible : Bière Castel (8 unités)</span>
                  </div>
                </div>
              </div>
            </div>
            <div 
              className="absolute -bottom-4 -right-4 rounded-xl p-3 text-xs shadow-xl"
              style={{ 
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <div className="flex items-center gap-2">
                <span style={{ color: '#22c55e' }}>✓</span> Sync en temps réel
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}