import React from 'react';

const PageHeader = ({ badge, title, children }) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
    <div>
      <p className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] mb-2">{badge}</p>
      <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">{title}</h1>
    </div>
    <div className="flex flex-col sm:flex-row gap-4">
      {children}
    </div>
  </div>
);

export default PageHeader;