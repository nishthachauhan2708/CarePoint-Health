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

  const isDemoLoginAllowed = import.meta.env.VITE_ENABLE_DEMO_LOGIN !== 'false';

  const quickLoginAs = async (role: UserRole) => {
    // In production builds with demo login disabled, reject one-click authentication immediately
    if (!isDemoLoginAllowed) {
      throw new Error("Unauthorized: One-click demo persona authentication is disabled in this environment.");
    }

    const roleEnvMap: Record<UserRole, { emailKey: keyof ImportMetaEnv; passKey: keyof ImportMetaEnv }> = {
      admin: { emailKey: 'VITE_DEMO_ADMIN_EMAIL', passKey: 'VITE_DEMO_ADMIN_PASSWORD' },
      doctor: { emailKey: 'VITE_DEMO_DOCTOR_EMAIL', passKey: 'VITE_DEMO_DOCTOR_PASSWORD' },
      receptionist: { emailKey: 'VITE_DEMO_RECEPTIONIST_EMAIL', passKey: 'VITE_DEMO_RECEPTIONIST_PASSWORD' },
      patient: { emailKey: 'VITE_DEMO_PATIENT_EMAIL', passKey: 'VITE_DEMO_PATIENT_PASSWORD' },
    };

    const mapping = roleEnvMap[role];
    if (!mapping) {
      throw new Error(`Demo login is not supported for role '${role}'.`);
    }

    const email = import.meta.env[mapping.emailKey];
    const password = import.meta.env[mapping.passKey];

    if (!email || !password) {
      throw new Error(
        `Demo credentials for role '${role}' are not configured. Please set ${mapping.emailKey} and ${mapping.passKey} in your local environment.`
      );
    }

    await login(email, password);
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
