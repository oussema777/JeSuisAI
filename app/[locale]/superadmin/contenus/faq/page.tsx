'use client';

import React, { useState, useEffect } from 'react';
import { SidebarSuperadmin } from '@/app/components/superadmin/Sidebarsuperadmin';
import { HeaderSuperadmin } from '@/app/components/superadmin/HeaderSuperadmin';
import { 
  Plus, 
  Trash2, 
  Save, 
  ChevronUp, 
  ChevronDown, 
  MessageSquare,
  Loader2,
  AlertCircle,
  HelpCircle,
  GripVertical,
  Search,
  Languages
} from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export default function FAQManagement() {
  const params = useParams();
  const [currentLocale, setCurrentLocale] = useState(params.locale as string || 'fr');
  const [items, setItems] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    fetchFAQ();
  }, [currentLocale]);

  const fetchFAQ = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('static_contents')
        .select('content')
        .eq('key', 'faq')
        .eq('lang', currentLocale)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data && data.content && Array.isArray(data.content)) {
        setItems(data.content as FAQItem[]);
      } else {
        // Fallback to default if no content for this language yet
        setItems([]);
      }
    } catch (err) {
      console.error('Error fetching FAQ:', err);
      toast.error('Erreur lors du chargement de la FAQ');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('static_contents')
        .upsert({
          key: 'faq',
          lang: currentLocale,
          title: `Foire Aux Questions (${currentLocale.toUpperCase()})`,
          content: items,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Supabase error:', error);
        toast.error(`Erreur database: ${error.message}`);
        return;
      }
      toast.success(`FAQ (${currentLocale.toUpperCase()}) enregistrée avec succès`);
    } catch (err: any) {
      console.error('Error saving FAQ:', err);
      toast.error(`Erreur: ${err.message || "Erreur d'enregistrement"}`);
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => {
    const newItem: FAQItem = {
      id: Date.now().toString(),
      question: '',
      answer: ''
    };
    setItems([newItem, ...items]);
  };

  const removeItem = (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer cette question ?')) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof FAQItem, value: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newItems.length) {
      [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
      setItems(newItems);
    }
  };

  const filteredItems = items.filter(item => 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-page-bg flex">
      <SidebarSuperadmin activePage="contenus-statiques" activeSubPage="faq" />
      
      <main className="flex-1 ml-[260px] p-8 mt-16 lg:mt-0">
        <HeaderSuperadmin pageTitle="Gestion de la FAQ" />
        
        {/* Header */}
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
          <div className="flex gap-3">
            <button
              onClick={addItem}
              className="px-6 py-3 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-all flex items-center gap-2 font-semibold"
            >
              <Plus className="w-5 h-5 text-primary" />
              Nouvelle Question
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all flex items-center gap-2 font-semibold shadow-lg disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Enregistrer la version {currentLocale.toUpperCase()}
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher une question ou une réponse..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white border border-neutral-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-neutral-500">Chargement de la FAQ...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-2xl border border-neutral-200 shadow-sm">
              <HelpCircle className="w-16 h-16 text-neutral-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Aucune question trouvée</h3>
              <p className="text-neutral-500">Commencez par ajouter votre première question à la FAQ.</p>
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <div 
                key={item.id} 
                className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 group transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex gap-4">
                  {/* Reorder Controls */}
                  <div className="flex flex-col gap-1 items-center">
                    <button 
                      onClick={() => moveItem(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-neutral-400 hover:text-primary disabled:opacity-20"
                    >
                      <ChevronUp className="w-5 h-5" />
                    </button>
                    <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 text-sm font-bold">
                      {index + 1}
                    </div>
                    <button 
                      onClick={() => moveItem(index, 'down')}
                      disabled={index === items.length - 1}
                      className="p-1 text-neutral-400 hover:text-primary disabled:opacity-20"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Content Inputs */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-neutral-700 mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>
                        Question
                      </label>
                      <input
                        type="text"
                        value={item.question}
                        onChange={(e) => updateItem(item.id, 'question', e.target.value)}
                        placeholder="Ex: Comment puis-je soumettre un projet ?"
                        className="w-full h-11 px-4 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-neutral-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-700 mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>
                        Réponse
                      </label>
                      <textarea
                        value={item.answer}
                        onChange={(e) => updateItem(item.id, 'answer', e.target.value)}
                        placeholder="Détaillez la réponse ici..."
                        rows={4}
                        className="w-full p-4 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-neutral-50/50 resize-none"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-neutral-400 hover:text-accent rounded-lg hover:bg-accent/5 transition-all"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Warning Box */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-blue-800 text-sm">
            <strong>Note importante :</strong> N&apos;oubliez pas d&apos;enregistrer vos modifications. La FAQ sera mise à jour instantanément pour tous les utilisateurs du site une fois le bouton "Enregistrer" cliqué.
          </p>
        </div>
      </main>
    </div>
  );
}
