import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import generateMarketData from '../../../backend/mockData';
import { useRealTimeData } from './useRealTimeData';
import { useTradingLogic } from './useTradingLogic';
import { useAutoMonitoring } from './useAutoMonitoring';

import MarketOrderModal from '../components/MarketOrderModal';
import PositionManagerModal from '../components/PositionManagerModal';
import AdvancedPositionModal from '../components/AdvancedPositionModal';
import TradeSuccessModal from '../components/TradeSuccessModal';

const TradingContext = createContext();

export const TradingProvider = ({ children }) => {
  const [positions, setPositions] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [openManagers, setOpenManagers] = useState([]);
  const [openAdvancedManagers, setOpenAdvancedManagers] = useState([]);

  const [activeMarketModal, setActiveMarketModal] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState([]);

  const isClosingRef = useRef(new Set());
  const initializedRef = useRef(false);
  const pendingMessagesRef = useRef([]);
  const successTimeoutRef = useRef(null);

  const { stocks, crypto } = useRealTimeData();

  // --- HELPER PRO ZAVÍRÁNÍ ---
  const closeManager = useCallback((id) => {
    setOpenManagers(prev => prev.filter(m => m.id !== id));
  }, []);

  const closeAdvancedManager = useCallback((id) => {
    setOpenAdvancedManagers(prev => prev.filter(m => m.id !== id));
  }, []);

  // --- SPOUŠTĚČ ÚSPĚCHU (Success Toast) ---
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

      if (uniqueData.length > 0) {
        setSuccessData(uniqueData);
        setShowSuccess(true);
      }

      pendingMessagesRef.current = [];
      successTimeoutRef.current = null;
    }, 150);
  }, []);

  const { placeOrder, logTrade, tradeCounter } = useTradingLogic(
    setPositions, setHistory, triggerSuccess, closeManager
  );

  // updatePosition zůstává pro interní potřeby,
  // ale pro akce z modalu budeme preferovat placeOrder kvůli success oknu.
  const updatePosition = useCallback((updatedData) => {
    setPositions(prev => prev.map(p =>
      p.id === updatedData.id
        ? { ...p, ...updatedData, levels: updatedData.levels || p.levels || [] }
        : p
    ));
  }, []);

  const closePosition = useCallback((id, exitPrice, exitType = 'FULL_CLOSE', levelData = null) => {
    setPositions(prev => {
      const target = prev.find(p => p.id === id);
      if (!target) return prev;
      const amountToClose = levelData ? Math.min(levelData.amount, target.amount) : target.amount;
      const pnl = (Number(exitPrice) - target.price) * amountToClose;
      const timestamp = new Date().toISOString();

      logTrade({
        id: `${levelData ? 'part' : 'full'}_${id}_${Date.now()}`,
        displayId: target.tradeNumber,
        symbol: target.symbol,
        amount: amountToClose,
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

      const remainingAmount = target.amount - amountToClose;
      if (remainingAmount > 0.00000001) {
        return prev.map(p => (p.id === id ? {
          ...p,
          amount: remainingAmount,
          levels: p.levels ? p.levels.filter(l => l.id !== levelData?.id) : []
        } : p));
      }

      setTimeout(() => {
        closeManager(id);
        closeAdvancedManager(id);
        isClosingRef.current.delete(id);
      }, 500);

      return prev.filter(p => p.id !== id);
    });
  }, [logTrade, triggerSuccess, closeManager, closeAdvancedManager]);

  useAutoMonitoring(positions, stocks, crypto, isClosingRef, closePosition);

  const openPositionManager = useCallback((pos, price) => {
    setOpenAdvancedManagers(prev => prev.filter(m => m.id !== pos.id));
    setOpenManagers(prev => {
      if (prev.some(m => m.id === pos.id)) return prev;
      return [...prev, {
        ...pos,
        currentPrice: price,
        initialX: pos.initialX || (window.innerWidth - 380),
        initialY: pos.initialY || 80
      }];
    });
  }, []);

  const openAdvancedManager = useCallback((pos, price) => {
    setOpenManagers(prev => prev.filter(m => m.id !== pos.id));
    setOpenAdvancedManagers(prev => {
      if (prev.some(m => m.id === pos.id)) return prev;
      return [...prev, {
        ...pos,
        currentPrice: price || pos.currentPrice,
        initialX: pos.initialX || (window.innerWidth / 2 - 150),
        initialY: pos.initialY || 150
      }];
    });
  }, []);

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
        levels: [],
        timestamp: new Date().toISOString()
      })));
    }
    setIsLoaded(true);
  }, [tradeCounter]);

  return (
    <TradingContext.Provider value={{
      positions, history, placeOrder, closePosition, isLoaded, updatePosition,
      openMarketOrder: (symbol, type, price) => setActiveMarketModal({ symbol, type, price }),
      openPositionManager,
      openAdvancedManager
    }}>
      {children}

      {activeMarketModal && (
        <MarketOrderModal
          isOpen onClose={() => setActiveMarketModal(null)}
          onConfirm={(o) => { placeOrder(o); setActiveMarketModal(null); }}
          data={activeMarketModal}
        />
      )}

      {/* RENDER SIMPLE MANAGERS */}
      {openManagers.map(m => (
        <PositionManagerModal
          key={m.id}
          isOpen
          onClose={() => closeManager(m.id)}
          onConfirm={(updatedData) => {
            // ZMĚNA: Vše posíláme do placeOrder, aby proběhla kontrola změn
            // v useTradingLogic a vyvolal se Success Modal.
            placeOrder(updatedData);
          }}
          data={m}
          onOpenAdvanced={(tradeData) => openAdvancedManager(tradeData, tradeData.currentPrice)}
        />
      ))}

      {/* RENDER ADVANCED MANAGERS */}
      {openAdvancedManagers.map(m => (
        <AdvancedPositionModal
          key={m.id}
          isOpen
          onClose={() => closeAdvancedManager(m.id)}
          onConfirm={(finalData) => {
            // ZMĚNA: I zde používáme placeOrder pro vyvolání success hlášení
            placeOrder(finalData);
            closeAdvancedManager(m.id);
          }}
          data={m}
          onOpenSimple={(tradeData, price) => openPositionManager(tradeData, price)}
        />
      ))}

      <TradeSuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        data={successData}
      />
    </TradingContext.Provider>
  );
};

export const useTrading = () => useContext(TradingContext);