const testimonials = [
  {
    quote: "NOXIA a transformé la gestion de notre bar. Le suivi des stocks en temps réel nous fait économiser des milliers de FCFA chaque mois.",
    name: "Jean-Daniel M.",
    role: "Bar Le Premium, Libreville",
    initials: "JD",
    color: "#6366f1"
  },
  {
    quote: "La gestion via WhatsApp est révolutionnaire. Je peux vérifier mes stocks et mes ventes sans même ouvrir mon ordinateur.",
    name: "Marie K.",
    role: "Snack Le Délice, Port-Gentil",
    initials: "MK",
    color: "#22c55e"
  },
  {
    quote: "L'assistant IA est bluffant. Je lui pose des questions en français et il me répond instantanément avec les chiffres exacts.",
    name: "Alain B.",
    role: "Boîte de nuit Le VIP, Franceville",
    initials: "AL",
    color: "#8b5cf6"
  }
]

export function Testimonials() {
  return (
    <section 
      className="py-20"
      style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #312e81 70%, #4f46e5 100%)' 
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
            Ils nous font confiance
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, index) => (
            <div 
              key={index}
              className="rounded-2xl p-6"
              style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <p className="text-sm mb-4 leading-relaxed" style={{ color: '#cbd5e1' }}>"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: t.color }}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">{t.name}</p>
                  <p className="text-xs" style={{ color: '#64748b' }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}