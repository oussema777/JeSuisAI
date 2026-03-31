'use client';

import React, { useEffect, useState } from 'react';
import {
  ClipboardList, Inbox, UserCheck, FolderOpen, Plus,
  Newspaper, Users, Download, Settings, HelpCircle, Loader2, X as XIcon, CheckCircle
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { CarteMetrique } from '../components/admin/CarteMetrique';
import { HeaderAdmin } from '../components/admin/HeaderAdmin';
import { TableauCandidatures } from '../components/admin/TableauCandidatures';
import { Bouton } from '../components/ds/Bouton';
import { useAuth } from '../hooks/useAuth';

import { toast } from 'sonner';

interface TableauDeBordProps {
  onNavigate?: (page: string, params?: any) => void;
}

export function TableauDeBord({ onNavigate }: TableauDeBordProps) {
  const t = useTranslations('Admin.Dashboard');
  const tCommon = useTranslations('Common');
  const { profile, loading: authLoading, isSuperadmin, getAnnonceurVille, supabase } = useAuth();

  const [loading, setLoading] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportFilter, setExportFilter] = useState('all');

  const [stats, setStats] = useState({
    actives: 0,
    totalCandidatures: 0,
    enAttente: 0,
    profilsSoumis: 0,
    projetsSoumis: 0
  });

  const handleExportData = async () => {
    try {
      setExportLoading(true);
      let query = supabase
        .from('candidatures')
        .select(`
          id,
          nom_prenom,
          email,
          whatsapp,
          pays_residence,
          linkedin_url,
          lien_territoire,
          message,
          statut,
          created_at,
          opportunites!inner (
            intitule_action,
            created_by,
            annonceur_id
          )
        `);

      // Apply tenant filtering to only export own candidatures
      if (profile?.role === 'Admin') {
        if (profile.annonceur_id) {
          query = query.eq('opportunites.annonceur_id', profile.annonceur_id);
        } else {
          query = query.eq('opportunites.created_by', profile.id);
        }
      } else if (profile?.role === 'Annonceur') {
        query = query.eq('opportunites.created_by', profile.id);
      }

      if (exportFilter !== 'all') {
        query = query.eq('statut', exportFilter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.info("Aucune candidature trouvée pour ce filtre.");
        return;
      }

      const formattedData = data.map((item: any) => ({
        'Date': new Date(item.created_at).toLocaleDateString('fr-FR'),
        'Statut': item.statut,
        'Mission liée': item.opportunites?.intitule_action || 'Candidature spontanée',
        'Nom & prénom': item.nom_prenom,
        'Pays de résidence': item.pays_residence,
        'Email': item.email,
        'whatsapp': item.whatsapp,
        'Lien profil Linkedin': item.linkedin_url || '',
        'Lien avec le territoire': item.lien_territoire || '',
        'Message': item.message || ''
      }));

      const XLSX = await import('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Candidatures");
      XLSX.writeFile(workbook, `Export_Candidatures_${exportFilter}_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      setShowExportModal(false);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Erreur lors de l'exportation.");
    } finally {
      setExportLoading(false);
    }
  };

  useEffect(() => {
    async function fetchDashboardData() {
      // Don't fetch if still loading auth
      if (authLoading) {
        return;
      }
      
      // Don't fetch if no profile
      if (!profile) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const withTimeout = (promise: Promise<any>, ms: number) => {
          return Promise.race([
            promise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
          ]);
        };

        const applyTenantFilter = (q: any) => {
          if (profile?.role === 'Admin') {
            if (profile.annonceur_id) {
              return q.eq('annonceur_id', profile.annonceur_id);
            } else {
              return q.eq('created_by', profile.id);
            }
          }
          if (profile?.role === 'Annonceur') {
            return q.eq('created_by', profile.id);
          }
          return q;
        };

        // Candidatures are linked to opportunites, so filter via inner join
        const applyCandidatureTenantFilter = (q: any) => {
          if (isSuperadmin) return q;
          if (profile?.role === 'Admin' && profile.annonceur_id) {
            return q.eq('opportunites.annonceur_id', profile.annonceur_id);
          }
          return q.eq('opportunites.created_by', profile!.id);
        };

        // Profils/Projets soumis use ville-based filtering
        const userVille = getAnnonceurVille();
        const applyVilleFilter = (q: any) => {
          if (isSuperadmin || !userVille) return q;
          return q.or(`niveau_ciblage.eq.toutes,ville_specifique.eq."${userVille}",villes_multiples.cs.{"${userVille}"}`);
        };

        const results = await withTimeout(
          Promise.all([
            // Active missions — filter by annonceur_id/created_by
            applyTenantFilter(supabase.from('opportunites').select('*', { count: 'exact', head: true }).eq('statut_publication', 'publie')),
            // Total Candidatures — filter via opportunites join
            applyCandidatureTenantFilter(supabase.from('candidatures').select('*, opportunites!inner(annonceur_id, created_by)', { count: 'exact', head: true })),
            // Pending Candidatures
            applyCandidatureTenantFilter(supabase.from('candidatures').select('*, opportunites!inner(annonceur_id, created_by)', { count: 'exact', head: true }).eq('statut', 'nouvelle')),
            // Profils soumis — filter by ville
            applyVilleFilter(supabase.from('profils_soumis').select('*', { count: 'exact', head: true })),
            // Projets soumis — filter by ville
            applyVilleFilter(supabase.from('projets_soumis').select('*', { count: 'exact', head: true }))
          ]),
          10000
        );

        const [
          { count: activesCount },
          { count: totalCandCount },
          { count: pendingCount },
          { count: profilsCount },
          { count: projetsCount }
        ] = results as any[];

        setStats({
          actives: activesCount || 0,
          totalCandidatures: totalCandCount || 0,
          enAttente: pendingCount || 0,
          profilsSoumis: profilsCount || 0,
          projetsSoumis: projetsCount || 0
        });
      } catch (error: any) {
        console.error("Dashboard: Error fetching stats:", error?.message || error);
        // On error, we still want to stop loading
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [supabase, authLoading, profile]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-neutral-50 p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-64 bg-neutral-200 rounded" />
          <div className="h-24 bg-neutral-200 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-neutral-200 rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-neutral-200 rounded-xl" />
        </div>
      </div>
    );
  }

  const userName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : '';
  const isAnnonceur = profile?.role === 'Annonceur';

  return (
    <div className="w-full">
      <HeaderAdmin pageTitle="Tableau de bord" breadcrumb={[{ label: 'Accueil' }, { label: 'Tableau de bord' }]} />
      
      <div className="pt-20 lg:pt-24 space-y-8">
        {/* MESSAGE DE BIENVENUE DYNAMIQUE */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="text-neutral-900 mb-2" style={{ fontSize: '20px', fontWeight: 600 }}>
                {t('welcome', { name: profile?.first_name || 'Administrateur' })}
              </h3>
              <p className="text-neutral-600 mb-1" style={{ fontSize: '15px', fontWeight: 400 }}>
                {t('welcome_subtitle')}
              </p>
              <p className="text-neutral-600" style={{ fontSize: '15px', fontWeight: 400 }}>
                {t('pending_applications', { count: stats.totalCandidatures })}
              </p>
            </div>
            <Bouton variant="primaire" onClick={() => onNavigate?.('admin-creer-opportunite', { supabase })}>
              <Plus className="w-5 h-5" strokeWidth={2} />
              {t('create_mission')}
            </Bouton>
          </div>
        </div>

        {/* SECTION 2: ACTIONS RAPIDES */}
        <div className="bg-gradient-to-br from-primary/8 to-primary/5 rounded-xl p-6 lg:p-8">
          <h4 className="text-neutral-900 text-center mb-6" style={{ fontSize: '18px', fontWeight: 600 }}>
            {t('quick_actions')}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            <button
              onClick={() => onNavigate?.('admin-creer-opportunite', { supabase })}
              className="bg-white rounded-lg p-5 flex flex-col items-center gap-3 hover:shadow-lg hover:scale-105 transition-all w-full"
            >
              <Plus className="w-8 h-8 text-primary" strokeWidth={2} />
              <span className="text-neutral-900 text-center" style={{ fontSize: '14px', fontWeight: 600 }}>
                {t('create_mission')}
              </span>
            </button>

            <button
              onClick={() => onNavigate?.('admin-creer-actualite', { supabase })}
              className="bg-white rounded-lg p-5 flex flex-col items-center gap-3 hover:shadow-lg hover:scale-105 transition-all w-full"
            >
              <Newspaper className="w-8 h-8 text-primary" strokeWidth={2} />
              <span className="text-neutral-900 text-center" style={{ fontSize: '14px', fontWeight: 600 }}>
                {t('publish_news')}
              </span>
            </button>

            {!isAnnonceur && (
              <button
                onClick={() => onNavigate?.('admin-candidatures', { supabase })}
                className="bg-white rounded-lg p-5 flex flex-col items-center gap-3 hover:shadow-lg hover:scale-105 transition-all w-full"
              >
                <Users className="w-8 h-8 text-primary" strokeWidth={2} />
                <span className="text-neutral-900 text-center" style={{ fontSize: '14px', fontWeight: 600 }}>
                  {t('view_applications')}
                </span>
              </button>
            )}

            {!isAnnonceur && (
              <button
                onClick={() => setShowExportModal(true)}
                className="bg-white rounded-lg p-5 flex flex-col items-center gap-3 hover:shadow-lg hover:scale-105 transition-all w-full"
              >
                <Download className="w-8 h-8 text-primary" strokeWidth={2} />
                <span className="text-neutral-900 text-center" style={{ fontSize: '14px', fontWeight: 600 }}>
                  {t('download_applications')}
                </span>
              </button>
            )}

            <button
              onClick={() => onNavigate?.('admin-parametres', { supabase })}
              className="bg-white rounded-lg p-5 flex flex-col items-center gap-3 hover:shadow-lg hover:scale-105 transition-all w-full"
            >
              <Settings className="w-8 h-8 text-primary" strokeWidth={2} />
              <span className="text-neutral-900 text-center" style={{ fontSize: '14px', fontWeight: 600 }}>
                {t('manage_profile')}
              </span>
            </button>

            <button 
              onClick={() => onNavigate?.('admin-aide', { supabase })}
              className="bg-white rounded-lg p-5 flex flex-col items-center gap-3 hover:shadow-lg hover:scale-105 transition-all w-full"
            >
              <HelpCircle className="w-8 h-8 text-primary" strokeWidth={2} />
              <span className="text-neutral-900 text-center" style={{ fontSize: '14px', fontWeight: 600 }}>
                {t('access_help')}
              </span>
            </button>
          </div>
        </div>

        {/* SECTION METRIQUES DYNAMIQUES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <CarteMetrique
            icon={<ClipboardList className="w-8 h-8" />}
            nombre={stats.actives.toString()}
            label={t('metrics.active_missions')}
            changement="En ligne"
            changeType="positive"
            iconColor="text-primary"
            onClick={() => onNavigate?.('admin-opportunites')}
          />
          <CarteMetrique
            icon={<Inbox className="w-8 h-8" />}
            nombre={stats.totalCandidatures.toString()}
            label={t('metrics.received_applications')}
            changement={stats.enAttente > 0 ? `${stats.enAttente} en attente` : 'Aucune en attente'}
            changeType={stats.enAttente > 0 ? "alert" : "positive"}
            iconColor="text-blue-600"
            onClick={() => onNavigate?.('admin-candidatures')}
          />
          <CarteMetrique
            icon={<UserCheck className="w-8 h-8" />}
            nombre={stats.profilsSoumis.toString()}
            label={t('metrics.submitted_profiles')}
            changement="Profils diaspora"
            changeType="positive"
            iconColor="text-purple-600"
            onClick={() => onNavigate?.('admin-profils')}
          />
          <CarteMetrique
            icon={<FolderOpen className="w-8 h-8" />}
            nombre={stats.projetsSoumis.toString()}
            label={t('metrics.submitted_projects')}
            changement="Projets diaspora"
            changeType="positive"
            iconColor="text-green-600"
            onClick={() => onNavigate?.('admin-projets')}
          />
        </div>

        {/* TABLEAU DES CANDIDATURES */}
        {!isAnnonceur && (
          <div className="w-full">
            <TableauCandidatures
              onViewApplication={(id) => onNavigate?.('detail-candidature', { applicationId: id })}
            />
          </div>
        )}

        <footer className="mt-8 pt-8 border-t border-neutral-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="text-neutral-600" style={{ fontSize: '13px', fontWeight: 400 }}>
              © 2024 Jesuisaucameroun.com
            </div>
            <div className="flex flex-wrap justify-center items-center gap-4 lg:gap-6">
              <a href="/admin/aide" className="text-neutral-600 hover:text-primary transition-colors text-sm">Aide</a>
              <a href="/admin/aide" className="text-neutral-600 hover:text-primary transition-colors text-sm">Documentation</a>
              <a href="/contact" className="text-neutral-600 hover:text-primary transition-colors text-sm">Contact support</a>
            </div>
            <div className="text-neutral-500" style={{ fontSize: '13px', fontWeight: 400 }}>
              v1.2.0
            </div>
          </div>
        </footer>

        {/* MODAL D'EXPORTATION */}
        {showExportModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-label="Télécharger les candidatures">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-neutral-900">Télécharger les candidatures</h3>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                  aria-label="Fermer"
                >
                  <XIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-neutral-700 block">
                    Filtrer par statut
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'all', label: 'Toutes les candidatures' },
                      { id: 'nouvelle', label: 'Nouvelles uniquement' },
                      { id: 'en_attente', label: 'En attente' },
                      { id: 'repondu', label: 'Répondues' },
                      { id: 'archive', label: 'Archivées' }
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setExportFilter(option.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                          exportFilter === option.id 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-neutral-100 hover:border-neutral-200 text-neutral-600'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          exportFilter === option.id ? 'border-primary' : 'border-neutral-300'
                        }`}>
                          {exportFilter === option.id && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}
                        </div>
                        <span className="font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-blue-700 text-sm leading-relaxed">
                    Le fichier sera téléchargé au format <strong>Excel (.xlsx)</strong> et inclura les coordonnées complètes.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-neutral-50 flex gap-3">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 px-6 py-3 border border-neutral-200 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-100 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleExportData}
                  disabled={exportLoading}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {exportLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                  <span>Télécharger</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}