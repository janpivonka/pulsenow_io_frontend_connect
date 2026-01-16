import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import MetaMaskButton from './MetaMaskButton';

const Layout = ({ children }) => {
  const location = useLocation();
  // Nechal jsem sidebarOpen, ale pro tenhle styl vypadá skvěle fixní šířka
  const [sidebarOpen] = useState(true);

  const navigation = [
    { name: 'Dashboard', path: '/', icon: '📊' },
    { name: 'Portfolio', path: '/portfolio', icon: '💼' },
    { name: 'Market', path: '/assets', icon: '💰' },
    { name: 'News', path: '/news', icon: '📰' },
    { name: 'Alerts', path: '/alerts', icon: '🔔' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Navigation - Čistý, bílý, moderní */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 h-20 flex items-center">
        <div className="w-full max-w-[1600px] mx-auto px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black italic text-xl">P</div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none">Pulse.</h1>
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-1">Intelligence Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Tady by mohl být ten globální Search, pokud bys chtěl */}
            <MetaMaskButton />
          </div>
        </div>
      </header>

      <div className="flex max-w-[1600px] mx-auto">
        {/* Sidebar - Minimalistický styl */}
        <aside className="w-72 bg-white border-r border-slate-100 min-h-[calc(100vh-5rem)] p-8 hidden lg:block">
          <nav>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Main Terminal</p>
            <ul className="space-y-3">
              {navigation.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-4 px-5 py-4 rounded-[1.25rem] transition-all font-black text-[11px] uppercase tracking-widest ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 translate-x-1'
                          : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`text-lg ${isActive ? 'opacity-100' : 'opacity-40 filter grayscale'}`}>{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Status Box ve spodní části Sidebaru */}
          <div className="mt-12 p-6 bg-slate-50 rounded-3xl border border-slate-100">
             <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Network Stable</span>
             </div>
             <p className="text-[10px] text-slate-400 font-bold leading-relaxed">System monitoring active. Real-time data feed live.</p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-6 md:p-12 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;