/**
 * Application JavaScript pour Le Verger du Coin
 * Gère les interactions avec l'API et la mise à jour de l'interface
 */

const API_BASE_URL = 'http://localhost:3000/api';
const CRM_API_BASE_URL = 'http://localhost:3001/api';

// Fonction utilitaire pour afficher des alertes
function showAlert(message, type = 'success') {
  const alertContainer = document.getElementById('alertContainer');
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} alert-dismissible fade show`;
  alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  alertContainer.appendChild(alert);

  setTimeout(() => {
    alert.remove();
  }, 5000);
}

// Fonction utilitaire pour formater les dates
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ========================================
// GESTION DES PRODUITS
// ========================================

async function loadProduits() {
  try {
    const response = await fetch(`${API_BASE_URL}/produits`);
    const produits = await response.json();

    const tbody = document.getElementById('produitsTableBody');
    tbody.innerHTML = '';

    if (produits.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">Aucun produit</td></tr>';
      return;
    }

    produits.forEach(produit => {
      const row = document.createElement('tr');
      if (produit.alerte_stock) {
        row.classList.add('stock-alerte');
      }

      const categorieClass = `badge-${produit.categorie}`;
      const stockBadge = produit.alerte_stock
        ? '<span class="badge badge-alerte"><i class="bi bi-exclamation-triangle"></i> Stock Faible</span>'
        : '<span class="badge badge-ok"><i class="bi bi-check-circle"></i> OK</span>';

      row.innerHTML = `
        <td><strong>${produit.nom}</strong></td>
        <td><span class="badge ${categorieClass}">${produit.categorie}</span></td>
        <td><strong>${produit.stock_actuel}</strong></td>
        <td>${produit.unite}</td>
        <td>${produit.seuil_alerte}</td>
        <td>${stockBadge}</td>
        <td>
          <button class="btn btn-sm btn-success" onclick="openEntreeModal(${produit.id})">
            <i class="bi bi-plus"></i>
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });

    // Mettre à jour les statistiques
    updateStats(produits);

    // Mettre à jour les selects de produits
    updateProductSelects(produits);
  } catch (error) {
    console.error('Erreur lors du chargement des produits:', error);
    showAlert('Erreur lors du chargement des produits', 'danger');
  }
}

function updateStats(produits) {
  const totalProduits = produits.length;
  const produitsAlerte = produits.filter(p => p.alerte_stock).length;

  document.getElementById('totalProduits').textContent = totalProduits;
  document.getElementById('produitsAlerte').textContent = produitsAlerte;
}

function updateProductSelects(produits) {
  const selects = [
    document.getElementById('venteProduit'),
    document.getElementById('entreeProduit')
  ];

  selects.forEach(select => {
    select.innerHTML = '<option value="">Sélectionner un produit...</option>';
    produits.forEach(produit => {
      const option = document.createElement('option');
      option.value = produit.id;
      option.textContent = `${produit.nom} (Stock: ${produit.stock_actuel} ${produit.unite})`;
      select.appendChild(option);
    });
  });
}

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

