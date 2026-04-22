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
    weight:
      raw.weight !== null && raw.weight !== undefined && raw.weight !== ''
        ? parseFloat(raw.weight)
        : 0,
    color: raw.color || '',
    microchip: raw.microchip || undefined,
    photo: raw.photo || undefined,
    ownerId: String(raw.owner_id),
    isNeutered:
      raw.is_neutered === 1 ||
      raw.is_neutered === true ||
      raw.isNeutered === true,
    allergies: Array.isArray(raw.allergies)
      ? raw.allergies
      : raw.allergies
      ? String(raw.allergies).split(',').filter(Boolean)
      : [],
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
    const payload = {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      document: data.document,
      avatar: (data as any).avatar ?? null,
    };

    const raw = await ownersAPI.create(payload);
    const owner = mapOwner(raw);
    setOwners(prev => [owner, ...prev]);
    return owner;
  }, []);

  const updateOwner = useCallback(async (id: string, data: Partial<OwnerFormData>) => {
    const payload: any = {};

    if (data.firstName !== undefined) payload.first_name = data.firstName;
    if (data.lastName !== undefined) payload.last_name = data.lastName;
    if (data.email !== undefined) payload.email = data.email;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.address !== undefined) payload.address = data.address;
    if (data.document !== undefined) payload.document = data.document;
    if ((data as any).avatar !== undefined) payload.avatar = (data as any).avatar;

    const raw = await ownersAPI.update(id, payload);
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
    const payload = {
      owner_id: data.ownerId,
      name: data.name,
      species: data.species,
      breed: data.breed ?? null,
      gender: data.gender,
      size: data.size,
      birth_date: data.birthDate ?? null,
      weight: data.weight ?? null,
      color: data.color ?? null,
      microchip: (data as any).microchip ?? null,
      photo: (data as any).photo ?? null,
      is_neutered: (data as any).isNeutered ?? false,
      allergies: (data as any).allergies ?? null,
      notes: (data as any).notes ?? null,
    };

    const raw = await petsAPI.create(payload);
    const pet = mapPet(raw);
    setPets(prev => [pet, ...prev]);
    return pet;
  }, []);

  const updatePet = useCallback(async (id: string, data: Partial<PetFormData>) => {
    const payload: any = {};

    if (data.ownerId !== undefined) payload.owner_id = data.ownerId;
    if (data.name !== undefined) payload.name = data.name;
    if (data.species !== undefined) payload.species = data.species;
    if (data.breed !== undefined) payload.breed = data.breed;
    if (data.gender !== undefined) payload.gender = data.gender;
    if (data.size !== undefined) payload.size = data.size;
    if (data.birthDate !== undefined) payload.birth_date = data.birthDate;
    if (data.weight !== undefined) payload.weight = data.weight;
    if (data.color !== undefined) payload.color = data.color;
    if ((data as any).microchip !== undefined) payload.microchip = (data as any).microchip;
    if ((data as any).photo !== undefined) payload.photo = (data as any).photo;
    if ((data as any).isNeutered !== undefined) payload.is_neutered = (data as any).isNeutered;
    if ((data as any).allergies !== undefined) payload.allergies = (data as any).allergies;
    if ((data as any).notes !== undefined) payload.notes = (data as any).notes;

    const raw = await petsAPI.update(id, payload);
    const updated = mapPet(raw);
    setPets(prev => prev.map(p => (p.id === id ? updated : p)));
  }, []);

  const deletePet = useCallback(async (id: string) => {
    await petsAPI.delete(id);
    setPets(prev => prev.filter(p => p.id !== id));
    setTreatments(prev => prev.filter(t => t.petId !== id));
  }, []);

  const getPet = useCallback((id: string) => pets.find(p => p.id === id), [pets]);

  const getPetsByOwner = useCallback(
    (ownerId: string) => pets.filter(p => p.ownerId === ownerId),
    [pets]
  );

  // ---- TREATMENTS ----
  const addTreatment = useCallback(async (data: TreatmentFormData): Promise<Treatment> => {
    const payload = {
      pet_id: data.petId,
      owner_id: data.ownerId,
      type: data.type,
      title: data.title,
      description: data.description ?? null,
      diagnosis: (data as any).diagnosis ?? null,
      prescription: (data as any).prescription ?? null,
      status: data.status,
      date: data.date,
      time: data.time,
      veterinarian: (data as any).veterinarian ?? null,
      cost: data.cost ?? 0,
      notes: data.notes ?? null,
    };

    const raw = await treatmentsAPI.create(payload);
    const treatment = mapTreatment(raw);
    setTreatments(prev => [treatment, ...prev]);
    return treatment;
  }, []);

  const updateTreatment = useCallback(async (id: string, data: Partial<TreatmentFormData>) => {
    const payload: any = {};

    if (data.petId !== undefined) payload.pet_id = data.petId;
    if (data.ownerId !== undefined) payload.owner_id = data.ownerId;
    if (data.type !== undefined) payload.type = data.type;
    if (data.title !== undefined) payload.title = data.title;
    if (data.description !== undefined) payload.description = data.description;
    if ((data as any).diagnosis !== undefined) payload.diagnosis = (data as any).diagnosis;
    if ((data as any).prescription !== undefined) payload.prescription = (data as any).prescription;
    if (data.status !== undefined) payload.status = data.status;
    if (data.date !== undefined) payload.date = data.date;
    if (data.time !== undefined) payload.time = data.time;
    if ((data as any).veterinarian !== undefined) payload.veterinarian = (data as any).veterinarian;
    if (data.cost !== undefined) payload.cost = data.cost;
    if (data.notes !== undefined) payload.notes = data.notes;

    const raw = await treatmentsAPI.update(id, payload);
    const updated = mapTreatment(raw);
    setTreatments(prev => prev.map(t => (t.id === id ? updated : t)));
  }, []);

  const deleteTreatment = useCallback(async (id: string) => {
    await treatmentsAPI.delete(id);
    setTreatments(prev => prev.filter(t => t.id !== id));
  }, []);

  const getTreatment = useCallback(
    (id: string) => treatments.find(t => t.id === id),
    [treatments]
  );

  const getTreatmentsByPet = useCallback(
    (petId: string) => treatments.filter(t => t.petId === petId),
    [treatments]
  );

  const getTreatmentsByOwner = useCallback(
    (ownerId: string) => treatments.filter(t => t.ownerId === ownerId),
    [treatments]
  );

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

export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData debe usarse dentro de DataProvider');
  return context;
}