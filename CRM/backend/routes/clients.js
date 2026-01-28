/**
 * Routes API pour la gestion des clients - Module CRM
 */

const express = require('express');
const router = express.Router();
const { db } = require('../database/db');

/**
 * GET /api/clients
 * Récupère la liste de tous les clients actifs
 */
router.get('/', (req, res) => {
  try {
    const clients = db.prepare(`
      SELECT id, nom, email, telephone, consentement_rgpd, actif, date_creation
      FROM clients
      WHERE actif = 1
      ORDER BY nom ASC
    `).all();

    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/clients/:id
 * Récupère les détails d'un client spécifique
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const client = db.prepare(`
      SELECT id, nom, email, telephone, consentement_rgpd, actif, date_creation, date_modification
      FROM clients
      WHERE id = ?
    `).get(id);

    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/clients/:id/historique
 * Récupère l'historique des achats d'un client
 */
router.get('/:id/historique', (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que le client existe
    const client = db.prepare('SELECT id, nom FROM clients WHERE id = ?').get(id);
    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    // Récupérer l'historique des ventes du client
    const ventes = db.prepare(`
      SELECT
        v.id,
        v.produit_id,
        p.nom as produit_nom,
        p.categorie,
        p.unite,
        v.quantite,
        v.canal_vente,
        v.date_vente
      FROM ventes v
      JOIN produits p ON v.produit_id = p.id
      WHERE v.client_id = ?
      ORDER BY v.date_vente DESC
    `).all(id);

    // Calculer quelques statistiques
    const stats = {
      nombre_achats: ventes.length,
      produits_achetes: [...new Set(ventes.map(v => v.produit_nom))].length,
      canaux_utilises: [...new Set(ventes.map(v => v.canal_vente))]
    };

    res.json({
      client: client,
      statistiques: stats,
      historique: ventes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/clients
 * Crée un nouveau client
 */
router.post('/', (req, res) => {
  try {
    const { nom, email, telephone, consentement_rgpd } = req.body;

    // Validation des données obligatoires
    if (!nom || nom.trim().length === 0) {
      return res.status(400).json({ error: 'Le nom du client est obligatoire' });
    }

    if (consentement_rgpd === undefined || consentement_rgpd === null) {
      return res.status(400).json({ error: 'Le consentement RGPD est obligatoire' });
    }

    // Le consentement doit être explicitement accordé (1 = true)
    if (consentement_rgpd !== 1 && consentement_rgpd !== true) {
      return res.status(400).json({
        error: 'Le client doit consentir au traitement de ses données personnelles (RGPD)'
      });
    }

    // Validation des données optionnelles
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Format d\'email invalide' });
    }

    if (telephone && !/^[\d\s\+\-\(\)]+$/.test(telephone)) {
      return res.status(400).json({ error: 'Format de téléphone invalide' });
    }

    // Vérifier que le client n'existe pas déjà
    const clientExistant = db.prepare(
      'SELECT id FROM clients WHERE nom = ? AND actif = 1'
    ).get(nom.trim());

    if (clientExistant) {
      return res.status(409).json({ error: 'Un client avec ce nom existe déjà' });
    }

    // Insertion du nouveau client
    const result = db.prepare(`
      INSERT INTO clients (nom, email, telephone, consentement_rgpd)
      VALUES (?, ?, ?, ?)
    `).run(nom.trim(), email || null, telephone || null, 1);

    res.status(201).json({
      message: 'Client créé avec succès',
      client_id: result.lastInsertRowid
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/clients/:id
 * Met à jour les informations d'un client
 */
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { nom, email, telephone } = req.body;

    // Vérifier que le client existe
    const client = db.prepare('SELECT id FROM clients WHERE id = ? AND actif = 1').get(id);
    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    // Validation
    if (nom && nom.trim().length === 0) {
      return res.status(400).json({ error: 'Le nom ne peut pas être vide' });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Format d\'email invalide' });
    }

    if (telephone && !/^[\d\s\+\-\(\)]+$/.test(telephone)) {
      return res.status(400).json({ error: 'Format de téléphone invalide' });
    }

    // Mise à jour
    db.prepare(`
      UPDATE clients
      SET nom = COALESCE(?, nom),
          email = ?,
          telephone = ?,
          date_modification = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(nom?.trim(), email || null, telephone || null, id);

    res.json({ message: 'Client mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/clients/:id
 * Désactive un client (suppression logique pour conformité RGPD)
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que le client existe
    const client = db.prepare('SELECT id, nom FROM clients WHERE id = ?').get(id);
    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    // Transaction pour désactiver le client et mettre à jour les ventes
    const transaction = db.transaction(() => {
      // Désactivation du client (suppression logique)
      db.prepare(`
        UPDATE clients
        SET actif = 0,
            date_modification = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(id);

      // Mise à NULL du client_id dans les ventes (anonymisation)
      db.prepare(`
        UPDATE ventes
        SET client_id = NULL
        WHERE client_id = ?
      `).run(id);
    });

    transaction();

    res.json({
      message: 'Client désactivé avec succès (droit à l\'oubli)',
      ventes_anonymisees: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/clients/statistiques/globales
 * Récupère des statistiques globales sur les clients
 */
router.get('/statistiques/globales', (req, res) => {
  try {
    // Nombre total de clients actifs
    const nbClients = db.prepare('SELECT COUNT(*) as total FROM clients WHERE actif = 1').get();

    // Clients avec consentement RGPD
    const nbConsentement = db.prepare(
      'SELECT COUNT(*) as total FROM clients WHERE actif = 1 AND consentement_rgpd = 1'
    ).get();

    // Clients les plus actifs (avec au moins une vente)
    const clientsActifs = db.prepare(`
      SELECT
        c.id,
        c.nom,
        COUNT(v.id) as nombre_achats,
        SUM(v.quantite) as quantite_totale
      FROM clients c
      JOIN ventes v ON c.id = v.client_id
      WHERE c.actif = 1
      GROUP BY c.id
      ORDER BY nombre_achats DESC
      LIMIT 10
    `).all();

    res.json({
      nombre_clients_actifs: nbClients.total,
      nombre_avec_consentement: nbConsentement.total,
      clients_les_plus_actifs: clientsActifs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
