import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem('heathealth_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('heathealth_access_token');
      if (token) {
        try {
          const res = await authService.getProfile();
          setUser(res.data);
          localStorage.setItem('heathealth_user', JSON.stringify(res.data));
        } catch (err) {
          console.warn('Session expired or invalid token');
          localStorage.removeItem('heathealth_access_token');
          localStorage.removeItem('heathealth_refresh_token');
          localStorage.removeItem('heathealth_user');
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    const { tokens, user: userData } = res.data;
    localStorage.setItem('heathealth_access_token', tokens.access);
    localStorage.setItem('heathealth_refresh_token', tokens.refresh);
    localStorage.setItem('heathealth_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('heathealth_refresh_token');
    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (e) {
      // Ignore errors on logout
    }
    localStorage.removeItem('heathealth_access_token');
    localStorage.removeItem('heathealth_refresh_token');
    localStorage.removeItem('heathealth_user');
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const res = await authService.getProfile();
      setUser(res.data);
      localStorage.setItem('heathealth_user', JSON.stringify(res.data));
      return res.data;
    } catch (e) {
      return null;
    }
  };

  const isAuthenticated = !!user;
  const isCitizen = user?.role === 'CITIZEN';
  const isVerifiedAuthority = user?.is_verified_authority === true;
  const isPendingAuthority = user?.role === 'GOVERNMENT_AUTHORITY' && !user?.is_verified_authority;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        isCitizen,
        isVerifiedAuthority,
        isPendingAuthority,
        isAdmin,
        login,
        logout,
        refreshProfile,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
