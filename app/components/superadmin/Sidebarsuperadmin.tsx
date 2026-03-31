'use client';
import React, { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  Users,
  Settings,
  HelpCircle,
  LogOut,
  ShieldCheck,
  FileText,
  ChevronDown,
  Info,
  Scale,
  UserPlus,
  Mail,
  ClipboardList,
  Inbox,
  Newspaper,
  Building2,
  MessageSquare
} from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import Image from 'next/image';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useAuth } from '@/app/hooks/useAuth';

interface SidebarSuperadminProps {
  activePage: 'dashboard' | 'gestion-utilisateurs' | 'annonceurs' | 'contenus-statiques' | 'inscriptions' | 'missions' | 'candidatures' | 'actualites' | 'newsletter' | 'messages' | 'aide';
  activeSubPage?: 'header-footer' | 'landing' | 'premiere-visite' | 'organisations' | 'faq' | 'mentions-legales' | 'cgu' | 'a-propos' | 'bulk' | 'comment-ca-marche';
}

const routeMap: { [key: string]: string } = {
  'accueil': '/',
  'dashboard': '/superadmin/dashboard',
  'gestion-utilisateurs': '/superadmin/utilisateurs',
  'annonceurs': '/superadmin/annonceurs',
  'inscriptions': '/superadmin/inscriptions',
  'missions': '/superadmin/missions',
  'candidatures': '/superadmin/candidatures',
  'actualites': '/superadmin/actualites',
  'newsletter': '/superadmin/newsletter',
  'messages': '/superadmin/messages',
  'header-footer': '/superadmin/contenus/header-footer',
  'landing': '/superadmin/contenus/landing',
  'premiere-visite': '/superadmin/contenus/premiere-visite',
  'comment-ca-marche': '/superadmin/contenus/comment-ca-marche',
  'organisations': '/superadmin/contenus/organisations',
  'faq': '/superadmin/contenus/faq',
  'mentions-legales': '/superadmin/contenus/mentions-legales',
  'cgu': '/superadmin/contenus/cgu',
  'a-propos': '/superadmin/contenus/a-propos',
  'bulk-content': '/superadmin/contenus/bulk',
  'aide': '/superadmin/aide',
  'admin-login': '/login',
};

