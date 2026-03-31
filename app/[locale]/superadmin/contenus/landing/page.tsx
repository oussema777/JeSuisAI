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
  ChevronDown,
  ChevronUp,
  Users,
  Building2,
  List,
  Search,
  HelpCircle,
  Languages
} from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';

interface LandingContent {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    bg_image: string;
  };
  stats: {
    count: number;
    text_before: string;
    text_after: string;
    dot_color: string;
  };
  pourquoi: {
    badge: string;
    title: string;
    image: string;
    description: string;
  };
  defis: {
    title: string;
    items: string[];
  };
  missions: {
    title: string;
    subtitle: string;
  };
  communaute: {
    badge: string;
    title: string;
    description: string;
    images: string[];
  };
  membres: {
    title: string;
    categories: Array<{ titre: string; description: string }>;
    villes_title: string;
    villes: string[];
  };
  temoignages: {
    title: string;
    subtitle: string;
    bg_image: string;
    items: Array<{
      id: string;
      type: 'contributeur' | 'maire';
      name: string;
      role: string;
      content: string;
      avatar: string;
      emoji: string;
    }>;
  };
  partenaires: {
    title: string;
    subtitle: string;
    items: Array<{ nom: string; logo: string }>;
  };
  newsletter: {
    badge: string;
    title: string;
    subtitle: string;
  };
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const DEFAULT_FAQ: FAQItem[] = [
  {
    id: "1",
    question: "Qui est à l'origine de cette plateforme ?",
    answer: "Jesuisaucameroun.com est le fruit d'un partenariat innovant entre l'Association des Maires de Villes du Cameroun (AMVC), les aéroports et la startup Impact Diaspora (www.impactdiaspora.fr) basée en France et Sénégal. C'est la même formule qui sera appliquée dans les 28 pays africains où la plateforme programme de se lancer."
  },
  {
    id: "2",
    question: "Qu'est-ce que jesuisaucameroun.com ?",
    answer: "jesuisaucameroun.com fait partie intégrante de la marketplace panafricaine (jesuisaupays.com) où les villes, entreprises et ONG africaines sollicitent la diaspora pour leurs besoins en développement. Je suisaucameroun.com cible particulièrement la diaspora lorsque celle-ci est en vacances dans le pays d'origine d'où le partenariat avec les aéroports. La plateforme assure la mise en relation entre la diaspora et les annonceurs, tout en garantissant un environnement sécurisé pour les deux parties."
  },
  {
    id: "3",
    question: "Comment fonctionne la plateforme ?",
    answer: "Les annonceurs (villes, ONG et entreprises) sont formés pour intégrer directement leurs offres sur la plateforme. Celles-ci sont validées et corrigées via un double contrôle humain et IA. Dès leur publication, les actions qui couvrent 13 champs d'action sont accessibles par la diaspora qui peut aussitôt interagir. Les demandes et sollicitations de la diaspora sont directement reçues et gérées par les points focaux dédiés chez les annonceurs."
  },
  {
    id: "4",
    question: "Est-ce que c'est gratuit ?",
    answer: "Pour la diaspora, tout est gratuit ! En ce qui concerne les annonceurs, la gratuité est offerte seulement pour les ONG d'une certaine taille (et un impact certain), proposées par les villes. Les villes, ONG internationales et entreprises doivent s'acquitter d'un loyer annuel. Néanmoins, des bailleurs ou sponsors peuvent prendre en charge ces cotisations pour le compte des associations voire des villes. C'est ce modèle tarifaire qui sera testé lors du projet pilote jesuisaucameroun.com."
  },
  {
    id: "5",
    question: "Les annonceurs et les projets sont-ils sérieux ?",
    answer: "Les annonceurs sont rigoureusement sélectionnés et formés aux exigences de la diaspora. Un mail automatique est adressé au contributeur, 15 jours après sa demande on-line, afin de s'assurer que l'annonceur a bien repris contact avec lui. En fonction des résultats, les décideurs (Maires, Président ONG, DG entreprises...) sont sensibilisés et en l'absence de mesures correctives, la suspension des publications est envisageable."
  },
  {
    id: "6",
    question: "Comment puis-je être sûr que ma proposition arrive à destination ?",
    answer: "Toutes les demandes de la diaspora sont acheminées directement sur l'email du point focal diaspora de l'annonceur ciblé. Dans certains cas, le cabinet du Maire (ou d'un décideur) peut demander à recevoir une copie pour suivi qualité. Et nous suivons régulièrement le traitement des demandes par les annonceurs via un email qualité automatique adressé aux contributeurs."
  },
  {
    id: "7",
    question: "Dois-je être au Cameroun pour contribuer ?",
    answer: "Non pas nécessairement ! Si vous êtes loin, il suffit d'activer le filtre « missions à distance » dans le moteur de recherche général."
  }
];

