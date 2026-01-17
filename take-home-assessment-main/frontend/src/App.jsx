import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Assets from './pages/Assets'
import News from './pages/News'
import Alerts from './pages/Alerts'
import Portfolio from './pages/Portfolio'
import Layout from './components/Layout'
import ScrollToTop from './components/ScrollToTop' // Importuj novou komponentu
import { RealTimeDataProvider } from './services/useRealTimeData'

function App() {
  return (
    <Router>
      {/* ScrollToTop musí být pod Routerem, aby mohl sledovat změny URL */}
      <ScrollToTop />

      <RealTimeDataProvider interval={1000}>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/news" element={<News />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/portfolio" element={<Portfolio />} />
          </Routes>
        </Layout>
      </RealTimeDataProvider>
    </Router>
  )
}

export default App