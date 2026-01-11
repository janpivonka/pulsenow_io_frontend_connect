// Alert routes
const express = require('express');
const router = express.Router();
const {
  getAlerts,
  getAlertsBySeverity,
  getAlertsByAsset,
  getCriticalAlerts,
  getAlertStats
} = require('../controllers/alertController');
const { validatePagination, validateFilters } = require('../middleware/validator');

// Get alert statistics
router.get('/stats', getAlertStats);

// Get critical alerts
router.get('/critical', validatePagination, validateFilters, getCriticalAlerts);

// Get alerts by severity
router.get('/severity/:severity', validatePagination, validateFilters, getAlertsBySeverity);

// Get alerts by asset
router.get('/asset/:assetSymbol', validatePagination, validateFilters, getAlertsByAsset);

// Get all alerts
router.get('/', validatePagination, validateFilters, getAlerts);

module.exports = router;
