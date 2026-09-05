import React, { useEffect, useState } from 'react';
import { AlertTriangle, BarChart3, Building2, Flame, RefreshCw, Users, ShieldAlert } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { systemService } from '../services/api';
import { THEME } from '../theme';

const metricCards = [
  { key: 'total_wards_monitored', label: 'Wards Monitored', icon: Building2, color: 'text-[#F5A900]' },
  { key: 'extreme_risk_wards_count', label: 'Extreme-Risk Wards', icon: Flame, color: 'text-[#7C3AED]' },
  { key: 'very_high_risk_wards_count', label: 'Very-High-Risk Wards', icon: AlertTriangle, color: 'text-[#EF4444]' },
  { key: 'population_exposed_high_risk', label: 'Population Exposed', icon: Users, color: 'text-[#FFD34D]' },
];

export const AuthorityDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await systemService.getAuthorityDashboard();
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load authority analysis.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const chartData = data?.extreme_wards?.map((ward) => ({
    name: ward.name,
    htsi: Number(ward.htsi),
    population: Number(ward.population),
  })) || [];

  return (
    <section className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-[#F5A900] font-bold">
              Verified Government Authority Portal
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#F5F0E8]">Heat Response & Strategic Analysis</h1>
          <p className="mt-2 text-sm text-[#A59F95] leading-relaxed max-w-3xl">
            Aggregated ward-level intelligence for municipal planning, cooling shelter deployments, and civil defense triggers. Individual citizen locations are strictly protected and excluded.
          </p>
        </div>

        <button onClick={load} disabled={loading} className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 self-start md:self-auto">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh Analysis
        </button>
      </header>

      {error && (
        <div className="mission-card border-[#EF4444] p-4 text-sm text-[#FECACA]">
          {error}
        </div>
      )}

      {loading && (
        <div className="mission-card p-10 text-center text-sm text-[#A59F95] flex items-center justify-center gap-3">
          <RefreshCw className="h-5 w-5 animate-spin text-[#F5A900]" />
          <span>Synthesizing authority analytics...</span>
        </div>
      )}

      {!loading && data && (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metricCards.map(({ key, label, icon: Icon, color }) => (
              <div className="mission-card p-5 border border-[#4F3100] shadow-sm" key={key}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#A59F95] font-medium">{label}</span>
                  <Icon size={18} className={color} />
                </div>
                <div className={`mt-3 text-2xl font-extrabold font-mono ${color}`}>
                  {Number(data.summary_metrics?.[key] || 0).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.65fr] gap-6">
            {/* Extreme Ward Comparison Chart */}
            <section className="mission-card p-6 border border-[#4F3100] shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={18} className="text-[#F5A900]" />
                <div>
                  <h2 className="font-bold text-[#F5F0E8]">Extreme Ward Comparison</h2>
                  <p className="text-xs text-[#A59F95]">HTSI Index by highest-priority municipal zone</p>
                </div>
              </div>

              <div className="mt-5 h-72">
                {chartData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid stroke="#231F1C" vertical={false} />
                      <XAxis dataKey="name" stroke="#706A62" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} stroke="#706A62" tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          background: '#14110F',
                          border: '1px solid #4F3100',
                          borderRadius: '12px',
                          color: '#F5F0E8',
                        }}
                      />
                      <Bar dataKey="htsi" name="HTSI" fill="#7C3AED" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[#A59F95]">
                    No extreme-risk ward data available.
                  </div>
                )}
              </div>
            </section>

            {/* Alert Operations Breakdown */}
            <aside className="mission-card p-6 border border-[#4F3100] shadow-md flex flex-col justify-between">
              <div>
                <h2 className="font-bold text-[#F5F0E8]">Alert Operations</h2>
                <div className="mt-5 space-y-3.5">
                  {[
                    ['Alerts Issued (24h)', data.alert_statistics?.total_alerts_issued_24h],
                    ['Extreme Alerts', data.alert_statistics?.extreme_alerts_count],
                    ['Extreme Population', data.summary_metrics?.population_in_extreme_danger],
                  ].map(([label, value]) => (
                    <div className="flex items-center justify-between border-b border-[#4F3100] pb-3" key={label}>
                      <span className="text-xs text-[#A59F95]">{label}</span>
                      <span className="font-mono font-bold text-[#FFD34D]">
                        {Number(value || 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-[#4F3100] bg-[#161311] p-3.5 text-xs leading-relaxed text-[#FFD34D]">
                Use these aggregates to prioritize cooling hydration resources, worker shifts, and emergency response.
              </div>
            </aside>
          </div>

          {/* Priority Response Queue */}
          <section className="mission-card p-6 border border-[#4F3100] shadow-md">
            <h2 className="font-bold text-[#F5F0E8] mb-4">Priority Response Queue</h2>
            <div className="grid gap-3">
              {(data.emergency_priorities || []).map((priority) => (
                <div
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-xl border border-[#4F3100] bg-[#161311] p-3.5 hover:border-[#F5A900] transition"
                  key={priority.ward_id}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#14110F] border border-[#7C3AED] text-sm font-bold text-purple-300">
                    {priority.rank}
                  </span>
                  <div>
                    <div className="font-semibold text-[#F5F0E8]">{priority.ward_name}</div>
                    <div className="text-xs text-[#A59F95]">
                      {priority.zone} · population {Number(priority.population || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-purple-300">HTSI {priority.htsi}</div>
                    <div className="text-xs font-semibold text-[#FFD34D]">Priority {priority.priority_score}</div>
                  </div>
                </div>
              ))}
              {!data.emergency_priorities?.length && (
                <p className="text-sm text-[#A59F95]">No emergency priorities are currently available.</p>
              )}
            </div>
          </section>
        </>
      )}
    </section>
  );
};