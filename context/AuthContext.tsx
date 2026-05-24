// ============================================
// LAIKITA - AuthContext con Supabase
// ============================================

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { authService } from '@/services/auth.service';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar sesión al iniciar la app
  useEffect(() => {
    const loadUser = async () => {
      try {
        const session = await authService.getCurrentUser();
        if (session?.profile) {
          setUser({
            id: String(session.profile.id),
            email: session.profile.email,
            name: session.profile.name,
            role: session.profile.role,
            avatar: session.profile.avatar,
            createdAt: session.profile.created_at,
          });
        }
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { profile } = await authService.login(email, password);
      setUser({
        id: String(profile.id),
        email: profile.email,
        name: profile.name,
        role: profile.role,
        avatar: profile.avatar,
        createdAt: profile.created_at,
      });
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      alert(error.message || 'Error al iniciar sesión');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await authService.register(name, email, password);
      // Después de registrar, iniciar sesión automáticamente
      return await login(email, password);
    } catch (error: any) {
      console.error('Register error:', error);
      alert(error.message || 'Error al registrar usuario');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}