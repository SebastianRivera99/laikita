// ============================================
// LAIKITA - DataContext (conectado a XAMPP)
// ============================================

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Owner, Pet, Treatment, OwnerFormData, PetFormData, TreatmentFormData } from '@/types';
import { ownersAPI, petsAPI, treatmentsAPI } from '@/utils/api';

// Helper: convierte snake_case de PHP a camelCase de React
function mapOwner(raw: any): Owner {
  return {
    id: String(raw.id),
    firstName: raw.first_name,
    lastName: raw.last_name,
    email: raw.email,
    phone: raw.phone,
    address: raw.address,
    document: raw.document,
    pets: raw.pets || [],
    createdAt: raw.created_at || '',
    updatedAt: raw.updated_at || '',
  };
}

function mapPet(raw: any): Pet {
  return {
    id: String(raw.id),
    name: raw.name,
    species: raw.species,
    breed: raw.breed,
    gender: raw.gender,
    size: raw.size,
    birthDate: raw.birth_date || '',
    weight: parseFloat(raw.weight) || 0,
    color: raw.color || '',
    microchip: raw.microchip || undefined,
    photo: undefined,
    ownerId: String(raw.owner_id),
    isNeutered: raw.is_neutered === 1 || raw.is_neutered === true || raw.isNeutered === true,
    allergies: Array.isArray(raw.allergies) ? raw.allergies : (raw.allergies ? raw.allergies.split(',').filter(Boolean) : []),
    notes: raw.notes || undefined,
    createdAt: raw.created_at || '',
    updatedAt: raw.updated_at || '',
  };
}

function mapTreatment(raw: any): Treatment {
  return {
    id: String(raw.id),
    petId: String(raw.pet_id),
    ownerId: String(raw.owner_id),
    type: raw.type,
    title: raw.title,
    description: raw.description || '',
    diagnosis: raw.diagnosis || undefined,
    prescription: raw.prescription || undefined,
    status: raw.status,
    date: raw.date,
    time: raw.time,
    veterinarian: raw.veterinarian || '',
    cost: parseFloat(raw.cost) || 0,
    notes: raw.notes || undefined,
    createdAt: raw.created_at || '',
    updatedAt: raw.updated_at || '',
  };
}

interface DataContextType {
  owners: Owner[];
  pets: Pet[];
  treatments: Treatment[];
  loading: boolean;
  refreshAll: () => Promise<void>;
  // Owners
  addOwner: (data: OwnerFormData) => Promise<Owner>;
  updateOwner: (id: string, data: Partial<OwnerFormData>) => Promise<void>;
  deleteOwner: (id: string) => Promise<void>;
  getOwner: (id: string) => Owner | undefined;
  // Pets
  addPet: (data: PetFormData) => Promise<Pet>;
  updatePet: (id: string, data: Partial<PetFormData>) => Promise<void>;
  deletePet: (id: string) => Promise<void>;
  getPet: (id: string) => Pet | undefined;
  getPetsByOwner: (ownerId: string) => Pet[];
  // Treatments
  addTreatment: (data: TreatmentFormData) => Promise<Treatment>;
  updateTreatment: (id: string, data: Partial<TreatmentFormData>) => Promise<void>;
  deleteTreatment: (id: string) => Promise<void>;
  getTreatment: (id: string) => Treatment | undefined;
  getTreatmentsByPet: (petId: string) => Treatment[];
  getTreatmentsByOwner: (ownerId: string) => Treatment[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar todos los datos al montar
  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ownersRaw, petsRaw, treatmentsRaw] = await Promise.all([
        ownersAPI.getAll(),
        petsAPI.getAll(),
        treatmentsAPI.getAll(),
      ]);
      setOwners(Array.isArray(ownersRaw) ? ownersRaw.map(mapOwner) : []);
      setPets(Array.isArray(petsRaw) ? petsRaw.map(mapPet) : []);
      setTreatments(Array.isArray(treatmentsRaw) ? treatmentsRaw.map(mapTreatment) : []);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // ---- OWNERS ----
  const addOwner = useCallback(async (data: OwnerFormData): Promise<Owner> => {
    const raw = await ownersAPI.create(data);
    const owner = mapOwner(raw);
    setOwners(prev => [owner, ...prev]);
    return owner;
  }, []);

  const updateOwner = useCallback(async (id: string, data: Partial<OwnerFormData>) => {
    const raw = await ownersAPI.update(id, data);
    const updated = mapOwner(raw);
    setOwners(prev => prev.map(o => (o.id === id ? updated : o)));
  }, []);

  const deleteOwner = useCallback(async (id: string) => {
    await ownersAPI.delete(id);
    setOwners(prev => prev.filter(o => o.id !== id));
    setPets(prev => prev.filter(p => p.ownerId !== id));
    setTreatments(prev => prev.filter(t => t.ownerId !== id));
  }, []);

  const getOwner = useCallback((id: string) => owners.find(o => o.id === id), [owners]);

  // ---- PETS ----
  const addPet = useCallback(async (data: PetFormData): Promise<Pet> => {
    const raw = await petsAPI.create(data);
    const pet = mapPet(raw);
    setPets(prev => [pet, ...prev]);
    return pet;
  }, []);

  const updatePet = useCallback(async (id: string, data: Partial<PetFormData>) => {
    const raw = await petsAPI.update(id, data);
    const updated = mapPet(raw);
    setPets(prev => prev.map(p => (p.id === id ? updated : p)));
  }, []);

  const deletePet = useCallback(async (id: string) => {
    await petsAPI.delete(id);
    setPets(prev => prev.filter(p => p.id !== id));
    setTreatments(prev => prev.filter(t => t.petId !== id));
  }, []);

  const getPet = useCallback((id: string) => pets.find(p => p.id === id), [pets]);
  const getPetsByOwner = useCallback((ownerId: string) => pets.filter(p => p.ownerId === ownerId), [pets]);

  // ---- TREATMENTS ----
  const addTreatment = useCallback(async (data: TreatmentFormData): Promise<Treatment> => {
    const raw = await treatmentsAPI.create(data);
    const treatment = mapTreatment(raw);
    setTreatments(prev => [treatment, ...prev]);
    return treatment;
  }, []);

  const updateTreatment = useCallback(async (id: string, data: Partial<TreatmentFormData>) => {
    const raw = await treatmentsAPI.update(id, data);
    const updated = mapTreatment(raw);
    setTreatments(prev => prev.map(t => (t.id === id ? updated : t)));
  }, []);

  const deleteTreatment = useCallback(async (id: string) => {
    await treatmentsAPI.delete(id);
    setTreatments(prev => prev.filter(t => t.id !== id));
  }, []);

  const getTreatment = useCallback((id: string) => treatments.find(t => t.id === id), [treatments]);
  const getTreatmentsByPet = useCallback((petId: string) => treatments.filter(t => t.petId === petId), [treatments]);
  const getTreatmentsByOwner = useCallback((ownerId: string) => treatments.filter(t => t.ownerId === ownerId), [treatments]);

  return (
    <DataContext.Provider
      value={{
        owners, pets, treatments, loading, refreshAll,
        addOwner, updateOwner, deleteOwner, getOwner,
        addPet, updatePet, deletePet, getPet, getPetsByOwner,
        addTreatment, updateTreatment, deleteTreatment,
        getTreatment, getTreatmentsByPet, getTreatmentsByOwner,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData debe usarse dentro de DataProvider');
  return context;
}
