import { Platform } from 'react-native';

const LOCAL_IP = '192.168.11.4'; // ← CAMBIA ESTO por tu IP de ipconfig

const BASE_URL = Platform.OS === 'web'
  ? 'http://localhost/laikita-backend/api'
  : `http://${LOCAL_IP}/laikita-backend/api`;

// ---- Generic fetch helper ----
async function request(endpoint: string, options: RequestInit = {}) {
  const url = `${BASE_URL}/${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error del servidor');
    }
    return data;
  } catch (error: any) {
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
}

// ---- AUTH ----
export const authAPI = {
  login: (email: string, password: string) =>
    request('auth.php?action=login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string) =>
    request('auth.php?action=register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  changePassword: (email: string, newPassword: string) =>
    request('auth.php?action=changePassword', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword }),
    }),
};

// ---- OWNERS ----
export const ownersAPI = {
  getAll: (search?: string) =>
    request(`owners.php${search ? `?search=${search}` : ''}`),

  getById: (id: string | number) =>
    request(`owners.php?id=${id}`),

  create: (data: any) =>
    request('owners.php', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string | number, data: any) =>
    request(`owners.php?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string | number) =>
    request(`owners.php?id=${id}`, { method: 'DELETE' }),
};

// ---- PETS ----
export const petsAPI = {
  getAll: (search?: string) =>
    request(`pets.php${search ? `?search=${search}` : ''}`),

  getById: (id: string | number) =>
    request(`pets.php?id=${id}`),

  getByOwner: (ownerId: string | number) =>
    request(`pets.php?owner_id=${ownerId}`),

  create: (data: any) =>
    request('pets.php', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string | number, data: any) =>
    request(`pets.php?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string | number) =>
    request(`pets.php?id=${id}`, { method: 'DELETE' }),
};

// ---- TREATMENTS ----
export const treatmentsAPI = {
  getAll: (status?: string, search?: string) => {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);
    const qs = params.toString();
    return request(`treatments.php${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string | number) =>
    request(`treatments.php?id=${id}`),

  getByPet: (petId: string | number) =>
    request(`treatments.php?pet_id=${petId}`),

  getByOwner: (ownerId: string | number) =>
    request(`treatments.php?owner_id=${ownerId}`),

  create: (data: any) =>
    request('treatments.php', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string | number, data: any) =>
    request(`treatments.php?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string | number) =>
    request(`treatments.php?id=${id}`, { method: 'DELETE' }),
};

// ---- PRODUCTS ----
export const productsAPI = {
  getAll: (category?: string, search?: string) => {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (search) params.append('search', search);
    const qs = params.toString();
    return request(`products.php${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string | number) =>
    request(`products.php?id=${id}`),

  create: (data: any) =>
    request('products.php', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string | number, data: any) =>
    request(`products.php?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string | number) =>
    request(`products.php?id=${id}`, { method: 'DELETE' }),

  checkout: (items: { productId: number; quantity: number; price: number }[], userId?: number) =>
    request('products.php?action=checkout', {
      method: 'POST',
      body: JSON.stringify({ items, userId }),
    }),
};
