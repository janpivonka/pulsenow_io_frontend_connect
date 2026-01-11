// Advanced filtering utilities
const filterAssets = (assets, filters) => {
  let filtered = [...assets];
  
  // Filter by type
  if (filters.type && filters.type !== 'all') {
    if (filters.type === 'stock') {
      filtered = filtered.filter(a => a.sector); // Stocks have sector property
    } else if (filters.type === 'crypto') {
      filtered = filtered.filter(a => !a.sector); // Crypto doesn't have sector
    }
  }
  
  // Filter by sector (for stocks)
  if (filters.sector) {
    filtered = filtered.filter(a => 
      a.sector && a.sector.toLowerCase() === filters.sector.toLowerCase()
    );
  }
  
  // Filter by price range
  if (filters.minPrice) {
    filtered = filtered.filter(a => a.currentPrice >= parseFloat(filters.minPrice));
  }
  if (filters.maxPrice) {
    filtered = filtered.filter(a => a.currentPrice <= parseFloat(filters.maxPrice));
  }
  
  // Filter by change percentage range
  if (filters.minChangePercent) {
    filtered = filtered.filter(a => a.changePercent >= parseFloat(filters.minChangePercent));
  }
  if (filters.maxChangePercent) {
    filtered = filtered.filter(a => a.changePercent <= parseFloat(filters.maxChangePercent));
  }
  
  // Filter by volume range
  if (filters.minVolume) {
    filtered = filtered.filter(a => a.volume >= parseFloat(filters.minVolume));
  }
  
  // Search by name or symbol
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(a => 
      a.name.toLowerCase().includes(searchTerm) ||
      a.symbol.toLowerCase().includes(searchTerm)
    );
  }
  
  return filtered;
};

const filterNews = (news, filters) => {
  let filtered = [...news];
  
  if (filters.category) {
    filtered = filtered.filter(n => 
      n.category.toLowerCase() === filters.category.toLowerCase()
    );
  }
  
  if (filters.impact) {
    filtered = filtered.filter(n => 
      n.impact.toLowerCase() === filters.impact.toLowerCase()
    );
  }
  
  if (filters.asset) {
    filtered = filtered.filter(n => 
      n.affectedAssets && n.affectedAssets.includes(filters.asset.toUpperCase())
    );
  }
  
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(n => 
      n.title.toLowerCase().includes(searchTerm) ||
      n.summary.toLowerCase().includes(searchTerm) ||
      n.source.toLowerCase().includes(searchTerm)
    );
  }
  
  if (filters.minSentiment !== undefined) {
    filtered = filtered.filter(n => n.sentiment >= parseFloat(filters.minSentiment));
  }
  
  if (filters.maxSentiment !== undefined) {
    filtered = filtered.filter(n => n.sentiment <= parseFloat(filters.maxSentiment));
  }
  
  return filtered;
};

const filterAlerts = (alerts, filters) => {
  let filtered = [...alerts];
  
  if (filters.severity) {
    filtered = filtered.filter(a => 
      a.severity.toLowerCase() === filters.severity.toLowerCase()
    );
  }
  
  if (filters.asset) {
    filtered = filtered.filter(a => 
      a.assetId === filters.asset.toUpperCase() ||
      (a.affectedAssets && a.affectedAssets.includes(filters.asset.toUpperCase()))
    );
  }
  
  if (filters.type) {
    filtered = filtered.filter(a => 
      a.type.toLowerCase() === filters.type.toLowerCase()
    );
  }
  
  if (filters.assetType) {
    filtered = filtered.filter(a => 
      a.assetType && a.assetType.toLowerCase() === filters.assetType.toLowerCase()
    );
  }
  
  if (filters.actionRequired !== undefined) {
    const required = filters.actionRequired === 'true';
    filtered = filtered.filter(a => a.actionRequired === required);
  }
  
  return filtered;
};

module.exports = { filterAssets, filterNews, filterAlerts };
