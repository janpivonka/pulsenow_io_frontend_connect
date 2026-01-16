import React, { useState, useMemo, useEffect } from 'react';
import Modal from '../components/Modal';
import { useRealTimeData } from '../services/useRealTimeData';

// Hook pro debounce, aby vyhledávání nebrzdilo aplikaci
const useDebounce = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
};

const News = () => {
  const { news = [] } = useRealTimeData();
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedNews, setSelectedNews] = useState(null);

  const debouncedSearch = useDebounce(search);

  const categories = useMemo(() => {
    const cats = ['All', ...new Set(news.map(n => n.category))];
    return cats;
  }, [news]);

  // KOMBINOVANÁ FILTRACE: Kategorie + Vyhledávání
  const filteredNews = useMemo(() => {
    let result = news;

    if (activeCategory !== 'All') {
      result = result.filter(n => n.category === activeCategory);
    }

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.summary.toLowerCase().includes(q) ||
        n.source.toLowerCase().includes(q)
      );
    }

    return result;
  }, [news, activeCategory, debouncedSearch]);

  const formatFullDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (!news.length) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-[0.3em]">Loading Intelligence...</div>;

  return (
    <div className="space-y-10 p-4 md:p-12 max-w-7xl mx-auto text-slate-900">

      {/* HEADER SECTION */}
      <header className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] mb-2">Market Intelligence</p>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter">News Stream</h1>
          </div>

          {/* SEARCH BOX */}
          <div className="relative w-full md:w-80">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search news..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm transition-all"
            />
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">🔍</span>
          </div>
        </div>

        {/* CATEGORY FILTER */}
        <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] overflow-x-auto no-scrollbar gap-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setSearch(''); }} // Reset vyhledávání při změně kategorie
              className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* NEWS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* FEATURED NEWS - Zobrazuje se jen když se nevyhledává a je aktivní 'All' */}
        {filteredNews.length > 0 && activeCategory === 'All' && !debouncedSearch && (
          <div
            onClick={() => { setSelectedNews(filteredNews[0]); }}
            className="lg:col-span-12 group cursor-pointer bg-slate-900 rounded-[3rem] overflow-hidden relative min-h-[400px] flex items-end p-8 md:p-12 transition-transform active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent z-1" />
            <div className="absolute top-0 right-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

            <div className="relative z-10 space-y-4 max-w-3xl">
              <span className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                Featured Story
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tighter group-hover:text-blue-400 transition-colors">
                {filteredNews[0].title}
              </h2>
              <p className="text-slate-400 text-lg md:text-xl font-medium line-clamp-2 italic">
                {filteredNews[0].summary}
              </p>
              <div className="pt-4 flex items-center gap-4 text-slate-500 font-mono text-sm uppercase">
                <span className="font-black text-blue-500">{filteredNews[0].source}</span>
                <span>•</span>
                <span>{formatFullDate(filteredNews[0].timestamp)}</span>
              </div>
            </div>
          </div>
        )}

        {/* SEZNAM OSTATNÍCH ZPRÁV */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Pokud nevyhledáváme v 'All', skipneme první zprávu (je v banneru). Jinak ukážeme vše. */}
          {filteredNews.slice((activeCategory === 'All' && !debouncedSearch) ? 1 : 0).map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedNews(item)}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest px-3 py-1 bg-blue-50 rounded-lg">
                    {item.category}
                  </span>
                </div>
                <h3 className="text-xl font-black leading-tight tracking-tight group-hover:text-blue-600">
                  {item.title}
                </h3>
                <p className="text-slate-500 text-sm line-clamp-3 font-medium leading-relaxed">
                  {item.summary}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-300 uppercase">{item.source}</span>
                <span className="text-[10px] font-bold text-slate-400 font-mono">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {/* EMPTY STATE */}
          {filteredNews.length === 0 && (
            <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No news found for "{search}"</p>
            </div>
          )}
        </div>
      </div>

      {selectedNews && (
        <Modal
          item={selectedNews}
          type="news"
          onClose={() => setSelectedNews(null)}
        />
      )}
    </div>
  );
};

export default News;