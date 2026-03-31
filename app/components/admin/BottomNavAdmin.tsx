'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Newspaper,
  Inbox, 
  Settings,
  ChevronUp,
  Plus,
  FileText,
  FilePlus,
  X
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';

interface BottomNavAdminProps {
  activePage: string;
}

export function BottomNavAdmin({ activePage }: BottomNavAdminProps) {
  const pathname = usePathname();
  const { profile } = useAuth();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    { id: 'opportunites', label: 'Missions', icon: ClipboardList, hasSubmenu: true },
    { id: 'actualites', label: 'Actualités', icon: Newspaper, hasSubmenu: true },
    { id: 'candidatures', label: 'Candidats', icon: Inbox, href: '/admin/candidatures', hideForAnnonceur: true },
    { id: 'parametres', label: 'Réglages', icon: Settings, href: '/admin/parametres' },
  ];

  const submenus: Record<string, any[]> = {
    'opportunites': [
      { label: 'Toutes les missions', href: '/admin/opportunites', icon: FileText },
      { label: 'Créer une mission', href: '/admin/opportunites/creer', icon: Plus },
      { label: 'Brouillons', href: '/admin/opportunites?view=brouillons', icon: FilePlus },
    ],
    'actualites': [
      { label: 'Toutes les actus', href: '/admin/actualites', icon: FileText },
      { label: 'Publier une actu', href: '/admin/actualites/creer', icon: Plus },
      { label: 'Brouillons', href: '/admin/actualites?view=brouillons', icon: FilePlus },
    ]
  };

  const handleNavClick = (item: any) => {
    if (item.hasSubmenu) {
      setActiveMenu(activeMenu === item.id ? null : item.id);
    } else {
      setActiveMenu(null);
    }
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100]">
      {/* Submenu Overlay */}
      {activeMenu && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[-1]" onClick={() => setActiveMenu(null)} />
          <div 
            ref={menuRef}
            className="bg-white rounded-t-2xl shadow-2xl p-4 mb-0 animate-in slide-in-from-bottom duration-300 border-t border-neutral-100"
          >
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="font-bold text-[#003A54] uppercase tracking-wider text-xs">
                {activeMenu === 'opportunites' ? 'Gestion des Missions' : 'Gestion des Actualités'}
              </h3>
              <button onClick={() => setActiveMenu(null)} className="p-1 rounded-full bg-neutral-100 text-neutral-500" aria-label="Fermer le menu">
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {submenus[activeMenu]?.map((sub, idx) => (
                <Link
                  key={idx}
                  href={sub.href}
                  onClick={() => setActiveMenu(null)}
                  className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-neutral-50 active:bg-neutral-100 transition-colors border border-neutral-50"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <sub.icon size={20} strokeWidth={2.5} />
                  </div>
                  <span className="text-[#003A54] font-semibold text-[15px]">{sub.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Main Nav Bar */}
      <nav className="bg-white border-t border-neutral-200 h-20 flex items-center justify-around px-2 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        {navItems.map((item) => {
          if (item.hideForAnnonceur && profile?.role === 'Annonceur') return null;
          
          const isActive = activePage === item.id || activeMenu === item.id;
          const Icon = item.icon;

          return (
            <div key={item.id} className="flex flex-col items-center flex-1">
              {item.href ? (
                <Link
                  href={item.href}
                  onClick={() => setActiveMenu(null)}
                  className={`flex flex-col items-center gap-1 w-full py-2 transition-all ${
                    isActive ? 'text-primary' : 'text-neutral-400'
                  }`}
                >
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
                  {isActive && <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />}
                </Link>
              ) : (
                <button
                  onClick={() => handleNavClick(item)}
                  className={`flex flex-col items-center gap-1 w-full py-2 transition-all ${
                    isActive ? 'text-primary' : 'text-neutral-400'
                  }`}
                >
                  <div className="relative">
                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                    {item.hasSubmenu && (
                      <ChevronUp 
                        size={12} 
                        className={`absolute -right-3 top-1 transition-transform ${isActive ? 'rotate-180' : ''}`} 
                      />
                    )}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
                  {isActive && <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />}
                </button>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
