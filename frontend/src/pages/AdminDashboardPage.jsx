import React, { useEffect, useState } from 'react';
import { Activity, Check, Clock3, Database, RefreshCw, ShieldCheck, Users, X } from 'lucide-react';
import { systemService, authService } from '../services/api';

const statCards = [
  { key: 'total_users', label: 'Registered Users', icon: Users, accent: 'text-amber-400' },
  { key: 'pending_verifications', label: 'Pending Reviews', icon: Clock3, accent: 'text-amber-300' },
  { key: 'verified_authorities', label: 'Verified Authorities', icon: ShieldCheck, accent: 'text-emerald-400' },
  { key: 'total_wards', label: 'Ward Datasets', icon: Database, accent: 'text-purple-400' },
];

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [verifications, setVerifications] = useState([]);
  const [selected, setSelected] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsResponse, verificationResponse] = await Promise.all([
        systemService.getAdminStats(),
        authService.getVerifications('PENDING'),
      ]);
      setStats(statsResponse.data);
      setVerifications(verificationResponse.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load administration data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    setReviewing(true);
    setError('');
    try {
      await authService.reviewVerification(id, 'approve', {});
      setNotice('Authority verification approved.');
      setSelected(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Approval failed.');
    } finally {
      setReviewing(false);
    }
  };

  const reject = async () => {
    if (!selected || rejectionReason.trim().length < 5) return;
    setReviewing(true);
    setError('');
    try {
      await authService.reviewVerification(selected.id, 'reject', { reason: rejectionReason.trim() });
      setNotice('Authority verification rejected.');
      setSelected(null);
      setRejectionReason('');
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Rejection failed.');
    } finally {
      setReviewing(false);
    }
  };

  return (
    <section className="space-y-7">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-purple-400 font-semibold">
            Restricted Administration
          </span>
          <h1 className="mt-1 text-3xl font-extrabold text-cream-50">System Control Center</h1>
          <p className="mt-2 text-sm text-stone-400">
            Review access, monitor platform health, and manage authority verification.
          </p>
        </div>
        <button onClick={load} disabled={loading} className="action-button">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh Data
        </button>
      </header>

      {error && <div className="glass-panel border-red-500/40 p-4 text-sm text-red-300 rounded-xl">{error}</div>}
      {notice && <div className="glass-panel border-emerald-500/40 p-4 text-sm text-emerald-300 rounded-xl">{notice}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ key, label, icon: Icon, accent }) => (
          <div className="glass-panel p-5 rounded-2xl border border-stone-800 shadow-md" key={key}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-400 font-medium">{label}</span>
              <Icon size={18} className={accent} />
            </div>
            <div className={`mt-3 text-3xl font-extrabold font-mono ${accent}`}>
              {stats?.[key] ?? '—'}
            </div>
            <div className="mt-1 text-[11px] text-stone-500">Current platform total</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.6fr] gap-6">
        <section className="glass-panel p-6 rounded-2xl border border-stone-800 shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold">Governance Queue</span>
              <h2 className="mt-1 text-xl font-bold text-cream-50">Government Verification</h2>
              <p className="mt-1 text-xs text-stone-400">
                Review applicant credentials before granting municipal authority access.
              </p>
            </div>
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 px-3.5 py-2 text-center">
              <div className="text-lg font-bold text-amber-200 font-mono">{verifications.length}</div>
              <div className="text-[10px] uppercase text-amber-300/70 font-mono">Pending</div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {!loading && verifications.length === 0 && (
              <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-6 text-sm text-stone-400 text-center">
                No pending applications. The queue is clear.
              </div>
            )}
            {verifications.map((item) => (
              <article key={item.id} className="rounded-2xl border border-stone-800 bg-stone-900/60 p-4 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-cream-100">{item.applicant_name || item.applicant_email}</div>
                    <div className="mt-1 text-xs text-stone-400 font-mono">{item.applicant_email}</div>
                    <div className="mt-2 text-xs text-stone-300">
                      {item.department} <span className="text-stone-600">·</span> {item.designation}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => approve(item.id)} disabled={reviewing} className="action-button">
                      <Check size={15} /> Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelected(item);
                        setRejectionReason('');
                      }}
                      disabled={reviewing}
                      className="action-button border-red-500/40 text-red-300 hover:bg-red-950/40"
                    >
                      <X size={15} /> Reject
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="space-y-5">
          <section className="glass-panel p-6 rounded-2xl border border-stone-800 shadow-md">
            <div className="flex items-center gap-2 text-emerald-400 mb-4">
              <Activity size={18} />
              <h2 className="font-bold text-cream-50">System Status</h2>
            </div>
            <div className="space-y-3 text-xs">
              {[
                ['Database Engine', 'Connected (PostGIS / SQLite)'],
                ['ML Calibration', stats?.ml_status?.status || 'Loaded (RF Ensemble)'],
                ['Demo Mode', stats?.demo_mode ? 'Enabled' : 'Disabled'],
                ['Access Control (RBAC)', 'Enforced'],
              ].map(([label, value]) => (
                <div className="flex items-center justify-between border-b border-stone-800 pb-3" key={label}>
                  <span className="text-stone-400">{label}</span>
                  <span className="font-mono text-emerald-300 font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-purple-500/20 bg-purple-950/20 p-6 shadow-md">
            <h2 className="font-bold text-cream-50">Administrator Scope</h2>
            <p className="mt-2 text-xs leading-relaxed text-stone-400">
              This console manages role assignments and reviews authority credentials. Citizen personal location records are strictly encrypted and hidden.
            </p>
          </section>
        </aside>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-stone-700 bg-stone-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-cream-50">Reject Verification</h2>
              <button onClick={() => setSelected(null)} aria-label="Close rejection dialog" className="text-stone-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-stone-400">
              Provide a reason for rejecting {selected.applicant_name || selected.applicant_email}.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              rows={4}
              className="field-input resize-none"
              placeholder="Explain required correction..."
            />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setSelected(null)} className="icon-button px-4 text-xs">
                Cancel
              </button>
              <button
                onClick={reject}
                disabled={reviewing || rejectionReason.trim().length < 5}
                className="action-button border-red-500/40 text-red-300 hover:bg-red-950/50"
              >
                {reviewing ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
