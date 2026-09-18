// src/components/landing/Footer.tsx

export function Footer() {
  return (
    <footer 
      className="py-12"
      style={{ 
        borderTop: '1px solid #1e293b',
        background: '#0f172a'
      }}
      aria-label="Pied de page NOXIA"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <a 
              href="/" 
              className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity"
              aria-label="Retour à l'accueil NOXIA"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center p-1.5">
                <img 
                  src="/logos/NOXIA_Orbit_Logo.svg" 
                  alt="Logo NOXIA" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-bold text-white">
                NOXIA<span className="text-primary-400" aria-hidden="true">.</span>
              </span>
            </a>
            <p className="text-sm" style={{ color: '#94a3b8' }}>
              Le Pilier intelligent pour les bars, snack-bars et boîtes de nuit.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white text-base">Produit</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-white transition" style={{ color: '#94a3b8' }}>Fonctionnalités</a></li>
              <li><a href="#pricing" className="hover:text-white transition" style={{ color: '#94a3b8' }}>Tarifs</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white text-base">Ressources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#faq" className="hover:text-white transition" style={{ color: '#94a3b8' }}>FAQ</a></li>
              <li><a href="/cgu" className="hover:text-white transition" style={{ color: '#94a3b8' }}>CGU</a></li>
              <li><a href="/politique-confidentialite" className="hover:text-white transition" style={{ color: '#94a3b8' }}>Politique de confidentialité</a></li>
              <li><a href="mailto:agenxia3@gmail.com" className="hover:text-white transition" style={{ color: '#94a3b8' }}>Support</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white text-base">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="mailto:agenxia3@gmail.com" className="hover:text-white transition" style={{ color: '#94a3b8' }}>agenxia3@gmail.com</a></li>
              <li><a href="tel:+24174821635" className="hover:text-white transition" style={{ color: '#94a3b8' }}>+241 74 82 16 35</a></li>
              <li><a href="https://wa.me/24174821635" className="hover:text-white transition" style={{ color: '#94a3b8' }} aria-label="Contacter NOXIA sur WhatsApp">WhatsApp</a></li>
              <li><a href="https://t.me/noxia_user_bot" className="hover:text-white transition" style={{ color: '#94a3b8' }} aria-label="Contacter NOXIA sur Telegram">Telegram</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            &copy; 2026 NOXIA. Tous droits réservés.
            {' · '}
            <a href="/cgu" className="hover:text-white transition" style={{ color: '#94a3b8' }}>CGU</a>
            {' · '}
            <a href="/politique-confidentialite" className="hover:text-white transition" style={{ color: '#94a3b8' }}>
              Politique de confidentialité
            </a>
          </p>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            Made by <span className="text-primary-400">Agenxia</span>
          </p>
        </div>
      </div>
    </footer>
  )
}