import React from 'react';

export const Footer = () => {
  return (
    <footer className="mt-16 py-6 border-t border-[#3B2D5A] bg-[#0A080F] text-[#A094C0] text-xs font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-[#EDE9FF] tracking-tight">
            HEATHEALTH<span className="text-[#A78BFA]">AI</span>
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#110D1A] text-[#C4B5FD] border border-[#3B2D5A]">
            V1.0
          </span>
        </div>
        <p className="text-[11px] text-[#A094C0] tracking-wider uppercase">
          Team Ground Zero
        </p>
      </div>
    </footer>
  );
};
