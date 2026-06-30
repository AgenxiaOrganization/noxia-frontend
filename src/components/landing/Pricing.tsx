const plans = [
  {
    name: 'Starter',
    description: 'Pour démarrer et tester',
    price: 'Gratuit',
    period: '5 jours',
    featured: false,
    features: [
      'Tableau de bord',
      'Gestion des ventes',
      'Gestion des stocks',
      'Rapports basiques',
      'WhatsApp & Telegram',
    ],
    notIncluded: [
      'Multi-utilisateurs',
      'Assistant IA',
      'Multi-établissements'
    ],
    cta: 'Commencer gratuitement',
    href: '/register'
  },
  {
    name: 'Premium',
    description: 'Pour les établissements en croissance',
    price: '49 900',
    period: 'FCFA/mois',
    featured: true,
    features: [
      'Tout Starter +',
      'Rapports avancés',
      'Multi-utilisateurs',
      'Multi-caisses',
      'Multi-établissements',
      'Assistant IA',
      'API publique'
    ],
    notIncluded: [],
    cta: 'Choisir Premium',
    href: '/register'
  },
  {
    name: 'Business',
    description: 'Pour les groupes et franchises',
    price: 'Sur devis',
    period: '',
    featured: false,
    features: [
      'Tout Premium +',
      'Support prioritaire 24/7',
      'Formation équipe',
      'Déploiement personnalisé',
      'Intégrations sur mesure',
      'SLA garanti'
    ],
    notIncluded: [],
    cta: 'Nous contacter',
    href: '#contact'
  }
]

export function Pricing() {
  return (
    <section 
      className="py-20"
      style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #312e81 70%, #4f46e5 100%)' 
      }}
      id="pricing"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
            Plans d'abonnement
          </h2>
          <p className="text-lg" style={{ color: '#94a3b8' }}>
            Choisissez le plan adapté à votre établissement. Évoluez à tout moment.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className="rounded-2xl p-8 relative transition-all"
              style={{
                background: plan.featured 
                  ? 'linear-gradient(to bottom, rgba(99, 102, 241, 0.2), rgba(49, 46, 129, 0.2))'
                  : 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                border: plan.featured 
                  ? '2px solid #6366f1'
                  : '1px solid rgba(255,255,255,0.1)',
                transform: plan.featured ? 'translateY(-8px)' : 'none'
              }}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-xs font-bold"
                  style={{ background: '#6366f1' }}
                >
                  Recommandé
                </div>
              )}
              <h3 className="text-xl font-bold text-white" style={{ marginTop: plan.featured ? '8px' : '0' }}>{plan.name}</h3>
              <p className="text-sm mb-4" style={{ color: '#94a3b8' }}>{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                {plan.period && (
                  <span className="text-sm" style={{ color: '#94a3b8' }}>/{plan.period}</span>
                )}
              </div>
              <ul className="space-y-3 mb-8 text-sm">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2" style={{ color: '#cbd5e1' }}>
                    <span style={{ color: '#22c55e' }}>✓</span>
                    {feature}
                  </li>
                ))}
                {plan.notIncluded.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2" style={{ color: '#475569' }}>
                    <span>✗</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <a 
                href={plan.href}
                className="block text-center py-3 rounded-xl text-white font-semibold transition"
                style={{
                  background: plan.featured ? '#4f46e5' : 'transparent',
                  border: plan.featured ? 'none' : '1px solid #475569',
                  boxShadow: plan.featured ? '0 10px 25px -5px rgba(99, 102, 241, 0.3)' : 'none'
                }}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}