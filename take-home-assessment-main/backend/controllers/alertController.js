// Alert controller - Handle HTTP requests for alerts
const alertService = require('../services/alertService');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all alerts
// @route   GET /api/alerts
// @access  Public
exports.getAlerts = asyncHandler(async (req, res) => {
  const filters = {
    severity: req.query.severity,
    asset: req.query.asset,
    type: req.query.type,
    assetType: req.query.assetType,
    actionRequired: req.query.actionRequired
  };
  
  const pagination = {
    page: req.query.page,
    limit: req.query.limit,
    sort: req.query.sort,
    order: req.query.order
  };
  
  const result = alertService.getAllAlerts(filters, pagination);
  
  res.status(200).json({
    success: true,
    count: result.data.length,
    ...(result.pagination && { pagination: result.pagination }),
    data: result.data
  });
});

// @desc    Get alerts by severity
// @route   GET /api/alerts/severity/:severity
// @access  Public
exports.getAlertsBySeverity = asyncHandler(async (req, res) => {
  const filters = {
    asset: req.query.asset,
    type: req.query.type,
    assetType: req.query.assetType,
    actionRequired: req.query.actionRequired
  };
  
  const pagination = {
    page: req.query.page,
    limit: req.query.limit,
    sort: req.query.sort,
    order: req.query.order
  };
  
  const result = alertService.getAlertsBySeverity(req.params.severity, filters, pagination);
  
  res.status(200).json({
    success: true,
    count: result.data.length,
    ...(result.pagination && { pagination: result.pagination }),
    data: result.data
  });
});

// @desc    Get alerts by asset
// @route   GET /api/alerts/asset/:assetSymbol
// @access  Public
exports.getAlertsByAsset = asyncHandler(async (req, res) => {
  const filters = {
    severity: req.query.severity,
    type: req.query.type,
    assetType: req.query.assetType,
    actionRequired: req.query.actionRequired
  };
  
  const pagination = {
    page: req.query.page,
    limit: req.query.limit,
    sort: req.query.sort,
    order: req.query.order
  };
  
  const result = alertService.getAlertsByAsset(req.params.assetSymbol, filters, pagination);
  
  res.status(200).json({
    success: true,
    count: result.data.length,
    ...(result.pagination && { pagination: result.pagination }),
    data: result.data
  });
});

// @desc    Get critical alerts
// @route   GET /api/alerts/critical
// @access  Public
exports.getCriticalAlerts = asyncHandler(async (req, res) => {
  const filters = {
    asset: req.query.asset,
    type: req.query.type,
    assetType: req.query.assetType
  };
  
  const pagination = {
    page: req.query.page,
    limit: req.query.limit
  };
  
  const result = alertService.getCriticalAlerts(filters, pagination);
  
  res.status(200).json({
    success: true,
    count: result.data.length,
    ...(result.pagination && { pagination: result.pagination }),
    data: result.data
  });
});

// @desc    Get alert statistics
// @route   GET /api/alerts/stats
// @access  Public
exports.getAlertStats = asyncHandler(async (req, res) => {
  const stats = alertService.getAlertStats();
  
  res.status(200).json({
    success: true,
    data: stats
  });
});
