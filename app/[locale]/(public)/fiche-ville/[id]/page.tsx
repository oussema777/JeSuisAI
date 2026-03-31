import FicheVille from "@/app/pages/FicheVille";
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPublicUrl } from '@/lib/supabase/storage';

// Revalidate every 10 minutes (ISR)
export const revalidate = 600;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('annonceur_profiles')
    .select('nom, presentation, logo_url')
    .eq('id', id)
    .single();

  if (!data) return { title: 'Ville introuvable' };

  const description = data.presentation?.substring(0, 160) || `Fiche de la ville de ${data.nom}`;
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jesuisaucameroun.com';
  let imageUrl = `${siteUrl}/logo_jesuis.png`;

  if (data.logo_url) {
    // Check if it's already a full URL or a path
    imageUrl = data.logo_url.startsWith('http') ? data.logo_url : getPublicUrl('annonceurs', data.logo_url);
  }

  return {
    title: `Ville de ${data.nom}`,
    description,
    openGraph: {
      title: `Ville de ${data.nom}`,
      description,
      type: 'profile',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: data.nom,
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `Ville de ${data.nom}`,
      description,
      images: [imageUrl],
    }
  };
}

export default async function FicheVillePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch city profile
  const { data: profile, error } = await supabase
    .from('annonceur_profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !profile) notFound();

  // Fetch profiles associated with this advertiser
  const { data: advertiserProfiles } = await supabase
    .from('profiles')
    .select('id')
    .eq('annonceur_id', id);

  const profileIds = advertiserProfiles?.map((p: any) => p.id) || [];

  // Fetch published opportunities by those profile IDs
  let opportunities: any[] = [];
  if (profileIds.length > 0) {
    const { data: oppData } = await supabase
      .from('opportunites')
      .select('*')
      .in('created_by', profileIds)
      .eq('statut_publication', 'publie');

    opportunities = oppData || [];
  }

  return <FicheVille profile={profile} opportunities={opportunities} />;
}
