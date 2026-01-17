import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // 1. Zkontroluj localStorage
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';

    // 2. Pokud není v local, zkontroluj systémové nastavení
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = window.document.documentElement;

    // Klíčová oprava: Pokaždé vyčistit oba stavy a pak přidat ten správný
    if (isDark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark'; // Pomáhá prohlížeči s barvou scrollbarů
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme: () => setIsDark(prev => !prev) }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);