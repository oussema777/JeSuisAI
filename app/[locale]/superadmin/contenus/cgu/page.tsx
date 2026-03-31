'use client';

import React, { useState, useEffect } from 'react';
import { SidebarSuperadmin } from '@/app/components/superadmin/Sidebarsuperadmin';
import { HeaderSuperadmin } from '@/app/components/superadmin/HeaderSuperadmin';
import { 
  Save, 
  Loader2, 
  Shield,
  Plus,
  Trash2,
  Type,
  Layout,
  ChevronUp,
  ChevronDown,
  Languages
} from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';

interface PolicySection { id: string; title: string; content: string; note?: string; }
interface ProtectionDonneesContent { title: string; subtitle: string; intro: string; sections: PolicySection[]; }

const DEFAULT_CONTENT: ProtectionDonneesContent = {
  title: "Protection des données personnelles",
  subtitle: "Notre engagement pour la sécurité de vos informations",
  intro: "Respecter votre droit à la protection, à la sécurité et à la confidentialité de vos données, est notre priorité.",
  sections: [
    { id: "1", title: "Collecte des données", content: "En règle générale..." },
    { id: "2", title: "Base juridique", content: "En général..." }
  ]
};

export default function CGUManagement() {
  const params = useParams();
  const [currentLocale, setCurrentLocale] = useState(params.locale as string || 'fr');
  const [content, setContent] = useState<ProtectionDonneesContent>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const supabase = getSupabaseBrowserClient();

  useEffect(() => { fetchContent(); }, [currentLocale]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('static_contents').select('content').eq('key', 'cgu').eq('lang', currentLocale).maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      if (data && data.content) {
        setContent(data.content as ProtectionDonneesContent);
      } else {
        setContent(DEFAULT_CONTENT);
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
      const { error } = await supabase.from('static_contents').upsert({
        key: 'cgu', 
        lang: currentLocale,
        title: `Protection des Données / CGU (${currentLocale.toUpperCase()})`, 
        content: content, 
        updated_at: new Date().toISOString()
      });
      if (error) {
        console.error('Supabase error:', error);
        toast.error(`Erreur database: ${error.message}`);
        return;
      }
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
      <SidebarSuperadmin activePage="contenus-statiques" activeSubPage="cgu" />
      <main className="flex-1 ml-[260px] p-8 mt-16 lg:mt-0">
        <HeaderSuperadmin pageTitle="Protection des Données & CGU" />
        
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
          <button onClick={handleSave} disabled={saving} className="px-8 py-3 bg-primary text-white rounded-lg font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} 
            Enregistrer la version {currentLocale.toUpperCase()}
          </button>
        </div>

        <div className="space-y-4 max-w-4xl pb-20">
          <div>
            <SectionHeader id="header" title="En-tête de page" icon={Layout} />
            {openSections['header'] && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <input type="text" value={content.title} onChange={(e) => setContent({...content, title: e.target.value})} className="w-full h-11 px-4 border border-neutral-200 rounded-xl" placeholder="Titre" />
                <input type="text" value={content.subtitle} onChange={(e) => setContent({...content, subtitle: e.target.value})} className="w-full h-11 px-4 border border-neutral-200 rounded-xl" placeholder="Sous-titre" />
                <textarea value={content.intro} onChange={(e) => setContent({...content, intro: e.target.value})} rows={3} className="w-full p-4 border border-neutral-200 rounded-xl resize-none bg-primary/5" />
              </div>
            )}
          </div>

          <div>
            <SectionHeader id="sections" title="Sections de la politique" icon={Shield} />
            {openSections['sections'] && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                {content.sections.map((section, index) => (
                  <div key={section.id} className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4 group">
                    <div className="flex justify-between items-center">
                      <input type="text" value={section.title} onChange={(e) => setContent({...content, sections: content.sections.map(s => s.id === section.id ? {...s, title: e.target.value} : s)})} className="font-bold text-neutral-900 bg-transparent border-none focus:ring-0 p-0" />
                      <button onClick={() => setContent({...content, sections: content.sections.filter(s => s.id !== section.id)})} className="text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18} /></button>
                    </div>
                    <textarea value={section.content} onChange={(e) => setContent({...content, sections: content.sections.map(s => s.id === section.id ? {...s, content: e.target.value} : s)})} rows={4} className="w-full p-4 border border-neutral-200 rounded-xl text-sm" />
                    <input type="text" value={section.note || ''} onChange={(e) => setContent({...content, sections: content.sections.map(s => s.id === section.id ? {...s, note: e.target.value} : s)})} placeholder="Note optionnelle" className="w-full h-10 px-4 border border-neutral-200 rounded-xl text-sm bg-accent-yellow/5 italic" />
                  </div>
                ))}
                <button onClick={() => setContent({...content, sections: [...content.sections, {id: Date.now().toString(), title: "Nouvelle section", content: ""}]})} className="text-primary font-bold text-sm flex items-center gap-1"><Plus size={16} /> Ajouter une section</button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