const DEFAULT_CONTENT: LandingContent = {
  hero: {
    badge: "🌴 Vacances au Cameroun 2025",
    title: "Camerounais de la diaspora",
    subtitle: "En vacances au pays, transformez votre séjour en impact concret. Rejoignez une communauté engagée.",
    bg_image: "https://jesuisaupays.com/home-ia/assets/hero-beach-CpJkoZy1.jpg"
  },
  stats: {
    count: 246,
    text_before: "Aujourd'hui,",
    text_after: "bonnes actions vous attendent !",
    dot_color: "#F7BB10"
  },
  pourquoi: {
    badge: "Pourquoi je suis au Cameroun ?",
    title: "Une diaspora engagée pour le développement",
    image: "https://jesuisaupays.com/home-ia/assets/diaspora-engaged-Dbfcbnc3.jpg",
    description: "Chaque année, plus d'un million de Camerounais du monde retournent en vacances au pays. jesuisaucameroun.com est la plateforme qui transforme ce séjour en une opportunité d'engagement concret pour le développement local."
  },
  defis: {
    title: "Nos 7 défis pour gagner la confiance de la diaspora",
    items: ["Sélection des acteurs", "Diversité des actions", "Filtres optimisés", "Interlocuteur dédié", "Suivi qualité", "Charte éthique", "Transparence et redevabilité"]
  },
  missions: {
    title: "Missions à la une",
    subtitle: "Découvrez les dernières actions proposées par nos villes et organisations membres."
  },
  communaute: {
    badge: "Notre communauté",
    title: "Jesuisaucameroun.com, avant tout une communauté !",
    description: "Aux côtés de Douala et des villes membres de l'Association des Maires de Villes du Cameroun (AMVC), chefs de file, jesuisaucameroun.com rassemble un écosystème d'acteurs engagés, unis par la même éthique et cette ambition commune : libérer tout le potentiel de la diaspora camerounaise au service du développement inclusif de nos territoires.",
    images: [
      "https://jesuisaupays.com/home-ia/assets/community-friends-B6aHglcZ.jpg",
      "https://jesuisaupays.com/home-ia/assets/community-training-Drrgs9ls.jpg"
    ]
  },
  membres: {
    title: "Profil des membres",
    categories: [
      { titre: 'Collectivités locales', description: 'Mobiliser les contributeurs des diasporas au développement local' },
      { titre: 'Aéroports internationaux', description: 'Hubs stratégiques pour connecter les diasporas de retour' },
      { titre: 'ONG et associations', description: 'Connecter les diasporas en tant que donateurs et catalyseurs' },
      { titre: 'Entreprises', description: 'Dynamiser les programmes RSE avec les compétences des diasporas' }
    ],
    villes_title: "Villes et organisations membres",
    villes: ['AMVC', 'Bafoussam', 'Bamenda', 'Bertoua', 'Douala', 'Ebolowa', 'Edéa', 'Garoua', 'Kribi', 'Kumba', 'Limbe', 'Maroua', 'Ngaoundéré', 'Nkongsamba', 'Yaoundé']
  },
  temoignages: {
    title: "Ils n'oublient pas d'où ils viennent",
    subtitle: "Ils ont réussi à l'étranger et contribuent activement au développement du Cameroun.",
    bg_image: "https://jesuisaupays.com/home-ia/assets/testimonials-bg-CrSLpMuz.jpg",
    items: [
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
    ]
  },
  partenaires: {
    title: "Engagés à nos côtés",
    subtitle: "Sans eux, nous ne serions pas là",
    items: []
  },
  newsletter: {
    badge: "Newsletter",
    title: "Restez connecté à jesuisaucameroun.com",
    subtitle: "Recevez des actions de mission personnalisées via des alertes e-mail gratuites."
  }
};

