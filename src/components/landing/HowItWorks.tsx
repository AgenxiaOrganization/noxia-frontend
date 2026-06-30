export function HowItWorks() {
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
            Comment ça marche ?
          </h2>
          <p className="text-lg" style={{ color: '#94a3b8' }}>
            Activez votre établissement en moins de 5 minutes.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { number: '1', title: 'Inscrivez-vous', description: 'Créez votre compte en 30 secondes et choisissez votre plan.' },
            { number: '2', title: 'Configurez', description: 'Ajoutez vos produits, employés et caisses. Interface intuitive.' },
            { number: '3', title: 'Activez WhatsApp', description: 'Envoyez votre ID unique au bot. Vos employés font de même.' },
            { number: '4', title: 'Pilotez', description: 'Gérer tout depuis WhatsApp, Telegram ou le tableau de bord web.' }
          ].map((step) => (
            <div key={step.number} className="text-center">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4"
                style={{ 
                  background: 'rgba(99, 102, 241, 0.2)',
                  color: '#818cf8'
                }}
              >
                {step.number}
              </div>
              <h3 className="font-semibold mb-2 text-white">{step.title}</h3>
              <p className="text-sm" style={{ color: '#94a3b8' }}>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}