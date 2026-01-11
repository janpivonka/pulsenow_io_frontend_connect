// Asset service - Business logic for assets
const mockData = require('../mockData');
const { filterAssets } = require('../utils/filters');
const { sortData, paginate } = require('../utils/pagination');

class AssetService {
  // Get all stocks
  getAllStocks(filters = {}, pagination = {}) {
    let stocks = [...mockData.stocks];
    
    // Apply filters
    if (Object.keys(filters).length > 0) {
      stocks = filterAssets(stocks, filters);
    }
    
    // Apply sorting
    if (pagination.sort) {
      stocks = sortData(stocks, pagination.sort, pagination.order || 'asc');
    }
    
    // Apply pagination
    if (pagination.page && pagination.limit) {
      return paginate(stocks, pagination.page, pagination.limit);
    }
    
    return { data: stocks, pagination: null };
  }
  
  // Get stock by symbol
  getStockBySymbol(symbol) {
    const stock = mockData.stocks.find(s => 
      s.symbol.toLowerCase() === symbol.toLowerCase()
    );
    
    if (!stock) {
      throw new Error('Stock not found');
    }
    
    return stock;
  }
  
  // Get all cryptocurrencies
  getAllCrypto(filters = {}, pagination = {}) {
    let crypto = [...mockData.cryptocurrencies];
    
    // Apply filters
    if (Object.keys(filters).length > 0) {
      crypto = filterAssets(crypto, filters);
    }
    
    // Apply sorting
    if (pagination.sort) {
      crypto = sortData(crypto, pagination.sort, pagination.order || 'asc');
    }
    
    // Apply pagination
    if (pagination.page && pagination.limit) {
      return paginate(crypto, pagination.page, pagination.limit);
    }
    
    return { data: crypto, pagination: null };
  }
  
  // Get crypto by symbol
  getCryptoBySymbol(symbol) {
    const crypto = mockData.cryptocurrencies.find(c => 
      c.symbol.toLowerCase() === symbol.toLowerCase()
    );
    
    if (!crypto) {
      throw new Error('Cryptocurrency not found');
    }
    
    return crypto;
  }
  
  // Get all assets (stocks + crypto combined)
  getAllAssets(filters = {}, pagination = {}) {
    const allAssets = [
      ...mockData.stocks.map(s => ({ ...s, assetType: 'stock' })),
      ...mockData.cryptocurrencies.map(c => ({ ...c, assetType: 'crypto' }))
    ];
    
    // Apply filters
    let filtered = allAssets;
    if (Object.keys(filters).length > 0) {
      filtered = filterAssets(allAssets, filters);
    }
    
    // Apply sorting
    if (pagination.sort) {
      filtered = sortData(filtered, pagination.sort, pagination.order || 'asc');
    }
    
    // Apply pagination
    if (pagination.page && pagination.limit) {
      return paginate(filtered, pagination.page, pagination.limit);
    }
    
    return { data: filtered, pagination: null };
  }
  
  // Get asset price history
  getPriceHistory(symbol, startDate, endDate) {
    const allAssets = [...mockData.stocks, ...mockData.cryptocurrencies];
    const asset = allAssets.find(a => 
      a.symbol.toLowerCase() === symbol.toLowerCase()
    );
    
    if (!asset || !asset.priceHistory) {
      throw new Error('Asset or price history not found');
    }
    
    let history = asset.priceHistory;
    
    // Filter by date range
    if (startDate) {
      history = history.filter(h => new Date(h.timestamp) >= new Date(startDate));
    }
    if (endDate) {
      history = history.filter(h => new Date(h.timestamp) <= new Date(endDate));
    }
    
    return history;
  }
  
  // Get market statistics
  getMarketStats() {
    const allAssets = [...mockData.stocks, ...mockData.cryptocurrencies];
    
    const stats = {
      totalAssets: allAssets.length,
      totalStocks: mockData.stocks.length,
      totalCrypto: mockData.cryptocurrencies.length,
      totalMarketCap: allAssets.reduce((sum, a) => sum + (a.marketCap || 0), 0),
      totalVolume: allAssets.reduce((sum, a) => sum + (a.volume || 0), 0),
      gainers: allAssets.filter(a => a.changePercent > 0).length,
      losers: allAssets.filter(a => a.changePercent < 0).length,
      averageChangePercent: allAssets.reduce((sum, a) => sum + a.changePercent, 0) / allAssets.length
    };
    
    return stats;
  }
}

module.exports = new AssetService();
