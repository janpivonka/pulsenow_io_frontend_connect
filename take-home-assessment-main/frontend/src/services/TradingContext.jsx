import React, { createContext, useContext, useState, useEffect } from 'react';
import generateMarketData from '../../../backend/mockData';

const TradingContext = createContext();

export const TradingProvider = ({ children }) => {
  const [positions, setPositions] = useState([]);
  const [history, setHistory] = useState([]); // Historie uzavřených obchodů
  const [cashBalance, setCashBalance] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const data = generateMarketData();
      if (data && data.portfolio && data.portfolio.assets) {
        const initialPositions = data.portfolio.assets.map(asset => ({
          id: `mock_${asset.assetId}`,
          symbol: asset.assetId,
          amount: asset.quantity,
          price: asset.avgBuyPrice,
          timestamp: new Date().toISOString(),
        }));
        setPositions(initialPositions);
        setCashBalance(data.portfolio.totalValue || 0);
      }
    } catch (error) {
      console.error("Chyba při inicializaci TradingContext:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const placeOrder = (order) => {
    setPositions(prev => {
      const existingIdx = prev.findIndex(p => p.symbol === order.symbol);
      const updated = [...prev];

      if (existingIdx > -1) {
        const current = updated[existingIdx];
        if (order.type === 'buy') {
          const newAmount = current.amount + order.amount;
          const newPrice = ((current.price * current.amount) + (order.price * order.amount)) / newAmount;
          updated[existingIdx] = { ...current, amount: newAmount, price: newPrice };
        } else {
          // PRODEJ ČÁSTI POZICE (Partial Close)
          const soldAmount = order.amount;
          const realizedPL = (order.price - current.price) * soldAmount;

          // Uložit do historie
          setHistory(h => [{
            id: Date.now(),
            symbol: order.symbol,
            amount: soldAmount,
            buyPrice: current.price,
            sellPrice: order.price,
            pl: realizedPL,
            type: 'PARTIAL_CLOSE',
            timestamp: new Date().toISOString()
          }, ...h]);

          const newAmount = current.amount - soldAmount;
          if (newAmount <= 0) {
            updated.splice(existingIdx, 1);
          } else {
            updated[existingIdx] = { ...current, amount: newAmount };
          }
        }
        return updated;
      }

      if (order.type === 'buy') {
        return [...prev, {
          ...order,
          id: `manual_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString()
        }];
      }
      return prev;
    });
  };

  const closePosition = (symbol, exitPrice = null) => {
    setPositions(prev => {
      const posToClose = prev.find(p => p.symbol === symbol);
      if (posToClose) {
        const price = exitPrice || posToClose.price; // Fallback pokud nemáme live cenu
        const realizedPL = (price - posToClose.price) * posToClose.amount;

        setHistory(h => [{
          id: Date.now(),
          symbol: posToClose.symbol,
          amount: posToClose.amount,
          buyPrice: posToClose.price,
          sellPrice: price,
          pl: realizedPL,
          type: 'FULL_CLOSE',
          timestamp: new Date().toISOString()
        }, ...h]);
      }
      return prev.filter(pos => pos.symbol !== symbol);
    });
  };

  return (
    <TradingContext.Provider value={{ positions, history, placeOrder, closePosition, cashBalance, isLoaded }}>
      {children}
    </TradingContext.Provider>
  );
};

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (!context) throw new Error('useTrading must be used within a TradingProvider');
  return context;
};