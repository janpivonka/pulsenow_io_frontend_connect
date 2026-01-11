# Pulse Platform – Frontend Development Assessment

This repository contains the frontend implementation for the **Pulse Platform** technical assessment.  
The backend API was provided and not modified. The focus of this submission is on fulfilling the required frontend functionality within the intended time scope.

---

## ✅ Core Requirements – Implemented

### Dashboard Page (`/`)

All required dashboard sections are implemented using the provided API endpoints:

#### 1. Portfolio Summary Card
- Displays total portfolio value
- Displays total change amount and percentage
- Positive / negative values are color-coded (green / red)
- Data fetched from `/api/portfolio` (via dashboard endpoint)

#### 2. Top Gainers & Losers
- Top 3 gainers and top 3 losers (stocks + crypto combined)
- Displays: symbol, name, change percentage
- Color-coded positive / negative changes
- Data fetched from `/api/dashboard` (`topGainers`, `topLosers`)

#### 3. Recent News Feed
- Displays latest 5 news items
- Shows: title, source, timestamp, category badge
- Category badges are visually differentiated
- Data fetched from `/api/dashboard` (`recentNews`)

#### 4. Active Alerts Summary
- Displays latest 5 alerts
- Shows: message, severity badge, timestamp
- Severity levels are color-coded
- Data fetched from `/api/dashboard` (`activeAlerts`)

---

### Assets Page (`/assets`)

#### 1. Assets Table
- Unified table for **stocks + cryptocurrencies**
- Columns:
  - Symbol
  - Name
  - Current price
  - Change percentage
  - Volume
- Positive / negative changes are color-coded
- Data fetched from `/api/stocks` and `/api/crypto`

#### 2. Basic Filtering
- Filter options:
  - All
  - Stocks only
  - Crypto only
- Implemented using buttons (no dropdown)
- Filtering happens client-side

---

## ✨ Nice-to-Have Features – Implemented

### Dashboard Enhancements
- Loading states
- Error handling with user-friendly messages
- Proper currency and percentage formatting
- Visual hierarchy with cards, badges, hover states, and transitions

### Assets Page Enhancements
- Sortable columns:
  - Symbol
  - Name
  - Price
  - Change percentage
  - Volume
- Fully responsive layout
- Horizontal scrolling limited strictly to the table container
- No viewport-level horizontal overflow

---

## 🛠️ Technical Notes

### Layout & Tailwind Adjustment
To ensure correct responsive behavior on the Assets page (specifically to prevent horizontal overflow of the entire viewport), a **small Tailwind layout adjustment** was required.

- Horizontal scrolling is intentionally constrained **only to the table container**
- The main layout and sidebar remain fixed and stable
- This avoids layout breaking on smaller viewports while keeping the UI production-safe

No backend changes were made.

---

## ⏳ Not Implemented (Out of Scope for Initial Submission)

The following optional features were intentionally postponed to keep the submission aligned with the time-boxed scope of the assessment:

- Assets search (by symbol or name)
- Asset detail modal / expandable rows
- Portfolio chart (e.g. Recharts)
- Dark mode toggle
- Real-time polling (periodic data refresh)
- Additional pages: News, Alerts, Portfolio detail views

All of the above can be implemented quickly on top of the current codebase if requested.

---

## 🚀 How to Run

```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run dev
