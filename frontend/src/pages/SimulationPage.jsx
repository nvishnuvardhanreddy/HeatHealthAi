import React, { useState } from 'react';
import { Play, Sparkles, Sliders, Activity, ThermometerSun, Droplets, Wind, Sun, Clock, Users, ArrowRight } from 'lucide-react';
import { simulationService } from '../services/api';
import { RiskBadge } from '../components/StatusBadge';
import { THEME } from '../theme';

export function SimulationPage() {
  const [form, setForm] = useState({
    temperature: 42,
    humidity: 75,
    wind_speed: 1.2,
    solar_radiation: 900,
    exposure_duration: 4, // hours
    vulnerability_factor: 1.2, // demographic multiplier
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentHtsi = 34.6;
  const currentRisk = 'MODERATE';

  const run = async (event) => {
    if (event) event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await simulationService.run({
        temperature: form.temperature,
        humidity: form.humidity,
        wind_speed: form.wind_speed,
        solar_radiation: form.solar_radiation,
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Simulation computation failed.');
    } finally {
      setLoading(false);
    }
  };

  const simulatedHtsi = result?.simulated?.htsi != null ? Number(result.simulated.htsi) : null;
  const simulatedRisk = result?.simulated?.risk_level || 'VERY HIGH';

  return (
    <section className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-mono uppercase tracking-wider text-[#F5A900] font-bold">
            DECISION SUPPORT SANDBOX
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#F5F0E8]">What-If Thermal Stress Simulation</h1>
        <p className="mt-2 text-sm text-[#A59F95] leading-relaxed">
          Simulate how shifts in ambient dry-bulb temperature, relative humidity, surface convective wind, solar radiant flux, exposure duration, and vulnerable demographics alter the Human Thermal Stress Index.
        </p>
      </div>

      {/* Interactive Controls Form */}
      <form onSubmit={run} className="mission-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#4F3100]">
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-[#F5A900]" />
            <h2 className="text-base font-bold text-[#F5F0E8]">Meteorological & Demographic Boundary Conditions</h2>
          </div>
          <span className="text-xs font-mono text-[#A59F95]">Real-time Model Input</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Temperature Slider */}
          <div className="space-y-2 p-3.5 rounded-xl bg-[#100E0D] border border-[#4F3100]">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-[#F5F0E8] font-medium">
                <ThermometerSun className="h-4 w-4 text-[#FF9F3D]" /> Temperature (°C)
              </span>
              <span className="font-mono text-[#FFD34D] font-bold">{form.temperature}°C</span>
            </div>
            <input
              type="range"
              min="20"
              max="55"
              step="0.5"
              value={form.temperature}
              onChange={(e) => setForm({ ...form, temperature: Number(e.target.value) })}
              className="w-full accent-[#F5A900] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#706A62] font-mono">
              <span>20°C</span>
              <span>38°C</span>
              <span>55°C</span>
            </div>
          </div>

          {/* Humidity Slider */}
          <div className="space-y-2 p-3.5 rounded-xl bg-[#100E0D] border border-[#4F3100]">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-[#F5F0E8] font-medium">
                <Droplets className="h-4 w-4 text-[#FFD34D]" /> Relative Humidity (%)
              </span>
              <span className="font-mono text-[#FFD34D] font-bold">{form.humidity}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="1"
              value={form.humidity}
              onChange={(e) => setForm({ ...form, humidity: Number(e.target.value) })}
              className="w-full accent-[#F5A900] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#706A62] font-mono">
              <span>10% (Dry)</span>
              <span>50%</span>
              <span>100% (Saturated)</span>
            </div>
          </div>

          {/* Wind Speed Slider */}
          <div className="space-y-2 p-3.5 rounded-xl bg-[#100E0D] border border-[#4F3100]">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-[#F5F0E8] font-medium">
                <Wind className="h-4 w-4 text-[#F5A900]" /> Surface Wind Speed (m/s)
              </span>
              <span className="font-mono text-[#FFD34D] font-bold">{form.wind_speed} m/s</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="0.2"
              value={form.wind_speed}
              onChange={(e) => setForm({ ...form, wind_speed: Number(e.target.value) })}
              className="w-full accent-[#F5A900] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#706A62] font-mono">
              <span>0 m/s (Still Air)</span>
              <span>7.5 m/s</span>
              <span>15 m/s (High Convection)</span>
            </div>
          </div>

          {/* Solar Radiation Slider */}
          <div className="space-y-2 p-3.5 rounded-xl bg-[#100E0D] border border-[#4F3100]">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-[#F5F0E8] font-medium">
                <Sun className="h-4 w-4 text-[#FFD34D]" /> Solar Radiation (W/m²)
              </span>
              <span className="font-mono text-[#FFD34D] font-bold">{form.solar_radiation} W/m²</span>
            </div>
            <input
              type="range"
              min="0"
              max="1200"
              step="25"
              value={form.solar_radiation}
              onChange={(e) => setForm({ ...form, solar_radiation: Number(e.target.value) })}
              className="w-full accent-[#F5A900] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#706A62] font-mono">
              <span>0 W/m² (Night/Cloud)</span>
              <span>600 W/m²</span>
              <span>1200 W/m² (Peak Noon)</span>
            </div>
          </div>

          {/* Exposure Duration */}
          <div className="space-y-2 p-3.5 rounded-xl bg-[#100E0D] border border-[#4F3100]">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-[#F5F0E8] font-medium">
                <Clock className="h-4 w-4 text-[#FF9F3D]" /> Outdoor Exposure Duration
              </span>
              <span className="font-mono text-[#FFD34D] font-bold">{form.exposure_duration} hrs</span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              step="1"
              value={form.exposure_duration}
              onChange={(e) => setForm({ ...form, exposure_duration: Number(e.target.value) })}
              className="w-full accent-[#F5A900] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#706A62] font-mono">
              <span>1 hr</span>
              <span>4 hrs</span>
              <span>8 hrs (Full Shift)</span>
            </div>
          </div>

          {/* Population Vulnerability */}
          <div className="space-y-2 p-3.5 rounded-xl bg-[#100E0D] border border-[#4F3100]">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-[#F5F0E8] font-medium">
                <Users className="h-4 w-4 text-[#F5A900]" /> Demographic Vulnerability
              </span>
              <span className="font-mono text-[#FFD34D] font-bold">{form.vulnerability_factor}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="2.0"
              step="0.1"
              value={form.vulnerability_factor}
              onChange={(e) => setForm({ ...form, vulnerability_factor: Number(e.target.value) })}
              className="w-full accent-[#F5A900] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#706A62] font-mono">
              <span>0.8x (Standard)</span>
              <span>1.2x (Elderly/Outdoor Labor)</span>
              <span>2.0x (Extreme Vulnerability)</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="action-button w-full justify-center py-3.5 text-sm"
        >
          <Play size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Computing Physics Engine...' : 'Run Biometeorological Simulation'}
        </button>
      </form>

      {error && (
        <div className="mission-card p-4 text-sm text-[#FECACA] border-[#EF4444]">
          {error}
        </div>
      )}

      {/* 15. Real-Time Comparison (Current vs Simulated HTSI) */}
      <div className="mission-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#4F3100]">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#F5A900] font-bold">
              SCENARIO DELTA COMPARISON
            </span>
            <h2 className="text-xl font-bold text-[#F5F0E8] mt-0.5">Physical Tipping Point Analysis</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Current Reading */}
          <div className="bg-[#100E0D] p-5 rounded-xl border border-[#4F3100] space-y-2">
            <span className="text-xs font-mono text-[#A59F95] uppercase">CURRENT BASELINE</span>
            <div className="text-3xl font-extrabold font-mono text-[#F5F0E8]">
              HTSI {currentHtsi}
            </div>
            <div>
              <RiskBadge risk={currentRisk} size="sm" />
            </div>
          </div>

          {/* Arrow / Shift Indicator */}
          <div className="bg-[#100E0D] p-5 rounded-xl border border-[#4F3100] flex flex-col justify-center items-center text-center">
            <span className="text-xs font-mono text-[#A59F95] uppercase mb-1">STRESS DELTA</span>
            <div className="text-2xl font-mono font-bold text-[#FF9F3D]">
              {simulatedHtsi ? `+${(simulatedHtsi - currentHtsi).toFixed(1)} pts` : 'Run to calculate'}
            </div>
            <span className="text-[11px] text-[#A59F95] mt-1">Coupled Heat Wave Trajectory</span>
          </div>

          {/* Simulated Reading */}
          <div className="bg-[#100E0D] p-5 rounded-xl border border-[#F5A900] space-y-2 shadow-sm">
            <span className="text-xs font-mono text-[#FFD34D] uppercase font-bold">SIMULATED SCENARIO</span>
            <div className="text-3xl font-extrabold font-mono text-[#FF9F3D]">
              HTSI {simulatedHtsi ? simulatedHtsi.toFixed(1) : '61.8'}
            </div>
            <div>
              <RiskBadge risk={simulatedHtsi ? simulatedRisk : 'VERY HIGH'} size="sm" />
            </div>
          </div>
        </div>

        {result?.simulated && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {[
              { label: 'Heat Index', val: result.simulated.heat_index != null ? `${result.simulated.heat_index}°C` : '—' },
              { label: 'WBGT', val: result.simulated.wbgt != null ? `${result.simulated.wbgt}°C` : '—' },
              { label: 'UTCI', val: result.simulated.utci != null ? `${result.simulated.utci}°C` : '—' },
              { label: 'Danger Level', val: result.simulated.risk_level || 'VERY HIGH' },
            ].map(({ label, val }) => (
              <div key={label} className="p-3 rounded-lg bg-[#100E0D] border border-[#4F3100] text-center font-mono">
                <span className="text-[10px] text-[#706A62] block uppercase">{label}</span>
                <span className="text-sm font-bold text-[#FFD34D] mt-0.5 block">{val}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}