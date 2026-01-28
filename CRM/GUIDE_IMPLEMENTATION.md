# Guide d'Implémentation - Module CRM

## 🎯 Vue d'Ensemble

Ce document explique les choix techniques et l'architecture du module CRM intégré au Verger du Coin.

## 📐 Architecture Technique

### Choix d'Architecture : Deux Serveurs Indépendants

Le projet est structuré en deux modules distincts avec deux serveurs Express :

1. **Module GESTION STOCKS** (Port 3000)
   - Gestion des produits
   - Gestion des stocks et mouvements
   - Gestion des ventes
   - Tableau de bord

2. **Module CRM** (Port 3001)
   - Gestion des clients
   - Historique d'achats
   - Conformité RGPD
   - Statistiques clients

### Base de Données Partagée

Les deux modules utilisent la même base de données SQLite :
```
GESTION STOCKS/backend/database/verger.db
```

**Avantages** :
- Intégrité référentielle automatique
- Pas de synchronisation entre bases
- Transactions cohérentes
- Simplicité de déploiement

## 🔄 Schéma d'Intégration

```
┌─────────────────────────────────────────────────────────────┐
│                    BASE DE DONNÉES SQLite                    │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ produits │  │mouvements│  │  ventes  │  │ clients  │   │
│  └──────────┘  └──────────┘  └────┬─────┘  └────┬─────┘   │
│                                    │             │          │
│                                    └──client_id──┘          │
└─────────────────────────────────────────────────────────────┘
         ▲                                           ▲
         │                                           │
┌────────┴─────────┐                        ┌────────┴─────────┐
│  Serveur Express │                        │  Serveur Express │
│    Port 3000     │                        │    Port 3001     │
│                  │                        │                  │
│  Module GESTION  │◄─────── HTTP ────────►│   Module CRM     │
│      STOCKS      │                        │                  │
└──────────────────┘                        └──────────────────┘
         │                                           │
         ▼                                           ▼
┌──────────────────┐                        ┌──────────────────┐
│   Frontend JS    │                        │   Frontend JS    │
│  (Vanilla JS)    │                        │  (Vanilla JS)    │
└──────────────────┘                        └──────────────────┘
```

## 🗄️ Schéma de Base de Données

### Table `clients` (Nouvelle)

