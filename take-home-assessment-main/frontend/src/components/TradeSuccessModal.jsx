import React from 'react';
import { useNavigate } from 'react-router-dom';

const TradeSuccessModal = ({ isOpen, onClose, data }) => {
  const navigate = useNavigate();
  if (!isOpen || !data || data.length === 0) return null;

  // 1. Zjistíme, jestli jde o hromadnou akci (více symbolů nebo více pozic)
  const isBatch = data.length > 1;
  const uniqueSymbols = [...new Set(data.map(item => item.symbol))];
  const isMultipleAssets = uniqueSymbols.length > 1;

  // 2. Výpočet celkového P&L pro celý modal
  const totalPL = data.reduce((sum, item) => sum + (typeof item.pl === 'number' ? item.pl : 0), 0);
  const exitTrade = data.find(item => typeof item.pl === 'number' && item.pl !== 0);

  // Hlavní barva modalu (pokud je celkový zisk kladný, modal je zelený)
  const isPositive = totalPL >= 0;

  const getActionIcon = (type) => {
    const t = type.toUpperCase();
    if (t.includes('INCREASED') || t.includes('OPENED')) return '➕';
    if (t.includes('SELL') || t.includes('EXIT')) return '📉';
    if (t.includes('RISK') || t.includes('PROTECTION')) return '🛡️';
    return '✨';
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 text-center animate-in zoom-in-95 duration-300">

        {/* Dynamická hlavní ikona */}
        <div className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center ${isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
          <span className="text-2xl">
            {totalPL !== 0 ? (isPositive ? '💰' : '📉') : '✅'}
          </span>
        </div>

        <h3 className="text-xl font-black italic uppercase dark:text-white tracking-tighter mb-1">
          {isBatch ? 'Batch Update' : 'Update Confirmed'}
        </h3>

        {/* OPRAVENÝ PODNADPIS: Dynamicky zobrazí symbol nebo informaci o více aktivech */}
        <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mb-6">
          {isMultipleAssets
            ? `${uniqueSymbols.length} Assets Affected`
            : `${data[0]?.symbol} • ${isBatch ? 'Multiple Actions' : 'Position Managed'}`
          }
        </p>

        <div className="max-h-[280px] overflow-y-auto space-y-2 mb-8 text-left pr-1 custom-scrollbar">
          {data.map((item, idx) => {
            const hasPnL = typeof item.pl === 'number' && item.pl !== 0;
            return (
              <div key={idx} className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border dark:border-slate-800 flex justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm opacity-80">{getActionIcon(item.type)}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      {/* Přidán symbol k řádku, pokud jich je víc */}
                      {isMultipleAssets && (
                        <span className="text-[8px] font-black bg-slate-200 dark:bg-slate-800 px-1 rounded">
                          {item.symbol}
                        </span>
                      )}
                      <p className="text-[10px] font-black uppercase dark:text-white leading-tight tracking-tight">
                        {item.type}
                      </p>
                    </div>
                    <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                      {hasPnL ? 'Realized P&L' : 'Status Updated'}
                    </p>
                  </div>
                </div>

                {hasPnL && (
                  <div className={`text-sm font-mono font-black ${item.pl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {item.pl >= 0 ? '+' : ''}${item.pl.toFixed(2)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* SUMÁŘ: Pokud je tam více obchodů s P&L, ukážeme celkový výsledek */}
        {isBatch && totalPL !== 0 && (
          <div className="mb-6 py-2 border-t border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <span className="text-[9px] font-black uppercase text-slate-400">Total P&L Impact</span>
            <span className={`text-lg font-mono font-black ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
               {isPositive ? '+' : ''}${totalPL.toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={() => { navigate('/portfolio'); onClose(); }}
            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase italic tracking-tighter hover:scale-[1.02] transition-transform shadow-xl"
          >
            Go to Portfolio
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-[10px] font-black uppercase italic text-slate-400 hover:text-slate-600 transition-all tracking-tighter"
          >
            Close & Stay
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeSuccessModal;