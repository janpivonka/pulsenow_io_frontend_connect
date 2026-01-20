import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import generateMarketData from '../../../backend/mockData';
import { useRealTimeData } from './useRealTimeData';
import { useTradingLogic } from './useTradingLogic';
import { useAutoMonitoring } from './useAutoMonitoring';

import MarketOrderModal from '../components/MarketOrderModal';
import PositionManagerModal from '../components/PositionManagerModal';
import TradeSuccessModal from '../components/TradeSuccessModal';

const TradingContext = createContext();

export const TradingProvider = ({ children }) => {
  const [positions, setPositions] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [openManagers, setOpenManagers] = useState([]);
  const [activeMarketModal, setActiveMarketModal] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState([]);

  const isClosingRef = useRef(new Set());
  const initializedRef = useRef(false);

  const pendingMessagesRef = useRef([]);
  const successTimeoutRef = useRef(null);

  const { stocks, crypto } = useRealTimeData();

  // --- BUFFER PRO ZPRÁVY (MODAL) ---
  const triggerSuccess = useCallback((msgs) => {
    const newMsgs = Array.isArray(msgs) ? msgs : [msgs];
    pendingMessagesRef.current = [...pendingMessagesRef.current, ...newMsgs];

    if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);

    successTimeoutRef.current = setTimeout(() => {
      const seen = new Set();
      const uniqueData = pendingMessagesRef.current.filter(item => {
        const key = `${item.symbol}-${item.type}-${item.pl}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setSuccessData(uniqueData);
      setShowSuccess(true);
      pendingMessagesRef.current = [];
      successTimeoutRef.current = null;
    }, 150);
  }, []);

  const closeManager = useCallback((id) => {
    setOpenManagers(prev => prev.filter(m => m.id !== id));
  }, []);

  const { placeOrder, logTrade, tradeCounter } = useTradingLogic(
    setPositions, setHistory, triggerSuccess, closeManager
  );

  // --- UZAVÍRÁNÍ POZIC (SL/TP/MANUAL) ---
  const closePosition = useCallback((id, exitPrice, exitType = 'FULL_CLOSE') => {
    setPositions(prev => {
      const target = prev.find(p => p.id === id);

      if (!target) {
        return prev;
      }

      const pnl = (Number(exitPrice) - target.price) * target.amount;
      const timestamp = new Date().toISOString();

      // Zápis do historie s unikátním ID (náhodný suffix)
      logTrade({
        id: `full_${id}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        displayId: target.tradeNumber,
        symbol: target.symbol,
        amount: target.amount,
        buyPrice: target.price,
        sellPrice: Number(exitPrice),
        pl: pnl,
        type: exitType,
        timestamp: timestamp
      });

      triggerSuccess({
        symbol: target.symbol,
        pl: pnl,
        type: `UNIT #${target.tradeNumber} ${exitType.replace(/_/g, ' ')}`
      });

      setTimeout(() => {
        closeManager(id);
        // Zámek uvolníme až s prodlevou, aby monitoring v tiku neposlal duplicitu
        setTimeout(() => isClosingRef.current.delete(id), 1000);
      }, 500);

      return prev.filter(p => p.id !== id);
    });
  }, [logTrade, triggerSuccess, closeManager]);

  // Automatické hlídání SL/TP
  useAutoMonitoring(positions, stocks, crypto, isClosingRef, closePosition);

  // Inicializace dat
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const data = generateMarketData();
    if (data?.portfolio?.assets) {
      setPositions(data.portfolio.assets.map(a => ({
        id: `mock_${a.assetId}_${tradeCounter.current}`,
        symbol: a.assetId,
        tradeNumber: tradeCounter.current++,
        amount: Number(a.quantity),
        price: Number(a.avgBuyPrice),
        sl: null,
        tp: null,
        timestamp: new Date().toISOString()
      })));
    }
    setIsLoaded(true);
  }, [tradeCounter]);

  return (
    <TradingContext.Provider value={{
      positions, history, placeOrder, closePosition, isLoaded,
      openMarketOrder: (symbol, type, price) => setActiveMarketModal({ symbol, type, price }),
      openPositionManager: (pos, price) => {
        if (openManagers.some(m => m.id === pos.id)) return;
        setOpenManagers(prev => [...prev, {
          ...pos, currentPrice: price,
          initialX: window.innerWidth - 380 - (openManagers.length * 20),
          initialY: 80 + (openManagers.length * 20)
        }]);
      }
    }}>
      {children}

      {activeMarketModal && (
        <MarketOrderModal
          isOpen onClose={() => setActiveMarketModal(null)}
          onConfirm={(o) => { placeOrder(o); setActiveMarketModal(null); }}
          data={activeMarketModal}
        />
      )}

      {openManagers.map(m => (
        <PositionManagerModal
          key={m.id} isOpen onClose={() => closeManager(m.id)}
          onConfirm={placeOrder} data={m}
        />
      ))}

      <TradeSuccessModal
        isOpen={showSuccess} onClose={() => setShowSuccess(false)} data={successData}
      />
    </TradingContext.Provider>
  );
};

export const useTrading = () => useContext(TradingContext);