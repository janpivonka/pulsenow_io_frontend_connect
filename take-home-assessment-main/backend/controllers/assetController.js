// Asset controller - Handle HTTP requests for assets
const assetService = require('../services/assetService');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all stocks
// @route   GET /api/stocks
// @access  Public
exports.getStocks = asyncHandler(async (req, res) => {
  const filters = {
    type: req.query.type,
    sector: req.query.sector,
    minPrice: req.query.minPrice,
    maxPrice: req.query.maxPrice,
    minChangePercent: req.query.minChangePercent,
    maxChangePercent: req.query.maxChangePercent,
    minVolume: req.query.minVolume,
    search: req.query.search
  };
  
  const pagination = {
    page: req.query.page,
    limit: req.query.limit,
    sort: req.query.sort,
    order: req.query.order
  };
  
  const result = assetService.getAllStocks(filters, pagination);
  
  res.status(200).json({
    success: true,
    count: result.data.length,
    ...(result.pagination && { pagination: result.pagination }),
    data: result.data
  });
});

// @desc    Get single stock by symbol
// @route   GET /api/stocks/:symbol
// @access  Public
exports.getStock = asyncHandler(async (req, res) => {
  const stock = assetService.getStockBySymbol(req.params.symbol);
  
  res.status(200).json({
    success: true,
    data: stock
  });
});

// @desc    Get all cryptocurrencies
// @route   GET /api/crypto
// @access  Public
exports.getCrypto = asyncHandler(async (req, res) => {
  const filters = {
    type: req.query.type,
    minPrice: req.query.minPrice,
    maxPrice: req.query.maxPrice,
    minChangePercent: req.query.minChangePercent,
    maxChangePercent: req.query.maxChangePercent,
    minVolume: req.query.minVolume,
    search: req.query.search
  };
  
  const pagination = {
    page: req.query.page,
    limit: req.query.limit,
    sort: req.query.sort,
    order: req.query.order
  };
  
  const result = assetService.getAllCrypto(filters, pagination);
  
  res.status(200).json({
    success: true,
    count: result.data.length,
    ...(result.pagination && { pagination: result.pagination }),
    data: result.data
  });
});

// @desc    Get single crypto by symbol
// @route   GET /api/crypto/:symbol
// @access  Public
exports.getCryptoBySymbol = asyncHandler(async (req, res) => {
  const crypto = assetService.getCryptoBySymbol(req.params.symbol);
  
  res.status(200).json({
    success: true,
    data: crypto
  });
});

// @desc    Get all assets (stocks + crypto)
// @route   GET /api/assets
// @access  Public
exports.getAllAssets = asyncHandler(async (req, res) => {
  const filters = {
    type: req.query.type,
    sector: req.query.sector,
    minPrice: req.query.minPrice,
    maxPrice: req.query.maxPrice,
    minChangePercent: req.query.minChangePercent,
    maxChangePercent: req.query.maxChangePercent,
    minVolume: req.query.minVolume,
    search: req.query.search
  };
  
  const pagination = {
    page: req.query.page,
    limit: req.query.limit,
    sort: req.query.sort,
    order: req.query.order
  };
  
  const result = assetService.getAllAssets(filters, pagination);
  
  res.status(200).json({
    success: true,
    count: result.data.length,
    ...(result.pagination && { pagination: result.pagination }),
    data: result.data
  });
});

// @desc    Get asset price history
// @route   GET /api/assets/:symbol/history
// @access  Public
exports.getPriceHistory = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const history = assetService.getPriceHistory(req.params.symbol, startDate, endDate);
  
  res.status(200).json({
    success: true,
    count: history.length,
    data: history
  });
});

// @desc    Get market statistics
// @route   GET /api/assets/stats
// @access  Public
exports.getMarketStats = asyncHandler(async (req, res) => {
  const stats = assetService.getMarketStats();
  
  res.status(200).json({
    success: true,
    data: stats
  });
});
