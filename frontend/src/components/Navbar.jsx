import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  Flame,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  MapPin,
  Menu,
  X,
  Activity,
  Compass,
  Bell,
  Sliders
} from 'lucide-react';
import { THEME } from '../theme';

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
    <nav className="sticky top-0 z-50 bg-[#080808]/95 backdrop-blur-xl border-b border-[#4F3E1B] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#F5C842] p-0.5 shadow-lg shadow-[#D4AF37]/20 group-hover:shadow-[#D4AF37]/40 transition">
              <div className="h-full w-full bg-[#080808] rounded-[10px] flex items-center justify-center">
                <Flame className="h-5 w-5 text-[#F5C842] group-hover:text-[#D4AF37] transition" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-[#F7F4EB]">
                  HEATHEALTH<span className="text-[#D4AF37]">AI</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#121110] border border-[#4F3E1B] text-[#F5C842] font-bold">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] text-[#A39C8E] font-mono tracking-wider uppercase">Urban Thermal Intelligence</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1.5 font-mono text-xs">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-xl font-medium transition ${
                isActive('/')
                  ? 'text-[#F5C842] bg-[#121110] border border-[#4F3E1B] shadow-sm'
                  : 'text-[#A39C8E] hover:text-[#F7F4EB] hover:bg-[#121110]/60'
              }`}
            >
              Overview
            </Link>

            <Link
              to="/dashboard"
              className={`px-3 py-1.5 rounded-xl font-medium transition ${
                isActive('/dashboard')
                  ? 'text-[#F5C842] bg-[#121110] border border-[#4F3E1B] shadow-sm'
                  : 'text-[#A39C8E] hover:text-[#F7F4EB] hover:bg-[#121110]/60'
              }`}
            >
              Dashboard
            </Link>

            <Link
              to="/simulation"
              className={`px-3 py-1.5 rounded-xl font-medium transition ${
                isActive('/simulation')
                  ? 'text-[#F5C842] bg-[#121110] border border-[#4F3E1B] shadow-sm'
                  : 'text-[#A39C8E] hover:text-[#F7F4EB] hover:bg-[#121110]/60'
              }`}
            >
              What-If Simulation
            </Link>

            <Link
              to="/forecast"
              className={`px-3 py-1.5 rounded-xl font-medium transition ${
                isActive('/forecast')
                  ? 'text-[#F5C842] bg-[#121110] border border-[#4F3E1B] shadow-sm'
                  : 'text-[#A39C8E] hover:text-[#F7F4EB] hover:bg-[#121110]/60'
              }`}
            >
              Forecast
            </Link>

            <Link
              to="/alerts"
              className={`px-3 py-1.5 rounded-xl font-medium transition ${
                isActive('/alerts')
                  ? 'text-[#F5C842] bg-[#121110] border border-[#4F3E1B] shadow-sm'
                  : 'text-[#A39C8E] hover:text-[#F7F4EB] hover:bg-[#121110]/60'
              }`}
            >
              Alerts
            </Link>

            {/* Verified Authority Portal Link */}
            {isVerifiedAuthority && (
              <Link
                to="/authority"
                className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition ${
                  isActive('/authority')
                    ? 'text-[#F5C842] bg-[#121110] border border-[#D4AF37] shadow-sm'
                    : 'text-[#D4AF37] hover:text-[#F5C842] hover:bg-[#121110]/80'
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
                className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition ${
                  isActive('/admin-dashboard')
                    ? 'text-purple-300 bg-[#121110] border border-purple-500'
                    : 'text-purple-400 hover:text-purple-300 hover:bg-[#121110]/80'
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
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#121110] border border-[#4F3E1B] text-[11px] font-mono text-[#A39C8E]">
              <MapPin className="h-3 w-3 text-[#D4AF37]" />
              <span>GPS location</span>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#121110] hover:bg-[#1C1A17] border border-[#4F3E1B] text-xs font-medium text-[#F7F4EB] transition shadow-sm"
                >
                  <UserIcon className="h-3.5 w-3.5 text-[#D4AF37]" />
                  <span className="max-w-[120px] truncate">{user?.first_name || user?.email}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl bg-[#121110] hover:bg-[#DC2626]/20 border border-[#4F3E1B] hover:border-[#DC2626] text-[#A39C8E] hover:text-[#DC2626] transition"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-medium text-[#A39C8E] hover:text-[#F7F4EB] hover:bg-[#121110] rounded-xl border border-transparent hover:border-[#4F3E1B] transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-xs py-1.5 px-3.5 font-bold"
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
              className="p-2 rounded-xl text-[#A39C8E] hover:text-[#F7F4EB] hover:bg-[#121110] border border-[#4F3E1B] transition"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#080808] border-b border-[#4F3E1B] px-4 pt-2 pb-4 space-y-2 font-mono text-sm">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-[#F7F4EB] hover:bg-[#121110]"
          >
            Overview
          </Link>
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-[#F7F4EB] hover:bg-[#121110]"
          >
            Dashboard
          </Link>
          <Link
            to="/simulation"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-[#F7F4EB] hover:bg-[#121110]"
          >
            What-If Simulation
          </Link>
          <Link
            to="/forecast"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-[#F7F4EB] hover:bg-[#121110]"
          >
            Forecast
          </Link>
          <Link
            to="/alerts"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-[#F7F4EB] hover:bg-[#121110]"
          >
            Alerts
          </Link>

          {isVerifiedAuthority && (
            <Link
              to="/authority"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-[#D4AF37] hover:bg-[#121110] font-medium"
            >
              Authority Command Portal
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin-dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-purple-400 hover:bg-[#121110] font-medium"
            >
              Admin Dashboard
            </Link>
          )}

          {isAuthenticated ? (
            <div className="pt-2 border-t border-[#4F3E1B] flex items-center justify-between">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-[#D4AF37]"
              >
                Profile ({user?.email})
              </Link>
              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="text-xs text-[#DC2626] font-semibold"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-[#4F3E1B] grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-sm text-[#F7F4EB] bg-[#121110] border border-[#4F3E1B] rounded-xl"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-sm text-[#080808] bg-[#D4AF37] font-bold rounded-xl"
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
