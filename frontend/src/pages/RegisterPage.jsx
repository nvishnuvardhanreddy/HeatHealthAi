import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService, getApiBaseUrl, setCustomApiBaseUrl } from '../services/api';
import { useAuth } from '../auth/AuthContext';
import { ShieldCheck, User, Building, Briefcase, BadgeCheck, AlertTriangle, ArrowRight, Settings } from 'lucide-react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [role, setRole] = useState('CITIZEN'); // 'CITIZEN' | 'GOVERNMENT_AUTHORITY'
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    official_email: '',
    department: '',
    designation: '',
    employee_id: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [customUrl, setCustomUrl] = useState(getApiBaseUrl());

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirm_password: formData.confirm_password,
        role: role,
      };

      if (role === 'GOVERNMENT_AUTHORITY') {
        payload.official_email = formData.official_email || formData.email;
        payload.department = formData.department;
        payload.designation = formData.designation;
        payload.employee_id = formData.employee_id;
      }

      const res = await authService.register(payload);
      const { tokens, user: userData } = res.data;

      // Store auth tokens and user — no OTP verification needed
      if (tokens) {
        localStorage.setItem('heathealth_access_token', tokens.access);
        localStorage.setItem('heathealth_refresh_token', tokens.refresh);
      }
      if (userData) {
        localStorage.setItem('heathealth_user', JSON.stringify(userData));
        setUser(userData);
      }

      // Route based on role
      if (role === 'GOVERNMENT_AUTHORITY') {
        navigate('/profile', { state: { pendingNotice: true } });
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.errors) {
        // Extract the first field-level validation error message
        const firstKey = Object.keys(resp.errors)[0];
        const firstVal = resp.errors[firstKey];
        const msg = Array.isArray(firstVal) ? firstVal[0] : String(firstVal);
        setError(`${firstKey.replace(/_/g, ' ')}: ${msg}`);
      } else if (resp?.detail) {
        setError(resp.detail);
      } else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        setError(`Cannot reach backend server at "${getApiBaseUrl()}". Make sure your Render backend service is deployed and active.`);
        setShowApiConfig(true);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="glass-panel p-8 md:p-10 border border-stone-800 shadow-2xl">
        <div className="text-center mb-8">
          <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">Account Onboarding</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-cream-50 mt-1">Register for HeatHealthAI</h2>
          <p className="text-xs text-stone-400 mt-2">
            Create an account to monitor localized human thermal stress and configure early warning alerts.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{error}</span>
              {!showApiConfig && (
                <button
                  type="button"
                  onClick={() => setShowApiConfig(true)}
                  className="mt-1.5 text-amber-400 hover:underline block font-semibold text-[11px]"
                >
                  Configure Backend API URL
                </button>
              )}
            </div>
          </div>
        )}

        {showApiConfig && (
          <div className="mb-6 p-4 rounded-xl bg-stone-900 border border-amber-500/40 text-xs shadow-sm">
            <div className="font-semibold text-amber-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Settings className="h-3.5 w-3.5" />
                Backend API Connection
              </span>
              <button 
                type="button" 
                onClick={() => setShowApiConfig(false)}
                className="text-stone-400 hover:text-white"
              >✕</button>
            </div>
            <p className="text-stone-400 text-[11px] mb-2.5">
              If your Render backend Web Service has a unique URL, enter its URL here:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://your-backend.onrender.com/api"
                className="flex-1 px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-cream-100 text-xs font-mono focus:border-amber-500 outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  setCustomApiBaseUrl(customUrl);
                  setError('');
                  alert(`Backend API URL updated to: ${getApiBaseUrl()}`);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs transition"
              >
                Connect
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Radio Switcher */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
              Select Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('CITIZEN')}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition ${
                  role === 'CITIZEN'
                    ? 'bg-amber-950/40 border-amber-500/60 shadow-sm shadow-amber-500/20'
                    : 'bg-stone-900/60 border-stone-800 hover:border-stone-700'
                }`}
              >
                <User className={`h-5 w-5 mt-0.5 ${role === 'CITIZEN' ? 'text-amber-400' : 'text-stone-500'}`} />
                <div>
                  <div className="text-xs font-bold text-cream-50">Citizen Account</div>
                  <div className="text-[11px] text-stone-400 mt-0.5">Personal GPS thermal alerts & forecasts</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('GOVERNMENT_AUTHORITY')}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition ${
                  role === 'GOVERNMENT_AUTHORITY'
                    ? 'bg-amber-950/60 border-amber-500/80 shadow-sm shadow-amber-500/20'
                    : 'bg-stone-900/60 border-stone-800 hover:border-stone-700'
                }`}
              >
                <ShieldCheck className={`h-5 w-5 mt-0.5 ${role === 'GOVERNMENT_AUTHORITY' ? 'text-amber-400' : 'text-stone-500'}`} />
                <div>
                  <div className="text-xs font-bold text-cream-50">Government Authority</div>
                  <div className="text-[11px] text-stone-400 mt-0.5">Municipal hotspots & intervention triggers</div>
                </div>
              </button>
            </div>
          </div>

          {/* Standard Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">Full Name</label>
              <input
                type="text"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                placeholder="e.g. Dr. Rajesh Naidu"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-cream-100 placeholder:text-stone-500 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder={role === 'GOVERNMENT_AUTHORITY' ? 'officer@ap.gov.in' : 'user@example.com'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-cream-100 placeholder:text-stone-500 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">Phone Number (Optional)</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98480 12345"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-cream-100 placeholder:text-stone-500 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Government Authority Special Fields */}
          {role === 'GOVERNMENT_AUTHORITY' && (
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-4">
              <div className="flex items-start gap-2.5 text-xs text-amber-300">
                <BadgeCheck className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Government Verification Notice:</strong> Authority access requires email domain verification (.gov.in, .nic.in, .ap.gov.in) followed by administrative review. Selecting this account type does not automatically grant privileges.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">Official Government Email</label>
                <input
                  type="email"
                  name="official_email"
                  required
                  value={formData.official_email}
                  onChange={handleChange}
                  placeholder="name@ap.gov.in or name@nic.in"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-cream-100 placeholder:text-stone-500 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">Department / Ministry</label>
                  <input
                    type="text"
                    name="department"
                    required
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="e.g. GVMC Disaster Management"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-cream-100 placeholder:text-stone-500 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">Designation / Title</label>
                  <input
                    type="text"
                    name="designation"
                    required
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder="e.g. Deputy Commissioner"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-cream-100 placeholder:text-stone-500 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">Officer / Employee ID (Optional)</label>
                <input
                  type="text"
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleChange}
                  placeholder="e.g. AP-GOV-2026-881"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-cream-100 placeholder:text-stone-500 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* Password Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">Password</label>
              <input
                type="password"
                name="password"
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-cream-100 placeholder:text-stone-500 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirm_password"
                required
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Re-enter password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-cream-100 placeholder:text-stone-500 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account & Sign In'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-stone-400">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-400 font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
