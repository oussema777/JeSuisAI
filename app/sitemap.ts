import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

// Revalidate every hour
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jesuisaucameroun.com';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/missions`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/actualites`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/a-propos`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/comment-ca-marche`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/soumettre-profil`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/soumettre-projet`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/mentions-legales`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/protection-donnees`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Dynamic pages: published opportunities
  const dynamicPages: MetadataRoute.Sitemap = [];

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: opportunities } = await supabase
        .from('opportunites')
        .select('id, intitule_action, updated_at')
        .eq('statut_publication', 'publie');

      if (opportunities) {
        // Basic slugify inside sitemap to avoid import issues in edge/server context
        const slugifyLocal = (text: string) => text.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
        
        for (const opp of opportunities) {
          dynamicPages.push({
            url: `${baseUrl}/missions/${slugifyLocal(opp.intitule_action)}-${opp.id}`,
            lastModified: opp.updated_at,
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        }
      }

      const { data: actualites } = await supabase
        .from('actualites')
        .select('id, updated_at')
        .eq('publie', true);

      if (actualites) {
        for (const actu of actualites) {
          dynamicPages.push({
            url: `${baseUrl}/actualites/${actu.id}`,
            lastModified: actu.updated_at,
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
      }

      const { data: villes } = await supabase
        .from('annonceur_profiles')
        .select('id, updated_at')
        .eq('statut', 'actif');

      if (villes) {
        for (const ville of villes) {
          dynamicPages.push({
            url: `${baseUrl}/fiche-ville/${ville.id}`,
            lastModified: ville.updated_at,
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
      }
    }
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  return [...staticPages, ...dynamicPages];
}
