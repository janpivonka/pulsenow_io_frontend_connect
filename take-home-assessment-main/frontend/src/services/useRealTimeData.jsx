import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import generateMarketData from '../../../backend/mockData';

const RealTimeDataContext = createContext(undefined);

export const RealTimeDataProvider = ({ children }) => {
  const initialData = useMemo(() => {
    const raw = generateMarketData();

    const processDaily = (asset) => {
      return asset.priceHistory.map((p, i, arr) => {
        const prevPrice = i > 0 ? arr[i-1].price : p.price * 0.99;
        return {
          time: Math.floor(new Date(p.timestamp).getTime() / 1000),
          open: prevPrice,
          high: Math.max(prevPrice, p.price) * 1.002,
          low: Math.min(prevPrice, p.price) * 0.998,
          close: p.price,
          volume: p.volume
        };
      });
    };

    // Funkce pro vytvoření startovní historie pro 1s graf
    const generateFakeLiveHistory = (currentPrice) => {
      const history = [];
      const now = Math.floor(Date.now() / 1000);
      let lastPrice = currentPrice;

      for (let i = 100; i >= 0; i--) {
        const change = (Math.random() - 0.5) * (lastPrice * 0.002);
        const open = lastPrice;
        const close = Number((lastPrice + change).toFixed(2));
        history.push({
          time: now - i,
          open: open,
          high: Math.max(open, close) + 0.05,
          low: Math.min(open, close) - 0.05,
          close: close,
          volume: Math.floor(Math.random() * 1000) + 500
        });
        lastPrice = close;
      }
      return history;
    };

    return {
      ...raw,
      stocks: raw.stocks.map(s => ({
        ...s,
        dailyHistory: processDaily(s),
        liveTicks: generateFakeLiveHistory(s.currentPrice)
      })),
      cryptocurrencies: raw.cryptocurrencies.map(c => ({
        ...c,
        dailyHistory: processDaily(c),
        liveTicks: generateFakeLiveHistory(c.currentPrice)
      }))
    };
  }, []);

  const [data, setData] = useState(initialData);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const update = (asset) => {
          const change = (Math.random() - 0.5) * (asset.currentPrice * 0.002);
          const newPrice = Number((asset.currentPrice + change).toFixed(2));
          const newVolume = Math.floor(Math.random() * 5000) + 1000;

          const newTick = {
            time: Math.floor(Date.now() / 1000),
            open: asset.currentPrice,
            high: Math.max(asset.currentPrice, newPrice) + 0.05,
            low: Math.min(asset.currentPrice, newPrice) - 0.05,
            close: newPrice,
            volume: newVolume
          };

          return {
            ...asset,
            currentPrice: newPrice,
            volume: asset.volume + newVolume,
            liveTicks: [...asset.liveTicks, newTick].slice(-150)
          };
        };

        return {
          ...prev,
          stocks: prev.stocks.map(update),
          cryptocurrencies: prev.cryptocurrencies.map(update)
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <RealTimeDataContext.Provider value={{ stocks: data.stocks, crypto: data.cryptocurrencies }}>
      {children}
    </RealTimeDataContext.Provider>
  );
};

export const useRealTimeData = () => useContext(RealTimeDataContext);