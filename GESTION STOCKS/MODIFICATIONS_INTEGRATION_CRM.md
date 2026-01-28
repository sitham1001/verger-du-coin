# Modifications pour l'Intégration CRM

## 📝 Vue d'Ensemble

Ce document liste toutes les modifications apportées au module GESTION STOCKS pour permettre l'intégration avec le module CRM.

## 🔄 Fichiers Modifiés

### 1. frontend/index.html

**Ligne 145-153** - Ajout du champ de sélection de client dans le formulaire de vente

```html
<div class="col-md-12">
    <label class="form-label">Client <small class="text-muted">(optionnel)</small></label>
    <select class="form-select" id="venteClient">
        <option value="">Client anonyme</option>
    </select>
    <div class="form-text">
        <i class="bi bi-info-circle"></i> Sélectionnez un client pour associer cette vente à son historique
    </div>
</div>
```

**Comportement** :
- Nouveau champ "Client" dans le formulaire de vente
- Option par défaut : "Client anonyme"
- Liste déroulante peuplée dynamiquement via API CRM

---

### 2. frontend/app.js

#### Modification 1 : Configuration API (Ligne 6-7)

**Avant** :
```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

**Après** :
```javascript
const API_BASE_URL = 'http://localhost:3000/api';
const CRM_API_BASE_URL = 'http://localhost:3001/api';
```

**Raison** : Ajout de la configuration pour communiquer avec l'API CRM

---

#### Modification 2 : Fonction de chargement des clients (Ligne 117-144)

**Ajout** :
```javascript
// Charger les clients depuis le module CRM
async function loadClients() {
  try {
    const response = await fetch(`${CRM_API_BASE_URL}/clients`);
    const clients = await response.json();
    updateClientSelect(clients);
  } catch (error) {
    console.error('Erreur lors du chargement des clients:', error);
    // Ignorer l'erreur si le module CRM n'est pas disponible
  }
}

function updateClientSelect(clients) {
  const select = document.getElementById('venteClient');
  if (!select) return;

  select.innerHTML = '<option value="">Client anonyme</option>';

  // Ne lister que les clients avec consentement RGPD
  const clientsAvecConsentement = clients.filter(c => c.consentement_rgpd === 1);

  clientsAvecConsentement.forEach(client => {
    const option = document.createElement('option');
    option.value = client.id;
    option.textContent = client.nom;
    select.appendChild(option);
  });
}
```

**Comportement** :
- Récupère la liste des clients depuis le module CRM
- Filtre uniquement les clients avec consentement RGPD
- Peuple la liste déroulante du formulaire de vente
- Gère l'absence du module CRM (mode dégradé)

---

#### Modification 3 : Enregistrement d'une vente (Ligne 226-234)

**Avant** :
```javascript
const produit_id = parseInt(document.getElementById('venteProduit').value);
const quantite = parseFloat(document.getElementById('venteQuantite').value);
const canal_vente = document.getElementById('venteCanal').value;

try {
  const response = await fetch(`${API_BASE_URL}/ventes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ produit_id, quantite, canal_vente })
  });
```

**Après** :
```javascript
const produit_id = parseInt(document.getElementById('venteProduit').value);
const quantite = parseFloat(document.getElementById('venteQuantite').value);
const canal_vente = document.getElementById('venteCanal').value);
const client_id_str = document.getElementById('venteClient').value;
const client_id = client_id_str ? parseInt(client_id_str) : null;

try {
  const response = await fetch(`${API_BASE_URL}/ventes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ produit_id, quantite, canal_vente, client_id })
  });
