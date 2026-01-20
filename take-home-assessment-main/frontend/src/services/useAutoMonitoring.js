import { useEffect, useRef } from 'react';

export const useAutoMonitoring = (positions, stocks, crypto, isClosingRef, closePosition) => {
  // Reference pro sledování právě probíhajících exekucí konkrétních levelů
  // Klíč bude "posId-levelId"
  const levelExecutionLockRef = useRef(new Set());

  useEffect(() => {
    if (!positions || positions.length === 0) return;

    const allAssets = [...(stocks || []), ...(crypto || [])];

    positions.forEach(pos => {
      // 1. Kontrola globálního zámku pozice (pokud se už zavírá celá, ignorujeme)
      if (isClosingRef.current.has(pos.id)) return;

      const asset = allAssets.find(a => a.symbol === pos.symbol);
      if (!asset) return;

      const currentPrice = asset.liveTicks?.length
        ? asset.liveTicks[asset.liveTicks.length - 1].close
        : asset.currentPrice;

      if (!currentPrice || currentPrice <= 0) return;

      // --- LOGIKA PRO MULTI-LEVELS ---
      if (pos.levels && pos.levels.length > 0) {
        pos.levels.forEach(level => {
          const lockKey = `${pos.id}-${level.id}`;

          // Pokud už tento level právě zpracováváme, přeskočíme ho
          if (levelExecutionLockRef.current.has(lockKey)) return;

          const isHit = level.type === 'SL'
            ? currentPrice <= (level.price + 0.00000001)
            : currentPrice >= (level.price - 0.00000001);

          if (isHit) {
            const type = level.type === 'SL' ? 'STOP_LOSS_LEVEL_HIT' : 'TAKE_PROFIT_LEVEL_HIT';

            // Zamkneme konkrétní level
            levelExecutionLockRef.current.add(lockKey);

            // Vyvoláme částečné uzavření
            closePosition(pos.id, currentPrice, type, level);

            // Po krátké prodlevě zámek uvolníme (React už by měl mít v tu chvíli stav bez tohoto levelu)
            setTimeout(() => {
              levelExecutionLockRef.current.delete(lockKey);
            }, 2000);
          }
        });
      }

      // --- ZPĚTNÁ KOMPATIBILITA / ZÁKLADNÍ SL/TP ---
      // Pokud bys stále používal staré jednoduché sl/tp parametry
      const isStopLossHit = pos.sl && currentPrice <= (pos.sl + 0.00000001);
      const isTakeProfitHit = pos.tp && currentPrice >= (pos.tp - 0.00000001);

      if (isStopLossHit || isTakeProfitHit) {
        const type = isStopLossHit ? 'STOP_LOSS_HIT' : 'TAKE_PROFIT_HIT';
        isClosingRef.current.add(pos.id);
        closePosition(pos.id, currentPrice, type);
      }
    });
  }, [stocks, crypto, positions, closePosition, isClosingRef]);
};