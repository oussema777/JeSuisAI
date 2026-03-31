"use client";

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { 
  Heart, GraduationCap, Building2, 
  Lightbulb, DollarSign, Briefcase, Loader2, MapPin, 
  AlertCircle, Users, Leaf, Globe2, Palette, Zap, Scale, AlertTriangle
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

// UI Components
import { CarteOpportunite } from '../components/ds/CarteOpportunite';
import { FilDAriane } from '../components/listing/FilDAriane';
import { ChipFiltre } from '../components/listing/ChipFiltre';
import { CaseACocher } from '../components/ds/CaseACocher';
import { BoutonRadio } from '../components/ds/BoutonRadio';
import { Pagination } from '../components/listing/Pagination';
import { Skeleton } from '../components/ds/Skeleton';
import { useAuth } from '../hooks/useAuth';
import { slugify } from '@/lib/utils';

const supabase = getSupabaseBrowserClient();

interface AnnonceurProfile {
  id: string;
  pays: string;
  nom: string;
  statut: string;
  logo_url: string | null;
  presentation: string;
}

interface Opportunite {
  id: number;
  created_at: string;
  intitule_action: string;
  domaine_action: string;
  photo_representation_path: string | null;
  afficher_une: boolean;
  contributions_diaspora: Record<string, boolean>;
  timing_action: string;
  date_debut: string | null;
  date_fin: string | null;
  public_vise: string;
  action_distance: string;
  mission_urgente: boolean;
  impacts_objectifs: string;
  details_contributions: string;
  conditions_mission: string;
  remuneration_prevue: string;
  facilites: Record<string, boolean>;
  statut_publication: string;
  profiles?: {
    id: string;
    annonceur_id: string | null;
    annonceur_profiles?: AnnonceurProfile | null;
  };
}

function ListingOpportunitesContent() {
  const t = useTranslations('Public.Missions');
  const tCommon = useTranslations('Common');
  const params = useParams();
  const currentLocale = params.locale as string || 'fr';
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading: authLoading } = useAuth();
  
  const [data, setData] = useState<Opportunite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 9;

  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [contributionType, setContributionType] = useState('all');

  // URL Filters
  const urlDateDebut = searchParams.get('dateDebut');
  const urlDateFin = searchParams.get('dateFin');
  const urlVille = searchParams.get('ville');
  const urlDomaine = searchParams.get('domaine');
  const urlMissionType = searchParams.get('missionType') || 'all';
  const urlContributionTypes = searchParams.get('typeContribution')?.split(',') || [];

  // Mapping top-level categories to database keys
  const contributionTypeMap: Record<string, string[]> = {
    'investissement': ['investissement'],
    'epargne': ['epargne'],
    'competences': ['competences'],
    'dons': ['dons'],
    'reseaux-influence': ['reseauxInfluence'],
    'achats-tourisme': ['achatsTourisme']
  };

  useEffect(() => {
    const fetchOpportunites = async () => {
      if (authLoading) return;
      
      setIsLoading(true);
      
      try {
        const withTimeout = (promise: Promise<any>, ms: number) => {
          return Promise.race([
            promise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
          ]);
        };

        // Consolidation: Single query with nested joins and restricted columns
        // This is much lighter on the database and network
        const { data: opps, error } = await withTimeout(
          supabase
            .from('opportunites')
            .select(`
              id,
              created_at,
              intitule_action,
              domaine_action,
              photo_representation_path,
              afficher_une,
              contributions_diaspora,
              timing_action,
              date_debut,
              date_fin,
              action_distance,
              mission_urgente,
              statut_publication,
              created_by,
              profiles:created_by (
                id,
                annonceur_id,
                annonceur_profiles:annonceur_id (
                  id,
                  nom,
                  logo_url
                )
              )
            `)
            .eq('statut_publication', 'publie')
            .order('created_at', { ascending: false }) as any as Promise<any>,
          10000
        );

        if (error) throw error;
        setData(opps || []);
      } catch (err: any) {
        console.error("Error fetching opportunities:", err?.message || err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOpportunites();
  }, [authLoading]);

  // Initialize filters from URL
  useEffect(() => {
    if (urlDomaine && !selectedSectors.includes(urlDomaine)) {
      setSelectedSectors([urlDomaine]);
    }
  }, [urlDomaine]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSectors, contributionType, urlMissionType, urlDateDebut, urlDateFin, urlVille, urlContributionTypes.length]);

  const getSectorInfo = (domaineActionValue: string) => { 
    const isEn = currentLocale === 'en';
    switch (domaineActionValue) {
      case 'sante': return { icon: <Heart className="w-4 h-4" />, label: isEn ? 'Health' : 'Santé' };
      case 'education': return { icon: <GraduationCap className="w-4 h-4" />, label: isEn ? 'Education' : 'Éducation' };
      case 'investissement': return { icon: <DollarSign className="w-4 h-4" />, label: isEn ? 'Investment' : 'Investissement' };
      case 'pauvrete': return { icon: <Lightbulb className="w-4 h-4" />, label: isEn ? 'Poverty reduction' : 'Lutte contre la pauvreté' };
      case 'societe-civile': return { icon: <Users className="w-4 h-4" />, label: isEn ? 'Civil society' : 'Société civile' };
      case 'infrastructures': return { icon: <Building2 className="w-4 h-4" />, label: isEn ? 'Infrastructure' : 'Infrastructures' };
      case 'environnement': return { icon: <Leaf className="w-4 h-4" />, label: isEn ? 'Environment' : 'Environnement' };
      case 'innovation': return { icon: <Lightbulb className="w-4 h-4" />, label: isEn ? 'Innovation' : 'Innovation' };
      case 'recrutement': return { icon: <Briefcase className="w-4 h-4" />, label: isEn ? 'Recruitment' : 'Recrutement' };
      case 'tourisme': return { icon: <Globe2 className="w-4 h-4" />, label: isEn ? 'Tourism' : 'Tourisme' };
      case 'culture': return { icon: <Palette className="w-4 h-4" />, label: isEn ? 'Culture and heritage' : 'Culture et patrimoine' };
      case 'rayonnement': return { icon: <Zap className="w-4 h-4" />, label: isEn ? 'International influence' : 'Rayonnement international' };
      case 'droits': return { icon: <Scale className="w-4 h-4" />, label: isEn ? 'Rights and citizenship' : 'Droits et citoyenneté' };
      case 'urgences': return { icon: <AlertTriangle className="w-4 h-4" />, label: isEn ? 'Humanitarian emergencies' : 'Urgences humanitaires' };
      default: return { icon: <Lightbulb className="w-4 h-4" />, label: domaineActionValue.charAt(0).toUpperCase() + domaineActionValue.slice(1) };
    }
  };

  const getDomainImageFallback = (domaine: string | null): string => {
    if (!domaine) return '/images/domaines/innovation.jpg';
    const mapping: Record<string, string> = {
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
    const filename = mapping[domaine] || 'innovation';
    return `/images/domaines/${filename}.jpg`;
  };

  const getImageUrl = (path: string | null, domaine: string | null) => {
    if (!path) return getDomainImageFallback(domaine);
    const { data: storageData } = supabase.storage.from('opportunites').getPublicUrl(path);
    return storageData.publicUrl;
  };

  const getAnnonceurName = (opp: Opportunite) => {
    return opp.profiles?.annonceur_profiles?.nom || 'Organisation';
  };

  const handleSectorChange = (sector: string, checked: boolean) => {
    setSelectedSectors(prev => 
      checked ? [...prev, sector] : prev.filter(s => s !== sector)
    );
  };

  const resetFilters = () => {
    setSelectedSectors([]);
    setContributionType('all');
    router.push('/missions');
  };

  const filteredData = data.filter(item => {
    // 1. FILTER BY SEARCH TAB LOGIC (Timing & Overlap)
    if (urlMissionType === 'all' || !urlMissionType) {
      if (item.timing_action === 'urgente' || item.timing_action === 'permanente') {
        // Always show
      } else {
        if (urlDateDebut || urlDateFin) {
          const userStart = urlDateDebut ? new Date(urlDateDebut) : null;
          const userEnd = urlDateFin ? new Date(urlDateFin) : null;
          const missionStart = item.date_debut ? new Date(item.date_debut) : null;
          const missionEnd = item.date_fin ? new Date(item.date_fin) : null;

          if (missionStart || missionEnd) {
            // Effective User range
            const uStart = userStart || new Date(0); 
            const uEnd = userEnd || new Date(8640000000000000); 
            
            // Effective Mission range
            const mStart = missionStart || new Date(0);
            const mEnd = missionEnd || new Date(8640000000000000);

            const overlaps = (uStart <= mEnd) && (mStart <= uEnd);
            if (!overlaps) return false;
          }
        }
      }
    } else if (urlMissionType === 'remote') {
      if (item.action_distance !== 'oui') return false;
    } else if (urlMissionType === 'invest') {
      const types = item.contributions_diaspora || {};
      if (!types.investissement && !types.epargne) return false;
    } else if (urlMissionType === 'volunteer') {
      const types = item.contributions_diaspora || {};
      if (!types.competences) return false;
    }

    // 2. FILTER BY SECTOR
    if (selectedSectors.length > 0 && !selectedSectors.includes(item.domaine_action)) {
      return false;
    }
    
    // 3. FILTER BY VILLE
    if (urlVille && item.profiles?.annonceur_profiles?.nom.toLowerCase().indexOf(urlVille.toLowerCase()) === -1) {
      // Basic check against advertiser name since city field isn't direct
    }

    // 4. FILTER BY CONTRIBUTION TYPE (from search bar OR sidebar)
    const activeTypes = urlContributionTypes.length > 0 ? urlContributionTypes : (contributionType !== 'all' ? [contributionType] : []);
    
    if (activeTypes.length > 0) {
        const itemContribs = item.contributions_diaspora || {};
        const matchesAnySelectedType = activeTypes.every(typeId => {
            const subKeys = contributionTypeMap[typeId] || [typeId];
            return subKeys.some(key => itemContribs[key] === true);
        });
        
        if (!matchesAnySelectedType) return false;
    }

    return true;
  });

  // Paginate filtered data
  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getBadgesForOpportunity = (opp: Opportunite) => {
    const isEn = currentLocale === 'en';
    const badges: Array<{ text: string; variant: 'urgent' | 'prioritaire' | 'ouvert' | 'nouveau' | 'distance' }> = [];
    if (opp.afficher_une) badges.push({ text: isEn ? 'PRIORITY' : 'PRIORITAIRE', variant: 'prioritaire' });
    if (opp.mission_urgente || opp.timing_action === 'urgente') badges.push({ text: isEn ? 'URGENT' : 'URGENTE', variant: 'urgent' });
    if (opp.action_distance === 'oui') badges.push({ text: isEn ? 'REMOTE' : 'À DISTANCE', variant: 'distance' });
    const isNew = new Date(opp.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (isNew && badges.length === 0) badges.push({ text: isEn ? 'NEW' : 'NOUVEAU', variant: 'nouveau' });
    return badges;
  };

  return (
    <div className="min-h-screen bg-page-bg pb-20">
      <div className="w-full border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20 py-4">
          <FilDAriane
            items={[
              { label: 'Accueil', onClick: () => router.push('/') },
              { label: 'Missions' },
            ]}
          />
        </div>
      </div>
      
      <div className="w-full bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20 py-12">
          <h1 className="text-neutral-900 mb-4" style={{ fontSize: '39px', lineHeight: '1.2', fontWeight: 600 }}>
            {currentLocale === 'en' ? 'Discover missions' : 'Découvrez les missions'}
          </h1>
          <p className="text-neutral-700 mb-6 max-w-2xl" style={{ fontSize: '18px', lineHeight: '1.6', fontWeight: 400 }}>
            {currentLocale === 'en' ? 'Explore contribution actions for the development of your home city' : 'Explorez les actions de contribution au développement de votre ville d\'origine'}
          </p>
          
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-primary" style={{ fontSize: '20px', fontWeight: 700 }}>
                {filteredData.length}
              </span>
              <span className="text-neutral-600" style={{ fontSize: '15px', fontWeight: 400 }}>
                {currentLocale === 'en' ? 'available missions' : 'missions disponibles'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl border border-neutral-200 p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-neutral-800" style={{ fontSize: '20px', fontWeight: 600 }}>{currentLocale === 'en' ? 'Filters' : 'Filtres'}</h3>
                  <button onClick={resetFilters} className="text-neutral-600 hover:text-neutral-800 transition-colors text-sm font-medium">{currentLocale === 'en' ? 'Reset' : 'Réinitialiser'}</button>
                </div>
                
                <div className="mb-6">
                  <label className="block text-neutral-700 mb-3 text-sm font-semibold">{currentLocale === 'en' ? 'Sector' : 'Secteur'}</label>
                  <div className="flex flex-col gap-3">
                    {['investissement', 'sante', 'education', 'infrastructures', 'environnement', 'innovation', 'recrutement', 'tourisme', 'culture', 'rayonnement', 'droits', 'urgences', 'pauvrete', 'societe-civile'].map(s => (
                      <CaseACocher key={s} label={getSectorInfo(s).label} checked={selectedSectors.includes(s)} onChange={(c) => handleSectorChange(s, c)} />
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-neutral-700 mb-3 text-sm font-semibold">{currentLocale === 'en' ? 'Contribution type' : 'Type de contribution'}</label>
                  <div className="flex flex-col gap-3">
                    <BoutonRadio name="type" value="all" label={tCommon('all')} checked={contributionType === 'all'} onChange={() => setContributionType('all')} />
                    <BoutonRadio name="type" value="competences" label={currentLocale === 'en' ? 'Skills' : 'Compétences'} checked={contributionType === 'competences'} onChange={() => setContributionType('competences')} />
                    <BoutonRadio name="type" value="investissement" label={currentLocale === 'en' ? 'Investment' : 'Investissement'} checked={contributionType === 'investissement'} onChange={() => setContributionType('investissement')} />
                    <BoutonRadio name="type" value="mentorat" label={currentLocale === 'en' ? 'Mentoring' : 'Mentorat'} checked={contributionType === 'mentorat'} onChange={() => setContributionType('mentorat')} />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-9">
              {selectedSectors.length > 0 && (
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                    <span className="text-neutral-600 text-sm font-medium">{currentLocale === 'en' ? 'Active filters :' : 'Filtres actifs :'}</span>
                    {selectedSectors.map(s => (
                        <ChipFiltre key={s} label={getSectorInfo(s).label} onRetirer={() => handleSectorChange(s, false)} />
                    ))}
                </div>
              )}
              
              <div className="mb-6">
                <span className="text-neutral-700 text-base">
                  <span className="font-bold">{filteredData.length}</span> {currentLocale === 'en' ? 'missions found' : 'missions trouvées'}
                </span>
              </div>
              
              {isLoading ? (
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
              ) : filteredData.length === 0 ? (
                  <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
                      <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <AlertCircle className="w-8 h-8 text-neutral-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-2">{t('empty_state')}</h3>
                      <p className="text-neutral-500 text-sm">{t('empty_state_subtitle')}</p>                      <button onClick={resetFilters} className="mt-4 text-primary font-medium hover:underline">{currentLocale === 'en' ? 'Reset filters' : 'Réinitialiser les filtres'}</button>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {paginatedData.map((opp) => (
                        <CarteOpportunite
                          key={opp.id}
                          badges={getBadgesForOpportunity(opp)}
                          titre={opp.intitule_action}
                          location={getAnnonceurName(opp)}
                          secteur={getSectorInfo(opp.domaine_action)}
                          buttonText={t('view_details')}
                          image={getImageUrl(opp.photo_representation_path, opp.domaine_action)}
                          href={`/missions/${slugify(opp.intitule_action)}-${opp.id}`} 
                        />
                    ))}
                  </div>
              )}
              
             {totalPages > 1 && (
              <Pagination
                pageActuelle={currentPage}
                totalPages={totalPages}
                onChangementPage={handlePageChange}
              />
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ListingOpportunitesPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    }>
      <ListingOpportunitesContent />
    </Suspense>
  );
}
