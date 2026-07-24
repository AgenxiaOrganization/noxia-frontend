# NOXIA — Guide Git & GitHub pour l'équipe

> Ce document explique comment Danis et Lisy travaillent ensemble sur le projet NOXIA avec Git et GitHub. Lis-le une fois attentivement, garde-le sous la main, et suis-le à chaque session de travail.

---

## Nouvelles Fonctionnalités (Récentes)

- **Page de Vérification de Sécurité & Authenticité (`/verify-doc`) :** Implémentation d'une interface publique élégante ([`src/app/verify-doc/page.tsx`](file:///c:/mes%20projets/noxia%20folder/noxia-frontend/src/app/verify-doc/page.tsx)) permettant à quiconque de vérifier la validité des documents certifiés émis par NOXIA (Fiches de paie, Factures/Reçus POS, Bilans financiers & TVA). Support de l'analyse automatique des paramètres URL (`?code=NOXIA-VERIF-...`), conservation dynamique de la saisie sans réinitialisation et affichage instantané de la carte de conformité 🛡️ ou des alertes de sécurité.
- **Accès Rapide depuis le Dashboard Finance :** Intégration d'un bouton direct *"Vérifier un document"* avec l'icône `ShieldCheck` dans l'en-tête du module Finance pour permettre aux gérants et contrôleurs de tester les codes d'authenticité en un clic.
- **Exposition distante Ngrok & Proxification API (Test à distance) :** Ajout des règles de réécriture d'API (`rewrites` dans `next.config.ts`) et du support Ngrok pour permettre de partager et tester le frontend et l'API à distance en toute transparence sans conflits CORS.
- **Gestion des Multi-Liaisons de Bots (WhatsApp + Telegram) :** Refonte complète de la table "Liaison des employés" pour supporter l'affichage simultané de plusieurs sessions de messagerie par employé. Chaque connexion active s'affiche sous forme de badge de couleur (vert WhatsApp, bleu Telegram) contenant l'identifiant du compte, accompagné d'une icône de déconnexion rapide (petite croix `X`) permettant au gérant de délier ce canal spécifique d'un simple clic.
- **Séparation Alertes & Notifications (Cloches distinctes) :** Remplacement de la cloche statique par deux composants distincts et connectés dans la Topbar : `NotificationBell` (cloche 🔔 pour les alertes critiques comme le stock bas ou la rupture de stock, redirigeant vers `/alerts`) et `NotificationIcon` (bulle de message 💬 pour les notifications informatives telles que les intégrations de bots et l'activité des abonnements, redirigeant vers `/notifications`).
- **Page Notifications Premium :** Création d'une nouvelle page dédiée `/notifications` accessible via la barre latérale, proposant des filtres interactifs (Toutes, Non lues, Déjà lues), un groupement temporel automatique (Aujourd'hui, Hier, dates antérieures), le marquage unitaire/global comme lu et une bannière d'incitation à l'abonnement premium.
- **Correction du Retry API après Refresh Token :** Refactoring du client API (`api.ts`) pour transmettre un objet `RequestContext` complet (méthode HTTP, chemin, body) à `parseResponse`. Le retry après rafraîchissement silencieux du token rejoue désormais correctement la requête originale avec la bonne méthode (POST, PATCH, DELETE) et le body d'origine, au lieu d'utiliser `res.type` qui ne contient pas la méthode HTTP. Remplacement du type `any` par `unknown` pour un typage strict.
- **Boutons d'Activation de Bot Fonctionnels & Persistés :** Les boutons d'en-tête « WhatsApp Actif/Inactif » et « Telegram Actif/Inactif » (ainsi que les boutons d'activation associés dans les cartes) de la page de messagerie sont désormais pleinement opérationnels et reliés au backend. Les statuts d'activation du bot de l'établissement sont persistés directement dans la base de données PostgreSQL de Django (champs `whatsapp_bot_active` et `telegram_bot_active` sur le modèle `Company`) et les validations correspondantes sont exécutées par le backend lors de toute tentative de liaison.
- **Boutons de Questions Suggérées (Chatbot n8n) :** Transformation automatique des questions entre guillemets chevrons « ... » figurant dans le message initial du bot n8n en boutons cliquables interactifs et animés. Un simple clic sur l'un d'eux remplit et soumet directement la question correspondante dans la discussion.
- **Simplification de l'Interface & Retrait des Doublons :** Retrait de l'item « Assistant IA » de la barre latérale de gauche et suppression complète de l'onglet « Commandes » ainsi que de la barre latérale des « Commandes rapides » dans la messagerie. L'accès à l'assistant intelligent est maintenant exclusivement et simplement géré via la bulle de chat flottante globale.
- **Compatibilité Shadow DOM (Chatbot n8n) :** Implémentation d'une fonction de recherche récursive en profondeur (`querySelectorDeep` par parcours d'arbre complet via `searchNode`) permettant de traverser le Shadow DOM isolé du widget `@n8n/chat` de manière robuste.
- **Webhook Assistant IA Configurable :** Remplacement de l'URL codée en dur du webhook de l'assistant au backend par la variable d'environnement `N8N_ASSISTANT_CHAT_URL` (configurable dans le fichier `.env`), facilitant la mise à jour ou le changement de l'agent IA de Noxia.
- **Refonte du Moniteur de Liaisons :** L'onglet Liaison employés n'affiche désormais que les employés ayant lié leur bot (avec les colonnes Plateforme WhatsApp/Telegram et Identifiant Bot).
- **Extension de Validité des IDs de Liaison :** Passage de la durée de validité par défaut des IDs employés générés pour la messagerie à **1 mois (720 heures)** (configuré en constante globale `DEFAULT_ACTIVATION_VALIDITY_HOURS = 720` au backend), avec mise à jour du message explicatif en bas de la table.
- **Interfaçage de la Messagerie & Liaison Employés :** Connexion complète des onglets Activation et Liaison employés de la page Messagerie aux endpoints de l'API. Récupération dynamique de l'ID établissement (`messaging_code`), de l'ID employé (`activation_code`), gestion de la génération/régénération des codes d'activation, et envoi automatisé des accès par e-mail.
- **Résolution du Bug Turbopack / SSR :** Implémentation d'un chargement dynamique client-only (`next/dynamic` avec `ssr: false`) pour le composant de chat, contournant le crash d'évaluation du proxy de Turbopack.
- **Sécurisation de Session & Métadonnées :** Intégration du token JWT dans la requête envoyée au proxy Django. L'agent IA n8n reçoit de manière invisible les métadonnées de l'utilisateur (identifiant, nom, établissement, rôle, et permissions réelles) pour adapter ses réponses.
- **Gestion des Fournisseurs et Commandes :** Refonte de la page distributeurs pour lister et modifier dynamiquement le statut des commandes en base de données.
- **Modal interactive de commande (n8n) :** Remplacement du bouton e-mail statique par une modal interactive permettant de saisir les produits, quantités (pré-remplis avec les produits en stock critique) et d'ajuster le message de commande.
- **Lien WhatsApp dynamique :** Redirection vers WhatsApp wa.me avec un message pré-rempli contenant automatiquement les produits en rupture de stock.
- **Sélection des produits fournis :** Ajout de cases à cocher regroupées par catégorie dans le formulaire d'ajout/modification de distributeur pour mapper facilement les produits.
- **Gestion des Casiers & Unités :** Correction du formulaire de produit pour convertir correctement les stocks en casiers (à l'affichage dans le modal) et en unités de base (lors de la soumission à l'API) lorsque le mode "Par casier" est sélectionné.
- **Filtres de Recherche par Catégorie :** Amélioration de la barre de recherche du catalogue de produits pour toujours afficher de manière permanente l'ensemble des catégories disponibles (Boissons, Nourriture, Services) plutôt que de les masquer lorsqu'elles ne contiennent aucun produit.
- **Intégration API Complète :** Les interfaces de vente (POS) et de gestion du catalogue sont désormais connectées aux véritables données du backend via les nouveaux clients API (`src/lib/api/`).
- **Temps Réel (WebSockets) :** Les composants réagissent désormais en temps réel aux changements de ventes et de prix émis par le backend grâce au hook personnalisé `useWebSockets`.

