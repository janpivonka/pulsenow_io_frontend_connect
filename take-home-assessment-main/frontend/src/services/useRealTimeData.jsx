import { useState, useEffect, createContext, useContext } from 'react';
import generateMarketData from '../../../backend/mockData';

const RealTimeDataContext = createContext(null);

export const RealTimeDataProvider = ({ children, interval = 1000 }) => {
  const [stocks, setStocks] = useState([]);
  const [crypto, setCrypto] = useState([]);

  const getLatestValues = (items) =>
    items.map(item => {
      const latest = item.priceHistory[item.priceHistory.length - 1];
      const prev = item.priceHistory[item.priceHistory.length - 2] || latest;
      const changeAmount = latest.price - prev.price;
      const changePercent = (changeAmount / prev.price) * 100;

      return {
        ...item,
        currentPrice: latest.price,
        volume: latest.volume,
        changeAmount,
        changePercent,
      };
    });

  useEffect(() => {
    const data = generateMarketData();
    setStocks(getLatestValues(data.stocks));
    setCrypto(getLatestValues(data.cryptocurrencies));

    const timer = setInterval(() => {
      const updatedData = generateMarketData();
      setStocks(getLatestValues(updatedData.stocks));
      setCrypto(getLatestValues(updatedData.cryptocurrencies));
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return (
    <RealTimeDataContext.Provider value={{ stocks, crypto }}>
      {children}
    </RealTimeDataContext.Provider>
  );
};

export const useRealTimeData = () => {
  const context = useContext(RealTimeDataContext);
  if (!context) throw new Error('useRealTimeData must be used within RealTimeDataProvider');
  return context;
};
