import React, { useEffect, useState } from 'react';
import { Activity, Check, Clock3, Database, RefreshCw, ShieldCheck, Users, X } from 'lucide-react';
import { systemService, authService } from '../services/api';
import { THEME } from '../theme';

const statCards = [
  { key: 'total_users', label: 'Registered Users', icon: Users, accent: 'text-[#F5A900]' },
  { key: 'pending_verifications', label: 'Pending Reviews', icon: Clock3, accent: 'text-[#FFD34D]' },
  { key: 'verified_authorities', label: 'Verified Authorities', icon: ShieldCheck, accent: 'text-[#16C784]' },
  { key: 'total_wards', label: 'Ward Datasets', icon: Database, accent: 'text-[#7C3AED]' },
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
          <span className="text-xs font-mono uppercase tracking-wider text-[#F5A900] font-bold">
            Restricted Administration
          </span>
          <h1 className="mt-1 text-3xl font-extrabold text-[#F5F0E8]">System Control Center</h1>
          <p className="mt-2 text-sm text-[#A59F95]">
            Review access, monitor platform health, and manage authority verification.
          </p>
        </div>
        <button onClick={load} disabled={loading} className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 self-start md:self-auto">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh Data
        </button>
      </header>

      {error && <div className="mission-card border-[#EF4444] p-4 text-sm text-[#FECACA]">{error}</div>}
      {notice && <div className="mission-card border-[#16C784] p-4 text-sm text-[#A7F3D0]">{notice}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ key, label, icon: Icon, accent }) => (
          <div className="mission-card p-5 border border-[#4F3100] shadow-sm" key={key}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#A59F95] font-medium">{label}</span>
              <Icon size={18} className={accent} />
            </div>
            <div className={`mt-3 text-3xl font-extrabold font-mono ${accent}`}>
              {stats?.[key] ?? '—'}
            </div>
            <div className="mt-1 text-[11px] text-[#706A62]">Current platform total</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.6fr] gap-6">
        <section className="mission-card p-6 border border-[#4F3100] shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#F5A900] font-bold">Governance Queue</span>
              <h2 className="mt-1 text-xl font-bold text-[#F5F0E8]">Government Verification</h2>
              <p className="mt-1 text-xs text-[#A59F95]">
                Review applicant credentials before granting municipal authority access.
              </p>
            </div>
            <div className="rounded-xl border border-[#4F3100] bg-[#161311] px-3.5 py-2 text-center">
              <div className="text-lg font-bold text-[#FFD34D] font-mono">{verifications.length}</div>
              <div className="text-[10px] uppercase text-[#A59F95] font-mono font-bold">Pending</div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {!loading && verifications.length === 0 && (
              <div className="rounded-xl border border-[#4F3100] bg-[#161311] p-6 text-sm text-[#A59F95] text-center">
                No pending applications. The queue is clear.
              </div>
            )}
            {verifications.map((item) => (
              <article key={item.id} className="rounded-2xl border border-[#4F3100] bg-[#161311] p-4 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-[#F5F0E8]">{item.applicant_name || item.applicant_email}</div>
                    <div className="mt-1 text-xs text-[#A59F95] font-mono">{item.applicant_email}</div>
                    <div className="mt-2 text-xs text-[#F5F0E8]">
                      {item.department} <span className="text-[#706A62]">·</span> {item.designation}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => approve(item.id)} disabled={reviewing} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5">
                      <Check size={15} /> Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelected(item);
                        setRejectionReason('');
                      }}
                      disabled={reviewing}
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 border-[#EF4444]/60 text-[#FECACA] hover:border-[#EF4444]"
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
          <section className="mission-card p-6 border border-[#4F3100] shadow-md">
            <div className="flex items-center gap-2 text-[#16C784] mb-4">
              <Activity size={18} />
              <h2 className="font-bold text-[#F5F0E8]">System Status</h2>
            </div>
            <div className="space-y-3 text-xs">
              {[
                ['Database Engine', 'Connected (PostGIS / SQLite)'],
                ['ML Calibration', stats?.ml_status?.status || 'Loaded (RF Ensemble)'],
                ['Demo Mode', stats?.demo_mode ? 'Enabled' : 'Disabled'],
                ['Access Control (RBAC)', 'Enforced'],
              ].map(([label, value]) => (
                <div className="flex items-center justify-between border-b border-[#4F3100] pb-3" key={label}>
                  <span className="text-[#A59F95]">{label}</span>
                  <span className="font-mono text-[#16C784] font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mission-card p-6 border border-[#4F3100] shadow-md">
            <h2 className="font-bold text-[#F5F0E8]">Administrator Scope</h2>
            <p className="mt-2 text-xs leading-relaxed text-[#A59F95]">
              This console manages role assignments and reviews authority credentials. Citizen personal location records are strictly encrypted and hidden.
            </p>
          </section>
        </aside>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0C0A09]/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#4F3100] bg-[#14110F] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#F5F0E8]">Reject Verification</h2>
              <button onClick={() => setSelected(null)} aria-label="Close rejection dialog" className="text-[#A59F95] hover:text-[#F5F0E8]">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-[#A59F95]">
              Provide a reason for rejecting {selected.applicant_name || selected.applicant_email}.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              rows={4}
              className="w-full p-3 rounded-xl bg-[#100E0D] border border-[#4F3100] text-[#F5F0E8] placeholder:text-[#706A62] text-xs focus:outline-none focus:border-[#F5A900] resize-none"
              placeholder="Explain required correction..."
            />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setSelected(null)} className="btn-secondary text-xs py-1.5 px-3.5">
                Cancel
              </button>
              <button
                onClick={reject}
                disabled={reviewing || rejectionReason.trim().length < 5}
                className="btn-secondary text-xs py-1.5 px-3.5 border-[#EF4444] text-[#FECACA] hover:bg-[#EF4444]/20"
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
