import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/endpoints';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem('ycc_token');
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await authApi.me();
      setAdmin(data);
    } catch {
      localStorage.removeItem('ycc_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const login = async (email, password) => {
    const { data } = await authApi.login(email, password);
    localStorage.setItem('ycc_token', data.access_token);
    await fetchMe();
  };

  const logout = () => {
    localStorage.removeItem('ycc_token');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
