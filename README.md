# Le Verger du Coin - Système d'Information Intégré

## 📋 Vue d'Ensemble

Système d'information complet pour une petite exploitation agricole, illustrant un SI intégré combinant :
- 📦 **Gestion des stocks** et des produits
- 💰 **Gestion des ventes** (kiosque et marché)
- 👥 **CRM** (gestion de la relation client)
- 📊 **Tableaux de bord** et statistiques

## 🎯 Objectif Pédagogique

Ce projet est un **POC (Proof of Concept) pédagogique** qui démontre :
- L'architecture d'un système d'information modulaire
- L'intégration de plusieurs modules fonctionnels
- La centralisation des données dans une base unique
- La conformité RGPD simplifiée
- Les bonnes pratiques de développement web

## 📁 Structure du Projet

```
VERGER COIN/
│
├── GESTION STOCKS/              Module principal (Port 3000)
│   ├── backend/
│   │   ├── database/
│   │   │   └── verger.db       ← Base de données SQLite partagée
│   │   ├── routes/
│   │   │   ├── produits.js     Gestion des produits
│   │   │   ├── mouvements.js   Mouvements de stock
│   │   │   └── ventes.js       Enregistrement des ventes
│   │   └── server.js            Serveur Express (port 3000)
│   ├── frontend/
│   │   ├── index.html
│   │   ├── app.js
│   │   └── styles.css
│   ├── package.json
│   └── README.md
│
├── CRM/                          Module CRM (Port 3001)
│   ├── backend/
│   │   ├── database/
│   │   │   └── db.js           Utilise verger.db
│   │   ├── routes/
│   │   │   └── clients.js       Gestion des clients
│   │   └── server.js            Serveur Express (port 3001)
│   ├── frontend/
│   │   ├── index.html
│   │   ├── app.js
│   │   └── styles.css
│   ├── package.json
│   ├── README.md
│   ├── GUIDE_IMPLEMENTATION.md
│   └── SYNTHESE_MODULE_CRM.md
│
└── README.md                     Ce fichier
```

## 🏗️ Architecture Globale

### Schéma d'Ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                   BASE DE DONNÉES SQLite                         │
│                     (verger.db)                                  │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ produits │  │mouvements│  │  ventes  │  │ clients  │       │
│  │          │  │  _stock  │  │          │  │          │       │
│  └──────────┘  └──────────┘  └────┬─────┘  └────┬─────┘       │
│                                    │             │              │
│                                    └──client_id──┘              │
└─────────────────────────────────────────────────────────────────┘
          ▲                                          ▲
          │                                          │
┌─────────┴──────────┐                     ┌─────────┴──────────┐
│  GESTION STOCKS    │                     │       CRM          │
│   Port 3000        │◄────── HTTP ───────►│   Port 3001        │
│                    │                     │                    │
│ • Produits         │                     │ • Clients          │
│ • Stocks           │                     │ • Historique       │
│ • Mouvements       │                     │ • RGPD             │
│ • Ventes           │                     │ • Statistiques     │
│ • Dashboard        │                     │                    │
└────────────────────┘                     └────────────────────┘
         │                                          │
         ▼                                          ▼
┌────────────────────┐                     ┌────────────────────┐
│  Interface Web     │                     │  Interface Web     │
│  Bootstrap + JS    │                     │  Bootstrap + JS    │
└────────────────────┘                     └────────────────────┘

     Utilisateurs                              Utilisateurs
```

### Principe de Fonctionnement

1. **Base de données commune** : Les deux modules partagent la même base SQLite
2. **Serveurs indépendants** : Chaque module a son propre serveur Express
3. **Communication HTTP** : Les modules communiquent via API REST
4. **Interfaces séparées** : Chaque module a sa propre interface web

## 🚀 Installation et Démarrage

### Prérequis

- Node.js (version 14 ou supérieure)
- npm (généralement installé avec Node.js)

### Installation

```bash
# Module GESTION STOCKS
cd "GESTION STOCKS"
npm install

