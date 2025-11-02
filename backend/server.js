const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Load .env file explicitly from backend directory
require('dotenv').config({ path: path.join(__dirname, '.env') });

const battleRoutes = require('./routes/battle');
const playerRoutes = require('./routes/player');
const hashmonRoutes = require('./routes/hashmon');
const blockchainRoutes = require('./routes/blockchain');
const gameRoutes = require('./routes/game');
const nftRoutes = require('./routes/nft');

const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:5001',
  'http://localhost:5002',
  'http://localhost:5003',
  'http://localhost:5004',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000',
  'http://127.0.0.1:5001',
  'http://127.0.0.1:5002',
  'http://127.0.0.1:5003',
  'http://127.0.0.1:5004',
  'http://127.0.0.1:5173'
];

const envOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set([...defaultAllowedOrigins, ...envOrigins]);

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.API_RATE_LIMIT || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
// In Vercel, allow the frontend URL from environment variable
const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
const frontendUrl = process.env.FRONTEND_URL || vercelUrl;

if (frontendUrl) {
  allowedOrigins.add(frontendUrl);
  // Also add without trailing slash
  if (frontendUrl.endsWith('/')) {
    allowedOrigins.add(frontendUrl.slice(0, -1));
  } else {
    allowedOrigins.add(`${frontendUrl}/`);
  }
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (
      allowedOrigins.has(origin) ||
      /^http:\/\/localhost:\d+$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1:\d+$/.test(origin) ||
      /^https:\/\/.*\.vercel\.app$/.test(origin) ||
      process.env.VERCEL === '1' // Allow all origins in Vercel production
    ) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    network: process.env.NODE_ENV === 'production' ? 'pharos' : 'pharos-testnet'
  });
});

// API routes
app.use('/api/battle', battleRoutes);
app.use('/api/player', playerRoutes);
app.use('/api/hashmon', hashmonRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/nft', nftRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request entity too large' });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Only start server if not in Vercel serverless environment
if (process.env.VERCEL !== '1') {
  // Start server for local development
  app.listen(PORT, () => {
    console.log(`🚀 HashMon Backend Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🎮 API endpoints: http://localhost:${PORT}/api/`);
    }
  });
}

module.exports = app;

