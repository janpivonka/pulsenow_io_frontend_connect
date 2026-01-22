[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge\&logo=vercel\&logoColor=white)](https://pulsenow-io-frontend-connect-2r0wyxsml-jan-pivonkas-projects.vercel.app/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge\&logo=react\&logoColor=61DAFB)](https://react.dev/)
[![TradingView](https://img.shields.io/badge/Charts-Lightweight--Charts-blue)](https://www.tradingview.com/lightweight-charts/)

# 💹 PulseNow – Advanced Real-Time Trading Platform

## 📝 Project Context and Goal

This project was originally for a company with a fully functional backend API. My task was simply to create a minimal frontend interface for the **Dashboard** and **Assets** pages. However, because I am deeply involved with trading as a personal passion and experience, I expanded the frontend considerably, implementing real-time trading visualization, portfolio calculations, and interactive charts. The development was concluded in its current state, reflecting this extended effort.

PulseNow is a sophisticated trading terminal designed for real-time monitoring and trading of assets (stocks, crypto). The main goal was to create a robust frontend architecture capable of handling high-frequency updates, complex portfolio calculations, and interactive visualization of trading orders directly on the chart.

**Note:** Currently, trading logic supports only **buy/long positions**. Future improvements should include **short selling logic**.

## 🚀 Live Demo

Frontend (Vercel): 👉 [https://pulsenow-io-frontend-connect-2r0wyxsml-jan-pivonkas-projects.vercel.app/](https://pulsenow-io-frontend-connect-2r0wyxsml-jan-pivonkas-projects.vercel.app/)
Backend API (Railway): 👉 [https://pulsenowiofrontendconnect-production.up.railway.app/](https://pulsenowiofrontendconnect-production.up.railway.app/)

## 🏗️ Application Architecture

### 🔹 Frontend

The frontend is built with **React 18** with strong separation between logic and UI.

Core principles:

* **Feature-first component structure**
* **Application logic extracted into custom hooks** (`useRealTimeData`, `useTrading`, `useTradingLogic`)
* **UI components focused on rendering only**
* **Predictable state transitions** even for complex operations like live portfolio updates and order management
* **Dynamic TradingChart** with multi-layer rendering of entry points, take-profits, stop-losses, and limit orders

### 🔹 Pages

The frontend is divided into the following route-level pages:

* **Dashboard:** Portfolio overview, performance tracking, market heatmap
* **Assets:** Detailed asset explorer, trending assets, realized/unrealized P/L
* **Portfolio:** Active units, trade history, detailed position management
* **News:** Market news feed (static or dynamic)
* **Alerts:** Real-time alerts feed with impact scoring and filtering

### 🔹 Components

* **TradingChart.tsx:** The core charting component using Lightweight Charts, rendering:

  * Units / positions with dynamic P/L
  * Entry, TP, SL, limit orders
  * Preview average line for adding positions
* **Modals:** AdvancedPositionModal, MarketOrderModal, PositionManagerModal, DeleteConfirmationModal, TradeSuccessModal
* **Other UI modules:** Layout, ThemeToggle, MetaMaskButton, ScrollToTop, PageHeader, SearchInput

### 🔹 Services

* **TradingContext:** Global state for positions, pending orders, and execution logic
* **useRealTimeData:** Hook for live feed of stocks and crypto
* **useTradingLogic:** Core calculations for floating P/L, average price, and preview lines

## ✨ Key Features

* **Real-Time Portfolio Updates:** Floating P/L recalculated for each tick
* **Dynamic Average Price Calculation:** Preview line on chart when adding to positions
* **Order Management:** Edit/Cancel limit orders directly from chart UI
* **Unit Tracking:** Each buy is tracked as a unique unit with individual P/L
* **Alerts Feed:** Bullish/Bearish scoring and multi-layer filtering
* **Responsive Layout:** Dark/light mode, sticky sidebars, mobile-friendly

## ⚠️ Current Limitations

* Trading currently only supports **buy/long positions**
* Backend persistence is functional but could be expanded with full user authentication
* Short-selling logic and multi-user collaboration not implemented yet

## 🛠️ Tech Stack

* **Frontend:** React 18, JavaScript / TypeScript (TradingChart)
* **State Management:** Context API (TradingContext, ThemeContext)
* **Visualization:** Lightweight Charts (financial chart), Recharts (analytics)
* **Styling:** Custom CSS + Tailwind
* **Infrastructure:** Vercel (frontend), Railway (backend), PostgreSQL (database)

## 📂 Project Structure

src/
├─ components/      # UI modules (TradingChart, Modals, MetaMaskButton)
├─ pages/           # Route-level pages (Dashboard, Alerts, Assets, Portfolio, News)
├─ services/        # Business logic (TradingContext, useRealTimeData, useTradingLogic)
├─ hooks/           # Custom hooks for monitoring and UI logic
└─ app/             # Global layout and routing

public/
├─ icons/           # Logos and icons
└─ images/
└─ screenshots/ # Screenshots for README and documentation

## 📸 Screenshots

![Dashboard](public/images/screenshots/dashboard-page-light.png)
![Market Chart Modals](public/images/screenshots/chart-modals-dark.png)
![Market Page](public/images/screenshots/market-page-light.png)
![News Page](public/images/screenshots/news-page-light.png)
![Portfolio Active Holding](public/images/screenshots/portfolio-page-active-holding-light.png)
![Portfolio Trade History](public/images/screenshots/portfolio-page-trade-history-dark.png)
![Alerts Page](public/images/screenshots/alerts-page-dark.png)

## ⚙️ Local Development

Frontend:
cd frontend
npm install
npm run dev

Backend:
cd backend
npm install
npm run dev

## 📈 Roadmap and Future Improvements

* **Short-selling logic:** Enable trading in short positions
* **Advanced Analytics:** Add RSI, Moving Averages, and other technical indicators
* **Database Integration:** Store user watchlists, positions, and settings
* **Authentication / Authorization:** Multi-user roles (admin, standard, read-only)
* **Collaborative Editing:** Multi-user support for portfolio management
* **Optimistic UI Updates:** Instant state updates with server confirmation

## 👤 Author

Peony 🌸
GitHub: [https://github.com/peony](https://github.com/peony)
