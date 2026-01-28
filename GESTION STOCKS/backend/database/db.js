/**
 * Module de gestion de la base de données SQLite
 * Contient la structure des tables et les fonctions d'initialisation
 */

const Database = require('better-sqlite3');
const path = require('path');

// Création/connexion à la base de données SQLite
const db = new Database(path.join(__dirname, 'verger.db'));

/**
 * Initialise la structure de la base de données
 * Crée les tables si elles n'existent pas déjà
 */
function initDatabase() {
  // Table PRODUITS
  // Stocke les informations sur chaque produit agricole
  db.exec(`
    CREATE TABLE IF NOT EXISTS produits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL UNIQUE,
      categorie TEXT NOT NULL CHECK(categorie IN ('fruit', 'legume', 'transforme')),
      unite TEXT NOT NULL CHECK(unite IN ('kg', 'piece')),
      stock_actuel REAL NOT NULL DEFAULT 0,
      seuil_alerte REAL DEFAULT 10,
      date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table MOUVEMENTS_STOCK
  // Enregistre tous les mouvements (entrées et sorties)
  db.exec(`
    CREATE TABLE IF NOT EXISTS mouvements_stock (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      produit_id INTEGER NOT NULL,
      type_mouvement TEXT NOT NULL CHECK(type_mouvement IN ('entree', 'sortie')),
      quantite REAL NOT NULL,
      source TEXT,
      date_mouvement DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (produit_id) REFERENCES produits(id)
    )
  `);

  // Table VENTES
  // Détaille les ventes effectuées
  db.exec(`
    CREATE TABLE IF NOT EXISTS ventes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      produit_id INTEGER NOT NULL,
      quantite REAL NOT NULL,
      canal_vente TEXT NOT NULL CHECK(canal_vente IN ('kiosque', 'marche')),
      date_vente DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (produit_id) REFERENCES produits(id)
    )
  `);

  console.log('Base de données initialisée avec succès');
}

/**
 * Insère des données de démonstration si la base est vide
 */
function insertSampleData() {
  const count = db.prepare('SELECT COUNT(*) as count FROM produits').get();

  if (count.count === 0) {
    console.log('Insertion de données de démonstration...');

    // Produits initiaux
    const produits = [
      { nom: 'Pommes Gala', categorie: 'fruit', unite: 'kg', stock: 150, seuil: 20 },
      { nom: 'Pommes Golden', categorie: 'fruit', unite: 'kg', stock: 120, seuil: 20 },
      { nom: 'Poires Williams', categorie: 'fruit', unite: 'kg', stock: 80, seuil: 15 },
      { nom: 'Carottes', categorie: 'legume', unite: 'kg', stock: 95, seuil: 25 },
      { nom: 'Salades', categorie: 'legume', unite: 'piece', stock: 45, seuil: 20 },
      { nom: 'Tomates', categorie: 'legume', unite: 'kg', stock: 60, seuil: 15 },
      { nom: 'Jus de pomme', categorie: 'transforme', unite: 'piece', stock: 8, seuil: 10 },
      { nom: 'Compote de pommes', categorie: 'transforme', unite: 'piece', stock: 25, seuil: 10 }
    ];

    const insertProduit = db.prepare(
      'INSERT INTO produits (nom, categorie, unite, stock_actuel, seuil_alerte) VALUES (?, ?, ?, ?, ?)'
    );

    for (const p of produits) {
      insertProduit.run(p.nom, p.categorie, p.unite, p.stock, p.seuil);
    }

    // Quelques mouvements historiques
    const insertMouvement = db.prepare(
      'INSERT INTO mouvements_stock (produit_id, type_mouvement, quantite, source) VALUES (?, ?, ?, ?)'
    );

    insertMouvement.run(1, 'entree', 150, 'Récolte du verger');
    insertMouvement.run(2, 'entree', 120, 'Récolte du verger');
    insertMouvement.run(7, 'entree', 30, 'Production interne');
    insertMouvement.run(1, 'sortie', 25, 'Vente marché');

    console.log('Données de démonstration insérées');
  }
}

module.exports = {
  db,
  initDatabase,
  insertSampleData
};
