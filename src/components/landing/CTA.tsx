export function CTA() {
  return (
    <section 
      className="py-20"
      style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #312e81 70%, #4f46e5 100%)' 
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div 
          className="rounded-3xl p-6 sm:p-12 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)'
          }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
            Prêt à transformer votre gestion ?
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-lg mx-auto">
            Rejoignez les établissements qui pilotent leur activité avec NOXIA. Essai gratuit de 5 jours.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="/register" 
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:shadow-xl transition transform hover:-translate-y-0.5"
              style={{ 
                background: '#ffffff',
                color: '#4f46e5'
              }}
            >
              Démarrer maintenant
            </a>
            <a 
              href="#contact" 
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl border border-white/30 text-white font-semibold text-base sm:text-lg hover:bg-white/10 transition"
            >
              Parler à un conseiller
            </a>
          </div>
          <p className="text-white/50 text-sm mt-6">
            Sans engagement. Carte bancaire non requise pour l'essai gratuit.
          </p>
        </div>
      </div>
    </section>
  )
}