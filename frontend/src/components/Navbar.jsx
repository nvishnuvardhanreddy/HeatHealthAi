import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  Flame,
  ShieldCheck,
  Compass,
  Bell,
  User as UserIcon,
  LogOut,
  MapPin,
  Menu,
  X,
  Activity,
  Sliders,
  AlertTriangle
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isVerifiedAuthority, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-orange-500 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition">
              <div className="h-full w-full bg-dark-950 rounded-[10px] flex items-center justify-center">
                <Flame className="h-5 w-5 text-orange-400 group-hover:text-cyan-400 transition" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                  HEATHEALTH<span className="text-orange-400">AI</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Urban Thermal Intelligence</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                isActive('/') ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              Overview
            </Link>

            {/* Citizen / Shared Links */}
            <Link
              to="/dashboard"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                isActive('/dashboard') ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              Dashboard
            </Link>

            <Link
              to="/simulation"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                isActive('/simulation') ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              What-If Simulation
            </Link>
            {isAuthenticated && <>
              <Link to="/forecast" className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/40">Forecast</Link>
              <Link to="/alerts" className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/40">Alerts</Link>
            </>}

            {/* Verified Authority Portal Link */}
            {isVerifiedAuthority && (
              <Link
                to="/authority"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  isActive('/authority')
                    ? 'text-amber-400 bg-amber-950/40 border border-amber-500/40 shadow-sm shadow-amber-500/10'
                    : 'text-amber-300/80 hover:text-amber-300 hover:bg-amber-950/20'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Authority Portal
              </Link>
            )}

            {/* Admin Dashboard Link */}
            {isAdmin && (
              <Link
                to="/admin-dashboard"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  isActive('/admin-dashboard')
                    ? 'text-purple-400 bg-purple-950/40 border border-purple-500/40'
                    : 'text-purple-300/80 hover:text-purple-300 hover:bg-purple-950/20'
                }`}
              >
                <Activity className="h-3.5 w-3.5" />
                Admin Console
              </Link>
            )}
          </div>

          {/* User Status / Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* GPS Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
              <MapPin className="h-3 w-3 text-cyan-400" />
              <span>GPS location</span>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 transition"
                >
                  <UserIcon className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="max-w-[120px] truncate">{user.first_name || user.email}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-500/40 text-slate-400 hover:text-red-400 transition"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800/60 rounded-lg transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold text-dark-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 rounded-lg shadow-md shadow-cyan-500/20 transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-dark-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
          >
            Overview
          </Link>
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
          >
            Dashboard
          </Link>
          <Link
            to="/simulation"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
          >
            What-If Simulation
          </Link>

          {isVerifiedAuthority && (
            <Link
              to="/authority"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-amber-400 hover:bg-amber-950/20 font-medium"
            >
              Authority Command Portal
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin-dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-purple-400 hover:bg-purple-950/20 font-medium"
            >
              Admin Dashboard
            </Link>
          )}

          {isAuthenticated ? (
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-cyan-400"
              >
                Profile ({user.email})
              </Link>
              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="text-xs text-red-400 font-semibold"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-sm text-slate-200 bg-slate-800 rounded-lg"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-sm text-dark-950 bg-cyan-400 font-semibold rounded-lg"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
