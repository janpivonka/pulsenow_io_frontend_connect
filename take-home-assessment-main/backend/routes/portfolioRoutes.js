// Portfolio routes
const express = require('express');
const router = express.Router();
const { getPortfolio, getPortfolioPerformance } = require('../controllers/portfolioController');

router.get('/performance', getPortfolioPerformance);
router.get('/', getPortfolio);

module.exports = router;
