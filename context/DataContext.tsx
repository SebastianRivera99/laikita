// ============================================
// LAIKITA - DataContext con Supabase
// ============================================

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { ownerService } from '@/services/owner.service';
import { petService } from '@/services/pet.service';
import { treatmentService } from '@/services/treatment.service';
import type { Owner, Pet, Treatment } from '@/types';

interface DataContextType {
  owners: Owner[];
  pets: Pet[];
  treatments: Treatment[];
  loading: boolean;
  refreshAll: () => Promise<void>;

  // Owners
  addOwner: (data: any) => Promise<Owner>;
  updateOwner: (id: number, data: any) => Promise<void>;
  deleteOwner: (id: number) => Promise<void>;
  getOwner: (id: number) => Owner | undefined;

  // Pets
  addPet: (data: any) => Promise<Pet>;
  updatePet: (id: number, data: any) => Promise<void>;
  deletePet: (id: number) => Promise<void>;
  getPet: (id: number) => Pet | undefined;
  getPetsByOwner: (ownerId: number) => Pet[];

  // Treatments
  addTreatment: (data: any) => Promise<Treatment>;
  updateTreatment: (id: number, data: any) => Promise<void>;
  deleteTreatment: (id: number) => Promise<void>;
  getTreatment: (id: number) => Treatment | undefined;
  getTreatmentsByPet: (petId: number) => Treatment[];
  getTreatmentsByOwner: (ownerId: number) => Treatment[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Función para convertir de snake_case (Supabase) a camelCase (App)
function mapOwner(raw: any): Owner {
  return {
    id: String(raw.id),
    firstName: raw.first_name,
    lastName: raw.last_name,
    email: raw.email,
    phone: raw.phone || '',
    address: raw.address || '',
    document: raw.document || '',
    avatar: raw.avatar,
    pets: [],
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

function mapPet(raw: any): Pet {
  return {
    id: String(raw.id),
    name: raw.name,
    species: raw.species,
    breed: raw.breed || '',
    gender: raw.gender,
    size: raw.size,
    birthDate: raw.birth_date || '',
    weight: raw.weight || 0,
    color: raw.color || '',
    microchip: raw.microchip,
    photo: raw.photo,
    ownerId: String(raw.owner_id),
    isNeutered: raw.is_neutered,
    allergies: Array.isArray(raw.allergies) ? raw.allergies : [],
    notes: raw.notes,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
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
    diagnosis: raw.diagnosis,
    prescription: raw.prescription,
    status: raw.status,
    date: raw.date,
    time: raw.time,
    veterinarian: raw.veterinarian,
    cost: raw.cost,
    notes: raw.notes,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ownersRaw, petsRaw, treatmentsRaw] = await Promise.all([
        ownerService.getAll(),
        petService.getAll(),
        treatmentService.getAll(),
      ]);

      setOwners((ownersRaw || []).map(mapOwner));
      setPets((petsRaw || []).map(mapPet));
      setTreatments((treatmentsRaw || []).map(mapTreatment));
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
  const addOwner = useCallback(async (data: any): Promise<Owner> => {
    const payload = {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      document: data.document,
      avatar: data.avatar || null,
    };
    const raw = await ownerService.create(payload);
    const newOwner = mapOwner(raw);
    setOwners(prev => [newOwner, ...prev]);
    return newOwner;
  }, []);

  const updateOwner = useCallback(async (id: number, data: any) => {
    const payload: any = {};
    if (data.firstName !== undefined) payload.first_name = data.firstName;
    if (data.lastName !== undefined) payload.last_name = data.lastName;
    if (data.email !== undefined) payload.email = data.email;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.address !== undefined) payload.address = data.address;
    if (data.document !== undefined) payload.document = data.document;
    
    const raw = await ownerService.update(id, payload);
    const updated = mapOwner(raw);
    setOwners(prev => prev.map(o => (Number(o.id) === id ? updated : o)));
  }, []);

  const deleteOwner = useCallback(async (id: number) => {
    await ownerService.delete(id);
    setOwners(prev => prev.filter(o => Number(o.id) !== id));
    setPets(prev => prev.filter(p => Number(p.ownerId) !== id));
    setTreatments(prev => prev.filter(t => Number(t.ownerId) !== id));
  }, []);

  const getOwner = useCallback((id: number) => owners.find(o => Number(o.id) === id), [owners]);

  // ---- PETS ----
  const addPet = useCallback(async (data: any): Promise<Pet> => {
    const payload = {
      owner_id: Number(data.ownerId),
      name: data.name,
      species: data.species,
      breed: data.breed,
      gender: data.gender,
      size: data.size,
      birth_date: data.birthDate || null,
      weight: data.weight ? parseFloat(data.weight) : 0,
      color: data.color || null,
      is_neutered: data.isNeutered || false,
      allergies: data.allergies || [],
      notes: data.notes || null,
    };
    const raw = await petService.create(payload);
    const newPet = mapPet(raw);
    setPets(prev => [newPet, ...prev]);
    return newPet;
  }, []);

  const updatePet = useCallback(async (id: number, data: any) => {
    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.species !== undefined) payload.species = data.species;
    if (data.breed !== undefined) payload.breed = data.breed;
    if (data.gender !== undefined) payload.gender = data.gender;
    if (data.size !== undefined) payload.size = data.size;
    if (data.weight !== undefined) payload.weight = data.weight;
    if (data.color !== undefined) payload.color = data.color;
    if (data.isNeutered !== undefined) payload.is_neutered = data.isNeutered;
    
    const raw = await petService.update(id, payload);
    const updated = mapPet(raw);
    setPets(prev => prev.map(p => (Number(p.id) === id ? updated : p)));
  }, []);

  const deletePet = useCallback(async (id: number) => {
    await petService.delete(id);
    setPets(prev => prev.filter(p => Number(p.id) !== id));
    setTreatments(prev => prev.filter(t => Number(t.petId) !== id));
  }, []);

  const getPet = useCallback((id: number) => pets.find(p => Number(p.id) === id), [pets]);
  const getPetsByOwner = useCallback((ownerId: number) => pets.filter(p => Number(p.ownerId) === ownerId), [pets]);

  // ---- TREATMENTS ----
  const addTreatment = useCallback(async (data: any): Promise<Treatment> => {
    const payload = {
      pet_id: Number(data.petId),
      owner_id: Number(data.ownerId),
      type: data.type,
      title: data.title,
      description: data.description || null,
      status: data.status || 'scheduled',
      date: data.date,
      time: data.time,
      veterinarian: data.veterinarian || 'Veterinario',
      cost: parseFloat(data.cost) || 0,
      notes: data.notes || null,
    };
    const raw = await treatmentService.create(payload);
    const newTreatment = mapTreatment(raw);
    setTreatments(prev => [newTreatment, ...prev]);
    return newTreatment;
  }, []);

  const updateTreatment = useCallback(async (id: number, data: any) => {
    const payload: any = {};
    if (data.status !== undefined) payload.status = data.status;
    if (data.title !== undefined) payload.title = data.title;
    if (data.description !== undefined) payload.description = data.description;
    if (data.cost !== undefined) payload.cost = data.cost;
    
    const raw = await treatmentService.update(id, payload);
    const updated = mapTreatment(raw);
    setTreatments(prev => prev.map(t => (Number(t.id) === id ? updated : t)));
  }, []);

  const deleteTreatment = useCallback(async (id: number) => {
    await treatmentService.delete(id);
    setTreatments(prev => prev.filter(t => Number(t.id) !== id));
  }, []);

  const getTreatment = useCallback((id: number) => treatments.find(t => Number(t.id) === id), [treatments]);
  const getTreatmentsByPet = useCallback((petId: number) => treatments.filter(t => Number(t.petId) === petId), [treatments]);
  const getTreatmentsByOwner = useCallback((ownerId: number) => treatments.filter(t => Number(t.ownerId) === ownerId), [treatments]);

  return (
    <DataContext.Provider
      value={{
        owners,
        pets,
        treatments,
        loading,
        refreshAll,
        addOwner,
        updateOwner,
        deleteOwner,
        getOwner,
        addPet,
        updatePet,
        deletePet,
        getPet,
        getPetsByOwner,
        addTreatment,
        updateTreatment,
        deleteTreatment,
        getTreatment,
        getTreatmentsByPet,
        getTreatmentsByOwner,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData debe usarse dentro de DataProvider');
  return context;
}