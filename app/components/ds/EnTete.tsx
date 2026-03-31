'use client';
import React, { useState } from 'react';
import { Menu, X, User, LayoutDashboard, LogOut, ChevronDown, Globe } from 'lucide-react';
import { Bouton } from './Bouton';
import Image from 'next/image';
import { Link, useRouter, usePathname } from '@/i18n/routing';
import { useAuth } from '@/app/hooks/useAuth';
import { useParams } from 'next/navigation';

interface EnTeteProps {
  logo?: React.ReactNode;
  liens?: { label: string; href: string; actif?: boolean }[];
  userActions?: React.ReactNode;
}

export function EnTete({ logo, liens = [], userActions }: EnTeteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = params.locale as string || 'fr';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { profile, isAuthenticated, signOut } = useAuth();
  
  // Default logo
  const defaultLogo = (
    <Image 
      src="/logo_jesuis.png"
      alt="Je suis au Cameroun"
      width={211}
      height={55}
      className="h-10 w-auto"
    />
  );
  
  // Logo with click handler wrapper
  const logoElement = logo || defaultLogo;
  const clickableLogo = (
    <Link 
      href="/"
      className="cursor-pointer hover:opacity-80 transition-opacity"
      aria-label="Retour à l'accueil"
    >
      {logoElement}
    </Link>
  );

  const getInitials = () => {
    if (!profile) return '';
    const first = profile.first_name?.[0] || '';
    const last = profile.last_name?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };
  
  return (
    <header className="w-full h-20 bg-white border-b border-neutral-200 shadow-[0px_2px_4px_rgba(0,0,0,0.04)] sticky top-0 z-50">
      <div className="h-full px-5 md:px-10 lg:px-12 xl:px-20 flex items-center justify-between gap-3">
        {/* Logo */}
        <div className="flex-shrink-0">
          {clickableLogo}
        </div>
        
        {/* Desktop Navigation - Centered */}
        <nav className="hidden lg:flex items-center gap-2 xl:gap-3 flex-1 justify-center max-w-4xl">
          {liens.map((lien) => (
            <Link
              key={lien.label}
              href={lien.href}
              className={`px-3 xl:px-4 py-2.5 rounded-lg transition-all whitespace-nowrap ${ 
                lien.actif
                  ? 'bg-[#187A58]/10 text-[#187A58] font-semibold'
                  : 'text-[#003A54] hover:bg-[#187A58]/5 hover:text-[#187A58]'
              }`}
              style={{ fontSize: '14px', fontWeight: lien.actif ? 600 : 500 }}
            >
              {lien.label}
            </Link>
          ))}
        </nav>
        
        {/* Right Side: User Actions */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-3 flex-shrink-0">
          {/* Language Switcher Desktop */}
          <div className="flex items-center bg-neutral-100 rounded-lg p-1 mr-2 border border-neutral-200 shadow-inner">
            <button
              onClick={() => router.replace(pathname, { locale: 'fr' })}
              className={`px-2 py-1 rounded-md transition-all flex items-center justify-center ${
                currentLocale === 'fr' 
                ? 'bg-white shadow-sm scale-110 border border-neutral-200' 
                : 'opacity-50 hover:opacity-100'
              }`}
              title="Français"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" className="w-6 h-4 rounded-sm"><rect width="1" height="2" fill="#002395"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#ED2939"/></svg>
            </button>
            <button
              onClick={() => router.replace(pathname, { locale: 'en' })}
              className={`px-2 py-1 rounded-md transition-all flex items-center justify-center ${
                currentLocale === 'en' 
                ? 'bg-white shadow-sm scale-110 border border-neutral-200' 
                : 'opacity-50 hover:opacity-100'
              }`}
              title="English"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className="w-6 h-4 rounded-sm"><clipPath id="c1"><rect width="60" height="30"/></clipPath><g clipPath="url(#c1)"><rect width="60" height="30" fill="#012169"/><path d="M0 0l60 30M60 0L0 30" stroke="#fff" strokeWidth="6"/><path d="M0 0l60 30M60 0L0 30" stroke="#C8102E" strokeWidth="4" clipPath="url(#c1)"/><path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10"/><path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6"/></g></svg>
            </button>
          </div>

          {userActions || (
            isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-neutral-100 transition-all border border-neutral-200"
                >
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold overflow-hidden border border-white shadow-sm">
                    {profile?.photo_url ? (
                      <img src={profile.photo_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      getInitials()
                    )}
                  </div>
                  <div className="text-left hidden xl:block">
                    <p className="text-[#003A54] font-semibold leading-tight truncate max-w-[120px]" style={{ fontSize: '13px' }}>
                      {profile?.first_name} {profile?.last_name}
                    </p>
                    <p className="text-neutral-500 text-xs leading-tight">
                      {profile?.role}
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-100 z-20 py-2 animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-4 py-3 border-b border-neutral-100 mb-1">
                        <p className="text-[#003A54] font-bold truncate" style={{ fontSize: '14px' }}>
                          {profile?.first_name} {profile?.last_name}
                        </p>
                        <p className="text-neutral-500 truncate" style={{ fontSize: '12px' }}>
                          {profile?.email}
                        </p>
                      </div>
                      
                      <Link 
                        href={profile?.role?.toLowerCase() === 'superadmin' ? "/superadmin/dashboard" : "/admin/dashboard"} 
                        className="flex items-center gap-3 px-4 py-2.5 text-[#003A54] hover:bg-neutral-50 transition-colors" 
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="w-4.5 h-4.5 text-[#187A58]" />
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>{currentLocale === 'en' ? 'Dashboard' : 'Tableau de bord'}</span>
                      </Link>
                      
                      <Link href="/admin/parametres" className="flex items-center gap-3 px-4 py-2.5 text-[#003A54] hover:bg-neutral-50 transition-colors" onClick={() => setUserMenuOpen(false)}>
                        <User className="w-4.5 h-4.5 text-[#187A58]" />
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>{currentLocale === 'en' ? 'My account' : 'Mon compte'}</span>
                      </Link>
                      
                      <div className="h-px bg-neutral-100 my-1 mx-2"></div>
                      
                      <button 
                        onClick={() => {
                          setUserMenuOpen(false);
                          signOut();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4.5 h-4.5" />
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>{currentLocale === 'en' ? 'Logout' : 'Déconnexion'}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/login">
                <div
                  className="h-12 px-6 xl:px-8 rounded-lg text-white hover:bg-[#136145] transition-all shadow-md hover:shadow-lg whitespace-nowrap flex items-center justify-center"
                  style={{ fontSize: '15px', fontWeight: 600, backgroundColor: '#187A58' }}
                >
                  {currentLocale === 'en' ? 'Member Space' : 'Espace membre'}
                </div>
              </Link>
            )
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          aria-label="Menu"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" strokeWidth={2} />
          ) : (
            <Menu className="w-6 h-6" strokeWidth={2} />
          )}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-neutral-200 shadow-lg max-h-[calc(100vh-80px)] overflow-y-auto">
          <nav className="flex flex-col p-5 gap-2">
            {/* Language Switcher Mobile */}
            <div className="flex items-center justify-center bg-neutral-50 rounded-xl p-2 mb-4 border border-neutral-100">
              <span className="text-[11px] font-bold text-neutral-400 mr-3 uppercase tracking-wider">Langue :</span>
              <div className="flex bg-neutral-200/50 p-1 rounded-lg">
                <button
                  onClick={() => {
                    router.replace(pathname, { locale: 'fr' });
                    setMobileMenuOpen(false);
                  }}
                  className={`flex-1 py-3 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    currentLocale === 'fr' 
                    ? 'bg-white text-primary shadow-sm border border-neutral-200' 
                    : 'text-neutral-500'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" className="w-5 h-3.5 rounded-sm"><rect width="1" height="2" fill="#002395"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#ED2939"/></svg> Français
                </button>
                <button
                  onClick={() => {
                    router.replace(pathname, { locale: 'en' });
                    setMobileMenuOpen(false);
                  }}
                  className={`flex-1 py-3 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    currentLocale === 'en' 
                    ? 'bg-white text-primary shadow-sm border border-neutral-200' 
                    : 'text-neutral-500'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className="w-5 h-3.5 rounded-sm"><clipPath id="c2"><rect width="60" height="30"/></clipPath><g clipPath="url(#c2)"><rect width="60" height="30" fill="#012169"/><path d="M0 0l60 30M60 0L0 30" stroke="#fff" strokeWidth="6"/><path d="M0 0l60 30M60 0L0 30" stroke="#C8102E" strokeWidth="4" clipPath="url(#c2)"/><path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10"/><path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6"/></g></svg> English
                </button>
              </div>
            </div>

            {isAuthenticated && (
              <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl mb-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg overflow-hidden border-2 border-white shadow-sm">
                  {profile?.photo_url ? (
                    <img src={profile.photo_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    getInitials()
                  )}
                </div>
                <div>
                  <p className="text-[#003A54] font-bold" style={{ fontSize: '15px' }}>
                    {profile?.first_name} {profile?.last_name}
                  </p>
                  <p className="text-neutral-500 text-sm">
                    {profile?.role}
                  </p>
                </div>
              </div>
            )}

            {liens.map((lien) => (
              <Link
                key={lien.href}
                href={lien.href}
                className={`px-4 py-3 rounded-md transition-colors ${
                  lien.actif
                    ? 'bg-[#187A58]/10 text-[#187A58] font-bold'
                    : 'text-neutral-700 hover:bg-[#187A58]/5'
                }`}
                style={{ fontSize: '15px', fontWeight: 500 }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {lien.label}
              </Link>
            ))}
            
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-neutral-100">
              {isAuthenticated ? (
                <>
                  <Link 
                    href={profile?.role?.toLowerCase() === 'superadmin' ? "/superadmin/dashboard" : "/admin/dashboard"} 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3 px-4 py-3 text-[#003A54] font-semibold">
                      <LayoutDashboard className="w-5 h-5 text-[#187A58]" />
                      {currentLocale === 'en' ? 'Dashboard' : 'Tableau de bord'}
                    </div>
                  </Link>
                  <button 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut();
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-red-600 font-semibold"
                  >
                    <LogOut className="w-5 h-5" />
                    {currentLocale === 'en' ? 'Logout' : 'Déconnexion'}
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Bouton variant="primaire" size="moyen" fullWidth>
                    {currentLocale === 'en' ? 'Login' : 'Se connecter'}
                  </Bouton>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}