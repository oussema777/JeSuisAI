'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users,
  FileText,
  Settings,
  ChevronUp,
  HelpCircle,
  X,
  UserPlus
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { usePathname } from 'next/navigation';

interface BottomNavSuperadminProps {
  activePage: string;
}

export function BottomNavSuperadmin({ activePage }: BottomNavSuperadminProps) {
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
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/superadmin/dashboard' },
    { id: 'gestion-utilisateurs', label: 'Utilisateurs', icon: Users, href: '/superadmin/utilisateurs' },
    { id: 'inscriptions', label: 'Inscriptions', icon: UserPlus, href: '/superadmin/inscriptions' },
    { id: 'contenus-statiques', label: 'Contenus', icon: FileText, hasSubmenu: true },
  ];

  const submenus: Record<string, any[]> = {
    'contenus-statiques': [
      { label: 'Landing Page', href: '/superadmin/contenus/landing' },
      { label: 'FAQ', href: '/superadmin/contenus/faq' },
      { label: 'À Propos', href: '/superadmin/contenus/a-propos' },
      { label: 'Mentions Légales', href: '/superadmin/contenus/mentions-legales' },
      { label: 'CGU', href: '/superadmin/contenus/cgu' },
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
              <h3 className="font-bold text-[#003A54] uppercase tracking-wider text-xs">Gestion des Contenus</h3>
              <button onClick={() => setActiveMenu(null)} className="p-1 rounded-full bg-neutral-100 text-neutral-500" aria-label="Fermer le menu">
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-1">
              {submenus[activeMenu]?.map((sub, idx) => (
                <Link
                  key={idx}
                  href={sub.href}
                  onClick={() => setActiveMenu(null)}
                  className="flex items-center p-3.5 rounded-xl hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
                >
                  <span className="text-[#003A54] font-semibold text-[15px]">{sub.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Main Nav Bar */}
      <nav className="bg-bg-base border-t border-white/10 h-20 flex items-center justify-around px-2 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.3)]">
        {navItems.map((item) => {
          const isActive = activePage === item.id || activeMenu === item.id;
          const Icon = item.icon;

          return (
            <div key={item.id} className="flex flex-col items-center flex-1">
              {item.href ? (
                <Link
                  href={item.href}
                  onClick={() => setActiveMenu(null)}
                  className={`flex flex-col items-center gap-1 w-full py-2 transition-all ${
                    isActive ? 'text-accent' : 'text-white/50'
                  }`}
                >
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
                </Link>
              ) : (
                <button
                  onClick={() => handleNavClick(item)}
                  className={`flex flex-col items-center gap-1 w-full py-2 transition-all ${
                    isActive ? 'text-accent' : 'text-white/50'
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
                </button>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
