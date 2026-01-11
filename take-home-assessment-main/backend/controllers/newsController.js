// News controller - Handle HTTP requests for news
const newsService = require('../services/newsService');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all news
// @route   GET /api/news
// @access  Public
exports.getNews = asyncHandler(async (req, res) => {
  const filters = {
    category: req.query.category,
    impact: req.query.impact,
    asset: req.query.asset,
    search: req.query.search,
    minSentiment: req.query.minSentiment,
    maxSentiment: req.query.maxSentiment
  };
  
  const pagination = {
    page: req.query.page,
    limit: req.query.limit,
    sort: req.query.sort,
    order: req.query.order
  };
  
  const result = newsService.getAllNews(filters, pagination);
  
  res.status(200).json({
    success: true,
    count: result.data.length,
    ...(result.pagination && { pagination: result.pagination }),
    data: result.data
  });
});

// @desc    Get news by asset
// @route   GET /api/news/asset/:assetSymbol
// @access  Public
exports.getNewsByAsset = asyncHandler(async (req, res) => {
  const filters = {
    category: req.query.category,
    impact: req.query.impact,
    search: req.query.search,
    minSentiment: req.query.minSentiment,
    maxSentiment: req.query.maxSentiment
  };
  
  const pagination = {
    page: req.query.page,
    limit: req.query.limit,
    sort: req.query.sort,
    order: req.query.order
  };
  
  const result = newsService.getNewsByAsset(req.params.assetSymbol, filters, pagination);
  
  res.status(200).json({
    success: true,
    count: result.data.length,
    ...(result.pagination && { pagination: result.pagination }),
    data: result.data
  });
});

// @desc    Get news by category
// @route   GET /api/news/category/:category
// @access  Public
exports.getNewsByCategory = asyncHandler(async (req, res) => {
  const filters = {
    impact: req.query.impact,
    asset: req.query.asset,
    search: req.query.search,
    minSentiment: req.query.minSentiment,
    maxSentiment: req.query.maxSentiment
  };
  
  const pagination = {
    page: req.query.page,
    limit: req.query.limit,
    sort: req.query.sort,
    order: req.query.order
  };
  
  const result = newsService.getNewsByCategory(req.params.category, filters, pagination);
  
  res.status(200).json({
    success: true,
    count: result.data.length,
    ...(result.pagination && { pagination: result.pagination }),
    data: result.data
  });
});

// @desc    Get news statistics
// @route   GET /api/news/stats
// @access  Public
exports.getNewsStats = asyncHandler(async (req, res) => {
  const stats = newsService.getNewsStats();
  
  res.status(200).json({
    success: true,
    data: stats
  });
});
