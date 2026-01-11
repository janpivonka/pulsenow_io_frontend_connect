# Pulse Platform - Frontend Development Assessment

## Overview

Welcome to the Pulse Platform assessment! This is a focused React frontend development task designed to evaluate your skills in building functional, user-friendly interfaces. The backend API is already set up and running - your focus is on implementing the frontend pages.

## Time Allowed

**30-40 minutes** (focused implementation)

## Core Task (Required)

### Dashboard Page (`/`)
Implement the main dashboard page that displays:

1. **Portfolio Summary Card**
   - Total portfolio value
   - Total change amount and percentage (with color coding: green for positive, red for negative)
   - Display using the `/api/portfolio` endpoint

2. **Top Gainers & Losers Section**
   - Show top 3 gainers and top 3 losers (stocks + crypto combined)
   - Display: symbol, name, current price, change percentage
   - Use color coding for positive/negative changes
   - Use the `/api/dashboard` endpoint which provides `topGainers` and `topLosers`

3. **Recent News Feed**
   - Display the latest 5 news items
   - Show: title, source, timestamp, category badge
   - Use the `/api/dashboard` endpoint which provides `recentNews`

4. **Active Alerts Summary**
   - Display the latest 5 alerts
   - Show: alert message, severity badge (with color coding), timestamp
   - Use the `/api/dashboard` endpoint which provides `activeAlerts`

### Assets Page (`/assets`)
Implement a simple assets listing page:

1. **Assets Table/List**
   - Display all stocks and cryptocurrencies in a unified view
   - Show: symbol, name, current price, change percentage, volume
   - Use color coding for positive/negative changes
   - Fetch from `/api/stocks` and `/api/crypto` endpoints

2. **Basic Filtering**
   - Add a simple filter to show: All / Stocks Only / Crypto Only
   - Use dropdown or buttons for filtering

## Nice to Have (Optional - Implement if time permits)

These features will demonstrate advanced skills but are not required:

### Dashboard Enhancements
- ✅ Add loading states (skeletons or spinners) while data is fetching
- ✅ Add error handling with user-friendly error messages
- ✅ Format numbers with proper currency/percentage formatting
- ✅ Add icons or emojis for better visual appeal

### Assets Page Enhancements
- ✅ Sortable table columns (by price, change percentage, volume)
- ✅ Search functionality to filter assets by name or symbol
- ✅ Responsive design (mobile-friendly layout)
- ✅ Click on asset to show more details (modal or expandable row)

### Additional Pages (if time allows)
- **News Page** (`/news`): Display all news with filtering by category
- **Alerts Page** (`/alerts`): Display all alerts grouped by severity
- **Portfolio Page** (`/portfolio`): Detailed portfolio view with charts

### Advanced Features
- ✅ Use Recharts library to add a simple chart (e.g., portfolio value over time)
- ✅ Implement basic state management with Context API
- ✅ Add smooth transitions/animations
- ✅ Dark mode toggle
- ✅ Real-time data updates (polling every 30 seconds)

## Technical Requirements

### Code Quality
- Write clean, readable, and maintainable code
- Use proper React patterns (hooks, functional components)
- Use React hooks (useState, useEffect) appropriately
- Implement basic error handling

### UI/UX
- Use Tailwind CSS for styling (already configured)
- Ensure good visual hierarchy and readability
- Use appropriate colors (green for positive, red for negative)
- Make it look professional and polished

### What We're Looking For
- **Functionality**: Does the code work and display data correctly?
- **Code Quality**: Is the code clean and well-structured?
- **UI/UX**: Does it look good and is it easy to use?
- **React Best Practices**: Proper use of hooks and components

## API Usage

All API functions are already set up in `src/services/api.js`. Use these functions to fetch data:

```javascript
import { getDashboard, getStocks, getCrypto, getNews, getAlerts, getPortfolio } from '../services/api'
```

Example usage:
```javascript
import { useEffect, useState } from 'react'
import { getDashboard } from '../services/api'

const Dashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getDashboard()
        setData(response.data)
      } catch (error) {
        console.error('Error fetching dashboard:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div>Loading...</div>
  // ... render your component
}
```

## Important Notes

- **Do NOT modify the backend code** - it's already complete
- **Do NOT spend time on MetaMask integration** - it's provided but not part of the assessment
- **Do NOT create a new project structure** - work within the existing structure
- **Focus on core requirements first** - implement nice-to-have features only if time permits
- **Keep it simple** - clean, working solutions are better than overcomplicated ones

## Quick Start

1. **Start the backend** (if not already running):
   ```bash
   cd backend
   npm start
   ```

2. **Start the frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open `http://localhost:3000` in your browser

## Submission

1. Complete the core requirements (Dashboard + Assets pages)
2. Ensure the project runs without errors
3. Test the functionality
4. Be prepared to explain your implementation approach

## Evaluation Criteria

- **Core Requirements**: Dashboard and Assets pages implemented and functional
- **Code Quality**: Clean, readable, maintainable code
- **UI/UX**: Professional appearance with proper styling
- **React Best Practices**: Proper use of hooks and components
- **Nice to Have**: Bonus points for optional features implemented

If you have any questions about the requirements, feel free to ask. Good luck!
