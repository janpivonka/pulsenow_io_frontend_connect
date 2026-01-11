// Request validation middleware
const validator = {
  // Validate query parameters for pagination
  validatePagination: (req, res, next) => {
    const { page, limit, sort, order } = req.query;
    
    // Validate page
    if (page && (isNaN(page) || parseInt(page) < 1)) {
      return res.status(400).json({
        success: false,
        error: 'Page must be a positive integer'
      });
    }
    
    // Validate limit
    if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
      return res.status(400).json({
        success: false,
        error: 'Limit must be between 1 and 100'
      });
    }
    
    // Validate sort order
    if (order && !['asc', 'desc'].includes(order.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Order must be either "asc" or "desc"'
      });
    }
    
    next();
  },

  // Validate asset symbol
  validateSymbol: (req, res, next) => {
    const { symbol } = req.params;
    
    if (!symbol || symbol.length < 1 || symbol.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Invalid symbol format'
      });
    }
    
    next();
  },

  // Validate date range
  validateDateRange: (req, res, next) => {
    const { startDate, endDate } = req.query;
    
    if (startDate && isNaN(Date.parse(startDate))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid startDate format. Use ISO 8601 format'
      });
    }
    
    if (endDate && isNaN(Date.parse(endDate))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid endDate format. Use ISO 8601 format'
      });
    }
    
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        error: 'startDate must be before endDate'
      });
    }
    
    next();
  },

  // Validate filter parameters
  validateFilters: (req, res, next) => {
    const { category, impact, severity, assetType } = req.query;
    
    const validCategories = ['macro', 'technology', 'crypto', 'earnings', 'regulatory', 'market'];
    const validImpacts = ['low', 'medium', 'high', 'critical'];
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    const validAssetTypes = ['stock', 'crypto', 'all'];
    
    if (category && !validCategories.includes(category.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: `Invalid category. Must be one of: ${validCategories.join(', ')}`
      });
    }
    
    if (impact && !validImpacts.includes(impact.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: `Invalid impact. Must be one of: ${validImpacts.join(', ')}`
      });
    }
    
    if (severity && !validSeverities.includes(severity.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: `Invalid severity. Must be one of: ${validSeverities.join(', ')}`
      });
    }
    
    if (assetType && !validAssetTypes.includes(assetType.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: `Invalid assetType. Must be one of: ${validAssetTypes.join(', ')}`
      });
    }
    
    next();
  }
};

module.exports = validator;
