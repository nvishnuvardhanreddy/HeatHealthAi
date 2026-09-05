import React, { useEffect, useState } from 'react';
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
  ArrowRight,
  LocateFixed,
  RefreshCw,
  ThermometerSun,
  Droplets,
  Wind,
  Sun,
  ShieldAlert,
  Building2,
  ChevronRight,
  Crosshair,
  Sparkles,
} from 'lucide-react';
import { gisService, mlService, systemService } from '../services/api';
import { RiskMap } from '../maps/RiskMap';
import { WeatherCard } from '../components/WeatherCard';
import { HtsiGauge } from '../components/HtsiGauge';
import { ExplainableAiCard } from '../components/ExplainableAiCard';
import { AlertBanner } from '../components/AlertBanner';
import { ForecastChart } from '../charts/ForecastChart';
import { HourlyHeatChart } from '../charts/HourlyHeatChart';
import { LocationSearch, ALL_LOCATIONS } from '../components/LocationSearch';
import { RiskBadge } from '../components/StatusBadge';
import { THEME } from '../theme';

const defaultLocation = { latitude: 17.6868, longitude: 83.2185 };

export const HomePage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [geojson, setGeojson] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [location, setLocation] = useState(defaultLocation);
  const [locationMeta, setLocationMeta] = useState({
    name: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    populationFormatted: '2.35 Million',
    density: '3,400/km²',
    exposure: 'Coastal Port & Industrial Processing Corridor',
  });
  const [selectedWard, setSelectedWard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async (coords = location) => {
    setLoading(true);
    setError('');
    try {
      const [dashRes, geoRes, expRes] = await Promise.all([
        systemService.getCitizenDashboard(coords.latitude, coords.longitude),
        gisService.getWardsGeoJSON(),
        mlService.getExplainability(),
      ]);
      setDashboard(dashRes.data);
      setGeojson(geoRes.data);
      setExplanation(expRes.data);
      if (dashRes.data?.city && !locationMeta.populationFormatted) {
        setLocationMeta((prev) => ({
          ...prev,
          name: dashRes.data.city,
          state: dashRes.data.state || prev.state,
        }));
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to retrieve real-time thermal intelligence.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const nextLoc = { latitude: coords.latitude, longitude: coords.longitude };
        setLocation(nextLoc);
        setSelectedWard(null);
        setLocationMeta({
          name: 'Your GPS Location',
          state: 'India',
          populationFormatted: 'Local Area',
          density: null,
          exposure: 'Real-time GPS Local Meteorological Observation',
        });
        loadData(nextLoc);
      },
      () => {
        setError('Location access denied. Displaying national default reference data.');
      }
    );
  };

  const handleSelectLocation = (loc) => {
    const nextCoords = { latitude: loc.latitude, longitude: loc.longitude };
    setLocation(nextCoords);
    setLocationMeta({
      name: loc.name,
      state: loc.state,
      populationFormatted: loc.populationFormatted || (loc.population ? loc.population.toLocaleString() : null),
      population: loc.population,
      density: loc.density,
      exposure: loc.exposure || loc.subtext,
      isWard: loc.isWard,
    });

    if (loc.isWard && geojson?.features) {
      const matched = geojson.features.find((f) => f.properties?.ward_id === loc.wardId);
      if (matched) {
        setSelectedWard(matched.properties);
      } else {
        setSelectedWard({
          name: loc.name,
          ward_id: loc.wardId,
          htsi: 82,
          risk_level: loc.riskTag || 'HIGH',
          population: loc.population,
          population_density: loc.density ? parseInt(loc.density) : null,
          primary_exposure: loc.exposure,
        });
      }
    } else {
      setSelectedWard(null);
    }

    loadData(nextCoords);
  };

  const thermal = dashboard?.thermal_stress || dashboard?.thermal_indices || {};
  const weather = dashboard?.current_weather || dashboard?.weather || {};
  const daily = dashboard?.daily_5d || [];
  const hourly = dashboard?.hourly_48h || [];
  const isCloseToVizag = Math.abs(location.latitude - 17.6868) < 1.0 && Math.abs(location.longitude - 83.2185) < 1.0;

  return (
    <div className="space-y-8 pb-12">
      {/* 6. HERO SECTION */}
      <section className="hero-card relative z-30 p-6 sm:p-10 space-y-6">
        {/* Subtle radial ambient warmth */}
        <div className="absolute inset-0 rounded-[20px] overflow-hidden pointer-events-none">
          <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-[rgba(245,169,0,0.06)] blur-3xl" />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#161311] border border-[#4F3100] text-xs font-mono text-[#FFD34D] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#F5A900] animate-ping" />
              <span>TEAM GROUND ZERO • CLIMATE RESILIENCE INITIATIVE</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={detectLocation}
                className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <LocateFixed className="h-3.5 w-3.5 text-[#F5A900]" />
                GPS Detect
              </button>
              <button
                onClick={() => loadData()}
                className="icon-button p-2"
                title="Refresh Live Data"
                aria-label="Refresh Live Data"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-[#F5A900]' : ''}`} />
              </button>
            </div>
          </div>

          <div className="max-w-4xl space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              <span className="text-[#F5F0E8] block sm:inline">Human Thermal Stress Early Warning & </span>
              <span className="thermal-gradient-text block sm:inline">
                GIS Live Forecast Dashboard
              </span>
            </h1>
            <p className="text-sm sm:text-base text-[#A59F95] leading-relaxed max-w-3xl">
              Integrating real-time ambient temperature, relative humidity, solar radiant flux, and wind convection into the multi-factor <strong className="text-[#F5F0E8] font-bold">Human Thermal Stress Index (HTSI)</strong> with ward-level GIS resolution across India.
            </p>
          </div>

          {/* 7. LOCATION SEARCH & POPULAR PILLS */}
          <div className="pt-2 relative z-50">
            <LocationSearch
              onSelectLocation={handleSelectLocation}
              selectedLocation={locationMeta}
            />
          </div>
        </div>
      </section>

      {/* 9. LOCATION SUMMARY CARD */}
      <section className="mission-card p-5 sm:p-6 border border-[#4F3100] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-[#161311] border border-[#4F3100] text-[#F5A900] shadow-sm">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-extrabold text-[#F5F0E8] tracking-wide">{locationMeta.name}</h2>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-[#161311] text-[#A59F95] border border-[#4F3100]">
                  {locationMeta.state}
                </span>
                {locationMeta.isWard && (
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-[rgba(245,169,0,0.12)] text-[#FFD34D] border border-[#4F3100] font-bold">
                    MUNICIPAL WARD
                  </span>
                )}
              </div>
              <p className="text-xs text-[#A59F95] font-mono mt-1">
                Coordinates: {location.latitude.toFixed(4)}° N, {location.longitude.toFixed(4)}° E ·{' '}
                <span className="text-[#F5A900] font-bold">
                  {weather.is_live ? 'LIVE SATELLITE • METEO SYNC' : 'DEMO VALIDATION MODE'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
            {/* Population Metric Card */}
            {locationMeta.populationFormatted && (
              <div className="p-2.5 px-3.5 rounded-xl bg-[#161311] border border-[#4F3100] flex items-center gap-2 shadow-sm">
                <Users className="h-4 w-4 text-[#F5A900]" />
                <span className="text-[#A59F95]">Population:</span>
                <span className="font-bold text-[#F5F0E8]">{locationMeta.populationFormatted}</span>
                {locationMeta.density && (
                  <span className="text-[11px] text-[#FFD34D] border-l border-[#4F3100] pl-2">
                    {locationMeta.density}
                  </span>
                )}
              </div>
            )}

            <div className="p-2.5 px-3.5 rounded-xl bg-[#161311] border border-[#4F3100] flex items-center gap-2 shadow-sm">
              <ThermometerSun className="h-4 w-4 text-[#FF9F3D]" />
              <span className="text-[#A59F95]">Temp:</span>
              <span className="font-bold text-[#F5F0E8]">{weather.temperature ?? '—'}°C</span>
            </div>

            <div className="p-2.5 px-3.5 rounded-xl bg-[#161311] border border-[#4F3100] flex items-center gap-2 shadow-sm">
              <Droplets className="h-4 w-4 text-[#FFD34D]" />
              <span className="text-[#A59F95]">Humidity:</span>
              <span className="font-bold text-[#F5F0E8]">{weather.humidity ?? '—'}%</span>
            </div>

            <div className="p-2.5 px-3.5 rounded-xl bg-[#161311] border border-[#4F3100] flex items-center gap-2 shadow-sm">
              <Flame className="h-4 w-4 text-[#7C3AED]" />
              <span className="text-[#A59F95]">HTSI:</span>
              <span className="font-bold text-purple-300">{Number(thermal.htsi ?? 0).toFixed(1)}/100</span>
            </div>

            <RiskBadge risk={thermal.risk_level || 'HIGH'} size="md" />
          </div>
        </div>

        {/* Demographic Exposure Profile Bar */}
        {locationMeta.exposure && (
          <div className="pt-3 border-t border-[#4F3100] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono uppercase text-[10px] px-2.5 py-0.5 rounded bg-[#161311] border border-[#4F3100] text-[#FFD34D] font-bold">
                Demographic Exposure
              </span>
              <span className="text-[#F5F0E8]">{locationMeta.exposure}</span>
            </div>
            {locationMeta.density && (
              <span className="text-[11px] font-mono text-[#A59F95]">
                Spatial Density: <strong className="text-[#FFD34D]">{locationMeta.density}</strong>
              </span>
            )}
          </div>
        )}
      </section>

      {error && (
        <div className="mission-card border-[#EF4444] p-4 text-sm text-[#FECACA]">
          {error}
        </div>
      )}

      {loading && (
        <div className="mission-card p-8 text-center text-sm text-[#A59F95] flex items-center justify-center gap-3">
          <RefreshCw className="h-5 w-5 animate-spin text-[#F5A900]" />
          <span>Computing localized biometeorological indices and multi-day projections...</span>
        </div>
      )}

      {!loading && (
        <>
          {dashboard?.active_alert && <AlertBanner alert={dashboard.active_alert} />}

          {/* 11 & 12. Weather Cards & HTSI Gauge */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <WeatherCard weather={weather} location={location} />
            <div className="lg:col-span-2">
              <HtsiGauge
                htsi={thermal.htsi ?? 0}
                riskLevel={thermal.risk_level || 'UNAVAILABLE'}
                indices={thermal}
              />
            </div>
          </div>

          {/* 13. GIS Risk Map */}
          <section className="space-y-2">
            <RiskMap
              geojsonData={isCloseToVizag ? geojson : null}
              userLocation={location}
              locationDetails={{
                city: locationMeta.name,
                risk_level: thermal.risk_level,
                htsi: thermal.htsi,
                temperature: weather.temperature,
                humidity: weather.humidity,
                populationFormatted: locationMeta.populationFormatted,
                density: locationMeta.density,
                exposure: locationMeta.exposure,
              }}
              selectedWard={selectedWard}
              onSelectWard={(ward) => {
                setSelectedWard(ward);
                if (ward?.centroid) {
                  const coords = { latitude: ward.centroid[0], longitude: ward.centroid[1] };
                  setLocation(coords);
                  setLocationMeta({
                    name: ward.name,
                    state: 'Visakhapatnam (GVMC Ward)',
                    populationFormatted: ward.population ? ward.population.toLocaleString() : '50,000',
                    density: ward.population_density ? `${ward.population_density.toLocaleString()}/km²` : null,
                    exposure: ward.primary_exposure,
                    isWard: true,
                  });
                  loadData(coords);
                }
              }}
            />
          </section>

          {/* 14. 5-Day Forecast & 48h Hourly Chart */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <section className="mission-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-[#FF9F3D]" />
                <div>
                  <h2 className="text-base font-bold text-[#F5F0E8]">5-Day Heat Danger & Human Impact Forecast</h2>
                  <span className="text-[11px] font-mono text-[#A59F95]">Open-Meteo Multi-Model Ensemble</span>
                </div>
              </div>
              <ForecastChart dailyData={daily} />
            </section>

            <section className="mission-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="h-5 w-5 text-[#EF4444]" />
                <div>
                  <h2 className="text-base font-bold text-[#F5F0E8]">Next 48 Hours Diurnal Thermal Curve</h2>
                  <span className="text-[11px] font-mono text-[#A59F95]">Hourly Solar-Humidity Coupled Trajectory</span>
                </div>
              </div>
              <HourlyHeatChart hourlyData={hourly} />
            </section>
          </div>

          {/* Hotspots & Wards Reference Grid */}
          <section className="mission-card p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-[#F5A900] font-bold">
                  High-Vulnerability Monitoring
                </span>
                <h3 className="text-lg font-bold text-[#F5F0E8]">National Heat Hotspots & Visakhapatnam Wards</h3>
              </div>
              <span className="text-xs text-[#A59F95] font-mono">Click any location card to zoom map & load metrics</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
              {[
                { name: 'Gajuwaka', sub: 'Ward 01 · Industrial', risk: 'EXTREME', lat: 17.690, lon: 83.200, isWard: true, wardId: 'VIZ-01' },
                { name: 'Phalodi', sub: 'Rajasthan · 51°C Record', risk: 'EXTREME', lat: 27.1311, lon: 72.3644 },
                { name: 'Ramagundam', sub: 'Telangana · Coal Basin', risk: 'EXTREME', lat: 18.7562, lon: 79.5139 },
                { name: 'Rentachintala', sub: 'Palnadu · Cauldron', risk: 'EXTREME', lat: 16.5500, lon: 79.5500 },
                { name: 'Churu', sub: 'Thar Arid Epicenter', risk: 'EXTREME', lat: 28.2900, lon: 74.9600 },
                { name: 'Kurmannapalem', sub: 'Ward 12 · Steel Plant', risk: 'EXTREME', lat: 17.670, lon: 83.150, isWard: true, wardId: 'VIZ-12' },
                { name: 'Anakapalle', sub: 'Ward 03 · Agriculture', risk: 'VERY HIGH', lat: 17.695, lon: 83.000, isWard: true, wardId: 'VIZ-03' },
                { name: 'Banda', sub: 'UP · Bundelkhand', risk: 'EXTREME', lat: 25.4800, lon: 80.3400 },
                { name: 'Chandrapur', sub: 'Vidarbha · Thermal', risk: 'EXTREME', lat: 19.9615, lon: 79.2961 },
                { name: 'New Delhi', sub: 'NCR Metro Core', risk: 'VERY HIGH', lat: 28.6139, lon: 77.2090 },
              ].map((spot) => (
                <button
                  key={spot.name}
                  type="button"
                  onClick={() => handleSelectLocation({ name: spot.name, state: spot.sub, latitude: spot.lat, longitude: spot.lon, isWard: spot.isWard, wardId: spot.wardId })}
                  className="p-3.5 rounded-xl bg-[#161311] hover:bg-[#1E1915] border border-[#4F3100] hover:border-[#F5A900] text-left transition group flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-xs text-[#F5F0E8] group-hover:text-[#FFD34D] truncate">{spot.name}</span>
                      <RiskBadge risk={spot.risk} size="xs" />
                    </div>
                    <p className="text-[10px] text-[#A59F95] font-mono truncate">{spot.sub}</p>
                  </div>
                  <div className="mt-2.5 flex items-center gap-1 text-[10px] text-[#F5A900] font-semibold opacity-80 group-hover:opacity-100 font-mono">
                    <Crosshair className="h-3 w-3" />
                    Zoom & Inspect
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Explainable AI Card */}
          <ExplainableAiCard drivers={explanation?.drivers} />

          {/* Core Science & Architecture Pillars */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="mission-card p-6 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-[#161311] border border-[#FF9F3D] flex items-center justify-center text-[#FF9F3D] shadow-sm">
                <Flame className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[#F5F0E8]">Biometeorological Physics</h3>
              <p className="text-xs text-[#A59F95] leading-relaxed">
                Computes Rothfusz Heat Index, Liljegren/Stull Wet Bulb Globe Temperature (WBGT), and Universal Thermal Climate Index (UTCI) to account for humidity and radiation coupling.
              </p>
            </div>

            <div className="mission-card p-6 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-[#161311] border border-[#F5A900] flex items-center justify-center text-[#F5A900] shadow-sm">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[#F5F0E8]">GeoJSON Ward Precision</h3>
              <p className="text-xs text-[#A59F95] leading-relaxed">
                High-resolution polygon boundary mapping with Shapely point-in-polygon queries. Maps heat stress directly to 15 GVMC municipal zones like Gajuwaka, Madhurawada, and MVP Colony.
              </p>
            </div>

            <div className="mission-card p-6 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-[#161311] border border-[#7C3AED] flex items-center justify-center text-purple-400 shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[#F5F0E8]">Government Authority Protection</h3>
              <p className="text-xs text-[#A59F95] leading-relaxed">
                Restricted municipal intervention portal with two-stage domain verification (.gov.in, .nic.in, .ap.gov.in) and automated civil defense action triggers.
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
