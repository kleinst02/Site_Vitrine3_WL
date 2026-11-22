/**
 * Point d'entrée de l'application Express.
 * Charge les variables d'environnement, configure les middlewares de sécurité
 * et monte les routes de l'API.
 */
'use strict';

// Chargement du .env situé à la racine du projet (deux niveaux au-dessus de /src/backend/)
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../..', '.env') });

const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');

const errorHandler = require('./middlewares/errorHandler');
const blogRoutes   = require('./routes/blog');

const app = express();

// ------------------------------------------------------------------
// 1. Middlewares de sécurité
// ------------------------------------------------------------------

// Helmet : headers HTTP sécurisés
app.use(helmet());

// CORS : origines autorisées configurables par variable d'environnement
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(cors({
  origin: corsOrigin.split(',').map((o) => o.trim()),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language', 'X-API-Key'],
  credentials: true,
}));

// Parsing JSON (limite taille pour éviter les abus)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Rate limit global : 100 requêtes par 15 minutes par IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 429,
      message: 'Trop de requêtes. Réessayez dans quelques instants.',
    },
  },
});
app.use(globalLimiter);

// ------------------------------------------------------------------
// 2. Route de santé (health check)
// ------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ------------------------------------------------------------------
// 3. Routes API (montage progressif au fil des tickets)
// ------------------------------------------------------------------
const contactRoutes = require('./routes/contact');

app.use('/api/contact',  contactRoutes);
app.use('/api/articles', blogRoutes);

// Routes profil et CV PDF (T-007)
// profileRoutes expose /api/profile et /api/cv via app.use('/api', ...)
const profileRoutes  = require('./routes/profile');

app.use('/api', profileRoutes);

// ------------------------------------------------------------------
// 4. Gestionnaire 404
// ------------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({
    error: { code: 404, message: 'Endpoint introuvable.' },
  });
});

// ------------------------------------------------------------------
// 5. Middleware de gestion d'erreurs centralisé (doit être en dernier)
// ------------------------------------------------------------------
app.use(errorHandler);

// ------------------------------------------------------------------
// 6. Démarrage du serveur
// ------------------------------------------------------------------
const PORT = parseInt(process.env.PORT || '3000', 10);

app.listen(PORT, () => {
  console.log(`[SERVER] API démarrée sur le port ${PORT} (env: ${process.env.NODE_ENV || 'development'})`);
});

module.exports = app; // export pour les tests d'intégration