// Ajout d'un nouveau produit
document.getElementById('saveNewProduct').addEventListener('click', async () => {
  const nom = document.getElementById('newProductNom').value;
  const categorie = document.getElementById('newProductCategorie').value;
  const unite = document.getElementById('newProductUnite').value;
  const stock_actuel = parseFloat(document.getElementById('newProductStock').value);
  const seuil_alerte = parseFloat(document.getElementById('newProductSeuil').value);

  try {
    const response = await fetch(`${API_BASE_URL}/produits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom, categorie, unite, stock_actuel, seuil_alerte })
    });

    if (response.ok) {
      showAlert('Produit créé avec succès', 'success');
      document.getElementById('addProductForm').reset();
      bootstrap.Modal.getInstance(document.getElementById('addProductModal')).hide();
      loadProduits();
    } else {
      const error = await response.json();
      showAlert(error.error || 'Erreur lors de la création', 'danger');
    }
  } catch (error) {
    console.error('Erreur:', error);
    showAlert('Erreur lors de la création du produit', 'danger');
  }
});

// ========================================
// GESTION DES VENTES
// ========================================

async function loadVentes() {
  try {
    const response = await fetch(`${API_BASE_URL}/ventes`);
    const ventes = await response.json();

    const tbody = document.getElementById('ventesTableBody');
    tbody.innerHTML = '';

    if (ventes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center">Aucune vente enregistrée</td></tr>';
      document.getElementById('totalVentes').textContent = '0';
      return;
    }

    let totalQuantite = 0;

    ventes.forEach(vente => {
      totalQuantite += vente.quantite;

      const canalBadge = vente.canal_vente === 'kiosque'
        ? '<span class="badge bg-primary">Kiosque</span>'
        : '<span class="badge bg-info">Marché</span>';

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${formatDate(vente.date_vente)}</td>
        <td>${vente.produit_nom}</td>
        <td><strong>${vente.quantite}</strong></td>
        <td>${canalBadge}</td>
      `;
      tbody.appendChild(row);
    });

    document.getElementById('totalVentes').textContent = ventes.length;
  } catch (error) {
    console.error('Erreur lors du chargement des ventes:', error);
    showAlert('Erreur lors du chargement des ventes', 'danger');
  }
}

// Enregistrement d'une vente
document.getElementById('venteForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const produit_id = parseInt(document.getElementById('venteProduit').value);
  const quantite = parseFloat(document.getElementById('venteQuantite').value);
  const canal_vente = document.getElementById('venteCanal').value;
  const client_id_str = document.getElementById('venteClient').value;
  const client_id = client_id_str ? parseInt(client_id_str) : null;

  try {
    const response = await fetch(`${API_BASE_URL}/ventes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ produit_id, quantite, canal_vente, client_id })
    });

    const data = await response.json();

    if (response.ok) {
      showAlert('Vente enregistrée avec succès', 'success');
      document.getElementById('venteForm').reset();
      loadVentes();
      loadProduits();
      loadMouvements();
    } else {
      showAlert(data.error || 'Erreur lors de l\'enregistrement', 'danger');
    }
  } catch (error) {
    console.error('Erreur:', error);
    showAlert('Erreur lors de l\'enregistrement de la vente', 'danger');
  }
});

// ========================================
// GESTION DES MOUVEMENTS
// ========================================

async function loadMouvements() {
  try {
    const response = await fetch(`${API_BASE_URL}/mouvements`);
    const mouvements = await response.json();

    const tbody = document.getElementById('mouvementsTableBody');
    tbody.innerHTML = '';

    if (mouvements.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center">Aucun mouvement</td></tr>';
      document.getElementById('totalMouvements').textContent = '0';
      return;
    }

    mouvements.forEach(mouvement => {
      const typeBadge = mouvement.type_mouvement === 'entree'
        ? '<span class="badge bg-success"><i class="bi bi-arrow-down"></i> Entrée</span>'
        : '<span class="badge bg-danger"><i class="bi bi-arrow-up"></i> Sortie</span>';

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${formatDate(mouvement.date_mouvement)}</td>
        <td>${mouvement.produit_nom}</td>
        <td>${typeBadge}</td>
        <td><strong>${mouvement.quantite}</strong></td>
        <td>${mouvement.source || '-'}</td>
      `;
      tbody.appendChild(row);
    });

    document.getElementById('totalMouvements').textContent = mouvements.length;
  } catch (error) {
    console.error('Erreur lors du chargement des mouvements:', error);
    showAlert('Erreur lors du chargement des mouvements', 'danger');
  }
}

