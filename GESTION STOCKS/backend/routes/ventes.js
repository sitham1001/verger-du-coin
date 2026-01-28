/**
 * Routes API pour la gestion des ventes
 */

const express = require('express');
const router = express.Router();
const { db } = require('../database/db');

/**
 * GET /api/ventes
 * Récupère l'historique des ventes
 */
router.get('/', (req, res) => {
  try {
    const ventes = db.prepare(`
      SELECT v.id, v.produit_id, p.nom as produit_nom, v.quantite,
             v.canal_vente, v.date_vente
      FROM ventes v
      JOIN produits p ON v.produit_id = p.id
      ORDER BY v.date_vente DESC
      LIMIT 100
    `).all();

    res.json(ventes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ventes
 * Enregistre une nouvelle vente
 * Décrémente automatiquement le stock et crée un mouvement de sortie
 */
router.post('/', (req, res) => {
  try {
    const { produit_id, quantite, canal_vente, client_id } = req.body;

    if (!produit_id || !quantite || quantite <= 0 || !canal_vente) {
      return res.status(400).json({ error: 'Données invalides' });
    }

    if (!['kiosque', 'marche'].includes(canal_vente)) {
      return res.status(400).json({ error: 'Canal de vente invalide' });
    }

    // Vérification du stock disponible
    const produit = db.prepare('SELECT nom, stock_actuel FROM produits WHERE id = ?').get(produit_id);

    if (!produit) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    if (produit.stock_actuel < quantite) {
      return res.status(400).json({
        error: `Stock insuffisant pour ${produit.nom}. Stock disponible: ${produit.stock_actuel}`
      });
    }

    // Transaction pour garantir la cohérence
    const transaction = db.transaction(() => {
      // Enregistrement de la vente avec client_id optionnel
      db.prepare(`
        INSERT INTO ventes (produit_id, quantite, canal_vente, client_id)
        VALUES (?, ?, ?, ?)
      `).run(produit_id, quantite, canal_vente, client_id || null);

      // Ajout du mouvement de sortie
      db.prepare(`
        INSERT INTO mouvements_stock (produit_id, type_mouvement, quantite, source)
        VALUES (?, 'sortie', ?, ?)
      `).run(produit_id, quantite, `Vente ${canal_vente}`);

      // Mise à jour du stock
      db.prepare(`
        UPDATE produits
        SET stock_actuel = stock_actuel - ?
        WHERE id = ?
      `).run(quantite, produit_id);
    });

    transaction();

    res.status(201).json({ message: 'Vente enregistrée avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ventes/statistiques
 * Récupère les statistiques de vente
 */
router.get('/statistiques', (req, res) => {
  try {
    // Produits les plus vendus
    const produitsVendus = db.prepare(`
      SELECT p.nom, SUM(v.quantite) as total_vendu, p.unite
      FROM ventes v
      JOIN produits p ON v.produit_id = p.id
      GROUP BY v.produit_id
      ORDER BY total_vendu DESC
      LIMIT 10
    `).all();

    // Ventes par canal
    const ventesParCanal = db.prepare(`
      SELECT canal_vente, COUNT(*) as nombre_ventes, SUM(quantite) as quantite_totale
      FROM ventes
      GROUP BY canal_vente
    `).all();

    // Stock total par catégorie
    const stockParCategorie = db.prepare(`
      SELECT categorie, SUM(stock_actuel) as stock_total, COUNT(*) as nb_produits
      FROM produits
      GROUP BY categorie
    `).all();

    res.json({
      produits_les_plus_vendus: produitsVendus,
      ventes_par_canal: ventesParCanal,
      stock_par_categorie: stockParCategorie
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
