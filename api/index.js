// Vercel Serverless Function Entry Point
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Routes
const pdfRoutes = require('../backend/routes/pdfRoutes');
app.use('/api/pdf', pdfRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Application Form System API is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Application Form System API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      generatePDF: '/api/pdf/generate'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// Export for Vercel
module.exports = app;
