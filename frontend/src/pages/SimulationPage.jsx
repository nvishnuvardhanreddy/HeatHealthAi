import React, { useState } from 'react';
import { Play, Sparkles, Sliders, Activity, ThermometerSun, Droplets, Wind, Sun } from 'lucide-react';
import { simulationService } from '../services/api';
import { RiskBadge } from '../components/StatusBadge';

export function SimulationPage() {
  const [form, setForm] = useState({
    temperature: 42,
    humidity: 75,
    wind_speed: 1.2,
    solar_radiation: 900,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const run = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await simulationService.run(form);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Simulation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-4xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
            Decision Support Sandbox
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-cream-50">What-If Thermal Stress Simulation</h1>
        <p className="mt-2 text-sm text-stone-400 leading-relaxed">
          Manipulate hypothetical ambient temperature, relative humidity, convective wind, and solar flux parameters to simulate physical HTSI index variations and inspect physiological tipping points.
        </p>
      </div>

      <form onSubmit={run} className="glass-panel p-6 sm:p-8 space-y-6 shadow-xl border border-stone-800">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-800">
          <Sliders className="h-5 w-5 text-amber-400" />
          <h2 className="text-base font-bold text-cream-100">Meteorological Boundary Conditions</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <label className="block text-xs font-medium text-stone-300">
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5"><ThermometerSun className="h-4 w-4 text-orange-400" /> Dry-Bulb Temperature (°C)</span>
              <span className="font-mono text-cream-200 font-bold">{form.temperature}°C</span>
            </div>
            <input
              type="number"
              step="0.5"
              min="15"
              max="55"
              value={form.temperature}
              onChange={(e) => setForm({ ...form, temperature: Number(e.target.value) })}
              className="field-input"
            />
          </label>

          <label className="block text-xs font-medium text-stone-300">
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5"><Droplets className="h-4 w-4 text-amber-400" /> Relative Humidity (%)</span>
              <span className="font-mono text-cream-200 font-bold">{form.humidity}%</span>
            </div>
            <input
              type="number"
              step="1"
              min="5"
              max="100"
              value={form.humidity}
              onChange={(e) => setForm({ ...form, humidity: Number(e.target.value) })}
              className="field-input"
            />
          </label>

          <label className="block text-xs font-medium text-stone-300">
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5"><Wind className="h-4 w-4 text-amber-300" /> Surface Wind Speed (m/s)</span>
              <span className="font-mono text-cream-200 font-bold">{form.wind_speed} m/s</span>
            </div>
            <input
              type="number"
              step="0.1"
              min="0"
              max="30"
              value={form.wind_speed}
              onChange={(e) => setForm({ ...form, wind_speed: Number(e.target.value) })}
              className="field-input"
            />
          </label>

          <label className="block text-xs font-medium text-stone-300">
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5"><Sun className="h-4 w-4 text-amber-400" /> Global Solar Irradiance (W/m²)</span>
              <span className="font-mono text-cream-200 font-bold">{form.solar_radiation} W/m²</span>
            </div>
            <input
              type="number"
              step="10"
              min="0"
              max="1400"
              value={form.solar_radiation}
              onChange={(e) => setForm({ ...form, solar_radiation: Number(e.target.value) })}
              className="field-input"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="action-button w-full justify-center py-3.5 text-sm"
        >
          <Play size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Computing Coupled Physics...' : 'Execute Biometeorological Simulation'}
        </button>
      </form>

      {error && (
        <div className="glass-panel p-4 rounded-xl text-sm text-red-300 border border-red-500/40">
          {error}
        </div>
      )}

      {result && (
        <div className="glass-panel p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-800">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                Simulation Output
              </span>
              <h2 className="text-xl font-bold text-cream-50 mt-0.5">Coupled Biometeorological Indices</h2>
            </div>
            <RiskBadge risk={result.simulated?.risk_level || 'HIGH'} size="lg" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Calculated HTSI', val: result.simulated?.htsi != null ? Number(result.simulated.htsi).toFixed(1) : '—', unit: '/ 100', color: 'text-purple-300' },
              { label: 'Risk Category', val: result.simulated?.risk_level ?? '—', unit: '', color: 'text-amber-300' },
              { label: 'Rothfusz Heat Index', val: result.simulated?.heat_index != null ? `${result.simulated.heat_index}°C` : '—', unit: '', color: 'text-orange-300' },
              { label: 'Stull WBGT Estimate', val: result.simulated?.wbgt != null ? `${result.simulated.wbgt}°C` : '—', unit: '', color: 'text-emerald-300' },
            ].map(({ label, val, unit, color }) => (
              <div key={label} className="bg-stone-900/80 p-4 rounded-2xl border border-stone-800 shadow-sm">
                <div className="text-[11px] font-mono text-stone-400 uppercase">{label}</div>
                <div className={`mt-1.5 text-2xl font-extrabold font-mono ${color}`}>
                  {val} <span className="text-xs text-stone-400 font-sans">{unit}</span>
                </div>
              </div>
            ))}
          </div>

          {result.simulated?.explanation && (
            <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800/80 text-xs text-stone-300 leading-relaxed">
              <strong className="text-amber-300 block mb-1 font-mono uppercase text-[11px]">Physical Interpretation:</strong>
              {result.simulated.explanation}
            </div>
          )}
        </div>
      )}
    </section>
  );
}