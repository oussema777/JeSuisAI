import DetailOpportunite from '@/app/pages/DetailOpportunite';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { extractIdFromSlug, slugify } from '@/lib/utils';
import { getPublicUrl } from '@/lib/supabase/storage';

// Revalidate every 10 minutes (ISR)
export const revalidate = 600;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id: rawSlug } = await params;
  const id = extractIdFromSlug(rawSlug);
  
  const supabase = await createClient();
  const { data: opp } = await supabase
    .from('opportunites')
    .select(`
      intitule_action, 
      description_generale, 
      photo_representation_path,
      domaine_action
    `)
    .eq('id', id)
    .single();

  if (!opp) return { title: 'Mission introuvable' };

  const title = opp.intitule_action;
  const description = opp.description_generale?.substring(0, 160) || `Mission: ${opp.intitule_action}`;
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jesuisaucameroun.com';
  
  // SEO Image
  let imageUrl = `${siteUrl}/logo_jesuis.png`; // Fallback
  
  if (opp.photo_representation_path) {
    imageUrl = getPublicUrl('opportunites', opp.photo_representation_path);
  } else if (opp.domaine_action) {
    const domainImageMap: Record<string, string> = {
      'investissement': 'investissement',
      'Santé': 'sante',
      'sante': 'sante',
      'pauvrete': 'pauvrete',
      'societe-civile': 'societe-civile',
      'infrastructures': 'infrastructures',
      'environnement': 'environnement',
      'éducation': 'education',
      'education': 'education',
      'innovation': 'innovation',
      'recrutement': 'recrutement',
      'tourisme': 'tourisme',
      'culture': 'culture',
      'rayonnement': 'rayonnement',
      'droits': 'droits',
      'urgences': 'urgences',
    };
    const domainKey = domainImageMap[opp.domaine_action] || 'innovation';
    imageUrl = `${siteUrl}/images/domaines/${domainKey}.jpg`;
  }

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: `/missions/${slugify(title)}-${id}`,
    },
    openGraph: {
      title,
      description,
      url: `/missions/${slugify(title)}-${id}`,
      siteName: 'Je suis au Cameroun',
      images: [
        {
          url: imageUrl,
          secureUrl: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
          type: 'image/jpeg',
        },
      ],
      locale: 'fr_FR',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function OpportuniteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawSlug } = await params;
  const id = extractIdFromSlug(rawSlug);
  
  const supabase = await createClient();

  // Fetch opportunity with nested annonceur profile
  const [oppResult, contactsResult] = await Promise.all([
    supabase
      .from('opportunites')
      .select(`
        *,
        profiles!opportunites_created_by_fkey (
          id,
          annonceur_id,
          annonceur_profiles!profiles_annonceur_id_fkey (
            id,
            pays,
            nom,
            statut,
            logo_url,
            presentation,
            points_focaux_diaspora
          )
        )
      `)
      .eq('id', id)
      .single(),
    supabase
      .from('opportunite_contacts')
      .select('*')
      .eq('opportunite_id', id)
      .order('ordre', { ascending: true })
  ]);

  if (oppResult.error || !oppResult.data) notFound();

  // Extract annonceur profile from nested structure
  let annonceurProfile = null;
  if (oppResult.data.profiles?.annonceur_profiles) {
    annonceurProfile = oppResult.data.profiles.annonceur_profiles;
  }

  const opp = {
    ...oppResult.data,
    contacts: contactsResult.data || [],
    annonceur: annonceurProfile
  };

  return <DetailOpportunite opp={opp} />;
}
