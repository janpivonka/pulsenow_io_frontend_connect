import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import MetaMaskButton from './MetaMaskButton';
import ThemeToggle from './ThemeToggle'; // Nezapomeň vytvořit tento soubor
import { useTheme } from '../services/ThemeContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const { isDark } = useTheme();

  const navigation = [
    { name: 'Dashboard', path: '/', icon: '📊' },
    { name: 'Portfolio', path: '/portfolio', icon: '💼' },
    { name: 'Market', path: '/assets', icon: '💰' },
    { name: 'News', path: '/news', icon: '📰' },
    { name: 'Alerts', path: '/alerts', icon: '🔔' },
  ];

  return (
    // Změna: Dynamické pozadí pro celou obrazovku
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">

      {/* Top Navigation */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-50 h-20 flex items-center transition-colors shadow-sm">
        <div className="w-full max-w-[1600px] mx-auto px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-900 dark:bg-blue-600 rounded-xl flex items-center justify-center text-white font-black italic text-xl shadow-lg">P</div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none dark:text-white">Pulse.</h1>
              <p className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-1">Intelligence Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Přidáno: Přepínač témat */}
            <ThemeToggle />
            <div className="h-8 w-[1px] bg-slate-100 dark:bg-slate-800 mx-2" />
            <MetaMaskButton />
          </div>
        </div>
      </header>

      <div className="flex max-w-[1600px] mx-auto">
        {/* Sidebar */}
        <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 min-h-[calc(100vh-5rem)] p-8 hidden lg:block transition-colors">
          <nav>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6">Main Terminal</p>
            <ul className="space-y-3">
              {navigation.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-4 px-5 py-4 rounded-[1.25rem] transition-all font-black text-[11px] uppercase tracking-widest ${
                        isActive
                          ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xl shadow-slate-200 dark:shadow-none translate-x-1'
                          : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className={`text-lg ${isActive ? 'opacity-100' : 'opacity-40 filter grayscale dark:grayscale-0'}`}>{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Status Box */}
          <div className="mt-12 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 transition-colors">
             <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">Network Stable</span>
             </div>
             <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold leading-relaxed">
               System monitoring active. Real-time data feed live.
             </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-6 md:p-12 overflow-x-hidden text-slate-900 dark:text-slate-100">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;