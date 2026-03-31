'use client';

import React, { useState, useEffect } from 'react';
import { SidebarSuperadmin } from '@/app/components/superadmin/Sidebarsuperadmin';
import { HeaderSuperadmin } from '@/app/components/superadmin/HeaderSuperadmin';
import { 
  Save, 
  Loader2, 
  Image as ImageIcon, 
  Type, 
  Layout,
  AlertCircle,
  Plus,
  Trash2,
  List,
  MessageSquare,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Languages
} from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';

interface PremiereVisiteContent {
  hero: {
    title: string;
    subtitle: string;
    stats: Array<{ label: string; value: string }>;
  };
  pourquoi: {
    title: string;
    image: string;
    paragraphs: string[];
  };
  defis: {
    items: string[];
  };
  champs: string[];
  types: Array<{
    title: string;
    items: string[];
  }>;
  temoignages: Array<{
    id: string;
    type: 'contributeur' | 'maire';
    name: string;
    role: string;
    content: string;
    avatar: string;
    emoji: string;
  }>;
  faq: Array<{
    question: string;
    answer: string;
  }>;
}

const DEFAULT_CONTENT: PremiereVisiteContent = {
  hero: {
    title: "Connecter la diaspora au développement du Cameroun !",
    subtitle: "La première plateforme qui facilite l'engagement citoyen et canalise les compétences de la diaspora vers des projets concrets au service du développement local.",
    stats: [
      { label: "villes membres", value: "14" },
      { label: "Organisations partenaires", value: "10" },
      { label: "Types de missions", value: "45" },
      { label: "actions en cours", value: "246" }
    ]
  },
  pourquoi: {
    title: "Pour les Camerounais de l'étranger qui n'oublient pas d'où ils viennent…",
    image: "https://jesuisaupays.com/wp-content/uploads/2025/12/Photo1.jpg",
    paragraphs: [
      "Chaque année, plus d'un million de Camerounais du monde retournent en vacances au pays. Beaucoup en profitent pour soutenir leurs familles, leurs villes et leurs communautés par différentes actions : aides matérielles directes, conseils & formations, bénévolat associatif, consultations médicales gratuites...",
      "Ces actions solidaires sont souvent spontanées et mériteraient d'être mieux accompagnées et renforcées, avec le soutien des mairies, ONG et entreprises. Pour ces derniers, cette période est une actions unique pour créer des liens durables et construire des projets d'avenir avec la diaspora, un partenaire clé du développement local.",
      "Jesuisaucameroun.com est née avec cette ambition claire : transformer ces élans de solidarité en actions plus fortes et structurées, en lien avec les mairies, ONG et entreprises locales.",
      "Notre catalogue propose 14 champs d'action et 35 types de contributions possibles, allant de l'investissement et l'épargne, aux compétences, dons, réseaux d'influence, et tourisme solidaire."
    ]
  },
  defis: {
    items: [
      "Sélection des acteurs et des missions",
      "Diversité des actions proposées",
      "Filtres de recherche optimisés",
      "Interlocuteur « diaspora » dédié et formé (chez chacun de nos membres)",
      "Suivi qualité",
      "Charte éthique"
    ]
  },
  champs: [
    "Investissement", "Santé", "Lutte contre la pauvreté", "Soutien à la société civile (femmes, jeunes…)",
    "Infrastructures et urbanisme", "Environnement et propreté", "Education et enfance", "Innovation",
    "Recrutement et formation professionnelle", "Tourisme", "Culture et patrimoine", "Rayonnement international",
    "Droits et citoyenneté", "Urgences humanitaires (catastrophe naturelle…)"
  ],
  types: [
    {
      title: "Investissement",
      items: ["Création entreprise", "Prise de participation directe", "Prise de participation dans fonds d'investissement", "Immobilier"]
    },
    {
      title: "Épargne",
      items: ["Épargne bancaire", "Diaspora bond", "Tontine"]
    },
    {
      title: "Compétences",
      items: ["Formation & coaching", "Avis technique", "Études & production technique (ou organisation)", "Mentorat", "Offres d'emploi", "Consultation médicale", "Stage", "Participation conférence & évnement"]
    },
    {
      title: "Dons",
      items: ["Dons financiers", "Dons en matériels", "Mécénat (Patrimoine…)"]
    },
    {
      title: "Réseaux & influence",
      items: ["Mission Ambassadeurs", "Mise en relation with partenaires (ou prestataires)", "Diplomatie économique", "Relations médias international", "Influence auprès de la diaspora", "Rencontre avec officiels à l'étranger", "Participation conférence & événement", "Soutien à l'export"]
    },
    {
      title: "Achats & tourisme solidaires",
      items: ["Achats locaux (artisanat, produits locaux…)", "Tourisme local", "Sponsoring d'événements locaux"]
    }
  ],
  temoignages: [
    {
      id: "1",
      type: 'contributeur',
      name: "Dr. Marie Tankou",
      role: "Médecin, Paris",
      content: "Grâce à cette plateforme, j'ai pu contribuer à la construction d'un centre de santé dans mon village natal. Une expérience enrichissante qui a changé des vies.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop",
      emoji: "🏥"
    },
    {
      id: "2",
      type: 'maire',
      name: "M. Paul Mbarga",
      role: "Maire de Douala",
      content: "La diaspora apporte une expertise précieuse et des ressources qui nous manquent. Cette collaboration a permis de lancer 12 projets structurants en 2 ans.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      emoji: "🤝"
    },
    {
      id: "3",
      type: 'contributeur',
      name: "Jean-Claude Fotso",
      role: "Entrepreneur, Montréal",
      content: "J'ai trouvé ici une façon concrète de redonner à ma communauté. Le mentorat que j'offre aux jeunes entrepreneurs a déjà créé 15 emplois.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      emoji: "💡"
    }
  ],
  faq: [
    {
      question: "Qui est à l'origine de cette plateforme ?",
      answer: "Jesuisaucameroun.com est le fruit d'un partenariat innovant entre l'Association des Maires de Villes du Cameroun (AMVC), les aéroports et la startup Impact Diaspora (www.impactdiaspora.fr) basée en France et Séngal."
    },
    {
      question: "Qu'est-ce que jesuisaucameroun.com ?",
      answer: "jesuisaucameroun.com fait partie intégrante de la marketplace panafricaine (jesuisaupays.com) où les villes, entreprises et ONG africaines sollicitent la diaspora pour leurs besoins en développement."
    }
  ]
};

