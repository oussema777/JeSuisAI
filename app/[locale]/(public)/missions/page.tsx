import { Suspense } from 'react';
import ListingOpportunitesPage from '@/app/pages/ListingOpportunites';
import ListingOpportunites from '@/app/pages/ListingOpportunites';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Missions & Opportunités',
  description: 'Explorez les missions et opportunités disponibles pour contribuer au développement du Cameroun.',
};

// Loading component
function ListingLoading() {
  return (
    <div className="min-h-screen bg-page-bg">
      <div className="w-full border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20 py-4">
          <div className="h-6 bg-neutral-200 rounded w-64 animate-pulse" />
        </div>
      </div>

      <div className="w-full bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20 py-12">
          <div className="h-12 bg-neutral-200 rounded w-96 animate-pulse mb-4" />
          <div className="h-6 bg-neutral-200 rounded w-full max-w-2xl animate-pulse mb-6" />
          <div className="flex gap-6">
            <div className="h-8 bg-neutral-200 rounded w-32 animate-pulse" />
            <div className="h-8 bg-neutral-200 rounded w-32 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl border border-neutral-200 p-6">
                <div className="h-6 bg-neutral-200 rounded w-24 animate-pulse mb-6" />
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-6 bg-neutral-200 rounded animate-pulse" />
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-9">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="h-48 bg-neutral-200 animate-pulse" />
                    <div className="p-5 space-y-4">
                      <div className="h-6 bg-neutral-200 rounded animate-pulse" />
                      <div className="h-4 bg-neutral-200 rounded w-3/4 animate-pulse" />
                      <div className="h-16 bg-neutral-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MissionsPage() {
  return (
    <Suspense fallback={<ListingLoading />}>
      <ListingOpportunites />
    </Suspense>
  );
}