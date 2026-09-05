import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault(); setLoading(true); setError(''); setMessage('');
    try { setMessage((await authService.forgotPassword({ email: email.trim().toLowerCase() })).data.message); }
    catch (err) { setError(err.response?.data?.detail || 'Unable to process the request.'); }
    finally { setLoading(false); }
  };

  return <section className="max-w-md mx-auto py-12"><div className="glass-panel p-8"><span className="text-xs font-mono uppercase text-cyan-400">Account recovery</span><h1 className="mt-2 text-2xl font-bold text-white">Reset your password</h1><p className="mt-2 text-sm text-slate-400">A secure reset token will be sent to your registered email.</p>{error && <p className="mt-4 text-sm text-red-300">{error}</p>}{message && <p className="mt-4 text-sm text-emerald-300">{message}</p>}<form onSubmit={submit} className="mt-6 space-y-4"><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="field-input" /><button disabled={loading} className="action-button w-full justify-center">{loading ? 'Sending...' : 'Send reset token'}</button></form><Link to="/login" className="block mt-5 text-sm text-cyan-400">Back to login</Link></div></section>;
};