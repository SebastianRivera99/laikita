// ============================================
// LAIKITA - Type Definitions
// ============================================

// --- Auth ---
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'vet' | 'receptionist';
  avatar?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// --- Owner (Dueño) ---
export interface Owner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  document: string; // Cédula / ID
  avatar?: string;
  pets: string[]; // Pet IDs
  createdAt: string;
  updatedAt: string;
}

export type OwnerFormData = Omit<Owner, 'id' | 'pets' | 'createdAt' | 'updatedAt'>;

// --- Pet (Mascota) ---
export type PetSpecies = 'dog' | 'cat' | 'bird' | 'rabbit' | 'hamster' | 'other';
export type PetGender = 'male' | 'female';
export type PetSize = 'small' | 'medium' | 'large';

export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  breed: string;
  gender: PetGender;
  size: PetSize;
  birthDate: string;
  weight: number; // kg
  color: string;
  microchip?: string;
  photo?: string;
  ownerId: string;
  isNeutered: boolean;
  allergies: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type PetFormData = Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>;

// --- Treatment (Tratamiento) ---
export type TreatmentStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type TreatmentType =
  | 'consultation'
  | 'vaccination'
  | 'surgery'
  | 'grooming'
  | 'dental'
  | 'laboratory'
  | 'emergency'
  | 'deworming'
  | 'other';

export interface Treatment {
  id: string;
  petId: string;
  ownerId: string;
  type: TreatmentType;
  title: string;
  description: string;
  diagnosis?: string;
  prescription?: string;
  status: TreatmentStatus;
  date: string;
  time: string;
  veterinarian: string;
  cost: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type TreatmentFormData = Omit<Treatment, 'id' | 'createdAt' | 'updatedAt'>;

// --- Product (Producto) ---
export type ProductCategory =
  | 'food'
  | 'medicine'
  | 'accessories'
  | 'hygiene'
  | 'toys'
  | 'clothing';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  stock: number;
  image?: string;
  brand: string;
  petType: PetSpecies[];
  isActive: boolean;
  createdAt: string;
}

// --- Cart ---
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

// --- Availability (Disponibilidad) ---
export interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  veterinarian: string;
  isAvailable: boolean;
  treatmentId?: string;
}

// --- UI Helpers ---
export interface SelectOption {
  label: string;
  value: string;
}

export interface TabRoute {
  name: string;
  title: string;
  icon: string;
}
