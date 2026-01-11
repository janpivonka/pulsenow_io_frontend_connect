// Insight controller - Handle HTTP requests for AI insights
const mockData = require('../mockData');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get AI Core insights
// @route   GET /api/insights
// @access  Public
exports.getInsights = asyncHandler(async (req, res) => {
  let insights = [...mockData.aiCoreInsights];
  
  // Filter by asset
  if (req.query.asset) {
    insights = insights.filter(i => 
      i.asset === req.query.asset.toUpperCase() || i.asset === 'market_wide'
    );
  }
  
  // Filter by type
  if (req.query.type) {
    insights = insights.filter(i => 
      i.type.toLowerCase() === req.query.type.toLowerCase()
    );
  }
  
  // Filter by actionable
  if (req.query.actionable !== undefined) {
    const actionable = req.query.actionable === 'true';
    insights = insights.filter(i => i.actionable === actionable);
  }
  
  // Filter by minimum confidence
  if (req.query.minConfidence) {
    insights = insights.filter(i => 
      i.confidence >= parseFloat(req.query.minConfidence)
    );
  }
  
  // Sort by timestamp (most recent first)
  insights.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  res.status(200).json({
    success: true,
    count: insights.length,
    data: insights
  });
});
