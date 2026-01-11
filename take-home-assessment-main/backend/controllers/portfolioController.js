// Portfolio controller - Handle HTTP requests for portfolio
const mockData = require('../mockData');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get portfolio data
// @route   GET /api/portfolio
// @access  Public
exports.getPortfolio = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: mockData.portfolio
  });
});

// @desc    Get portfolio performance
// @route   GET /api/portfolio/performance
// @access  Public
exports.getPortfolioPerformance = asyncHandler(async (req, res) => {
  const portfolio = mockData.portfolio;
  
  const performance = {
    totalValue: portfolio.totalValue,
    totalChange: portfolio.totalChange,
    totalChangePercent: portfolio.totalChangePercent,
    bestPerformer: portfolio.assets.reduce((best, asset) => 
      asset.changePercent > best.changePercent ? asset : best
    ),
    worstPerformer: portfolio.assets.reduce((worst, asset) => 
      asset.changePercent < worst.changePercent ? asset : worst
    ),
    assetAllocation: portfolio.assets.map(asset => ({
      assetId: asset.assetId,
      percentage: (asset.value / portfolio.totalValue) * 100,
      value: asset.value
    }))
  };
  
  res.status(200).json({
    success: true,
    data: performance
  });
});
