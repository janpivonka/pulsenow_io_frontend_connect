// News routes
const express = require('express');
const router = express.Router();
const {
  getNews,
  getNewsByAsset,
  getNewsByCategory,
  getNewsStats
} = require('../controllers/newsController');
const { validatePagination, validateFilters } = require('../middleware/validator');

// Get news statistics
router.get('/stats', getNewsStats);

// Get news by category
router.get('/category/:category', validatePagination, validateFilters, getNewsByCategory);

// Get news by asset
router.get('/asset/:assetSymbol', validatePagination, validateFilters, getNewsByAsset);

// Get all news
router.get('/', validatePagination, validateFilters, getNews);

module.exports = router;
