import React, { createContext, useContext, useState } from 'react';

const TradingContext = createContext();

export const TradingProvider = ({ children }) => {
  // Inicializujeme prázdným polem manuálních pozic
  const [manualPositions, setManualPositions] = useState([]);

  const placeOrder = (order) => {
    setManualPositions(prev => {
      // Pokud už aktivum držíme, zprůměrujeme cenu (volitelné),
      // pro jednoduchost teď přidáme jako novou unikátní pozici
      const newPos = {
        ...order,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
      };
      return [newPos, ...prev];
    });
  };

  return (
    <TradingContext.Provider value={{ manualPositions, placeOrder }}>
      {children}
    </TradingContext.Provider>
  );
};

export const useTrading = () => useContext(TradingContext);