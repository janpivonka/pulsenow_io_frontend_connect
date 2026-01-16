import React, { useState, useMemo } from 'react';
import Modal from '../components/Modal';
import { useRealTimeData } from '../services/useRealTimeData';

const News = () => {
  const { news = [] } = useRealTimeData();
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedNews, setSelectedNews] = useState(null);

  // Kategorie pro filtr (unikátní kategorie z dat + 'All')
  const categories = useMemo(() => {
    const cats = ['All', ...new Set(news.map(n => n.category))];
    return cats;
  }, [news]);

  // Filtrování zpráv
  const filteredNews = useMemo(() => {
    if (activeCategory === 'All') return news;
    return news.filter(n => n.category === activeCategory);
  }, [news, activeCategory]);

  const formatFullDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!news.length) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-[0.3em]">Loading Intelligence...</div>;

  return (
    <div className="space-y-10 p-4 md:p-12 max-w-7xl mx-auto text-slate-900">
      
      {/* HEADER SECTION */}
      <header className="space-y-6">
        <div>
          <p className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] mb-2">Market Intelligence</p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">News Stream</h1>
        </div>

        {/* CATEGORY FILTER - Horizontální scroll na mobilu */}
        <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] overflow-x-auto no-scrollbar gap-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
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
        
        {/* HLAVNÍ ZPRÁVA (Featured News) - První z filtrovaných */}
        {filteredNews.length > 0 && activeCategory === 'All' && (
          <div 
            onClick={() => { setSelectedNews(filteredNews[0]); }}
            className="lg:col-span-12 group cursor-pointer bg-slate-900 rounded-[3rem] overflow-hidden relative min-h-[400px] flex items-end p-8 md:p-12 transition-transform active:scale-[0.98]"
          >
            {/* Dekorativní gradient na pozadí */}
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
          {filteredNews.slice(activeCategory === 'All' ? 1 : 0).map((item) => (
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
        </div>
      </div>

      {/* MODAL PRO DETAIL ZPRÁVY */}
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