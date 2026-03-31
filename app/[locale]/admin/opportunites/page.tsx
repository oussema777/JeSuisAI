export const dynamic = 'force-dynamic';
import React, { Suspense } from 'react';
import { GestionOpportunites } from "@/app/pages/GestionOpportunites"; // Adjust path if needed
import { Loader2 } from 'lucide-react';

export default function GestionOpportunitesPage() {
  return (
    // 🔴 CRITICAL FIX: The Suspense boundary allows the build to finish
    // even though the child component uses client-side search params.
    <Suspense 
      fallback={
        <div className="flex items-center justify-center h-screen bg-neutral-50">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      }
    >
      <GestionOpportunites />
    </Suspense>
  );
}