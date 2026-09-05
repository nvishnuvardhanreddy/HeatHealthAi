import React, { useEffect, useState } from 'react';
import { alertService, weatherService } from '../services/api';
import { ShieldAlert, AlertTriangle, Activity, CheckCircle2 } from 'lucide-react';
import { RiskBadge } from '../components/StatusBadge';

const titles = {
  alerts: 'Localized Alerts & Warnings',
  interventions: 'Pre-emptive Municipal Interventions',
  priorities: 'Emergency Resource Priorities',
  actionPlan: 'Automated Heat Action Plan (HAP)',
};

export const OperationsPage = ({ kind }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const requests = {
      alerts: alertService.getAlerts,
      interventions: alertService.getInterventions,
      priorities: alertService.getEmergencyPriorities,
      actionPlan: alertService.getActionPlan,
    };
    if (requests[kind]) {
      requests[kind]()
        .then((response) => setData(response.data))
        .catch((err) => setError(err.response?.data?.detail || 'Unable to load this decision-support view.'));
    }
  }, [kind]);

  if (error) return <div className="glass-panel p-6 text-red-300 border border-red-500/40">{error}</div>;
  if (!data) return <div className="glass-panel p-6 text-stone-400">Loading {titles[kind]?.toLowerCase()}...</div>;

  const rows = Array.isArray(data) ? data : [];

  return (
    <section className="space-y-6">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
          Decision Support & Municipal Operations
        </span>
        <h1 className="mt-1 text-3xl font-extrabold text-cream-50">{titles[kind] || 'Operations'}</h1>
        <p className="mt-2 text-sm text-stone-400">
          Backend-generated operational data. This decision-support model guides municipal emergency services.
        </p>
      </div>

      {!rows.length && !Array.isArray(data) && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(data)
            .filter(([, value]) => typeof value !== 'object')
            .map(([label, value]) => (
              <div className="glass-panel p-5 rounded-2xl border border-stone-800 shadow-md" key={label}>
                <div className="text-xs text-stone-400 uppercase font-mono">{label.replaceAll('_', ' ')}</div>
                <div className="mt-2 text-xl font-bold text-cream-50">{String(value)}</div>
              </div>
            ))}
        </div>
      )}

      {rows.length > 0 && (
        <div className="space-y-3.5">
          {rows.map((item, index) => (
            <article className="glass-panel p-5 rounded-2xl border border-stone-800 shadow-md hover:border-amber-500/30 transition" key={item.id || item.ward_id || index}>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold text-cream-100 text-base">
                    {item.title || item.ward_name || item.name || item.alert_type || `Item ${index + 1}`}
                  </h2>
                  <p className="mt-1 text-sm text-stone-400 leading-relaxed">
                    {item.message || item.description || `${item.zone || ''} ${item.risk_level || ''}`}
                  </p>
                </div>
                <span className="text-sm font-mono font-bold text-amber-400 whitespace-nowrap">
                  {item.htsi != null ? `HTSI ${item.htsi}` : item.priority_score != null ? `Priority ${item.priority_score}` : item.priority_level || ''}
                </span>
              </div>
              {item.recommended_actions?.length > 0 && (
                <ul className="mt-4 grid gap-2 sm:grid-cols-2 text-xs text-stone-300">
                  {item.recommended_actions.map((action, aIdx) => (
                    <li className="rounded-xl border border-stone-800 bg-stone-900/60 p-2.5 flex items-start gap-2" key={aIdx}>
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export const ForecastPage = () => {
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = (lat, lon) =>
      weatherService
        .getForecast(lat, lon)
        .then((response) => setForecast(response.data))
        .catch(() => setError('Unable to load the forecast.'));

    if (!navigator.geolocation) {
      load(17.6868, 83.2185);
    } else {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => load(coords.latitude, coords.longitude),
        () => load(17.6868, 83.2185)
      );
    }
  }, []);

  if (error) return <div className="glass-panel p-6 text-red-300 border border-red-500/40">{error}</div>;
  if (!forecast) return <div className="glass-panel p-6 text-stone-400">Loading forecast...</div>;

  return (
    <section className="space-y-6">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">Forecast</span>
        <h1 className="mt-1 text-3xl font-extrabold text-cream-50">5-Day Heat Danger Forecast</h1>
        <p className="mt-2 text-sm text-stone-400">{forecast.source} · localized to your coordinates</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {forecast.daily_5d?.map((day, idx) => (
          <div className="glass-panel p-4 rounded-2xl border border-stone-800 shadow-md flex flex-col justify-between" key={idx}>
            <div className="text-xs font-mono text-stone-400">{day.date}</div>
            <div className="mt-3 text-2xl font-extrabold font-mono text-cream-50">{day.temp_max}°C</div>
            <div className="text-xs text-stone-400 mt-1 font-mono">HTSI {day.peak_htsi} · {day.peak_risk}</div>
          </div>
        ))}
      </div>
    </section>
  );
};