// ============================================
// LAIKITA - AuthContext (con persistencia sesión)
// ============================================

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState } from '@/types';
import { authAPI } from '@/utils/api';

// clave para guardar sesión
const AUTH_STORAGE_KEY = 'laikita_auth_user';

// Alert compatible con web y móvil
function showAlert(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message);
  }
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // cargar sesión guardada al iniciar
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);

        if (storedUser) {
          const user: User = JSON.parse(storedUser);
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Error cargando sesión:', error);
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    loadSession();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      console.log('Intentando login con:', email);
      const data = await authAPI.login(email, password);
      console.log('Respuesta login:', data);

      const user: User = {
        id: String(data.user.id),
        email: data.user.email,
        name: data.user.name,
        role: data.user.role || 'receptionist',
        createdAt: data.user.created_at || '',
      };

      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      showAlert('Error de login', error.message || 'No se pudo conectar al servidor');
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }

    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const data = await authAPI.register(name, email, password);

      const user: User = {
        id: String(data.user.id),
        email: data.user.email,
        name: data.user.name,
        role: data.user.role || 'receptionist',
        createdAt: data.user.created_at || '',
      };

      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      return true;
    } catch (error: any) {
      console.error('Register error:', error);
      showAlert('Error de registro', error.message || 'No se pudo crear la cuenta');
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}