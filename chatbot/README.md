# Guide des Endpoints API Noxia pour n8n & Chatbots (WhatsApp / Telegram)

Ce guide répertorie tous les points de terminaison (endpoints) de l'API REST de Noxia nécessaires pour orchestrer et exécuter des actions via des intégrations externes comme **n8n**, WhatsApp, ou Telegram.

---

## 🔒 Authentification & En-têtes (Headers) requis pour les Bots

Pour chaque requête effectuée par un bot externe vers l'API, les en-têtes suivants sont **obligatoires** afin de garantir la sécurité et l'isolation multi-tenant :

| En-tête | Valeur | Description |
|---|---|---|
| `X-Bot-Api-Key` | Clé secrète partagée | Définit l'identité du bot (configurée par `BOT_API_KEY` dans le fichier `.env` du backend). |
| `X-On-Behalf-Of-User-Id` | ID de l'utilisateur (entier) | ID de l'employé pour le compte duquel l'action est menée. Permet d'appliquer son rôle, ses permissions et son établissement. |

> [!IMPORTANT]
> Si `X-On-Behalf-Of-User-Id` est fourni, l'API de Noxia effectue une **impersonation**. Toute action de création, de modification ou de lecture sera filtrée par rapport aux droits de cet employé et aux données de son établissement spécifique.

---

## 1. Gestion des Sessions & Contexte Employé

### 🔗 Activation d'une session de bot
Permet d'associer l'identité externe d'un utilisateur (ex: ID Telegram ou numéro WhatsApp) à son compte employé Noxia grâce à un code de double validation.

* **Méthode** : `POST`
* **Chemin** : `/api/v1/companies/bot/activate/`
* **Headers requis** : `X-Bot-Api-Key` uniquement
* **Payload JSON** :
  ```json
  {
    "messaging_code": "NOX-XXXXX",  // Code d'établissement (10 caractères)
    "activation_code": "NOX-XXXX",  // Code d'activation employé (6 caractères)
    "platform": "whatsapp",         // "whatsapp" ou "telegram"
    "external_id": "+24107000000",  // ID externe de messagerie (ex: numéro ou ID de chat)
    "external_username": "nom_user" // Optionnel
  }
  ```
* **Réponse** : Le profil de l'employé, son rôle et sa liste de permissions réelles.

### 👤 Récupération du contexte de l'employé
Permet à n8n de retrouver les métadonnées d'un employé (et son `user_id` à passer dans les en-têtes) à partir de son identifiant de messagerie.

* **Méthode** : `GET`
* **Chemin** : `/api/v1/companies/bot/employee-context/?platform=whatsapp&external_id=+24107000000`
* **Headers requis** : `X-Bot-Api-Key`
* **Query Params** :
  * `platform` : `whatsapp` ou `telegram`
  * `external_id` : ID de messagerie externe
* **Réponse** :
  ```json
  {
    "user_id": 12,
    "email": "employe@noxia.com",
    "first_name": "Jean",
    "last_name": "Dupont",
    "company_id": 3,
    "company_name": "Snack Central",
    "role": "magasinier",
    "permissions": ["stock"]
  }
  ```

---

## 2. Gestion des Stocks (Module `stock`)

Toutes ces actions requièrent un utilisateur impersonné ayant la permission **`stock`** (ex: Magasinier, Gérant, Responsable, Administrateur).

### 📦 Consulter l'état des stocks
Récupère les produits de l'établissement avec leurs quantités en main et leurs seuils d'alerte.

* **Méthode** : `GET`
* **Chemin** : `/api/v1/inventory/stock-items/`
* **Description** : Renvoie la liste filtrée à l'établissement de l'utilisateur.

### ➕ Enregistrer un mouvement de stock (Entrée, Sortie, Ajustement)
Permet d'ajouter, retirer ou corriger du stock manuellement par messagerie.

* **Méthode** : `POST`
* **Chemin** : `/api/v1/inventory/movements/`
* **Payload JSON** :
  ```json
  {
    "stock_item": 45,             // ID de l'article de stock (StockItem)
    "movement_type": "entry",     // "entry" (Entrée), "exit" (Sortie) ou "adjustment" (Ajustement)
    "quantity": 10.00,            // Quantité (exprimée en unité de base)
    "reason": "Réapprovisionnement par bot", // Optionnel
    "packaging": null,            // Optionnel : ID du conditionnement (ex: Carton)
    "packaging_quantity": null    // Optionnel : Nombre de packages
  }
  ```

### ✏️ Mettre à jour le seuil d'alerte d'un article
* **Méthode** : `PATCH`
* **Chemin** : `/api/v1/inventory/stock-items/{id}/`
* **Payload JSON** :
  ```json
  {
    "alert_threshold": 5.00
  }
  ```

