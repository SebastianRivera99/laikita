import { useAuth } from '@/context/AuthContext';

export function usePermissions() {
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin';
  const isVet = user?.role === 'vet';
  const isReceptionist = user?.role === 'receptionist';
  
  const canEdit = isAdmin;
  const canDelete = isAdmin;
  const canCreate = isAdmin || isVet || isReceptionist;
  const canView = true;
  
  return {
    isAdmin,
    isVet,
    isReceptionist,
    canEdit,
    canDelete,
    canCreate,
    canView,
    role: user?.role,
  };
}