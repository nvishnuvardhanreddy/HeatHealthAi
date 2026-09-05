import React from 'react';

export const Footer = () => {
  return (
    <footer className="mt-16 py-6 border-t border-[#4F3E1B] bg-[#080808] text-[#A39C8E] text-xs font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-[#F7F4EB] tracking-tight">
            HEATHEALTH<span className="text-[#D4AF37]">AI</span>
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#121110] text-[#F5C842] border border-[#4F3E1B]">
            V1.0
          </span>
        </div>
        <p className="text-[11px] text-[#A39C8E]">
          URBAN THERMAL INTELLIGENCE • HUMAN THERMAL STRESS EARLY WARNING & GIS DASHBOARD
        </p>
      </div>
    </footer>
  );
};
