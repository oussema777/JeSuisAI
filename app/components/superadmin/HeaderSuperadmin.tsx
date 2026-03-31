'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, User, LayoutDashboard, LogOut, ShieldCheck, Bell, Check, Trash2, Languages } from 'lucide-react';
import { Link, useRouter, usePathname } from '@/i18n/routing';
import { useAuth } from '@/app/hooks/useAuth';
import { useNotifications } from '@/app/hooks/useNotifications';
import { Notification } from '@/app/types/notifications';
import { QuickSearchSuperadmin } from './QuickSearchSuperadmin';
import { useParams } from 'next/navigation';

interface HeaderSuperadminProps {
  pageTitle: string;
}

export function HeaderSuperadmin({ pageTitle }: HeaderSuperadminProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = params.locale as string || 'fr';
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { profile, signOut } = useAuth();

  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getInitials = () => {
    if (!profile) return '';
    const first = profile.first_name?.[0] || '';
    const last = profile.last_name?.[0] || '';
    return (first + last).toUpperCase() || 'SA';
  };

  // Format relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'candidature_received':
        return '📨';
      case 'profile_submitted':
        return '👤';
      case 'project_submitted':
        return '💡';
      case 'pre_inscription_received':
        return '🏢';
      case 'contact_message_received':
        return '✉️';
      default:
        return '📬';
    }
  };

  const getNotificationAction = (notification: Notification) => {
    switch (notification.type) {
      case 'candidature_received':
        return `/superadmin/dashboard`; // Or specific page if exists
      case 'profile_submitted':
        return '/admin/profilesoumis';
      case 'project_submitted':
        return '/admin/projetsoumis';
      case 'pre_inscription_received':
        return '/superadmin/inscriptions';
      default:
        return null;
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    const actionUrl = getNotificationAction(notification);
    if (actionUrl) {
      router.push(actionUrl);
      setShowNotifications(false);
    }
  };

  return (
    <header className="h-16 lg:h-[72px] bg-white border-b border-neutral-200 shadow-sm fixed top-0 left-0 lg:left-[260px] right-0 z-40">
      <div className="h-full px-4 lg:px-10 flex items-center justify-between">
        {/* Left side */}
        <div>
          <h2 className="text-neutral-900" style={{ fontSize: '20px', fontWeight: 600 }}>
            {pageTitle}
          </h2>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 lg:gap-4">
          {/* Language Switcher */}
          <div className="flex items-center bg-neutral-100 rounded-lg p-1 mr-2 shadow-inner">
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
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className="w-6 h-4 rounded-sm"><clipPath id="b1"><rect width="60" height="30"/></clipPath><g clipPath="url(#b1)"><rect width="60" height="30" fill="#012169"/><path d="M0 0l60 30M60 0L0 30" stroke="#fff" strokeWidth="6"/><path d="M0 0l60 30M60 0L0 30" stroke="#C8102E" strokeWidth="4" clipPath="url(#b1)"/><path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10"/><path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6"/></g></svg>
            </button>
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-10 h-10 rounded-lg border border-neutral-200 hover:bg-neutral-50 flex items-center justify-center transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-neutral-600" strokeWidth={2} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-accent rounded-full flex items-center justify-center px-1.5">
                  <span className="text-white text-xs font-semibold">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
                  <h3 className="text-neutral-900 font-semibold" style={{ fontSize: '16px' }}>
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      Tout marquer lu
                    </button>
                  )}
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                  {loading ? (
                    <div className="px-4 py-8 text-center text-neutral-500">Chargement...</div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Bell className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
                      <p className="text-neutral-500 text-sm">Aucune notification</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-colors ${
                          !notification.read ? 'bg-primary/5' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 text-2xl">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className={`text-neutral-900 ${!notification.read ? 'font-semibold' : 'font-medium'}`} style={{ fontSize: '14px' }}>
                                {notification.title}
                              </h4>
                              {!notification.read && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />}
                            </div>
                            <p className="text-neutral-600 mb-2" style={{ fontSize: '13px', lineHeight: '1.4' }}>
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-neutral-400 text-xs">{getRelativeTime(notification.created_at)}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="text-neutral-400 hover:text-accent transition-colors p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Search */}
          <button 
            onClick={() => setShowSearch(true)}
            className="hidden sm:flex w-10 h-10 rounded-lg border border-neutral-200 hover:bg-neutral-50 items-center justify-center transition-colors" 
            aria-label="Rechercher"
          >
            <Search className="w-5 h-5 text-neutral-600" strokeWidth={2} />
          </button>

          {/* Search Modal */}
          <QuickSearchSuperadmin open={showSearch} onOpenChange={setShowSearch} />

          {/* User dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-1.5 py-1.5 lg:px-3 lg:py-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0 overflow-hidden">
                {profile?.photo_url ? (
                  <img src={profile.photo_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
                    {getInitials()}
                  </span>
                )}
              </div>
              <div className="text-left hidden xl:block">
                <p className="text-neutral-900 font-semibold leading-tight truncate max-w-[100px]" style={{ fontSize: '12px' }}>
                  {profile?.first_name}
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 text-neutral-600 hidden sm:block transition-transform ${showUserMenu ? 'rotate-180' : ''}`} strokeWidth={2} />
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-neutral-200 z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-3 border-b border-neutral-100 mb-1">
                  <p className="text-neutral-900 font-bold truncate" style={{ fontSize: '14px' }}>
                    {profile?.first_name} {profile?.last_name}
                  </p>
                  <p className="text-neutral-500 truncate" style={{ fontSize: '12px' }}>
                    {profile?.role}
                  </p>
                </div>
                
                <Link href="/" className="flex items-center gap-3 px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 transition-colors" onClick={() => setShowUserMenu(false)}>
                  <LayoutDashboard className="w-4.5 h-4.5 text-primary" />
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>Voir le site public</span>
                </Link>
                
                <div className="h-px bg-neutral-100 my-1 mx-2"></div>
                
                <button 
                  onClick={() => {
                    setShowUserMenu(false);
                    signOut();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut className="w-4.5 h-4.5" />
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
