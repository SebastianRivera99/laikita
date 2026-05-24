// ============================================
// LAIKITA - Owner Service
// ============================================

import { BaseService } from './base.service';
import { supabase } from '@/lib/supabase';
import type { Owner, Pet } from '@/lib/supabase';

class OwnerService extends BaseService<Owner> {
  constructor() {
    super('owners');
  }

  // Obtener dueños con sus mascotas (relación)
  async getOwnersWithPets() {
    const { data, error } = await supabase
      .from('owners')
      .select(`
        *,
        pets:pets(*)
      `);

    if (error) throw new Error(error.message);
    return data;
  }

  // Obtener mascotas de un dueño específico
  async getPetsByOwner(ownerId: number): Promise<Pet[]> {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('owner_id', ownerId);

    if (error) throw new Error(error.message);
    return data;
  }

  // Buscar dueños por nombre, documento o teléfono
  async searchOwners(query: string): Promise<Owner[]> {
    const { data, error } = await supabase
      .from('owners')
      .select('*')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,document.ilike.%${query}%,phone.ilike.%${query}%`);

    if (error) throw new Error(error.message);
    return data;
  }
}

export const ownerService = new OwnerService();