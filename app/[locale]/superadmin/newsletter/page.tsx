'use client';

import React, { useState, useEffect } from 'react';
import { SidebarSuperadmin } from '@/app/components/superadmin/Sidebarsuperadmin';
import { HeaderSuperadmin } from '@/app/components/superadmin/HeaderSuperadmin';
import { 
  Mail, 
  Trash2, 
  Search, 
  Loader2, 
  Download,
  Calendar,
  MapPin,
  Briefcase,
  Heart,
  Phone
} from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface Subscription {
  id: string;
  created_at: string;
  email: string;
  whatsapp: string | null;
  ville: string | null;
  domaine: string | null;
  type_contribution: string | null;
}

export default function NewsletterSubscribers() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubs(data || []);
    } catch (err) {
      console.error('Error fetching subscribers:', err);
      toast.error('Erreur lors du chargement des abonnés');
    } finally {
      setLoading(false);
    }
  };

  const deleteSub = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cet abonné ?')) return;

    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSubs(subs.filter(s => s.id !== id));
      toast.success('Abonné supprimé');
    } catch (err) {
      console.error('Error deleting sub:', err);
      toast.error('Erreur lors de la suppression');
    }
  };

  const exportCSV = () => {
    const headers = ['Email', 'WhatsApp', 'Ville', 'Domaine', 'Contribution', 'Date'];
    const rows = subs.map(s => [
      s.email,
      s.whatsapp || '',
      s.ville || '',
      s.domaine || '',
      s.type_contribution || '',
      new Date(s.created_at).toLocaleDateString()
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "newsletter_subscribers.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSubs = subs.filter(s => 
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.ville && s.ville.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-page-bg flex">
      <SidebarSuperadmin activePage="newsletter" />
      
      <main className="flex-1 ml-[260px] pb-8">
        <HeaderSuperadmin pageTitle="Abonnés Newsletter" />
        
        <div className="p-8 mt-16 lg:mt-[72px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="mb-2 bg-primary/5 border border-primary/10 rounded-xl p-3 flex items-center gap-3 text-primary inline-flex">
                <Search className="w-4 h-4" />
                <p className="text-xs font-medium">Recherche rapide : CTRL + K</p>
              </div>
              <p className="text-neutral-600">
                {subs.length} personnes sont inscrites à la newsletter
              </p>
            </div>
            <button
              onClick={exportCSV}
              className="px-6 py-3 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-all flex items-center gap-2 font-semibold shadow-sm"
            >
              <Download className="w-5 h-5 text-primary" />
              Exporter CSV
            </button>
          </div>

          {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher par email ou ville..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white border border-neutral-200 rounded-xl shadow-sm focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-neutral-500">Chargement des abonnés...</p>
            </div>
          ) : filteredSubs.length === 0 ? (
            <div className="py-20 text-center">
              <Mail className="w-16 h-16 text-neutral-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Aucun abonné trouvé</h3>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Email</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Préférences</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Contact</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Date d&apos;inscription</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredSubs.map((sub) => (
                    <tr key={sub.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Mail size={14} />
                          </div>
                          <span className="font-semibold text-neutral-900">{sub.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {sub.ville && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-[11px] font-bold uppercase tracking-tight">
                              <MapPin size={10} /> {sub.ville}
                            </span>
                          )}
                          {sub.domaine && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded text-[11px] font-bold uppercase tracking-tight">
                              <Briefcase size={10} /> {sub.domaine}
                            </span>
                          )}
                          {sub.type_contribution && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded text-[11px] font-bold uppercase tracking-tight">
                              <Heart size={10} /> {sub.type_contribution}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {sub.whatsapp ? (
                          <a href={`https://wa.me/${sub.whatsapp.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-green-600 font-medium hover:underline">
                            <Phone size={14} /> {sub.whatsapp}
                          </a>
                        ) : (
                          <span className="text-neutral-400 text-sm italic">Non renseigné</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-neutral-400" />
                          {new Date(sub.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => deleteSub(sub.id)}
                          className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </div>
      </main>
    </div>
  );
}
