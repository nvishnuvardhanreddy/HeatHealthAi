import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute, AuthorityRoute, AdminRoute } from './auth/ProtectedRoutes';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { DashboardPage } from './pages/DashboardPage';
import { AuthorityDashboardPage } from './pages/AuthorityDashboardPage';
import { SimulationPage } from './pages/SimulationPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { OperationsPage, ForecastPage } from './pages/OperationsPage';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0A080F] text-[#EDE9FF] flex flex-col justify-between selection:bg-[#7C3AED] selection:text-[#EDE9FF]">
      <div>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/simulation" element={<ProtectedRoute><SimulationPage /></ProtectedRoute>} />
            <Route path="/authority" element={<AuthorityRoute><AuthorityDashboardPage /></AuthorityRoute>} />
            <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/forecast" element={<ProtectedRoute><ForecastPage /></ProtectedRoute>} />
            <Route path="/alerts" element={<ProtectedRoute><OperationsPage kind="alerts" /></ProtectedRoute>} />
            <Route path="/interventions" element={<ProtectedRoute><OperationsPage kind="interventions" /></ProtectedRoute>} />
            <Route path="/emergency-priorities" element={<AuthorityRoute><OperationsPage kind="priorities" /></AuthorityRoute>} />
            <Route path="/action-plan" element={<AuthorityRoute><OperationsPage kind="actionPlan" /></AuthorityRoute>} />
            <Route path="/risk-map" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  );
}