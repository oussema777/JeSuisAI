'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { User, Session, SupabaseClient } from '@supabase/supabase-js';
import { useRouter } from '@/i18n/routing';

interface UserProfile {
  id: string;
  role: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  photo_url: string | null;
  annonceur_id: string | null;
  annonceur_ville: string | null;
  annonceur_name: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperadmin: boolean;
  isAnnonceur: boolean;
  signOut: () => Promise<void>;
  supabase: SupabaseClient;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isFetchingProfile = useRef(false);

  // Use the singleton client
  const supabase = getSupabaseBrowserClient();

  const fetchProfile = useCallback(async (userId: string) => {
    if (isFetchingProfile.current) return;

    try {
      isFetchingProfile.current = true;

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, 
          role, 
          first_name, 
          last_name, 
          email, 
          photo_url, 
          annonceur_id,
          annonceur_profiles:annonceur_id (
            nom,
            ville
          )
        `)
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Handle the joined data correctly
        const annonceurData = data.annonceur_profiles as any;
        setProfile({
          id: data.id,
          role: data.role,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          photo_url: data.photo_url,
          annonceur_id: data.annonceur_id,
          annonceur_ville: annonceurData?.ville || null,
          annonceur_name: annonceurData?.nom || null,
        });
      }

    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('[Auth] Fetch aborted');
      } else {
        console.error('[Auth] Profile error:', error);
      }
    } finally {
      isFetchingProfile.current = false;
      setLoading(false);
    }
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Timeout: don't let stale tokens block the app forever
        const getUserWithTimeout = Promise.race([
          supabase.auth.getUser(),
          new Promise<any>((_, reject) =>
            setTimeout(() => reject(new Error('Auth timeout')), 5000)
          ),
        ]);

        const { data: { user: initialUser }, error: authError } = await getUserWithTimeout;

        if (authError) {
          console.warn('[Auth] Init error:', authError.message);
          if (authError.message.includes('Refresh Token Not Found') || authError.message.includes('invalid_grant')) {
             await supabase.auth.signOut().catch(() => {});
          }
        }

        if (!mounted) return;

        if (initialUser) {
          setUser(initialUser);
          fetchProfile(initialUser.id);
        } else {
          setLoading(false);
        }
      } catch (error: any) {
        console.error('[Auth] Init failed:', error);
        if (mounted) {
          // Clear stale session on timeout or refresh token error to prevent infinite loading
          const isTimeout = error?.message === 'Auth timeout';
          const isRefreshTokenError = error?.message?.includes('Refresh Token Not Found') || error?.message?.includes('invalid_grant');
          
          if (isTimeout || isRefreshTokenError) {
            console.warn('[Auth] Session invalid or timed out, clearing stale tokens');
            await supabase.auth.signOut().catch(() => {});
          }
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) return;

      const newUser = newSession?.user ?? null;

      setUser(newUser);
      setSession(newSession);

      if (newUser) {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          fetchProfile(newUser.id);
        }
      } else {
        setProfile(null);
        setLoading(false);
      }

      if (event === 'SIGNED_OUT') {
        // Use a clean full reload to the localized login page
        const locale = window.location.pathname.split('/')[1] || 'fr';
        const targetLocale = ['en', 'fr'].includes(locale) ? locale : 'fr';
        window.location.href = `/${targetLocale}/login`;
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile, router]);

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      // The redirect is handled by onAuthStateChange listener
    } catch (error) {
      console.error('[Auth] SignOut error:', error);
      // Fallback redirect if listener doesn't fire
      const locale = window.location.pathname.split('/')[1] || 'fr';
      const targetLocale = ['en', 'fr'].includes(locale) ? locale : 'fr';
      window.location.href = `/${targetLocale}/login`;
    } finally {
      setProfile(null);
      setUser(null);
      setSession(null);
      setLoading(false);
    }
  };

  const isAdmin = profile?.role === 'Admin' || profile?.role === 'Superadmin' || profile?.role === 'Annonceur';
  const isSuperadmin = profile?.role === 'Superadmin';
  const isAnnonceur = profile?.role === 'Annonceur';

  const value = useMemo(() => ({
    user,
    session,
    profile,
    loading,
    isAuthenticated: !!user,
    isAdmin,
    isSuperadmin,
    isAnnonceur,
    signOut,
    supabase,
    refreshProfile
  }), [user, session, profile, loading, isAdmin, isSuperadmin, isAnnonceur, supabase, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
