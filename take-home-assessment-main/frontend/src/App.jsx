import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Assets from './pages/Assets'
import News from './pages/News'
import Alerts from './pages/Alerts'
import Portfolio from './pages/Portfolio'
import Layout from './components/Layout'
import ScrollToTop from './components/ScrollToTop'
import { RealTimeDataProvider } from './services/useRealTimeData'
import { ThemeProvider } from './services/ThemeContext'
import { TradingProvider } from './services/TradingContext' // Import nového provideru

function App() {
  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <RealTimeDataProvider interval={1000}>
          <TradingProvider> {/* Obalíme routy trading providerem */}
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/assets" element={<Assets />} />
                <Route path="/news" element={<News />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/portfolio" element={<Portfolio />} />
              </Routes>
            </Layout>
          </TradingProvider>
        </RealTimeDataProvider>
      </Router>
    </ThemeProvider>
  )
}

export default App