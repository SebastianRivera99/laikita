// ============================================
// LAIKITA - Form Field Configurations
// Define los campos de cada formulario UNA vez.
// Se reutilizan en crear y editar.
// ============================================

import { FormField } from '@/components/ui/FormBuilder';
import { Colors } from '@/constants/Colors';
import { Owner, Pet } from '@/types';
import { speciesEmoji } from '@/utils/formatters';

// ---- OWNER FIELDS ----
export const ownerFields: FormField[] = [
  { type: 'text', key: 'firstName', label: 'Nombre *', placeholder: 'María', icon: 'person-outline' },
  { type: 'text', key: 'lastName', label: 'Apellido *', placeholder: 'García', icon: 'person-outline' },
  { type: 'text', key: 'document', label: 'Cédula / Documento *', placeholder: '1023456789', icon: 'card-outline', keyboard: 'numeric' },
  { type: 'text', key: 'email', label: 'Correo electrónico *', placeholder: 'maria@email.com', icon: 'mail-outline', keyboard: 'email-address', autoCapitalize: 'none' },
  { type: 'text', key: 'phone', label: 'Teléfono *', placeholder: '3001234567', icon: 'call-outline', keyboard: 'phone-pad' },
  { type: 'text', key: 'address', label: 'Dirección *', placeholder: 'Calle 45 #12-30, Bogotá', icon: 'location-outline' },
];

// ---- PET FIELDS ----
// El picker de dueño se genera dinámicamente (ver buildPetFields)
export function buildPetFields(owners: Owner[]): FormField[] {
  return [
    {
      type: 'picker',
      key: 'ownerId',
      label: 'Dueño *',
      placeholder: 'Seleccionar dueño',
      icon: 'person-outline',
      options: owners.map(o => ({ id: o.id, label: `${o.firstName} ${o.lastName} — ${o.document}` })),
    },
    { type: 'text', key: 'name', label: 'Nombre *', placeholder: 'Luna', icon: 'paw-outline' },
    {
      type: 'chips',
      key: 'species',
      label: 'Especie *',
      options: [
        { key: 'dog', label: 'Perro', emoji: '🐕' },
        { key: 'cat', label: 'Gato', emoji: '🐱' },
        { key: 'bird', label: 'Ave', emoji: '🐦' },
        { key: 'rabbit', label: 'Conejo', emoji: '🐰' },
        { key: 'hamster', label: 'Hámster', emoji: '🐹' },
        { key: 'other', label: 'Otro', emoji: '🐾' },
      ],
    },
    { type: 'text', key: 'breed', label: 'Raza *', placeholder: 'Golden Retriever', icon: 'bookmark-outline' },
    {
      type: 'chips',
      key: 'gender',
      label: 'Género',
      options: [
        { key: 'male', label: 'Macho', emoji: '♂️' },
        { key: 'female', label: 'Hembra', emoji: '♀️' },
      ],
    },
    {
      type: 'chips',
      key: 'size',
      label: 'Tamaño',
      options: [
        { key: 'small', label: 'Pequeño' },
        { key: 'medium', label: 'Mediano' },
        { key: 'large', label: 'Grande' },
      ],
    },
    { type: 'text', key: 'weight', label: 'Peso (kg)', placeholder: '12', icon: 'scale-outline', keyboard: 'numeric', half: true },
    { type: 'text', key: 'color', label: 'Color', placeholder: 'Dorado', icon: 'color-palette-outline', half: true },
    { type: 'text', key: 'birthDate', label: 'Fecha de nacimiento', placeholder: '2022-05-15', icon: 'calendar-outline' },
  ];
}

// ---- TREATMENT FIELDS ----
// El picker de mascota se genera dinámicamente
export function buildTreatmentFields(pets: Pet[], owners: Owner[]): FormField[] {
  return [
    {
      type: 'picker',
      key: 'petId',
      label: 'Mascota *',
      placeholder: 'Seleccionar mascota',
      icon: 'paw-outline',
      options: pets.map(p => {
        const o = owners.find(ow => ow.id === p.ownerId);
        return {
          id: p.id,
          label: `${speciesEmoji[p.species]} ${p.name} — ${p.breed}${o ? ` (${o.firstName})` : ''}`,
        };
      }),
    },
    {
      type: 'chips',
      key: 'type',
      label: 'Tipo de tratamiento',
      options: [
        { key: 'consultation', label: 'Consulta', color: Colors.treatmentColors.consultation },
        { key: 'vaccination', label: 'Vacunación', color: Colors.treatmentColors.vaccination },
        { key: 'surgery', label: 'Cirugía', color: Colors.treatmentColors.surgery },
        { key: 'grooming', label: 'Peluquería', color: Colors.treatmentColors.grooming },
        { key: 'dental', label: 'Dental', color: Colors.treatmentColors.dental },
        { key: 'laboratory', label: 'Laboratorio', color: Colors.treatmentColors.laboratory },
        { key: 'emergency', label: 'Emergencia', color: Colors.treatmentColors.emergency },
        { key: 'deworming', label: 'Desparasitación', color: Colors.treatmentColors.deworming },
      ],
    },
    { type: 'text', key: 'title', label: 'Título *', placeholder: 'Vacuna antirrábica', icon: 'text-outline' },
    { type: 'text', key: 'description', label: 'Descripción', placeholder: 'Detalles del tratamiento...', icon: 'document-text-outline', multiline: true },
    { type: 'text', key: 'date', label: 'Fecha *', placeholder: '2025-03-28', icon: 'calendar-outline', half: true },
    { type: 'text', key: 'time', label: 'Hora *', placeholder: '10:00', icon: 'time-outline', half: true },
    { type: 'text', key: 'cost', label: 'Costo ($)', placeholder: '45000', icon: 'cash-outline', keyboard: 'numeric' },
  ];
}

// ---- LOGIN FIELDS ----
export const loginFields: FormField[] = [
  { type: 'text', key: 'email', label: 'Correo electrónico', placeholder: 'admin@laikita.com', icon: 'mail-outline', keyboard: 'email-address', autoCapitalize: 'none' },
  { type: 'text', key: 'password', label: 'Contraseña', placeholder: '••••••••', icon: 'lock-closed-outline', isPassword: true },
];

// ---- REGISTER FIELDS ----
export const registerFields: FormField[] = [
  { type: 'text', key: 'name', label: 'Nombre completo', placeholder: 'Dr. Juan Pérez', icon: 'person-outline' },
  { type: 'text', key: 'email', label: 'Correo electrónico', placeholder: 'juan@laikita.com', icon: 'mail-outline', keyboard: 'email-address', autoCapitalize: 'none' },
  { type: 'text', key: 'password', label: 'Contraseña', placeholder: '••••••••', icon: 'lock-closed-outline', isPassword: true },
  { type: 'text', key: 'confirmPassword', label: 'Confirmar contraseña', placeholder: '••••••••', icon: 'shield-checkmark-outline', isPassword: true },
];
