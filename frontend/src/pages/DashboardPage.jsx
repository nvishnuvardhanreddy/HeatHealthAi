import React, { useEffect, useState } from 'react';
import { Activity, LocateFixed, RefreshCw, ShieldAlert, MapPin, Compass, Flame, Users, ThermometerSun, Droplets } from 'lucide-react';
import { gisService, mlService, systemService } from '../services/api';
import { RiskMap } from '../maps/RiskMap';
import { WeatherCard } from '../components/WeatherCard';
import { HtsiGauge } from '../components/HtsiGauge';
import { ExplainableAiCard } from '../components/ExplainableAiCard';
import { AlertBanner } from '../components/AlertBanner';
import { ForecastChart } from '../charts/ForecastChart';
import { HourlyHeatChart } from '../charts/HourlyHeatChart';
import { LocationSearch } from '../components/LocationSearch';
import { RiskBadge } from '../components/StatusBadge';
import { THEME } from '../theme';

const demoLocation = { latitude: 17.6868, longitude: 83.2185 };

export function DashboardPage({ authority = false }) {
  const [dashboard, setDashboard] = useState(null);
  const [geojson, setGeojson] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [location, setLocation] = useState(demoLocation);
  const [activeLocationMeta, setActiveLocationMeta] = useState({
    name: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    populationFormatted: '2.35 Million',
    density: '3,400/km²',
    exposure: 'Coastal Port & Industrial Processing Corridor',
  });
  const [selectedWard, setSelectedWard] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadDashboard = async (coords = location) => {
    setLoading(true);
    setError('');
    try {
      const [dashboardResponse, mapResponse, explainResponse] = await Promise.all([
        authority
          ? systemService.getAuthorityDashboard()
          : systemService.getCitizenDashboard(coords.latitude, coords.longitude),
        gisService.getWardsGeoJSON(),
        mlService.getExplainability(),
      ]);
      setDashboard(dashboardResponse.data);
      setGeojson(mapResponse.data);
      setExplanation(explainResponse.data);
      if (dashboardResponse.data?.city && !activeLocationMeta.populationFormatted) {
        setActiveLocationMeta((prev) => ({
          ...prev,
          name: dashboardResponse.data.city,
          state: dashboardResponse.data.state || prev.state,
        }));
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'The intelligence service is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const nextLocation = { latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy };
        setLocation(nextLocation);
        gisService.updateLocation(coords.latitude, coords.longitude, coords.accuracy).catch(() => {});
        loadDashboard(nextLocation);
      },
      () => {
        // Fall back gracefully to default location
      }
    );
  }, [authority]);

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const nextLocation = { latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy };
        setLocation(nextLocation);
        setSelectedWard(null);
        setActiveLocationMeta({
          name: 'Your GPS Location',
          state: 'India',
          populationFormatted: 'Local Area',
          density: null,
          exposure: 'Real-time GPS Local Meteorological Observation',
        });
        try {
          await gisService.updateLocation(coords.latitude, coords.longitude, coords.accuracy);
        } catch (_) {}
        loadDashboard(nextLocation);
      },
      () => setError('Location access is disabled. Enable it in browser settings to see live heat risk for your exact GPS.')
    );
  };

  const handleSelectLocation = (loc) => {
    const coords = { latitude: loc.latitude, longitude: loc.longitude };
    setLocation(coords);
    setActiveLocationMeta({
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

    loadDashboard(coords);
  };

  const thermal = dashboard?.thermal_stress || dashboard?.thermal_indices || {};
  const weather = dashboard?.current_weather || dashboard?.weather || {};
  const daily = dashboard?.daily_5d || [];
  const hourly = dashboard?.hourly_48h || [];
  const isCloseToVizag = Math.abs(location.latitude - 17.6868) < 1.0 && Math.abs(location.longitude - 83.2185) < 1.0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-mono uppercase tracking-wider text-[#F5A900] font-bold">
              {authority ? 'Verified Authority Portal' : 'Citizen Climate Command Center'}
            </span>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#161311] text-[#A59F95] border border-[#4F3100]">
              {activeLocationMeta.name}, {activeLocationMeta.state}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F5F0E8] tracking-tight">
            Localized Thermal Intelligence
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#A59F95] font-mono">
            GPS: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}{' '}
            <span className="text-[#FFD34D] font-semibold">· {weather.is_live ? 'LIVE SATELLITE SYNC' : 'DEMO DATA'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={detectLocation} className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5">
            <LocateFixed size={15} /> Detect GPS
          </button>
          <button
            onClick={() => loadDashboard()}
            className="icon-button p-2.5"
            title="Refresh dashboard"
            aria-label="Refresh dashboard"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-[#F5A900]' : ''} />
          </button>
        </div>
      </header>

      {/* Interactive Location Search Component */}
      <section className="relative z-30">
        <LocationSearch
          onSelectLocation={handleSelectLocation}
          selectedLocation={activeLocationMeta}
        />
      </section>

      {/* Demographic & Population Metrics Card */}
      {activeLocationMeta.populationFormatted && (
        <div className="mission-card p-4 px-5 border border-[#4F3100] flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-[#FFD34D] font-mono font-semibold">
              <Users className="h-4 w-4 text-[#F5A900]" />
              <span>Target Population: <strong className="text-[#F5F0E8]">{activeLocationMeta.populationFormatted}</strong></span>
            </div>
            {activeLocationMeta.density && (
              <span className="text-[11px] font-mono text-[#A59F95] border-l border-[#4F3100] pl-3">
                Density: <strong className="text-[#FFD34D]">{activeLocationMeta.density}</strong>
              </span>
            )}
          </div>
          {activeLocationMeta.exposure && (
            <div className="text-[11px] text-[#A59F95]">
              <span className="text-[#F5A900] font-bold uppercase font-mono mr-1">Exposure:</span>
              <span className="text-[#F5F0E8]">{activeLocationMeta.exposure}</span>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mission-card border-[#EF4444] p-4 text-sm text-[#FECACA]">
          {error}
        </div>
      )}

      {loading && (
        <div className="mission-card p-8 text-sm text-[#A59F95] flex items-center justify-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin text-[#F5A900]" />
          <span>Synchronizing localized meteorological intelligence...</span>
        </div>
      )}

      {!loading && (
        <>
          {dashboard?.active_alert && <AlertBanner alert={dashboard.active_alert} />}

          {/* Core Gauge & Weather Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <WeatherCard weather={weather} location={location} />
            <div className="lg:col-span-2">
              <HtsiGauge
                htsi={thermal.htsi ?? 0}
                riskLevel={thermal.risk_level || 'UNAVAILABLE'}
                indices={thermal}
              />
            </div>
          </div>

          {/* Interactive GIS Risk Map */}
          <RiskMap
            geojsonData={isCloseToVizag ? geojson : null}
            userLocation={location}
            locationDetails={{
              city: activeLocationMeta.name,
              risk_level: thermal.risk_level,
              htsi: thermal.htsi,
              temperature: weather.temperature,
              humidity: weather.humidity,
              populationFormatted: activeLocationMeta.populationFormatted,
              density: activeLocationMeta.density,
              exposure: activeLocationMeta.exposure,
            }}
            selectedWard={selectedWard}
            onSelectWard={(ward) => {
              setSelectedWard(ward);
              if (ward?.centroid) {
                const coords = { latitude: ward.centroid[0], longitude: ward.centroid[1] };
                setLocation(coords);
                setActiveLocationMeta({
                  name: ward.name,
                  state: 'Visakhapatnam (GVMC Ward)',
                  populationFormatted: ward.population ? ward.population.toLocaleString() : '50,000',
                  density: ward.population_density ? `${ward.population_density.toLocaleString()}/km²` : null,
                  exposure: ward.primary_exposure,
                  isWard: true,
                });
                loadDashboard(coords);
              }
            }}
          />

          {/* Forecast Charts directly in the Page */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <section className="mission-card p-5 border border-[#4F3100]">
              <div className="flex items-center gap-2 mb-4">
                <Activity size={17} className="text-[#FF9F3D]" />
                <div>
                  <h2 className="text-base font-bold text-[#F5F0E8]">5-Day Heat Danger & Outlook Forecast</h2>
                  <span className="text-[11px] font-mono text-[#A59F95]">Multi-Factor HTSI Projections</span>
                </div>
              </div>
              <ForecastChart dailyData={daily} />
            </section>

            <section className="mission-card p-5 border border-[#4F3100]">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert size={17} className="text-[#EF4444]" />
                <div>
                  <h2 className="text-base font-bold text-[#F5F0E8]">Next 48 Hours Diurnal Trajectory</h2>
                  <span className="text-[11px] font-mono text-[#A59F95]">Coupled Solar-Humidity Curve</span>
                </div>
              </div>
              <HourlyHeatChart hourlyData={hourly} />
            </section>
          </div>

          {/* Explainable AI Driver Weights */}
          <ExplainableAiCard drivers={explanation?.drivers} />

          <p className="text-[11px] text-[#706A62] font-mono">
            {dashboard?.map_scope ||
              'AI-generated decision-support estimate. Prototype model requires validation using historical local meteorological and health data before operational deployment.'}
          </p>
        </>
      )}
    </div>
  );
}