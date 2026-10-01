import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  connectUpay: (walletNumber: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('upay_access_token');
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const userData = await api.get<User>('/auth/me');
      setUser(userData);
    } catch (error) {
      setUser(null);
      localStorage.removeItem('upay_access_token');
      localStorage.removeItem('upay_refresh_token');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.post<{ user: User; tokens: { accessToken: string; refreshToken: string } }>(
        '/auth/login',
        { email, password }
      );
      localStorage.setItem('upay_access_token', res.tokens.accessToken);
      localStorage.setItem('upay_refresh_token', res.tokens.refreshToken);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.post<{ user: User; tokens: { accessToken: string; refreshToken: string } }>(
        '/auth/register',
        data
      );
      localStorage.setItem('upay_access_token', res.tokens.accessToken);
      localStorage.setItem('upay_refresh_token', res.tokens.refreshToken);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('upay_refresh_token');
      await api.post('/auth/logout', { refreshToken }).catch(() => {});
    } finally {
      localStorage.removeItem('upay_access_token');
      localStorage.removeItem('upay_refresh_token');
      setUser(null);
      window.location.href = '/login';
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const connectUpay = async (walletNumber: string) => {
    const updated = await api.post<User>('/auth/connect-upay', { walletNumber });
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        connectUpay,
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
