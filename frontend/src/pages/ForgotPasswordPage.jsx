import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';
import { Mail, ArrowLeft, Send } from 'lucide-react';

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
      <div className="glass-panel p-8 md:p-10 border border-stone-800 shadow-2xl">
        <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
          Account Recovery
        </span>
        <h1 className="mt-2 text-2xl font-extrabold text-cream-50">Reset Your Password</h1>
        <p className="mt-2 text-xs text-stone-400">
          A secure reset token will be sent to your registered email address.
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-300">
            {error}
          </div>
        )}
        {message && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300">
            {message}
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">Registered Email</label>
            <div className="relative">
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-cream-100 placeholder:text-stone-500 text-xs focus:outline-none focus:border-amber-500"
              />
              <Mail className="h-4 w-4 text-stone-500 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            {loading ? 'Sending Instructions...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </section>
  );
};