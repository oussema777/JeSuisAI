'use client';
import React, { useState } from 'react';
import { Search, Calendar, MapPin, Briefcase, Users, DollarSign, Clock, Target, Globe, TrendingUp, Heart, Flag } from 'lucide-react';
import { Bouton } from '../ds/Bouton';
import { MultiSelectCheckbox } from '../ds/MultiSelectCheckbox';

interface BarreRechercheProps {
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

// Taxonomie complète des types de contribution
const contributionCategories = [
  {
    id: 'investissement',
    label: '1. Investissement',
    subCategories: [
      { id: 'creation-entreprise', label: 'Création entreprise' },
      { id: 'prise-participation', label: 'Prise de participation directe' },
      { id: 'immobilier', label: 'Immobilier' },
      { id: 'epargne-bancaire', label: 'Épargne bancaire' },
    ],
  },
  {
    id: 'competences',
    label: '2. Compétences',
    subCategories: [
      { id: 'formation-coaching', label: 'Formation & coaching' },
      { id: 'avis-technique', label: 'Avis technique' },
      { id: 'etudes-production', label: 'Études & production technique' },
      { id: 'mentorat', label: 'Mentorat' },
      { id: 'consultation-medicale', label: 'Consultation médicale' },
    ],
  },
  {
    id: 'dons',
    label: '3. Dons',
    subCategories: [
      { id: 'dons-financiers', label: 'Dons financiers' },
      { id: 'dons-materiels', label: 'Dons en matériels' },
    ],
  },
  {
    id: 'reseaux-influence',
    label: '4. Réseaux & influence',
    subCategories: [
      { id: 'conferences', label: 'Participation conférences' },
      { id: 'ambassadeurs', label: 'Missions ambassadeurs' },
      { id: 'recherche-partenaires', label: 'Recherche de partenaires' },
      { id: 'relations-medias', label: 'Relations médias' },
    ],
  },
  {
    id: 'achats-tourisme',
    label: '5. Achats & tourisme solidaires',
    subCategories: [
      { id: 'achats-locaux', label: 'Achats produits locaux' },
      { id: 'tourisme-local', label: 'Tourisme local' },
      { id: 'sponsoring', label: 'Sponsoring événements' },
    ],
  },
];

export function BarreRecherche({ onSearch }: BarreRechercheProps = {}) {
  const [dateDebut, setDateDebut] = useState('');
  const [ville, setVille] = useState('');
  const [domaine, setDomaine] = useState('');
  const [typeContribution, setTypeContribution] = useState<string[]>([]);
  const [budget, setBudget] = useState('');
  const [duree, setDuree] = useState('');
  const [activeTab, setActiveTab] = useState<MissionTab>('all');

  const handleSearch = () => {
    if (onSearch) {
      onSearch({ 
        dateDebut, 
        ville, 
        domaine, 
        typeContribution, 
        missionType: activeTab,
        budget,
        duree,
      });
    }
  };
  
  const handleTabChange = (tab: MissionTab) => {
    setActiveTab(tab);
    // Reset fields when changing tabs
    setDateDebut('');
    setVille('');
    setDomaine('');
    setTypeContribution([]);
    setBudget('');
    setDuree('');
  };
  
  const tabs = [
    { id: 'all' as MissionTab, label: 'Toutes les missions' },
    { id: 'remote' as MissionTab, label: 'Missions à distance' },
    { id: 'invest' as MissionTab, label: 'Investir' },
    { id: 'volunteer' as MissionTab, label: "S'investir" },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-xl p-6 shadow-[0px_4px_16px_rgba(0,0,0,0.12)]">
      {/* Tab Navigation - Inside the container */}
      <div className="flex flex-wrap gap-2 mb-6 pb-5 border-b border-neutral-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-5 py-2.5 rounded-lg border transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white text-bg-base border-[#E6EEF2] hover:bg-neutral-50 hover:border-primary/30'
            }`}
            style={{
              fontSize: '14px',
              fontWeight: activeTab === tab.id ? 600 : 500,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Search Fields - Dynamic based on active tab */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        
        {/* Toutes les missions */}
        {activeTab === 'all' && (
          <>
            {/* Date de séjour */}
            <div className="flex flex-col gap-2">
              <label className="text-neutral-800 flex items-center gap-2" style={{ fontSize: '14px', fontWeight: 500 }}>
                <Calendar className="w-4 h-4 text-primary" strokeWidth={2} />
                Date de séjour
              </label>
              <input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="h-12 px-3 py-3 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-800 focus:border-2 focus:border-primary focus:outline-none transition-all"
                style={{ fontSize: '16px', fontWeight: 400 }}
              />
            </div>

            {/* Ville */}
            <div className="flex flex-col gap-2">
              <label className="text-neutral-800 flex items-center gap-2" style={{ fontSize: '14px', fontWeight: 500 }}>
                <MapPin className="w-4 h-4 text-primary" strokeWidth={2} />
                Votre ville
              </label>
              <select
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                className="h-12 px-3 py-3 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-800 focus:border-2 focus:border-primary focus:outline-none transition-all appearance-none cursor-pointer"
                style={{ fontSize: '16px', fontWeight: 400 }}
              >
                <option value="">Votre ville</option>
                <option value="yaounde">Yaoundé</option>
                <option value="douala">Douala</option>
                <option value="bafoussam">Bafoussam</option>
                <option value="garoua">Garoua</option>
                <option value="bamenda">Bamenda</option>
                <option value="maroua">Maroua</option>
                <option value="limbe">Limbé</option>
              </select>
            </div>

            {/* Domaine d'action */}
            <div className="flex flex-col gap-2">
              <label className="text-neutral-800 flex items-center gap-2" style={{ fontSize: '14px', fontWeight: 500 }}>
                <Briefcase className="w-4 h-4 text-primary" strokeWidth={2} />
                Domaine d'action
              </label>
              <select
                value={domaine}
                onChange={(e) => setDomaine(e.target.value)}
                className="h-12 px-3 py-3 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-800 focus:border-2 focus:border-primary focus:outline-none transition-all appearance-none cursor-pointer"
                style={{ fontSize: '16px', fontWeight: 400 }}
              >
                <option value="">Domaine d&apos;action</option>
                <option value="sante">Santé</option>
                <option value="education">Éducation</option>
                <option value="agriculture">Agriculture</option>
                <option value="infrastructure">Infrastructures</option>
                <option value="economie">Économie locale</option>
                <option value="jeunesse">Jeunesse</option>
                <option value="formation">Formation</option>
              </select>
            </div>

            {/* Type de contribution */}
            <MultiSelectCheckbox
              label="Type de contribution"
              icon={<Users className="w-4 h-4 text-primary" strokeWidth={2} />}
              categories={contributionCategories}
              selectedIds={typeContribution}
              onChange={setTypeContribution}
              placeholder="Sélectionnez..."
            />
          </>
        )}
        
        {/* Missions à distance */}
        {activeTab === 'remote' && (
          <>
            {/* Domaine d'action */}
            <div className="flex flex-col gap-2">
              <label className="text-neutral-800 flex items-center gap-2" style={{ fontSize: '14px', fontWeight: 500 }}>
                <Briefcase className="w-4 h-4 text-primary" strokeWidth={2} />
                Domaine d'action
              </label>
              <select
                value={domaine}
                onChange={(e) => setDomaine(e.target.value)}
                className="h-12 px-3 py-3 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-800 focus:border-2 focus:border-primary focus:outline-none transition-all appearance-none cursor-pointer"
                style={{ fontSize: '16px', fontWeight: 400 }}
              >
                <option value="">Domaine d&apos;action</option>
                <option value="sante">Santé</option>
                <option value="education">Éducation</option>
                <option value="agriculture">Agriculture</option>
                <option value="infrastructure">Infrastructures</option>
                <option value="economie">Économie locale</option>
                <option value="jeunesse">Jeunesse</option>
                <option value="formation">Formation</option>
              </select>
            </div>

            {/* Type de contribution */}
            <MultiSelectCheckbox
              label="Type de contribution"
              icon={<Users className="w-4 h-4 text-primary" strokeWidth={2} />}
              categories={contributionCategories}
              selectedIds={typeContribution}
              onChange={setTypeContribution}
              placeholder="Sélectionnez..."
            />

            {/* Durée d'engagement */}
            <div className="flex flex-col gap-2">
              <label className="text-neutral-800 flex items-center gap-2" style={{ fontSize: '14px', fontWeight: 500 }}>
                <Clock className="w-4 h-4 text-primary" strokeWidth={2} />
                Durée d'engagement
              </label>
              <select
                value={duree}
                onChange={(e) => setDuree(e.target.value)}
                className="h-12 px-3 py-3 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-800 focus:border-2 focus:border-primary focus:outline-none transition-all appearance-none cursor-pointer"
                style={{ fontSize: '16px', fontWeight: 400 }}
              >
                <option value="">Durée d&apos;engagement</option>
                <option value="ponctuel">Ponctuel (1-2 semaines)</option>
                <option value="court">Court terme (1-3 mois)</option>
                <option value="moyen">Moyen terme (3-6 mois)</option>
                <option value="long">Long terme (6+ mois)</option>
              </select>
            </div>

            {/* Région */}
            <div className="flex flex-col gap-2">
              <label className="text-neutral-800 flex items-center gap-2" style={{ fontSize: '14px', fontWeight: 500 }}>
                <MapPin className="w-4 h-4 text-primary" strokeWidth={2} />
                Région
              </label>
              <select
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                className="h-12 px-3 py-3 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-800 focus:border-2 focus:border-primary focus:outline-none transition-all appearance-none cursor-pointer"
                style={{ fontSize: '16px', fontWeight: 400 }}
              >
                <option value="">Toutes les régions</option>
                <option value="littoral">Littoral</option>
                <option value="centre">Centre</option>
                <option value="ouest">Ouest</option>
                <option value="nord">Nord</option>
              </select>
            </div>
          </>
        )}
        
        {/* Investir */}
        {activeTab === 'invest' && (
          <>
            {/* Secteur d'investissement */}
            <div className="flex flex-col gap-2">
              <label className="text-neutral-800 flex items-center gap-2" style={{ fontSize: '14px', fontWeight: 500 }}>
                <Target className="w-4 h-4 text-primary" strokeWidth={2} />
                Secteur d'investissement
              </label>
              <select
                value={domaine}
                onChange={(e) => setDomaine(e.target.value)}
                className="h-12 px-3 py-3 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-800 focus:border-2 focus:border-primary focus:outline-none transition-all appearance-none cursor-pointer"
                style={{ fontSize: '16px', fontWeight: 400 }}
              >
                <option value="">Secteur d&apos;investissement</option>
                <option value="infrastructure">Infrastructures</option>
                <option value="immobilier">Immobilier</option>
                <option value="agriculture">Agro-industrie</option>
                <option value="energie">Énergie</option>
                <option value="technologie">Technologies</option>
                <option value="tourisme">Tourisme</option>
                <option value="sante">Santé privée</option>
              </select>
            </div>

            {/* Budget d'investissement */}
            <div className="flex flex-col gap-2">
              <label className="text-neutral-800 flex items-center gap-2" style={{ fontSize: '14px', fontWeight: 500 }}>
                <DollarSign className="w-4 h-4 text-primary" strokeWidth={2} />
                Budget d'investissement
              </label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="h-12 px-3 py-3 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-800 focus:border-2 focus:border-primary focus:outline-none transition-all appearance-none cursor-pointer"
                style={{ fontSize: '16px', fontWeight: 400 }}
              >
                <option value="">Budget d&apos;investissement</option>
                <option value="0-50k">Moins de 50 000 €</option>
                <option value="50k-100k">50 000 - 100 000 €</option>
                <option value="100k-500k">100 000 - 500 000 €</option>
                <option value="500k-1m">500 000 € - 1 M€</option>
                <option value="1m+">Plus de 1 M€</option>
              </select>
            </div>

            {/* Ville */}
            <div className="flex flex-col gap-2">
              <label className="text-neutral-800 flex items-center gap-2" style={{ fontSize: '14px', fontWeight: 500 }}>
                <MapPin className="w-4 h-4 text-primary" strokeWidth={2} />
                Ville
              </label>
              <select
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                className="h-12 px-3 py-3 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-800 focus:border-2 focus:border-primary focus:outline-none transition-all appearance-none cursor-pointer"
                style={{ fontSize: '16px', fontWeight: 400 }}
              >
                <option value="">Toutes les villes</option>
                <option value="yaounde">Yaoundé</option>
                <option value="douala">Douala</option>
                <option value="bafoussam">Bafoussam</option>
                <option value="garoua">Garoua</option>
                <option value="bamenda">Bamenda</option>
              </select>
            </div>

            {/* Type d'investissement */}
            <div className="flex flex-col gap-2">
              <label className="text-neutral-800 flex items-center gap-2" style={{ fontSize: '14px', fontWeight: 500 }}>
                <Briefcase className="w-4 h-4 text-primary" strokeWidth={2} />
                Type d'investissement
              </label>
              <select
                value={typeContribution[0] || ''}
                onChange={(e) => setTypeContribution(e.target.value ? [e.target.value] : [])}
                className="h-12 px-3 py-3 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-800 focus:border-2 focus:border-primary focus:outline-none transition-all appearance-none cursor-pointer"
                style={{ fontSize: '16px', fontWeight: 400 }}
              >
                <option value="">Type d&apos;investissement</option>
                <option value="direct">Investissement direct</option>
                <option value="partenariat">Partenariat public-privé</option>
                <option value="participation">Prise de participation</option>
                <option value="pret">Prêt participatif</option>
              </select>
            </div>
          </>
        )}
        
        {/* S'investir */}
        {activeTab === 'volunteer' && (
          <>
            {/* Date de disponibilité */}
            <div className="flex flex-col gap-2">
              <label className="text-neutral-800 flex items-center gap-2" style={{ fontSize: '14px', fontWeight: 500 }}>
                <Calendar className="w-4 h-4 text-primary" strokeWidth={2} />
                Date de disponibilité
              </label>
              <input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="h-12 px-3 py-3 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-800 focus:border-2 focus:border-primary focus:outline-none transition-all"
                style={{ fontSize: '16px', fontWeight: 400 }}
              />
            </div>

            {/* Ville */}
            <div className="flex flex-col gap-2">
              <label className="text-neutral-800 flex items-center gap-2" style={{ fontSize: '14px', fontWeight: 500 }}>
                <MapPin className="w-4 h-4 text-primary" strokeWidth={2} />
                Ville
              </label>
              <select
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                className="h-12 px-3 py-3 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-800 focus:border-2 focus:border-primary focus:outline-none transition-all appearance-none cursor-pointer"
                style={{ fontSize: '16px', fontWeight: 400 }}
              >
                <option value="">Toutes les villes</option>
                <option value="yaounde">Yaoundé</option>
                <option value="douala">Douala</option>
                <option value="bafoussam">Bafoussam</option>
                <option value="garoua">Garoua</option>
                <option value="bamenda">Bamenda</option>
              </select>
            </div>

            {/* Domaine d'action */}
            <div className="flex flex-col gap-2">
              <label className="text-neutral-800 flex items-center gap-2" style={{ fontSize: '14px', fontWeight: 500 }}>
                <Briefcase className="w-4 h-4 text-primary" strokeWidth={2} />
                Domaine d'action
              </label>
              <select
                value={domaine}
                onChange={(e) => setDomaine(e.target.value)}
                className="h-12 px-3 py-3 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-800 focus:border-2 focus:border-primary focus:outline-none transition-all appearance-none cursor-pointer"
                style={{ fontSize: '16px', fontWeight: 400 }}
              >
                <option value="">Domaine d&apos;action</option>
                <option value="education">Éducation</option>
                <option value="sante">Santé communautaire</option>
                <option value="jeunesse">Jeunesse et sports</option>
                <option value="environnement">Environnement</option>
                <option value="culture">Culture et patrimoine</option>
                <option value="social">Action sociale</option>
              </select>
            </div>

            {/* Durée d'engagement */}
            <div className="flex flex-col gap-2">
              <label className="text-neutral-800 flex items-center gap-2" style={{ fontSize: '14px', fontWeight: 500 }}>
                <Clock className="w-4 h-4 text-primary" strokeWidth={2} />
                Durée d'engagement
              </label>
              <select
                value={duree}
                onChange={(e) => setDuree(e.target.value)}
                className="h-12 px-3 py-3 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-800 focus:border-2 focus:border-primary focus:outline-none transition-all appearance-none cursor-pointer"
                style={{ fontSize: '16px', fontWeight: 400 }}
              >
                <option value="">Durée d&apos;engagement</option>
                <option value="weekend">Weekend / Court séjour</option>
                <option value="1-2sem">1-2 semaines</option>
                <option value="1mois">1 mois</option>
                <option value="3mois">3 mois</option>
                <option value="6mois+">6 mois ou plus</option>
              </select>
            </div>
          </>
        )}

        {/* Bouton - Always present */}
        <div className="flex items-end">
          <Bouton 
            variant="primaire" 
            size="moyen" 
            fullWidth 
            icon={<Search className="w-5 h-5" strokeWidth={2} />}
            className="whitespace-nowrap"
            onClick={handleSearch}
          >
            Trouver
          </Bouton>
        </div>
      </div>
    </div>
  );
}