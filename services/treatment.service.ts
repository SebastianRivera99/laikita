// ============================================
// LAIKITA - Treatment Service
// ============================================

import { BaseService } from './base.service';
import { supabase } from '@/lib/supabase';
import type { Treatment } from '@/lib/supabase';

class TreatmentService extends BaseService<Treatment> {
  constructor() {
    super('treatments');
  }

  // Obtener tratamientos con información de mascota y dueño
  async getTreatmentsFull() {
    const { data, error } = await supabase
      .from('treatments')
      .select(`
        *,
        pet:pets(*),
        owner:owners(*)
      `)
      .order('date', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  // Obtener tratamientos de hoy
  async getTodayTreatments() {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('treatments')
      .select(`
        *,
        pet:pets(*),
        owner:owners(*)
      `)
      .eq('date', today)
      .eq('status', 'scheduled')
      .order('time', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
  }

  // Obtener tratamientos por rango de fechas
  async getByDateRange(startDate: string, endDate: string): Promise<Treatment[]> {
    const { data, error } = await supabase
      .from('treatments')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
  }

  // Obtener tratamientos por estado
  async getByStatus(status: string): Promise<Treatment[]> {
    const { data, error } = await supabase
      .from('treatments')
      .select('*')
      .eq('status', status)
      .order('date', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
  }

  // Obtener tratamientos por veterinario
  async getByVeterinarian(veterinarian: string): Promise<Treatment[]> {
    const { data, error } = await supabase
      .from('treatments')
      .select('*')
      .eq('veterinarian', veterinarian)
      .order('date', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }
}

export const treatmentService = new TreatmentService();