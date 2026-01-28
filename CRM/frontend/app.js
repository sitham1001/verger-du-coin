/**
 * Application JavaScript pour le module CRM - Le Verger du Coin
 */

// Configuration de l'API
const API_BASE_URL = 'http://localhost:3001/api';

// Variables globales
let clientsData = [];
let statistiquesData = null;

/**
 * Initialisation de l'application au chargement de la page
 */
document.addEventListener('DOMContentLoaded', () => {
  // Charger les données initiales
  chargerClients();
  chargerStatistiques();

  // Attacher les événements
  document.getElementById('nouveauClientForm').addEventListener('submit', handleNouveauClient);
  document.getElementById('btnNewClient').addEventListener('click', () => {
    const tab = new bootstrap.Tab(document.getElementById('nouveau-client-tab'));
    tab.show();
  });
  document.getElementById('saveModifierClient').addEventListener('click', handleModifierClient);

  // Rafraîchir les données toutes les 30 secondes
  setInterval(() => {
    chargerClients();
    chargerStatistiques();
  }, 30000);
});

/**
 * Charge la liste des clients depuis l'API
 */
async function chargerClients() {
  try {
    const response = await fetch(`${API_BASE_URL}/clients`);
    if (!response.ok) throw new Error('Erreur lors du chargement des clients');

    clientsData = await response.json();
    afficherClients();
  } catch (error) {
    console.error('Erreur:', error);
    afficherAlerte('Erreur lors du chargement des clients', 'danger');
  }
}

/**
 * Affiche la liste des clients dans le tableau
 */
