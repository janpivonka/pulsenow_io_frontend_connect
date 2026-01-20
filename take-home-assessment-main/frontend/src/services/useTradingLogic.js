import { useRef } from 'react';

export const useTradingLogic = (setPositions, setHistory, triggerSuccess, closeManager) => {
  const tradeCounter = useRef(1);

  const logTrade = (entry) => {
    setHistory(prev => {
      const isDuplicate = prev.some(h =>
        h.id === entry.id ||
        (h.displayId === entry.displayId && h.type === entry.type && Math.abs(new Date(h.timestamp) - new Date(entry.timestamp)) < 500)
      );
      if (isDuplicate) return prev;
      return [entry, ...prev];
    });
  };

  const placeOrder = (order) => {
    // 1. SCÉNÁŘ: NOVÁ JEDNOTKA
    if (!order.id && (order.type === 'buy' || order.operationType === 'ADD')) {
      const newId = tradeCounter.current++;
      const newPosition = {
        ...order,
        id: `pos_${Date.now()}_${newId}_${Math.random().toString(36).substr(2, 5)}`,
        tradeNumber: newId,
        amount: Number(order.amount),
        price: Number(order.price),
        timestamp: new Date().toISOString(),
        sl: order.sl ? Number(order.sl) : null,
        tp: order.tp ? Number(order.tp) : null,
        levels: order.levels || []
      };
      setPositions(prev => [...prev, newPosition]);
      triggerSuccess([{ symbol: order.symbol, pl: 0, type: `UNIT #${newId} OPENED` }]);
      return;
    }

    // 2. SCÉNÁŘ: SPRÁVA EXISTUJÍCÍ JEDNOTKY
    setPositions(prev => {
      const idx = prev.findIndex(p => p.id === order.id);
      if (idx === -1) return prev;

      const updated = [...prev];
      let curr = { ...updated[idx] };
      const tNum = curr.tradeNumber;
      const msgs = [];
      const now = new Date().toISOString();

      // A) OBCHODNÍ OPERACE (REDUCE/ADD)
      if (order.operationType === 'REDUCE' && Number(order.amount) > 0) {
        const sellQty = Number(order.amount);
        const pnl = (Number(order.price) - curr.price) * sellQty;
        logTrade({
          id: `part_${curr.id}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          displayId: tNum, symbol: curr.symbol, amount: sellQty,
          buyPrice: curr.price, sellPrice: Number(order.price), pl: pnl,
          type: 'PARTIAL_CLOSE', timestamp: now
        });
        curr.amount -= sellQty;
        msgs.push({ symbol: curr.symbol, pl: pnl, type: `UNIT #${tNum} PARTIAL SELL` });
      }
      else if (order.operationType === 'ADD' && Number(order.amount) > 0) {
        const buyQty = Number(order.amount);
        curr.price = ((curr.price * curr.amount) + (Number(order.price) * buyQty)) / (curr.amount + buyQty);
        curr.amount += buyQty;
        msgs.push({ symbol: curr.symbol, pl: 0, type: `UNIT #${tNum} INCREASED` });
      }

      // B) ZPRACOVÁNÍ OCHRAN (SL/TP) - NEPRŮSTŘELNÁ DETEKCE
      let riskChanged = false;

      // Funkce pro sjednocení formátu (vše na číslo nebo null)
      const normalize = (val) => (val === '' || val === null || val === undefined) ? null : Number(val);

      const oldSl = normalize(curr.sl);
      const newSl = normalize(order.sl);
      const oldTp = normalize(curr.tp);
      const newTp = normalize(order.tp);

      // Porovnání normalizovaných hodnot
      if (newSl !== oldSl) {
        curr.sl = newSl;
        riskChanged = true;
      }
      if (newTp !== oldTp) {
        curr.tp = newTp;
        riskChanged = true;
      }

      // Synchronizace hladin pro graf
      if (order.levels) {
        curr.levels = order.levels;
      }

      // POKUD SE ZMĚNILO SL/TP, VYVOLÁME ZPRÁVU
      if (riskChanged) {
        msgs.push({
          symbol: curr.symbol,
          pl: 0,
          type: `UNIT #${tNum} RISK UPDATED`
        });
      }

      // C) FINÁLNÍ SESTAVENÍ
      if (curr.amount <= 0.00000001) {
        updated.splice(idx, 1);
        setTimeout(() => closeManager(curr.id), 0);
      } else {
        updated[idx] = curr;
      }

      // Pokud máme jakékoliv zprávy, odpálíme success modal
      if (msgs.length > 0) {
        triggerSuccess([...msgs]);
      }

      return updated;
    });
  };

  return { placeOrder, logTrade, tradeCounter };
};