import React, { useEffect, useState } from 'react';
import { authService } from '../services/api';
import { User, Mail, ShieldCheck, Bell, MapPin, BadgeCheck, Clock } from 'lucide-react';
import { GovStatusBadge } from '../components/StatusBadge';

export const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    authService
      .getProfile()
      .then((response) => setProfile(response.data))
      .catch(() => setError('Unable to load your profile.'));
  }, []);

  if (error) return <div className="glass-panel p-6 text-red-300 border border-red-500/40 max-w-3xl mx-auto">{error}</div>;
  if (!profile) return <div className="glass-panel p-6 text-stone-400 max-w-3xl mx-auto">Loading profile...</div>;

  return (
    <section className="max-w-3xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
          Account & Privacy
        </span>
        <h1 className="mt-1 text-3xl font-extrabold text-cream-50">Your HeatHealthAI Profile</h1>
        <p className="mt-1 text-xs text-stone-400">
          Account details, authority verification standing, and localized alert permissions.
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 space-y-6 border border-stone-800 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 text-lg font-bold">
              {profile.first_name ? profile.first_name[0] : (profile.email ? profile.email[0].toUpperCase() : 'U')}
            </div>
            <div>
              <h2 className="text-lg font-bold text-cream-100">
                {`${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email}
              </h2>
              <span className="text-xs font-mono text-stone-400">{profile.email}</span>
            </div>
          </div>

          <GovStatusBadge status={profile.government_verification_status || (profile.role === 'GOVERNMENT_AUTHORITY' ? 'PENDING' : 'NOT_APPLICABLE')} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Full Name', val: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Not provided', icon: User },
            { label: 'Email Address', val: profile.email, icon: Mail },
            { label: 'Account Role', val: profile.role, icon: ShieldCheck },
            { label: 'Email Status', val: profile.email_status || (profile.is_email_verified ? 'ACTIVE' : 'ACTIVE'), icon: BadgeCheck },
            { label: 'Location Permission', val: profile.location_enabled ? 'Enabled' : 'Enabled for GPS Risk', icon: MapPin },
            { label: 'Push Notifications', val: profile.notifications_enabled ? 'Enabled' : 'Disabled', icon: Bell },
          ].map(({ label, val, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-stone-800 bg-stone-900/60 p-4 shadow-sm">
              <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
                <span>{label}</span>
                <Icon className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <div className="text-sm font-semibold text-cream-100">{val}</div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-stone-500 font-mono">
        Exact coordinates are private and processed locally to synthesize localized HTSI stress forecasts.
      </p>
    </section>
  );
};