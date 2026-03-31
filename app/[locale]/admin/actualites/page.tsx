export const dynamic = 'force-dynamic';
import React, { Suspense } from "react";
import GestionActualites from "@/app/pages/GestionActualites";

export default function GestionActualitesPage() {
  return (
    <Suspense fallback={<div>Chargement des actualités...</div>}>
      <GestionActualites />
    </Suspense>
  );
}
