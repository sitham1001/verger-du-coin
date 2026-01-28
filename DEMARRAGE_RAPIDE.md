# 🚀 Démarrage Rapide - Le Verger du Coin

## ⚡ Installation et Lancement en 3 Minutes

### 1️⃣ Installation (à faire une seule fois)

**Terminal 1 - Module GESTION STOCKS :**
```bash
cd "C:\Users\mathi\OneDrive\Bureau\VERGER COIN\GESTION STOCKS"
npm install
```

**Terminal 2 - Module CRM :**
```bash
cd "C:\Users\mathi\OneDrive\Bureau\VERGER COIN\CRM"
npm install
```

### 2️⃣ Lancement (à chaque session)

**Terminal 1 - Module GESTION STOCKS :**
```bash
cd "C:\Users\mathi\OneDrive\Bureau\VERGER COIN\GESTION STOCKS"
npm start
```
✅ Serveur démarré sur http://localhost:3000

**Terminal 2 - Module CRM :**
```bash
cd "C:\Users\mathi\OneDrive\Bureau\VERGER COIN\CRM"
npm start
```
✅ Serveur démarré sur http://localhost:3001

### 3️⃣ Accès aux Interfaces

- **Gestion Stocks** : http://localhost:3000
- **Module CRM** : http://localhost:3001

---

## 🎯 Premiers Pas

### Test 1 : Consulter les Produits
1. Aller sur http://localhost:3000
2. Onglet "Produits & Stocks"
3. Observer les produits pré-chargés (Pommes, Poires, etc.)

### Test 2 : Consulter les Clients
1. Aller sur http://localhost:3001
2. Onglet "Clients"
3. Observer les clients pré-chargés (Marie, Jean, etc.)

### Test 3 : Enregistrer une Vente avec Client
1. Aller sur http://localhost:3000
2. Onglet "Ventes"
3. Remplir : Produit = "Pommes Gala", Quantité = 2, Canal = "Kiosque"
4. Client = "Marie Dubois"
5. Cliquer "Enregistrer la Vente"
6. ✅ Vente enregistrée, stock décrémenté

### Test 4 : Consulter l'Historique Client
1. Aller sur http://localhost:3001
2. Onglet "Clients"
3. Cliquer sur l'icône "🕐" à côté de "Marie Dubois"
4. Observer l'historique des achats

---

## 📊 Vue d'Ensemble

### Module GESTION STOCKS (Port 3000)
**Fonctionnalités :**
- 📦 Gestion des produits
- 📊 Suivi des stocks
- ➡️ Mouvements de stock
- 💰 Enregistrement des ventes
- 📈 Tableau de bord

### Module CRM (Port 3001)
**Fonctionnalités :**
- 👥 Gestion des clients
- 📜 Historique d'achats
- 🔒 Conformité RGPD
- 📊 Statistiques clients

---

## 📚 Documentation Complète

- [README.md](README.md) - Vue d'ensemble du projet
- [CRM/README.md](CRM/README.md) - Documentation du module CRM
- [CRM/GUIDE_IMPLEMENTATION.md](CRM/GUIDE_IMPLEMENTATION.md) - Guide technique
- [CRM/SYNTHESE_MODULE_CRM.md](CRM/SYNTHESE_MODULE_CRM.md) - Synthèse du CRM

---

## ⚠️ Points Importants

### Les Deux Serveurs Doivent Être Lancés
Pour une intégration complète, lancez **simultanément** :
- GESTION STOCKS sur le port 3000
- CRM sur le port 3001

### Données de Test Pré-chargées
Au premier lancement :
- 8 produits créés automatiquement
- 4 clients créés automatiquement
- Quelques mouvements de stock historiques

### Conformité RGPD
- Le consentement RGPD est **obligatoire** pour créer un client
- La suppression d'un client est **logique** (anonymisation)

---

## 🛑 Arrêter les Serveurs

Dans chaque terminal, appuyer sur **Ctrl+C**

---

## 🔧 En Cas de Problème

### Erreur "Port déjà utilisé"
Un autre programme utilise le port 3000 ou 3001.
**Solution** : Fermer l'application qui utilise le port ou modifier le port dans les fichiers `server.js`

### Module CRM non disponible
Si le module CRM n'est pas lancé, le module GESTION STOCKS fonctionne en mode dégradé :
- Les ventes sont enregistrées en mode "anonyme"
- Le champ "Client" affiche seulement "Client anonyme"

### Base de données introuvable
La base de données est créée automatiquement au premier lancement.
**Emplacement** : `GESTION STOCKS/backend/database/verger.db`

---

## 🎓 Apprendre et Explorer

### Modifier le Code
- Les fichiers frontend sont dans `frontend/`
- Les routes API sont dans `backend/routes/`
- Le schéma de base de données est dans `backend/database/db.js`

### Ajouter des Données
- Utilisez les interfaces web pour ajouter des produits et des clients
- Les données sont persistées dans SQLite

### Explorer l'API
- API GESTION STOCKS : http://localhost:3000/api/
- API CRM : http://localhost:3001/api/

**Exemples de requêtes** :
- GET http://localhost:3000/api/produits
- GET http://localhost:3001/api/clients
- GET http://localhost:3001/api/clients/1/historique

---

## ✅ Checklist de Démarrage

- [ ] Node.js installé
- [ ] Dépendances installées (npm install dans les 2 modules)
- [ ] Terminal 1 lancé (GESTION STOCKS sur port 3000)
- [ ] Terminal 2 lancé (CRM sur port 3001)
- [ ] Interface GESTION STOCKS accessible (http://localhost:3000)
- [ ] Interface CRM accessible (http://localhost:3001)
- [ ] Test de vente avec client effectué
- [ ] Historique client consulté

---

## 🎉 Vous êtes Prêt !

Le système est maintenant opérationnel. Profitez de l'exploration !

Pour aller plus loin, consultez la documentation complète dans [README.md](README.md).

---

**Le Verger du Coin** - Guide de Démarrage Rapide
