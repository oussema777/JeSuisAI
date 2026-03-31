// app/[locale]/(public)/page.tsx
import { Accueil } from "../../pages/Accueil";
import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

// Revalidate every 5 minutes (ISR)
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Accueil | Je suis au Cameroun',
  description: 'Découvrez les opportunités de développement local au Cameroun et connectez-vous avec la diaspora camerounaise.',
};

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);

  const supabase = await createClient();

  let landingContent = null;
  let faqItems: any[] = [];
  let missions: any[] = [];

  try {
    // Fetch all landing page data in parallel
    // Added .eq('lang', locale) to filters
    let [landingRes, faqRes, missionsRes] = await Promise.all([
      supabase.from('static_contents').select('content').eq('key', 'landing-page').eq('lang', locale).maybeSingle(),
      supabase.from('static_contents').select('content').eq('key', 'faq').eq('lang', locale).maybeSingle(),
      supabase
        .from('opportunites')
        .select(`
          id,
          intitule_action,
          timing_action,
          mission_urgente,
          domaine_action,
          description_generale,
          created_at,
          profiles!opportunites_created_by_fkey (
            annonceur_profiles!profiles_annonceur_id_fkey (
              nom
            )
          )
        `)
        .eq('statut_publication', 'publie')
        .eq('lang', locale) // Filter missions by language too
        .order('created_at', { ascending: false })
        .limit(8)
    ]);

    landingContent = landingRes.data?.content || null;
    faqItems = (faqRes.data?.content as any[]) || [];
    let rawMissions = missionsRes.data || [];

    // Fallback logic: if no localized content found, try fetching 'fr' as default
    if (!landingContent && locale !== 'fr') {
      const fallback = await supabase.from('static_contents').select('content').eq('key', 'landing-page').eq('lang', 'fr').maybeSingle();
      landingContent = fallback.data?.content || null;
    }
    
    if (faqItems.length === 0 && locale !== 'fr') {
      const fallback = await supabase.from('static_contents').select('content').eq('key', 'faq').eq('lang', 'fr').maybeSingle();
      faqItems = (fallback.data?.content as any[]) || [];
    }

    // NEW: Fallback for missions if none found in requested language
    if (rawMissions.length === 0 && locale !== 'fr') {
      const fallbackMissions = await supabase
        .from('opportunites')
        .select(`
          id,
          intitule_action,
          timing_action,
          mission_urgente,
          domaine_action,
          description_generale,
          created_at,
          profiles!opportunites_created_by_fkey (
            annonceur_profiles!profiles_annonceur_id_fkey (
              nom
            )
          )
        `)
        .eq('statut_publication', 'publie')
        .eq('lang', 'fr')
        .order('created_at', { ascending: false })
        .limit(8);
      
      rawMissions = fallbackMissions.data || [];
    }

    // Process missions data
    const sorted = [...rawMissions].sort((a, b) => {
      const aUrgent = a.mission_urgente || a.timing_action === 'urgente';
      const bUrgent = b.mission_urgente || b.timing_action === 'urgente';
      if (aUrgent && !bUrgent) return -1;
      if (!aUrgent && bUrgent) return 1;
      return 0;
    }).slice(0, 4);

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

    missions = sorted.map(m => {
      const orgName = (m.profiles as any)?.annonceur_profiles?.nom || 'Cameroun';

      const isUrgent = m.mission_urgente || m.timing_action === 'urgente';
      let accentColor: 'green' | 'yellow' | 'red' | 'teal' = 'green';
      if (isUrgent) accentColor = 'red';
      else if (m.timing_action === 'ponctuelle') accentColor = 'yellow';

      const domainKey = domainImageMap[m.domaine_action] || 'innovation';
      const image = `/images/domaines/${domainKey}.jpg`;

      return {
        id: m.id.toString(),
        titre: m.intitule_action || 'Mission',
        location: orgName,
        secteur_label: m.domaine_action || 'Action',
        extrait: m.description_generale ? m.description_generale.substring(0, 80) + '...' : '',
        accentColor,
        timing: m.timing_action,
        urgente: isUrgent,
        image,
      };
    });
  } catch (error) {
    console.error("HomePage data fetch error:", error);
    // Continue with default empty/null values to at least render the page shell
  }

  return <Accueil landingContent={landingContent} faqItems={faqItems} missions={missions} />;
}
