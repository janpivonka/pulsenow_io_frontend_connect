import React, { useState, useMemo } from 'react';
import Modal from '../components/Modal';
import { useRealTimeData } from '../services/useRealTimeData';
import PageHeader from '../components/PageHeader';
import SearchInput from '../components/SearchInput';

const News = () => {
  const { news = [] } = useRealTimeData();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNews, setSelectedNews] = useState(null);

  // KATEGORIE - Dynamicky z dat
  const categories = useMemo(() => {
    return ['All', ...new Set(news.map(n => n.category))];
  }, [news]);

  // FILTRACE - Kategorie + Search
  const filteredNews = useMemo(() => {
    return news.filter(n => {
      const matchesCategory = activeCategory === 'All' || n.category === activeCategory;
      const matchesSearch =
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.source.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [news, activeCategory, searchTerm]);

  const formatFullDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (!news.length) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-[0.3em] dark:text-slate-500 transition-colors">Loading Intelligence...</div>;

  return (
    <div className="space-y-10 p-4 md:p-12 max-w-7xl mx-auto text-slate-900 dark:text-slate-100 transition-colors duration-300">

      {/* HEADER S INTEGROVANÝM VYHLEDÁVÁNÍM */}
      <PageHeader badge="Market Intelligence" title="News Stream">
        <SearchInput onSearch={setSearchTerm} placeholder="Search news..." />
      </PageHeader>

      {/* CATEGORY FILTER */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-[1.5rem] overflow-x-auto no-scrollbar gap-1 w-fit border border-transparent dark:border-slate-800 transition-colors">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); }}
            className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* NEWS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* FEATURED STORY - Ukazuje se pouze v 'All' a když se nevyhledává */}
        {filteredNews.length > 0 && activeCategory === 'All' && !searchTerm && (
          <div
            onClick={() => setSelectedNews(filteredNews[0])}
            className="lg:col-span-12 group cursor-pointer bg-slate-900 dark:bg-slate-950 rounded-[3rem] overflow-hidden relative min-h-[400px] flex items-end p-8 md:p-12 transition-transform active:scale-[0.98] border border-transparent dark:border-slate-800"
          >
            {/* Gradient se v dark mode přizpůsobí sytější černé */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 dark:via-slate-950/80 to-transparent z-1" />

            <div className="relative z-10 space-y-4 max-w-3xl">
              <span className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">Featured Story</span>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tighter group-hover:text-blue-400 transition-colors">
                {filteredNews[0].title}
              </h2>
              <p className="text-slate-400 dark:text-slate-400 text-lg md:text-xl font-medium line-clamp-2 italic leading-relaxed">
                {filteredNews[0].summary}
              </p>
              <div className="pt-4 flex items-center gap-4 text-slate-500 dark:text-slate-500 font-mono text-sm uppercase">
                <span className="font-black text-blue-500 dark:text-blue-400">{filteredNews[0].source}</span>
                <span>•</span>
                <span>{formatFullDate(filteredNews[0].timestamp)}</span>
              </div>
            </div>
          </div>
        )}

        {/* OSTATNÍ ZPRÁVY */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredNews.slice((activeCategory === 'All' && !searchTerm) ? 1 : 0).map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedNews(item)}
              className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-4">
                <span className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg w-fit block transition-colors">
                  {item.category}
                </span>
                <h3 className="text-xl font-black leading-tight tracking-tight dark:text-white">
                  {item.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3 font-medium leading-relaxed">
                  {item.summary}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center transition-colors">
                <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase">
                  {item.source}
                </span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {/* EMPTY STATE */}
          {filteredNews.length === 0 && (
            <div className="col-span-full py-20 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 transition-colors">
              <p className="text-slate-400 dark:text-slate-600 font-black uppercase tracking-widest text-sm">
                No news found for "{searchTerm}"
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedNews && <Modal item={selectedNews} type="news" onClose={() => setSelectedNews(null)} />}
    </div>
  );
};

export default News;