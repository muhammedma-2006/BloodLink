import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [token, setToken] = useState(localStorage.getItem('bloodlink_token'));
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      if (!localStorage.getItem('bloodlink_token')) {
        setUser(null);
        setProfile(null);
        setEligibility(null);
        setLoading(false);
        return;
      }
      const data = await api.auth.getMe();
      if (data.success) {
        setUser(data.user);
        setProfile(data.profile);
        setEligibility(data.eligibility);
        setUnreadNotifications(data.unreadNotifications || 0);
      }
    } catch (err) {
      console.warn('Session expired or invalid:', err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const login = async (email, password) => {
    const data = await api.auth.login({ email, password });
    if (data.success) {
      localStorage.setItem('bloodlink_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setProfile(data.profile);
      setEligibility(data.eligibility);
      setUnreadNotifications(data.unreadNotifications || 0);
      return data;
    }
    throw new Error(data.message || 'Login failed');
  };

  const register = async (formData) => {
    const data = await api.auth.register(formData);
    if (data.success) {
      localStorage.setItem('bloodlink_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setProfile(data.profile);
      return data;
    }
    throw new Error(data.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('bloodlink_token');
    setToken(null);
    setUser(null);
    setProfile(null);
    setEligibility(null);
    setUnreadNotifications(0);
  };

  const refreshProfile = async () => {
    await fetchUserData();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        eligibility,
        token,
        loading,
        unreadNotifications,
        setUnreadNotifications,
        login,
        register,
        logout,
        refreshProfile,
        isAuthenticated: !!user,
        isDonor: user?.role === 'donor',
        isHospital: user?.role === 'hospital',
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
