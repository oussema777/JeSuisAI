export const dynamic = 'force-dynamic';
import { Suspense } from "react";
import CreerActualite from "@/app/pages/CreerActualite";
import { Loader2 } from "lucide-react";

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
        <p className="text-neutral-600" style={{ fontSize: '15px', fontWeight: 400 }}>
          Chargement...
        </p>
      </div>
    </div>
  );
}

export default function CreerActualitePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CreerActualite />
    </Suspense>
  );
}