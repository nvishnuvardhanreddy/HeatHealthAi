import React from 'react';
import { ShieldAlert, Cpu, Database, Activity } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-16 border-t border-slate-800/80 bg-dark-950/90 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-extrabold text-sm text-white tracking-tight">
                HEATHEALTH<span className="text-orange-400">AI</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400">
                PROTOTYPE
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Localized Human Thermal Stress Early Warning, Prediction, GIS & Location Alert Platform.
              Engineered for the Smart India Hackathon and climate disaster resilience research.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Biometeorological Models</h4>
            <ul className="space-y-1.5 text-slate-400 font-mono text-[11px]">
              <li>• Rothfusz NWS Heat Index (HI)</li>
              <li>• Stull & Liljegren Wet Bulb Globe Temp (WBGT)</li>
              <li>• Universal Thermal Climate Index (UTCI)</li>
              <li>• Multi-Factor Human Thermal Stress Index (HTSI)</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">System Architecture</h4>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">Django REST</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">React Vite</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">PostGIS / Shapely</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">Random Forest Regressor</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">Web Push VAPID</span>
            </div>
          </div>
        </div>

        {/* Mandatory Scientific Disclaimer */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-500/20 text-slate-300">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-300 text-xs mb-1">
                IMPORTANT SCIENTIFIC & OPERATIONAL DISCLAIMER
              </p>
              <p className="text-[11px] text-slate-400 leading-normal">
                This platform is an AI-generated decision-support estimate prototype. It does not provide medical diagnoses, guaranteed mortality predictions, or guaranteed heatwave predictions. The prototype model requires validation using historical local meteorological and health data before operational deployment. Demonstrated datasets are labeled as <span className="font-mono text-cyan-400 font-medium">DEMO DATA</span> or <span className="font-mono text-cyan-400 font-medium">LIVE WEATHER</span>.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/60 flex items-center justify-center text-xs text-slate-400 font-semibold tracking-wider">
          <p>Team Ground Zero</p>
        </div>
      </div>
    </footer>
  );
};