```sql
CREATE TABLE clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL,
  email TEXT,
  telephone TEXT,
  consentement_rgpd INTEGER NOT NULL DEFAULT 0 CHECK(consentement_rgpd IN (0, 1)),
  actif INTEGER NOT NULL DEFAULT 1 CHECK(actif IN (0, 1)),
  date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
  date_modification DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Champs** :
- `nom` : Nom complet du client (obligatoire)
- `email` : Email (optionnel)
- `telephone` : Numéro de téléphone (optionnel)
- `consentement_rgpd` : 1 = consentement donné, 0 = pas de consentement (obligatoire)
- `actif` : 1 = actif, 0 = désactivé/supprimé logiquement
- `date_creation` : Date de création automatique
- `date_modification` : Date de dernière modification

### Modification de `ventes` (Existante)

```sql
ALTER TABLE ventes
ADD COLUMN client_id INTEGER
REFERENCES clients(id) ON DELETE SET NULL
```

**Comportement** :
- `client_id` peut être NULL (vente anonyme)
- Si le client est supprimé, `client_id` devient automatiquement NULL

## 🔒 Implémentation RGPD

### Principe de Consentement

```javascript
// Création d'un client - consentement obligatoire
POST /api/clients
{
  "nom": "Marie Dubois",
  "email": "marie@example.com",
  "consentement_rgpd": 1  // OBLIGATOIRE et doit être 1
}
```

**Validation côté serveur** :
```javascript
if (consentement_rgpd !== 1 && consentement_rgpd !== true) {
  return res.status(400).json({
    error: 'Le client doit consentir au traitement de ses données (RGPD)'
  });
}
```

### Droit à l'Oubli (Suppression Logique)

```javascript
DELETE /api/clients/:id
```

**Implémentation** :
```javascript
const transaction = db.transaction(() => {
  // 1. Désactiver le client
  db.prepare(`
    UPDATE clients
    SET actif = 0, date_modification = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(id);

  // 2. Anonymiser les ventes
  db.prepare(`
    UPDATE ventes
    SET client_id = NULL
    WHERE client_id = ?
  `).run(id);
});

transaction();
```

**Résultat** :
- Le client n'apparaît plus dans les listes
- Ses données personnelles restent en base (archivage légal)
- Les ventes sont anonymisées (conformité RGPD)

## 🔗 Communication Inter-Modules

### Chargement des Clients dans Module Ventes

**Fichier** : `GESTION STOCKS/frontend/app.js`

```javascript
// Configuration des URLs API
const API_BASE_URL = 'http://localhost:3000/api';
const CRM_API_BASE_URL = 'http://localhost:3001/api';

// Fonction de chargement des clients
async function loadClients() {
  try {
    const response = await fetch(`${CRM_API_BASE_URL}/clients`);
    const clients = await response.json();
    updateClientSelect(clients);
  } catch (error) {
    // Erreur ignorée si CRM non disponible
    console.error('Module CRM non disponible');
  }
}

// Filtrage : seuls les clients avec consentement
function updateClientSelect(clients) {
  const clientsAvecConsentement = clients.filter(
    c => c.consentement_rgpd === 1
  );
  // ... mise à jour du select
}
```

### Enregistrement d'une Vente avec Client

```javascript
// Récupération du client sélectionné
const client_id_str = document.getElementById('venteClient').value;
const client_id = client_id_str ? parseInt(client_id_str) : null;

// Envoi au backend
const response = await fetch(`${API_BASE_URL}/ventes`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    produit_id,
    quantite,
    canal_vente,
    client_id  // Peut être null (vente anonyme)
  })
});
```

## 📋 Routes API

### Module CRM (Port 3001)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/clients` | Liste tous les clients actifs |
| GET | `/api/clients/:id` | Détails d'un client |
| GET | `/api/clients/:id/historique` | Historique d'achats du client |
| POST | `/api/clients` | Créer un nouveau client |
| PUT | `/api/clients/:id` | Modifier un client |
| DELETE | `/api/clients/:id` | Désactiver un client (RGPD) |
| GET | `/api/clients/statistiques/globales` | Statistiques globales |

### Module GESTION STOCKS (Port 3000)

Modification de la route existante :

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/ventes` | Enregistrer une vente (+ client_id optionnel) |

## 🎨 Interface Utilisateur

### Module CRM

**Onglets** :
1. **Clients** : Liste avec actions (voir, modifier, supprimer)
2. **Nouveau Client** : Formulaire de création avec consentement RGPD
3. **Statistiques** : Clients les plus actifs

**Composants** :
- Cartes statistiques (nombre clients, consentements, clients actifs)
- Tableaux avec filtres
- Modals pour détails et modification
- Badges visuels (RGPD, statut)

### Module GESTION STOCKS

**Modification Apportée** :
- Ajout d'un champ "Client" dans le formulaire de vente
- Liste déroulante avec clients ayant le consentement RGPD
- Option par défaut : "Client anonyme"
- Texte d'aide : "Sélectionnez un client pour associer cette vente"

## 🔐 Sécurité et Validation

### Côté Frontend

```javascript
// Validation email
if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  return res.status(400).json({ error: 'Format d\'email invalide' });
}

// Validation téléphone
if (telephone && !/^[\d\s\+\-\(\)]+$/.test(telephone)) {
  return res.status(400).json({ error: 'Format de téléphone invalide' });
}

// Protection XSS
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}
```

### Côté Backend

```javascript
// Validation des données obligatoires
if (!nom || nom.trim().length === 0) {
  return res.status(400).json({ error: 'Le nom est obligatoire' });
}

// Consentement RGPD obligatoire
if (consentement_rgpd !== 1 && consentement_rgpd !== true) {
  return res.status(400).json({
    error: 'Le consentement RGPD est obligatoire'
  });
}

// Vérification d'unicité
const clientExistant = db.prepare(
  'SELECT id FROM clients WHERE nom = ? AND actif = 1'
).get(nom.trim());
```

## 🚀 Démarrage et Tests

### Démarrage des Deux Modules

**Terminal 1 - GESTION STOCKS** :
```bash
cd "C:\Users\mathi\OneDrive\Bureau\VERGER COIN\GESTION STOCKS"
npm install  # Si première fois
npm start
```

**Terminal 2 - CRM** :
```bash
cd "C:\Users\mathi\OneDrive\Bureau\VERGER COIN\CRM"
npm install  # Si première fois
npm start
```

### Tests Fonctionnels

1. **Test Création Client**
   - Accéder à http://localhost:3001
   - Onglet "Nouveau Client"
   - Remplir le formulaire
   - Cocher le consentement RGPD
   - Enregistrer

2. **Test Vente avec Client**
   - Accéder à http://localhost:3000
   - Onglet "Ventes"
   - Sélectionner un produit
   - Sélectionner un client dans la liste
   - Enregistrer la vente

3. **Test Historique Client**
   - Accéder à http://localhost:3001
   - Onglet "Clients"
   - Cliquer sur l'icône historique d'un client
   - Vérifier les achats affichés

4. **Test Suppression RGPD**
   - Supprimer un client
   - Vérifier qu'il disparaît de la liste
   - Vérifier que ses ventes sont toujours visibles (anonymisées)

## 📊 Performances

### Optimisations Implémentées

1. **Index sur client_id** :
```sql
CREATE INDEX IF NOT EXISTS idx_ventes_client
ON ventes(client_id);
```

2. **Transactions pour cohérence** :
```javascript
const transaction = db.transaction(() => {
  // Opérations multiples
});
transaction();
```

3. **Requêtes préparées (Prepared Statements)** :
```javascript
db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
```

## 🔧 Évolutions Possibles

### Court Terme
- Ajouter pagination pour grandes listes
- Export CSV des clients
- Recherche/filtrage avancé

### Moyen Terme
- Authentification utilisateurs
- Rôles et permissions
- Envoi d'emails aux clients
- Campagnes marketing

### Long Terme
- Migration vers PostgreSQL
- Microservices dédiés
- API GraphQL
- Application mobile

## 📝 Notes Pédagogiques

### Concepts Illustrés

1. **Architecture Modulaire**
   - Séparation des préoccupations
   - Modules indépendants mais connectés

2. **Base de Données Relationnelle**
   - Clés étrangères
   - Contraintes d'intégrité
   - Transactions

3. **API RESTful**
   - Verbes HTTP (GET, POST, PUT, DELETE)
   - Codes de statut appropriés
   - Format JSON

4. **RGPD Simplifié**
   - Consentement explicite
   - Droit à l'oubli
   - Minimisation des données
   - Suppression logique vs physique

5. **Frontend Moderne**
   - Fetch API (asynchrone)
   - Manipulation du DOM
   - Bootstrap pour UI responsive

## ⚠️ Limitations Assumées

Ce POC pédagogique ne propose volontairement pas :

- Authentification / autorisation
- Chiffrement des données sensibles
- Audit trail complet
- Tests unitaires / intégration
- CI/CD
- Documentation OpenAPI/Swagger
- Gestion d'erreurs exhaustive
- Logs structurés

Ces éléments seraient nécessaires pour une application en production.

---

**Le Verger du Coin** - Guide d'Implémentation CRM - Version 1.0.0
