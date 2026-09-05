import React, { useEffect, useState } from 'react';
import { authService } from '../services/api';

export const ProfilePage = () => {
  const [profile, setProfile] = useState(null); const [error, setError] = useState('');
  useEffect(() => { authService.getProfile().then((response) => setProfile(response.data)).catch(() => setError('Unable to load your profile.')); }, []);
  if (error) return <div className="glass-panel p-6 text-red-300">{error}</div>;
  if (!profile) return <div className="glass-panel p-6 text-slate-400">Loading profile...</div>;
  return <section className="max-w-3xl mx-auto space-y-5"><div><span className="text-xs font-mono uppercase text-cyan-400">Account & privacy</span><h1 className="mt-1 text-3xl font-bold text-white">Your HeatHealthAI profile</h1></div><div className="glass-panel p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">{[['Name', `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Not provided'], ['Email', profile.email], ['Role', profile.role], ['Email status', profile.email_status || (profile.is_email_verified ? 'ACTIVE' : 'UNVERIFIED')], ['Government verification', profile.government_verification_status || 'NOT_APPLICABLE'], ['Location permission', profile.location_enabled ? 'Enabled' : 'Disabled'], ['Notifications', profile.notifications_enabled ? 'Enabled' : 'Disabled']].map(([label, value]) => <div key={label} className="rounded-lg border border-slate-800 bg-slate-900/60 p-4"><div className="text-xs text-slate-400">{label}</div><div className="mt-1 text-sm font-semibold text-white">{value}</div></div>)}</div><p className="text-xs text-slate-500">Exact locations are private and are used only to calculate localized risk and alerts.</p></section>;
};