export default function LandingManagement() {
  const params = useParams();
  const [currentLocale, setCurrentLocale] = useState(params.locale as string || 'fr');
  const [content, setContent] = useState<LandingContent>(DEFAULT_CONTENT);
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const supabase = getSupabaseBrowserClient();

  useEffect(() => { fetchContent(); }, [currentLocale]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      
      // Fetch both landing-page and faq in parallel filtered by currentLocale
      const [landingRes, faqRes] = await Promise.all([
        supabase.from('static_contents').select('content').eq('key', 'landing-page').eq('lang', currentLocale).maybeSingle(),
        supabase.from('static_contents').select('content').eq('key', 'faq').eq('lang', currentLocale).maybeSingle()
      ]);

      if (landingRes.error && landingRes.error.code !== 'PGRST116') throw landingRes.error;
      if (faqRes.error && faqRes.error.code !== 'PGRST116') throw faqRes.error;

      if (landingRes.data && landingRes.data.content) {
        const fetched = landingRes.data.content as any;
        setContent({
          ...DEFAULT_CONTENT,
          ...fetched,
          hero: { ...DEFAULT_CONTENT.hero, ...fetched.hero },
          stats: { ...DEFAULT_CONTENT.stats, ...fetched.stats },
          pourquoi: { ...DEFAULT_CONTENT.pourquoi, ...fetched.pourquoi },
          defis: { ...DEFAULT_CONTENT.defis, ...fetched.defis },
          missions: { ...DEFAULT_CONTENT.missions, ...fetched.missions },
          communaute: { ...DEFAULT_CONTENT.communaute, ...fetched.communaute },
          membres: { ...DEFAULT_CONTENT.membres, ...fetched.membres },
          temoignages: { 
            ...DEFAULT_CONTENT.temoignages, 
            ...fetched.temoignages,
            items: (fetched.temoignages?.items && fetched.temoignages.items.length > 0) 
              ? fetched.temoignages.items 
              : DEFAULT_CONTENT.temoignages.items 
          },
          partenaires: { ...DEFAULT_CONTENT.partenaires, ...fetched.partenaires },
          newsletter: { ...DEFAULT_CONTENT.newsletter, ...(fetched.newsletter || {}) },
        });
      } else {
        // Fallback to default if no content for this language yet
        setContent(DEFAULT_CONTENT);
      }

      if (faqRes.data && faqRes.data.content && Array.isArray(faqRes.data.content) && faqRes.data.content.length > 0) {
        setFaqItems(faqRes.data.content as FAQItem[]);
      } else {
        setFaqItems(DEFAULT_FAQ);
      }
    } catch (err) {
      console.error('Error fetching:', err);
      toast.error('Erreur lors du chargement');
    } finally { setLoading(false); }
  };

  const toggleSection = (section: string) => setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Save both landing-page and faq with the current language
      const [landingSave, faqSave] = await Promise.all([
        supabase.from('static_contents').upsert({
          key: 'landing-page', 
          lang: currentLocale, 
          title: `Page d'accueil (${currentLocale.toUpperCase()})`, 
          content: content, 
          updated_at: new Date().toISOString()
        }),
        supabase.from('static_contents').upsert({
          key: 'faq', 
          lang: currentLocale, 
          title: `Foire Aux Questions (${currentLocale.toUpperCase()})`, 
          content: faqItems, 
          updated_at: new Date().toISOString()
        })
      ]);

      if (landingSave.error) throw landingSave.error;
      if (faqSave.error) throw faqSave.error;

      toast.success(`Contenu (${currentLocale.toUpperCase()}) mis à jour`);
    } catch (err: any) {
      console.error('Error saving:', err);
      toast.error(`Erreur: ${err.message || "Erreur d'enregistrement"}`);
    } finally { setSaving(false); }
  };

  const SectionHeader = ({ id, title, icon: Icon }: { id: string, title: string, icon: any }) => (
    <button onClick={() => toggleSection(id)} className="w-full px-6 py-4 bg-white border border-neutral-200 shadow-sm rounded-xl flex items-center justify-between hover:bg-neutral-50 transition-all mb-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${openSections[id] ? 'bg-primary/10 text-primary' : 'bg-neutral-100 text-neutral-500'}`}><Icon className="w-5 h-5" /></div>
        <h2 className={`font-bold ${openSections[id] ? 'text-primary' : 'text-neutral-900'}`}>{title}</h2>
      </div>
      {openSections[id] ? <ChevronUp className="text-neutral-400" /> : <ChevronDown className="text-neutral-400" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-page-bg flex">
      <SidebarSuperadmin activePage="contenus-statiques" activeSubPage="landing" />
      <main className="flex-1 ml-[260px] pb-8">
        <HeaderSuperadmin pageTitle="Configuration Page d'accueil" />
        
        <div className="p-8 mt-16 lg:mt-[72px]">
          <div className="flex items-center justify-between mb-8">
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
                </button>
              </div>
              <div className="bg-primary/5 border border-primary/10 rounded-xl px-4 py-2.5 flex items-center gap-3 text-primary">
                <Languages className="w-4 h-4" />
                <p className="text-xs font-bold uppercase tracking-wider">
                  Edition : {currentLocale === 'fr' ? 'Français' : 'English'}
                </p>
              </div>
            </div>
            <button onClick={handleSave} disabled={saving} className="px-8 py-3 bg-primary text-white rounded-lg font-semibold disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Enregistrer la version {currentLocale.toUpperCase()}
            </button>
          </div>

          <div className="space-y-4 max-w-5xl pb-20">
          {/* HERO */}
          <div>
            <SectionHeader id="hero" title="Section Hero (Haut de page)" icon={Layout} />
            {openSections['hero'] && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div><label className="block text-sm font-bold mb-1">Badge</label><input type="text" value={content.hero.badge} onChange={(e) => setContent({...content, hero: {...content.hero, badge: e.target.value}})} className="w-full h-11 px-4 border border-neutral-200 rounded-xl" /></div>
                <div><label className="block text-sm font-bold mb-1">Titre</label><textarea value={content.hero.title} onChange={(e) => setContent({...content, hero: {...content.hero, title: e.target.value}})} className="w-full p-4 border border-neutral-200 rounded-xl h-24" /></div>
                <div><label className="block text-sm font-bold mb-1">Sous-titre</label><textarea value={content.hero.subtitle} onChange={(e) => setContent({...content, hero: {...content.hero, subtitle: e.target.value}})} className="w-full p-4 border border-neutral-200 rounded-xl h-32" /></div>
                <div><label className="block text-sm font-bold mb-1">Background Image URL</label><input type="text" value={content.hero.bg_image} onChange={(e) => setContent({...content, hero: {...content.hero, bg_image: e.target.value}})} className="w-full h-11 px-4 border border-neutral-200 rounded-xl" /></div>
              </div>
            )}
          </div>

          {/* STATS */}
          <div>
            <SectionHeader id="stats" title="Bandeau Stats (Rouge)" icon={Type} />
            {openSections['stats'] && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-2 gap-6">
                  <div><label className="block text-sm font-bold mb-1">Nombre</label><input type="number" value={content.stats.count} onChange={(e) => setContent({...content, stats: {...content.stats, count: parseInt(e.target.value) || 0}})} className="w-full h-11 px-4 border border-neutral-200 rounded-xl" /></div>
                  <div><label className="block text-sm font-bold mb-1">Couleur Point</label><input type="color" value={content.stats.dot_color} onChange={(e) => setContent({...content, stats: {...content.stats, dot_color: e.target.value}})} className="w-full h-11 border border-neutral-200 rounded-xl" /></div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div><label className="block text-sm font-bold mb-1">Texte Avant</label><input type="text" value={content.stats.text_before} onChange={(e) => setContent({...content, stats: {...content.stats, text_before: e.target.value}})} className="w-full h-11 px-4 border border-neutral-200 rounded-xl" /></div>
                  <div><label className="block text-sm font-bold mb-1">Texte Après</label><input type="text" value={content.stats.text_after} onChange={(e) => setContent({...content, stats: {...content.stats, text_after: e.target.value}})} className="w-full h-11 px-4 border border-neutral-200 rounded-xl" /></div>
                </div>
              </div>
            )}
          </div>

          {/* POURQUOI */}
          <div>
            <SectionHeader id="pourquoi" title="Pourquoi ?" icon={AlertCircle} />
            {openSections['pourquoi'] && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <input type="text" value={content.pourquoi.badge} onChange={(e) => setContent({...content, pourquoi: {...content.pourquoi, badge: e.target.value}})} className="w-full h-11 px-4 border border-neutral-200 rounded-xl" placeholder="Badge" />
                <input type="text" value={content.pourquoi.title} onChange={(e) => setContent({...content, pourquoi: {...content.pourquoi, title: e.target.value}})} className="w-full h-11 px-4 border border-neutral-200 rounded-xl" placeholder="Titre" />
                <textarea value={content.pourquoi.description} onChange={(e) => setContent({...content, pourquoi: {...content.pourquoi, description: e.target.value}})} rows={6} className="w-full p-4 border border-neutral-200 rounded-xl" />
              </div>
            )}
          </div>

          {/* DEFIS */}
          <div>
            <SectionHeader id="defis" title="Nos 7 Défis" icon={Plus} />
            {openSections['defis'] && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <input 
                    type="text" 
                    value={content.defis.title} 
                    onChange={(e) => setContent({...content, defis: {...content.defis, title: e.target.value}})} 
                    className="flex-1 h-11 px-4 border border-neutral-200 rounded-xl" 
                    placeholder="Titre Section" 
                  />
                  <button 
                    onClick={() => setContent({
                      ...content, 
                      defis: {
                        ...content.defis, 
                        items: [...content.defis.items, ""]
                      }
                    })}
                    className="ml-4 text-primary font-bold text-sm flex items-center gap-1 whitespace-nowrap"
                  >
                    <Plus size={16} /> Ajouter un défi
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {content.defis.items.map((it, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input 
                        type="text" 
                        value={it} 
                        onChange={(e) => {
                          const newIt = [...content.defis.items]; 
                          newIt[idx] = e.target.value; 
                          setContent({...content, defis: {...content.defis, items: newIt}});
                        }} 
                        className="flex-1 h-11 px-4 border border-neutral-200 rounded-xl" 
                      />
                      <button 
                        onClick={() => {
                          const newIt = content.defis.items.filter((_, i) => i !== idx);
                          setContent({...content, defis: {...content.defis, items: newIt}});
                        }}
                        className="text-neutral-400 hover:text-red-500"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* MISSIONS */}
          <div>
            <SectionHeader id="missions" title="Missions à la une" icon={List} />
            {openSections['missions'] && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <input type="text" value={content.missions.title} onChange={(e) => setContent({...content, missions: {...content.missions, title: e.target.value}})} className="w-full h-11 px-4 border border-neutral-200 rounded-xl" />
                <textarea value={content.missions.subtitle} onChange={(e) => setContent({...content, missions: {...content.missions, subtitle: e.target.value}})} rows={3} className="w-full p-4 border border-neutral-200 rounded-xl" />
              </div>
            )}
          </div>

          {/* COMMUNAUTE */}
          <div>
            <SectionHeader id="communaute" title="Notre Communauté" icon={ImageIcon} />
            {openSections['communaute'] && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <input type="text" value={content.communaute.badge} onChange={(e) => setContent({...content, communaute: {...content.communaute, badge: e.target.value}})} className="w-full h-11 px-4 border border-neutral-200 rounded-xl" />
                <input type="text" value={content.communaute.title} onChange={(e) => setContent({...content, communaute: {...content.communaute, title: e.target.value}})} className="w-full h-11 px-4 border border-neutral-200 rounded-xl" />
                <textarea value={content.communaute.description} onChange={(e) => setContent({...content, communaute: {...content.communaute, description: e.target.value}})} rows={4} className="w-full p-4 border border-neutral-200 rounded-xl" />
              </div>
            )}
          </div>

          {/* MEMBRES */}
          <div>
            <SectionHeader id="membres" title="Profil des membres & Villes" icon={Building2} />
            {openSections['membres'] && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                <div>
                  <h3 className="text-lg font-bold text-[#003A54] mb-4">Catégories de membres</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {content.membres.categories.map((cat, idx) => (
                      <div key={idx} className="p-4 border border-neutral-100 rounded-xl bg-neutral-50/30">
                        <label className="block text-neutral-500 mb-1 text-[10px] uppercase font-bold">Catégorie #{idx + 1}</label>
                        <input type="text" value={cat.titre} onChange={(e) => {
                          const newCats = [...content.membres.categories]; newCats[idx].titre = e.target.value; setContent({...content, membres: {...content.membres, categories: newCats}});
                        }} className="w-full h-9 px-3 mb-2 border border-neutral-200 rounded-lg text-sm" placeholder="Titre" />
                        <textarea value={cat.description} onChange={(e) => {
                          const newCats = [...content.membres.categories]; newCats[idx].description = e.target.value; setContent({...content, membres: {...content.membres, categories: newCats}});
                        }} className="w-full p-2 border border-neutral-200 rounded-lg h-16 text-xs resize-none" placeholder="Description" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t pt-8">
                  <h3 className="text-lg font-bold text-[#003A54] mb-4">Villes membres</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold mb-1">Titre Section Villes</label>
                      <input type="text" value={content.membres.villes_title} onChange={(e) => setContent({...content, membres: {...content.membres, villes_title: e.target.value}})} className="w-full h-11 px-4 border border-neutral-200 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1">Villes (séparées par virgule)</label>
                      <textarea value={content.membres.villes.join(', ')} onChange={(e) => {
                        const arr = e.target.value.split(',').map(v => v.trim()).filter(v => v !== '');
                        setContent({...content, membres: {...content.membres, villes: arr}});
                      }} rows={4} className="w-full p-4 border border-neutral-200 rounded-xl text-sm" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* TEMOIGNAGES */}
          <div>
            <SectionHeader id="temoignages" title="Témoignages" icon={Users} />
            {openSections['temoignages'] && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold mb-1">Titre</label>
                    <input type="text" value={content.temoignages.title} onChange={(e) => setContent({...content, temoignages: {...content.temoignages, title: e.target.value}})} className="w-full h-11 px-4 border border-neutral-200 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Sous-titre</label>
                    <input type="text" value={content.temoignages.subtitle} onChange={(e) => setContent({...content, temoignages: {...content.temoignages, subtitle: e.target.value}})} className="w-full h-11 px-4 border border-neutral-200 rounded-xl" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Image de fond (URL)</label>
                  <input type="text" value={content.temoignages.bg_image} onChange={(e) => setContent({...content, temoignages: {...content.temoignages, bg_image: e.target.value}})} className="w-full h-11 px-4 border border-neutral-200 rounded-xl" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Liste des témoignages</h3>
                    <button 
                      onClick={() => setContent({
                        ...content, 
                        temoignages: {
                          ...content.temoignages, 
                          items: [...content.temoignages.items, { id: Date.now().toString(), type: 'contributeur', name: '', role: '', content: '', avatar: '', emoji: '👤' }]
                        }
                      })}
                      className="text-primary font-bold text-sm flex items-center gap-1"
                    >
                      <Plus size={16} /> Ajouter
                    </button>
                  </div>

                  {content.temoignages.items.map((item, idx) => (
                    <div key={item.id} className="p-6 border border-neutral-100 rounded-2xl bg-neutral-50/30 space-y-4 relative group">
                      <button 
                        onClick={() => setContent({
                          ...content, 
                          temoignages: {
                            ...content.temoignages, 
                            items: content.temoignages.items.filter(it => it.id !== item.id)
                          }
                        })}
                        className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={18} />
                      </button>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase mb-1">Type</label>
                          <select 
                            value={item.type} 
                            onChange={(e) => {
                              const newItems = [...content.temoignages.items];
                              newItems[idx].type = e.target.value as any;
                              setContent({...content, temoignages: {...content.temoignages, items: newItems}});
                            }}
                            className="w-full h-10 px-3 border border-neutral-200 rounded-lg text-sm bg-white"
                          >
                            <option value="contributeur">Contributeur</option>
                            <option value="maire">Maire / Officiel</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase mb-1">Emoji</label>
                          <input type="text" value={item.emoji} onChange={(e) => {
                            const newItems = [...content.temoignages.items];
                            newItems[idx].emoji = e.target.value;
                            setContent({...content, temoignages: {...content.temoignages, items: newItems}});
                          }} className="w-full h-10 px-3 border border-neutral-200 rounded-lg text-sm bg-white" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" value={item.name} placeholder="Nom" onChange={(e) => {
                          const newItems = [...content.temoignages.items];
                          newItems[idx].name = e.target.value;
                          setContent({...content, temoignages: {...content.temoignages, items: newItems}});
                        }} className="w-full h-10 px-3 border border-neutral-200 rounded-lg text-sm bg-white" />
                        <input type="text" value={item.role} placeholder="Rôle" onChange={(e) => {
                          const newItems = [...content.temoignages.items];
                          newItems[idx].role = e.target.value;
                          setContent({...content, temoignages: {...content.temoignages, items: newItems}});
                        }} className="w-full h-10 px-3 border border-neutral-200 rounded-lg text-sm bg-white" />
                      </div>

                      <textarea value={item.content} placeholder="Témoignage" onChange={(e) => {
                        const newItems = [...content.temoignages.items];
                        newItems[idx].content = e.target.value;
                        setContent({...content, temoignages: {...content.temoignages, items: newItems}});
                      }} className="w-full p-3 border border-neutral-200 rounded-lg text-sm bg-white h-24 resize-none" />

                      <input type="text" value={item.avatar} placeholder="Avatar URL" onChange={(e) => {
                        const newItems = [...content.temoignages.items];
                        newItems[idx].avatar = e.target.value;
                        setContent({...content, temoignages: {...content.temoignages, items: newItems}});
                      }} className="w-full h-10 px-3 border border-neutral-200 rounded-lg text-sm bg-white" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* NEWSLETTER */}
          <div>
            <SectionHeader id="newsletter" title="Newsletter" icon={ImageIcon} />
            {openSections['newsletter'] && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div>
                  <label className="block text-sm font-bold mb-1">Badge</label>
                  <input type="text" value={content.newsletter.badge} onChange={(e) => setContent({...content, newsletter: {...content.newsletter, badge: e.target.value}})} className="w-full h-11 px-4 border border-neutral-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Titre Principal</label>
                  <input type="text" value={content.newsletter.title} onChange={(e) => setContent({...content, newsletter: {...content.newsletter, title: e.target.value}})} className="w-full h-11 px-4 border border-neutral-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Sous-titre / Description</label>
                  <textarea value={content.newsletter.subtitle} onChange={(e) => setContent({...content, newsletter: {...content.newsletter, subtitle: e.target.value}})} rows={3} className="w-full p-4 border border-neutral-200 rounded-xl" />
                </div>
              </div>
            )}
          </div>

          {/* FAQ */}
          <div>
            <SectionHeader id="faq" title="Questions Fréquentes (FAQ)" icon={HelpCircle} />
            {openSections['faq'] && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Liste des questions</h3>
                  <button 
                    onClick={() => setFaqItems([...faqItems, { id: Date.now().toString(), question: '', answer: '' }])}
                    className="text-primary font-bold text-sm flex items-center gap-1"
                  >
                    <Plus size={16} /> Ajouter une question
                  </button>
                </div>

                <div className="space-y-4">
                  {faqItems.map((item, idx) => (
                    <div key={item.id} className="p-6 border border-neutral-100 rounded-2xl bg-neutral-50/30 space-y-4 relative group">
                      <button 
                        onClick={() => setFaqItems(faqItems.filter(it => it.id !== item.id))}
                        className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={18} />
                      </button>

                      <div className="flex gap-2 items-center mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </div>
                        <div className="flex gap-1">
                          <button 
                            disabled={idx === 0}
                            onClick={() => {
                              const newFaq = [...faqItems];
                              [newFaq[idx], newFaq[idx-1]] = [newFaq[idx-1], newFaq[idx]];
                              setFaqItems(newFaq);
                            }}
                            className="p-1 text-neutral-400 hover:text-primary disabled:opacity-30"
                          >
                            <ChevronUp size={16} />
                          </button>
                          <button 
                            disabled={idx === faqItems.length - 1}
                            onClick={() => {
                              const newFaq = [...faqItems];
                              [newFaq[idx], newFaq[idx+1]] = [newFaq[idx+1], newFaq[idx]];
                              setFaqItems(newFaq);
                            }}
                            className="p-1 text-neutral-400 hover:text-primary disabled:opacity-30"
                          >
                            <ChevronDown size={16} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase mb-1">Question</label>
                        <input 
                          type="text" 
                          value={item.question} 
                          onChange={(e) => {
                            const newFaq = [...faqItems];
                            newFaq[idx].question = e.target.value;
                            setFaqItems(newFaq);
                          }} 
                          className="w-full h-10 px-3 border border-neutral-200 rounded-lg text-sm bg-white" 
                          placeholder="Ex: Est-ce que c'est gratuit ?"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase mb-1">Réponse</label>
                        <textarea 
                          value={item.answer} 
                          onChange={(e) => {
                            const newFaq = [...faqItems];
                            newFaq[idx].answer = e.target.value;
                            setFaqItems(newFaq);
                          }} 
                          className="w-full p-3 border border-neutral-200 rounded-lg text-sm bg-white h-24 resize-none" 
                          placeholder="Détaillez la réponse..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* PARTENAIRES */}
          <div>
            <SectionHeader id="partenaires" title="Partenaires" icon={ImageIcon} />
            {openSections['partenaires'] && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <input type="text" value={content.partenaires.title} onChange={(e) => setContent({...content, partenaires: {...content.partenaires, title: e.target.value}})} className="w-full h-11 px-4 border border-neutral-200 rounded-xl" placeholder="Titre" />
                <div className="space-y-3">
                  {content.partenaires.items.map((p, idx) => (
                    <div key={idx} className="flex gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                      <input type="text" value={p.nom} onChange={(e) => {
                        const newP = [...content.partenaires.items]; newP[idx].nom = e.target.value; setContent({...content, partenaires: {...content.partenaires, items: newP}});
                      }} className="flex-1 h-10 px-3 border border-neutral-200 rounded-lg text-sm" placeholder="Nom" />
                      <input type="text" value={p.logo} onChange={(e) => {
                        const newP = [...content.partenaires.items]; newP[idx].logo = e.target.value; setContent({...content, partenaires: {...content.partenaires, items: newP}});
                      }} className="flex-1 h-10 px-3 border border-neutral-200 rounded-lg text-sm" placeholder="URL Logo" />
                      <button onClick={() => setContent({...content, partenaires: {...content.partenaires, items: content.partenaires.items.filter((_, i) => i !== idx)}})} className="text-neutral-400 hover:text-red-500"><Trash2 size={18} /></button>
                    </div>
                  ))}
                  <button onClick={() => setContent({...content, partenaires: {...content.partenaires, items: [...content.partenaires.items, {nom: '', logo: ''}]}})} className="text-primary font-bold text-sm flex items-center gap-1"><Plus size={16} /> Ajouter</button>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}
