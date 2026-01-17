import React, { createContext, useContext, useState, useEffect } from 'react';
import generateMarketData from '../../../backend/mockData';
import { useRealTimeData } from './useRealTimeData';

const TradingContext = createContext();

export const TradingProvider = ({ children }) => {
  const [positions, setPositions] = useState([]);
  const [history, setHistory] = useState([]);
  const [cashBalance, setCashBalance] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const { stocks, crypto } = useRealTimeData();

  // --- AUTOMATICKÝ MONITOR SL / TP ---
  useEffect(() => {
    if (positions.length === 0) return;

    positions.forEach(pos => {
      const liveAsset = [...(stocks || []), ...(crypto || [])].find(a => a.symbol === pos.symbol);
      if (!liveAsset) return;

      const currentPrice = liveAsset.liveTicks?.length
        ? liveAsset.liveTicks[liveAsset.liveTicks.length - 1].close
        : liveAsset.currentPrice;

      if (!currentPrice) return;

      // Logika pro Take Profit
      if (pos.tp && currentPrice >= pos.tp) {
        closePosition(pos.symbol, currentPrice, 'TP_EXIT');
      }
      // Logika pro Stop Loss
      else if (pos.sl && currentPrice <= pos.sl) {
        closePosition(pos.symbol, currentPrice, 'SL_EXIT');
      }
    });
  }, [stocks, crypto, positions]);

  useEffect(() => {
    try {
      const data = generateMarketData();
      if (data?.portfolio?.assets) {
        const initialPositions = data.portfolio.assets.map(asset => ({
          id: `mock_${asset.assetId}`,
          symbol: asset.assetId,
          amount: asset.quantity,
          price: asset.avgBuyPrice,
          sl: null,
          tp: null,
          timestamp: new Date().toISOString(),
        }));
        setPositions(initialPositions);
        setCashBalance(data.portfolio.totalValue || 0);
      }
    } catch (error) {
      console.error("Chyba při inicializaci:", error);
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
          updated[existingIdx] = {
            ...current,
            amount: newAmount,
            price: newPrice,
            sl: order.sl || current.sl,
            tp: order.tp || current.tp
          };
        } else {
          const soldAmount = order.amount;
          const realizedPL = (order.price - current.price) * soldAmount;

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
            updated[existingIdx] = {
              ...current,
              amount: newAmount,
              sl: order.sl !== undefined ? order.sl : current.sl,
              tp: order.tp !== undefined ? order.tp : current.tp
            };
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

  const closePosition = (symbol, exitPrice = null, exitType = 'FULL_CLOSE') => {
    setPositions(prev => {
      const posToClose = prev.find(p => p.symbol === symbol);
      if (posToClose) {
        const price = exitPrice || posToClose.price;
        const realizedPL = (price - posToClose.price) * posToClose.amount;

        setHistory(h => [{
          id: Date.now(),
          symbol: posToClose.symbol,
          amount: posToClose.amount,
          buyPrice: posToClose.price,
          sellPrice: price,
          pl: realizedPL,
          type: exitType,
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