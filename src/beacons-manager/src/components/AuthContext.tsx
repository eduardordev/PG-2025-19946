'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: any | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Helper function para localStorage
  const getLocalStorage = (key: string) => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  };

  const setLocalStorage = (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, value);
  };

  const removeLocalStorage = (key: string) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  };

  useEffect(() => {
    const savedToken = getLocalStorage('token');
    if (savedToken) {
      try {
        // Decodificar el token para obtener la información del usuario
        const payload = JSON.parse(atob(savedToken.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        // Verificar si el token no ha expirado
        if (payload.exp > currentTime) {
          setToken(savedToken);
          setUser({
            id: payload.userId,
            username: payload.username,
            email: payload.email
          });
        } else {
          // Token expirado, limpiar
          if (typeof window !== 'undefined') {
          removeLocalStorage('token');
        }
        }
      } catch (error) {
        // Token inválido, limpiar
        if (typeof window !== 'undefined') {
          removeLocalStorage('token');
        }
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      setUser(data.data.user);
      setToken(data.data.token);
      if (typeof window !== 'undefined') {
        setLocalStorage('token', data.data.token);
      }
      router.push('/dashboard');
    } else {
      throw new Error(data.error);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (data.success) {
      setUser(data.data.user);
      setToken(data.data.token);
      if (typeof window !== 'undefined') {
        setLocalStorage('token', data.data.token);
      }
      router.push('/dashboard');
    } else {
      throw new Error(data.error);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      removeLocalStorage('token');
    }
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
