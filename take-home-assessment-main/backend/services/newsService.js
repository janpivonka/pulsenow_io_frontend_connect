// News service - Business logic for news
const mockData = require('../mockData');
const { filterNews } = require('../utils/filters');
const { sortData, paginate } = require('../utils/pagination');

class NewsService {
  // Get all news
  getAllNews(filters = {}, pagination = {}) {
    let news = [...mockData.news];
    
    // Apply filters
    if (Object.keys(filters).length > 0) {
      news = filterNews(news, filters);
    }
    
    // Default sort by timestamp (most recent first)
    if (!pagination.sort) {
      news = sortData(news, 'timestamp', 'desc');
    } else {
      news = sortData(news, pagination.sort, pagination.order || 'desc');
    }
    
    // Apply pagination
    if (pagination.page && pagination.limit) {
      return paginate(news, pagination.page, pagination.limit);
    }
    
    return { data: news, pagination: null };
  }
  
  // Get news by asset
  getNewsByAsset(assetSymbol, filters = {}, pagination = {}) {
    let news = mockData.news.filter(n => 
      n.affectedAssets && n.affectedAssets.includes(assetSymbol.toUpperCase())
    );
    
    // Apply additional filters
    if (Object.keys(filters).length > 0) {
      news = filterNews(news, filters);
    }
    
    // Sort by timestamp
    news = sortData(news, 'timestamp', 'desc');
    
    // Apply pagination
    if (pagination.page && pagination.limit) {
      return paginate(news, pagination.page, pagination.limit);
    }
    
    return { data: news, pagination: null };
  }
  
  // Get news by category
  getNewsByCategory(category, filters = {}, pagination = {}) {
    let news = mockData.news.filter(n => 
      n.category.toLowerCase() === category.toLowerCase()
    );
    
    // Apply additional filters
    if (Object.keys(filters).length > 0) {
      news = filterNews(news, filters);
    }
    
    // Sort by timestamp
    news = sortData(news, 'timestamp', 'desc');
    
    // Apply pagination
    if (pagination.page && pagination.limit) {
      return paginate(news, pagination.page, pagination.limit);
    }
    
    return { data: news, pagination: null };
  }
  
  // Get news statistics
  getNewsStats() {
    const news = mockData.news;
    
    const stats = {
      totalNews: news.length,
      byCategory: {},
      byImpact: {},
      averageSentiment: news.reduce((sum, n) => sum + n.sentiment, 0) / news.length,
      mostAffectedAssets: {}
    };
    
    // Count by category
    news.forEach(n => {
      stats.byCategory[n.category] = (stats.byCategory[n.category] || 0) + 1;
    });
    
    // Count by impact
    news.forEach(n => {
      stats.byImpact[n.impact] = (stats.byImpact[n.impact] || 0) + 1;
    });
    
    // Count affected assets
    news.forEach(n => {
      if (n.affectedAssets) {
        n.affectedAssets.forEach(asset => {
          stats.mostAffectedAssets[asset] = (stats.mostAffectedAssets[asset] || 0) + 1;
        });
      }
    });
    
    return stats;
  }
}

module.exports = new NewsService();
