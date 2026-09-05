import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';
import { Mail, ArrowLeft, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { THEME } from '../theme';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await authService.forgotPassword({ email: email.trim().toLowerCase() });
      setMessage(res.data.message || 'Password reset link sent to your email.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to process the request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-md mx-auto py-12 px-4">
      <div className="mission-card p-8 md:p-10 border border-[#4F3100] shadow-2xl">
        <span className="text-xs font-mono uppercase tracking-wider text-[#F5A900] font-bold">
          Account Recovery
        </span>
        <h1 className="mt-2 text-2xl font-extrabold text-[#F5F0E8]">Reset Your Password</h1>
        <p className="mt-2 text-xs text-[#A59F95]">
          A secure reset token will be sent to your registered email address.
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-[#14110F] border border-[#EF4444] text-xs text-[#FECACA] flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[#EF4444]" />
            <span>{error}</span>
          </div>
        )}
        {message && (
          <div className="mt-4 p-3 rounded-xl bg-[#14110F] border border-[#16C784] text-xs text-[#A7F3D0] flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#16C784]" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#A59F95] mb-1">Registered Email</label>
            <div className="relative">
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#100E0D] border border-[#4F3100] text-[#F5F0E8] placeholder:text-[#706A62] text-xs focus:outline-none focus:border-[#F5A900] focus:ring-1 focus:ring-[#F5A900]/40 transition"
              />
              <Mail className="h-4 w-4 text-[#F5A900] absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl btn-primary font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            {loading ? 'Sending Instructions...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-[#FFD34D] font-semibold hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </section>
  );
};