export function SidebarSuperadmin({ activePage, activeSubPage }: SidebarSuperadminProps) {
  const router = useRouter();
  const { profile, loading: authLoading, signOut, supabase } = useAuth();
  const [contenusExpanded, setContenusExpanded] = useState(activePage === 'contenus-statiques');

  useEffect(() => {
    if (activePage === 'contenus-statiques') setContenusExpanded(true);
  }, [activePage]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      window.location.href = '/login';
    }
  };

  const userData = profile;
  const loading = authLoading;

  const getInitials = () => {
    if (!userData) return '';
    const first = userData.first_name?.[0] || '';
    const last = userData.last_name?.[0] || '';
    return (first + last).toUpperCase() || 'SA';
  };

  const displayName = userData 
    ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.email 
    : 'Chargement...';

  return (
    <aside className="w-[260px] h-screen bg-bg-base fixed left-0 top-0 z-100 shadow-lg flex flex-col">
      {/* Logo */}
      <div className="px-5 py-6">
        <Link 
          href={routeMap['accueil']}
          className="w-full mb-3 hover:opacity-80 transition-opacity cursor-pointer"
          aria-label="Retour à l'accueil"
        >
          <Image 
            src="https://ilab.tn/wp-content/uploads/2026/02/jesuisaucameroun-logo-b.png" 
            alt="Je suis au Cameroun"
            width={160}
            height={40}
            className="w-[160px] h-auto mx-auto"
          />
        </Link>
        <div className="flex items-center justify-center gap-2 mb-6">
          <ShieldCheck className="w-5 h-5 text-accent" strokeWidth={2} />
          <p className="text-white text-center" style={{ fontSize: '14px', fontWeight: 600 }}>
            Super Administrateur
          </p>
        </div>
        <div className="w-full h-px bg-white/20 mb-6" />
      </div>

      {/* User Info */}
      <div className="px-5 mb-8">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
          <div className="w-12 h-12 rounded-full bg-accent border-2 border-white flex items-center justify-center flex-shrink-0 overflow-hidden relative">
            {userData?.photo_url ? (
               <img 
                 src={userData.photo_url} 
                 alt="Profile" 
                 className="w-full h-full object-cover"
               />
            ) : (
              <span className="text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
                {loading ? '...' : getInitials()}
              </span>
            )}
          </div>
          
          <div className="overflow-hidden">
            <p className="text-white mb-1 truncate" style={{ fontSize: '15px', fontWeight: 500 }}>
              {loading ? (
                <span className="animate-pulse bg-white/20 h-4 w-24 block rounded"></span>
              ) : (
                displayName
              )}
            </p>
            <p className="text-white/70 truncate" style={{ fontSize: '13px', fontWeight: 400 }}>
              {loading ? (
                <span className="animate-pulse bg-white/10 h-3 w-16 block rounded mt-1"></span>
              ) : (
                userData?.role || 'Superadmin'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-hide scroll-smooth">
        <Link 
          href={routeMap['dashboard']}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
            activePage === 'dashboard' 
              ? 'bg-white/10 text-white border-l-4 border-primary' 
              : 'text-white/70 hover:bg-white/5 hover:text-white/90'
          }`}
          style={{ fontSize: '15px', fontWeight: activePage === 'dashboard' ? 600 : 500 }}
        >
          <LayoutDashboard className="w-5 h-5" strokeWidth={2} />
          <span>Tableau de bord</span>
        </Link>

        <Link 
          href={routeMap['gestion-utilisateurs']}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
            activePage === 'gestion-utilisateurs' 
              ? 'bg-white/10 text-white border-l-4 border-primary' 
              : 'text-white/70 hover:bg-white/5 hover:text-white/90'
          }`}
          style={{ fontSize: '15px', fontWeight: activePage === 'gestion-utilisateurs' ? 600 : 500 }}
        >
          <Users className="w-5 h-5" strokeWidth={2} />
          <span>Gestion Utilisateurs</span>
        </Link>

        <Link
          href={routeMap['annonceurs']}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
            activePage === 'annonceurs'
              ? 'bg-white/10 text-white border-l-4 border-primary'
              : 'text-white/70 hover:bg-white/5 hover:text-white/90'
          }`}
          style={{ fontSize: '15px', fontWeight: activePage === 'annonceurs' ? 600 : 500 }}
        >
          <Building2 className="w-5 h-5" strokeWidth={2} />
          <span>Annonceurs</span>
        </Link>

        <Link
          href={routeMap['inscriptions']}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
            activePage === 'inscriptions' 
              ? 'bg-white/10 text-white border-l-4 border-primary' 
              : 'text-white/70 hover:bg-white/5 hover:text-white/90'
          }`}
          style={{ fontSize: '15px', fontWeight: activePage === 'inscriptions' ? 600 : 500 }}
        >
          <UserPlus className="w-5 h-5" strokeWidth={2} />
          <span>Gestion Inscriptions</span>
        </Link>

        <Link
          href={routeMap['missions']}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
            activePage === 'missions'
              ? 'bg-white/10 text-white border-l-4 border-primary'
              : 'text-white/70 hover:bg-white/5 hover:text-white/90'
          }`}
          style={{ fontSize: '15px', fontWeight: activePage === 'missions' ? 600 : 500 }}
        >
          <ClipboardList className="w-5 h-5" strokeWidth={2} />
          <span>Missions</span>
        </Link>

        <Link
          href={routeMap['candidatures']}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
            activePage === 'candidatures'
              ? 'bg-white/10 text-white border-l-4 border-primary'
              : 'text-white/70 hover:bg-white/5 hover:text-white/90'
          }`}
          style={{ fontSize: '15px', fontWeight: activePage === 'candidatures' ? 600 : 500 }}
        >
          <Inbox className="w-5 h-5" strokeWidth={2} />
          <span>Candidatures</span>
        </Link>

        <Link
          href={routeMap['actualites']}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
            activePage === 'actualites'
              ? 'bg-white/10 text-white border-l-4 border-primary'
              : 'text-white/70 hover:bg-white/5 hover:text-white/90'
          }`}
          style={{ fontSize: '15px', fontWeight: activePage === 'actualites' ? 600 : 500 }}
        >
          <Newspaper className="w-5 h-5" strokeWidth={2} />
          <span>Actualités</span>
        </Link>

        <Link
          href={routeMap['newsletter']}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
            activePage === 'newsletter'
              ? 'bg-white/10 text-white border-l-4 border-primary'
              : 'text-white/70 hover:bg-white/5 hover:text-white/90'
          }`}
          style={{ fontSize: '15px', fontWeight: activePage === 'newsletter' ? 600 : 500 }}
        >
          <Mail className="w-5 h-5" strokeWidth={2} />
          <span>Newsletter</span>
        </Link>

        <Link
          href={routeMap['messages']}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
            activePage === 'messages'
              ? 'bg-white/10 text-white border-l-4 border-primary'
              : 'text-white/70 hover:bg-white/5 hover:text-white/90'
          }`}
          style={{ fontSize: '15px', fontWeight: activePage === 'messages' ? 600 : 500 }}
        >
          <MessageSquare className="w-5 h-5" strokeWidth={2} />
          <span>Messages</span>
        </Link>

        {/* Contenus Statiques with Submenu */}
        <div>
          <button 
            onClick={() => setContenusExpanded(!contenusExpanded)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
              activePage === 'contenus-statiques' 
                ? 'bg-white/10 text-white border-l-4 border-primary' 
                : 'text-white/70 hover:bg-white/5 hover:text-white/90'
            }`}
            style={{ fontSize: '15px', fontWeight: activePage === 'contenus-statiques' ? 600 : 500 }}
          >
            <FileText className="w-5 h-5" strokeWidth={2} />
            <span className="flex-1 text-left">Contenus Statiques</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${contenusExpanded ? 'rotate-180' : ''}`} />
          </button>

          {/* Submenu */}
          {contenusExpanded && (
            <div className="mt-1 space-y-1 ml-9 border-l border-white/10 pl-2">
              <Link
                href={routeMap['header-footer']}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  activeSubPage === 'header-footer'
                    ? 'text-white font-semibold bg-white/5'
                    : 'text-white/60 hover:text-white/90 hover:bg-white/5'
                }`}
                style={{ fontSize: '14px' }}
              >
                <span>En-tête & Pied de page</span>
              </Link>

              <Link
                href={routeMap['landing']}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  activeSubPage === 'landing'
                    ? 'text-white font-semibold bg-white/5' 
                    : 'text-white/60 hover:text-white/90 hover:bg-white/5'
                }`}
                style={{ fontSize: '14px' }}
              >
                <span>Landing Page</span>
              </Link>

              <Link
                href={routeMap['premiere-visite']}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  activeSubPage === 'premiere-visite'
                    ? 'text-white font-semibold bg-white/5' 
                    : 'text-white/60 hover:text-white/90 hover:bg-white/5'
                }`}
                style={{ fontSize: '14px' }}
              >
                <span>Première Visite</span>
              </Link>

              <Link
                href={routeMap['comment-ca-marche']}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  activeSubPage === 'comment-ca-marche'
                    ? 'text-white font-semibold bg-white/5' 
                    : 'text-white/60 hover:text-white/90 hover:bg-white/5'
                }`}
                style={{ fontSize: '14px' }}
              >
                <span>Comment ça marche</span>
              </Link>

              <Link
                href={routeMap['organisations']}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  activeSubPage === 'organisations'
                    ? 'text-white font-semibold bg-white/5' 
                    : 'text-white/60 hover:text-white/90 hover:bg-white/5'
                }`}
                style={{ fontSize: '14px' }}
              >
                <span>Organisations Membres</span>
              </Link>

              <Link
                href={routeMap['faq']}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  activeSubPage === 'faq'
                    ? 'text-white font-semibold bg-white/5' 
                    : 'text-white/60 hover:text-white/90 hover:bg-white/5'
                }`}
                style={{ fontSize: '14px' }}
              >
                <span>FAQ</span>
              </Link>

              <Link
                href={routeMap['a-propos']}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  activeSubPage === 'a-propos'
                    ? 'text-white font-semibold bg-white/5' 
                    : 'text-white/60 hover:text-white/90 hover:bg-white/5'
                }`}
                style={{ fontSize: '14px' }}
              >
                <span>À propos</span>
              </Link>

              <Link
                href={routeMap['mentions-legales']}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  activeSubPage === 'mentions-legales'
                    ? 'text-white font-semibold bg-white/5' 
                    : 'text-white/60 hover:text-white/90 hover:bg-white/5'
                }`}
                style={{ fontSize: '14px' }}
              >
                <span>Mentions Légales</span>
              </Link>

              <Link
                href={routeMap['cgu']}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  activeSubPage === 'cgu'
                    ? 'text-white font-semibold bg-white/5' 
                    : 'text-white/60 hover:text-white/90 hover:bg-white/5'
                }`}
                style={{ fontSize: '14px' }}
              >
                <span>CGU</span>
              </Link>

              <div className="w-full h-px bg-white/10 my-2" />

              <Link
                href={routeMap['bulk-content']}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  activeSubPage === 'bulk'
                    ? 'text-accent-yellow font-semibold bg-white/5' 
                    : 'text-accent-yellow/80 hover:text-accent-yellow hover:bg-white/5'
                }`}
                style={{ fontSize: '14px' }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-accent-yellow" />
                <span>Correction en masse</span>
              </Link>
            </div>
          )}
        </div>

        
      </nav>

      {/* Bottom Actions */}
      <div className="px-5 py-5">
        <div className="w-full h-px bg-white/20 mb-4" />
        
        <Link 
          href={routeMap['aide']}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
            activePage === 'aide' 
              ? 'bg-white/10 text-white border-l-4 border-primary' 
              : 'text-white/70 hover:bg-white/5 hover:text-white'
          }`}
        >
          <HelpCircle className="w-5 h-5" strokeWidth={2} />
          <span style={{ fontSize: '14px', fontWeight: 500 }}>Aide</span>
        </Link>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/8 hover:text-white transition-all mt-2 text-left"
        >
          <LogOut className="w-5 h-5" strokeWidth={2} />
          <span style={{ fontSize: '14px', fontWeight: 500 }}>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}