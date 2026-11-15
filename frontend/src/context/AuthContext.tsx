import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (userData: any) => Promise<User>;
  logout: () => void;
  quickLoginAs: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('carehealth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('carehealth_token');
      if (savedToken) {
        try {
          const profile = await api.auth.getMe();
          setUser({
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            role: profile.role,
            phone_number: profile.phone_number,
            is_active: profile.is_active,
            created_at: profile.created_at
          });
        } catch (error) {
          console.error("Session expired or invalid token:", error);
          localStorage.removeItem('carehealth_token');
          localStorage.removeItem('carehealth_user');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const data = await api.auth.login(email, password);
      localStorage.setItem('carehealth_token', data.access_token);
      localStorage.setItem('carehealth_user', JSON.stringify(data.user));
      setToken(data.access_token);
      setUser(data.user);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any): Promise<User> => {
    setIsLoading(true);
    try {
      const data = await api.auth.register(userData);
      localStorage.setItem('carehealth_token', data.access_token);
      localStorage.setItem('carehealth_user', JSON.stringify(data.user));
      setToken(data.access_token);
      setUser(data.user);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('carehealth_token');
    localStorage.removeItem('carehealth_user');
    setToken(null);
    setUser(null);
  };

  const quickLoginAs = async (role: UserRole) => {
    const credentials: Record<UserRole, { email: string; pass: string }> = {
      admin: { email: 'admin@carehealth.com', pass: 'Admin@123' },
      doctor: { email: 'doctor@carehealth.com', pass: 'Doctor@123' },
      receptionist: { email: 'receptionist@carehealth.com', pass: 'Reception@123' },
      patient: { email: 'patient@carehealth.com', pass: 'Patient@123' }
    };

    const cred = credentials[role];
    await login(cred.email, cred.pass);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, quickLoginAs }}>
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
