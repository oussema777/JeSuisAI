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
  Plus,
  Trash2,
  Users,
  Quote,
  Globe,
  Building2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Search,
  GripVertical,
  Languages
} from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';

interface AProposContent {
  hero: {
    title: string;
    subtitle: string;
  };
  ecosystem: {
    title: string;
    description: string;
    cards: Array<{
      icon: 'building2' | 'plane' | 'heart' | 'building';
      label: string;
      description: string;
    }>;
  };
  motPresident: {
    section_title: string;
    quote_title: string;
    quote_paragraphs: string[];
    name: string;
    role: string;
    photo: string;
  };
  membres: {
    title: string;
    items: Array<{ name: string; isOrganisation: boolean }>;
  };
  partenaires: {
    title: string;
    items: Array<{ nom: string; logo: string }>;
  };
  cta: {
    title: string;
    body: string;
  };
}

interface Membre {
  id: string;
  name: string;
  type: 'ville' | 'organisation';
}

interface OrganisationsContent {
  title: string;
  subtitle: string;
  membres: Membre[];
}

const DEFAULT_CONTENT: AProposContent = {
  hero: {
    title: "Jesuisaucameroun.com, avant tout une communauté !",
    subtitle: "Avec les villes, ONG et entreprises qui croient aux Camerounais de l'étranger"
  },
  ecosystem: {
    title: "Les grandes villes camerounaises en chef de file",
    description: "Aux côtés de Douala et des villes membres de l'Association des Maires de Villes du Cameroun (AMVC), chefs de file, jesuisaucameroun.com rassemble un écosystème d'acteurs engagés pour faire du séjour de la diaspora un temps utile pour le développement local.",
    cards: [
      { icon: 'building2', label: "Collectivités locales", description: "Mobiliser les contributions des diasporas au développement local à travers des projets concrets." },
      { icon: 'plane', label: "Aéroports internationaux", description: "Hubs stratégiques pour connecter la diaspora à son arrivée et son départ du pays." },
      { icon: 'heart', label: "ONG et associations", description: "Connecter la diaspora en tant que donateurs ou bénévoles sur des causes sociales et environnementales." },
      { icon: 'building', label: "Entreprises", description: "Dynamiser les programmes RSE et favoriser le mentorat entre professionnels de la diaspora et talents locaux." }
    ]
  },
  motPresident: {
    section_title: "Mot du Président de l'Association des Maires de Villes du Cameroun",
    quote_title: "« La diaspora, un partenaire clé du développement des villes camerounaises ! »",
    quote_paragraphs: [
      "Les Camerounais de l'étranger sont une force pour notre pays. Au-delà des transferts de fonds vers les familles, leur expertise, leur réseau et leur volonté de contribuer au développement de leurs villes d'origine sont des atouts majeurs. Nous, maires des villes du Cameroun, sommes déterminés à créer un cadre de confiance pour accueillir ces contributions.",
      "La plateforme « jesuisaucameroun » s'inscrit dans cette ambition en facilitant la mise en relation directe entre les besoins de nos territoires et la générosité de nos compatriotes de l'étranger. Ensemble, construisons le Cameroun de demain."
    ],
    name: "Dr Mbassa Ndine Roger",
    role: "Maire de Douala",
    photo: "https://jesuisaupays.com/wp-content/uploads/2026/01/maire.jpg"
  },
  membres: { title: "Villes et organisations membres", items: [] },
  partenaires: { 
    title: "Partenaires stratégiques engagés à nos côtés", 
    items: [
      { nom: 'Partenaire 1', logo: 'https://jesuisaupays.com/wp-content/uploads/2025/12/Logo-1.png' },
      { nom: 'Partenaire 2', logo: 'https://jesuisaupays.com/wp-content/uploads/2025/12/Logo-2.png' },
      { nom: 'Partenaire 3', logo: 'https://jesuisaupays.com/wp-content/uploads/2025/12/Logo-3.png' },
      { nom: 'Partenaire 4', logo: 'https://jesuisaupays.com/wp-content/uploads/2025/12/Logo-4.png' },
      { nom: 'Partenaire 5', logo: 'https://jesuisaupays.com/wp-content/uploads/2025/12/Logo-5.png' }
    ]
  },
  cta: {
    title: "Prêt à contribuer au développement du Cameroun ?",
    body: "Que vous soyez entrepreneur, professionnel, étudiant ou simplement attaché à vos racines, il y a une place pour vous dans notre communauté."
  }
};

