// ============================================
// LAIKITA - Formatters
// ============================================

import { TreatmentType, TreatmentStatus, PetSpecies, ProductCategory } from '@/types';

export const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString('es-CO')}`;
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (dateStr: string, time: string): string => {
  return `${formatDate(dateStr)} - ${time}`;
};

export const formatPhone = (phone: string): string => {
  if (phone.length === 10) {
    return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
  }
  return phone;
};

export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

export const treatmentTypeLabel: Record<TreatmentType, string> = {
  consultation: 'Consulta',
  vaccination: 'Vacunación',
  surgery: 'Cirugía',
  grooming: 'Peluquería',
  dental: 'Dental',
  laboratory: 'Laboratorio',
  emergency: 'Emergencia',
  deworming: 'Desparasitación',
  other: 'Otro',
};

export const treatmentStatusLabel: Record<TreatmentStatus, string> = {
  scheduled: 'Programado',
  in_progress: 'En progreso',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

export const speciesLabel: Record<PetSpecies, string> = {
  dog: 'Perro',
  cat: 'Gato',
  bird: 'Ave',
  rabbit: 'Conejo',
  hamster: 'Hámster',
  other: 'Otro',
};

export const speciesEmoji: Record<PetSpecies, string> = {
  dog: '🐕',
  cat: '🐱',
  bird: '🐦',
  rabbit: '🐰',
  hamster: '🐹',
  other: '🐾',
};

export const categoryLabel: Record<ProductCategory, string> = {
  food: 'Alimento',
  medicine: 'Medicamento',
  accessories: 'Accesorios',
  hygiene: 'Higiene',
  toys: 'Juguetes',
  clothing: 'Ropa',
};

export const categoryEmoji: Record<ProductCategory, string> = {
  food: '🍖',
  medicine: '💊',
  accessories: '🎒',
  hygiene: '🧴',
  toys: '🎾',
  clothing: '👕',
};