---

## 3. Gestion des Commandes Fournisseurs (Module `stock`)

### 🤝 Contacter un fournisseur pour commande
Déclenche l'envoi asynchrone (via Celery/n8n) d'une commande par e-mail au fournisseur sélectionné pour les produits spécifiés.

* **Méthode** : `POST`
* **Chemin** : `/api/v1/inventory/suppliers/{id}/contact/`
* **Payload JSON** :
  ```json
  {
    "message": "Bonjour, merci de nous livrer ces articles au plus vite.",
    "products": [
      { "name": "Bière Heineken 33cl", "quantity": 5 },
      { "name": "Coca-Cola 50cl", "quantity": 10 }
    ]
  }
  ```

### 📝 Créer une commande fournisseur (Suivi)
* **Méthode** : `POST`
* **Chemin** : `/api/v1/inventory/supplier-orders/`
* **Payload JSON** :
  ```json
  {
    "supplier": 4,                // ID du fournisseur
    "status": "pending",          // "pending", "shipped" ou "delivered"
    "total_amount": 75000.00,     // Optionnel
    "products_list": [            // Liste des produits commandés
      { "name": "Bière Heineken 33cl", "quantity": 5 }
    ]
  }
  ```

### 🚚 Mettre à jour le statut d'une commande (ex: Livrée)
Pratique pour mettre à jour la livraison des commandes via une commande de chat (ex: `/livrer [id]`).

* **Méthode** : `PATCH`
* **Chemin** : `/api/v1/inventory/supplier-orders/{id}/`
* **Payload JSON** :
  ```json
  {
    "status": "delivered"         // Passe la commande au statut "Livrée"
  }
  ```

---

## 4. Gestion des Ventes & Encaissements (Module `ventes`)

Requis pour enregistrer une vente via la caisse enregistreuse du POS (ex: Caissier, Serveur, Gérant, Administrateur).

### 🛒 Enregistrer une vente (Checkout direct)
* **Méthode** : `POST`
* **Chemin** : `/api/v1/sales/`
* **Payload JSON** :
  ```json
  {
    "cash_register": 1,           // ID de la caisse enregistreuse active
    "payment_method": "cash",     // Mode de paiement ("cash" uniquement en Phase 1)
    "items": [
      {
        "product": 15,            // ID du produit
        "quantity": 2.00,         // Quantité vendue
        "unit_price": 1000.00     // Prix unitaire (XAF)
      }
    ]
  }
  ```
* **Description** : Cette action recalcule automatiquement les totaux, crée la vente au statut `paid`, déduit les stocks correspondants et génère une alerte en cas de franchissement de seuil de stock bas.

### 🏦 Consulter les caisses de l'établissement
Utile pour que le bot liste les caisses actives de l'établissement.

* **Méthode** : `GET`
* **Chemin** : `/api/v1/sales/registers/`

---

## 5. Gestion du Catalogue Produits (Module `stock` ou `ventes`)

### 🔍 Consulter la liste des produits
* **Méthode** : `GET`
* **Chemin** : `/api/v1/catalog/products/`
* **Filtres de recherche (Query Params) :**
  * `/api/v1/catalog/products/?search=Heineken` (recherche textuelle)

### ➕ Ajouter un nouveau produit au catalogue
* **Méthode** : `POST`
* **Chemin** : `/api/v1/catalog/products/`
* **Payload JSON** :
  ```json
  {
    "name": "Fanta Orange 50cl",
    "category": 2,                // ID de la catégorie
    "price": 600.00,              // Prix de vente par défaut (XAF)
    "initial_stock": 24.00,       // Optionnel : crée le stock de départ et un mouvement d'ajustement
    "alert_threshold": 6.00       // Optionnel : seuil d'alerte de stock bas
  }
  ```

---

## 6. Gestion des Alertes & Notifications

### 🚨 Consulter les alertes actives (Stock critique & bas)
* **Méthode** : `GET`
* **Chemin** : `/api/v1/notifications/?category=alert`
* **Query Params** : `?category=alert` (filtre les alertes stock uniquement, sans les notifications)

### 💬 Consulter les notifications de compte (Bots, abonnements)
* **Méthode** : `GET`
* **Chemin** : `/api/v1/notifications/?category=notification`

### 🔢 Récupérer le nombre de non-lues
* **Méthode** : `GET`
* **Chemin** : `/api/v1/notifications/unread-count/?category=alert`

### ✅ Marquer une notification/alerte comme lue
* **Méthode** : `POST`
* **Chemin** : `/api/v1/notifications/{id}/read/`

### 🧹 Tout marquer comme lu
* **Méthode** : `POST`
* **Chemin** : `/api/v1/notifications/read-all/?category=alert`
