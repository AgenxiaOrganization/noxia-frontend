'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-dark-900 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Bouton retour */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-dark-400 hover:text-white transition mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>

        <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Conditions Générales d'Utilisation</h1>
          <p className="text-sm text-dark-400 mb-8">Dernière mise à jour : 01/09/2026</p>

          <div className="space-y-6 text-sm text-dark-300 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Objet</h2>
              <p>
                Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme 
                NOXIA, éditée par <strong className="text-white">Agenxia</strong>. En vous inscrivant sur NOXIA, vous acceptez 
                pleinement et sans réserve les présentes CGU.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. Description des services</h2>
              <p>
                NOXIA est une plateforme SaaS (Software as a Service) de gestion pour bars, restaurants, snack-bars et 
                boîtes de nuit. Parmi les nombreuses fonctionnalités proposées, on retrouve notamment :
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-dark-400">
                <li>Gestion des stocks et des produits</li>
                <li>Gestion des ventes et de la caisse (POS)</li>
                <li>Gestion des employés et des permissions</li>
                <li>Tableaux de bord et rapports d'analyse</li>
                <li>Intégration avec WhatsApp, Telegram et assistant IA</li>
                <li>Gestion des abonnements et des paiements</li>
                <li>Gestion des fournisseurs et des commandes</li>
                <li>Certification des établissements</li>
                <li>Multi-établissements et multi-caisses</li>
                <li>API publique pour intégrations tierces</li>
                <li>Export des rapports en PDF/Excel</li>
                <li>Gestion financière et comptable</li>
              </ul>
              <p className="mt-2 text-xs text-dark-500">
                ⚠️ Cette liste n'est pas exhaustive. De nouvelles fonctionnalités sont régulièrement ajoutées.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. Compte utilisateur</h2>
              <p>
                L'utilisateur s'engage à fournir des informations exactes et à jour lors de la création de son compte. 
                Chaque compte est strictement personnel et ne peut être transféré. L'utilisateur est responsable de la 
                confidentialité de ses identifiants.
              </p>
              <div className="mt-3 p-4 rounded-lg bg-dark-700/30 border border-dark-600">
                <p className="font-semibold text-white mb-2">🔐 Documents légaux requis</p>
                <p className="text-dark-400 text-sm">
                  Conformément à la réglementation en vigueur en République gabonaise, pour bénéficier des fonctionnalités 
                  avancées (à partir du plan Premium), l'utilisateur devra fournir les documents légaux suivants :
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-dark-400 text-sm">
                  <li>Registre de commerce (extrait Kbis ou équivalent)</li>
                  <li>Attestation fiscale ou NIF (Numéro d'Identification Fiscale)</li>
                  <li>Licence d'exploitation ou autorisation administrative</li>
                  <li>Pièce d'identité du gérant ou représentant légal</li>
                  <li>Statuts de l'entreprise (si applicable)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. Abonnements et paiements</h2>
              <p>
                NOXIA propose différents plans d'abonnement (Essai, Starter, Premium, Business). Les prix sont indiqués 
                en FCFA (hors taxes). Les abonnements sont renouvelés automatiquement sauf annulation par l'utilisateur 
                avant la date d'échéance. Les paiements sont sécurisés via Mobile Money ou carte bancaire.
              </p>
              <div className="mt-3 p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                <p className="font-semibold text-red-400 text-sm">
                  ⚠️ Important : L'annulation de l'abonnement n'est pas remboursable. Tout paiement effectué est définitif 
                  et non remboursable, même en cas d'annulation anticipée.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. Protection des données</h2>
              <p>
                NOXIA s'engage à protéger les données personnelles de ses utilisateurs conformément au Règlement Général 
                sur la Protection des Données (RGPD). Les données sont hébergées sur des serveurs sécurisés situés en 
                <strong className="text-white"> République gabonaise</strong>.
              </p>
              <p className="mt-2 text-dark-400">
                Les données ne sont jamais partagées avec des tiers sans consentement explicite de l'utilisateur. 
                Pour plus d'informations, consultez notre <Link href="/politique-confidentialite" className="text-primary-400 hover:underline">Politique de Confidentialité</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">6. Propriété intellectuelle</h2>
              <p>
                Tous les éléments de la plateforme NOXIA (logos, interfaces, codes, contenus) sont la propriété exclusive 
                d'Agenxia. Toute reproduction, modification ou distribution sans autorisation est strictement interdite.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">7. Responsabilités</h2>
              <p>
                NOXIA s'efforce d'assurer un service continu et de qualité. Toutefois, la plateforme ne saurait être tenue 
                responsable des pertes de données, des interruptions de service ou des dommages indirects liés à 
                l'utilisation de la plateforme.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">8. Résiliation</h2>
              <p>
                L'utilisateur peut résilier son compte à tout moment depuis son espace personnel ou en contactant le 
                support. En cas de non-respect des présentes CGU, NOXIA se réserve le droit de suspendre ou résilier le 
                compte de l'utilisateur sans préavis.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">9. Modification des CGU</h2>
              <p>
                NOXIA se réserve le droit de modifier les présentes CGU à tout moment. Les modifications seront notifiées 
                aux utilisateurs et prendront effet immédiatement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">10. Loi applicable</h2>
              <p>
                Les présentes CGU sont régies par le droit gabonais. Tout litige sera soumis aux tribunaux compétents de 
                <strong className="text-white"> Libreville, République gabonaise</strong>.
              </p>
            </section>

            <div className="mt-8 pt-6 border-t border-dark-700">
              <p className="text-xs text-green-400">
                ✅ Version en vigueur au 01/09/2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}