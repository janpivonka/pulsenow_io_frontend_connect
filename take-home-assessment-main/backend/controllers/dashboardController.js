// Dashboard controller - Handle HTTP requests for dashboard
const mockData = require('../mockData');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get dashboard data
// @route   GET /api/dashboard
// @access  Public
exports.getDashboard = asyncHandler(async (req, res) => {
  const dashboardData = {
    portfolio: mockData.portfolio,
    recentNews: mockData.news
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5),
    activeAlerts: [
      ...mockData.stocks.flatMap(s => s.alerts.slice(0, 1)),
      ...mockData.cryptocurrencies.flatMap(c => c.alerts.slice(0, 1)),
      ...mockData.alerts
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10),
    topGainers: [
      ...mockData.stocks,
      ...mockData.cryptocurrencies
    ]
      .filter(a => a.changePercent > 0)
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 5),
    topLosers: [
      ...mockData.stocks,
      ...mockData.cryptocurrencies
    ]
      .filter(a => a.changePercent < 0)
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, 5),
    aiInsights: mockData.aiCoreInsights
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5),
    upcomingEvents: mockData.marketEvents
      .filter(e => new Date(e.scheduledTime) > new Date())
      .sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime))
      .slice(0, 5)
  };
  
  res.status(200).json({
    success: true,
    data: dashboardData
  });
});
