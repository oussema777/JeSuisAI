'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { SidebarAdmin } from '@/app/components/admin/SidebarAdmin';
import { BottomNavAdmin } from '@/app/components/admin/BottomNavAdmin';
import { usePathname } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function AdminLayoutInner({
  children,
  isCollapsed,
  setIsCollapsed
}: {
  children: React.ReactNode;
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeState = useMemo(() => {
    const state: { activePage: any; activeSubPage?: any } = { activePage: 'dashboard' };

    if (pathname.includes('/admin/dashboard')) {
      state.activePage = 'dashboard';
    } else if (pathname.includes('/admin/opportunites')) {
      state.activePage = 'opportunites';
      if (pathname.includes('/creer')) {
        state.activeSubPage = 'creer-nouvelle';
      } else if (searchParams.get('view') === 'brouillons') {
        state.activeSubPage = 'brouillons';
      } else {
        state.activeSubPage = 'toutes';
      }
    } else if (pathname.includes('/admin/actualites')) {
      state.activePage = 'actualites';
      if (pathname.includes('/creer')) {
        state.activeSubPage = 'creer-nouvelle';
      } else if (searchParams.get('view') === 'brouillons') {
        state.activeSubPage = 'brouillons';
      } else {
        state.activeSubPage = 'toutes';
      }
    } else if (pathname.includes('/admin/candidatures')) {
      state.activePage = 'candidatures';
    } else if (pathname.includes('/admin/profilesoumis')) {
      state.activePage = 'profiles soumis';
    } else if (pathname.includes('/admin/projetsoumis')) {
      state.activePage = 'projets soumis';
    } else if (pathname.includes('/admin/parametres')) {
      state.activePage = 'parametres';
    } else if (pathname.includes('/admin/utilisateurs')) {
      state.activePage = 'utilisateurs';
    }

    return state;
  }, [pathname, searchParams]);

  return (
    <>
      {/* Sidebar - HIDDEN ON MOBILE (hidden), VISIBLE ON DESKTOP (lg:block) */}
      <div className="hidden lg:block">
        <SidebarAdmin 
          activePage={activeState.activePage} 
          activeSubPage={activeState.activeSubPage}
          isCollapsed={isCollapsed} 
          onToggle={() => setIsCollapsed(!isCollapsed)} 
        />
      </div>

      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[260px]'
        } ml-0 pb-20 lg:pb-0`}
      >
        <main className="flex-1 w-full max-w-full overflow-x-hidden">
          <div className="p-4 lg:p-10 mx-auto w-full max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Nav - Visible only on mobile */}
      <BottomNavAdmin activePage={activeState.activePage} />
    </>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-neutral-50 overflow-x-hidden relative">
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center bg-neutral-50">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }>
        <AdminLayoutInner isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}>
          {children}
        </AdminLayoutInner>
      </Suspense>
    </div>
  );
}                                                                                                                                                       