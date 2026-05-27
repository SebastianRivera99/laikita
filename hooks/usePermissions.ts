// ============================================
// LAIKITA - Permissions Hook
// ============================================

import { useAuth } from '@/context/AuthContext';

export function usePermissions() {
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin';
  const isVet = user?.role === 'vet';
  const isInventory = user?.role === 'inventory';
  const isReceptionist = user?.role === 'receptionist';
  
  // Permisos generales
  const canView = isAdmin || isVet || isReceptionist;
  const canCreate = isAdmin || isReceptionist;
  const canEdit = isAdmin || isReceptionist;
  const canDelete = isAdmin || isReceptionist;
  
  // Permiso especial para cambiar estado de citas (solo admin y vet)
  const canChangeTreatmentStatus = isAdmin || isVet;
  
  // Permisos de productos (admin e inventory)
  const canManageProducts = isAdmin || isInventory;
  
  // Acceso a panel admin (solo admin)
  const canAccessAdminPanel = isAdmin;
  
  // Gestión de usuarios (solo admin)
  const canManageUsers = isAdmin;
  
  return {
    isAdmin,
    isVet,
    isInventory,
    isReceptionist,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canChangeTreatmentStatus,
    canManageProducts,
    canAccessAdminPanel,
    canManageUsers,
    role: user?.role,
  };
}