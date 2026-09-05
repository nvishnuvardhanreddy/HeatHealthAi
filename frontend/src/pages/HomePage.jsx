import React from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  ShieldCheck,
  Compass,
  Activity,
  AlertTriangle,
  MapPin,
  Cpu,
  BarChart3,
  Users,
  ArrowRight
} from 'lucide-react';
import { RiskBadge } from '../components/StatusBadge';

export const HomePage = () => {
  return (
    <div className="space-y-12">
      {/* Hero Command Center Header */}
      <section className="relative overflow-hidden rounded-3xl glass-panel-glow p-8 md:p-14 border border-cyan-500/30">
        <div className="absolute -right-16 -top-16 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-96 h-96 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-xs font-mono text-cyan-300">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            Smart India Hackathon 2026 Prototype
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Localized Human Thermal Stress Early Warning & <span className="bg-gradient-to-r from-orange-400 via-red-400 to-purple-400 bg-clip-text text-transparent">GIS Alert Platform</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Temperature alone is insufficient to evaluate extreme heat exposure. HeatHealthAI dynamically integrates temperature, relative humidity, solar radiation, wind convection, and demographic vulnerability to calculate the <strong>Human Thermal Stress Index (HTSI)</strong>, delivering automated heat action plans, explainable machine learning predictions, and localized Web Push alerts.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              to="/dashboard"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-dark-950 font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition"
            >
              Open Climate Command Center
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/simulation"
              className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm flex items-center gap-2 transition"
            >
              What-If Heat Simulator
            </Link>

            <Link
              to="/register"
              className="px-6 py-3.5 rounded-xl bg-orange-950/40 hover:bg-orange-900/40 border border-orange-500/40 text-orange-300 font-semibold text-sm flex items-center gap-2 transition"
            >
              Government Authority Sign Up
            </Link>
          </div>
        </div>
      </section>

      {/* Real-Time Benchmark Snapshot */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase">Primary Focus Area</span>
            <MapPin className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white">Visakhapatnam</div>
          <div className="text-xs text-slate-400 font-mono mt-1">Andhra Pradesh, India</div>
        </div>

        <div className="glass-panel p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase">Peak Current HTSI</span>
            <Flame className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-xl font-extrabold font-mono text-purple-300 flex items-center gap-2">
            87.2 / 100
            <RiskBadge risk="EXTREME" size="sm" />
          </div>
          <div className="text-xs text-slate-400 font-mono mt-1">Gajuwaka Industrial Ward</div>
        </div>

        <div className="glass-panel p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase">Vulnerable Population</span>
            <Users className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white">191,000+</div>
          <div className="text-xs text-slate-400 font-mono mt-1">In Extreme/Very High Zones</div>
        </div>

        <div className="glass-panel p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase">AI Model Status</span>
            <Cpu className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400">Random Forest</div>
          <div className="text-xs text-slate-400 font-mono mt-1">R² 0.9926 | Validated Model</div>
        </div>
      </section>

      {/* Core Platform Pillars */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            End-to-End Thermal Intelligence Pipeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Engineered from biometeorological first principles to automated municipal disaster mitigation triggers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-orange-950/80 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Flame className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Biometeorological Physics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Computes Rothfusz Heat Index, Liljegren/Stull Wet Bulb Globe Temperature (WBGT), and Universal Thermal Climate Index (UTCI) to account for humidity and radiation coupling.
            </p>
          </div>

          <div className="glass-panel p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">GeoJSON Ward Precision</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              High-resolution polygon boundary mapping with Shapely point-in-polygon queries. Maps heat stress directly to municipal zones like Gajuwaka, Madhurawada, and MVP Colony.
            </p>
          </div>

          <div className="glass-panel p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Two-Stage Gov Verification</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strict government email domain verification (.gov.in, .nic.in, .ap.gov.in) followed by platform administrative review and comprehensive immutable audit logging.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
