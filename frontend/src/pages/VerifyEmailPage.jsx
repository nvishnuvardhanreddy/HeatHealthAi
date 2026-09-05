import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuth } from '../auth/AuthContext';
import { Mail, CheckCircle2, AlertTriangle, RefreshCw, ArrowRight, ShieldCheck } from 'lucide-react';

export const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await authService.verifyEmail({ email: email.trim().toLowerCase(), otp: otp.trim() });
      const { tokens, user: userData } = res.data;

      if (tokens) {
        localStorage.setItem('heathealth_access_token', tokens.access);
        localStorage.setItem('heathealth_refresh_token', tokens.refresh);
      }
      if (userData) {
        localStorage.setItem('heathealth_user', JSON.stringify(userData));
        setUser(userData);
      }

      setMessage('Email verified successfully! Redirecting...');
      setTimeout(() => {
        if (userData?.role === 'GOVERNMENT_AUTHORITY') {
          navigate('/profile', { state: { justVerified: true } });
        } else {
          navigate('/dashboard');
        }
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired verification code. Please check your email and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError('');
    setMessage('');

    try {
      const res = await authService.resendVerification({ email: email.trim().toLowerCase() });
      setMessage(res.data?.message || 'A new 6-digit verification code has been dispatched to your email.');
      setCooldown(60);
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not resend code. Please wait a moment and try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="glass-panel p-8 md:p-10 border border-slate-800 text-center shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="h-14 w-14 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 mx-auto flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/20">
          <Mail className="h-7 w-7" />
        </div>

        <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">Security Verification</span>
        <h2 className="text-2xl font-extrabold text-white mt-1">Check Your Email</h2>
        <p className="text-xs text-slate-400 mt-2 mb-6 leading-relaxed">
          We have dispatched a 6-digit verification code to <br />
          <strong className="text-slate-100 font-semibold">{email || 'your registered email'}</strong>
        </p>

        {/* Security Notification */}
        <div className="mb-6 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 text-xs text-left flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-slate-200 block mb-0.5">Code sent via email</span>
            <span>Please check your inbox (and spam or junk folder). For security, codes are not displayed on screen.</span>
          </div>
        </div>

        {location.state?.emailDeliveryFailed && (
          <div className="mb-5 p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs text-left flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>
              We had trouble sending the initial email. Please click <strong>Resend Code</strong> below to re-dispatch the verification email.
            </span>
          </div>
        )}

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs text-left flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs text-left flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          {!location.state?.email && (
            <div className="text-left">
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 text-left">
              Enter 6-Digit Code
            </label>
            <input
              type="text"
              maxLength={6}
              autoFocus
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="••••••"
              className="w-full text-center tracking-[0.6em] text-2xl font-mono font-extrabold py-3 px-4 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
            />
            <span className="text-[11px] text-slate-500 font-mono mt-1.5 block">Code expires in 10 minutes</span>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-dark-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Email & Proceed'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400">Didn't receive the email?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || resending}
            className="text-cyan-400 font-semibold hover:underline flex items-center gap-1.5 disabled:text-slate-600 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${resending ? 'animate-spin' : ''}`} />
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
          </button>
        </div>
      </div>
    </div>
  );
};
