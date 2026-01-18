import React, { createContext, useContext, useState, useEffect } from 'react';
import generateMarketData from '../../../backend/mockData';
import { useRealTimeData } from './useRealTimeData';

import MarketOrderModal from '../components/MarketOrderModal';
import PositionManagerModal from '../components/PositionManagerModal';
import TradeSuccessModal from '../components/TradeSuccessModal';

const TradingContext = createContext();

export const TradingProvider = ({ children }) => {
  const [positions, setPositions] = useState([]);
  const [history, setHistory] = useState([]);
  const [cashBalance, setCashBalance] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);

  // --- STAVY PRO SUCCESS MODAL (Nyní očekává pole objektů) ---
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState([]);

  const { stocks, crypto } = useRealTimeData();

  // Pomocná funkce pro spuštění success okna s jednou zprávou
  const triggerSuccess = (symbol, pl, type) => {
    setSuccessData([{ symbol, pl, type }]);
    setShowSuccess(true);
  };

  const openMarketOrder = (symbol, type, price) => {
    setModalData({ symbol, type, price });
    setActiveModal('MARKET');
  };

  const openPositionManager = (position, currentPrice) => {
    setModalData({ ...position, currentPrice });
    setActiveModal('MANAGE');
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalData(null);
  };

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

      if (pos.tp && currentPrice >= pos.tp) {
        closePosition(pos.id, currentPrice, 'TP_EXIT');
      }
      else if (pos.sl && currentPrice <= pos.sl) {
        closePosition(pos.id, currentPrice, 'SL_EXIT');
      }
    });
  }, [stocks, crypto, positions]);

  // --- INICIALIZACE MOCK DAT ---
  useEffect(() => {
    try {
      const data = generateMarketData();
      if (data?.portfolio?.assets) {
        const initialPositions = data.portfolio.assets.map(asset => ({
          id: `mock_${asset.assetId}_${Math.random().toString(36).substr(2, 5)}`,
          symbol: asset.assetId,
          amount: Number(asset.quantity),
          price: Number(asset.avgBuyPrice),
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

  // --- BEZPEČNÝ ZÁPIS DO HISTORIE ---
  const addTradeToHistory = (entry) => {
    if (!entry.amount || entry.amount <= 0) return;

    setHistory(prevHistory => {
      if (prevHistory.length > 0) {
        const last = prevHistory[0];
        const isDuplicate =
          last.symbol === entry.symbol &&
          last.type === entry.type &&
          Math.abs(last.pl - entry.pl) < 0.0001 &&
          (new Date(entry.timestamp) - new Date(last.timestamp) < 800);

        if (isDuplicate) return prevHistory;
      }
      return [entry, ...prevHistory];
    });
  };

  // --- LOGIKA PRO VÝKON PŘÍKAZŮ (S PODPOROU DÁVKOVÝCH ZPRÁV) ---
  const placeOrder = (order) => {
    setPositions(prev => {
      const existingIdx = prev.findIndex(p => (order.id && p.id === order.id) || p.symbol === order.symbol);
      const updated = [...prev];

      if (existingIdx > -1) {
        const current = updated[existingIdx];
        const batchMessages = [];

        // 1. Kontrola změny SL/TP (pokud se liší, přidáme zprávu)
        if (order.sl !== current.sl || order.tp !== current.tp) {
          batchMessages.push({ symbol: current.symbol, pl: null, type: 'RISK PROTECTION UPDATED' });
        }

        if (order.type === 'buy') {
          const addedAmount = Number(order.amount) || 0;
          if (addedAmount > 0) {
            const newAmount = Number(current.amount) + addedAmount;
            const newPrice = ((current.price * current.amount) + (Number(order.price) * addedAmount)) / newAmount;

            updated[existingIdx] = {
              ...current,
              amount: newAmount,
              price: newPrice,
              sl: order.sl !== undefined ? order.sl : current.sl,
              tp: order.tp !== undefined ? order.tp : current.tp
            };
            batchMessages.push({ symbol: current.symbol, pl: null, type: 'POSITION INCREASED' });
          } else {
            // Jen update parametrů
            updated[existingIdx] = {
              ...current,
              sl: order.sl !== undefined ? order.sl : current.sl,
              tp: order.tp !== undefined ? order.tp : current.tp
            };
            if (batchMessages.length === 0) batchMessages.push({ symbol: current.symbol, pl: null, type: 'ORDER MODIFIED' });
          }
        } else if (order.type === 'sell') {
          const soldAmount = Number(order.amount) || 0;

          if (soldAmount > 0) {
            const realizedPL = (Number(order.price) - Number(current.price)) * soldAmount;
            addTradeToHistory({
              id: `part-${Date.now()}`,
              symbol: current.symbol,
              amount: soldAmount,
              buyPrice: current.price,
              sellPrice: order.price,
              pl: realizedPL,
              type: 'PARTIAL_CLOSE',
              timestamp: new Date().toISOString()
            });
            batchMessages.push({ symbol: current.symbol, pl: realizedPL, type: 'PARTIAL SELL EXECUTED' });
          } else {
            if (batchMessages.length === 0) batchMessages.push({ symbol: current.symbol, pl: null, type: 'ORDER MODIFIED' });
          }

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

        // Pokud byly nějaké změny, vyvolej modal se všemi nasbíranými zprávami
        if (batchMessages.length > 0) {
          setSuccessData(batchMessages);
          setShowSuccess(true);
        }
        return updated;
      }

      // NOVÁ POZICE
      if (order.type === 'buy' && Number(order.amount) > 0) {
        const newPos = {
          ...order,
          amount: Number(order.amount),
          price: Number(order.price),
          id: order.id || `manual_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString()
        };
        triggerSuccess(order.symbol, null, 'NEW POSITION OPENED');
        return [...prev, newPos];
      }
      return prev;
    });
  };

  const closePosition = (idOrSymbol, exitPrice = null, exitType = 'FULL_CLOSE') => {
    setPositions(prev => {
      const posToClose = prev.find(p => p.id === idOrSymbol || p.symbol === idOrSymbol);
      if (!posToClose) return prev;

      const price = Number(exitPrice) || posToClose.price;
      const amount = Number(posToClose.amount);
      const realizedPL = (price - posToClose.price) * amount;

      addTradeToHistory({
        id: `full-${Date.now()}`,
        symbol: posToClose.symbol,
        amount: amount,
        buyPrice: posToClose.price,
        sellPrice: price,
        pl: realizedPL,
        type: exitType,
        timestamp: new Date().toISOString()
      });

      triggerSuccess(posToClose.symbol, realizedPL, exitType.replace('_', ' '));

      return prev.filter(pos => pos.id !== posToClose.id);
    });
  };

  return (
    <TradingContext.Provider value={{
      positions, history, placeOrder, closePosition, cashBalance, isLoaded,
      openMarketOrder, openPositionManager
    }}>
      {children}

      {activeModal === 'MARKET' && (
        <MarketOrderModal isOpen={true} onClose={closeModal} onConfirm={placeOrder} data={modalData} />
      )}

      {activeModal === 'MANAGE' && (
        <PositionManagerModal isOpen={true} onClose={closeModal} onConfirm={(order) => { placeOrder(order); closeModal(); }} data={modalData} />
      )}

      <TradeSuccessModal
        isOpen={showSuccess}
        onClose={() => { setShowSuccess(false); setSuccessData([]); }}
        data={successData}
      />
    </TradingContext.Provider>
  );
};

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (!context) throw new Error('useTrading must be used within a TradingProvider');
  return context;
};