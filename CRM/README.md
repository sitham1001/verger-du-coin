# Module CRM - Le Verger du Coin

## 📋 Description

Module de gestion de la relation client (CRM) pour Le Verger du Coin. Ce module ultra léger permet de :
- Gérer les informations clients
- Associer les ventes à des clients
- Consulter l'historique d'achat des clients
- Assurer la conformité RGPD (consentement, droit à l'oubli)

## 🎯 Objectifs Pédagogiques

Ce module illustre :
- L'intégration d'un CRM dans un système d'information existant
- La gestion de la conformité RGPD de manière simple
- Le lien entre données clients et données transactionnelles (ventes)
- La suppression logique et l'anonymisation des données

## 📁 Structure du Projet

```
CRM/
├── backend/
│   ├── routes/
│   │   └── clients.js          # Routes API pour les clients
│   ├── database/
│   │   └── db.js                # Schéma base de données CRM
│   └── server.js                # Serveur Express du module CRM
├── frontend/
│   ├── index.html               # Interface web CRM
│   ├── app.js                   # Logique JavaScript
│   └── styles.css               # Styles CSS
├── package.json
└── README.md
```

## 🚀 Installation

### Prérequis

- Node.js (version 14 ou supérieure)
- Le module GESTION STOCKS doit être installé et fonctionnel
- Les deux modules partagent la même base de données SQLite

### Installation des Dépendances

```bash
cd "C:\Users\mathi\OneDrive\Bureau\VERGER COIN\CRM"
npm install
```

## ▶️ Démarrage

### Démarrer le Module CRM

```bash
npm start
```

Le serveur CRM démarre sur `http://localhost:3001`

### Démarrer le Module Gestion Stocks (dans un autre terminal)

```bash
cd "../GESTION STOCKS"
npm start
```

Le serveur Gestion Stocks démarre sur `http://localhost:3000`

### Accès aux Interfaces

- **Module CRM** : http://localhost:3001
- **Module Gestion Stocks** : http://localhost:3000

> **Important** : Les deux serveurs doivent être démarrés simultanément pour que l'intégration fonctionne complètement.

## 📊 Schéma de Base de Données

### Table `clients`

```sql
CREATE TABLE clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL,
  email TEXT,
  telephone TEXT,
  consentement_rgpd INTEGER NOT NULL DEFAULT 0,
  actif INTEGER NOT NULL DEFAULT 1,
  date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
  date_modification DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Modification de la Table `ventes`

La table existante `ventes` a été enrichie avec :

```sql
ALTER TABLE ventes
ADD COLUMN client_id INTEGER
REFERENCES clients(id) ON DELETE SET NULL
```

## 🔌 API REST

### Clients

#### GET /api/clients
Récupère la liste de tous les clients actifs.

**Réponse** :
```json
[
  {
    "id": 1,
    "nom": "Marie Dubois",
    "email": "marie.dubois@example.com",
    "telephone": "0612345678",
    "consentement_rgpd": 1,
    "actif": 1,
    "date_creation": "2024-01-19T10:00:00.000Z"
  }
]
```

#### GET /api/clients/:id
Récupère les détails d'un client spécifique.

#### GET /api/clients/:id/historique
Récupère l'historique des achats d'un client avec statistiques.

**Réponse** :
```json
{
  "client": {
    "id": 1,
    "nom": "Marie Dubois"
  },
  "statistiques": {
    "nombre_achats": 5,
    "produits_achetes": 3,
    "canaux_utilises": ["kiosque", "marche"]
  },
  "historique": [
    {
      "id": 10,
      "produit_nom": "Pommes Gala",
      "quantite": 2.5,
      "canal_vente": "kiosque",
      "date_vente": "2024-01-19T10:00:00.000Z"
    }
  ]
}
```

#### POST /api/clients
Crée un nouveau client.

**Corps de la requête** :
```json
{
  "nom": "Jean Martin",
  "email": "jean.martin@example.com",
  "telephone": "0623456789",
  "consentement_rgpd": 1
}
```

**Contraintes** :
- `nom` : obligatoire
- `consentement_rgpd` : obligatoire, doit être égal à 1 (true)
- `email` et `telephone` : optionnels

#### PUT /api/clients/:id
Met à jour les informations d'un client.

#### DELETE /api/clients/:id
Désactive un client (suppression logique RGPD).

**Comportement** :
- Met le champ `actif` à 0
- Anonymise les ventes associées (client_id devient NULL)
- Conforme au droit à l'oubli RGPD

#### GET /api/clients/statistiques/globales
Récupère des statistiques globales sur les clients.

## 🔗 Intégration avec le Module Ventes

### Enregistrement d'une Vente avec Client

Lors de l'enregistrement d'une vente dans le module GESTION STOCKS, vous pouvez maintenant associer un client :

**POST /api/ventes** (module GESTION STOCKS)

```json
{
  "produit_id": 1,
  "quantite": 2.5,
  "canal_vente": "kiosque",
  "client_id": 3
}
```

**Notes** :
- `client_id` est optionnel
- Si `client_id` est omis ou NULL, la vente est anonyme
- Seuls les clients avec consentement RGPD peuvent être associés à une vente

## 🔒 Conformité RGPD

### Principes Implémentés

1. **Consentement Explicite**
   - Le champ `consentement_rgpd` doit être à 1 pour créer un client
   - Impossible d'associer une vente à un client sans consentement

2. **Droit à l'Oubli**
   - La suppression d'un client est logique (champ `actif` = 0)
   - Les ventes associées sont anonymisées automatiquement

3. **Minimisation des Données**
   - Email et téléphone sont optionnels
   - Seules les données nécessaires sont collectées

4. **Transparence**
   - L'interface affiche clairement le statut du consentement
   - Messages d'information RGPD lors de la création d'un client

## 📈 Fonctionnalités

### Module CRM

1. **Liste des Clients**
   - Affichage de tous les clients actifs
   - Filtrage par consentement RGPD
   - Actions : voir historique, modifier, supprimer

2. **Création de Client**
   - Formulaire avec validation
   - Consentement RGPD obligatoire
   - Messages d'information clairs

3. **Historique Client**
   - Liste des achats
   - Statistiques (nombre d'achats, produits différents, canaux)
   - Détails par vente (produit, quantité, canal, date)

4. **Statistiques**
   - Nombre de clients actifs
   - Clients avec consentement
   - Clients les plus actifs

### Intégration dans GESTION STOCKS

- Sélection de client lors de l'enregistrement d'une vente
- Option "Client anonyme" par défaut
- Liste déroulante des clients avec consentement RGPD

## 🛠️ Choix Techniques

### Architecture

- **Serveurs Séparés** : Deux serveurs Express indépendants (ports 3000 et 3001)
- **Base de Données Partagée** : SQLite unique pour cohérence des données
- **API REST** : Communication entre modules via HTTP/JSON

### Avantages de cette Approche

- Séparation des préoccupations (stocks vs clients)
- Modules indépendants et maintenables
- Possibilité d'évoluer vers des microservices
- Base de données unique pour intégrité référentielle

### Limitations (Volontaires)

- Pas de système d'authentification (POC pédagogique)
- Pas de gestion avancée des permissions
- Pas de cache ou d'optimisation poussée
- Interface basique (Bootstrap uniquement)

## 🧪 Données de Test

Au premier démarrage, 4 clients de démonstration sont créés automatiquement :
- Marie Dubois
- Jean Martin
- Sophie Bernard
- Pierre Durand

Tous ont donné leur consentement RGPD.

## 📝 Migration Légère

### Si la Base de Données Existe Déjà

Le module CRM vérifie automatiquement si :
1. La table `clients` existe → la crée si nécessaire
2. La colonne `client_id` existe dans `ventes` → l'ajoute si nécessaire

**Aucune action manuelle requise** : le schéma est mis à jour au démarrage.

## 🎓 Utilisation Pédagogique

Ce module illustre :

1. **Intégration de modules** : Comment lier un CRM à un système de gestion
2. **RGPD en pratique** : Implémentation simplifiée des principes RGPD
3. **Architecture modulaire** : Découpage fonctionnel d'un SI
4. **Cohérence des données** : Gestion des relations entre entités
5. **Suppression logique** : Alternative à la suppression physique

## 🚧 Évolutions Possibles

- Authentification et gestion des rôles
- Segmentation clients (fidélité, typologie)
- Campagnes marketing ciblées
- Export des données clients (CSV, Excel)
- Notifications par email
- Dashboard avancé avec graphiques

## 📞 Support

Pour toute question sur ce module CRM pédagogique, consultez le fichier CLAUDE.md à la racine du projet principal.

---

**Le Verger du Coin** - Module CRM - Version 1.0.0 - POC Pédagogique
