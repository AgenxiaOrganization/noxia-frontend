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
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg">
                N
              </div>
              <span className="text-xl font-bold text-white">
                NOXIA<span className="text-primary-400">.</span>
              </span>
            </div>
            <p className="text-sm" style={{ color: '#64748b' }}>
              L'OS intelligent pour les bars, snack-bars et boîtes de nuit.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Produit</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-white transition" style={{ color: '#94a3b8' }}>Fonctionnalités</a></li>
              <li><a href="#pricing" className="hover:text-white transition" style={{ color: '#94a3b8' }}>Tarifs</a></li>
              <li><a href="#demo" className="hover:text-white transition" style={{ color: '#94a3b8' }}>Démo</a></li>
              <li><a href="#" className="hover:text-white transition" style={{ color: '#94a3b8' }}>Documentation</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Ressources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition" style={{ color: '#94a3b8' }}>API</a></li>
              <li><a href="#" className="hover:text-white transition" style={{ color: '#94a3b8' }}>Blog</a></li>
              <li><a href="#faq" className="hover:text-white transition" style={{ color: '#94a3b8' }}>FAQ</a></li>
              <li><a href="#" className="hover:text-white transition" style={{ color: '#94a3b8' }}>Support</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="mailto:contact@noxia.io" className="hover:text-white transition" style={{ color: '#94a3b8' }}>contact@noxia.io</a></li>
              <li><a href="#" className="hover:text-white transition" style={{ color: '#94a3b8' }}>+241 77 00 00 00</a></li>
              <li><a href="#" className="hover:text-white transition" style={{ color: '#94a3b8' }}>WhatsApp</a></li>
              <li><a href="#" className="hover:text-white transition" style={{ color: '#94a3b8' }}>Telegram</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm" style={{ color: '#64748b' }}>
            &copy; 2026 NOXIA. Tous droits réservés.
          </p>
          <p className="text-sm" style={{ color: '#64748b' }}>
            Made with ❤️ by <span className="text-primary-400">Agenxia</span>
          </p>
        </div>
      </div>
    </footer>
  )
}