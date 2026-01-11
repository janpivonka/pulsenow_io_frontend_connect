// Alert service - Business logic for alerts
const mockData = require('../mockData');
const { filterAlerts } = require('../utils/filters');
const { sortData, paginate } = require('../utils/pagination');

class AlertService {
  // Get all alerts
  getAllAlerts(filters = {}, pagination = {}) {
    let alerts = [];
    
    // Combine asset-specific alerts with global alerts
    mockData.stocks.forEach(stock => {
      alerts.push(...stock.alerts.map(a => ({ 
        ...a, 
        assetId: stock.symbol, 
        assetType: 'stock' 
      })));
    });
    
    mockData.cryptocurrencies.forEach(crypto => {
      alerts.push(...crypto.alerts.map(a => ({ 
        ...a, 
        assetId: crypto.symbol, 
        assetType: 'crypto' 
      })));
    });
    
    alerts.push(...mockData.alerts.map(a => ({ ...a, assetType: 'global' })));
    
    // Apply filters
    if (Object.keys(filters).length > 0) {
      alerts = filterAlerts(alerts, filters);
    }
    
    // Sort by timestamp (most recent first)
    alerts = sortData(alerts, 'timestamp', 'desc');
    
    // Apply pagination
    if (pagination.page && pagination.limit) {
      return paginate(alerts, pagination.page, pagination.limit);
    }
    
    return { data: alerts, pagination: null };
  }
  
  // Get alerts by severity
  getAlertsBySeverity(severity, filters = {}, pagination = {}) {
    const allAlerts = this.getAllAlerts({ ...filters, severity }, pagination);
    return allAlerts;
  }
  
  // Get alerts by asset
  getAlertsByAsset(assetSymbol, filters = {}, pagination = {}) {
    const allAlerts = this.getAllAlerts({ ...filters, asset: assetSymbol }, pagination);
    return allAlerts;
  }
  
  // Get critical alerts
  getCriticalAlerts(filters = {}, pagination = {}) {
    return this.getAlertsBySeverity('critical', filters, pagination);
  }
  
  // Get alert statistics
  getAlertStats() {
    const allAlerts = this.getAllAlerts();
    
    const stats = {
      total: allAlerts.data.length,
      bySeverity: {},
      byType: {},
      byAssetType: {},
      actionRequired: 0,
      averageAccuracy: 0
    };
    
    let totalAccuracy = 0;
    let accuracyCount = 0;
    
    allAlerts.data.forEach(alert => {
      // Count by severity
      stats.bySeverity[alert.severity] = (stats.bySeverity[alert.severity] || 0) + 1;
      
      // Count by type
      stats.byType[alert.type] = (stats.byType[alert.type] || 0) + 1;
      
      // Count by asset type
      if (alert.assetType) {
        stats.byAssetType[alert.assetType] = (stats.byAssetType[alert.assetType] || 0) + 1;
      }
      
      // Count action required
      if (alert.actionRequired) {
        stats.actionRequired++;
      }
      
      // Calculate average accuracy
      if (alert.aiCoreAccuracy !== undefined) {
        totalAccuracy += alert.aiCoreAccuracy;
        accuracyCount++;
      }
    });
    
    if (accuracyCount > 0) {
      stats.averageAccuracy = totalAccuracy / accuracyCount;
    }
    
    return stats;
  }
}

module.exports = new AlertService();
