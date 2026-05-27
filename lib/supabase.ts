// ============================================
// LAIKITA - Supabase Client Configuration
// ============================================

import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Credenciales de Supabase (definidas en .env.local — nunca hardcodear aquí)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Almacenamiento en memoria (fallback para web)
const memoryStorage: Record<string, string> = {};

const webStorage = {
  getItem: (key: string) => {
    try {
      // Intentar usar localStorage primero
      if (typeof localStorage !== 'undefined') {
        return Promise.resolve(localStorage.getItem(key));
      }
      // Fallback a memoria
      return Promise.resolve(memoryStorage[key] || null);
    } catch {
      return Promise.resolve(memoryStorage[key] || null);
    }
  },
  setItem: (key: string, value: string) => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      } else {
        memoryStorage[key] = value;
      }
    } catch {
      memoryStorage[key] = value;
    }
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
      delete memoryStorage[key];
    } catch {
      delete memoryStorage[key];
    }
    return Promise.resolve();
  },
};

// Crear el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: webStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Tipos para las tablas
export type User = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'vet' | 'receptionist';
  avatar?: string;
  created_at: string;
  updated_at: string;
};

export type Owner = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  document: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
};

export type Pet = {
  id: number;
  owner_id: number;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'hamster' | 'other';
  breed: string;
  gender: 'male' | 'female';
  size: 'small' | 'medium' | 'large';
  birth_date: string;
  weight: number;
  color: string;
  microchip?: string;
  photo?: string;
  is_neutered: boolean;
  allergies: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type Treatment = {
  id: number;
  pet_id: number;
  owner_id: number;
  type: 'consultation' | 'vaccination' | 'surgery' | 'grooming' | 'dental' | 'laboratory' | 'emergency' | 'deworming' | 'other';
  title: string;
  description?: string;
  diagnosis?: string;
  prescription?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  date: string;
  time: string;
  veterinarian: string;
  cost: number;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: number;
  name: string;
  description?: string;
  category: 'food' | 'medicine' | 'accessories' | 'hygiene' | 'toys' | 'clothing';
  price: number;
  stock: number;
  image?: string;
  brand: string;
  pet_type: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// Función para probar conexión
export async function testConnection() {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.error('❌ Error de conexión:', error.message);
      return false;
    }
    console.log('✅ Conexión exitosa a Supabase');
    return true;
  } catch (error) {
    console.error('❌ No se pudo conectar:', error);
    return false;
  }
}