const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

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
const pdfRoutes = require('./routes/pdfRoutes');
app.use('/api/pdf', pdfRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Application Form System API is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'success',
    message: '駆付けサービス入会申込書PDF出力システム - Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      generatePDF: 'POST /api/pdf/generate'
    }
  });
});

// Serve static files in production (only if frontend build exists)
if (process.env.NODE_ENV === 'production' && process.env.SERVE_FRONTEND === 'true') {
  const frontendPath = path.join(__dirname, '../frontend/build');
  if (require('fs').existsSync(frontendPath)) {
    app.use(express.static(frontendPath));
    
    app.get('*', (req, res) => {
      res.sendFile(path.join(frontendPath, 'index.html'));
    });
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
