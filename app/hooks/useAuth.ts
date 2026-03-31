'use client';

import { useAuthContext } from '../contexts/AuthContext';

export function useAuth() {
  const context = useAuthContext();
  
  // Backward compatibility wrapper
  return {
    ...context,
    // Add signIn since it wasn't in context yet (context focuses on state)
    signIn: async (email: string, password: string) => {
      try {
        const { data, error } = await context.supabase.auth.signInWithPassword({
          email,
          password,
        });
        return { data, error };
      } catch (error: any) {
        return { data: null, error };
      }
    },
    // Helper to check if user has specific role
    hasRole: (role: string | string[]) => {
      if (!context.profile?.role) return false;
      if (Array.isArray(role)) return role.includes(context.profile.role);
      return context.profile.role === role;
    },
    getAnnonceurVille: () => context.profile?.annonceur_ville || null,
  };
}