## Sommaire

1. [C'est quoi Git et GitHub ?](#1-cest-quoi-git-et-github-)
2. [Organisation des dépôts](#2-organisation-des-dépôts)
3. [Les branches — comment on s'organise](#3-les-branches--comment-on-sorganise)
4. [Installation et configuration initiale](#4-installation-et-configuration-initiale)
5. [Les commandes du quotidien](#5-les-commandes-du-quotidien)
6. [Workflow complet — exemple concret](#6-workflow-complet--exemple-concret)
7. [Les messages de commit — convention](#7-les-messages-de-commit--convention)
8. [Les Pull Requests](#8-les-pull-requests)
9. [Que faire en cas de conflit ?](#9-que-faire-en-cas-de-conflit-)
10. [Routine quotidienne résumée](#10-routine-quotidienne-résumée)

---

## 1. C'est quoi Git et GitHub ?

**Git** est un outil installé sur ton ordinateur qui enregistre l'historique de toutes les modifications de ton code. Chaque fois que tu fais un `commit`, Git prend une photo de l'état de ton projet à ce moment-là. Si tu casses quelque chose, tu peux revenir en arrière.

**GitHub** est le site web où on envoie ce code pour le partager avec l'équipe. C'est le serveur commun où Danis et Lisy synchronisent leur travail.

```
Ton ordinateur              GitHub (en ligne)
─────────────────           ─────────────────
Tu codes                    Le code est sauvegardé
Tu fais des commits   →     en ligne et partagé
git push                    avec toute l'équipe
                      ←
git pull                    Tu récupères le travail
                            de l'autre
```

---

## 2. Organisation des dépôts

Le projet NOXIA est hébergé dans l'organisation **AgenxiaOrganization** sur GitHub. Il y a deux dépôts privés :

| Dépôt | Contenu |
|---|---|
| `noxia-backend` | Django, API REST, base de données, bots |
| `noxia-frontend` | Flutter Web, Mobile, Desktop |

Même si vous êtes fullstack et pouvez toucher aux deux dépôts, chaque modification suit les mêmes règles décrites dans ce guide.

---

## 3. Les branches — comment on s'organise

Une branche c'est une copie isolée du code où tu peux travailler sans affecter le travail de l'autre.

### Les deux branches permanentes

```
main       → version stable uniquement. On ne touche jamais directement à main.
develop    → votre base de travail commune au quotidien.
```

### Les branches temporaires (feature)

Pour chaque nouvelle fonctionnalité, tu crées une branche qui part de `develop`, tu travailles dessus, puis tu la fusionnes dans `develop` une fois terminée. Ensuite tu la supprimes.

```
main
  ↑ (seulement quand une version est stable et testée)
develop  ← base de travail commune
  ↑           ↑           ↑
feature/    feature/    feature/
auth        produits    stock
```

### Règle simple

- **Une fonctionnalité = une branche**
- **Jamais de branche par personne** (pas de branche-danis ou branche-lisy)
- **On ne travaille jamais directement sur `develop` ou `main`**

### Nommage des branches

```
feature/auth-login
feature/gestion-produits
feature/gestion-stock
feature/dashboard
feature/abonnements
feature/whatsapp-bot
feature/telegram-bot
fix/bug-calcul-stock
fix/erreur-login
```

---

## 4. Installation et configuration initiale

### Installer Git

- **Windows** : télécharge Git sur https://git-scm.com
- **Mac** : `brew install git`
- **Linux** : `sudo apt install git`

Vérifie que Git est installé :
```bash
git --version
```

### Configurer ton identité (à faire une seule fois)

**Danis :**
```bash
git config --global user.name "Danis"
git config --global user.email "ton-email@gmail.com"
```

**Lisy :**
```bash
git config --global user.name "Lisy"
git config --global user.email "email-lisy@gmail.com"
```

### Cloner les dépôts sur ton ordinateur

```bash
git clone https://github.com/AgenxiaOrganization/noxia-backend.git
git clone https://github.com/AgenxiaOrganization/noxia-frontend.git
```

Cela crée un dossier `noxia-backend` et `noxia-frontend` sur ton ordinateur avec tout le code.

### Créer la branche develop (à faire une seule fois, par Danis) c'est déja fait par moi sur github

```bash
cd noxia-backend
git checkout -b develop
git push -u origin develop
```

```bash
cd noxia-frontend
git checkout -b develop
git push -u origin develop
```

### Récupérer la branche develop (Lisy fait ça après que Danis ait créé develop) donc apres avoir clonner le projet  et même chaque fois que tu travail

```bash
cd noxia-backend
git checkout develop
git pull origin develop
```

---

## 5. Les commandes du quotidien

Voici toutes les commandes que vous utiliserez régulièrement avec leur explication.

### Voir l'état de ton dépôt

```bash
git status
```
Affiche les fichiers modifiés, ajoutés ou supprimés depuis le dernier commit. À utiliser très souvent.

### Récupérer les dernières modifications de GitHub

```bash
git pull origin develop
```
Télécharge sur ton ordinateur tout ce que l'autre a pushé sur GitHub. À faire chaque matin avant de commencer.

### Créer une nouvelle branche

```bash
git checkout -b feature/nom-de-la-fonctionnalite
```
Crée une nouvelle branche et te positionne dessus. Toujours partir de `develop` à jour.

### Changer de branche

```bash
git checkout develop
git checkout feature/auth-login
```

### Voir toutes les branches

```bash
git branch
```
La branche avec une étoile `*` est celle sur laquelle tu es actuellement.

### Ajouter les fichiers modifiés

```bash
git add .
```
Prépare tous les fichiers modifiés pour le prochain commit. Le point `.` signifie "tous les fichiers".

Pour ajouter un seul fichier spécifique :
```bash
git add nom-du-fichier.py
```

### Créer un commit

```bash
git commit -m "feat: description de ce que tu as fait"
```
Enregistre une photo de l'état actuel du code avec un message qui explique ce que tu as fait.

### Envoyer ton travail sur GitHub

```bash
git push origin feature/nom-de-la-fonctionnalite
```

La première fois sur une nouvelle branche :
```bash
git push -u origin feature/nom-de-la-fonctionnalite
```

Les fois suivantes sur la même branche :
```bash
git push
```

### Fusionner une branche dans develop

```bash
git checkout develop
git pull origin develop
git merge feature/nom-de-la-fonctionnalite
git push origin develop
```

### Supprimer une branche après fusion

```bash
git branch -d feature/nom-de-la-fonctionnalite
```

### Voir l'historique des commits

```bash
git log --oneline
```

### Voir les modifications que tu as faites

```bash
git diff
```

---

## 6. Workflow complet — exemple concret

### Situation : Danis développe le module d'authentification

**Étape 1 — Se mettre à jour avant de commencer**
```bash
git checkout develop
git pull origin develop
```

**Étape 2 — Créer une branche pour la fonctionnalité**
```bash
git checkout -b feature/auth-login
```

**Étape 3 — Coder**

Tu travailles sur tes fichiers normalement dans ton éditeur.

**Étape 4 — Sauvegarder régulièrement pendant le développement**
```bash
git add .
git commit -m "feat(auth): ajout du modèle utilisateur"
```
```bash
git add .
git commit -m "feat(auth): implémentation du login JWT"
```
```bash
git add .
git commit -m "feat(auth): ajout du refresh token"
```

Fais des petits commits réguliers. Ne fais pas un seul gros commit à la fin.

**Étape 5 — Envoyer sur GitHub**
```bash
git push -u origin feature/auth-login
```

**Étape 6 — Fusionner dans develop**
```bash
git checkout develop
git pull origin develop
git merge feature/auth-login
git push origin develop
```

**Étape 7 — Supprimer la branche terminée**
```bash
git branch -d feature/auth-login
```

---

### Situation : Lisy travaille en même temps sur les produits

En parallèle de Danis, Lisy suit exactement le même processus sur une branche différente :

```bash
git checkout develop
git pull origin develop
git checkout -b feature/gestion-produits
# ... Lisy code ...
git add .
git commit -m "feat(produits): création du modèle Produit"
git push -u origin feature/gestion-produits
# fusion et suppression de branche
```

Ils ne se bloquent pas mutuellement car ils travaillent sur des fichiers différents dans des branches différentes.

---

## 7. Les messages de commit — convention

Un bon message de commit permet de comprendre l'historique du projet sans ouvrir les fichiers. Voici la convention à suivre obligatoirement.

### Format

```
type(module): description courte en français
```

### Les types

| Type | Quand l'utiliser |
|---|---|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction d'un bug |
| `refactor` | Amélioration du code sans changer le comportement |
| `docs` | Documentation, README |
| `style` | Mise en forme, espaces, indentation |
| `test` | Ajout ou modification de tests |
| `chore` | Tâches diverses, configuration |

### Exemples

```bash
git commit -m "feat(auth): ajout du système de connexion JWT"
git commit -m "feat(produits): création du CRUD produits"
git commit -m "fix(stock): correction du calcul de la quantité restante"
git commit -m "feat(dashboard): affichage du chiffre d'affaires du jour"
git commit -m "feat(whatsapp): activation de session par ID utilisateur"
git commit -m "fix(abonnements): correction du calcul de la date d'expiration"
git commit -m "docs: mise à jour du README"
git commit -m "refactor(ventes): simplification de la logique de caisse"
```

### À ne pas faire

```bash
git commit -m "modif"           ❌ trop vague
git commit -m "ça marche"       ❌ aucune information
git commit -m "wip"             ❌ work in progress, pas informatif
git commit -m "update"          ❌ update quoi ?
```

---

## 8. Les Pull Requests

### C'est quoi ?

Une Pull Request (PR) est une demande de fusion. Au lieu de fusionner directement, tu proposes ton code à l'autre qui peut le relire avant que ça soit intégré dans `develop`.

### Quand faire une Pull Request ?

- Pour les **grosses fonctionnalités** importantes : auth, paiements, bot WhatsApp, bot Telegram
- Quand tu veux que l'autre **relie ton code** avant de merger

Pour les petites modifications sans risque, vous pouvez merger directement sans PR.

### Comment créer une Pull Request sur GitHub

Après avoir pushé ta branche :
```bash
git push origin feature/auth-login
```

1. Va sur https://github.com/Agenxia/noxia-backend
2. GitHub affiche automatiquement un bouton **"Compare & pull request"**, clique dessus
3. Vérifie que la PR va de `feature/auth-login` vers `develop`
4. Écris un titre clair : `feat: système d'authentification JWT`
5. Décris ce que tu as fait dans la description
6. Clique sur **"Create Pull Request"**
7. L'autre relit, commente si besoin, puis clique sur **"Merge pull request"**

### Comment créer une Pull Request en ligne de commande

Installe GitHub CLI une seule fois :
```bash
# Windows
winget install GitHub.cli

# Mac
brew install gh

# Linux
sudo apt install gh
```

Connexion :
```bash
gh auth login
```

Créer une PR :
```bash
gh pr create --base develop --title "feat: authentification JWT" --body "Login, logout et refresh token"
```

Voir les PRs ouvertes :
```bash
gh pr list
```

Merger une PR :
```bash
gh pr merge 1 --merge
```

---

## 9. Que faire en cas de conflit ?

Un conflit arrive quand vous avez tous les deux modifié le même fichier sur des branches différentes et que Git ne sait pas quelle version garder.

### Exemple de message de conflit

```
CONFLICT (content): Merge conflict in backend/models.py
Automatic merge failed; fix conflicts and then commit the result.
```

### Comment résoudre

**Étape 1 — Git te montre les conflits dans le fichier**

```python
<<<<<<< HEAD (ta version)
def get_stock(product_id):
    return Stock.objects.get(id=product_id)
=======
def get_stock(product_id):
    return Stock.objects.filter(id=product_id).first()
>>>>>>> feature/gestion-stock (version de l'autre)
```

**Étape 2 — Tu choisis quelle version garder**

Tu supprimes les marqueurs `<<<<<<<`, `=======`, `>>>>>>>` et tu gardes le code correct :

```python
def get_stock(product_id):
    return Stock.objects.filter(id=product_id).first()
```

**Étape 3 — Tu commit la résolution**

```bash
git add .
git commit -m "fix: résolution du conflit sur models.py"
git push origin develop
```

### Comment éviter les conflits

- Toujours faire `git pull origin develop` avant de commencer
- Travailler sur des fonctionnalités différentes en même temps
- Faire des petits commits réguliers et merger souvent
- Communiquer avec l'autre avant de toucher à un fichier important

---

## 10. Routine quotidienne résumée

### Le matin — avant de commencer

```bash
git checkout develop
git pull origin develop
```

### Quand tu commences une fonctionnalité

```bash
git checkout -b feature/nom-fonctionnalite
```

### Pendant que tu codes — toutes les heures environ

```bash
git add .
git commit -m "feat(module): description de ce que tu viens de faire"
```

### En fin de journée — envoie ton travail sur GitHub

```bash
git push origin feature/nom-fonctionnalite
```

### Quand la fonctionnalité est terminée

```bash
git checkout develop
git pull origin develop
git merge feature/nom-fonctionnalite
git push origin develop
git branch -d feature/nom-fonctionnalite
```

### Quand une version est stable — on met sur main

```bash
git checkout main
git merge develop
git tag -a v1.0.0 -m "NOXIA v1.0.0"
git push origin main
git push origin --tags
git checkout develop
```

---

## Tableau récapitulatif des commandes

| Commande | Ce qu'elle fait |
|---|---|
| `git status` | Voir les fichiers modifiés |
| `git pull origin develop` | Récupérer les dernières modifs de GitHub |
| `git checkout -b feature/xxx` | Créer une nouvelle branche |
| `git checkout develop` | Aller sur la branche develop |
| `git add .` | Préparer tous les fichiers pour le commit |
| `git commit -m "feat: ..."` | Enregistrer une sauvegarde avec un message |
| `git push origin feature/xxx` | Envoyer sur GitHub |
| `git merge feature/xxx` | Fusionner une branche dans la branche actuelle |
| `git branch -d feature/xxx` | Supprimer une branche locale |
| `git log --oneline` | Voir l'historique des commits |
| `git diff` | Voir les modifications non sauvegardées |
| `git branch` | Voir toutes les branches |

---

> **Règle d'or NOXIA** : Chaque matin tu pull. Chaque soir tu push. Jamais tu ne travailles directement sur `develop` ou `main`. Une fonctionnalité = une branche.

---

*Document rédigé par Danis — Équipe NOXIA / Agenxia*
