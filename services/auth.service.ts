// ============================================
// LAIKITA - Auth Service (Supabase)
// ============================================

import { supabase } from '@/lib/supabase';
import type { User } from '@/lib/supabase';

export const authService = {
  // Iniciar sesión
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw new Error(error.message);
    
    // Obtener el perfil del usuario desde la tabla 'users'
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (profileError) throw new Error(profileError.message);
    
    return { user: data.user, profile: profile as User };
  },

  // Registrar nuevo usuario
  async register(name: string, email: string, password: string) {
    // Crear usuario en auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (authError) throw new Error(authError.message);
    
    if (authData.user) {
      // Crear perfil en la tabla 'users'
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          name,
          email,
          role: 'receptionist', // Rol por defecto
        });
      
      if (profileError) throw new Error(profileError.message);
    }
    
    return authData;
  },

  // Cerrar sesión
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  // Obtener usuario actual
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw new Error(error.message);
    
    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email!)
        .single();
      
      if (profileError) throw new Error(profileError.message);
      return { user, profile: profile as User };
    }
    
    return null;
  },

  // Cambiar contraseña
  async changePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw new Error(error.message);
    return { message: 'Contraseña actualizada correctamente' };
  },

  // Restablecer contraseña (envía email)
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'laikita://reset-password',
    });
    if (error) throw new Error(error.message);
    return { message: 'Revisa tu correo para restablecer tu contraseña' };
  },
};