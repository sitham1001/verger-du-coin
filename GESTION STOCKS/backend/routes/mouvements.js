/**
 * Routes API pour la gestion des mouvements de stock
 */

const express = require('express');
const router = express.Router();
const { db } = require('../database/db');

/**
 * GET /api/mouvements
 * Récupère l'historique des mouvements
 */
router.get('/', (req, res) => {
  try {
    const mouvements = db.prepare(`
      SELECT m.id, m.produit_id, p.nom as produit_nom, m.type_mouvement,
             m.quantite, m.source, m.date_mouvement
      FROM mouvements_stock m
      JOIN produits p ON m.produit_id = p.id
      ORDER BY m.date_mouvement DESC
      LIMIT 100
    `).all();

    res.json(mouvements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/mouvements/entree
 * Enregistre une entrée de stock (récolte, réception fournisseur)
 */
router.post('/entree', (req, res) => {
  try {
    const { produit_id, quantite, source } = req.body;

    if (!produit_id || !quantite || quantite <= 0) {
      return res.status(400).json({ error: 'Données invalides' });
    }

    // Transaction pour garantir la cohérence
    const transaction = db.transaction(() => {
      // Ajout du mouvement
      db.prepare(`
        INSERT INTO mouvements_stock (produit_id, type_mouvement, quantite, source)
        VALUES (?, 'entree', ?, ?)
      `).run(produit_id, quantite, source || 'Non spécifié');

      // Mise à jour du stock
      db.prepare(`
        UPDATE produits
        SET stock_actuel = stock_actuel + ?
        WHERE id = ?
      `).run(quantite, produit_id);
    });

    transaction();

    res.status(201).json({ message: 'Entrée de stock enregistrée' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/mouvements/sortie
 * Enregistre une sortie de stock (autre que vente)
 */
router.post('/sortie', (req, res) => {
  try {
    const { produit_id, quantite, source } = req.body;

    if (!produit_id || !quantite || quantite <= 0) {
      return res.status(400).json({ error: 'Données invalides' });
    }

    // Vérification du stock disponible
    const produit = db.prepare('SELECT stock_actuel FROM produits WHERE id = ?').get(produit_id);

    if (!produit) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    if (produit.stock_actuel < quantite) {
      return res.status(400).json({ error: 'Stock insuffisant' });
    }

    // Transaction
    const transaction = db.transaction(() => {
      db.prepare(`
        INSERT INTO mouvements_stock (produit_id, type_mouvement, quantite, source)
        VALUES (?, 'sortie', ?, ?)
      `).run(produit_id, quantite, source || 'Non spécifié');

      db.prepare(`
        UPDATE produits
        SET stock_actuel = stock_actuel - ?
        WHERE id = ?
      `).run(quantite, produit_id);
    });

    transaction();

    res.status(201).json({ message: 'Sortie de stock enregistrée' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
