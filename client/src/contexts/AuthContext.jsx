import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check token validity on mount
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const response = await authService.getMe();
          setUser(response.data.user);
        } catch (err) {
          // Token invalid — clear everything
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const register = useCallback(async ({ username, email, password }) => {
    setError(null);
    try {
      const response = await authService.register({ username, email, password });
      const { token: newToken, user: newUser, privateKey } = response.data;

      // Store token but DON'T set user yet — let the private key modal show first
      localStorage.setItem('token', newToken);
      setToken(newToken);

      return { user: newUser, privateKey };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const completeRegistration = useCallback((userData) => {
    setUser(userData);
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setError(null);
    try {
      const response = await authService.login({ email, password });
      const { token: newToken, user: newUser } = response.data;

      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);

      return newUser;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user && !!token,
    register,
    completeRegistration,
    login,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
