# Pulse Platform - Full Stack Developer Assessment

## Company Mission

**Pulse** is a market monitoring engine and smart alerts platform designed to keep you ahead in the Stock and Crypto markets. Our platform monitors, filters, and analyzes impactful events to give you what actually matters, with AI Core accuracy benchmarked at 94% based on independent audit.

## Project Overview

This is a full-stack assessment project for hiring Full stack developers. The project consists of:

- **Backend**: Node.js/Express API server with comprehensive mock data
- **Frontend**: React application with routing and modern UI framework
- **Mock Data**: Complex, realistic market data including stocks, cryptocurrencies, news, alerts, and AI insights

## Project Structure

```
React-assessment/
├── backend/
│   ├── controllers/       # Request handlers (MVC pattern)
│   │   ├── assetController.js
│   │   ├── newsController.js
│   │   ├── alertController.js
│   │   ├── dashboardController.js
│   │   ├── portfolioController.js
│   │   ├── eventController.js
│   │   └── insightController.js
│   ├── routes/            # API route definitions
│   │   ├── assetRoutes.js
│   │   ├── newsRoutes.js
│   │   ├── alertRoutes.js
│   │   └── index.js
│   ├── services/          # Business logic layer
│   │   ├── assetService.js
│   │   ├── newsService.js
│   │   └── alertService.js
│   ├── middleware/        # Custom middleware
│   │   ├── errorHandler.js
│   │   ├── asyncHandler.js
│   │   └── validator.js
│   ├── utils/             # Utility functions
│   │   ├── pagination.js
│   │   └── filters.js
│   ├── server.js          # Express API server entry point
│   ├── mockData.js        # Complex mock data for market monitoring
│   └── package.json       # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service functions
│   │   └── ...
│   └── package.json       # Frontend dependencies
├── ASSESSMENT.md          # Assessment instructions
├── SETUP.md               # Quick setup guide
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
npm start
# Server will run on http://localhost:5000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
# Application will run on http://localhost:3000
```

## API Endpoints

The backend provides a comprehensive RESTful API with advanced features including pagination, filtering, sorting, and statistics.

### Assets Endpoints
- `GET /api/assets` - Get all assets (stocks + crypto) with filtering, sorting, pagination
- `GET /api/assets/stocks` - Get all stocks
- `GET /api/assets/stocks/:symbol` - Get specific stock
- `GET /api/assets/crypto` - Get all cryptocurrencies
- `GET /api/assets/crypto/:symbol` - Get specific cryptocurrency
- `GET /api/assets/:symbol/history` - Get price history for an asset (with date range)
- `GET /api/assets/stats` - Get market statistics

**Query Parameters:**
- `page` - Page number for pagination
- `limit` - Items per page (1-100)
- `sort` - Field to sort by (e.g., `price`, `changePercent`, `volume`)
- `order` - Sort order (`asc` or `desc`)
- `type` - Filter by type (`stock`, `crypto`, `all`)
- `sector` - Filter stocks by sector
- `minPrice`, `maxPrice` - Price range filter
- `minChangePercent`, `maxChangePercent` - Change percentage range
- `search` - Search by name or symbol

### News Endpoints
- `GET /api/news` - Get all news with filtering, sorting, pagination
- `GET /api/news/asset/:assetSymbol` - Get news for specific asset
- `GET /api/news/category/:category` - Get news by category
- `GET /api/news/stats` - Get news statistics

**Query Parameters:**
- `category` - Filter by category (`macro`, `technology`, `crypto`, `earnings`, `regulatory`, `market`)
- `impact` - Filter by impact (`low`, `medium`, `high`, `critical`)
- `asset` - Filter by affected asset
- `search` - Search in title, summary, or source
- `minSentiment`, `maxSentiment` - Sentiment score range
- `page`, `limit`, `sort`, `order` - Pagination and sorting

