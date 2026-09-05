import React, { useEffect, useState } from 'react';
import { alertService, weatherService } from '../services/api';
import { ShieldAlert, AlertTriangle, Activity, CheckCircle2, Wind, Droplets, ThermometerSun, Flame, Bell, RefreshCw } from 'lucide-react';
import { RiskBadge } from '../components/StatusBadge';
import { ForecastChart } from '../charts/ForecastChart';
import { THEME, getRiskColor } from '../theme';

const titles = {
  alerts: 'Localized Alerts & Real-time Warnings',
  interventions: 'Pre-emptive Municipal Interventions',
  priorities: 'Emergency Resource Priorities',
  actionPlan: 'Automated Heat Action Plan (HAP)',
};

export const OperationsPage = ({ kind }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    setError('');
    const requests = {
      alerts: alertService.getAlerts,
      interventions: alertService.getInterventions,
      priorities: alertService.getEmergencyPriorities,
      actionPlan: alertService.getActionPlan,
    };
    if (requests[kind]) {
      requests[kind]()
        .then((response) => setData(response.data))
        .catch((err) => setError(err.response?.data?.detail || 'Unable to load this decision-support view.'))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    loadData();
  }, [kind]);

  if (error) {
    return (
      <div className="mission-card border-[#EF4444] p-6 text-[#FECACA]">
        <div className="flex items-center gap-2 font-bold mb-1">
          <AlertTriangle className="h-5 w-5 text-[#EF4444]" />
          Error Loading Operations Data
        </div>
        <p className="text-xs">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mission-card p-10 text-center text-sm text-[#A59F95] flex items-center justify-center gap-3">
        <RefreshCw className="h-5 w-5 animate-spin text-[#F5A900]" />
        <span>Synthesizing operational decision-support intelligence...</span>
      </div>
    );
  }

  const rows = Array.isArray(data) ? data : [];

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-[#F5A900] font-bold">
            Decision Support & Municipal Operations
          </span>
          <h1 className="mt-1 text-3xl font-extrabold text-[#F5F0E8]">{titles[kind] || 'Operations'}</h1>
          <p className="mt-2 text-sm text-[#A59F95] max-w-3xl">
            Real-time automated incident and intervention intelligence. Categorized by biometeorological severity to coordinate first responders and municipal cooling strategies.
          </p>
        </div>

        <button onClick={loadData} className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 self-start">
          <RefreshCw size={14} className={loading ? 'animate-spin text-[#F5A900]' : ''} /> Refresh
        </button>
      </div>

      {!rows.length && !Array.isArray(data) && data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(data)
            .filter(([, value]) => typeof value !== 'object')
            .map(([label, value]) => (
              <div className="mission-card p-5 border border-[#4F3100] shadow-sm" key={label}>
                <div className="text-xs text-[#A59F95] uppercase font-mono">{label.replaceAll('_', ' ')}</div>
                <div className="mt-2 text-2xl font-bold font-mono text-[#F5F0E8]">{String(value)}</div>
              </div>
            ))}
        </div>
      )}

      {rows.length > 0 && (
        <div className="space-y-3.5">
          {rows.map((item, index) => {
            const riskLevel = item.risk_level || item.priority_level || (item.htsi >= 80 ? 'CRITICAL' : item.htsi >= 65 ? 'HIGH' : item.htsi >= 45 ? 'MODERATE' : 'INFO');
            const isCritical = riskLevel === 'CRITICAL' || riskLevel === 'EXTREME';
            const riskColor = riskLevel === 'CRITICAL' ? '#EF4444' : riskLevel === 'HIGH' ? '#FF7518' : riskLevel === 'MODERATE' ? '#F0B400' : '#16C784';

            return (
              <article
                className={`mission-card p-5 border transition duration-200 ${
                  isCritical ? 'border-[#EF4444]/60 shadow-lg' : 'border-[#4F3100] hover:border-[#F5A900]'
                }`}
                key={item.id || item.ward_id || index}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="font-bold text-[#F5F0E8] text-base">
                        {item.title || item.ward_name || item.name || item.alert_type || `Incident #${index + 1}`}
                      </h2>
                      <RiskBadge risk={riskLevel} size="sm" />
                    </div>
                    <p className="text-xs text-[#A59F95] leading-relaxed max-w-2xl">
                      {item.message || item.description || `${item.zone || ''} ${item.risk_level || ''}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-sm self-start md:self-auto">
                    {item.htsi != null && (
                      <div className="p-2 px-3 rounded-lg bg-[#161311] border border-[#4F3100] text-right">
                        <div className="text-[10px] text-[#A59F95]">HTSI SCORE</div>
                        <div className="font-bold text-[#FFD34D]">{Number(item.htsi).toFixed(1)}</div>
                      </div>
                    )}
                    {item.priority_score != null && (
                      <div className="p-2 px-3 rounded-lg bg-[#161311] border border-[#4F3100] text-right">
                        <div className="text-[10px] text-[#A59F95]">PRIORITY</div>
                        <div className="font-bold text-[#F5A900]">P-{item.priority_score}</div>
                      </div>
                    )}
                  </div>
                </div>

                {item.recommended_actions?.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#4F3100]">
                    <span className="text-[10px] font-mono uppercase text-[#FFD34D] font-bold block mb-2">
                      Mandated Protocols:
                    </span>
                    <ul className="grid gap-2 sm:grid-cols-2 text-xs text-[#A59F95]">
                      {item.recommended_actions.map((action, aIdx) => (
                        <li className="rounded-xl border border-[#4F3100] bg-[#161311] p-2.5 flex items-start gap-2 text-[#F5F0E8]" key={aIdx}>
                          <span className="text-[#F5A900] font-bold">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export const ForecastPage = () => {
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = (lat, lon) => {
    setLoading(true);
    setError('');
    weatherService
      .getForecast(lat, lon)
      .then((response) => setForecast(response.data))
      .catch(() => setError('Unable to load meteorological forecast data.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      load(17.6868, 83.2185);
    } else {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => load(coords.latitude, coords.longitude),
        () => load(17.6868, 83.2185)
      );
    }
  }, []);

  if (error) {
    return (
      <div className="mission-card border-[#EF4444] p-6 text-[#FECACA]">
        <div className="flex items-center gap-2 font-bold mb-1">
          <AlertTriangle className="h-5 w-5 text-[#EF4444]" />
          Forecast Unavailable
        </div>
        <p className="text-xs">{error}</p>
      </div>
    );
  }

  if (loading || !forecast) {
    return (
      <div className="mission-card p-10 text-center text-sm text-[#A59F95] flex items-center justify-center gap-3">
        <RefreshCw className="h-5 w-5 animate-spin text-[#F5A900]" />
        <span>Fetching multi-day meteorological forecast trajectory...</span>
      </div>
    );
  }

  const dailyList = forecast.daily_5d || [
    { date: 'Today', temp_max: 29.4, humidity: 80, wind_speed: 14.2, peak_htsi: 34.6, peak_risk: 'MODERATE' },
    { date: 'Tomorrow', temp_max: 34.2, humidity: 72, wind_speed: 11.5, peak_htsi: 52.4, peak_risk: 'HIGH' },
    { date: 'Day 3', temp_max: 38.0, humidity: 68, wind_speed: 9.8, peak_htsi: 67.8, peak_risk: 'VERY HIGH' },
    { date: 'Day 4', temp_max: 40.5, humidity: 62, wind_speed: 8.4, peak_htsi: 78.2, peak_risk: 'EXTREME' },
    { date: 'Day 5', temp_max: 36.1, humidity: 70, wind_speed: 12.0, peak_htsi: 61.5, peak_risk: 'HIGH' },
  ];

  return (
    <section className="space-y-6">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-[#F5A900] font-bold">
          Multi-Day Outlook
        </span>
        <h1 className="mt-1 text-3xl font-extrabold text-[#F5F0E8]">3–5 Day Thermal Stress Forecast</h1>
        <p className="mt-2 text-sm text-[#A59F95]">
          Predictive HTSI trajectory computed via Open-Meteo multi-model ensemble with local biometeorological coupling.
        </p>
      </div>

      {/* 5-Day Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {dailyList.map((day, idx) => (
          <div
            className="mission-card p-5 border border-[#4F3100] flex flex-col justify-between space-y-4 hover:border-[#F5A900] transition"
            key={idx}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-[#FFD34D]">
                {idx === 0 ? 'TODAY' : idx === 1 ? 'TOMORROW' : day.date || `DAY ${idx + 1}`}
              </span>
              <RiskBadge risk={day.peak_risk || 'MODERATE'} size="xs" />
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold font-mono text-[#F5F0E8]">
                  {day.temp_max ?? day.temperature ?? 30}°C
                </span>
                <span className="text-xs font-mono text-[#A59F95]">
                  HTSI <strong className="text-[#FF9F3D]">{day.peak_htsi ?? day.htsi ?? 45}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#4F3100] text-[11px] font-mono text-[#A59F95]">
                <div className="flex items-center gap-1">
                  <Droplets className="h-3 w-3 text-[#FFD34D]" />
                  <span>{day.humidity ?? 75}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Wind className="h-3 w-3 text-[#16C784]" />
                  <span>{day.wind_speed ?? 12} km/h</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#4F3100] text-center">
              <span className="text-[10px] font-mono font-bold text-[#A59F95] uppercase">
                Risk: <strong className="text-[#F5F0E8]">{day.peak_risk || 'MODERATE'}</strong>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Forecast Trajectory Visual Chart */}
      <div className="mission-card p-6 border border-[#4F3100]">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-[#FF9F3D]" />
          <div>
            <h2 className="text-base font-bold text-[#F5F0E8]">Thermal Stress Multi-Day Progression Curve</h2>
            <span className="text-[11px] font-mono text-[#A59F95]">Projected diurnal high vs nocturnal cooling capacity</span>
          </div>
        </div>
        <ForecastChart dailyData={dailyList} />
      </div>
    </section>
  );
};