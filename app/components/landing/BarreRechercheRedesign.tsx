'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Briefcase, Users, Globe, TrendingUp, Heart, ChevronDown, Check } from 'lucide-react';
import { CardWithColorfulBorder } from '../ds/CardWithColorfulBorder';
import { DatePickerWithRange } from '../ds/DatePickerWithRange';
import { Link } from '@/i18n/routing';
import { useRouter } from '@/i18n/routing';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

interface BarreRechercheRedesignProps {
  onSearch?: (filters: {
    dateDebut?: string;
    ville?: string;
    domaine?: string;
    typeContribution?: string[];
    missionType: 'all' | 'remote' | 'invest' | 'volunteer';
    budget?: string;
    duree?: string;
  }) => void;
}

type MissionTab = 'all' | 'remote' | 'invest' | 'volunteer';

// Simplified component for top-level only
function SimplifiedMultiSelect({ label, icon, categories, selectedIds, onChange, placeholder = 'Sélectionnez...' }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCategory = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item: string) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="flex flex-col gap-2" ref={dropdownRef}>
      <label className="flex items-center gap-2" style={{ fontSize: '14px', fontWeight: 500, color: '#187A58' }}>
        {icon}
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="h-12 w-full px-3 py-3 bg-white border border-neutral-300 rounded-lg text-left flex items-center justify-between transition-all focus:border-[#187A58] focus:outline-none"
          style={{ fontSize: '14px', fontWeight: 400 }}
        >
          <span className={selectedIds.length === 0 ? 'text-neutral-400' : 'text-neutral-800'}>
            {selectedIds.length === 0 ? placeholder : `${selectedIds.length} sélectionné${selectedIds.length > 1 ? 's' : ''}`}
          </span>
          <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} strokeWidth={2} />
        </button>
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-xl z-[100] max-h-[400px] overflow-y-auto py-2 custom-scrollbar">
            {categories.map((cat: any) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-neutral-50 transition-colors text-left"
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  selectedIds.includes(cat.id) ? 'bg-primary border-primary' : 'bg-white border-neutral-400'
                }`}>
                  {selectedIds.includes(cat.id) && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                </div>
                <span className="text-bg-base truncate" style={{ fontSize: '14px', fontWeight: 500 }}>{cat.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #bbb;
        }
      `}</style>
    </div>
  );
}

