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
    <nav className="sticky top-0 z-50 bg-dark-950/90 backdrop-blur-xl border-b border-stone-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 p-0.5 shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition">
              <div className="h-full w-full bg-dark-950 rounded-[10px] flex items-center justify-center">
                <Flame className="h-5 w-5 text-orange-400 group-hover:text-amber-300 transition" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-cream-50 via-cream-200 to-amber-400 bg-clip-text text-transparent">
                  HEATHEALTH<span className="text-amber-400">AI</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-400">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] text-stone-400 font-mono tracking-wider uppercase">Urban Thermal Intelligence</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                isActive('/') ? 'text-amber-400 bg-amber-950/40 border border-amber-500/30' : 'text-stone-300 hover:text-white hover:bg-stone-800/40'
              }`}
            >
              Overview
            </Link>

            {/* Citizen / Shared Links */}
            <Link
              to="/dashboard"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                isActive('/dashboard') ? 'text-amber-400 bg-amber-950/40 border border-amber-500/30' : 'text-stone-300 hover:text-white hover:bg-stone-800/40'
              }`}
            >
              Dashboard
            </Link>

            <Link
              to="/simulation"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                isActive('/simulation') ? 'text-amber-400 bg-amber-950/40 border border-amber-500/30' : 'text-stone-300 hover:text-white hover:bg-stone-800/40'
              }`}
            >
              What-If Simulation
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/forecast"
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    isActive('/forecast') ? 'text-amber-400 bg-amber-950/40 border border-amber-500/30' : 'text-stone-300 hover:text-white hover:bg-stone-800/40'
                  }`}
                >
                  Forecast
                </Link>
                <Link
                  to="/alerts"
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    isActive('/alerts') ? 'text-amber-400 bg-amber-950/40 border border-amber-500/30' : 'text-stone-300 hover:text-white hover:bg-stone-800/40'
                  }`}
                >
                  Alerts
                </Link>
              </>
            )}

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
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-900 border border-stone-800 text-[11px] text-stone-300">
              <MapPin className="h-3 w-3 text-amber-400" />
              <span>GPS location</span>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-800 text-xs font-medium text-cream-100 transition shadow-sm"
                >
                  <UserIcon className="h-3.5 w-3.5 text-amber-400" />
                  <span className="max-w-[120px] truncate">{user.first_name || user.email}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-xl bg-stone-900 hover:bg-red-950/40 border border-stone-800 hover:border-red-500/40 text-stone-400 hover:text-red-400 transition"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-medium text-stone-200 hover:text-white hover:bg-stone-800/60 rounded-xl transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-bold text-stone-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-md shadow-amber-500/20 transition"
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
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-stone-950 border-b border-stone-800 px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm text-stone-200 hover:bg-stone-900"
          >
            Overview
          </Link>
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm text-stone-200 hover:bg-stone-900"
          >
            Dashboard
          </Link>
          <Link
            to="/simulation"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm text-stone-200 hover:bg-stone-900"
          >
            What-If Simulation
          </Link>

          {isVerifiedAuthority && (
            <Link
              to="/authority"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm text-amber-400 hover:bg-amber-950/20 font-medium"
            >
              Authority Command Portal
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin-dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm text-purple-400 hover:bg-purple-950/20 font-medium"
            >
              Admin Dashboard
            </Link>
          )}

          {isAuthenticated ? (
            <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-amber-400"
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
            <div className="pt-2 border-t border-stone-800 grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-sm text-stone-200 bg-stone-900 rounded-xl"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-sm text-stone-950 bg-amber-400 font-bold rounded-xl"
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
