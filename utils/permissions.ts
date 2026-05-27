// ============================================
// LAIKITA - Permissions Utils (para navegación)
// ============================================

import type { User } from '@/types';

export type AppRole = 'admin' | 'vet' | 'inventory' | 'receptionist';

// Permisos para mostrar/ocultar pestañas en la navegación
export const ROLE_PERMISSIONS = {
  admin: {
    owners: { view: true },
    pets: { view: true },
    treatments: { view: true },
    store: { view: true },
  },
  vet: {
    owners: { view: false },
    pets: { view: false },
    treatments: { view: true },
    store: { view: false },
  },
  inventory: {
    owners: { view: false },
    pets: { view: false },
    treatments: { view: false },
    store: { view: true },
  },
  receptionist: {
    owners: { view: true },
    pets: { view: true },
    treatments: { view: true },
    store: { view: true },
  },
};

export function getRole(user?: User | null): AppRole {
  return (user?.role ?? 'receptionist') as AppRole;
}

export function can(user: User | null, module: keyof typeof ROLE_PERMISSIONS.admin, action: string = 'view') {
  const role = getRole(user);
  const modulePermissions = ROLE_PERMISSIONS[role];
  
  // Si el rol no existe en el objeto o el módulo no existe, retornar false
  if (!modulePermissions || !modulePermissions[module]) {
    return false;
  }
  
  return modulePermissions[module][action as keyof typeof modulePermissions[typeof module]] ?? false;
}