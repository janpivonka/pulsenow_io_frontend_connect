import React, { createContext, useContext, useState, useEffect } from 'react';
import generateMarketData from '../../../backend/mockData';
import { useRealTimeData } from './useRealTimeData';

// IMPORT NOVÝCH MODALŮ
import MarketOrderModal from '../components/MarketOrderModal';
import PositionManagerModal from '../components/PositionManagerModal';

const TradingContext = createContext();

export const TradingProvider = ({ children }) => {
  const [positions, setPositions] = useState([]);
  const [history, setHistory] = useState([]);
  const [cashBalance, setCashBalance] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // --- STAV PRO MODALY ---
  const [activeModal, setActiveModal] = useState(null); // 'MARKET' | 'MANAGE' | null
  const [modalData, setModalData] = useState(null);

  const { stocks, crypto } = useRealTimeData();

  // --- FUNKCE PRO OVLÁDÁNÍ MODALŮ ---
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

      // Voláme closePosition s unikátním ID pozice pro přesnost
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

  // --- LOGIKA PRO VÝKON PŘÍKAZŮ ---
  const placeOrder = (order) => {
    setPositions(prev => {
      // Hledáme existující pozici podle ID (pokud ho order má) nebo podle symbolu
      const existingIdx = prev.findIndex(p => (order.id && p.id === order.id) || p.symbol === order.symbol);
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
          // Logika pro odprodej / snížení pozice
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

      // Otevření úplně nové pozice
      if (order.type === 'buy' || order.type === 'sell') {
        return [...prev, {
          ...order,
          id: order.id || `manual_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString()
        }];
      }
      return prev;
    });
  };

  // --- OPRAVENÁ FUNKCE PRO UZAVŘENÍ POZICE ---
  const closePosition = (idOrSymbol, exitPrice = null, exitType = 'FULL_CLOSE') => {
    setPositions(prev => {
      // 1. Najdeme konkrétní pozici (podle ID nebo symbolu jako fallback)
      const posToClose = prev.find(p => p.id === idOrSymbol || p.symbol === idOrSymbol);

      if (!posToClose) return prev;

      // 2. Výpočet výsledku obchodu
      const price = exitPrice || posToClose.price;
      const realizedPL = (price - posToClose.price) * posToClose.amount;

      // 3. Zápis do historie
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

      // 4. Odstranění z aktivních pozic pomocí unikátního ID
      return prev.filter(pos => pos.id !== posToClose.id);
    });
  };

  return (
    <TradingContext.Provider value={{
      positions, history, placeOrder, closePosition, cashBalance, isLoaded,
      openMarketOrder, openPositionManager
    }}>
      {children}

      {/* GLOBÁLNÍ RENDEROVÁNÍ MODALŮ */}
      {activeModal === 'MARKET' && (
        <MarketOrderModal
          isOpen={true}
          onClose={closeModal}
          onConfirm={placeOrder}
          data={modalData}
        />
      )}
      {activeModal === 'MANAGE' && (
        <PositionManagerModal
          isOpen={true}
          onClose={closeModal}
          onConfirm={placeOrder}
          data={modalData}
        />
      )}
    </TradingContext.Provider>
  );
};

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (!context) throw new Error('useTrading must be used within a TradingProvider');
  return context;
};