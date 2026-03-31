import ListingActualites from '@/app/pages/ListingActualites';
import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';

// Revalidate every 5 minutes (ISR)
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Actualités',
  description: 'Suivez les dernières actualités et événements liés au développement du Cameroun.',
};

export default async function ListingActualitesPage() {
  const supabase = await createClient();
  const itemsPerPage = 9;

  // Fetch first page + count in parallel
  const [countResult, dataResult] = await Promise.all([
    supabase
      .from('actualites')
      .select('*', { count: 'exact', head: true })
      .eq('statut_publication', 'publier'),
    supabase
      .from('actualites')
      .select('*')
      .eq('statut_publication', 'publier')
      .order('created_at', { ascending: false })
      .range(0, itemsPerPage - 1)
  ]);

  const initialCount = countResult.count || 0;
  const initialData = dataResult.data || [];

  return <ListingActualites initialData={initialData} initialCount={initialCount} />;
}
