// Asset routes
const express = require('express');
const router = express.Router();
const {
  getStocks,
  getStock,
  getCrypto,
  getCryptoBySymbol,
  getAllAssets,
  getPriceHistory,
  getMarketStats
} = require('../controllers/assetController');
const { validatePagination, validateSymbol, validateDateRange, validateFilters } = require('../middleware/validator');

// Get all assets (stocks + crypto)
router.get('/', validatePagination, validateFilters, getAllAssets);

// Get market statistics
router.get('/stats', getMarketStats);

// Get asset price history
router.get('/:symbol/history', validateSymbol, validateDateRange, getPriceHistory);

// Stock routes
router.get('/stocks', validatePagination, validateFilters, getStocks);
router.get('/stocks/:symbol', validateSymbol, getStock);

// Crypto routes
router.get('/crypto', validatePagination, validateFilters, getCrypto);
router.get('/crypto/:symbol', validateSymbol, getCryptoBySymbol);

module.exports = router;
