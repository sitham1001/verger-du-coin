/**
 * Serveur Express pour l'application Le Verger du Coin
 * Point d'entrée principal de l'API REST
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase, insertSampleData } = require('./database/db');

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Permet les requêtes cross-origin
app.use(express.json()); // Parse le JSON des requêtes
app.use(express.static(path.join(__dirname, '../frontend'))); // Sert les fichiers statiques

// Initialisation de la base de données
initDatabase();
insertSampleData();

// Routes API
app.use('/api/produits', require('./routes/produits'));
app.use('/api/mouvements', require('./routes/mouvements'));
app.use('/api/ventes', require('./routes/ventes'));

// Route racine - redirige vers l'interface web
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Le Verger du Coin - API en ligne' });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   LE VERGER DU COIN - Système d\'Info  ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`\nServeur démarré sur http://localhost:${PORT}`);
  console.log(`Interface web : http://localhost:${PORT}`);
  console.log(`API : http://localhost:${PORT}/api/\n`);
});
