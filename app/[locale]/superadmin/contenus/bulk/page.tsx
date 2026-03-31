'use client';

import React from 'react';
import { SidebarSuperadmin } from '@/app/components/superadmin/Sidebarsuperadmin';
import { BulkContentManager } from '@/app/components/superadmin/BulkContentManager';
import { BottomNavSuperadmin } from '@/app/components/superadmin/BottomNavSuperadmin';
import { FileEdit } from 'lucide-react';

export default function BulkContentPage() {
  return (
    <div className="min-h-screen bg-page-bg flex flex-col lg:flex-row">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <SidebarSuperadmin activePage="contenus-statiques" activeSubPage="bulk" />
      </div>
      
      <main className="flex-1 lg:ml-[260px] p-4 lg:p-8 pb-24 lg:pb-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-neutral-500 text-sm mb-4">
            <span>Superadmin</span>
            <span>/</span>
            <span>Contenus</span>
            <span>/</span>
            <span className="text-primary font-medium">Correction en masse</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <FileEdit className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-neutral-900" style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 700 }}>
                Correction en Masse
              </h1>
              <p className="text-neutral-600" style={{ fontSize: '16px', fontWeight: 400 }}>
                Gérez tout le contenu textuel de la plateforme via Excel
              </p>
            </div>
          </div>
        </div>

        {/* Content Manager */}
        <BulkContentManager />
      </main>

      {/* Mobile Navigation */}
      <BottomNavSuperadmin activePage="dashboard" />
    </div>
  );
}
