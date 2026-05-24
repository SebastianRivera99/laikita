// ============================================
// LAIKITA - Base Service (CRUD genérico)
// ============================================

import { supabase } from '@/lib/supabase';

export class BaseService<T> {
  constructor(private tableName: string) {}

  // Obtener todos los registros
  async getAll(): Promise<T[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []) as T[];
  }

  // Obtener un registro por ID
  async getById(id: number): Promise<T | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.message.includes('No rows found')) return null;
      throw new Error(error.message);
    }
    return data as T;
  }

  // Crear un nuevo registro (usa Record para mayor flexibilidad)
  async create(item: Record<string, any>): Promise<T> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(item)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as T;
  }

  // Actualizar un registro (usa Record para mayor flexibilidad)
  async update(id: number, updates: Record<string, any>): Promise<T> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as T;
  }

  // Eliminar un registro
  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  // Búsqueda personalizada
  async search(column: string, value: string): Promise<T[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .ilike(column, `%${value}%`);

    if (error) throw new Error(error.message);
    return (data || []) as T[];
  }
}