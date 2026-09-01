'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function PrivacyPolicyPage() {
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
          <h1 className="text-3xl font-bold text-white mb-2">Politique de Confidentialité</h1>
          <p className="text-sm text-dark-400 mb-8">Dernière mise à jour : 01/09/2026</p>

          <div className="space-y-6 text-sm text-dark-300 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Introduction</h2>
              <p>
                La présente Politique de Confidentialité décrit comment <strong className="text-white">Agenxia</strong> 
                (éditeur de la plateforme NOXIA) collecte, utilise, stocke et protège les données personnelles de ses 
                utilisateurs, conformément à la réglementation en vigueur en République gabonaise.
              </p>
              <p className="mt-2">
                En utilisant NOXIA, vous acceptez les pratiques décrites dans cette politique.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. Catégories de données collectées</h2>
              <p className="mb-2">Nous collectons les catégories de données suivantes :</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-dark-700/30 border border-dark-600">
                  <p className="font-semibold text-white text-sm">Identité</p>
                  <ul className="text-xs text-dark-400 mt-1 space-y-1">
                    <li>• Nom et prénom</li>
                    <li>• Email</li>
                    <li>• Numéro de téléphone</li>
                  </ul>
                </div>
                <div className="p-3 rounded-lg bg-dark-700/30 border border-dark-600">
                  <p className="font-semibold text-white text-sm">Entreprise</p>
                  <ul className="text-xs text-dark-400 mt-1 space-y-1">
                    <li>• Nom de l'établissement</li>
                    <li>• Type d'établissement</li>
                    <li>• Pays</li>
                  </ul>
                </div>
                <div className="p-3 rounded-lg bg-dark-700/30 border border-dark-600">
                  <p className="font-semibold text-white text-sm">Documents légaux</p>
                  <ul className="text-xs text-dark-400 mt-1 space-y-1">
                    <li>• Registre de commerce</li>
                    <li>• Attestation fiscale</li>
                    <li>• Licence d'exploitation</li>
                    <li>• Pièce d'identité</li>
                  </ul>
                </div>
                <div className="p-3 rounded-lg bg-dark-700/30 border border-dark-600">
                  <p className="font-semibold text-white text-sm">Données d'activité</p>
                  <ul className="text-xs text-dark-400 mt-1 space-y-1">
                    <li>• Historique des ventes</li>
                    <li>• Mouvements de stock</li>
                    <li>• Transactions financières</li>
                    <li>• Logs de connexion</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. Finalité du traitement</h2>
              <p>Les données collectées sont traitées pour les finalités suivantes :</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-dark-400">
                <li>Création et gestion des comptes utilisateurs</li>
                <li>Gestion des abonnements et des paiements</li>
                <li>Traitement des commandes et des ventes</li>
                <li>Gestion des stocks et des fournisseurs</li>
                <li>Communication avec les utilisateurs (support, notifications)</li>
                <li>Analyse statistique et amélioration des services</li>
                <li>Conformité légale et réglementaire</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. Lieu d'hébergement des données</h2>
              <p>
                Les bases de données de NOXIA sont hébergées sur des serveurs sécurisés situés en 
                <strong className="text-white"> République gabonaise</strong>.
              </p>
              <p className="mt-2 text-dark-400">
                Conformément à la réglementation gabonaise, les données ne sont pas transférées hors du territoire 
                national sans autorisation préalable de l'APDPVP.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. Durée de conservation des données</h2>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 rounded-lg bg-dark-700/30 border border-dark-600">
                  <span className="text-dark-300">Données d'identité et de compte</span>
                  <span className="text-sm text-white font-semibold">5 ans après la dernière activité</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-dark-700/30 border border-dark-600">
                  <span className="text-dark-300">Données de transaction (ventes, stocks)</span>
                  <span className="text-sm text-white font-semibold">10 ans (obligation légale)</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-dark-700/30 border border-dark-600">
                  <span className="text-dark-300">Documents légaux</span>
                  <span className="text-sm text-white font-semibold">10 ans après la fin de l'abonnement</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-dark-700/30 border border-dark-600">
                  <span className="text-dark-300">Logs de connexion</span>
                  <span className="text-sm text-white font-semibold">1 an</span>
                </div>
              </div>
              <p className="mt-3 text-xs text-dark-500">
                À l'expiration de ces délais, les données sont anonymisées ou supprimées définitivement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">6. Mesures de sécurité</h2>
              <p>NOXIA met en œuvre les mesures de sécurité suivantes :</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-dark-400">
                <li>Chiffrement des mots de passe (bcrypt)</li>
                <li>Protocole HTTPS pour toutes les communications</li>
                <li>Chiffrement des données sensibles en base de données</li>
                <li>Authentification à deux facteurs (2FA) optionnelle</li>
                <li>Journal d'audit complet (traçabilité des actions)</li>
                <li>Sauvegardes quotidiennes des données</li>
                <li>Protection DDoS via Cloudflare</li>
                <li>Rate limiting contre les attaques par force brute</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">7. Droits des utilisateurs</h2>
              <p className="mb-2">Conformément à la réglementation en vigueur, vous disposez des droits suivants :</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-dark-700/30 border border-dark-600">
                  <p className="font-semibold text-white text-sm">Droit d'accès</p>
                  <p className="text-xs text-dark-400 mt-1">Obtenir la confirmation que vos données sont traitées et y accéder</p>
                </div>
                <div className="p-3 rounded-lg bg-dark-700/30 border border-dark-600">
                  <p className="font-semibold text-white text-sm">Droit de rectification</p>
                  <p className="text-xs text-dark-400 mt-1">Modifier vos données personnelles inexactes ou incomplètes</p>
                </div>
                <div className="p-3 rounded-lg bg-dark-700/30 border border-dark-600">
                  <p className="font-semibold text-white text-sm">Droit à l'effacement</p>
                  <p className="text-xs text-dark-400 mt-1">Demander la suppression de vos données (dans les limites légales)</p>
                </div>
                <div className="p-3 rounded-lg bg-dark-700/30 border border-dark-600">
                  <p className="font-semibold text-white text-sm">Droit d'opposition</p>
                  <p className="text-xs text-dark-400 mt-1">Vous opposer à certaines utilisations de vos données</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-dark-500">
                Pour exercer vos droits, contactez-nous à : <a href="mailto:agenxia3@gmail.com" className="text-primary-400 hover:underline">agenxia3@gmail.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">8. Cookies</h2>
              <p>
                NOXIA utilise des cookies pour améliorer l'expérience utilisateur (authentification, préférences). 
                Vous pouvez configurer votre navigateur pour refuser les cookies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">9. Modifications de la politique</h2>
              <p>
                NOXIA se réserve le droit de modifier cette politique à tout moment. Les modifications seront notifiées 
                aux utilisateurs et prendront effet immédiatement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">10. Contact</h2>
              <p>Pour toute question relative à la protection des données, contactez-nous :</p>
              <div className="mt-3 p-4 rounded-lg bg-dark-700/30 border border-dark-600">
                <p className="text-dark-300"><strong className="text-white">Email :</strong> <a href="mailto:agenxia3@gmail.com" className="text-primary-400 hover:underline">agenxia3@gmail.com</a></p>
                <p className="text-dark-300"><strong className="text-white">Téléphone :</strong> <a href="tel:+24174821635" className="text-primary-400 hover:underline">+241 74 82 16 35</a></p>
                <p className="text-dark-300"><strong className="text-white">Adresse :</strong> Libreville, République gabonaise</p>
              </div>
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