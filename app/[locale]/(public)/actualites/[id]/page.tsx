import { DetailActualite } from "@/app/pages/DetailActualite";
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
    .from('actualites')
    .select('titre, resume, image_principale_path')
    .eq('id', id)
    .single();

  if (!data) return { title: 'Actualité introuvable' };

  const description = data.resume?.substring(0, 160) || data.titre;
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jesuisaucameroun.com';
  let imageUrl = `${siteUrl}/logo_jesuis.png`;

  if (data.image_principale_path) {
    imageUrl = getPublicUrl('actualites', data.image_principale_path);
  }

  return {
    title: data.titre,
    description,
    openGraph: {
      title: data.titre,
      description,
      type: 'article',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: data.titre,
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: data.titre,
      description,
      images: [imageUrl],
    }
  };
}

export default async function DetailActualitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch article
  const { data: article, error } = await supabase
    .from('actualites')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !article) notFound();

  // Fetch announcer name via author's profile chain
  let announcerName = article.mairie_emettrice || 'Organisation';

  if (article.created_by) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('annonceur_id')
      .eq('id', article.created_by)
      .single();

    if (profileData?.annonceur_id) {
      const { data: annData } = await supabase
        .from('annonceur_profiles')
        .select('nom')
        .eq('id', profileData.annonceur_id)
        .single();

      if (annData?.nom) {
        announcerName = annData.nom;
      }
    }
  }

  return <DetailActualite article={article} announcerName={announcerName} />;
}
