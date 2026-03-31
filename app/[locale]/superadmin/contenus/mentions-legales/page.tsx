'use client';

import React, { useState, useEffect } from 'react';
import { SidebarSuperadmin } from '@/app/components/superadmin/Sidebarsuperadmin';
import { HeaderSuperadmin } from '@/app/components/superadmin/HeaderSuperadmin';
import { 
  Save, 
  Loader2, 
  Building2,
  Server,
  Camera,
  User,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Layout,
  Languages
} from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';

interface MentionsLegalesContent {
  editeur: { name: string; address: string; line2: string; url: string; };
  directeur: { name: string; email: string; };
  hebergement: { name: string; address: string; url: string; };
  credits: Array<{ name: string; url: string }>;
}

const DEFAULT_CONTENT: MentionsLegalesContent = {
  editeur: { name: "Impact Diaspora", address: "13006 Marseille", line2: "France - Sénégal", url: "https://www.impactdiaspora.fr" },
  directeur: { name: "Mr Samir BOUZIDI", email: "info@africandiaspora.best" },
  hebergement: { name: "OVH France", address: "Siège social: 2, rue Kellermann, 59100 Roubaix, France.", url: "https://www.ovhcloud.com" },
  credits: [ { name: "Freepik", url: "https://www.freepik.com" }, { name: "Unsplash", url: "https://unsplash.com" } ]
};

export default function MentionsLegalesManagement() {
  const params = useParams();
  const [currentLocale, setCurrentLocale] = useState(params.locale as string || 'fr');
  const [content, setContent] = useState<MentionsLegalesContent>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const supabase = getSupabaseBrowserClient();

  useEffect(() => { fetchContent(); }, [currentLocale]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('static_contents').select('content').eq('key', 'mentions-legales').eq('lang', currentLocale).maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      if (data && data.content) {
        setContent(data.content as MentionsLegalesContent);
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
        key: 'mentions-legales', 
        lang: currentLocale,
        title: `Mentions Légales (${currentLocale.toUpperCase()})`, 
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
      <SidebarSuperadmin activePage="contenus-statiques" activeSubPage="mentions-legales" />
      <main className="flex-1 ml-[260px] p-8 mt-16 lg:mt-0">
        <HeaderSuperadmin pageTitle="Mentions Légales" />
        
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
            <SectionHeader id="editeur" title="Éditeur" icon={Building2} />
            {openSections['editeur'] && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <input type="text" value={content.editeur.name} onChange={(e) => setContent({...content, editeur: {...content.editeur, name: e.target.value}})} className="w-full h-11 px-4 border border-neutral-200 rounded-xl" placeholder="Nom" />
                <input type="text" value={content.editeur.address} onChange={(e) => setContent({...content, editeur: {...content.editeur, address: e.target.value}})} className="w-full h-11 px-4 border border-neutral-200 rounded-xl" placeholder="Adresse" />
                <input type="text" value={content.editeur.url} onChange={(e) => setContent({...content, editeur: {...content.editeur, url: e.target.value}})} className="w-full h-11 px-4 border border-neutral-200 rounded-xl" placeholder="URL" />
              </div>
            )}
          </div>

          <div>
            <SectionHeader id="directeur" title="Direction de la publication" icon={User} />
            {openSections['directeur'] && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <input type="text" value={content.directeur.name} onChange={(e) => setContent({...content, directeur: {...content.directeur, name: e.target.value}})} className="w-full h-11 px-4 border border-neutral-200 rounded-xl" placeholder="Nom complet" />
                <input type="email" value={content.directeur.email} onChange={(e) => setContent({...content, directeur: {...content.directeur, email: e.target.value}})} className="w-full h-11 px-4 border border-neutral-200 rounded-xl" placeholder="Email" />
              </div>
            )}
          </div>

          <div>
            <SectionHeader id="hebergement" title="Hébergement" icon={Server} />
            {openSections['hebergement'] && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <input type="text" value={content.hebergement.name} onChange={(e) => setContent({...content, hebergement: {...content.hebergement, name: e.target.value}})} className="w-full h-11 px-4 border border-neutral-200 rounded-xl" placeholder="Hébergeur" />
                <input type="text" value={content.hebergement.address} onChange={(e) => setContent({...content, hebergement: {...content.hebergement, address: e.target.value}})} className="w-full h-11 px-4 border border-neutral-200 rounded-xl" placeholder="Siège social" />
                <input type="text" value={content.hebergement.url} onChange={(e) => setContent({...content, hebergement: {...content.hebergement, url: e.target.value}})} className="w-full h-11 px-4 border border-neutral-200 rounded-xl" placeholder="URL" />
              </div>
            )}
          </div>

          <div>
            <SectionHeader id="credits" title="Crédits Photos" icon={Camera} />
            {openSections['credits'] && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                {content.credits.map((credit, idx) => (
                  <div key={idx} className="flex gap-4 items-center bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                    <input type="text" value={credit.name} onChange={(e) => {
                      const newC = [...content.credits]; newC[idx].name = e.target.value; setContent({...content, credits: newC});
                    }} placeholder="Nom" className="flex-1 h-10 px-3 border border-neutral-200 rounded-lg text-sm bg-white" />
                    <input type="text" value={credit.url} onChange={(e) => {
                      const newC = [...content.credits]; newC[idx].url = e.target.value; setContent({...content, credits: newC});
                    }} placeholder="URL" className="flex-1 h-10 px-3 border border-neutral-200 rounded-lg text-sm bg-white" />
                    <button onClick={() => setContent({...content, credits: content.credits.filter((_, i) => i !== idx)})} className="text-neutral-400 hover:text-red-500"><Trash2 size={18} /></button>
                  </div>
                ))}
                <button onClick={() => setContent({...content, credits: [...content.credits, { name: "", url: "" }]})} className="text-primary font-bold text-sm flex items-center gap-1"><Plus size={16} /> Ajouter un crédit</button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
