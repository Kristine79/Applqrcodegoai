'use client';

import React from 'react';

export default function GlobalErrorDisplay() {
  return (
    <div 
      id="global-error-display" 
      style={{ display: 'none' }}
      className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-6 text-center"
    >
      <div className="max-w-2xl w-full bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
        <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/30">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">Критическая ошибка</h2>
        <p id="global-error-message" className="text-white/60 mb-6 text-sm font-medium"></p>
        <div className="mb-8 p-4 bg-black/40 rounded-xl border border-white/5 text-left overflow-x-auto">
          <p className="text-[10px] font-mono text-white/30 uppercase mb-2 tracking-widest">Technical Details</p>
          <pre id="global-error-stack" className="text-[10px] font-mono text-red-400/70 whitespace-pre-wrap break-all"></pre>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="w-full py-4 px-8 rounded-2xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
        >
          Перезагрузить страницу
        </button>
      </div>
    </div>
  );
}