// Enregistrement d'une entrée de stock
document.getElementById('entreeForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const produit_id = parseInt(document.getElementById('entreeProduit').value);
  const quantite = parseFloat(document.getElementById('entreeQuantite').value);
  const source = document.getElementById('entreeSource').value;

  try {
    const response = await fetch(`${API_BASE_URL}/mouvements/entree`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ produit_id, quantite, source })
    });

    if (response.ok) {
      showAlert('Entrée de stock enregistrée', 'success');
      document.getElementById('entreeForm').reset();
      loadMouvements();
      loadProduits();
    } else {
      const error = await response.json();
      showAlert(error.error || 'Erreur lors de l\'enregistrement', 'danger');
    }
  } catch (error) {
    console.error('Erreur:', error);
    showAlert('Erreur lors de l\'enregistrement de l\'entrée', 'danger');
  }
});

// ========================================
// TABLEAU DE BORD
// ========================================

async function loadDashboard() {
  try {
    const response = await fetch(`${API_BASE_URL}/ventes/statistiques`);
    const stats = await response.json();

    // Produits les plus vendus
    const topProduitsDiv = document.getElementById('topProduits');
    if (stats.produits_les_plus_vendus.length === 0) {
      topProduitsDiv.innerHTML = '<p class="text-muted">Aucune vente enregistrée</p>';
    } else {
      topProduitsDiv.innerHTML = '<ul class="list-group">';
      stats.produits_les_plus_vendus.forEach((p, index) => {
        topProduitsDiv.innerHTML += `
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <span><strong>${index + 1}.</strong> ${p.nom}</span>
            <span class="badge bg-primary rounded-pill">${p.total_vendu} ${p.unite}</span>
          </li>
        `;
      });
      topProduitsDiv.innerHTML += '</ul>';
    }

    // Ventes par canal
    const ventesCanal = document.getElementById('ventesCanal');
    if (stats.ventes_par_canal.length === 0) {
      ventesCanal.innerHTML = '<p class="text-muted">Aucune vente</p>';
    } else {
      ventesCanal.innerHTML = '<ul class="list-group">';
      stats.ventes_par_canal.forEach(c => {
        const icon = c.canal_vente === 'kiosque' ? 'shop' : 'cart';
        ventesCanal.innerHTML += `
          <li class="list-group-item d-flex justify-content-between">
            <span><i class="bi bi-${icon}"></i> ${c.canal_vente.charAt(0).toUpperCase() + c.canal_vente.slice(1)}</span>
            <span><strong>${c.nombre_ventes}</strong> ventes</span>
          </li>
        `;
      });
      ventesCanal.innerHTML += '</ul>';
    }

    // Stock par catégorie
    const stockCategorie = document.getElementById('stockCategorie');
    stockCategorie.innerHTML = '<div class="row">';
    stats.stock_par_categorie.forEach(c => {
      const icon = c.categorie === 'fruit' ? 'apple' : (c.categorie === 'legume' ? 'egg' : 'cup-straw');
      stockCategorie.innerHTML += `
        <div class="col-md-4">
          <div class="stat-card">
            <i class="bi bi-${icon}" style="font-size: 2rem; color: var(--primary-color);"></i>
            <div class="stat-value">${c.stock_total.toFixed(1)}</div>
            <div class="stat-label">${c.categorie} (${c.nb_produits} produits)</div>
          </div>
        </div>
      `;
    });
    stockCategorie.innerHTML += '</div>';

  } catch (error) {
    console.error('Erreur lors du chargement du dashboard:', error);
    showAlert('Erreur lors du chargement des statistiques', 'danger');
  }
}

// ========================================
// INITIALISATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  // Chargement initial
  loadProduits();
  loadVentes();
  loadMouvements();
  loadDashboard();
  loadClients(); // Charger les clients du module CRM

  // Rechargement automatique lors du changement d'onglet
  document.getElementById('dashboard-tab').addEventListener('click', loadDashboard);
  document.getElementById('ventes-tab').addEventListener('click', loadVentes);
  document.getElementById('mouvements-tab').addEventListener('click', loadMouvements);
});
