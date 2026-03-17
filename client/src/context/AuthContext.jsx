import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setToken } from '../services/api.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setTokenState(newToken);
    fetchUserProfile();
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout request failed:', err.message);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setTokenState(null);
      setUser(null);
    }
  };

  const fetchUserProfile = async () => {
    console.log('[AuthContext] Fetching user profile...');
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('[AuthContext] Profile fetch timeout - forcing loading end');
        setLoading(false);
      }
    }, 5000);

    try {
      const { data } = await api.get('/auth/me');
      console.log('[AuthContext] Profile success:', data.data?.username);
      setUser(data.data);
    } catch (err) {
      console.error('[AuthContext] Profile failed:', err.message);
      logout();
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  // On initial load, the token is null in memory. 
  // We'll rely on the AuthCallback component or memory after refresh.
  useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Fetch user whenever token changes
  useEffect(() => {
    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
