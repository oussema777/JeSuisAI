'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { checkRateLimit } from '@/lib/rate-limit';
import { supabaseAdmin } from '@/lib/supabase/admin';

type ProfileRole = 'Admin' | 'Superadmin' | 'Annonceur';
type ProfileStatus = 'actif' | 'inactif' | 'en_attente';
const ALLOWED_ROLES: ProfileRole[] = ['Admin', 'Superadmin', 'Annonceur'];

export async function createUserAsAdmin(userData: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  status: string;
  annonceur_id?: string; // NEW: support city/org assignment
}) {
  try {
    // Auth check: verify the caller is a Superadmin or Admin
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() {},
        },
      }
    );
    const { data: { user: caller } } = await supabase.auth.getUser();
    if (!caller) {
      return { success: false, error: 'Non autorisé' };
    }

    // Fetch caller profile with Admin client to ensure we get all fields (bypassing RLS)
    const { data: callerProfile } = await supabaseAdmin
      .from('profiles')
      .select('role, annonceur_id')
      .eq('id', caller.id)
      .single();

    // Permission Check
    if (callerProfile?.role === 'Admin') {
      // Admins can only create Annonceurs or other Admins
      const allowedRolesForAdmin = ['Annonceur', 'Admin'];
      if (!allowedRolesForAdmin.includes(userData.role)) {
        return { success: false, error: 'Un Admin ne peut créer que des comptes Annonceur ou Admin' };
      }

      let targetAnnonceurId = callerProfile.annonceur_id;

      // If the Admin has no city ID, try to find it from their missions
      if (!targetAnnonceurId) {
        const { data: mission } = await supabaseAdmin
          .from('opportunites')
          .select('annonceur_id')
          .eq('created_by', caller.id)
          .is('annonceur_id', 'not.null')
          .limit(1)
          .maybeSingle();
        
        if (mission?.annonceur_id) {
          targetAnnonceurId = mission.annonceur_id;
          // Optionally update the caller's profile to fix it for future calls
          await supabaseAdmin.from('profiles').update({ annonceur_id: targetAnnonceurId }).eq('id', caller.id);
        }
      }

      // Sync the new user to the same city ID
      if (!targetAnnonceurId) {
        return { success: false, error: 'Impossible de déterminer votre organisation. Veuillez contacter un administrateur.' };
      }
      userData.annonceur_id = targetAnnonceurId;
    } else if (callerProfile?.role !== 'Superadmin') {
      return { success: false, error: 'Accès refusé' };
    }

    // Rate limit: 10 user creations per minute per admin
    const rl = checkRateLimit(`create-user:${caller.id}`, { maxRequests: 10, windowSeconds: 60 });
    if (!rl.allowed) {
      return { success: false, error: 'Trop de requêtes. Veuillez réessayer plus tard.' };
    }

    // Validate the role being assigned
    if (!ALLOWED_ROLES.includes(userData.role as ProfileRole)) {
      return { success: false, error: 'Rôle invalide' };
    }

    // Step 1: Create user with admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // This confirms the email immediately
      user_metadata: {
        first_name: userData.first_name,
        last_name: userData.last_name,
      }
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      return { success: false, error: 'Erreur lors de la création du compte' };
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create user - no user returned' };
    }

    // Step 2: Ensure profile creation/update with annonceur_id
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone || null,
        role: userData.role as ProfileRole,
        status: userData.status as ProfileStatus,
        annonceur_id: userData.annonceur_id || null, // Link to the city/org
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (profileError) {
      console.error('Profile update error:', profileError);
      return { success: true, user: authData.user, message: 'Utilisateur créé mais profil incomplet' };
    }

    return {
      success: true, 
      user: authData.user,
      message: 'Utilisateur créé avec succès.'
    };

  } catch (error: unknown) {
    console.error('Error creating user:', error);
    return { success: false, error: 'Erreur interne du serveur' };
  }
}