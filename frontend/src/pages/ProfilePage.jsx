import React, { useEffect, useState } from 'react';
import { authService } from '../services/api';
import { User, Mail, ShieldCheck, Bell, MapPin, BadgeCheck, Clock } from 'lucide-react';
import { GovStatusBadge } from '../components/StatusBadge';
import { THEME } from '../theme';

export const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    authService
      .getProfile()
      .then((response) => setProfile(response.data))
      .catch(() => setError('Unable to load your profile.'));
  }, []);

  if (error) {
    return (
      <div className="mission-card border-[#EF4444] p-6 text-[#FECACA] max-w-3xl mx-auto">
        {error}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mission-card p-8 text-center text-[#A59F95] max-w-3xl mx-auto">
        Loading profile...
      </div>
    );
  }

  return (
    <section className="max-w-3xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-[#F5A900] font-bold">
          Account & Privacy
        </span>
        <h1 className="mt-1 text-3xl font-extrabold text-[#F5F0E8]">Your HeatHealthAI Profile</h1>
        <p className="mt-1 text-xs text-[#A59F95]">
          Account details, authority verification standing, and localized alert permissions.
        </p>
      </div>

      <div className="mission-card p-6 sm:p-8 space-y-6 border border-[#4F3100] shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#4F3100]">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-[#161311] border border-[#4F3100] flex items-center justify-center text-[#F5A900] text-lg font-bold shadow-sm">
              {profile.first_name ? profile.first_name[0] : (profile.email ? profile.email[0].toUpperCase() : 'U')}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#F5F0E8]">
                {`${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email}
              </h2>
              <span className="text-xs font-mono text-[#A59F95]">{profile.email}</span>
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
            <div key={label} className="rounded-2xl border border-[#4F3100] bg-[#161311] p-4 shadow-sm">
              <div className="flex items-center justify-between text-[#A59F95] text-xs mb-1">
                <span>{label}</span>
                <Icon className="h-3.5 w-3.5 text-[#F5A900]" />
              </div>
              <div className="text-sm font-semibold text-[#F5F0E8]">{val}</div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-[#706A62] font-mono">
        Exact coordinates are private and processed locally to synthesize localized HTSI stress forecasts.
      </p>
    </section>
  );
};