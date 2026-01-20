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

  // Stavy pro okna (podpora více oken najednou)
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

  // --- BUFFER PRO ZPRÁVY (SUCCESS MODAL) ---
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

  // --- ZAVÍRÁNÍ MANAŽERŮ ---
  const closeManager = useCallback((id) => {
    setOpenManagers(prev => prev.filter(m => m.id !== id));
  }, []);

  const closeAdvancedManager = useCallback((id) => {
    setOpenAdvancedManagers(prev => prev.filter(m => m.id !== id));
  }, []);

  // --- LOGIKA OBCHODOVÁNÍ (placeOrder řeší nákup/prodej a úpravu pozice) ---
  const { placeOrder, logTrade, tradeCounter } = useTradingLogic(
    setPositions, setHistory, triggerSuccess, closeManager
  );

  // --- AKTUALIZACE POZICE (Ukládání SL/TP levelů a dat z Advanced Modalu) ---
  const updatePosition = useCallback((updatedData) => {
    setPositions(prev => prev.map(p =>
      p.id === updatedData.id
        ? {
            ...p,
            ...updatedData, // Propíše levels, sl, tp, i případně změněnou cenu/množství
            levels: updatedData.levels || p.levels || []
          }
        : p
    ));
  }, []);

  // --- UZAVÍRÁNÍ POZIC ---
  const closePosition = useCallback((id, exitPrice, exitType = 'FULL_CLOSE', levelData = null) => {
    setPositions(prev => {
      const target = prev.find(p => p.id === id);
      if (!target) return prev;

      const amountToClose = levelData ? Math.min(levelData.amount, target.amount) : target.amount;
      const pnl = (Number(exitPrice) - target.price) * amountToClose;
      const timestamp = new Date().toISOString();

      logTrade({
        id: `${levelData ? 'part' : 'full'}_${id}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
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
        return prev.map(p => {
          if (p.id === id) {
            return {
              ...p,
              amount: remainingAmount,
              levels: p.levels ? p.levels.filter(l => l.id !== levelData?.id) : []
            };
          }
          return p;
        });
      }

      // Pokud je pozice zcela uzavřena
      setTimeout(() => {
        closeManager(id);
        closeAdvancedManager(id);
        setTimeout(() => isClosingRef.current.delete(id), 1000);
      }, 500);

      return prev.filter(p => p.id !== id);
    });
  }, [logTrade, triggerSuccess, closeManager, closeAdvancedManager]);

  useAutoMonitoring(positions, stocks, crypto, isClosingRef, closePosition);

  // Inicializace mock dat
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

  // Pomocná funkce pro otevření Advanced Modalu (použitá v returnu i v provideru)
  const openAdvanced = useCallback((pos, price) => {
    if (openAdvancedManagers.some(m => m.id === pos.id)) return;
    setOpenAdvancedManagers(prev => [...prev, {
      ...pos,
      currentPrice: price || pos.currentPrice,
      initialX: window.innerWidth / 2 - 150,
      initialY: 150 + (openAdvancedManagers.length * 20)
    }]);
  }, [openAdvancedManagers]);

  return (
    <TradingContext.Provider value={{
      positions, history, placeOrder, closePosition, isLoaded, updatePosition,
      openMarketOrder: (symbol, type, price) => setActiveMarketModal({ symbol, type, price }),

      // Otevírání Position Managera (Add / Close)
      openPositionManager: (pos, price) => {
        if (openManagers.some(m => m.id === pos.id)) return;
        setOpenManagers(prev => [...prev, {
          ...pos, currentPrice: price,
          initialX: window.innerWidth - 380 - (openManagers.length * 20),
          initialY: 80 + (openManagers.length * 20)
        }]);
      },

      // Otevírání Advanced Managera (Manage)
      openAdvancedManager: openAdvanced
    }}>
      {children}

      {/* MODÁLY PRO TRŽNÍ PŘÍKAZY */}
      {activeMarketModal && (
        <MarketOrderModal
          isOpen onClose={() => setActiveMarketModal(null)}
          onConfirm={(o) => { placeOrder(o); setActiveMarketModal(null); }}
          data={activeMarketModal}
        />
      )}

      {/* MODÁLY PRO ADD / REDUCE (Quick Actions) */}
      {openManagers.map(m => (
        <PositionManagerModal
          key={m.id}
          isOpen
          onClose={() => closeManager(m.id)}
          onConfirm={(updatedData) => {
            // Pokud byla provedena změna množství (nákup/prodej), použijeme placeOrder (v useTradingLogic)
            // Pokud jen změna SL/TP, použijeme updatePosition
            if (updatedData.operationType === 'ADD' || updatedData.operationType === 'REDUCE') {
              placeOrder(updatedData);
            } else {
              updatePosition(updatedData);
            }
          }}
          data={m}
          onOpenAdvanced={(tradeData) => {
            closeManager(tradeData.id); // Zavřít jednoduchý manager
            openAdvanced(tradeData, tradeData.currentPrice); // Otevřít advanced manager
          }}
        />
      ))}

      {/* MODÁLY PRO STRATEGII (Advanced Plan) */}
      {openAdvancedManagers.map(m => (
        <AdvancedPositionModal
          key={m.id}
          isOpen
          onClose={() => closeAdvancedManager(m.id)}
          onConfirm={(finalData) => {
            updatePosition(finalData); // Advanced modal vždy ukládá do pozice pole levels
            closeAdvancedManager(m.id);
          }}
          data={m}
        />
      ))}

      <TradeSuccessModal
        isOpen={showSuccess} onClose={() => setShowSuccess(false)} data={successData}
      />
    </TradingContext.Provider>
  );
};

export const useTrading = () => useContext(TradingContext);