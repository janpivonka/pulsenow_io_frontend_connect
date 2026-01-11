// Insight routes
const express = require('express');
const router = express.Router();
const { getInsights } = require('../controllers/insightController');
const { validateFilters } = require('../middleware/validator');

router.get('/', validateFilters, getInsights);

module.exports = router;