export default function PremiereVisiteManagement() {
  const params = useParams();
  const [currentLocale, setCurrentLocale] = useState(params.locale as string || 'fr');
  const [content, setContent] = useState<PremiereVisiteContent>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    fetchContent();
  }, [currentLocale]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('static_contents')
        .select('content')
        .eq('key', 'premiere-visite')
        .eq('lang', currentLocale)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data && data.content) {
        setContent(data.content as PremiereVisiteContent);
      } else {
        setContent(DEFAULT_CONTENT);
      }
    } catch (err) {
      console.error('Error fetching content:', err);
      toast.error('Erreur lors du chargement des contenus');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('static_contents')
        .upsert({
          key: 'premiere-visite',
          lang: currentLocale,
          title: `Page Première Visite (${currentLocale.toUpperCase()})`,
          content: content,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Supabase error:', error);
        toast.error(`Erreur database: ${error.message}`);
        return;
      }
      toast.success(`Contenu (${currentLocale.toUpperCase()}) mis à jour avec succès`);
    } catch (err: any) {
      console.error('Error saving content:', err);
      toast.error(`Erreur: ${err.message || "Erreur d'enregistrement"}`);
    } finally {
      setSaving(false);
    }
  };

  const SectionHeader = ({ id, title, icon: Icon }: { id: string, title: string, icon: any }) => (
    <button 
      onClick={() => toggleSection(id)}
      className="w-full px-6 py-4 bg-white border border-neutral-200 shadow-sm rounded-xl flex items-center justify-between hover:bg-neutral-50 transition-all mb-4"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${openSections[id] ? 'bg-primary/10 text-primary' : 'bg-neutral-100 text-neutral-500'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h2 className={`font-bold ${openSections[id] ? 'text-primary' : 'text-neutral-900'}`}>{title}</h2>
      </div>
      {openSections[id] ? <ChevronUp className="text-neutral-400" /> : <ChevronDown className="text-neutral-400" />}
    </button>
  );

  // Update helpers
  const updateHero = (field: string, value: any) => {
    setContent(prev => ({ ...prev, hero: { ...prev.hero, [field]: value } }));
  };

  const updateStat = (index: number, field: string, value: string) => {
    const newStats = [...content.hero.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    updateHero('stats', newStats);
  };

  const updatePourquoi = (field: string, value: any) => {
    setContent(prev => ({ ...prev, pourquoi: { ...prev.pourquoi, [field]: value } }));
  };

  const updateParagraph = (index: number, value: string) => {
    const newParagraphs = [...content.pourquoi.paragraphs];
    newParagraphs[index] = value;
    updatePourquoi('paragraphs', newParagraphs);
  };

  const updateChamps = (index: number, value: string) => {
    const newChamps = [...content.champs];
    newChamps[index] = value;
    setContent(prev => ({ ...prev, champs: newChamps }));
  };

  const updateTypeItem = (typeIndex: number, itemIndex: number, value: string) => {
    const newTypes = [...content.types];
    newTypes[typeIndex].items[itemIndex] = value;
    setContent(prev => ({ ...prev, types: newTypes }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-page-bg flex">
        <SidebarSuperadmin activePage="contenus-statiques" activeSubPage="premiere-visite" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-bg flex">
      <SidebarSuperadmin activePage="contenus-statiques" activeSubPage="premiere-visite" />
      
      <main className="flex-1 ml-[260px] p-8 mt-16 lg:mt-0">
        <HeaderSuperadmin pageTitle="Configuration Première Visite" />
        
        <div className="flex items-center justify-between mb-8 mt-8 lg:mt-[72px]">
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-xl border border-neutral-200 p-1 flex gap-1 shadow-sm">
                              <button 
                                onClick={() => setCurrentLocale('fr')}
                                className={`px-6 py-2 rounded-lg text-lg transition-all ${currentLocale === 'fr' ? 'bg-primary shadow-md' : 'opacity-50 hover:bg-neutral-50 hover:opacity-100'}`}
                                title="Version Française"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" className="w-6 h-4 rounded-sm mx-auto"><rect width="1" height="2" fill="#002395"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#ED2939"/></svg>
                              </button>
                              <button 
                                onClick={() => setCurrentLocale('en')}
                                className={`px-6 py-2 rounded-lg text-lg transition-all ${currentLocale === 'en' ? 'bg-primary shadow-md' : 'opacity-50 hover:bg-neutral-50 hover:opacity-100'}`}
                                title="English Version"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className="w-6 h-4 rounded-sm mx-auto"><clipPath id="d1"><rect width="60" height="30"/></clipPath><g clipPath="url(#d1)"><rect width="60" height="30" fill="#012169"/><path d="M0 0l60 30M60 0L0 30" stroke="#fff" strokeWidth="6"/><path d="M0 0l60 30M60 0L0 30" stroke="#C8102E" strokeWidth="4" clipPath="url(#d1)"/><path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10"/><path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6"/></g></svg>
                              </button>            </div>
            <div className="bg-primary/5 border border-primary/10 rounded-xl px-4 py-2.5 flex items-center gap-3 text-primary">
              <Languages className="w-4 h-4" />
              <p className="text-xs font-bold uppercase tracking-wider">
                Edition : {currentLocale === 'fr' ? 'Français' : 'English'}
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all flex items-center gap-2 font-semibold shadow-lg disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Enregistrer la version {currentLocale.toUpperCase()}
          </button>
        </div>

        <div className="space-y-4 max-w-5xl pb-20">
          {/* HERO */}
          <div>
            <SectionHeader id="hero" title="En-tête (Hero)" icon={Layout} />
            {openSections['hero'] && (
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div>
                  <label className="block text-neutral-700 mb-2 font-semibold">Titre</label>
                  <input
                    type="text"
                    value={content.hero.title}
                    onChange={(e) => updateHero('title', e.target.value)}
                    className="w-full h-12 px-4 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 mb-2 font-semibold">Sous-titre</label>
                  <textarea
                    value={content.hero.subtitle}
                    onChange={(e) => updateHero('subtitle', e.target.value)}
                    rows={3}
                    className="w-full p-4 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {content.hero.stats.map((stat, idx) => (
                    <div key={idx} className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                      <input
                        type="text"
                        value={stat.value}
                        onChange={(e) => updateStat(idx, 'value', e.target.value)}
                        className="w-full text-xl font-bold text-primary bg-transparent border-none focus:ring-0 p-0 mb-1"
                      />
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => updateStat(idx, 'label', e.target.value)}
                        className="w-full text-xs text-neutral-500 bg-transparent border-none focus:ring-0 p-0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* POURQUOI */}
          <div>
            <SectionHeader id="pourquoi" title="Section Pourquoi ?" icon={ImageIcon} />
            {openSections['pourquoi'] && (
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div>
                  <label className="block text-neutral-700 mb-2 font-semibold">Titre</label>
                  <input
                    type="text"
                    value={content.pourquoi.title}
                    onChange={(e) => updatePourquoi('title', e.target.value)}
                    className="w-full h-12 px-4 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 mb-2 font-semibold">Image (URL)</label>
                  <input
                    type="text"
                    value={content.pourquoi.image}
                    onChange={(e) => updatePourquoi('image', e.target.value)}
                    className="w-full h-12 px-4 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-neutral-700 font-semibold">Paragraphes</label>
                  {content.pourquoi.paragraphs.map((p, idx) => (
                    <div key={idx} className="relative group">
                      <textarea
                        value={p}
                        onChange={(e) => updateParagraph(idx, e.target.value)}
                        rows={4}
                        className="w-full p-4 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none text-sm bg-neutral-50/30"
                      />
                      <button
                        onClick={() => updatePourquoi('paragraphs', content.pourquoi.paragraphs.filter((_, i) => i !== idx))}
                        className="absolute top-2 right-2 p-1 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => updatePourquoi('paragraphs', [...content.pourquoi.paragraphs, ""])}
                    className="text-primary font-bold text-sm flex items-center gap-1"
                  >
                    <Plus size={16} /> Ajouter un paragraphe
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* CATALOGUE */}
          <div>
            <SectionHeader id="catalogue" title="Catalogue des Missions" icon={List} />
            {openSections['catalogue'] && (
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                <div>
                  <h3 className="text-lg font-bold text-[#003A54] mb-4">Champs d&apos;intervention</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {content.champs.map((champ, idx) => (
                      <div key={idx} className="flex gap-2 bg-neutral-50 p-2 rounded-lg border border-neutral-100">
                        <input
                          type="text"
                          value={champ}
                          onChange={(e) => updateChamps(idx, e.target.value)}
                          className="flex-1 h-9 px-3 border border-neutral-200 rounded-lg text-sm"
                        />
                        <button onClick={() => setContent(prev => ({ ...prev, champs: prev.champs.filter((_, i) => i !== idx) }))} className="text-neutral-400 hover:text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setContent(prev => ({ ...prev, champs: [...prev.champs, ""] }))} className="text-primary font-bold text-sm mt-4 flex items-center gap-1">
                    <Plus size={16} /> Ajouter un champ
                  </button>
                </div>

                <div className="border-t pt-8">
                  <h3 className="text-lg font-bold text-[#003A54] mb-4">Types de Mission</h3>
                  <div className="space-y-6">
                    {content.types.map((type, typeIdx) => (
                      <div key={typeIdx} className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100">
                        <div className="flex items-center justify-between mb-4">
                          <input
                            type="text"
                            value={type.title}
                            onChange={(e) => {
                              const newTypes = [...content.types];
                              newTypes[typeIdx].title = e.target.value;
                              setContent(prev => ({ ...prev, types: newTypes }));
                            }}
                            className="text-lg font-bold text-neutral-900 bg-transparent border-none focus:ring-0 p-0"
                          />
                          <button onClick={() => setContent(prev => ({ ...prev, types: prev.types.filter((_, i) => i !== typeIdx) }))} className="text-neutral-400 hover:text-red-500">
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {type.items.map((item, itemIdx) => (
                            <div key={itemIdx} className="flex gap-2">
                              <input
                                type="text"
                                value={item}
                                onChange={(e) => updateTypeItem(typeIdx, itemIdx, e.target.value)}
                                className="flex-1 h-9 px-3 border border-neutral-200 rounded-lg text-sm bg-white"
                              />
                              <button onClick={() => {
                                const newTypes = [...content.types];
                                newTypes[typeIdx].items = type.items.filter((_, i) => i !== itemIdx);
                                setContent(prev => ({ ...prev, types: newTypes }));
                              }} className="text-neutral-400 hover:text-red-500">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <button onClick={() => {
                          const newTypes = [...content.types];
                          newTypes[typeIdx].items.push("");
                          setContent(prev => ({ ...prev, types: newTypes }));
                        }} className="text-primary font-bold text-xs mt-3 flex items-center gap-1">
                          <Plus size={14} /> Ajouter un élément
                        </button>
                      </div>
                    ))}
                    <button onClick={() => setContent(prev => ({ ...prev, types: [...prev.types, { title: "Nouvelle catégorie", items: [] }] }))} className="text-primary font-bold text-sm flex items-center gap-1">
                      <Plus size={16} /> Ajouter une catégorie
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
