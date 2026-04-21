import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginAPI, signup as signupAPI, getProfile } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('qv_token');
    const savedUser = localStorage.getItem('qv_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('qv_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await loginAPI({ email, password });
    localStorage.setItem('qv_token', data.token);
    localStorage.setItem('qv_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const signup = async (formData) => {
    const { data } = await signupAPI(formData);
    localStorage.setItem('qv_token', data.token);
    localStorage.setItem('qv_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('qv_token');
    localStorage.removeItem('qv_user');
    // Keep onboarding flag so returning users don't see it again
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const { data } = await getProfile();
      localStorage.setItem('qv_user', JSON.stringify(data.user));
      setUser(data.user);
    } catch {
      logout();
    }
  };

  // Returns true if this is a brand-new user who hasn't been onboarded
  const needsOnboarding = () => {
    return !localStorage.getItem('qv_onboarded');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser, needsOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
