// Source de vérité des questions/réponses FAQ, partagée entre le composant
// client FAQ.tsx (affichage) et page.tsx (composant serveur, génère le
// JSON-LD FAQPage) : un fichier sans 'use client' peut être importé par les
// deux sans forcer FAQ.tsx tout entier à devenir un module serveur.
export const faqs = [
  {
    question: "Comment fonctionne l'essai gratuit ?",
    answer:
      "L'essai gratuit donne accès à l'ensemble des fonctionnalités du plan Business dès l'inscription : caisse (POS), gestion des stocks, catalogue produits, bots WhatsApp/Telegram et assistant IA. Aucune carte bancaire n'est demandée pour démarrer. À la fin de l'essai, vous choisissez le plan qui correspond à votre activité.",
  },
  {
    question: 'Puis-je changer de plan à tout moment ?',
    answer:
      "Oui. Vous pouvez passer à un plan supérieur ou inférieur directement depuis votre espace Abonnement, sans interruption de service. Le changement est appliqué immédiatement et les fonctionalités sont également appliquées selon le plan choisi.",
  },
  {
    question: 'Comment mes employés accèdent-ils au bot ?',
    answer:
      "Depuis votre tableau de bord, vous créez le compte de chaque employé et lui attribuez un rôle (caissier, serveur, gérant...). Un identifiant de liaison unique est généré automatiquement : l'employé l'envoie une seule fois au bot WhatsApp ou Telegram de l'établissement pour associer son numéro à son compte. Ses permissions (ce qu'il peut consulter ou modifier) sont ensuite appliquées automatiquement selon son rôle, sans configuration supplémentaire.",
  },
  {
    question: 'Mes données sont-elles sécurisées ?',
    answer:
      "Oui. Chaque établissement dispose d'un espace de données strictement isolé — aucune donnée ne peut être partagée ou consultée entre deux entreprises clientes. Toutes les communications transitent en HTTPS chiffré, les mots de passe et identifiants sensibles sont chiffrés en base, et des sauvegardes automatiques de la base de données sont réalisées quotidiennement.",
  },
  {
    question: 'NOXIA fonctionne-t-il hors ligne ?',
    answer:
      "NOXIA est une application web accessible depuis un navigateur, elle nécessite donc une connexion internet pour fonctionner (comme la caisse, les stocks et les bots reposent sur des données synchronisées en temps réel). En revanche, la gestion via WhatsApp/Telegram reste disponible dès qu'une connexion mobile basique est présente, ce qui couvre la majorité des usages terrain même avec un réseau limité. Les verions Mobiles et Desktop ne sont pas encore disponible et elles permettrons le fonctionnement hors ligne",
  },
  {
    question: "Quels types d'établissements peuvent utiliser NOXIA ?",
    answer:
      "NOXIA est conçu pour les bars, snack-bars, boîtes de nuit et restaurants.",
  },
  {
    question: "Y a-t-il des frais cachés ou d'engagement ?",
    answer:
      "Non. Le prix affiché pour chaque plan est le prix final, sans frais d'installation ni surcoût caché. L'abonnement est sans engagement de durée : vous pouvez l'annuler à tout moment depuis votre espace Abonnement, sans pénalité mais sans remboursement de la durée du plan en cours. L'annulation suspend immédiatement l'accès à tous les services jusqu'à ce que vous repreniez un plan (aucune perte de vos données ni de votre historique, qui sont conservés). Si vous avez déjà utilisé l'essai gratuit, vous ne pourrez reprendre qu'un plan payant.",
  },
]
