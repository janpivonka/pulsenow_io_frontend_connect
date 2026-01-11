// Event routes
const express = require('express');
const router = express.Router();
const { getEvents, getUpcomingEvents } = require('../controllers/eventController');
const { validateFilters } = require('../middleware/validator');

router.get('/upcoming', validateFilters, getUpcomingEvents);
router.get('/', validateFilters, getEvents);

module.exports = router;
