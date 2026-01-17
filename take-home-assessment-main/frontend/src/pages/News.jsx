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

  const categories = useMemo(() => ['All', ...new Set(news.map(n => n.category))], [news]);

  const filteredNews = useMemo(() => {
    return news.filter(n => {
      const matchesCategory = activeCategory === 'All' || n.category === activeCategory;
      const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           n.summary.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [news, activeCategory, searchTerm]);

  const formatFullDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (!news.length) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-[0.3em] dark:text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6 md:space-y-10 p-2 md:p-12 max-w-7xl mx-auto text-slate-900 dark:text-slate-100 transition-colors">

      <PageHeader badge="Intelligence" title="News">
        <div className="mt-4 md:mt-0 w-full md:w-80">
          <SearchInput onSearch={setSearchTerm} placeholder="Search news..." />
        </div>
      </PageHeader>

      {/* CATEGORY FILTER - Scrollable na mobilu */}
      <div className="overflow-x-auto no-scrollbar -mx-2 px-2 md:mx-0">
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl w-fit border dark:border-slate-800">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
                activeCategory === cat ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-sm' : 'text-slate-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* FEATURED STORY - Upravená výška pro mobil */}
        {filteredNews.length > 0 && activeCategory === 'All' && !searchTerm && (
          <div
            onClick={() => setSelectedNews(filteredNews[0])}
            className="lg:col-span-12 group cursor-pointer bg-slate-900 rounded-[2rem] md:rounded-[3rem] overflow-hidden relative min-h-[300px] md:min-h-[450px] flex items-end p-6 md:p-12 border dark:border-slate-800"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-1" />
            <div className="relative z-10 space-y-3 md:space-y-4 max-w-3xl">
              <span className="px-3 py-1 bg-blue-600 text-[9px] font-black uppercase tracking-widest text-white rounded-lg">Featured</span>
              <h2 className="text-2xl md:text-5xl font-black text-white leading-tight italic truncate-3-lines">{filteredNews[0].title}</h2>
              <p className="hidden md:block text-slate-400 text-lg italic leading-relaxed">{filteredNews[0].summary}</p>
              <div className="flex items-center gap-4 text-slate-500 font-mono text-[10px] md:text-sm uppercase">
                <span className="text-blue-400 font-black">{filteredNews[0].source}</span>
                <span>{formatFullDate(filteredNews[0].timestamp)}</span>
              </div>
            </div>
          </div>
        )}

        {/* FEED GRID */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {filteredNews.slice((activeCategory === 'All' && !searchTerm) ? 1 : 0).map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedNews(item)}
              className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:scale-[1.01] transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{item.category}</span>
                <h3 className="text-lg font-black leading-tight italic dark:text-white line-clamp-2">{item.title}</h3>
                <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">{item.summary}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center text-[9px] font-black uppercase text-slate-400">
                <span>{item.source}</span>
                <span className="font-mono text-slate-300">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {selectedNews && <Modal item={selectedNews} type="news" onClose={() => setSelectedNews(null)} />}
    </div>
  );
};

export default News;