import React, { useEffect, useState } from 'react';
import { Activity, LocateFixed, RefreshCw, ShieldAlert } from 'lucide-react';
import { gisService, mlService, systemService } from '../services/api';
import { RiskMap } from '../maps/RiskMap';
import { WeatherCard } from '../components/WeatherCard';
import { HtsiGauge } from '../components/HtsiGauge';
import { ExplainableAiCard } from '../components/ExplainableAiCard';
import { AlertBanner } from '../components/AlertBanner';
import { ForecastChart } from '../charts/ForecastChart';
import { HourlyHeatChart } from '../charts/HourlyHeatChart';

const demoLocation = { latitude: 17.6868, longitude: 83.2185 };

export function DashboardPage({ authority = false }) {
  const [dashboard, setDashboard] = useState(null); const [geojson, setGeojson] = useState(null); const [explanation, setExplanation] = useState(null); const [location, setLocation] = useState(demoLocation); const [selectedWard, setSelectedWard] = useState(null); const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  const loadDashboard = async (coords = location) => { setLoading(true); setError(''); try { const [dashboardResponse, mapResponse, explainResponse] = await Promise.all([authority ? systemService.getAuthorityDashboard() : systemService.getCitizenDashboard(coords.latitude, coords.longitude), gisService.getWardsGeoJSON(), mlService.getExplainability()]); setDashboard(dashboardResponse.data); setGeojson(mapResponse.data); setExplanation(explainResponse.data); } catch (err) { setError(err.response?.data?.detail || 'The intelligence service is temporarily unavailable.'); } finally { setLoading(false); } };
  useEffect(() => {
    loadDashboard();
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const nextLocation = { latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy };
      setLocation(nextLocation);
      gisService.updateLocation(coords.latitude, coords.longitude, coords.accuracy).catch(() => {});
      loadDashboard(nextLocation);
    }, () => setError('Location permission was denied. Showing the Visakhapatnam demo location.'));
  }, [authority]);
  const detectLocation = () => { if (!navigator.geolocation) return; navigator.geolocation.getCurrentPosition(async ({ coords }) => { const nextLocation = { latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy }; setLocation(nextLocation); try { await gisService.updateLocation(coords.latitude, coords.longitude, coords.accuracy); } catch (_) { /* Keep the dashboard usable if location storage is unavailable. */ } loadDashboard(nextLocation); }, () => setError('Location access is disabled. Showing the Visakhapatnam demo location.')); };
  const thermal = dashboard?.thermal_stress || dashboard?.thermal_indices || {}; const weather = dashboard?.current_weather || dashboard?.weather || {}; const daily = dashboard?.daily_5d || []; const hourly = dashboard?.hourly_48h || []; const isDemoMap = dashboard?.map_scope?.includes('Visakhapatnam');
  return <div className="space-y-6"><header className="flex flex-col md:flex-row md:items-end justify-between gap-4"><div><span className="text-xs font-mono uppercase tracking-wider text-cyan-400">{authority ? 'Verified Authority Portal' : 'Citizen Climate Command Center'}</span><h1 className="mt-1 text-3xl font-extrabold text-white">Localized thermal intelligence</h1><p className="mt-2 text-sm text-slate-400">GPS: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)} <span className="text-cyan-400">· {weather.is_live ? 'LIVE WEATHER' : 'DEMO DATA'}</span></p></div><div className="flex gap-2"><button onClick={detectLocation} className="action-button"><LocateFixed size={16} /> Detect location</button><button onClick={() => loadDashboard()} className="icon-button" title="Refresh dashboard" aria-label="Refresh dashboard"><RefreshCw size={17} /></button></div></header>
    {error && <div className="glass-panel border-amber-500/40 p-3 text-sm text-amber-200">{error}</div>}{loading && <div className="glass-panel p-5 text-sm text-slate-400">Loading localized risk intelligence...</div>}
    {!loading && <>{dashboard?.active_alert && <AlertBanner alert={dashboard.active_alert} />}<div className="grid grid-cols-1 lg:grid-cols-3 gap-5"><WeatherCard weather={weather} location={location} /><div className="glass-panel p-5 lg:col-span-2"><HtsiGauge htsi={thermal.htsi ?? 0} riskLevel={thermal.risk_level || 'UNAVAILABLE'} indices={thermal} /></div></div><RiskMap geojsonData={isDemoMap ? geojson : null} userLocation={location} selectedWard={selectedWard} onSelectWard={setSelectedWard} /><div className="grid grid-cols-1 xl:grid-cols-2 gap-5"><section className="glass-panel p-5"><div className="section-heading"><Activity size={17} className="text-orange-400" /><h2>5-day heat danger forecast</h2></div><ForecastChart dailyData={daily} /></section><section className="glass-panel p-5"><div className="section-heading"><ShieldAlert size={17} className="text-red-400" /><h2>Next 48 hours</h2></div><HourlyHeatChart hourlyData={hourly} /></section></div><ExplainableAiCard drivers={explanation?.drivers} /><p className="text-[11px] text-slate-500">{dashboard?.map_scope || 'AI-generated decision-support estimate. Prototype model requires validation using historical local meteorological and health data before operational deployment.'}</p></>}</div>;
}