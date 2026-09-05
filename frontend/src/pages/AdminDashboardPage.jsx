import React, { useEffect, useState } from 'react';
import { Activity, Check, Clock3, Database, RefreshCw, ShieldCheck, Users, X } from 'lucide-react';
import { systemService, authService } from '../services/api';

const statCards = [
  { key: 'total_users', label: 'Registered users', icon: Users, accent: 'text-cyan-300' },
  { key: 'pending_verifications', label: 'Pending reviews', icon: Clock3, accent: 'text-amber-300' },
  { key: 'verified_authorities', label: 'Verified authorities', icon: ShieldCheck, accent: 'text-emerald-300' },
  { key: 'total_wards', label: 'Ward datasets', icon: Database, accent: 'text-purple-300' },
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
    setLoading(true); setError('');
    try {
      const [statsResponse, verificationResponse] = await Promise.all([
        systemService.getAdminStats(),
        authService.getVerifications('PENDING'),
      ]);
      setStats(statsResponse.data);
      setVerifications(verificationResponse.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load administration data.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    setReviewing(true); setError('');
    try { await authService.reviewVerification(id, 'approve', {}); setNotice('Authority verification approved.'); setSelected(null); await load(); }
    catch (err) { setError(err.response?.data?.detail || 'Approval failed.'); }
    finally { setReviewing(false); }
  };

  const reject = async () => {
    if (!selected || rejectionReason.trim().length < 5) return;
    setReviewing(true); setError('');
    try { await authService.reviewVerification(selected.id, 'reject', { reason: rejectionReason.trim() }); setNotice('Authority verification rejected.'); setSelected(null); setRejectionReason(''); await load(); }
    catch (err) { setError(err.response?.data?.detail || 'Rejection failed.'); }
    finally { setReviewing(false); }
  };

  return <section className="space-y-7">
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div><span className="text-xs font-mono uppercase tracking-wider text-purple-300">Restricted administration</span><h1 className="mt-1 text-3xl font-extrabold text-white">System control center</h1><p className="mt-2 text-sm text-slate-400">Review access, monitor platform health, and manage authority verification.</p></div>
      <button onClick={load} disabled={loading} className="action-button"><RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh data</button>
    </header>

    {error && <div className="glass-panel border-red-500/40 p-4 text-sm text-red-300">{error}</div>}
    {notice && <div className="glass-panel border-emerald-500/40 p-4 text-sm text-emerald-300">{notice}</div>}

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map(({ key, label, icon: Icon, accent }) => <div className="glass-panel p-5" key={key}><div className="flex items-center justify-between"><span className="text-xs text-slate-400">{label}</span><Icon size={17} className={accent} /></div><div className={`mt-3 text-3xl font-bold ${accent}`}>{stats?.[key] ?? '—'}</div><div className="mt-1 text-[11px] text-slate-500">Current platform total</div></div>)}
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.6fr] gap-5">
      <section className="glass-panel p-6"><div className="flex items-start justify-between gap-4"><div><span className="text-[11px] font-mono uppercase tracking-wider text-amber-300">Governance queue</span><h2 className="mt-1 text-xl font-bold text-white">Government verification</h2><p className="mt-1 text-xs text-slate-400">Domain eligibility is not approval. Review each application before granting authority access.</p></div><div className="rounded-lg border border-amber-500/30 bg-amber-950/30 px-3 py-2 text-center"><div className="text-lg font-bold text-amber-200">{verifications.length}</div><div className="text-[10px] uppercase text-amber-300/70">Pending</div></div></div><div className="mt-5 space-y-3">{!loading && verifications.length === 0 && <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-5 text-sm text-slate-400">No pending applications. The queue is clear.</div>}{verifications.map((item) => <article key={item.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"><div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"><div><div className="font-semibold text-white">{item.applicant_name || item.applicant_email}</div><div className="mt-1 text-xs text-slate-400">{item.applicant_email}</div><div className="mt-2 text-xs text-slate-300">{item.department} <span className="text-slate-600">·</span> {item.designation}</div></div><div className="flex gap-2"><button onClick={() => approve(item.id)} disabled={reviewing} className="action-button"><Check size={15} /> Approve</button><button onClick={() => { setSelected(item); setRejectionReason(''); }} disabled={reviewing} className="action-button border-red-500/40 text-red-300"><X size={15} /> Reject</button></div></div></article>)}</div></section>
      <aside className="space-y-5"><section className="glass-panel p-6"><div className="flex items-center gap-2 text-emerald-300"><Activity size={17} /><h2 className="font-bold text-white">System status</h2></div><div className="mt-4 space-y-3 text-xs">{[['Database', 'Connected'], ['ML model', stats?.ml_status?.status || 'Loaded'], ['Demo mode', stats?.demo_mode ? 'Enabled' : 'Disabled'], ['Access control', 'Enforced']].map(([label, value]) => <div className="flex items-center justify-between border-b border-slate-800 pb-3" key={label}><span className="text-slate-400">{label}</span><span className="font-mono text-emerald-300">{value}</span></div>)}</div></section><section className="rounded-xl border border-purple-500/20 bg-purple-950/20 p-6"><h2 className="font-bold text-white">Administrator scope</h2><p className="mt-2 text-xs leading-relaxed text-slate-400">This console can review authority applications and inspect platform totals. Citizen GPS coordinates and notification subscriptions are never exposed here.</p></section></aside>
    </div>

    {selected && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4"><div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-lg font-bold text-white">Reject verification</h2><button onClick={() => setSelected(null)} aria-label="Close rejection dialog" className="text-slate-400 hover:text-white"><X size={18} /></button></div><p className="mt-2 text-xs text-slate-400">Provide a reason for rejecting {selected.applicant_name || selected.applicant_email}.</p><textarea value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} rows={4} className="field-input resize-none" placeholder="Explain what requires correction..." /><div className="mt-4 flex justify-end gap-2"><button onClick={() => setSelected(null)} className="icon-button px-4 text-xs">Cancel</button><button onClick={reject} disabled={reviewing || rejectionReason.trim().length < 5} className="action-button border-red-500/40 text-red-300">{reviewing ? 'Rejecting...' : 'Confirm rejection'}</button></div></div></div>}
  </section>;
};
