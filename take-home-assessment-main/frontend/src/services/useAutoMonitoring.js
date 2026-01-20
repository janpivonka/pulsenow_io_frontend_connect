import { useEffect } from 'react';

export const useAutoMonitoring = (positions, stocks, crypto, isClosingRef, closePosition) => {
  useEffect(() => {
    if (!positions || positions.length === 0) return;

    const allAssets = [...(stocks || []), ...(crypto || [])];

    positions.forEach(pos => {
      // 1. Kontrola zámku - pokud se už zavírá, ignorujeme
      if (isClosingRef.current.has(pos.id)) return;

      const asset = allAssets.find(a => a.symbol === pos.symbol);
      if (!asset) return;

      const currentPrice = asset.liveTicks?.length
        ? asset.liveTicks[asset.liveTicks.length - 1].close
        : asset.currentPrice;

      if (!currentPrice || currentPrice <= 0) return;

      // 2. Definice hranic s malou tolerancí (prevence float chyb)
      const isStopLossHit = pos.sl && currentPrice <= (pos.sl + 0.00000001);
      const isTakeProfitHit = pos.tp && currentPrice >= (pos.tp - 0.00000001);

      if (isStopLossHit || isTakeProfitHit) {
        const type = isStopLossHit ? 'STOP_LOSS_HIT' : 'TAKE_PROFIT_HIT';

        // Okamžitě zamkneme v referenci, aby další proběhnutí useEffectu (které může přijít za 10ms)
        // tuto pozici už neřešilo.
        isClosingRef.current.add(pos.id);

        // Vyvoláme uzavření
        closePosition(pos.id, currentPrice, type);
      }
    });
    // Intervaly/Závislosti jsou v pořádku, React se postará o re-run při změně ceny
  }, [stocks, crypto, positions, closePosition, isClosingRef]);
};