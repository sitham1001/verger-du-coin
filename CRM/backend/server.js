/**
 * Serveur Express pour le module CRM - Le Verger du Coin
 * Point d'entrée de l'API REST pour la gestion des clients
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { initCRMDatabase, insertSampleClientsData } = require('./database/db');

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors()); // Permet les requêtes cross-origin
app.use(express.json()); // Parse le JSON des requêtes
app.use(express.static(path.join(__dirname, '../frontend'))); // Sert les fichiers statiques

// Initialisation de la base de données CRM
initCRMDatabase();
insertSampleClientsData();

// Routes API
app.use('/api/clients', require('./routes/clients'));

// Route racine - redirige vers l'interface web CRM
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Le Verger du Coin - Module CRM en ligne' });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   LE VERGER DU COIN - Module CRM      ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`\nServeur CRM démarré sur http://localhost:${PORT}`);
  console.log(`Interface web : http://localhost:${PORT}`);
  console.log(`API : http://localhost:${PORT}/api/clients\n`);
});
