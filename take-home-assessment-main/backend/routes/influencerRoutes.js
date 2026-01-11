// Influencer routes
const express = require('express');
const router = express.Router();
const mockData = require('../mockData');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all influencers
// @route   GET /api/influencers
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  let influencers = [...mockData.influencers];
  
  // Filter by platform
  if (req.query.platform) {
    influencers = influencers.filter(i => 
      i.platform.toLowerCase() === req.query.platform.toLowerCase()
    );
  }
  
  // Filter by minimum credibility
  if (req.query.minCredibility) {
    influencers = influencers.filter(i => 
      i.credibilityScore >= parseFloat(req.query.minCredibility)
    );
  }
  
  // Sort by credibility score
  if (req.query.sort === 'credibility') {
    influencers.sort((a, b) => b.credibilityScore - a.credibilityScore);
  }
  
  res.status(200).json({
    success: true,
    count: influencers.length,
    data: influencers
  });
}));

module.exports = router;