### Alerts Endpoints
- `GET /api/alerts` - Get all alerts with filtering, sorting, pagination
- `GET /api/alerts/critical` - Get critical alerts only
- `GET /api/alerts/severity/:severity` - Get alerts by severity level
- `GET /api/alerts/asset/:assetSymbol` - Get alerts for specific asset
- `GET /api/alerts/stats` - Get alert statistics

**Query Parameters:**
- `severity` - Filter by severity (`low`, `medium`, `high`, `critical`)
- `asset` - Filter by asset symbol
- `type` - Filter by alert type
- `assetType` - Filter by asset type (`stock`, `crypto`, `global`)
- `actionRequired` - Filter by action required (`true` or `false`)
- `page`, `limit`, `sort`, `order` - Pagination and sorting

### Dashboard & Portfolio
- `GET /api/dashboard` - Get dashboard summary data
- `GET /api/portfolio` - Get portfolio data
- `GET /api/portfolio/performance` - Get portfolio performance metrics

### Events & Insights
- `GET /api/events` - Get all market events
- `GET /api/events/upcoming` - Get upcoming events
- `GET /api/insights` - Get AI Core insights with filtering
- `GET /api/influencers` - Get influencer data

### Health Check
- `GET /api/health` - API health check endpoint

### Legacy Endpoints (Backward Compatibility)
- `GET /api/stocks` - Legacy endpoint (redirects to `/api/assets/stocks`)
- `GET /api/crypto` - Legacy endpoint (redirects to `/api/assets/crypto`)

### Response Format

All endpoints return responses in the following format:

```json
{
  "success": true,
  "count": 10,
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "data": [...]
}
```

## Mock Data Structure

The mock data includes:

- **Stocks**: AAPL, TSLA, NVDA, MSFT, GOOGL with price history, alerts, sentiment, and metrics
- **Cryptocurrencies**: BTC, ETH, SOL with comprehensive market data
- **News**: Market news with categories, impact levels, and affected assets
- **Alerts**: Real-time alerts with severity levels and AI Core accuracy
- **Influencers**: Social media influencer predictions and sentiment
- **Market Events**: Scheduled events with AI Core predictions
- **Portfolio**: User portfolio with assets and performance
- **AI Insights**: Pattern recognition and anomaly detection insights

## Assessment Instructions

**Please refer to `ASSESSMENT.md` for detailed task requirements.**

## Backend Architecture

The backend follows a **MVC (Model-View-Controller)** architecture pattern:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic and data processing
- **Routes**: Define API endpoints and apply middleware
- **Middleware**: Request validation, error handling, async wrapper
- **Utils**: Reusable utility functions (pagination, filtering, sorting)

### Key Features

- ✅ **Pagination**: All list endpoints support pagination
- ✅ **Filtering**: Advanced filtering by multiple criteria
- ✅ **Sorting**: Sort by any field in ascending or descending order
- ✅ **Validation**: Request parameter validation middleware
- ✅ **Error Handling**: Centralized error handling with consistent responses
- ✅ **Statistics**: Dedicated endpoints for aggregated statistics
- ✅ **Type Safety**: Input validation and type checking

## Notes

- MetaMask integration is included in the project but is **NOT part of the assessment task**
- The frontend structure is set up with routing and basic components
- All API services are configured and ready to use
- Tailwind CSS is configured for styling
- Backend uses MVC architecture for better code organization and maintainability

## Technologies

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **CORS** - Cross-origin resource sharing
- **Architecture**: MVC pattern with separation of concerns

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Recharts** - Chart library
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Build tool and dev server

### Additional
- **MetaMask**: Uses browser's native `window.ethereum` API (provided but not required for assessment)

## Example API Usage

### Get Assets with Filtering and Pagination
```bash
GET /api/assets?type=stock&minPrice=100&maxPrice=500&page=1&limit=10&sort=price&order=desc
```

### Get News by Category with Search
```bash
GET /api/news/category/technology?search=AI&impact=high&page=1&limit=5
```

### Get Critical Alerts
```bash
GET /api/alerts/critical?actionRequired=true
```

### Get Market Statistics
```bash
GET /api/assets/stats
```
