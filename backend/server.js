require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Import routes
const domainsRoutes = require('./routes/domains');
const statsRoutes = require('./routes/stats');
const searchRoutes = require('./routes/search');

const app = express();

// ==================== MIDDLEWARE ====================

// Sécurité
app.use(helmet());

// CORS - MODIFIÉ POUR ACCEPTER LE DOMAINE DE PRODUCTION
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001',
    'https://opendata-pha.vercel.app' // Ajout de ton domaine Vercel
  ],
  credentials: true
}));

// Compression
app.use(compression());

// Logging (désactivé en production pour éviter les logs inutiles)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));

// ==================== RATE LIMITING ====================
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300,
  message: 'Trop de requêtes, veuillez réessayer plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// ==================== ROUTES ====================
app.use('/api/domains', domainsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/search', searchRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: '✅ API fonctionne !', 
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    uptime: process.uptime()
  });
});

// ==================== GESTION DES ERREURS ====================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// ==================== POUR VERCEL ====================
// On exporte l'app au lieu de faire app.listen
module.exports = app;

// Cette partie ne s'exécute PAS sur Vercel
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`\n🚀 API running on http://localhost:${PORT}`);
  });
}