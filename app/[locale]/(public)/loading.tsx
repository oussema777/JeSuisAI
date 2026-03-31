import { Skeleton } from '@/app/components/ds/Skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F8F8F6]">
      {/* Breadcrumb skeleton */}
      <div className="w-full border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20 py-4">
          <Skeleton className="h-4 w-40" />
        </div>
      </div>

      {/* Header skeleton */}
      <div className="w-full bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20 py-12">
          <Skeleton className="h-10 w-80 mb-4" />
          <Skeleton className="h-5 w-96 mb-6" />
          <Skeleton className="h-5 w-48" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar filters skeleton */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <Skeleton className="h-6 w-20 mb-6" />
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cards grid skeleton */}
          <div className="lg:col-span-9">
            <Skeleton className="h-5 w-36 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                  <Skeleton className="h-48 w-full rounded-none" />
                  <div className="p-5">
                    <Skeleton className="h-4 w-24 mb-3" />
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-4" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
