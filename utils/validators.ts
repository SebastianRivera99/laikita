// ============================================
// LAIKITA - Validators
// ============================================

export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const regex = /^3\d{9}$/;
  return regex.test(phone.replace(/\D/g, ''));
};

export const isRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const minLength = (value: string, min: number): boolean => {
  return value.trim().length >= min;
};

export const isValidDocument = (doc: string): boolean => {
  const cleaned = doc.replace(/\D/g, '');
  return cleaned.length >= 6 && cleaned.length <= 12;
};

export interface ValidationError {
  field: string;
  message: string;
}

export const validateOwnerForm = (data: Record<string, string>): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!isRequired(data.firstName)) errors.push({ field: 'firstName', message: 'El nombre es requerido' });
  if (!isRequired(data.lastName)) errors.push({ field: 'lastName', message: 'El apellido es requerido' });
  if (!isValidEmail(data.email)) errors.push({ field: 'email', message: 'Email inválido' });
  if (!isValidPhone(data.phone)) errors.push({ field: 'phone', message: 'Teléfono inválido (10 dígitos)' });
  if (!isRequired(data.address)) errors.push({ field: 'address', message: 'La dirección es requerida' });
  if (!isValidDocument(data.document)) errors.push({ field: 'document', message: 'Documento inválido' });

  return errors;
};

export const validatePetForm = (data: Record<string, string>): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!isRequired(data.name)) errors.push({ field: 'name', message: 'El nombre es requerido' });
  if (!isRequired(data.species)) errors.push({ field: 'species', message: 'La especie es requerida' });
  if (!isRequired(data.breed)) errors.push({ field: 'breed', message: 'La raza es requerida' });
  if (!isRequired(data.ownerId)) errors.push({ field: 'ownerId', message: 'Debe seleccionar un dueño' });

  return errors;
};