export function BarreRechercheRedesign({ onSearch }: BarreRechercheRedesignProps = {}) {
  const t = useTranslations('Public.Home');
  const tNav = useTranslations('Navigation');
  const tCommon = useTranslations('Common');
  const params = useParams();
  const currentLocale = params.locale as string || 'fr';
  const router = useRouter();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [ville, setVille] = useState('');
  const [domaine, setDomaine] = useState('');
  const [typeContribution, setTypeContribution] = useState<string[]>([]);
  const [budget, setBudget] = useState('');
  const [duree, setDuree] = useState('');
  const [activeTab, setActiveTab] = useState<MissionTab>('all');
  const [cities, setCities] = useState<string[]>([]);
  const [activeDomains, setActiveDomains] = useState<{value: string, label: string}[]>([]);
  const [activeInvestmentTypes, setActiveInvestmentTypes] = useState<{value: string, label: string}[]>([]);
  
  // FIRST LEVEL ONLY for simplified selection
  const contributionCategoriesList = [
    { id: 'investissement', label: '💰 Investissement' },
    { id: 'epargne', label: '🏦 Épargne' },
    { id: 'competences', label: '🎓 Compétences' },
    { id: 'dons', label: '🎁 Dons' },
    { id: 'reseaux-influence', label: '🌐 Réseaux & influence' },
    { id: 'achats-tourisme', label: '🛍️ Achats & tourisme solidaires' }
  ];

  // Mapping for human-readable labels
  const domainMapping: Record<string, string> = {
    'investissement': 'Investissement',
    'sante': 'Santé',
    'pauvrete': 'Lutte contre la pauvreté',
    'societe-civile': 'Société civile',
    'infrastructures': 'Infrastructures',
    'environnement': 'Environnement',
    'education': 'Éducation',
    'innovation': 'Innovation',
    'recrutement': 'Recrutement',
    'tourisme': 'Tourisme',
    'culture': 'Culture et patrimoine',
    'rayonnement': 'Rayonnement international',
    'droits': 'Droits et citoyenneté',
    'urgences': 'Urgences humanitaires'
  };

  const investmentMapping: Record<string, string> = {
    'creationEntreprise': 'Création entreprise',
    'participationDirecte': 'Prise de participation directe',
    'participationFonds': 'Prise de participation dans fonds d\'investissement',
    'immobilier': 'Immobilier'
  };

  // Initialize Supabase (singleton)
  const supabase = getSupabaseBrowserClient();

  // Fetch active cities and domains
  useEffect(() => {
    async function fetchFilterData() {
      try {
        // Fetch cities
        const { data: citiesData } = await supabase
          .from('annonceur_profiles')
          .select('nom')
          .order('nom');
        
        if (citiesData) {
          const uniqueCities = Array.from(new Set(citiesData.map(item => item.nom)));
          setCities(uniqueCities);
        }

        // Fetch missions to determine active domains
        const { data: missionsData } = await supabase
          .from('opportunites')
          .select('domaine_action, contributions_diaspora')
          .eq('statut_publication', 'publie');

        if (missionsData) {
          // 1. Domains
          const uniqueDomainValues = Array.from(new Set(missionsData.map(item => item.domaine_action)));
          const mappedDomains = uniqueDomainValues.map(val => ({
            value: val,
            label: domainMapping[val] || val.charAt(0).toUpperCase() + val.slice(1)
          })).sort((a, b) => a.label.localeCompare(b.label));
          setActiveDomains(mappedDomains);

          // 2. Investment Types (Sub-keys)
          const activeInvestSubKeys = new Set<string>();
          const investKeys = ['creationEntreprise', 'participationDirecte', 'participationFonds', 'immobilier'];
          
          missionsData.forEach(m => {
            const contribs = m.contributions_diaspora || {};
            investKeys.forEach(k => {
              if (contribs[k] === true) activeInvestSubKeys.add(k);
            });
          });

          const mappedInvest = Array.from(activeInvestSubKeys).map(k => ({
            value: k,
            label: investmentMapping[k] || k
          })).sort((a, b) => a.label.localeCompare(b.label));
          setActiveInvestmentTypes(mappedInvest);
        }
      } catch (err) {
        console.error("Error fetching filter data:", err);
      }
    }
    fetchFilterData();
  }, [supabase]);

  const handleSearch = () => {
    const dDebut = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '';
    const dFin = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '';

    const filters = { 
      dateDebut: dDebut, 
      dateFin: dFin,
      ville, 
      domaine, 
      typeContribution, 
      missionType: activeTab,
      budget,
      duree,
    };

    if (onSearch) {
      onSearch(filters);
    }

    // Prepare query string
    const params = new URLSearchParams();
    if (dDebut) params.set('dateDebut', dDebut);
    if (dFin) params.set('dateFin', dFin);
    if (ville) params.set('ville', ville);
    if (domaine) params.set('domaine', domaine);
    if (typeContribution.length > 0) params.set('typeContribution', typeContribution.join(','));
    if (activeTab !== 'all') params.set('missionType', activeTab);
    if (budget) params.set('budget', budget);
    if (duree) params.set('duree', duree);

    router.push(`/missions?${params.toString()}`);
  };
  
  const handleTabChange = (tab: MissionTab) => {
    setActiveTab(tab);
    // Reset fields when changing tabs
    setDateRange(undefined);
    setVille('');
    setDomaine('');
    setTypeContribution([]);
    setBudget('');
    setDuree('');
  };
  
  const tabs = [
    { id: 'all' as MissionTab, label: currentLocale === 'en' ? 'All missions' : 'Toutes les missions', icon: <Globe className="w-4 h-4" strokeWidth={2} /> },
    { id: 'remote' as MissionTab, label: currentLocale === 'en' ? 'Remote missions' : 'Missions à distance', icon: <MapPin className="w-4 h-4" strokeWidth={2} /> },
    { id: 'invest' as MissionTab, label: currentLocale === 'en' ? 'Invest' : 'Investir', icon: <TrendingUp className="w-4 h-4" strokeWidth={2} /> },
    { id: 'volunteer' as MissionTab, label: currentLocale === 'en' ? 'Get involved' : "S'investir", icon: <Heart className="w-4 h-4" strokeWidth={2} /> },
  ];

  return (
    <CardWithColorfulBorder className="max-w-[1400px] mx-auto">
      {/* Tab Navigation with Icons */}
      <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${ 
              activeTab === tab.id
                ? 'text-white shadow-md'
                : 'bg-white text-neutral-600 hover:bg-neutral-50'
            }`}
            style={{
              fontWeight: activeTab === tab.id ? 600 : 500,
              backgroundColor: activeTab === tab.id ? '#187A58' : 'transparent',
            }}
          >
            {tab.icon}
            <span className="whitespace-nowrap">{tab.label}</span>
          </button>
        ))}
      </div>
      
      {/* Search Fields - Dynamic based on active tab */}
      <div className={`grid grid-cols-1 ${activeTab === 'all' ? 'md:grid-cols-4' : 'md:grid-cols-5'} gap-4 items-end`}>
        
        {/* Toutes les missions */}
        {activeTab === 'all' && (
          <>
            {/* Date de séjour au Cameroun */}
            <DatePickerWithRange 
              date={dateRange} 
              setDate={setDateRange} 
              label={currentLocale === 'en' ? "Stay in Cameroon dates" : "Date de séjour au Cameroun"} 
              className="md:col-span-1"
            />

            {/* Ville(s) d'engagement */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2" style={{ fontSize: '14px', fontWeight: 500, color: '#187A58' }}>
                <MapPin className="w-4 h-4" strokeWidth={2} style={{ color: '#EE0003' }} />
                {currentLocale === 'en' ? 'Target city' : "Ville(s) d'engagement"}
              </label>
              <select
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                className="h-12 px-3 py-3 bg-white border border-neutral-300 rounded-lg text-neutral-800 focus:border-[#187A58] focus:outline-none transition-all appearance-none cursor-pointer"
                style={{ fontSize: '14px', fontWeight: 400 }}
              >
                <option value="">{currentLocale === 'en' ? 'Select a city' : 'Sélectionnez une ville'}</option>
                {cities.map((city) => (
                  <option key={city} value={city.toLowerCase()}>{city}</option>
                ))}
              </select>
            </div>

            {/* Domaine(s) d'action */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2" style={{ fontSize: '14px', fontWeight: 500, color: '#187A58' }}>
                <Briefcase className="w-4 h-4" strokeWidth={2} style={{ color: '#F7BB10' }} />
                {currentLocale === 'en' ? 'Field of action' : "Domaine(s) d'action"}
              </label>
              <select
                value={domaine}
                onChange={(e) => setDomaine(e.target.value)}
                className="h-12 px-3 py-3 bg-white border border-neutral-300 rounded-lg text-neutral-800 focus:border-[#187A58] focus:outline-none transition-all appearance-none cursor-pointer"
                style={{ fontSize: '14px', fontWeight: 400 }}
              >
                <option value="">{currentLocale === 'en' ? 'Select a field' : 'Sélectionnez un domaine'}</option>
                {activeDomains.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            {/* Type(s) de contribution */}
            <SimplifiedMultiSelect
              label={currentLocale === 'en' ? 'Type of contribution' : "Type(s) de contribution"}
              icon={<Heart className="w-4 h-4" strokeWidth={2} style={{ color: '#EE0003' }} />}
              categories={contributionCategoriesList}
              selectedIds={typeContribution}
              onChange={setTypeContribution}
              placeholder={tCommon('search')}
            />
          </>
        )}
        
        {/* Missions à distance */}
        {activeTab === 'remote' && (
          <>
            {/* Ville(s) d'engagement */}
            <div className="flex flex-col gap-2">
              <label className="text-neutral-800 flex items-center gap-2" style={{ fontSize: '14px', fontWeight: 500 }}>
                <MapPin className="w-4 h-4 text-primary" strokeWidth={2} />
                Ville(s) d'engagement*
              </label>
              <select
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                className="h-12 px-3 py-3 bg-neutral-50 border-2 border-neutral-300 rounded-lg text-neutral-800 focus:border-2 focus:border-accent-yellow focus:outline-none transition-all appearance-none cursor-pointer"
                style={{ fontSize: '16px', fontWeight: 400 }}
              >
                <option value="">Sélectionnez une ville</option>
                {cities.map((city) => (
                  <option key={city} value={city.toLowerCase()}>{city}</option>
                ))}
              </select>
            </div>

            {/* Domaine(s) d'action */}
            <div className="flex flex-col gap-2">
              <label className="text-neutral-800 flex items-center gap-2" style={{ fontSize: '14px', fontWeight: 500 }}>
                <Briefcase className="w-4 h-4 text-primary" strokeWidth={2} />
                Domaine(s) d'action*
              </label>
              <select
                value={domaine}
                onChange={(e) => setDomaine(e.target.value)}
                className="h-12 px-3 py-3 bg-neutral-50 border-2 border-neutral-300 rounded-lg text-neutral-800 focus:border-2 focus:border-accent-yellow focus:outline-none transition-all appearance-none cursor-pointer"
                style={{ fontSize: '16px', fontWeight: 400 }}
              >
                <option value="">Sélectionnez un domaine</option>
                {activeDomains.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            {/* Type(s) de contribution */}
            <SimplifiedMultiSelect
              label="Type(s) de contribution"
              icon={<Users className="w-4 h-4 text-primary" strokeWidth={2} />}
              categories={contributionCategoriesList}
              selectedIds={typeContribution}
              onChange={setTypeContribution}
              placeholder="Sélectionnez..."
            />

            {/* Mission à distance - LOCKED */}
            <div className="flex flex-col gap-2">
              <label className="text-neutral-800 flex items-center gap-2" style={{ fontSize: '14px', fontWeight: 500 }}>
                <Globe className="w-4 h-4 text-primary" strokeWidth={2} />
                Type de mission
              </label>
              <div className="h-12 px-4 bg-neutral-100 border-2 border-neutral-200 rounded-lg flex items-center gap-3 cursor-not-allowed opacity-80">
                <div className="w-5 h-5 rounded border-2 bg-primary border-primary flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                </div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#003A54' }}>Mission à distance</span>
              </div>
            </div>
          </>
        )}
        
        {/* Investir */}
        {activeTab === 'invest' && (
          <>
            {/* Date de séjour au Cameroun */}
            <DatePickerWithRange 
              date={dateRange} 
              setDate={setDateRange} 
              label="Date de séjour au Cameroun" 
            />

            {/* Ville(s) d'engagement */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2" style={{ fontSize: '14px', fontWeight: 500, color: '#187A58' }}>
                <MapPin className="w-4 h-4" strokeWidth={2} style={{ color: '#EE0003' }} />
                Ville(s) d'engagement
              </label>
              <select
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                className="h-12 px-3 py-3 bg-white border border-neutral-300 rounded-lg text-neutral-800 focus:border-[#187A58] focus:outline-none transition-all appearance-none cursor-pointer"
                style={{ fontSize: '14px', fontWeight: 400 }}
              >
                <option value="">Sélectionnez une ville</option>
                {cities.map((city) => (
                  <option key={city} value={city.toLowerCase()}>{city}</option>
                ))}
              </select>
            </div>

            {/* Nature de l'investissement */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2" style={{ fontSize: '14px', fontWeight: 500, color: '#187A58' }}>
                <Briefcase className="w-4 h-4" strokeWidth={2} style={{ color: '#F7BB10' }} />
                Nature de l'investissement
              </label>
              <select
                value={domaine}
                onChange={(e) => setDomaine(e.target.value)}
                className="h-12 px-3 py-3 bg-white border border-neutral-300 rounded-lg text-neutral-800 focus:border-[#187A58] focus:outline-none transition-all appearance-none cursor-pointer"
                style={{ fontSize: '14px', fontWeight: 400 }}
              >
                <option value="">Sélectionnez</option>
                {activeInvestmentTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </>
        )}
        
        {/* S'investir */}
        {activeTab === 'volunteer' && (
          <>
            {/* Date de séjour au Cameroun */}
            <DatePickerWithRange 
              date={dateRange} 
              setDate={setDateRange} 
              label="Date de séjour au Cameroun" 
            />

            {/* Ville(s) d'engagement */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2" style={{ fontSize: '14px', fontWeight: 500, color: '#187A58' }}>
                <MapPin className="w-4 h-4" strokeWidth={2} style={{ color: '#EE0003' }} />
                Ville(s) d'engagement*
              </label>
              <select
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                className="h-12 px-3 py-3 bg-white border border-neutral-300 rounded-lg text-neutral-800 focus:border-[#187A58] focus:outline-none transition-all appearance-none cursor-pointer"
                style={{ fontSize: '14px', fontWeight: 400 }}
              >
                <option value="">Sélectionnez une ville</option>
                {cities.map((city) => (
                  <option key={city} value={city.toLowerCase()}>{city}</option>
                ))}
              </select>
            </div>

            {/* Domaine(s) d'action */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2" style={{ fontSize: '14px', fontWeight: 500, color: '#187A58' }}>
                <Briefcase className="w-4 h-4" strokeWidth={2} style={{ color: '#F7BB10' }} />
                Domaine(s) d'action*
              </label>
              <select
                value={domaine}
                onChange={(e) => setDomaine(e.target.value)}
                className="h-12 px-3 py-3 bg-white border border-neutral-300 rounded-lg text-neutral-800 focus:border-[#187A58] focus:outline-none transition-all appearance-none cursor-pointer"
                style={{ fontSize: '14px', fontWeight: 400 }}
              >
                <option value="">Sélectionnez un domaine</option>
                {activeDomains.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            {/* Type(s) de contribution */}
            <SimplifiedMultiSelect
              label="Type(s) de contribution"
              icon={<Users className="w-4 h-4 text-primary" strokeWidth={2} />}
              categories={contributionCategoriesList}
              selectedIds={typeContribution}
              onChange={setTypeContribution}
              placeholder="Sélectionnez..."
            />
          </>
        )}
      </div>
      
      {/* Action Buttons Section - Inside the Card */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-8 pt-6 border-t-2 border-neutral-200">
        {/* Bouton Soumettre votre profil - White with Border */}
        <Link 
          href="/soumettre-profil"
          className="w-full sm:w-auto px-8 py-3 bg-white rounded-lg border-2 hover:bg-neutral-50 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
          style={{ fontSize: '15px', fontWeight: 600, color: '#003A54', borderColor: '#D1D5DB' }}
        >
          {tNav('submit_profile')}
        </Link>

        {/* Bouton Proposer un projet - Yellow Border */}
        <Link 
          href="/soumettre-projet"
          className="w-full sm:w-auto px-8 py-3 bg-white rounded-lg border-2 hover:bg-yellow-50 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
          style={{ fontSize: '15px', fontWeight: 600, color: '#003A54', borderColor: '#F7BB10' }}
        >
          {tNav('submit_project')}
        </Link>

        {/* Bouton Trouver une mission - Primary Green */}
        <button
            onClick={handleSearch}
            className="w-full sm:w-auto px-8 py-3 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            style={{ fontSize: '15px', fontWeight: 600, backgroundColor: '#187A58' }}
        >
            <Search className="w-5 h-5" strokeWidth={2} />
            {t('search_cta')}
        </button>
      </div>
    </CardWithColorfulBorder>
  );
}