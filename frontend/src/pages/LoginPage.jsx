import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getApiBaseUrl, setCustomApiBaseUrl } from '../services/api';
import { Lock, Mail, AlertTriangle, ArrowRight, ShieldCheck, Settings } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [customUrl, setCustomUrl] = useState(getApiBaseUrl());

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(formData.email.trim().toLowerCase(), formData.password);

      // Route by role and status
      if (user.role === 'ADMIN') {
        navigate('/admin-dashboard');
      } else if (user.role === 'GOVERNMENT_AUTHORITY') {
        if (user.is_verified_authority) {
          navigate('/authority');
        } else {
          navigate('/profile', { state: { pendingNotice: true } });
        }
      } else {
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from);
      }
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.requires_email_verification) {
        navigate('/verify-email', { state: { email: formData.email } });
      } else if (resp?.detail) {
        setError(resp.detail);
      } else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        setError(`Cannot reach backend server at "${getApiBaseUrl()}". Make sure your Render backend service is deployed and active.`);
        setShowApiConfig(true);
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="mission-card p-8 md:p-10 border border-[#4F3100] shadow-2xl">
        <div className="text-center mb-8">
          <span className="text-xs font-mono uppercase tracking-wider text-[#F5A900] font-bold">Secure Access</span>
          <h2 className="text-2xl font-extrabold text-[#F5F0E8] mt-1">Sign In to HeatHealthAI</h2>
          <p className="text-xs text-[#A59F95] mt-2">
            Access localized thermal stress early warning and emergency monitoring tools.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-[#14110F] border border-[#EF4444] text-[#FECACA] text-xs flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-[#EF4444] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{error}</span>
              {!showApiConfig && (
                <button
                  type="button"
                  onClick={() => setShowApiConfig(true)}
                  className="mt-1.5 text-[#FFD34D] hover:underline block font-semibold text-[11px]"
                >
                  Configure Backend API URL
                </button>
              )}
            </div>
          </div>
        )}

        {showApiConfig && (
          <div className="mb-5 p-3.5 rounded-xl bg-[#161311] border border-[#4F3100] text-xs shadow-sm">
            <div className="font-semibold text-[#FFD34D] mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Settings className="h-3.5 w-3.5" />
                Backend API Connection
              </span>
              <button 
                type="button" 
                onClick={() => setShowApiConfig(false)}
                className="text-[#A59F95] hover:text-[#F5F0E8]"
              >✕</button>
            </div>
            <p className="text-[#A59F95] text-[11px] mb-2.5">
              If your Render backend Web Service has a unique URL, enter it here:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://your-backend.onrender.com/api"
                className="flex-1 px-3 py-1.5 rounded-lg bg-[#100E0D] border border-[#4F3100] text-[#F5F0E8] text-xs font-mono focus:border-[#F5A900] outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  setCustomApiBaseUrl(customUrl);
                  setError('');
                  alert(`Backend API URL updated to: ${getApiBaseUrl()}`);
                }}
                className="btn-primary text-xs py-1.5 px-3"
              >
                Connect
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#A59F95] mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com or officer@ap.gov.in"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#100E0D] border border-[#4F3100] text-[#F5F0E8] placeholder:text-[#706A62] text-xs focus:outline-none focus:border-[#F5A900] focus:ring-1 focus:ring-[#F5A900]/40 transition"
              />
              <Mail className="h-4 w-4 text-[#F5A900] absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-[#A59F95]">Password</label>
              <Link to="/forgot-password" className="text-[11px] text-[#FFD34D] hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#100E0D] border border-[#4F3100] text-[#F5F0E8] placeholder:text-[#706A62] text-xs focus:outline-none focus:border-[#F5A900] focus:ring-1 focus:ring-[#F5A900]/40 transition"
              />
              <Lock className="h-4 w-4 text-[#F5A900] absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl btn-primary font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Demo Quick Sign-in Shortcuts */}
        <div className="mt-8 pt-6 border-t border-[#4F3100]">
          <span className="text-[10px] font-mono uppercase text-[#A59F95] block mb-2 text-center">
            Demo Credentials (Pre-seeded):
          </span>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => setFormData({ email: 'officer.vizag@ap.gov.in', password: 'Officer123!' })}
              className="p-2 rounded-xl bg-[#161311] border border-[#4F3100] text-[#FFD34D] hover:border-[#F5A900] text-left transition"
            >
              <div className="font-bold">Gov Officer</div>
              <div className="text-[10px] text-[#A59F95] truncate">officer.vizag@ap.gov.in</div>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ email: 'admin@heathealthai.org', password: 'Admin123!' })}
              className="p-2 rounded-xl bg-[#161311] border border-[#4F3100] text-purple-300 hover:border-purple-500 text-left transition"
            >
              <div className="font-bold">Admin</div>
              <div className="text-[10px] text-[#A59F95] truncate">admin@heathealthai.org</div>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ email: 'commissioner.urban@gov.in', password: 'Pending123!' })}
              className="p-2 rounded-xl bg-[#161311] border border-[#4F3100] text-[#F5F0E8] hover:border-[#F5A900] text-left transition"
            >
              <div className="font-bold">Pending Gov</div>
              <div className="text-[10px] text-[#A59F95] truncate">commissioner.urban@gov.in</div>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ email: 'citizen@example.com', password: 'Citizen123!' })}
              className="p-2 rounded-xl bg-[#161311] border border-[#4F3100] text-[#FFD34D] hover:border-[#F5A900] text-left transition"
            >
              <div className="font-bold">Citizen</div>
              <div className="text-[10px] text-[#A59F95] truncate">citizen@example.com</div>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-[#A59F95]">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#FFD34D] font-semibold hover:underline">
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
};
