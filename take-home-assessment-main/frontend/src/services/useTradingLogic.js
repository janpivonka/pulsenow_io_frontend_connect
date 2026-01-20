import { useRef } from 'react';

export const useTradingLogic = (setPositions, setHistory, triggerSuccess, closeManager) => {
  const tradeCounter = useRef(1);

  // --- LOG TRADE S ČASOVÝM ZÁMKEM PROTI DUPLICITÁM ---
  const logTrade = (entry) => {
    setHistory(prev => {
      // PŘÍSNÁ KONTROLA DUPLICIT:
      // Ignorujeme zápis, pokud už existuje záznam se stejným ID
      // NEBO pokud existuje záznam se stejným displayId a typem, který vznikl před méně než 500ms
      const isDuplicate = prev.some(h => {
        const isSameId = h.id === entry.id;
        const isRapidFire =
          h.displayId === entry.displayId &&
          h.type === entry.type &&
          Math.abs(new Date(h.timestamp) - new Date(entry.timestamp)) < 500;

        return isSameId || isRapidFire;
      });

      if (isDuplicate) return prev;
      return [entry, ...prev];
    });
  };

  const placeOrder = (order) => {
    // 1. SCÉNÁŘ: ÚPLNĚ NOVÁ JEDNOTKA (z Market Orderu)
    if (!order.id && order.type === 'buy') {
      const newId = tradeCounter.current++;
      const newPosition = {
        ...order,
        id: `pos_${Date.now()}_${newId}_${Math.random().toString(36).substr(2, 5)}`,
        tradeNumber: newId,
        amount: Number(order.amount),
        price: Number(order.price),
        timestamp: new Date().toISOString(),
        sl: order.sl || null,
        tp: order.tp || null
      };

      setPositions(prev => [...prev, newPosition]);
      triggerSuccess([{ symbol: order.symbol, pl: 0, type: `UNIT #${newId} OPENED` }]);
      return;
    }

    // 2. SCÉNÁŘ: SPRÁVA EXISTUJÍCÍ JEDNOTKY (z Managera)
    setPositions(prev => {
      const idx = prev.findIndex(p => p.id === order.id);
      if (idx === -1) return prev;

      const updated = [...prev];
      let curr = { ...updated[idx] };
      const tNum = curr.tradeNumber;
      const msgs = [];
      const now = new Date().toISOString();

      // A) PRIORITNÍ ODPRODEJ (SELL)
      const sellQty = Number(order.sellAmount || (order.type === 'sell' ? order.amount : 0));

      if (sellQty > 0) {
        const pnl = (Number(order.price) - curr.price) * sellQty;

        logTrade({
          // Unikátní ID posílené náhodným řetězcem
          id: `part_${curr.id}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          displayId: tNum,
          symbol: curr.symbol,
          amount: sellQty,
          buyPrice: curr.price,
          sellPrice: Number(order.price),
          pl: pnl,
          type: 'PARTIAL_CLOSE',
          timestamp: now
        });

        curr.amount -= sellQty;
        msgs.push({ symbol: curr.symbol, pl: pnl, type: `UNIT #${tNum} PARTIAL SELL` });
      }

      // B) NÁSLEDNÝ PŘÍKUP (BUY)
      const buyQty = Number(order.buyAmount || (order.type === 'buy' ? order.amount : 0));

      if (buyQty > 0) {
        // Přepočet průměrné ceny
        curr.price = ((curr.price * curr.amount) + (Number(order.price) * buyQty)) / (curr.amount + buyQty);
        curr.amount += buyQty;
        msgs.push({ symbol: curr.symbol, pl: 0, type: `UNIT #${tNum} INCREASED` });
      }

      // C) ZPRACOVÁNÍ OCHRAN (SL/TP)
      let riskChanged = false;
      if (order.sl !== undefined && order.sl !== curr.sl) {
        curr.sl = order.sl;
        riskChanged = true;
      }
      if (order.tp !== undefined && order.tp !== curr.tp) {
        curr.tp = order.tp;
        riskChanged = true;
      }

      if (riskChanged) {
        msgs.push({ symbol: curr.symbol, pl: 0, type: `UNIT #${tNum} RISK UPDATED` });
      }

      // FINÁLNÍ SESTAVENÍ (Ošetření float nepřesností u nuly)
      if (curr.amount <= 0.00000001) {
        updated.splice(idx, 1);
        setTimeout(() => closeManager(curr.id), 0);
      } else {
        updated[idx] = curr;
      }

      if (msgs.length > 0) {
        triggerSuccess(msgs);
      }

      return updated;
    });
  };

  return { placeOrder, logTrade, tradeCounter };
};