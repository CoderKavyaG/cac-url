require('dotenv').config();

const express = require('express');
const cors = require('cors');
const passport = require('./config/passport');
const sequelize = require('./config/database');
const { Op } = require('sequelize');

// Import middleware
const { rateLimiters } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./utils/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const shortenRoutes = require('./routes/shorten');
const urlRoutes = require('./routes/urls');
const healthRoutes = require('./routes/health');
const redirectRoutes = require('./routes/redirect');

// Import models (to ensure they're loaded)
const Url = require('./models/Url');
const User = require('./models/User');

const app = express();

// ===========================================
// MIDDLEWARE SETUP
// ===========================================

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL, process.env.API_URL].filter(Boolean)
    : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Parse JSON bodies
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Apply general rate limiting
app.use(rateLimiters.general);

// Initialize Passport
app.use(passport.initialize());

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.url}`);
    next();
  });
}

// ===========================================
// ROUTES
// ===========================================

// Health check (no rate limit)
app.use('/health', healthRoutes);

// API routes
app.use('/auth', rateLimiters.auth, authRoutes);
app.use('/shorten', rateLimiters.shorten, shortenRoutes);
app.use('/urls', urlRoutes);

// Redirect routes (must be last due to catch-all nature)
app.use('/', redirectRoutes);

// ===========================================
// ERROR HANDLING
// ===========================================

// 404 handler for API routes
app.use('/api', notFoundHandler);

// Global error handler
app.use(errorHandler);

// ===========================================
// SCHEDULED TASKS
// ===========================================

/**
 * Clean up expired URLs every hour
 */
async function cleanupExpiredUrls() {
  try {
    const now = new Date();
    const deletedCount = await Url.destroy({
      where: {
        expiresAt: { [Op.lt]: now },
      },
    });

    if (deletedCount > 0) {
      console.log(`🗑️  Auto-deleted ${deletedCount} expired URL(s)`);
    }
  } catch (err) {
    console.error('Error cleaning up expired URLs:', err.message);
  }
}

// Run cleanup every hour
setInterval(cleanupExpiredUrls, 60 * 60 * 1000);

// ===========================================
// SERVER STARTUP
// ===========================================

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    // Sync database (create tables if they don't exist)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✓ Database synchronized');

    // Run initial cleanup
    await cleanupExpiredUrls();

    // Start server
    app.listen(PORT, () => {
      console.log('═══════════════════════════════════════════');
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ API URL: ${process.env.API_URL || `http://localhost:${PORT}`}`);
      console.log('═══════════════════════════════════════════');
    });
  } catch (err) {
    console.error('═══════════════════════════════════════════');
    console.error('✗ Failed to start server');
    console.error('Error:', err.message);
    console.error('═══════════════════════════════════════════');
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await sequelize.close();
  process.exit(0);
});

// Start server if run directly
if (require.main === module) {
  startServer();
}

// Export for Vercel
module.exports = app;
