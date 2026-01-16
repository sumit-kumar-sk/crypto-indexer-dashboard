/**
 * Crypto Indexer Backend Server
 * 
 * This is the main entry point for the backend API server.
 * It acts as a secure proxy between the frontend and blockchain indexing services.
 * 
 * Security: API keys are loaded from .env and NEVER exposed to the frontend.
 */

// Load environment variables from .env file FIRST
require('dotenv').config({ path: '../.env' });

const express = require('express');
const cors = require('cors');
const transactionRoutes = require('./routes/transactions');

const { initIndexers } = require('./indexer');

// Initialize Express application
const app = express();

// Configuration
const PORT = process.env.PORT || 5000;

// Start Blockchain Indexers
initIndexers().catch(err => {
  console.error("Failed to initialize indexers:", err);
});

// Middleware
// Enable CORS for frontend communication
app.use(cors({
  origin: 'http://localhost:3000', // React development server
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
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
