// ============================================
// LAIKITA - Permissions Hook
// ============================================

import { useAuth } from '@/context/AuthContext';
import { Alert, Platform } from 'react-native';

export function usePermissions() {
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin';
  const isVet = user?.role === 'vet';
  const isInventory = user?.role === 'inventory';
  const isReceptionist = user?.role === 'receptionist';
  
  // Dueños
  const canViewOwners = isAdmin || isReceptionist;
  const canCreateOwners = isAdmin || isReceptionist;
  const canEditOwners = isAdmin || isReceptionist;
  const canDeleteOwners = isAdmin || isReceptionist;
  
  // Mascotas
  const canViewPets = isAdmin || isReceptionist;
  const canCreatePets = isAdmin || isReceptionist;
  const canEditPets = isAdmin || isReceptionist;
  const canDeletePets = isAdmin || isReceptionist;
  
  // Citas
  const canViewTreatments = isAdmin || isVet || isReceptionist;
  const canCreateTreatments = isAdmin || isReceptionist;
  const canEditTreatments = isAdmin || isReceptionist;
  const canDeleteTreatments = isAdmin || isReceptionist;
  const canChangeTreatmentStatus = isAdmin || isVet;
  
  // Tienda
  const canViewStore = isAdmin || isInventory || isReceptionist;
  const canManageProducts = isAdmin || isInventory;
  
  // Historia Clínica
  const canViewMedicalRecord = isAdmin || isVet;
  const canCreateMedicalRecord = isAdmin || isVet;
  
  // Admin
  const canAccessAdminPanel = isAdmin;
  const canManageUsers = isAdmin;
  
  const showPermissionDenied = (action: string) => {
    const message = `No tienes permisos para ${action}.\n\nContacta con el administrador.`;
    if (Platform.OS === 'web') {
      alert(message);
    } else {
      Alert.alert('Acceso denegado', message);
    }
  };
  
  return {
    isAdmin, isVet, isInventory, isReceptionist,
    canViewOwners, canCreateOwners, canEditOwners, canDeleteOwners,
    canViewPets, canCreatePets, canEditPets, canDeletePets,
    canViewTreatments, canCreateTreatments, canEditTreatments, canDeleteTreatments, canChangeTreatmentStatus,
    canViewStore, canManageProducts,
    canViewMedicalRecord, canCreateMedicalRecord,
    canAccessAdminPanel, canManageUsers,
    role: user?.role,
    showPermissionDenied,
  };
}