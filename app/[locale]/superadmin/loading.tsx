import { Skeleton } from '@/app/components/ds/Skeleton';

export default function SuperadminLoading() {
  return (
    <div className="min-h-screen bg-[#F8F8F6] flex">
      {/* Sidebar skeleton */}
      <div className="w-[260px] bg-white border-r border-neutral-200 p-6 flex-shrink-0">
        <Skeleton className="h-8 w-36 mb-8" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
