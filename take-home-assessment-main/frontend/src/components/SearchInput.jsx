import React, { useState, useEffect } from 'react';

const SearchInput = ({ onSearch, placeholder = "Search..." }) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => onSearch(value), 300);
    return () => clearTimeout(timer);
  }, [value, onSearch]);

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm transition-all"
      />
      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">🔍</span>
    </div>
  );
};

export default SearchInput;