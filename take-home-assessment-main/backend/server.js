const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// Legacy route compatibility (for backward compatibility)
const mockData = require('./mockData');
app.get('/api/stocks', (req, res) => {
  res.json(mockData.stocks);
});
app.get('/api/stocks/:symbol', (req, res) => {
  const stock = mockData.stocks.find(s => s.symbol.toLowerCase() === req.params.symbol.toLowerCase());
  if (!stock) {
    return res.status(404).json({ error: 'Stock not found' });
  }
  res.json(stock);
});
app.get('/api/crypto', (req, res) => {
  res.json(mockData.cryptocurrencies);
});
app.get('/api/crypto/:symbol', (req, res) => {
  const crypto = mockData.cryptocurrencies.find(c => c.symbol.toLowerCase() === req.params.symbol.toLowerCase());
  if (!crypto) {
    return res.status(404).json({ error: 'Cryptocurrency not found' });
  }
  res.json(crypto);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Pulse API is running',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Pulse Backend Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`📚 API Documentation:`);
  console.log(`   - Assets: GET /api/assets, /api/assets/stocks, /api/assets/crypto`);
  console.log(`   - News: GET /api/news, /api/news/asset/:symbol, /api/news/category/:category`);
  console.log(`   - Alerts: GET /api/alerts, /api/alerts/critical, /api/alerts/severity/:severity`);
  console.log(`   - Dashboard: GET /api/dashboard`);
  console.log(`   - Portfolio: GET /api/portfolio, /api/portfolio/performance`);
  console.log(`   - Events: GET /api/events, /api/events/upcoming`);
  console.log(`   - Insights: GET /api/insights`);
  console.log(`   - Influencers: GET /api/influencers`);
});
