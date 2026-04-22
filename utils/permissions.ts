import type { User } from '@/types';

export type AppRole = 'admin' | 'vet' | 'receptionist';

export const ROLE_PERMISSIONS = {
  admin: {
    owners: { view: true, create: true, edit: true, delete: true },
    pets: { view: true, create: true, edit: true, delete: true },
    treatments: { view: true, create: true, edit: true, delete: true },
    store: { view: true, create: true, edit: true, delete: true },
    users: { view: true, create: true, edit: true, delete: true, changeRole: true },
  },
  receptionist: {
    owners: { view: true, create: true, edit: true, delete: false },
    pets: { view: true, create: true, edit: true, delete: false },
    treatments: { view: true, create: true, edit: false, delete: false },
    store: { view: true, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false, changeRole: false },
  },
  vet: {
    owners: { view: true, create: false, edit: false, delete: false },
    pets: { view: true, create: false, edit: true, delete: false },
    treatments: { view: true, create: true, edit: true, delete: false },
    store: { view: false, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false, changeRole: false },
  },
} as const;

export function getRole(user?: User | null): AppRole {
  return (user?.role ?? 'receptionist') as AppRole;
}

export function can(user: User | null, module: keyof typeof ROLE_PERMISSIONS.admin, action: string) {
  const role = getRole(user);
  const modulePermissions = ROLE_PERMISSIONS[role][module] as Record<string, boolean>;
  return !!modulePermissions?.[action];
}