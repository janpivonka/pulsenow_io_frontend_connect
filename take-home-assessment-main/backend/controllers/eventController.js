// Event controller - Handle HTTP requests for events
const mockData = require('../mockData');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all market events
// @route   GET /api/events
// @access  Public
exports.getEvents = asyncHandler(async (req, res) => {
  let events = [...mockData.marketEvents];
  
  // Filter by importance
  if (req.query.importance) {
    events = events.filter(e => 
      e.importance.toLowerCase() === req.query.importance.toLowerCase()
    );
  }
  
  // Filter by asset
  if (req.query.asset) {
    events = events.filter(e => 
      e.asset === req.query.asset.toUpperCase() || e.asset === 'market_wide'
    );
  }
  
  // Sort by scheduled time
  events.sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));
  
  res.status(200).json({
    success: true,
    count: events.length,
    data: events
  });
});

// @desc    Get upcoming events
// @route   GET /api/events/upcoming
// @access  Public
exports.getUpcomingEvents = asyncHandler(async (req, res) => {
  const now = new Date();
  let upcoming = mockData.marketEvents.filter(e => 
    new Date(e.scheduledTime) > now
  );
  
  // Filter by importance
  if (req.query.importance) {
    upcoming = upcoming.filter(e => 
      e.importance.toLowerCase() === req.query.importance.toLowerCase()
    );
  }
  
  // Sort by scheduled time
  upcoming.sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));
  
  res.status(200).json({
    success: true,
    count: upcoming.length,
    data: upcoming
  });
});
