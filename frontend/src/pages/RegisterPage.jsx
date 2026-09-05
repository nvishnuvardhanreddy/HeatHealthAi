import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { ShieldCheck, User, Building, Briefcase, BadgeCheck, AlertTriangle, ArrowRight } from 'lucide-react';

export const RegisterPage = () => {
  const navigate = useNavigate();
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

      await authService.register(payload);
      navigate('/verify-email', { state: { email: formData.email, role: role } });
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.errors) {
        const firstKey = Object.keys(resp.errors)[0];
        const firstVal = resp.errors[firstKey];
        setError(Array.isArray(firstVal) ? firstVal[0] : String(firstVal));
      } else if (resp?.detail) {
        setError(resp.detail);
      } else {
        setError('Registration failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="glass-panel p-8 md:p-10 border border-slate-800">
        <div className="text-center mb-8">
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">Account Onboarding</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Register for HeatHealthAI</h2>
          <p className="text-xs text-slate-400 mt-2">
            Create an account to monitor localized human thermal stress and configure early warning alerts.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Radio Switcher */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('CITIZEN')}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition ${
                  role === 'CITIZEN'
                    ? 'bg-cyan-950/40 border-cyan-500/60 shadow-sm shadow-cyan-500/20'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <User className={`h-5 w-5 mt-0.5 ${role === 'CITIZEN' ? 'text-cyan-400' : 'text-slate-500'}`} />
                <div>
                  <div className="text-xs font-bold text-white">Citizen Account</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Personal GPS thermal alerts & forecasts</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('GOVERNMENT_AUTHORITY')}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition ${
                  role === 'GOVERNMENT_AUTHORITY'
                    ? 'bg-amber-950/40 border-amber-500/60 shadow-sm shadow-amber-500/20'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <ShieldCheck className={`h-5 w-5 mt-0.5 ${role === 'GOVERNMENT_AUTHORITY' ? 'text-amber-400' : 'text-slate-500'}`} />
                <div>
                  <div className="text-xs font-bold text-white">Government Authority</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Municipal hotspots & intervention triggers</div>
                </div>
              </button>
            </div>
          </div>

          {/* Standard Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                placeholder="e.g. Dr. Rajesh Naidu"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder={role === 'GOVERNMENT_AUTHORITY' ? 'officer@ap.gov.in' : 'user@example.com'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number (Optional)</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98480 12345"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Government Authority Special Fields */}
          {role === 'GOVERNMENT_AUTHORITY' && (
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-4">
              <div className="flex items-start gap-2.5 text-xs text-amber-300">
                <BadgeCheck className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Government Verification Notice:</strong> Authority access requires email domain verification (.gov.in, .nic.in, .ap.gov.in) followed by administrative review. Selecting this account type does not automatically grant privileges.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Official Government Email</label>
                <input
                  type="email"
                  name="official_email"
                  required
                  value={formData.official_email}
                  onChange={handleChange}
                  placeholder="name@ap.gov.in or name@nic.in"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Department / Ministry</label>
                  <input
                    type="text"
                    name="department"
                    required
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="e.g. GVMC Disaster Management"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Designation / Title</label>
                  <input
                    type="text"
                    name="designation"
                    required
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder="e.g. Deputy Commissioner"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Officer / Employee ID (Optional)</label>
                <input
                  type="text"
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleChange}
                  placeholder="e.g. AP-GOV-2026-881"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* Password Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                name="password"
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirm_password"
                required
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Re-enter password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-dark-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition disabled:opacity-50"
          >
            {loading ? 'Creating Account & Dispatching OTP...' : 'Register & Receive OTP'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-400 font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
