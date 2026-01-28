/**
 * Module de gestion de la base de données SQLite - Module CRM
 * Contient la structure des tables clients et les fonctions d'initialisation
 */

const Database = require('better-sqlite3');
const path = require('path');

// Connexion à la base de données SQLite existante du Verger
const db = new Database(path.join(__dirname, '../../..', 'GESTION STOCKS/backend/database/verger.db'));

/**
 * Initialise la structure CRM de la base de données
 * Crée les tables clients et modifie la table ventes si nécessaire
 */
function initCRMDatabase() {
  // Table CLIENTS
  // Stocke les informations des clients avec conformité RGPD
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      email TEXT,
      telephone TEXT,
      consentement_rgpd INTEGER NOT NULL DEFAULT 0 CHECK(consentement_rgpd IN (0, 1)),
      actif INTEGER NOT NULL DEFAULT 1 CHECK(actif IN (0, 1)),
      date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
      date_modification DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Vérifier si la colonne client_id existe dans la table ventes
  const colonnesVentes = db.prepare("PRAGMA table_info(ventes)").all();
  const clientIdExiste = colonnesVentes.some(col => col.name === 'client_id');

  if (!clientIdExiste) {
    // Ajouter la colonne client_id à la table ventes existante
    db.exec(`
      ALTER TABLE ventes
      ADD COLUMN client_id INTEGER
      REFERENCES clients(id) ON DELETE SET NULL
    `);
    console.log('Colonne client_id ajoutée à la table ventes');
  }

  console.log('Base de données CRM initialisée avec succès');
}

/**
 * Insère des clients de démonstration si la table est vide
 */
function insertSampleClientsData() {
  const count = db.prepare('SELECT COUNT(*) as count FROM clients').get();

  if (count.count === 0) {
    console.log('Insertion de clients de démonstration...');

    const clients = [
      { nom: 'Marie Dubois', email: 'marie.dubois@example.com', telephone: '0612345678', consentement: 1 },
      { nom: 'Jean Martin', email: 'jean.martin@example.com', telephone: '0623456789', consentement: 1 },
      { nom: 'Sophie Bernard', email: null, telephone: '0634567890', consentement: 1 },
      { nom: 'Pierre Durand', email: 'pierre.durand@example.com', telephone: null, consentement: 1 }
    ];

    const insertClient = db.prepare(
      'INSERT INTO clients (nom, email, telephone, consentement_rgpd) VALUES (?, ?, ?, ?)'
    );

    for (const c of clients) {
      insertClient.run(c.nom, c.email, c.telephone, c.consentement);
    }

    console.log('Clients de démonstration insérés');
  }
}

module.exports = {
  db,
  initCRMDatabase,
  insertSampleClientsData
};
