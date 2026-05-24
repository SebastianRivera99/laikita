// ============================================
// LAIKITA - Product Service
// ============================================

import { BaseService } from './base.service';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/lib/supabase';

class ProductService extends BaseService<Product> {
  constructor() {
    super('products');
  }

  // Obtener solo productos activos
  async getActiveProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error en getActiveProducts:', error);
        return [];
      }
      
      console.log('Productos obtenidos:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Excepción en getActiveProducts:', error);
      return [];
    }
  }

  // Obtener productos por categoría
  async getByCategory(category: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .eq('is_active', true);

      if (error) throw new Error(error.message);
      return data || [];
    } catch (error) {
      console.error('Error en getByCategory:', error);
      return [];
    }
  }

  // Buscar productos
  async searchProducts(query: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,brand.ilike.%${query}%`)
        .eq('is_active', true);

      if (error) throw new Error(error.message);
      return data || [];
    } catch (error) {
      console.error('Error en searchProducts:', error);
      return [];
    }
  }
}

export const productService = new ProductService();