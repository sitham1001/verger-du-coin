/**
 * Routes API pour la gestion des produits
 */

const express = require('express');
const router = express.Router();
const { db } = require('../database/db');

/**
 * GET /api/produits
 * Récupère la liste complète des produits avec leur stock
 */
router.get('/', (req, res) => {
  try {
    const produits = db.prepare(`
      SELECT id, nom, categorie, unite, stock_actuel, seuil_alerte,
             CASE WHEN stock_actuel < seuil_alerte THEN 1 ELSE 0 END as alerte_stock
      FROM produits
      ORDER BY nom
    `).all();

    res.json(produits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/produits/:id
 * Récupère un produit spécifique
 */
router.get('/:id', (req, res) => {
  try {
    const produit = db.prepare('SELECT * FROM produits WHERE id = ?').get(req.params.id);

    if (!produit) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    res.json(produit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/produits
 * Crée un nouveau produit
 */
router.post('/', (req, res) => {
  try {
    const { nom, categorie, unite, stock_actuel, seuil_alerte } = req.body;

    if (!nom || !categorie || !unite) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }

    const result = db.prepare(`
      INSERT INTO produits (nom, categorie, unite, stock_actuel, seuil_alerte)
      VALUES (?, ?, ?, ?, ?)
    `).run(nom, categorie, unite, stock_actuel || 0, seuil_alerte || 10);

    res.status(201).json({ id: result.lastInsertRowid, message: 'Produit créé' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/produits/:id
 * Met à jour un produit existant
 */
router.put('/:id', (req, res) => {
  try {
    const { nom, categorie, unite, seuil_alerte } = req.body;

    const result = db.prepare(`
      UPDATE produits
      SET nom = ?, categorie = ?, unite = ?, seuil_alerte = ?
      WHERE id = ?
    `).run(nom, categorie, unite, seuil_alerte, req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    res.json({ message: 'Produit mis à jour' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/produits/:id
 * Supprime un produit
 */
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM produits WHERE id = ?').run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    res.json({ message: 'Produit supprimé' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
