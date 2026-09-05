import React from 'react';
import { Thermometer, Droplets, Wind, Sun, Compass } from 'lucide-react';

export const WeatherCard = ({ weather = {}, location }) => {
  const isLive = weather.is_live || false;
  const sourceLabel = weather.source || (isLive ? 'LIVE WEATHER' : 'DEMO DATA');

  return (
    <div className="glass-panel p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400">Meteorological Observation</span>
          <h3 className="text-base font-bold text-cream-50">Current Weather Conditions</h3>
        </div>
        <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
          isLive
            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
            : 'bg-amber-950/60 border-amber-500/40 text-amber-400'
        }`}>
          {sourceLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-2">
        {/* Temperature */}
        <div className="p-3.5 rounded-xl bg-stone-900/80 border border-stone-800 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-[11px] font-medium uppercase">Temperature</span>
            <Thermometer className="h-4 w-4 text-orange-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-cream-50">
            {weather.temperature != null ? `${weather.temperature}°C` : '40.0°C'}
          </div>
          <div className="text-[10px] text-stone-500 mt-0.5 font-mono">
            Feels like {weather.apparent_temperature != null ? `${weather.apparent_temperature}°C` : '52.4°C'}
          </div>
        </div>

        {/* Humidity */}
        <div className="p-3.5 rounded-xl bg-stone-900/80 border border-stone-800 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-[11px] font-medium uppercase">Humidity</span>
            <Droplets className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-cream-50">
            {weather.humidity != null ? `${weather.humidity}%` : '70%'}
          </div>
          <div className="text-[10px] text-stone-500 mt-0.5 font-mono">Relative Humidity</div>
        </div>

        {/* Wind Speed */}
        <div className="p-3.5 rounded-xl bg-stone-900/80 border border-stone-800 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-[11px] font-medium uppercase">Wind Speed</span>
            <Wind className="h-4 w-4 text-amber-300" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-cream-50">
            {weather.wind_speed != null ? `${weather.wind_speed} m/s` : '2.0 m/s'}
          </div>
          <div className="text-[10px] text-stone-500 mt-0.5 font-mono">10m Surface Convection</div>
        </div>

        {/* Solar Radiation */}
        <div className="p-3.5 rounded-xl bg-stone-900/80 border border-stone-800 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-[11px] font-medium uppercase">Solar Rad.</span>
            <Sun className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-cream-50">
            {weather.solar_radiation != null ? `${weather.solar_radiation} W/m²` : '800 W/m²'}
          </div>
          <div className="text-[10px] text-stone-500 mt-0.5 font-mono">Direct Irradiance</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-stone-400 pt-3 border-t border-stone-800/80">
        <span className="flex items-center gap-1.5">
          <Compass className="h-3.5 w-3.5 text-amber-400" />
          {location ? `${location.latitude.toFixed(4)}°N, ${location.longitude.toFixed(4)}°E` : 'GPS location'}
        </span>
        <span className="text-[11px] font-mono text-stone-500">
          Updated: {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};
