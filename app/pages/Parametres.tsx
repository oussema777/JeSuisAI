'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { HeaderAdmin } from '../components/admin/HeaderAdmin';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { FicheAnnonceurTab } from './FicheAnnonceur';
import { MonCompte } from './MonCompte';
import GestionUtilisateurs from './GestionUtilisateurs';
import { useAuth } from '../hooks/useAuth';
import { useTranslations, useLocale } from 'next-intl';

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  photo_url: string | null;
  role: 'Admin' | 'Annonceur' | 'Superadmin';
  annonceur_id: string | null;
  created_at: string;
  updated_at: string;
  email_preferences?: {
    new_applications: boolean;
    auto_reminders: boolean;
    weekly_summary: boolean;
    platform_updates: boolean;
  } | null;
}

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'Admin' | 'Annonceur' | 'Superadmin';
  status: 'Actif' | 'Invité' | 'Inactif';
  addedDate: string;
  photo?: string;
  initials: string;
}

// Separate the component that uses useSearchParams
function ParametresContent() {
  const t = useTranslations('Admin.Settings');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'compte' | 'annonceur' | 'equipe'>('compte');
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = getSupabaseBrowserClient();

  // Sync tab with query param
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'annonceur') {
      setActiveTab('annonceur');
    } else if (tab === 'equipe') {
      // Security: Redirect non-admins if they try to access equipe tab via URL
      if (userProfile && userProfile.role !== 'Admin' && userProfile.role !== 'Superadmin') {
        setActiveTab('compte');
        router.replace('/admin/parametres?tab=compte');
      } else {
        setActiveTab('equipe');
      }
    } else if (tab === 'compte') {
      setActiveTab('compte');
    }
  }, [searchParams, userProfile, router]);

  // Fetch user profile on mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setUserProfile(data);
      
      // Fetch team members if user has an annonceur_id
      if (data.annonceur_id) {
        fetchTeamMembers(data.annonceur_id);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async (annonceurId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role, created_at')
        .eq('annonceur_id', annonceurId)
        .neq('role', 'Superadmin')
        .neq('role', 'user')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedMembers: TeamMember[] = data.map(m => ({
          id: m.id,
          firstName: m.first_name || '',
          lastName: m.last_name || '',
          email: m.email,
          role: m.role as any,
          status: 'Actif', // In a real app, you might have a status field
          addedDate: `Ajouté le ${new Date(m.created_at).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' })}`,
          initials: (m.first_name?.[0] || '') + (m.last_name?.[0] || '') || 'U',
        }));
        setTeamMembers(mappedMembers);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  // Check if user is admin or superadmin
  const isAdmin = userProfile?.role === 'Admin' || userProfile?.role === 'Superadmin';

  if (loading) {
    return (
      <div className="flex min-h-screen bg-neutral-50 items-center justify-center">
        <div className="text-neutral-600">{tCommon('loading')}</div>
      </div>
    );
  }

  if (!userProfile) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="flex-1 flex flex-col min-h-screen">
        <HeaderAdmin
          pageTitle={t('tabs.account')}
          breadcrumb={[
            { label: tCommon('back') || 'Tableau de bord', href: '/admin/dashboard' },
            { label: t('tabs.account') },
            { label: activeTab === 'compte' ? t('tabs.account') : activeTab === 'annonceur' ? t('tabs.announcer') : t('tabs.team') },
          ]}
        />
        <div className="flex-1 overflow-y-auto">
          <div className="pt-20 px-10 pb-10 max-w-[1100px]">
            <div className="bg-white border border-neutral-200 rounded-t-xl">
              <div className="flex items-center border-b-2 border-neutral-200">
                <button
                  onClick={() => setActiveTab('compte')}
                  className={`px-8 py-5 relative transition-colors ${
                    activeTab === 'compte' ? 'text-primary' : 'text-neutral-600 hover:bg-neutral-50'
                  }`}
                  style={{ fontSize: '16px', fontWeight: 600 }}
                >
                  {t('tabs.account')}
                  {activeTab === 'compte' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" style={{ height: '3px' }} />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('annonceur')}
                  className={`px-8 py-5 relative transition-colors ${
                    activeTab === 'annonceur' ? 'text-primary' : 'text-neutral-600 hover:bg-neutral-50'
                  }`}
                  style={{ fontSize: '16px', fontWeight: 600 }}
                >
                  {t('tabs.announcer')}
                  {activeTab === 'annonceur' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" style={{ height: '3px' }} />
                  )}
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setActiveTab('equipe')}
                    className={`px-8 py-5 relative transition-colors flex items-center gap-2 ${
                      activeTab === 'equipe' ? 'text-primary' : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                    style={{ fontSize: '16px', fontWeight: 600 }}
                  >
                    {t('tabs.team')}
                    {teamMembers.length > 0 && (
                      <span className="w-6 h-6 flex items-center justify-center bg-green-500 text-white rounded-full" style={{ fontSize: '12px', fontWeight: 600 }}>
                        {teamMembers.length}
                      </span>
                    )}
                    {activeTab === 'equipe' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" style={{ height: '3px' }} />
                    )}
                  </button>
                )}
              </div>
            </div>
            <div className="bg-white border border-t-0 border-neutral-200 rounded-b-xl p-12 shadow-sm">
              {activeTab === 'compte' && (
                <MonCompte
                  userProfile={userProfile}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  onProfileUpdate={fetchUserProfile}
                  supabase={supabase}
                />
              )}
              {activeTab === 'annonceur' && (
                <FicheAnnonceurTab
                  userProfile={userProfile}
                  supabase={supabase}
                  onProfileUpdate={fetchUserProfile}
                />
              )}
              {activeTab === 'equipe' && isAdmin && (
                <GestionUtilisateurs hideSidebar={true} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main export with Suspense wrapper
export default function Parametres() {
  const tCommon = useTranslations('Common');
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-neutral-50 items-center justify-center">
        <div className="text-neutral-600">{tCommon('loading')}</div>
      </div>
    }>
      <ParametresContent />
    </Suspense>
  );
}
