export function Footer() {
  return (
    <footer 
      className="py-12"
      style={{ 
        borderTop: '1px solid #1e293b',
        background: '#0f172a'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                {/* <img 
                  src="/logos/NOXIA_Orbit_Logo.svg" 
                  alt="NOXIA" 
                  className="w-6 h-6"
                /> */}
              </div>
              {/* <span className="text-xl font-bold text-white">
                NOXIA<span className="text-primary-400">.</span>
              </span> */}
            </div>
            {/* <p className="text-sm" style={{ color: '#64748b' }}>
              L'OS intelligent pour les bars, snack-bars et boîtes de nuit.
            </p> */}
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Produit</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-white transition" style={{ color: '#94a3b8' }}>Fonctionnalités</a></li>
              <li><a href="#pricing" className="hover:text-white transition" style={{ color: '#94a3b8' }}>Tarifs</a></li>
              <li><a href="#demo" className="hover:text-white transition" style={{ color: '#94a3b8' }}>Démo</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Ressources</h4>
            <ul className="space-y-2 text-sm">
              {/* RL9-17 (audit RL SERVICES) : "Documentation"/"API" retirés
                  du menu public — /api/docs/ exige désormais une session
                  authentifiée (RL9-02), un visiteur anonyme y tomberait sur
                  une erreur. "Blog"/"Support" retirés tant qu'aucune page
                  réelle n'existe derrière (mieux vaut absent que mort). */}
              <li><a href="#faq" className="hover:text-white transition" style={{ color: '#94a3b8' }}>FAQ</a></li>
              <li><a href="mailto:contact@noxia.ga" className="hover:text-white transition" style={{ color: '#94a3b8' }}>Support</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="mailto:contact@noxia.ga" className="hover:text-white transition" style={{ color: '#94a3b8' }}>contact@noxia.ga</a></li>
              <li><a href="tel:+24174821635" className="hover:text-white transition" style={{ color: '#94a3b8' }}>+241 74 82 16 35</a></li>
              {/* RL9-04 (audit RL SERVICES) : lien de discussion directe au lieu
                  d'une invitation de groupe public, qui exposait les numéros de
                  tous les membres à quiconque cliquait le lien. */}
              <li><a href="https://wa.me/24174821635" className="hover:text-white transition" style={{ color: '#94a3b8' }}>WhatsApp</a></li>
              <li><a href="https://t.me/noxia_user_bot" className="hover:text-white transition" style={{ color: '#94a3b8' }}>Telegram</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm" style={{ color: '#64748b' }}>
            &copy; 2026 NOXIA. Tous droits réservés.
            {' · '}
            <a href="/mentions-legales" className="hover:text-white transition" style={{ color: '#64748b' }}>
              Mentions légales
            </a>
          </p>
          <p className="text-sm" style={{ color: '#64748b' }}>
            Made by <span className="text-primary-400">Agenxia</span>
          </p>
        </div>
      </div>
    </footer>
  )
}