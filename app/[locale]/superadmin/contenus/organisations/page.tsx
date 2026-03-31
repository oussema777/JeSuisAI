'use client';

import React, { useState, useEffect } from 'react';
import { SidebarSuperadmin } from '@/app/components/superadmin/Sidebarsuperadmin';
import { HeaderSuperadmin } from '@/app/components/superadmin/HeaderSuperadmin';
import { 
  Save, 
  Loader2, 
  Building2,
  MapPin,
  Plus,
  Trash2,
  Layout,
  Search,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Languages
} from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';

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

const DEFAULT_CONTENT: OrganisationsContent = {
  title: "Villes et organisations membres",
  subtitle: "Rejoignez un réseau d'acteurs engagés pour le développement local",
  membres: [
    { id: '1', name: 'Association des Maires de Villes du Cameroun', type: 'organisation' },
    { id: '2', name: 'Bafoussam', type: 'ville' },
    { id: '3', name: 'Bamenda', type: 'ville' },
    { id: '4', name: 'Bertoua', type: 'ville' },
    { id: '5', name: 'Douala', type: 'ville' },
    { id: '6', name: 'Ebolowa', type: 'ville' },
    { id: '7', name: 'Edéa', type: 'ville' },
    { id: '8', name: 'Garoua', type: 'ville' },
    { id: '9', name: 'Kribi', type: 'ville' },
    { id: '10', name: 'Kumba', type: 'ville' },
    { id: '11', name: 'Limbe', type: 'ville' },
    { id: '12', name: 'Maroua', type: 'ville' },
    { id: '13', name: 'Ngaoundéré', type: 'ville' },
    { id: '14', name: 'Nkongsamba', type: 'ville' },
    { id: '15', name: 'Yaoundé', type: 'ville' },
    { id: '16', name: 'Aéroport du Cameroun S.A', type: 'organisation' }
  ]
};

export default function OrganisationsManagement() {
  const params = useParams();
  const [currentLocale, setCurrentLocale] = useState(params.locale as string || 'fr');
  const [content, setContent] = useState<OrganisationsContent>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const supabase = getSupabaseBrowserClient();

  useEffect(() => { fetchContent(); }, [currentLocale]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('static_contents').select('content').eq('key', 'organisations-global').eq('lang', currentLocale).maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      if (data && data.content) {
        setContent(data.content as OrganisationsContent);
      } else {
        setContent(DEFAULT_CONTENT);
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
      const { error } = await supabase.from('static_contents').upsert({
        key: 'organisations-global', 
        lang: currentLocale,
        title: `Liste des Organisations Membres (${currentLocale.toUpperCase()})`, 
        content: content, 
        updated_at: new Date().toISOString()
      });
      if (error) {
        console.error('Supabase error:', error);
        toast.error(`Erreur database: ${error.message}`);
        return;
      }
      toast.success(`Liste (${currentLocale.toUpperCase()}) mise à jour avec succès`);
    } catch (err: any) {
      console.error('Error saving content:', err);
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

  const filteredMembres = content.membres.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) {
    return (
      <div className="min-h-screen bg-page-bg flex">
        <SidebarSuperadmin activePage="contenus-statiques" activeSubPage="organisations" />
        <div className="flex-1 flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-bg flex">
      <SidebarSuperadmin activePage="contenus-statiques" activeSubPage="organisations" />
      <main className="flex-1 ml-[260px] p-8 mt-16 lg:mt-0">
        <HeaderSuperadmin pageTitle="Gestion des Organisations" />
        
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
              </button>
            </div>
            <div className="bg-primary/5 border border-primary/10 rounded-xl px-4 py-2.5 flex items-center gap-3 text-primary">
              <Languages className="w-4 h-4" />
              <p className="text-xs font-bold uppercase tracking-wider">
                Edition : {currentLocale === 'fr' ? 'Français' : 'English'}
              </p>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all flex items-center gap-2 font-semibold shadow-lg disabled:opacity-50">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} 
            Enregistrer la version {currentLocale.toUpperCase()}
          </button>
        </div>

        <div className="space-y-4 max-w-4xl pb-20">
          <div>
            <SectionHeader id="header" title="En-tête de section" icon={Layout} />
            {openSections['header'] && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <input type="text" value={content.title} onChange={(e) => setContent({ ...content, title: e.target.value })} className="w-full h-11 px-4 border border-neutral-200 rounded-xl" placeholder="Titre" />
                <input type="text" value={content.subtitle} onChange={(e) => setContent({ ...content, subtitle: e.target.value })} className="w-full h-11 px-4 border border-neutral-200 rounded-xl" placeholder="Sous-titre" />
              </div>
            )}
          </div>

          <div>
            <SectionHeader id="list" title="Liste des Membres" icon={Building2} />
            {openSections['list'] && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2">
                    <button onClick={() => setContent({ ...content, membres: [{ id: Date.now().toString(), name: "", type: 'ville' }, ...content.membres] })} className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm font-semibold hover:bg-neutral-50"><MapPin size={16} /> + Ville</button>
                    <button onClick={() => setContent({ ...content, membres: [{ id: Date.now().toString(), name: "", type: 'organisation' }, ...content.membres] })} className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm font-semibold hover:bg-neutral-50"><Building2 size={16} /> + Organisation</button>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input type="text" placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {filteredMembres.map((membre) => (
                    <div key={membre.id} className="bg-neutral-50 rounded-xl border border-neutral-200 p-4 flex items-center gap-4 group transition-all">
                      <div className="text-neutral-300"><GripVertical size={20} /></div>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${membre.type === 'ville' ? 'bg-primary/10 text-primary' : 'bg-yellow-50 text-yellow-600'}`}>
                        {membre.type === 'ville' ? <MapPin size={20} /> : <Building2 size={20} />}
                      </div>
                      <input type="text" value={membre.name} onChange={(e) => setContent({ ...content, membres: content.membres.map(m => m.id === membre.id ? { ...m, name: e.target.value } : m) })} className="flex-1 bg-transparent border-none focus:ring-0 font-semibold text-neutral-900" placeholder="Nom" />
                      <button onClick={() => setContent({ ...content, membres: content.membres.filter(m => m.id !== membre.id) })} className="p-2 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
