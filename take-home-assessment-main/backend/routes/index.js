// Main routes index
const express = require('express');
const router = express.Router();

// Import route modules
const assetRoutes = require('./assetRoutes');
const newsRoutes = require('./newsRoutes');
const alertRoutes = require('./alertRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const portfolioRoutes = require('./portfolioRoutes');
const eventRoutes = require('./eventRoutes');
const insightRoutes = require('./insightRoutes');
const influencerRoutes = require('./influencerRoutes');

// Mount routes
router.use('/assets', assetRoutes);
router.use('/news', newsRoutes);
router.use('/alerts', alertRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/portfolio', portfolioRoutes);
router.use('/events', eventRoutes);
router.use('/insights', insightRoutes);
router.use('/influencers', influencerRoutes);

module.exports = router;
