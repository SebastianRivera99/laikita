// ============================================
// LAIKITA - Pet Service
// ============================================

import { BaseService } from './base.service';
import { supabase } from '@/lib/supabase';
import type { Pet, Treatment } from '@/lib/supabase';

class PetService extends BaseService<Pet> {
  constructor() {
    super('pets');
  }

  // Obtener mascotas con información del dueño
  async getPetsWithOwners() {
    const { data, error } = await supabase
      .from('pets')
      .select(`
        *,
        owner:owners(*)
      `);

    if (error) throw new Error(error.message);
    return data;
  }

  // Obtener tratamientos de una mascota
  async getTreatmentsByPet(petId: number): Promise<Treatment[]> {
    const { data, error } = await supabase
      .from('treatments')
      .select('*')
      .eq('pet_id', petId)
      .order('date', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  // Buscar mascotas por nombre o raza
  async searchPets(query: string): Promise<Pet[]> {
    const { data, error } = await supabase
      .from('pets')
      .select('*, owner:owners(first_name, last_name)')
      .or(`name.ilike.%${query}%,breed.ilike.%${query}%`);

    if (error) throw new Error(error.message);
    return data;
  }

  // Obtener mascotas por especie
  async getBySpecies(species: string): Promise<Pet[]> {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('species', species);

    if (error) throw new Error(error.message);
    return data;
  }
}

export const petService = new PetService();