```

**Changements** :
- Récupération de la valeur du champ `venteClient`
- Conversion en entier ou NULL si vente anonyme
- Ajout de `client_id` dans le corps de la requête

---

#### Modification 4 : Initialisation (Ligne 402)

**Avant** :
```javascript
document.addEventListener('DOMContentLoaded', () => {
  loadProduits();
  loadVentes();
  loadMouvements();
  loadDashboard();

  // ...
});
```

**Après** :
```javascript
document.addEventListener('DOMContentLoaded', () => {
  loadProduits();
  loadVentes();
  loadMouvements();
  loadDashboard();
  loadClients(); // Charger les clients du module CRM

  // ...
});
```

**Raison** : Chargement initial de la liste des clients au démarrage

---

### 3. backend/routes/ventes.js

#### Modification 1 : Réception du client_id (Ligne 37)

**Avant** :
```javascript
const { produit_id, quantite, canal_vente } = req.body;
```

**Après** :
```javascript
const { produit_id, quantite, canal_vente, client_id } = req.body;
```

**Raison** : Accepter le paramètre `client_id` optionnel

---

#### Modification 2 : Insertion de la vente (Ligne 63-66)

**Avant** :
```javascript
db.prepare(`
  INSERT INTO ventes (produit_id, quantite, canal_vente)
  VALUES (?, ?, ?)
`).run(produit_id, quantite, canal_vente);
```

**Après** :
```javascript
db.prepare(`
  INSERT INTO ventes (produit_id, quantite, canal_vente, client_id)
  VALUES (?, ?, ?, ?)
`).run(produit_id, quantite, canal_vente, client_id || null);
```

**Changements** :
- Ajout de la colonne `client_id` dans l'INSERT
- Valeur NULL si `client_id` non fourni (vente anonyme)

---

## 🗄️ Modifications de la Base de Données

### Schéma de la Table ventes

**Avant** :
```sql
CREATE TABLE ventes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  produit_id INTEGER NOT NULL,
  quantite REAL NOT NULL,
  canal_vente TEXT NOT NULL,
  date_vente DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (produit_id) REFERENCES produits(id)
)
```

**Après** :
```sql
CREATE TABLE ventes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  produit_id INTEGER NOT NULL,
  quantite REAL NOT NULL,
  canal_vente TEXT NOT NULL,
  client_id INTEGER,                    -- ← NOUVEAU
  date_vente DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (produit_id) REFERENCES produits(id),
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL  -- ← NOUVEAU
)
```

**Modification** :
- Ajout de la colonne `client_id` (nullable)
- Clé étrangère vers la table `clients`
- Contrainte `ON DELETE SET NULL` pour anonymisation RGPD

**Migration** :
Cette modification est effectuée automatiquement au premier démarrage du module CRM.
Aucune action manuelle requise.

---

## 📊 Comportement Fonctionnel

### Enregistrement d'une Vente

#### Cas 1 : Vente Anonyme (comportement par défaut)
```json
POST /api/ventes
{
  "produit_id": 1,
  "quantite": 2.5,
  "canal_vente": "kiosque",
  "client_id": null
}
```
- Champ "Client" laissé sur "Client anonyme"
- `client_id` = NULL dans la base

#### Cas 2 : Vente avec Client
```json
POST /api/ventes
{
  "produit_id": 1,
  "quantite": 2.5,
  "canal_vente": "kiosque",
  "client_id": 3
}
```
- Client sélectionné dans la liste
- `client_id` = 3 dans la base
- Vente visible dans l'historique du client

---

## 🔄 Rétrocompatibilité

### Mode Dégradé

Si le module CRM n'est pas démarré :

1. **Chargement des clients**
   - La fonction `loadClients()` échoue silencieusement
   - Le select affiche uniquement "Client anonyme"
   - Message d'erreur dans la console (pas d'impact utilisateur)

2. **Enregistrement des ventes**
   - Fonctionne normalement en mode anonyme
   - `client_id` = NULL systématiquement

3. **Fonctionnalités non affectées**
   - Gestion des produits : ✅
   - Gestion des stocks : ✅
   - Enregistrement des ventes : ✅
   - Tableaux de bord : ✅

**Le module GESTION STOCKS reste pleinement fonctionnel sans le CRM.**

---

## ✅ Validation des Modifications

### Tests à Effectuer

#### Test 1 : Vente Anonyme
1. Module CRM non démarré
2. Enregistrer une vente
3. Vérifier que ça fonctionne normalement

#### Test 2 : Vente avec Client (CRM démarré)
1. Démarrer les deux modules
2. Vérifier la présence de clients dans la liste
3. Sélectionner un client
4. Enregistrer la vente
5. Vérifier dans le CRM que la vente apparaît dans l'historique

#### Test 3 : Suppression Client (RGPD)
1. Supprimer un client depuis le CRM
2. Vérifier que ses ventes restent visibles dans GESTION STOCKS
3. Vérifier que le client n'apparaît plus dans le select

---

## 🔒 Sécurité et Cohérence

### Validation Côté Serveur

Le backend valide toujours les données :
```javascript
// Validation produit_id, quantite, canal_vente (inchangé)
if (!produit_id || !quantite || quantite <= 0 || !canal_vente) {
  return res.status(400).json({ error: 'Données invalides' });
}

// client_id est optionnel, pas de validation
// NULL est accepté (vente anonyme)
```

### Intégrité Référentielle

```sql
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
```

**Comportement** :
- Si le client existe, la FK fonctionne normalement
- Si le client est supprimé, `client_id` devient NULL automatiquement
- Pas d'erreur, pas de blocage

---

## 📝 Résumé des Changements

| Fichier | Type | Description |
|---------|------|-------------|
| `frontend/index.html` | Ajout | Champ de sélection client dans formulaire vente |
| `frontend/app.js` | Ajout | Configuration API CRM |
| `frontend/app.js` | Ajout | Fonction `loadClients()` |
| `frontend/app.js` | Ajout | Fonction `updateClientSelect()` |
| `frontend/app.js` | Modification | Enregistrement vente avec `client_id` |
| `frontend/app.js` | Modification | Initialisation avec chargement clients |
| `backend/routes/ventes.js` | Modification | Réception `client_id` |
| `backend/routes/ventes.js` | Modification | Insertion vente avec `client_id` |
| Base de données | Modification | Ajout colonne `client_id` (auto) |

---

## 🎯 Impact Minimal

Les modifications ont été conçues pour :

✅ **Ne pas casser l'existant** - Rétrocompatibilité totale
✅ **Être optionnelles** - Le CRM est un ajout, pas une obligation
✅ **Être transparentes** - L'utilisateur peut ignorer le champ client
✅ **Être réversibles** - Possibilité de retirer le CRM facilement

---

## 🔄 Retour Arrière (si nécessaire)

Pour désactiver l'intégration CRM :

1. **Frontend** : Supprimer le bloc HTML du champ client dans `index.html`
2. **Frontend** : Supprimer les appels à `loadClients()` dans `app.js`
3. **Frontend** : Retirer `client_id` de l'enregistrement de vente
4. **Backend** : Retirer `client_id` de la requête d'insertion

La colonne `client_id` peut rester en base (sera NULL systématiquement).

---

## 📞 Support

Pour toute question sur ces modifications :
- Consultez le README du module CRM
- Référez-vous au GUIDE_IMPLEMENTATION.md du CRM
- Examinez le code commenté

---

**Modifications d'Intégration CRM** - Module GESTION STOCKS
Version 1.0.0 - Intégration Réussie ✅