export default function AProposManagement() {
  const params = useParams();
  const [currentLocale, setCurrentLocale] = useState(params.locale as string || 'fr');
  const [content, setContent] = useState<AProposContent>(DEFAULT_CONTENT);
  const [organisations, setOrganisations] = useState<OrganisationsContent>({
    title: "Villes et organisations membres",
    subtitle: "",
    membres: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const supabase = getSupabaseBrowserClient();

  useEffect(() => { fetchContent(); }, [currentLocale]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const [pageRes, globalRes] = await Promise.all([
        supabase.from('static_contents').select('content').eq('key', 'a-propos').eq('lang', currentLocale).maybeSingle(),
        supabase.from('static_contents').select('content').eq('key', 'organisations-global').eq('lang', currentLocale).maybeSingle()
      ]);

      if (pageRes.error && pageRes.error.code !== 'PGRST116') throw pageRes.error;
      if (globalRes.error && globalRes.error.code !== 'PGRST116') throw globalRes.error;

      if (pageRes.data?.content) {
        setContent(pageRes.data.content as AProposContent);
      } else {
        setContent(DEFAULT_CONTENT);
      }
      
      if (globalRes.data?.content) {
        setOrganisations(globalRes.data.content as OrganisationsContent);
      } else {
        // Fallback to default list if not found in DB
        setOrganisations({
          title: "Villes et organisations membres",
          subtitle: "",
          membres: [
            { id: '1', name: 'Association des Maires de Villes du Cameroun', type: 'organisation' },
            { id: '2', name: 'Bafoussam', type: 'ville' },
            { id: '3', name: 'Douala', type: 'ville' },
            { id: '4', name: 'Yaoundé', type: 'ville' }
          ]
        });
      }
    } catch (err) {
      console.error('Error fetching content:', err);
      toast.error('Erreur lors du chargement des contenus');
    } finally { setLoading(false); }
  };

  const toggleSection = (section: string) => setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));

  const handleSave = async () => {
    try {
      setSaving(true);
      const [pageSave, globalSave] = await Promise.all([
        supabase.from('static_contents').upsert({
          key: 'a-propos', 
          lang: currentLocale,
          title: `Page À Propos (${currentLocale.toUpperCase()})`, 
          content: content, 
          updated_at: new Date().toISOString()
        }),
        supabase.from('static_contents').upsert({
          key: 'organisations-global', 
          lang: currentLocale,
          title: `Liste des Organisations Membres (${currentLocale.toUpperCase()})`, 
          content: organisations, 
          updated_at: new Date().toISOString()
        })
      ]);

      if (pageSave.error) throw pageSave.error;
      if (globalSave.error) throw globalSave.error;

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

  if (loading) {
    return (
      <div className="min-h-screen bg-page-bg flex">
        <SidebarSuperadmin activePage="contenus-statiques" activeSubPage="a-propos" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-bg flex">
      <SidebarSuperadmin activePage="contenus-statiques" activeSubPage="a-propos" />
      <main className="flex-1 ml-[260px] pb-8">
        <HeaderSuperadmin pageTitle="Configuration À Propos" />
        
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
            <div>
              <SectionHeader id="hero" title="En-tête (Hero)" icon={Layout} />
              {openSections['hero'] && (
                <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <input type="text" value={content.hero.title} onChange={(e) => setContent({ ...content, hero: { ...content.hero, title: e.target.value } })} className="w-full h-12 px-4 border border-neutral-200 rounded-xl" placeholder="Titre" />
                  <textarea value={content.hero.subtitle} onChange={(e) => setContent({ ...content, hero: { ...content.hero, subtitle: e.target.value } })} rows={2} className="w-full p-4 border border-neutral-200 rounded-xl" placeholder="Sous-titre" />
                </div>
              )}
            </div>

            <div>
              <SectionHeader id="ecosystem" title="L'écosystème" icon={Building2} />
              {openSections['ecosystem'] && (
                <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <input type="text" value={content.ecosystem.title} onChange={(e) => setContent({ ...content, ecosystem: { ...content.ecosystem, title: e.target.value } })} className="w-full h-12 px-4 border border-neutral-200 rounded-xl" />
                  <textarea value={content.ecosystem.description} onChange={(e) => setContent({ ...content, ecosystem: { ...content.ecosystem, description: e.target.value } })} rows={4} className="w-full p-4 border border-neutral-200 rounded-xl" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {content.ecosystem.cards.map((card, idx) => (
                      <div key={idx} className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                        <label className="block text-primary font-bold text-xs uppercase mb-2">{card.label}</label>
                        <textarea value={card.description} onChange={(e) => {
                          const newCards = [...content.ecosystem.cards];
                          newCards[idx].description = e.target.value;
                          setContent({ ...content, ecosystem: { ...content.ecosystem, cards: newCards } });
                        }} className="w-full p-3 text-sm bg-white border border-neutral-200 rounded-lg h-24" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <SectionHeader id="mot" title="Mot du Président" icon={Quote} />
              {openSections['mot'] && (
                <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <input type="text" value={content.motPresident.section_title} onChange={(e) => setContent({ ...content, motPresident: { ...content.motPresident, section_title: e.target.value } })} className="w-full h-12 px-4 border border-neutral-200 rounded-xl font-bold" />
                  <input type="text" value={content.motPresident.quote_title} onChange={(e) => setContent({ ...content, motPresident: { ...content.motPresident, quote_title: e.target.value } })} className="w-full h-12 px-4 border border-neutral-200 rounded-xl italic" />
                  <div className="grid grid-cols-2 gap-6">
                    <input type="text" value={content.motPresident.name} onChange={(e) => setContent({ ...content, motPresident: { ...content.motPresident, name: e.target.value } })} className="w-full h-12 px-4 border border-neutral-200 rounded-xl" placeholder="Nom" />
                    <input type="text" value={content.motPresident.role} onChange={(e) => setContent({ ...content, motPresident: { ...content.motPresident, role: e.target.value } })} className="w-full h-12 px-4 border border-neutral-200 rounded-xl" placeholder="Fonction" />
                  </div>
                  <input type="text" value={content.motPresident.photo} onChange={(e) => setContent({ ...content, motPresident: { ...content.motPresident, photo: e.target.value } })} className="w-full h-12 px-4 border border-neutral-200 rounded-xl" placeholder="URL Photo" />
                  <div className="space-y-4">
                    <label className="block text-sm font-bold">Paragraphes du message</label>
                    {content.motPresident.quote_paragraphs.map((p, idx) => (
                      <div key={idx} className="flex gap-2">
                        <textarea value={p} onChange={(e) => {
                          const newP = [...content.motPresident.quote_paragraphs];
                          newP[idx] = e.target.value;
                          setContent({ ...content, motPresident: { ...content.motPresident, quote_paragraphs: newP } });
                        }} className="w-full p-3 border border-neutral-200 rounded-xl h-24 text-sm" />
                        <button onClick={() => setContent({ ...content, motPresident: { ...content.motPresident, quote_paragraphs: content.motPresident.quote_paragraphs.filter((_, i) => i !== idx) } })} className="text-neutral-400 hover:text-red-500"><Trash2 size={18} /></button>
                      </div>
                    ))}
                    <button onClick={() => setContent({ ...content, motPresident: { ...content.motPresident, quote_paragraphs: [...content.motPresident.quote_paragraphs, ""] } })} className="text-primary font-bold text-sm flex items-center gap-1"><Plus size={16} /> Ajouter un paragraphe</button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <SectionHeader id="membres" title="Villes et Organisations Membres" icon={Users} />
              {openSections['membres'] && (
                <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 gap-4">
                    <input type="text" value={organisations.title} onChange={(e) => setOrganisations({ ...organisations, title: e.target.value })} className="w-full h-12 px-4 border border-neutral-200 rounded-xl font-bold" placeholder="Titre de la section" />
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <button onClick={() => setOrganisations({ ...organisations, membres: [{ id: Date.now().toString(), name: "", type: 'ville' }, ...organisations.membres] })} className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm font-semibold hover:bg-neutral-50"><MapPin size={16} /> + Ville</button>
                        <button onClick={() => setOrganisations({ ...organisations, membres: [{ id: Date.now().toString(), name: "", type: 'organisation' }, ...organisations.membres] })} className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm font-semibold hover:bg-neutral-50"><Building2 size={16} /> + Organisation</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                      {organisations.membres.map((membre, idx) => (
                        <div key={membre.id} className="bg-neutral-50 rounded-xl border border-neutral-200 p-3 flex items-center gap-3 group transition-all">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${membre.type === 'ville' ? 'bg-primary/10 text-primary' : 'bg-yellow-50 text-yellow-600'}`}>
                            {membre.type === 'ville' ? <MapPin size={16} /> : <Building2 size={16} />}
                          </div>
                          <input type="text" value={membre.name} onChange={(e) => {
                            const newM = [...organisations.membres];
                            newM[idx].name = e.target.value;
                            setOrganisations({ ...organisations, membres: newM });
                          }} className="flex-1 bg-transparent border-none focus:ring-0 font-semibold text-neutral-900 text-sm" placeholder="Nom" />
                          <button onClick={() => setOrganisations({ ...organisations, membres: organisations.membres.filter(m => m.id !== membre.id) })} className="p-1.5 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <SectionHeader id="partenaires" title="Partenaires Stratégiques" icon={ImageIcon} />
              {openSections['partenaires'] && (
                <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <input type="text" value={content.partenaires.title} onChange={(e) => setContent({ ...content, partenaires: { ...content.partenaires, title: e.target.value } })} className="w-full h-12 px-4 border border-neutral-200 rounded-xl" />
                  <div className="space-y-3">
                    {content.partenaires.items.map((p, idx) => (
                      <div key={idx} className="flex gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                        <input type="text" value={p.nom} onChange={(e) => {
                          const newP = [...content.partenaires.items];
                          newP[idx].nom = e.target.value;
                          setContent({ ...content, partenaires: { ...content.partenaires, items: newP } });
                        }} className="flex-1 h-10 px-3 border border-neutral-200 rounded-lg text-sm" placeholder="Nom" />
                        <input type="text" value={p.logo} onChange={(e) => {
                          const newP = [...content.partenaires.items];
                          newP[idx].logo = e.target.value;
                          setContent({ ...content, partenaires: { ...content.partenaires, items: newP } });
                        }} className="flex-1 h-10 px-3 border border-neutral-200 rounded-lg text-sm" placeholder="URL Logo" />
                        <button onClick={() => setContent({ ...content, partenaires: { ...content.partenaires, items: content.partenaires.items.filter((_, i) => i !== idx) } })} className="text-neutral-400 hover:text-red-500"><Trash2 size={18} /></button>
                      </div>
                    ))}
                    <button onClick={() => setContent({ ...content, partenaires: { ...content.partenaires, items: [...content.partenaires.items, { nom: '', logo: '' }] } })} className="text-primary font-bold text-sm flex items-center gap-1"><Plus size={16} /> Ajouter un partenaire</button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <SectionHeader id="cta" title="Appel à l'action (Bas de page)" icon={Globe} />
              {openSections['cta'] && (
                <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <input type="text" value={content.cta.title} onChange={(e) => setContent({ ...content, cta: { ...content.cta, title: e.target.value } })} className="w-full h-12 px-4 border border-neutral-200 rounded-xl" />
                  <textarea value={content.cta.body} onChange={(e) => setContent({ ...content, cta: { ...content.cta, body: e.target.value } })} rows={3} className="w-full p-4 border border-neutral-200 rounded-xl" />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
