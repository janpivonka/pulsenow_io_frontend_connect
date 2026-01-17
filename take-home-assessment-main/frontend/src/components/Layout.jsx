import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import MetaMaskButton from './MetaMaskButton';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../services/ThemeContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const { isDark } = useTheme();

  const navigation = [
    { name: 'Dash', path: '/', icon: '📊' },
    { name: 'Portfolio', path: '/portfolio', icon: '💼' },
    { name: 'Market', path: '/assets', icon: '💰' },
    { name: 'News', path: '/news', icon: '📰' },
    { name: 'Alerts', path: '/alerts', icon: '🔔' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">

      {/* TOP NAVIGATION */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-[100] h-16 md:h-20 flex items-center transition-colors shadow-sm">
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 flex justify-between items-center gap-2">

          {/* Logo Section */}
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-900 dark:bg-blue-600 rounded-lg md:rounded-xl flex items-center justify-center text-white font-black italic text-base md:text-xl shadow-lg shrink-0">
              P
            </div>
            <div className="flex flex-col">
              <h1 className="text-base md:text-xl font-black tracking-tighter uppercase italic leading-none dark:text-white">
                Pulse.
              </h1>
              <p className="hidden sm:block text-[7px] md:text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-0.5 md:mt-1">
                Intelligence Engine
              </p>
            </div>
          </div>

          {/* Actions Section */}
          <div className="flex items-center gap-1.5 md:gap-4 shrink-0">
            <div className="scale-90 md:scale-100">
              <ThemeToggle />
            </div>

            <div className="hidden xs:block h-6 md:h-8 w-[1px] bg-slate-100 dark:bg-slate-800 mx-1" />

            <div className="shrink-0 scale-90 md:scale-100 origin-right">
              <MetaMaskButton />
            </div>
          </div>
        </div>
      </header>

      <div className="flex max-w-[1600px] mx-auto relative">

        {/* DESKTOP SIDEBAR - Skrytý pod 1024px */}
        <aside className="w-64 xl:w-72 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 min-h-[calc(100vh-5rem)] p-6 xl:p-8 hidden lg:block transition-colors sticky top-20 self-start">
          <nav>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6">Main Terminal</p>
            <ul className="space-y-2 xl:space-y-3">
              {navigation.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-4 px-5 py-3.5 rounded-2xl transition-all font-black text-[10px] xl:text-[11px] uppercase tracking-widest ${
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

        {/* MOBILE BOTTOM NAVIGATION */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 px-2 py-2 flex justify-between items-center z-[100] pb-6">
          {navigation.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all ${isActive ? 'scale-110' : 'opacity-60'}`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className={`text-[8px] font-black uppercase tracking-tighter ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0 p-4 md:p-8 lg:p-12 pb-24 lg:pb-12 overflow-x-hidden text-slate-900 dark:text-slate-100">
          <div className="max-w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;