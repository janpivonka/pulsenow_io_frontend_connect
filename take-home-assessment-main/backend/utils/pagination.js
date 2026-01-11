// Pagination utility functions
const paginate = (data, page = 1, limit = 10) => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = pageNum * limitNum;
  
  const paginatedData = data.slice(startIndex, endIndex);
  
  return {
    data: paginatedData,
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(data.length / limitNum),
      totalItems: data.length,
      itemsPerPage: limitNum,
      hasNextPage: endIndex < data.length,
      hasPrevPage: pageNum > 1
    }
  };
};

const sortData = (data, sortBy, order = 'asc') => {
  if (!sortBy) return data;
  
  const sorted = [...data].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    // Handle nested properties
    if (sortBy.includes('.')) {
      const keys = sortBy.split('.');
      aVal = keys.reduce((obj, key) => obj?.[key], a);
      bVal = keys.reduce((obj, key) => obj?.[key], b);
    }
    
    // Handle dates
    if (aVal instanceof Date || (typeof aVal === 'string' && !isNaN(Date.parse(aVal)))) {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }
    
    // Handle numbers
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return order === 'desc' ? bVal - aVal : aVal - bVal;
    }
    
    // Handle strings
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return order === 'desc' 
        ? bVal.localeCompare(aVal)
        : aVal.localeCompare(bVal);
    }
    
    // Handle dates
    if (aVal instanceof Date && bVal instanceof Date) {
      return order === 'desc' ? bVal - aVal : aVal - bVal;
    }
    
    return 0;
  });
  
  return sorted;
};

module.exports = { paginate, sortData };
