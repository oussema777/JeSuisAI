'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from '@/i18n/routing';
import { 
  Search, Download, Eye, Inbox, MapPin, 
  Clock, CheckCircle, AlertCircle, Loader2, X as XIcon 
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SidebarAdmin } from '../components/admin/SidebarAdmin';
import { HeaderAdmin } from '../components/admin/HeaderAdmin';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';

export default function BoiteReceptionCandidatures() {
  const t = useTranslations('Admin.Applications');
  const tCommon = useTranslations('Common');
  const params = useParams();
  const currentLocale = params.locale as string || 'fr';
  const router = useRouter();
  const { profile, loading: authLoading, isSuperadmin, supabase } = useAuth();

  // --- State ---
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'toutes' | 'nouvelle' | 'en_attente' | 'repondu'>('toutes');
  const [sortBy, setSortBy] = useState('created_at_desc');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportFilter, setExportFilter] = useState('all');
  const [stats, setStats] = useState({ total: 0, nouvelles: 0, enAttente: 0, repondues: 0 });
  const abortControllerRef = useRef<AbortController | null>(null);

  // --- Helpers ---
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  
  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '??';
  };

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    // Don't fetch if still loading auth
    if (authLoading || !profile) {
      return;
    }

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    setLoading(true);
    try {
      // 1. Prepare Main Data Query
      let query = supabase
        .from('candidatures')
        .select(`
          id, created_at, nom_prenom, pays_residence, statut,
          opportunites!inner ( intitule_action, created_by, annonceur_id )
        `, { abortSignal: abortControllerRef.current.signal } as any);

      if (!isSuperadmin) {
        if (profile.role === 'Admin' && profile.annonceur_id) {
          query = query.eq('opportunites.annonceur_id', profile.annonceur_id);
        } else {
          query = query.eq('opportunites.created_by', profile.id);
        }
      }
      if (activeTab !== 'toutes') query = query.eq('statut', activeTab);
      if (searchQuery) query = query.ilike('nom_prenom', `%${searchQuery}%`);
      
      query = query.order('created_at', { ascending: sortBy === 'created_at_asc' });

      // 2. Prepare Stats Query
      let statsQuery = supabase
        .from('candidatures')
        .select(`statut, opportunites!inner ( created_by, annonceur_id )`, { abortSignal: abortControllerRef.current.signal } as any);

      if (!isSuperadmin) {
        if (profile.role === 'Admin' && profile.annonceur_id) {
          statsQuery = statsQuery.eq('opportunites.annonceur_id', profile.annonceur_id);
        } else {
          statsQuery = statsQuery.eq('opportunites.created_by', profile.id);
        }
      }

      // 3. Execute both in parallel for speed
      const [resultResponse, statsResponse] = await Promise.all([
        query,
        statsQuery
      ]);

      if (resultResponse.error) throw resultResponse.error;
      setData(resultResponse.data || []);

      if (statsResponse.data) {
        const sData = statsResponse.data;
        setStats({
          total: sData.length,
          nouvelles: sData.filter(i => i.statut === 'nouvelle').length,
          enAttente: sData.filter(i => i.statut === 'en_attente').length,
          repondues: sData.filter(i => i.statut === 'repondu').length,
        });
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery, sortBy, profile, authLoading, isSuperadmin, supabase]);

  useEffect(() => { 
    if (!authLoading) {
      if (profile?.role === 'Annonceur') {
        router.push('/admin/dashboard');
        return;
      }
      if (profile) {
        fetchData();
      } else {
        setLoading(false);
      }
    }
    
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [fetchData, authLoading, profile, router]);

  const handleExportData = async () => {
    try {
      setExportLoading(true);
      let query = supabase.from('candidatures').select(`
        id,
        nom_prenom,
        email,
        whatsapp,
        pays_residence,
        statut,
        created_at,
        linkedin_url,
        lien_territoire,
        message,
        opportunites!inner (intitule_action, created_by, annonceur_id)
      `);

      // Apply tenant filtering (same as fetchData)
      if (!isSuperadmin && profile) {
        if (profile.role === 'Admin' && profile.annonceur_id) {
          query = query.eq('opportunites.annonceur_id', profile.annonceur_id);
        } else {
          query = query.eq('opportunites.created_by', profile.id);
        }
      }

      if (exportFilter !== 'all') query = query.eq('statut', exportFilter);

      const { data: exportData, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      const formattedData = exportData.map((item: any) => ({
        'Date': new Date(item.created_at).toLocaleDateString('fr-FR'),
        'Statut': item.statut,
        'Mission liée': item.opportunites?.intitule_action || 'Candidature spontanée',
        'Nom & prénom': item.nom_prenom,
        'Pays de résidence': item.pays_residence,
        'Email': item.email,
        'Whatsapp': item.whatsapp,
        'Lien profil Linkedin': item.linkedin_url || 'Non renseigné',
        'Lien avec le territoire': item.lien_territoire || 'Non renseigné',
        'Message': item.message || ''
      }));

      const XLSX = await import('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Candidatures");
      XLSX.writeFile(workbook, `Export_Candidatures_${new Date().toISOString().split('T')[0]}.xlsx`);
      setShowExportModal(false);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Erreur lors de l'exportation.");
    } finally {
      setExportLoading(false);
    }
  };

  if (authLoading) return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
    </div>
  );

  if (!profile) return (
    <div className="p-20 text-center">
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h3 className="text-xl font-semibold">Accès non autorisé</h3>
    </div>
  );

  return (
    <div className="w-full pb-10">
      <HeaderAdmin pageTitle={t('title')} breadcrumb={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: tCommon('applications') }]} />
      
      <div className="pt-20 lg:pt-24 space-y-6 px-4 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <FilterCard label={t('filter_all')} count={stats.total} icon={<Inbox className="w-7 h-7 text-blue-500" />} active={activeTab === 'toutes'} onClick={() => setActiveTab('toutes')} color="blue" />
          <FilterCard label={t('filter_new')} count={stats.nouvelles} icon={<AlertCircle className="w-7 h-7 text-orange-500" />} active={activeTab === 'nouvelle'} onClick={() => setActiveTab('nouvelle')} color="orange" />
          <FilterCard label={t('filter_pending')} count={stats.enAttente} icon={<Clock className="w-7 h-7 text-red-500" />} active={activeTab === 'en_attente'} onClick={() => setActiveTab('en_attente')} color="red" />
          <FilterCard label={t('filter_responded')} count={stats.repondues} icon={<CheckCircle className="w-7 h-7 text-green-500" />} active={activeTab === 'repondu'} onClick={() => setActiveTab('repondu')} color="green" />
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4">
          <div className="flex items-center w-full h-11 border border-neutral-300 rounded-lg focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all bg-white">
            <Search className="ml-3 mr-2 text-neutral-400 flex-shrink-0" size={18} strokeWidth={2} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_placeholder')}
              className="flex-1 h-full pr-4 border-none outline-none bg-transparent"
            />
          </div>
          
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              <TabButton label={tCommon('all')} count={stats.total} isActive={activeTab === 'toutes'} onClick={() => setActiveTab('toutes')} />
              <TabButton label={t('filter_new')} count={stats.nouvelles} isActive={activeTab === 'nouvelle'} onClick={() => setActiveTab('nouvelle')} dotColor="bg-orange-500" />
              <TabButton label={t('filter_responded')} count={stats.repondues} isActive={activeTab === 'repondu'} onClick={() => setActiveTab('repondu')} />
            </div>
            
            <div className="flex gap-2">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="h-10 px-3 border rounded-lg text-sm bg-white">
                <option value="created_at_desc">{t('sort_recent')}</option>
                <option value="created_at_asc">{t('sort_old')}</option>
              </select>
              <button onClick={() => setShowExportModal(true)} className="h-10 px-4 rounded-lg border bg-white flex items-center gap-2 text-sm font-semibold hover:bg-neutral-50 transition-colors">
                <Download className="w-4 h-4" /> {t('download_button')}
              </button>
            </div>
          </div>
        </div>

        {/* Content Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="divide-y divide-neutral-200">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                  <div className="h-10 w-10 bg-neutral-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 bg-neutral-200 rounded" />
                    <div className="h-3 w-32 bg-neutral-200 rounded" />
                  </div>
                  <div className="h-6 w-20 bg-neutral-200 rounded-full" />
                  <div className="h-8 w-24 bg-neutral-200 rounded-lg" />
                </div>
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="py-20 text-center">
              <Inbox className="w-16 h-16 text-neutral-200 mx-auto mb-4" />
              <p className="text-neutral-500">{t('empty_state')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-neutral-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase">{t('table.candidate')}</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase">{t('table.mission')}</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase">{t('table.date')}</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase">{t('table.status')}</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-neutral-500 uppercase">{t('table.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.map((app) => (
                    <tr key={app.id} onClick={() => router.push(`/admin/candidatures/${app.id}`)} className="hover:bg-neutral-50 cursor-pointer transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                            {getInitials(app.nom_prenom)}
                          </div>
                          <div>
                            <div className="font-semibold text-neutral-900">{app.nom_prenom}</div>
                            <div className="text-xs text-neutral-500 flex items-center gap-1"><MapPin size={12}/> {app.pays_residence}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{app.opportunites?.intitule_action || 'Candidature spontanée'}</td>
                      <td className="px-6 py-4 text-sm font-medium">{formatDate(app.created_at)}</td>
                      <td className="px-6 py-4"><StatusBadge status={app.statut} /></td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-primary hover:bg-primary/5 p-2 rounded-lg transition-colors inline-flex items-center gap-1 font-semibold text-sm">
                          <Eye size={16}/> {tCommon('view')}
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

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={t('export_modal.title')}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
             <div className="p-6 border-b flex justify-between items-center bg-neutral-50/50">
                <h3 className="text-lg font-bold text-neutral-900">{t('export_modal.title')}</h3>
                <button 
                  onClick={() => setShowExportModal(false)} 
                  className="p-2 hover:bg-neutral-200 rounded-full transition-colors"
                  aria-label={currentLocale === 'en' ? 'Close' : 'Fermer'}
                >
                  <XIcon size={20} />
                </button>
             </div>
             <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-700">{t('export_modal.filter_label')}</label>
                  <select 
                    className="w-full border border-neutral-300 p-3 rounded-xl outline-none bg-white focus:ring-2 focus:ring-primary/20 transition-all"
                    value={exportFilter}
                    onChange={(e) => setExportFilter(e.target.value)}
                  >
                    <option value="all">{currentLocale === 'en' ? 'All applications' : 'Toutes les candidatures'}</option>
                    <option value="nouvelle">{currentLocale === 'en' ? 'New only' : 'Nouvelles uniquement'}</option>
                    <option value="en_attente">{currentLocale === 'en' ? 'Pending only' : 'En attente uniquement'}</option>
                    <option value="repondu">{currentLocale === 'en' ? 'Responded only' : 'Répondues uniquement'}</option>
                  </select>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-blue-700 text-xs leading-relaxed font-medium">
                    {t('export_modal.description')}
                  </p>
                </div>

                <button 
                  onClick={handleExportData}
                  disabled={exportLoading}
                  className="w-full bg-primary text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-md shadow-primary/20 disabled:opacity-50"
                >
                  {exportLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Download size={20} />}
                  {t('download_button')}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sub-components ---
const FilterCard = ({ label, count, icon, active, onClick }: any) => (
  <button onClick={onClick} className={`bg-white rounded-xl p-5 shadow-sm transition-all border-2 flex flex-col items-center gap-1 ${active ? 'border-primary' : 'border-transparent'}`}>
    {icon}
    <div className="text-2xl font-bold text-neutral-900">{count}</div>
    <div className="text-xs text-neutral-500 font-medium">{label}</div>
  </button>
);

const TabButton = ({ label, count, isActive, onClick, dotColor }: any) => (
  <button onClick={onClick} className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap ${isActive ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-600'}`}>
    {label} ({count})
    {dotColor && <span className={`w-2 h-2 rounded-full ${dotColor}`} />}
  </button>
);

const StatusBadge = ({ status }: { status: string }) => {
  const config: any = {
    'nouvelle': { bg: 'bg-blue-500', label: 'Nouveau' },
    'en_attente': { bg: 'bg-orange-500', label: 'En attente' },
    'repondu': { bg: 'bg-green-500', label: 'Répondu' },
    'archive': { bg: 'bg-red-500', label: 'Refusée' }
  };
  const style = config[status] || config['nouvelle'];
  return (
    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold text-white uppercase tracking-wider ${style.bg}`}>
      {style.label}
    </span>
  );
};