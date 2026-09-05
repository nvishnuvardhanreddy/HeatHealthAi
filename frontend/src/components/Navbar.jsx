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
    <nav className="sticky top-0 z-50 bg-[#0A080F]/95 backdrop-blur-xl border-b border-[#3B2D5A] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#A78BFA] p-0.5 shadow-lg shadow-[#7C3AED]/20 group-hover:shadow-[#7C3AED]/40 transition">
              <div className="h-full w-full bg-[#0A080F] rounded-[10px] flex items-center justify-center">
                <Flame className="h-5 w-5 text-[#A78BFA] group-hover:text-[#C4B5FD] transition" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-[#EDE9FF]">
                  HEATHEALTH<span className="text-[#A78BFA]">AI</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#110D1A] border border-[#3B2D5A] text-[#C4B5FD] font-bold">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] text-[#A094C0] font-mono tracking-wider uppercase">Team Ground Zero</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1.5 font-mono text-xs">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-xl font-medium transition ${
                isActive('/')
                  ? 'text-[#C4B5FD] bg-[#110D1A] border border-[#3B2D5A] shadow-sm'
                  : 'text-[#A094C0] hover:text-[#EDE9FF] hover:bg-[#110D1A]/60'
              }`}
            >
              Overview
            </Link>

            <Link
              to="/dashboard"
              className={`px-3 py-1.5 rounded-xl font-medium transition ${
                isActive('/dashboard')
                  ? 'text-[#C4B5FD] bg-[#110D1A] border border-[#3B2D5A] shadow-sm'
                  : 'text-[#A094C0] hover:text-[#EDE9FF] hover:bg-[#110D1A]/60'
              }`}
            >
              Dashboard
            </Link>

            <Link
              to="/simulation"
              className={`px-3 py-1.5 rounded-xl font-medium transition ${
                isActive('/simulation')
                  ? 'text-[#C4B5FD] bg-[#110D1A] border border-[#3B2D5A] shadow-sm'
                  : 'text-[#A094C0] hover:text-[#EDE9FF] hover:bg-[#110D1A]/60'
              }`}
            >
              What-If Simulation
            </Link>

            <Link
              to="/forecast"
              className={`px-3 py-1.5 rounded-xl font-medium transition ${
                isActive('/forecast')
                  ? 'text-[#C4B5FD] bg-[#110D1A] border border-[#3B2D5A] shadow-sm'
                  : 'text-[#A094C0] hover:text-[#EDE9FF] hover:bg-[#110D1A]/60'
              }`}
            >
              Forecast
            </Link>

            <Link
              to="/alerts"
              className={`px-3 py-1.5 rounded-xl font-medium transition ${
                isActive('/alerts')
                  ? 'text-[#C4B5FD] bg-[#110D1A] border border-[#3B2D5A] shadow-sm'
                  : 'text-[#A094C0] hover:text-[#EDE9FF] hover:bg-[#110D1A]/60'
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
                    ? 'text-[#C4B5FD] bg-[#110D1A] border border-[#7C3AED] shadow-sm'
                    : 'text-[#A78BFA] hover:text-[#C4B5FD] hover:bg-[#110D1A]/80'
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
                    ? 'text-purple-300 bg-[#110D1A] border border-purple-500'
                    : 'text-purple-400 hover:text-purple-300 hover:bg-[#110D1A]/80'
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
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#110D1A] border border-[#3B2D5A] text-[11px] font-mono text-[#A094C0]">
              <MapPin className="h-3 w-3 text-[#A78BFA]" />
              <span>GPS location</span>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#110D1A] hover:bg-[#1A1228] border border-[#3B2D5A] text-xs font-medium text-[#EDE9FF] transition shadow-sm"
                >
                  <UserIcon className="h-3.5 w-3.5 text-[#A78BFA]" />
                  <span className="max-w-[120px] truncate">{user?.first_name || user?.email}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl bg-[#110D1A] hover:bg-[#DC2626]/20 border border-[#3B2D5A] hover:border-[#DC2626] text-[#A094C0] hover:text-[#DC2626] transition"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-medium text-[#A094C0] hover:text-[#EDE9FF] hover:bg-[#110D1A] rounded-xl border border-transparent hover:border-[#3B2D5A] transition"
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
              className="p-2 rounded-xl text-[#A094C0] hover:text-[#EDE9FF] hover:bg-[#110D1A] border border-[#3B2D5A] transition"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0A080F] border-b border-[#3B2D5A] px-4 pt-2 pb-4 space-y-2 font-mono text-sm">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-[#EDE9FF] hover:bg-[#110D1A]"
          >
            Overview
          </Link>
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-[#EDE9FF] hover:bg-[#110D1A]"
          >
            Dashboard
          </Link>
          <Link
            to="/simulation"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-[#EDE9FF] hover:bg-[#110D1A]"
          >
            What-If Simulation
          </Link>
          <Link
            to="/forecast"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-[#EDE9FF] hover:bg-[#110D1A]"
          >
            Forecast
          </Link>
          <Link
            to="/alerts"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-[#EDE9FF] hover:bg-[#110D1A]"
          >
            Alerts
          </Link>

          {isVerifiedAuthority && (
            <Link
              to="/authority"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-[#A78BFA] hover:bg-[#110D1A] font-medium"
            >
              Authority Command Portal
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin-dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-purple-400 hover:bg-[#110D1A] font-medium"
            >
              Admin Dashboard
            </Link>
          )}

          {isAuthenticated ? (
            <div className="pt-2 border-t border-[#3B2D5A] flex items-center justify-between">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-[#A78BFA]"
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
            <div className="pt-2 border-t border-[#3B2D5A] grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-sm text-[#EDE9FF] bg-[#110D1A] border border-[#3B2D5A] rounded-xl"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-sm text-[#EDE9FF] bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] font-bold rounded-xl"
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
