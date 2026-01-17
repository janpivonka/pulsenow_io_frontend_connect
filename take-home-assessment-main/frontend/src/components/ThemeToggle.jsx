import React from 'react';
import { useTheme } from '../services/ThemeContext';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        toggleTheme();
      }}
      className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-yellow-400 transition-all hover:scale-110 active:scale-95 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center min-w-[44px] min-h-[44px]"
      aria-label="Toggle Theme"
    >
      <span className="text-xl leading-none">
        {isDark ? '☀️' : '🌙'}
      </span>
    </button>
  );
};

// TENTO ŘÁDEK CHYBĚL:
export default ThemeToggle;