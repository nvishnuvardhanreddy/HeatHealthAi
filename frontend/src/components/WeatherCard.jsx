import React from 'react';
import { Thermometer, Droplets, Wind, Sun, Compass } from 'lucide-react';
import { THEME } from '../theme';

export const WeatherCard = ({ weather = {}, location }) => {
  const isLive = weather.is_live || false;
  const sourceLabel = weather.source || (isLive ? 'LIVE' : 'DEMO');

  return (
    <div className="mission-card p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#A59F95]">
            Meteorological Observation
          </span>
          <h3 className="text-base font-bold text-[#F5F0E8]">Current Weather Conditions</h3>
        </div>
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
          isLive
            ? 'bg-[rgba(22,199,132,0.15)] border-[#16C784] text-[#16C784]'
            : 'bg-[rgba(240,180,0,0.15)] border-[#F0B400] text-[#FFD34D]'
        }`}>
          {sourceLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-2">
        {/* Temperature */}
        <div className="p-3.5 rounded-xl bg-[#100E0D] border border-[#4F3100] hover:border-[#F5A900] transition flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-[#A59F95] mb-1">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider">Temperature</span>
            <Thermometer className="h-4 w-4 text-[#FF9F3D]" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-[#F5F0E8]">
            {weather.temperature != null ? `${weather.temperature}°C` : '40.0°C'}
          </div>
          <div className="text-[10px] text-[#706A62] mt-0.5 font-mono">
            Feels like {weather.apparent_temperature != null ? `${weather.apparent_temperature}°C` : '52.4°C'}
          </div>
        </div>

        {/* Humidity */}
        <div className="p-3.5 rounded-xl bg-[#100E0D] border border-[#4F3100] hover:border-[#F5A900] transition flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-[#A59F95] mb-1">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider">Humidity</span>
            <Droplets className="h-4 w-4 text-[#FFD34D]" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-[#F5F0E8]">
            {weather.humidity != null ? `${weather.humidity}%` : '70%'}
          </div>
          <div className="text-[10px] text-[#706A62] mt-0.5 font-mono">Relative Humidity</div>
        </div>

        {/* Wind Speed */}
        <div className="p-3.5 rounded-xl bg-[#100E0D] border border-[#4F3100] hover:border-[#F5A900] transition flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-[#A59F95] mb-1">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider">Wind Speed</span>
            <Wind className="h-4 w-4 text-[#F5A900]" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-[#F5F0E8]">
            {weather.wind_speed != null ? `${weather.wind_speed} m/s` : '2.0 m/s'}
          </div>
          <div className="text-[10px] text-[#706A62] mt-0.5 font-mono">10m Surface Wind</div>
        </div>

        {/* Solar Radiation */}
        <div className="p-3.5 rounded-xl bg-[#100E0D] border border-[#4F3100] hover:border-[#F5A900] transition flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-[#A59F95] mb-1">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider">Solar Rad.</span>
            <Sun className="h-4 w-4 text-[#FFD34D]" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-[#F5F0E8]">
            {weather.solar_radiation != null ? `${weather.solar_radiation} W/m²` : '800 W/m²'}
          </div>
          <div className="text-[10px] text-[#706A62] mt-0.5 font-mono">Direct Irradiance</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-[#A59F95] pt-3 border-t border-[#4F3100]">
        <span className="flex items-center gap-1.5 font-mono">
          <Compass className="h-3.5 w-3.5 text-[#F5A900]" />
          {location ? `${location.latitude.toFixed(4)}°N, ${location.longitude.toFixed(4)}°E` : 'GPS location'}
        </span>
        <span className="text-[11px] font-mono text-[#706A62]">
          Updated: {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};
