# Le Verger du Coin - Système d'Information

Prototype (POC) de système de gestion des stocks pour une petite exploitation agricole.

## Contexte

**Le Verger du Coin** est une exploitation familiale qui vend des fruits et légumes au kiosque à la ferme et sur des marchés fermiers. Ce système permet de moderniser la gestion des stocks, actuellement réalisée manuellement (Excel, cahiers papier).

## Objectif du POC

Développer un outil simple et pédagogique de gestion des stocks connecté aux ventes, démontrant une modernisation réaliste du SI adaptée à une petite structure sans service informatique.

## Fonctionnalités Implémentées

### 1. Gestion des Produits
- Liste complète des produits agricoles
- Catégorisation : fruit / légume / produit transformé
- Unités de mesure : kg ou pièce
- Visualisation du stock actuel
- Alertes visuelles pour stocks faibles (< seuil d'alerte)
- Ajout de nouveaux produits

### 2. Entrées de Stock
- Enregistrement des récoltes
- Réception fournisseur
- Production interne
- Mise à jour automatique des stocks

### 3. Sorties de Stock (Ventes)
- Enregistrement des ventes
- Canaux : kiosque ou marché
- Décrémentation automatique du stock
- Vérification du stock disponible avant vente
- Historique complet des ventes

### 4. Visualisation
- Tableau de bord avec statistiques :
  - Produits les plus vendus
  - Ventes par canal
  - Stock total par catégorie
- Historique des mouvements de stock
- Indicateurs visuels pour stocks en alerte

## Architecture Technique

### Stack Technologique

**Backend**
- **Node.js** + **Express** : serveur API REST
- **SQLite** + **better-sqlite3** : base de données locale (fichier unique)
- **CORS** : gestion des requêtes cross-origin

**Frontend**
- **HTML5 / CSS3** : structure et styles
- **Bootstrap 5** : framework CSS responsive
- **JavaScript Vanilla** : logique applicative (pas de framework complexe)

**Base de Données**
- SQLite avec 3 tables :
  - `produits` : informations sur chaque produit
  - `mouvements_stock` : historique des entrées/sorties
  - `ventes` : détail des ventes par canal

### Architecture Applicative

```
┌─────────────────────────────────────────────┐
│           INTERFACE UTILISATEUR             │
│     (HTML/CSS/JavaScript + Bootstrap)       │
└──────────────────┬──────────────────────────┘
                   │ HTTP/REST
                   │
┌──────────────────▼──────────────────────────┐
│            API REST (Express)               │
│  ┌─────────────────────────────────────┐   │
│  │  Routes :                           │   │
│  │  - /api/produits                    │   │
│  │  - /api/mouvements                  │   │
│  │  - /api/ventes                      │   │
│  └─────────────────┬───────────────────┘   │
└────────────────────┼───────────────────────┘
                     │
┌────────────────────▼───────────────────────┐
│      BASE DE DONNÉES SQLite (fichier)     │
│  ┌──────────────────────────────────────┐ │
│  │  Tables :                            │ │
│  │  - produits                          │ │
│  │  - mouvements_stock                  │ │
│  │  - ventes                            │ │
│  └──────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

### Choix Techniques Justifiés

1. **SQLite** :
   - Pas de serveur de base de données à installer
   - Fichier unique facilement sauvegardable
   - Parfait pour une petite exploitation

2. **Express (Node.js)** :
   - Simplicité et légèreté
   - Large communauté et documentation
   - Idéal pour un POC pédagogique

3. **JavaScript Vanilla (pas de React/Vue)** :
   - Code lisible et compréhensible par des étudiants
   - Pas de courbe d'apprentissage complexe
   - Déploiement simple sans compilation

4. **Bootstrap** :
   - Interface professionnelle sans effort CSS
   - Responsive par défaut
   - Composants prêts à l'emploi

## Installation et Lancement

### Prérequis

- **Node.js** version 14 ou supérieure ([télécharger Node.js](https://nodejs.org/))
- Un navigateur web moderne (Chrome, Firefox, Edge)

### Étapes d'Installation

1. **Installer les dépendances**

```bash
cd verger-du-coin
npm install
```

2. **Lancer l'application**

```bash
npm start
```

3. **Accéder à l'interface**

Ouvrir un navigateur et aller à : **http://localhost:3000**

### Mode Développement (avec rechargement automatique)

```bash
npm run dev
```

## Utilisation

### Premier Lancement

Au démarrage, l'application crée automatiquement :
- La base de données SQLite (`backend/database/verger.db`)
- Les tables nécessaires
- Des données de démonstration (8 produits avec stocks initiaux)

### Scénarios d'Utilisation

**Scénario 1 : Enregistrer une récolte**
1. Aller dans l'onglet "Mouvements"
2. Sélectionner un produit
3. Entrer la quantité récoltée
4. Choisir "Récolte du verger"
5. Cliquer sur "Ajouter au Stock"

**Scénario 2 : Enregistrer une vente**
1. Aller dans l'onglet "Ventes"
2. Sélectionner un produit
3. Entrer la quantité vendue
4. Choisir le canal (Kiosque ou Marché)
5. Cliquer sur "Enregistrer la Vente"
→ Le stock est automatiquement décrémenté

**Scénario 3 : Ajouter un nouveau produit**
1. Onglet "Produits & Stocks"
2. Cliquer sur "Nouveau Produit"
3. Remplir les informations
4. Définir le seuil d'alerte
5. Créer le produit

**Scénario 4 : Consulter les statistiques**
1. Aller dans l'onglet "Tableau de Bord"
2. Visualiser :
   - Les produits les plus vendus
   - Les ventes par canal (kiosque/marché)
   - Le stock total par catégorie

## Structure du Projet

```
verger-du-coin/
│
├── backend/
│   ├── database/
│   │   ├── db.js              # Configuration SQLite et schéma
│   │   └── verger.db          # Base de données (créée au lancement)
│   │
│   ├── routes/
│   │   ├── produits.js        # Routes API produits
│   │   ├── mouvements.js      # Routes API mouvements
│   │   └── ventes.js          # Routes API ventes + statistiques
│   │
│   └── server.js              # Point d'entrée du serveur Express
│
├── frontend/
│   ├── index.html             # Interface utilisateur
│   ├── styles.css             # Styles personnalisés
│   └── app.js                 # Logique JavaScript
│
├── package.json               # Configuration npm et dépendances
└── README.md                  # Cette documentation
```

## API REST Disponible

### Produits

- `GET /api/produits` - Liste tous les produits
- `GET /api/produits/:id` - Détails d'un produit
- `POST /api/produits` - Créer un produit
- `PUT /api/produits/:id` - Modifier un produit
- `DELETE /api/produits/:id` - Supprimer un produit

### Mouvements de Stock

- `GET /api/mouvements` - Historique des mouvements
- `POST /api/mouvements/entree` - Enregistrer une entrée
- `POST /api/mouvements/sortie` - Enregistrer une sortie

### Ventes

- `GET /api/ventes` - Historique des ventes
- `POST /api/ventes` - Enregistrer une vente
- `GET /api/ventes/statistiques` - Statistiques de vente

## Points Pédagogiques

Ce projet illustre plusieurs concepts d'urbanisation et de gouvernance des SI :

1. **Architecture 3-tiers** : séparation présentation / logique / données
2. **API RESTful** : principes d'exposition de services
3. **CRUD complet** : Create, Read, Update, Delete
4. **Transactions** : cohérence des données (vente = sortie stock + mouvement)
5. **Contraintes métier** : validation (stock suffisant, catégories valides)
6. **Données de référence** : catégories, canaux de vente
7. **Indicateurs métier** : tableaux de bord et alertes

## Évolutions Possibles

- Authentification utilisateur (agriculteur, vendeur)
- Gestion des prix et calcul du chiffre d'affaires
- Export des données (CSV, PDF)
- Prévisions de stock basées sur l'historique
- Mode hors-ligne pour les marchés
- Application mobile

## Contexte Académique

Ce projet s'inscrit dans un cas d'étude en **urbanisation et gouvernance des SI**. Il démontre comment moderniser progressivement le SI d'une petite structure avec :
- Des technologies accessibles
- Une architecture simple et évolutive
- Un investissement minimal
- Une appropriation rapide par les utilisateurs

## Licence

MIT - Projet pédagogique libre d'utilisation

---

**Développé pour Le Verger du Coin** - Prototype POC - 2026