# Module CRM
cd "../CRM"
npm install
```

### Démarrage

**Ouvrir deux terminaux simultanément :**

**Terminal 1 - Module GESTION STOCKS :**
```bash
cd "GESTION STOCKS"
npm start
```
→ Serveur démarré sur http://localhost:3000

**Terminal 2 - Module CRM :**
```bash
cd "CRM"
npm start
```
→ Serveur démarré sur http://localhost:3001

### Accès aux Applications

- **Gestion des Stocks** : http://localhost:3000
- **Module CRM** : http://localhost:3001

> ⚠️ **Important** : Les deux serveurs doivent être lancés pour une intégration complète.

## 📊 Modules et Fonctionnalités

### 1. Module GESTION STOCKS (Port 3000)

#### Fonctionnalités
- ✅ Gestion du catalogue de produits (fruits, légumes, transformés)
- ✅ Suivi des stocks en temps réel
- ✅ Enregistrement des mouvements (entrées/sorties)
- ✅ Enregistrement des ventes (kiosque/marché)
- ✅ Association d'un client aux ventes (intégration CRM)
- ✅ Alertes de stock bas
- ✅ Tableau de bord avec statistiques

#### Technologies
- Backend : Node.js + Express + SQLite + better-sqlite3
- Frontend : JavaScript vanilla + Bootstrap 5

### 2. Module CRM (Port 3001)

#### Fonctionnalités
- ✅ Gestion des clients (création, modification, suppression)
- ✅ Conformité RGPD (consentement obligatoire)
- ✅ Droit à l'oubli (suppression logique + anonymisation)
- ✅ Historique d'achat par client
- ✅ Statistiques clients (clients actifs, consentements)
- ✅ Association des ventes aux clients

#### Technologies
- Backend : Node.js + Express + SQLite + better-sqlite3
- Frontend : JavaScript vanilla + Bootstrap 5

## 🗄️ Base de Données

### Structure

**Tables :**

1. **produits** (Module GESTION STOCKS)
   - Informations sur les produits agricoles
   - Stock actuel, seuil d'alerte

2. **mouvements_stock** (Module GESTION STOCKS)
   - Historique des entrées et sorties de stock

3. **ventes** (Module GESTION STOCKS + CRM)
   - Enregistrement des ventes
   - Lien optionnel vers un client

4. **clients** (Module CRM)
   - Informations clients
   - Consentement RGPD, statut actif

### Relations

```
clients (1) ──────< (n) ventes (n) >────── (1) produits
```

## 🔒 Conformité RGPD

### Principes Implémentés

1. **Consentement Explicite**
   - Case à cocher obligatoire à la création client
   - Pas de pré-cochage

2. **Minimisation des Données**
   - Email et téléphone optionnels
   - Seules les données nécessaires sont collectées

3. **Droit à l'Oubli**
   - Suppression logique (champ `actif`)
   - Anonymisation automatique des ventes

4. **Transparence**
   - Messages d'information clairs
   - Statut du consentement visible

## 🎨 Interfaces Utilisateur

### Module GESTION STOCKS
**Thème vert** 🟢
- Onglets : Produits & Stocks | Ventes | Mouvements | Tableau de Bord
- Statistiques en temps réel
- Tableaux interactifs

### Module CRM
**Thème bleu** 🔵
- Onglets : Clients | Nouveau Client | Statistiques
- Historique détaillé par client
- Gestion RGPD intégrée

## 📈 Exemples d'Usage

### Scénario 1 : Enregistrer une Récolte
1. Module GESTION STOCKS → Onglet "Mouvements"
2. Sélectionner produit = "Pommes Gala"
3. Quantité = 50 kg
4. Source = "Récolte du verger"
5. Enregistrer → Stock mis à jour automatiquement

### Scénario 2 : Vente avec Client
1. Module GESTION STOCKS → Onglet "Ventes"
2. Sélectionner produit = "Pommes Gala", Quantité = 5 kg
3. Canal = "Marché"
4. Client = "Marie Dubois"
5. Enregistrer → Stock décrémenté, vente enregistrée, historique client mis à jour

### Scénario 3 : Consulter l'Historique Client
1. Module CRM → Onglet "Clients"
2. Cliquer sur l'icône "Historique" de Marie Dubois
3. Visualiser tous ses achats passés

### Scénario 4 : Droit à l'Oubli RGPD
1. Module CRM → Onglet "Clients"
2. Cliquer sur le bouton "Supprimer" d'un client
3. Confirmer → Client désactivé, ventes anonymisées

## 📚 Documentation

### Par Module

**GESTION STOCKS/**
- `README.md` - Documentation du module

**CRM/**
- `README.md` - Guide d'utilisation
- `GUIDE_IMPLEMENTATION.md` - Documentation technique
- `SYNTHESE_MODULE_CRM.md` - Synthèse du projet CRM

### Ce Fichier
Vue d'ensemble globale du système intégré

## 🔧 Technologies Utilisées

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **better-sqlite3** - Base de données SQLite
- **cors** - Gestion CORS pour communication inter-modules

### Frontend
- **HTML5** - Structure
- **CSS3** - Styles personnalisés
- **JavaScript (ES6+)** - Logique applicative
- **Bootstrap 5** - Framework CSS
- **Bootstrap Icons** - Icônes

### Base de Données
- **SQLite** - Base de données relationnelle légère

## 🎓 Valeur Pédagogique

### Concepts Illustrés

**Systèmes d'Information :**
- Architecture modulaire
- Intégration de modules
- Base de données centralisée
- Communication inter-services

**Développement Web :**
- Architecture client-serveur
- API REST
- CRUD complet
- Fetch API (asynchrone)

**Base de Données :**
- Modélisation relationnelle
- Clés étrangères
- Transactions
- Suppression logique

**Métier :**
- Gestion des stocks
- CRM simplifié
- Conformité RGPD

## ⚠️ Limitations

Ce projet est un **POC pédagogique**. Il ne propose pas :

- ❌ Authentification / autorisation
- ❌ Chiffrement des données sensibles
- ❌ Tests unitaires / intégration
- ❌ CI/CD
- ❌ Logs structurés
- ❌ Gestion d'erreurs exhaustive
- ❌ Optimisations de performance avancées

Ces éléments seraient nécessaires pour une **application de production**.

## 🚀 Évolutions Possibles

### Court Terme
- Export CSV/Excel des données
- Recherche et filtres avancés
- Impression de documents (bons de livraison, factures)
- Pagination pour grandes listes

### Moyen Terme
- Authentification multi-utilisateurs
- Rôles et permissions (admin, vendeur, etc.)
- Envoi d'emails automatiques
- Application mobile

### Long Terme
- Migration PostgreSQL
- Microservices dédiés
- API GraphQL
- Intégration comptabilité
- BI et analytics avancés

## 🧪 Tests Rapides

### Test 1 : Création Produit
```
Module : GESTION STOCKS
Onglet : Produits & Stocks
Action : Créer un nouveau produit "Cerises"
Résultat : Produit visible dans la liste
```

### Test 2 : Création Client
```
Module : CRM
Onglet : Nouveau Client
Action : Créer "Client Test" avec consentement RGPD
Résultat : Client visible dans la liste
```

### Test 3 : Vente Complète
```
Module : GESTION STOCKS
Onglet : Ventes
Action : Vendre 2kg de Pommes à "Client Test" via Kiosque
Résultat : Stock décrémenté, vente enregistrée
```

### Test 4 : Historique
```
Module : CRM
Onglet : Clients
Action : Consulter l'historique de "Client Test"
Résultat : Vente de Pommes visible
```

### Test 5 : RGPD
```
Module : CRM
Onglet : Clients
Action : Supprimer "Client Test"
Résultat : Client désactivé, vente anonymisée
```

## 📞 Support

Pour toute question :
- Consultez les fichiers README dans chaque module
- Référez-vous aux guides d'implémentation
- Examinez le code commenté

## 🎉 Conclusion

**Le Verger du Coin** est un système d'information complet et fonctionnel qui démontre :

✅ Une architecture modulaire claire
✅ L'intégration de plusieurs domaines métier
✅ La conformité RGPD de base
✅ Les bonnes pratiques de développement
✅ Une base solide pour des évolutions futures

Le système est **prêt à l'emploi** et peut servir de base pour un projet réel ou comme outil pédagogique pour apprendre l'architecture des SI.

---

**Le Verger du Coin** - Système d'Information Intégré - Version 1.0.0
Projet Pédagogique - POC Fonctionnel
