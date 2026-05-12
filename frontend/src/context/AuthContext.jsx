import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);
const STORAGE_KEY = 'mini-mail-user';
const TOKEN_KEY = 'mini-mail-token';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMe = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
      } catch {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    };

    loadMe();
  }, []);

  const refreshUser = async () => {
    const { data } = await api.get('/auth/me');
    setUser(data.user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
    return data.user;
  };

  const login = async (payload) => {
    const { data } = await api.post('/auth/login', payload);
    setUser(data.user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
    }
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    setUser(data.user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
    }
    return data.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshUser, isAuthenticated: Boolean(user) }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
