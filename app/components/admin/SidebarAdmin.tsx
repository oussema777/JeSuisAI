'use client';
import React, { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Newspaper,
  Inbox, 
  BarChart3, 
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  FileText,
  Plus,
  FilePlus,
  User,
  Users 
} from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import Image from 'next/image';
import { useAuth } from '@/app/hooks/useAuth';
import { Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

interface SidebarAdminProps {
  activePage: 'dashboard' | 'opportunites' | 'actualites' | 'candidatures' | 'profiles soumis' | 'projets soumis' | 'parametres' | 'utilisateurs' | 'aide';
  activeSubPage?: 'toutes' | 'creer-nouvelle' | 'brouillons';
  isCollapsed?: boolean;
  onToggle?: () => void;
}

const routeMap: { [key: string]: string } = {
  'accueil': '/',
  'dashboard': '/admin/dashboard',
  'opportunites': '/admin/opportunites',
  'creer-opportunite': '/admin/opportunites/creer',
  'opportunites-brouillons': '/admin/opportunites?view=brouillons', 
  'actualites': '/admin/actualites',
  'creer-actualite': '/admin/actualites/creer',
  'actualites-brouillons': '/admin/actualites?view=brouillons',
  'candidatures': '/admin/candidatures',
  'profiles soumis':'/admin/profilesoumis',
  'projets soumis':'/admin/projetsoumis',
  'parametres': '/admin/parametres',
  'utilisateurs': '/admin/utilisateurs',
  'aide': '/admin/aide',
  'admin-login': '/login',
};

export function SidebarAdmin({ activePage, activeSubPage, isCollapsed = false, onToggle }: SidebarAdminProps) {
  const t = useTranslations('Admin.Sidebar');
  const tCommon = useTranslations('Common');
  const params = useParams();
  const currentLocale = params.locale as string || 'fr';
  const router = useRouter();
  const { profile, loading, signOut, supabase } = useAuth();
  const [opportunitesExpanded, setOpportunitesExpanded] = React.useState(activePage === 'opportunites');
  const [actualitesExpanded, setActualitesExpanded] = React.useState(activePage === 'actualites');
  
  React.useEffect(() => {
    if (activePage === 'opportunites') {
      setOpportunitesExpanded(true);
    } else {
        if (!isCollapsed) setOpportunitesExpanded(false);
    }
    if (activePage === 'actualites') {
      setActualitesExpanded(true);
    } else {
        if (!isCollapsed) setActualitesExpanded(false);
    }
  }, [activePage, isCollapsed]);

  // Handle Logout
  const handleLogout = async () => {
    await signOut();
  };

  // Helper to generate initials
  const getInitials = () => {
    if (!profile) return '';
    const first = profile.first_name?.[0] || '';
    const last = profile.last_name?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  const displayName = profile 
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email 
    : (currentLocale === 'fr' ? 'Chargement...' : 'Loading...');

  // Get annonceur name with fallback
  const getAnnonceurName = () => {
    return profile?.annonceur_name || (currentLocale === 'fr' ? 'Organisation' : 'Organization');
  };

  return (
    <aside 
      className={`h-screen bg-bg-base fixed left-0 top-0 z-[100] shadow-lg flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-[80px]' : 'w-[260px]'
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute right-2 top-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all z-50"
        title={isCollapsed ? t('expand') : t('collapse')}
      >
        {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>

      {/* Logo & Municipality */}
      <div className={`px-5 py-4 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <Link 
          href={routeMap['accueil']}
          className={`w-full mb-2 hover:opacity-80 transition-opacity cursor-pointer block ${isCollapsed ? 'flex justify-center' : ''}`}
          aria-label={currentLocale === 'fr' ? "Retour à l'accueil" : "Back to home"}
        >
          {isCollapsed ? (
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">J</div>
          ) : (
            <Image 
              src="https://ilab.tn/wp-content/uploads/2026/02/jesuisaucameroun-logo-b.png" 
              alt="Je suis au Cameroun"
              width={130}
              height={32}
              className="w-[130px] h-auto mx-auto"
            />
          )}
        </Link>
        {!isCollapsed && (
          <>
            <p className="text-white text-center mb-3 truncate px-2" style={{ fontSize: '13px', fontWeight: 500 }}>
              {loading ? (
                <span className="inline-block animate-pulse bg-white/20 h-3 w-24 rounded mx-auto"></span>
              ) : (
                getAnnonceurName()
              )}
            </p>
            <div className="w-full h-px bg-white/10" />
          </>
        )}
      </div>

      {/* CTA Button - Fiche Annonceur */}
      <div className={`px-4 mb-4 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <Link 
          href="/admin/parametres?tab=annonceur"
          className={`flex items-center justify-center gap-2 bg-[#FF7900] hover:bg-[#E66D00] text-white rounded-lg transition-all shadow-md group ${
            isCollapsed ? 'w-12 h-12 rounded-full' : 'w-full py-2 px-4'
          }`}
          style={{ fontWeight: 600, fontSize: '13px' }}
          title={isCollapsed ? t('announcer_profile') : ""}
        >
          <User className={`${isCollapsed ? 'w-6 h-6' : 'w-4 h-4'} group-hover:scale-110 transition-transform`} strokeWidth={2.5} />
          {!isCollapsed && <span>{t('announcer_profile')}</span>}
        </Link>
      </div>

      {/* User Info */}
      <div className={`px-4 mb-4 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <div className={`flex items-center gap-2.5 rounded-lg bg-white/5 ${isCollapsed ? 'p-1' : 'p-2'}`}>
          {/* Avatar / Initials */}
          <div className="w-10 h-10 rounded-full bg-primary border border-white/20 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
            {profile?.photo_url ? (
               <img 
                 src={profile.photo_url} 
                 alt="Profile" 
                 className="w-full h-full object-cover"
               />
            ) : (
              <span className="text-white" style={{ fontSize: '12px', fontWeight: 600 }}>
                {loading ? '...' : getInitials()}
              </span>
            )}
          </div>
          
          {/* Name & Role */}
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-white mb-0.5 truncate" style={{ fontSize: '13px', fontWeight: 500 }}>
                {loading ? (
                  <span className="animate-pulse bg-white/20 h-3 w-20 block rounded"></span>
                ) : (
                  profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email : (currentLocale === 'fr' ? 'Utilisateur' : 'User')
                )}
              </p>
              <p className="text-white/50 truncate" style={{ fontSize: '11px', fontWeight: 400 }}>
                {loading ? (
                  <span className="animate-pulse bg-white/10 h-2.5 w-12 block rounded mt-0.5"></span>
                ) : (
                  profile?.role || (currentLocale === 'fr' ? 'Utilisateur' : 'User')
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar scroll-smooth pb-4">
        <Link 
          href={routeMap['dashboard']}
          className={`w-full flex items-center rounded-lg transition-all ${
            isCollapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2.5'
          } ${
            activePage === 'dashboard' 
              ? 'bg-primary/25 text-white border-l-3 border-primary' 
              : 'text-white/70 hover:bg-white/8 hover:text-white/90'
          }`}
          style={{ fontSize: '14px', fontWeight: activePage === 'dashboard' ? 600 : 500 }}
          title={isCollapsed ? t('dashboard') : ""}
        >
          <LayoutDashboard className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} strokeWidth={2} />
          {!isCollapsed && <span>{t('dashboard')}</span>}
        </Link>

        {/* Annonces with Submenu */}
        <div>
          <button 
            className={`w-full flex items-center rounded-lg transition-all ${
              isCollapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2.5'
            } ${
              activePage === 'opportunites'
                ? 'bg-white text-primary'
                : 'text-white hover:bg-white/8'
            }`}
            onClick={() => !isCollapsed && setOpportunitesExpanded(!opportunitesExpanded)}
            style={{ fontSize: '14px', fontWeight: 500 }}
            title={isCollapsed ? t('missions') : ""}
          >
            <ClipboardList className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} strokeWidth={2} />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left">{t('missions')}</span>
                <ChevronDown 
                  className={`w-4 h-4 transition-transform ${opportunitesExpanded ? 'rotate-180' : ''}`} 
                  strokeWidth={2}
                />
              </>
            )}
          </button>

          {/* Submenu */}
          {opportunitesExpanded && !isCollapsed && (
            <div className="mt-1 space-y-0.5 ml-8">
              <Link
                href={routeMap['opportunites']}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  activeSubPage === 'toutes' || (!activeSubPage && activePage === 'opportunites')
                    ? 'text-white font-semibold' 
                    : 'text-white/60 hover:text-white/90'
                }`}
                style={{ fontSize: '13px' }}
              >
                <FileText className="w-4 h-4" strokeWidth={2} />
                <span>{tCommon('all')}</span>
              </Link>

              <Link
                href={routeMap['creer-opportunite']}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  activeSubPage === 'creer-nouvelle'
                    ? 'text-white font-semibold' 
                    : 'text-white/60 hover:text-white/90'
                }`}
                style={{ fontSize: '13px' }}
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                <span>{t('create_new')}</span>
              </Link>

              <Link
                href={routeMap['opportunites-brouillons']}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  activeSubPage === 'brouillons'
                    ? 'text-white font-semibold' 
                    : 'text-white/60 hover:text-white/90'
                }`}
                style={{ fontSize: '13px' }}
              >
                <FilePlus className="w-4 h-4" strokeWidth={2} />
                <span className="flex-1 text-left">{currentLocale === 'en' ? 'Drafts' : 'Brouillons'}</span>
              </Link>
            </div>
          )}
        </div>

        {/* Actualités with Submenu */}
        <div>
          <button 
            onClick={() => !isCollapsed && setActualitesExpanded(!actualitesExpanded)}
            className={`w-full flex items-center rounded-lg transition-all ${
              isCollapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2.5'
            } ${
              activePage === 'actualites' 
                ? 'bg-primary/25 text-white border-l-3 border-primary' 
                : 'text-white/70 hover:bg-white/8 hover:text-white/90'
            }`}
            style={{ fontSize: '14px', fontWeight: activePage === 'actualites' ? 600 : 500 }}
            title={isCollapsed ? t('news') : ""}
          >
            <Newspaper className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} strokeWidth={2} />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left">{t('news')}</span>
                <ChevronDown 
                  className={`w-4 h-4 transition-transform ${actualitesExpanded ? 'rotate-180' : ''}`} 
                  strokeWidth={2} 
                />
              </>
            )}
          </button>

          {/* Submenu */}
          {actualitesExpanded && !isCollapsed && (
            <div className="mt-1 space-y-0.5 ml-8">
              <Link
                href={routeMap['actualites']}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  activeSubPage === 'toutes' || (!activeSubPage && activePage === 'actualites')
                    ? 'text-white font-semibold' 
                    : 'text-white/60 hover:text-white/90'
                }`}
                style={{ fontSize: '13px' }}
              >
                <FileText className="w-4 h-4" strokeWidth={2} />
                <span>{tCommon('all')}</span>
              </Link>

              <Link
                href={routeMap['creer-actualite']}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  activeSubPage === 'creer-nouvelle'
                    ? 'text-white font-semibold' 
                    : 'text-white/60 hover:text-white/90'
                }`}
                style={{ fontSize: '13px' }}
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                <span>{t('create_new')}</span>
              </Link>

              <Link
                href={routeMap['actualites-brouillons']}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  activeSubPage === 'brouillons'
                    ? 'text-white font-semibold' 
                    : 'text-white/60 hover:text-white/90'
                }`}
                style={{ fontSize: '13px' }}
              >
                <FilePlus className="w-4 h-4" strokeWidth={2} />
                <span className="flex-1 text-left">{currentLocale === 'en' ? 'Drafts' : 'Brouillons'}</span>
              </Link>
            </div>
          )}
        </div>

        {profile?.role !== 'Annonceur' && (
          <>
            <Link 
              href={routeMap['candidatures']}
              className={`w-full flex items-center rounded-lg transition-all ${
                isCollapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2.5'
              } ${
                activePage === 'candidatures' 
                  ? 'bg-primary/25 text-white border-l-3 border-primary' 
                  : 'text-white/70 hover:bg-white/8 hover:text-white/90'
              }`}
              style={{ fontSize: '14px', fontWeight: activePage === 'candidatures' ? 600 : 500 }}
              title={isCollapsed ? t('applications') : ""}
            >
              <Inbox className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} strokeWidth={2} />
              {!isCollapsed && <span>{t('applications')}</span>}
            </Link>

            <Link 
              href={routeMap['profiles soumis']}
              className={`w-full flex items-center rounded-lg transition-all ${
                isCollapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2.5'
              } ${
                activePage === 'profiles soumis' 
                  ? 'bg-primary/25 text-white border-l-3 border-primary' 
                  : 'text-white/70 hover:bg-white/8 hover:text-white/90'
              }`}
              style={{ fontSize: '14px', fontWeight: activePage === 'profiles soumis' ? 600 : 500 }}
              title={isCollapsed ? t('submitted_profiles') : ""}
            >
              <User className={`${isCollapsed ? 'w-6 h-6' : 'w-4 h-4'}`} strokeWidth={2} />
              {!isCollapsed && <span>{t('submitted_profiles')}</span>}
            </Link>

            <Link 
              href={routeMap['projets soumis']}
              className={`w-full flex items-center rounded-lg transition-all ${
                isCollapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2.5'
              } ${
                activePage === 'projets soumis' 
                  ? 'bg-primary/25 text-white border-l-3 border-primary' 
                  : 'text-white/70 hover:bg-white/8 hover:text-white/90'
              }`}
              style={{ fontSize: '14px', fontWeight: activePage === 'projets soumis' ? 600 : 500 }}
              title={isCollapsed ? t('submitted_projects') : ""}
            >
              <Plus className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} strokeWidth={2} />
              {!isCollapsed && <span>{t('submitted_projects')}</span>}
            </Link>
          </>
        )}

        <Link 
          href={routeMap['parametres']}
          className={`w-full flex items-center rounded-lg transition-all ${
            isCollapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2.5'
          } ${
            activePage === 'parametres' 
              ? 'bg-primary/25 text-white border-l-3 border-primary' 
              : 'text-white/70 hover:bg-white/8 hover:text-white/90'
          }`}
          style={{ fontSize: '14px', fontWeight: activePage === 'parametres' ? 600 : 500 }}
          title={isCollapsed ? t('settings') : ""}
        >
          <Settings className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} strokeWidth={2} />
          {!isCollapsed && <span>{t('settings')}</span>}
        </Link>
      </nav>

      {/* Bottom Actions */}
      <div className="px-4 py-3 mt-auto">
        <div className="w-full h-px bg-white/10 mb-2" />
        
        <Link 
          href={routeMap['aide']}
          className={`w-full flex items-center rounded-lg transition-all ${
            isCollapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2'
          } ${
            activePage === 'aide' 
              ? 'bg-white/10 text-white border-l-4 border-primary' 
              : 'text-white/60 hover:bg-white/8 hover:text-white'
          }`}
          title={isCollapsed ? t('help') : ""}
        >
          <HelpCircle className={`${isCollapsed ? 'w-6 h-6' : 'w-4 h-4'}`} strokeWidth={2} />
          {!isCollapsed && <span style={{ fontSize: '13px', fontWeight: 500 }}>{t('help')}</span>}
        </Link>

        <button 
          onClick={handleLogout}
          className={`w-full flex items-center rounded-lg text-white/60 hover:bg-white/8 hover:text-white transition-all mt-1 ${
            isCollapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2'
          }`}
          title={isCollapsed ? tCommon('logout') : ""}
        >
          <LogOut className={`${isCollapsed ? 'w-6 h-6' : 'w-4 h-4'}`} strokeWidth={2} />
          {!isCollapsed && <span style={{ fontSize: '13px', fontWeight: 500 }}>{tCommon('logout')}</span>}
        </button>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </aside>
  );
}
