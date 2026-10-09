import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, authStorage } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  switchQuickUser: (email: string, password?: string) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const token = authStorage.getToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const data = await api.getMe();
      setUser(data.user);
    } catch (err) {
      console.warn('Session expired or invalid, logging out', err);
      authStorage.clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const data = await api.login(email, password);
    authStorage.setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    } finally {
      authStorage.clearToken();
      setUser(null);
    }
  };

  const switchQuickUser = async (email: string, password = 'Admin@12345'): Promise<User> => {
    // Determine default passwords based on seed data
    let pass = password;
    if (email.toLowerCase().includes('savad')) pass = 'Savad@12345';
    else if (email.toLowerCase().includes('rahul')) pass = 'Rahul@12345';
    else if (email.toLowerCase().includes('fadil')) pass = 'Fadil@12345';
    else if (email.toLowerCase().includes('anu')) pass = 'Anu@12345';
    else if (email.toLowerCase().includes('admin')) pass = 'Admin@12345';

    return await login(email, pass);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, switchQuickUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
