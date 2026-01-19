require('dotenv').config({ path: '../.env' });

const express = require('express');
const cors = require('cors');
const transactionRoutes = require('./routes/transactions');

const { initIndexers } = require('./indexer');
const { initRedis } = require('./services/redis');

const app = express();
const PORT = process.env.PORT || 5000;

initRedis();
initIndexers().catch(err => {
  console.error("Failed to initialize indexers:", err);
});

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use('/api', transactionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'crypto-indexer-backend'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.path 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Crypto Indexer Backend Server');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🔐 API Key configured: ${process.env.ALCHEMY_API_KEY ? '✓' : '✗'}`);
  console.log(`⏰ Started at ${new Date().toISOString()}`);
});