function afficherClients() {
  const tbody = document.getElementById('clientsTableBody');

  if (clientsData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">Aucun client enregistré</td></tr>';
    return;
  }

  tbody.innerHTML = clientsData.map(client => `
    <tr>
      <td><strong>${escapeHtml(client.nom)}</strong></td>
      <td>${client.email ? escapeHtml(client.email) : '<em class="text-muted">Non renseigné</em>'}</td>
      <td>${client.telephone ? escapeHtml(client.telephone) : '<em class="text-muted">Non renseigné</em>'}</td>
      <td>
        ${client.consentement_rgpd ?
          '<span class="badge bg-success"><i class="bi bi-check-circle"></i> Oui</span>' :
          '<span class="badge bg-danger"><i class="bi bi-x-circle"></i> Non</span>'}
      </td>
      <td>${formatDate(client.date_creation)}</td>
      <td>
        <button class="btn btn-sm btn-info" onclick="afficherDetailsClient(${client.id})" title="Voir l'historique">
          <i class="bi bi-clock-history"></i>
        </button>
        <button class="btn btn-sm btn-warning" onclick="ouvrirModifierClient(${client.id})" title="Modifier">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="confirmerSuppressionClient(${client.id}, '${escapeHtml(client.nom)}')" title="Supprimer">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

/**
 * Charge les statistiques depuis l'API
 */
async function chargerStatistiques() {
  try {
    const response = await fetch(`${API_BASE_URL}/clients/statistiques/globales`);
    if (!response.ok) throw new Error('Erreur lors du chargement des statistiques');

    statistiquesData = await response.json();
    afficherStatistiques();
  } catch (error) {
    console.error('Erreur:', error);
  }
}

/**
 * Affiche les statistiques dans l'interface
 */
function afficherStatistiques() {
  if (!statistiquesData) return;

  // Statistiques dans les cartes en haut
  document.getElementById('totalClients').textContent = statistiquesData.nombre_clients_actifs || 0;
  document.getElementById('clientsConsentement').textContent = statistiquesData.nombre_avec_consentement || 0;
  document.getElementById('clientsActifs').textContent = statistiquesData.clients_les_plus_actifs.length || 0;

  // Liste des clients les plus actifs
  const listeDiv = document.getElementById('clientsActifsList');

  if (statistiquesData.clients_les_plus_actifs.length === 0) {
    listeDiv.innerHTML = '<p class="text-muted">Aucune donnée d\'achat disponible</p>';
    return;
  }

  listeDiv.innerHTML = `
    <div class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>Client</th>
            <th>Nombre d'Achats</th>
            <th>Quantité Totale</th>
          </tr>
        </thead>
        <tbody>
          ${statistiquesData.clients_les_plus_actifs.map(client => `
            <tr>
              <td><strong>${escapeHtml(client.nom)}</strong></td>
              <td><span class="badge bg-primary">${client.nombre_achats}</span></td>
              <td>${client.quantite_totale.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Gère la soumission du formulaire de nouveau client
 */
async function handleNouveauClient(e) {
  e.preventDefault();

  const nom = document.getElementById('clientNom').value.trim();
  const email = document.getElementById('clientEmail').value.trim() || null;
  const telephone = document.getElementById('clientTelephone').value.trim() || null;
  const consentement_rgpd = document.getElementById('clientConsentementRGPD').checked ? 1 : 0;

  if (!consentement_rgpd) {
    afficherAlerte('Le consentement RGPD est obligatoire', 'warning');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom, email, telephone, consentement_rgpd })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de la création du client');
    }

    afficherAlerte('Client créé avec succès', 'success');
    document.getElementById('nouveauClientForm').reset();

    // Retourner à l'onglet clients et recharger les données
    const tab = new bootstrap.Tab(document.getElementById('clients-tab'));
    tab.show();
    chargerClients();
    chargerStatistiques();
  } catch (error) {
    console.error('Erreur:', error);
    afficherAlerte(error.message, 'danger');
  }
}

/**
 * Affiche les détails d'un client et son historique
 */
async function afficherDetailsClient(clientId) {
  const modal = new bootstrap.Modal(document.getElementById('detailsClientModal'));
  const content = document.getElementById('clientDetailsContent');

  modal.show();

  try {
    const response = await fetch(`${API_BASE_URL}/clients/${clientId}/historique`);
    if (!response.ok) throw new Error('Erreur lors du chargement des détails');

    const data = await response.json();

    content.innerHTML = `
      <div class="mb-4">
        <h5><i class="bi bi-person-circle"></i> ${escapeHtml(data.client.nom)}</h5>
      </div>

      <div class="row mb-4">
        <div class="col-md-4">
          <div class="stat-card">
            <div class="stat-value">${data.statistiques.nombre_achats}</div>
            <div class="stat-label">Achats</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="stat-card">
            <div class="stat-value">${data.statistiques.produits_achetes}</div>
            <div class="stat-label">Produits Différents</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="stat-card">
            <div class="stat-value">${data.statistiques.canaux_utilises.length}</div>
            <div class="stat-label">Canaux Utilisés</div>
          </div>
        </div>
      </div>

      <h6>Historique des Achats</h6>
      ${data.historique.length === 0 ?
        '<p class="text-muted">Aucun achat enregistré pour ce client</p>' :
        `<div class="table-responsive">
          <table class="table table-sm table-hover">
            <thead>
              <tr>
                <th>Date</th>
                <th>Produit</th>
                <th>Catégorie</th>
                <th>Quantité</th>
                <th>Canal</th>
              </tr>
            </thead>
            <tbody>
              ${data.historique.map(vente => `
                <tr>
                  <td>${formatDate(vente.date_vente)}</td>
                  <td>${escapeHtml(vente.produit_nom)}</td>
                  <td><span class="badge bg-secondary">${escapeHtml(vente.categorie)}</span></td>
                  <td>${vente.quantite} ${escapeHtml(vente.unite)}</td>
                  <td><span class="badge bg-info">${escapeHtml(vente.canal_vente)}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>`
      }
    `;
  } catch (error) {
    console.error('Erreur:', error);
    content.innerHTML = '<div class="alert alert-danger">Erreur lors du chargement des détails</div>';
  }
}

/**
 * Ouvre le modal de modification d'un client
 */
function ouvrirModifierClient(clientId) {
  const client = clientsData.find(c => c.id === clientId);
  if (!client) return;

  document.getElementById('editClientId').value = client.id;
  document.getElementById('editClientNom').value = client.nom;
  document.getElementById('editClientEmail').value = client.email || '';
  document.getElementById('editClientTelephone').value = client.telephone || '';

  const modal = new bootstrap.Modal(document.getElementById('modifierClientModal'));
  modal.show();
}

/**
 * Gère la modification d'un client
 */
async function handleModifierClient() {
  const clientId = document.getElementById('editClientId').value;
  const nom = document.getElementById('editClientNom').value.trim();
  const email = document.getElementById('editClientEmail').value.trim() || null;
  const telephone = document.getElementById('editClientTelephone').value.trim() || null;

  try {
    const response = await fetch(`${API_BASE_URL}/clients/${clientId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom, email, telephone })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de la modification');
    }

    afficherAlerte('Client modifié avec succès', 'success');
    bootstrap.Modal.getInstance(document.getElementById('modifierClientModal')).hide();
    chargerClients();
  } catch (error) {
    console.error('Erreur:', error);
    afficherAlerte(error.message, 'danger');
  }
}

/**
 * Confirme et supprime un client
 */
async function confirmerSuppressionClient(clientId, clientNom) {
  if (!confirm(`Êtes-vous sûr de vouloir désactiver le client "${clientNom}" ?\n\nCette action :\n- Désactive le client (droit à l'oubli RGPD)\n- Anonymise ses ventes passées\n- Ne peut pas être annulée`)) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/clients/${clientId}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de la suppression');
    }

    afficherAlerte('Client désactivé avec succès (RGPD)', 'success');
    chargerClients();
    chargerStatistiques();
  } catch (error) {
    console.error('Erreur:', error);
    afficherAlerte(error.message, 'danger');
  }
}

/**
 * Affiche une alerte à l'utilisateur
 */
function afficherAlerte(message, type) {
  const container = document.getElementById('alertContainer');
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} alert-dismissible fade show`;
  alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  container.appendChild(alert);

  setTimeout(() => {
    alert.remove();
  }, 5000);
}

/**
 * Formate une date au format français
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Échappe les caractères HTML pour éviter les injections XSS
 */
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
