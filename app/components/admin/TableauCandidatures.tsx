'use client';

import React, { useEffect, useState } from 'react';
import { Eye, Loader2, Inbox } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/app/hooks/useAuth';

// 2. Types
interface CandidatureDB {
  id: number;
  nom_prenom: string;
  created_at: string;
  statut: string;
  opportunites: Array<{
    titre: string;
  }>;
}

// ✅ NEW: Define Props Interface
interface TableauCandidaturesProps {
  onViewApplication?: (id: number) => void;
  onViewAllHref?: string;
}

export function TableauCandidatures({ 
  onViewApplication, 
  onViewAllHref = '/admin/candidatures' // Default value
}: TableauCandidaturesProps) {
  const { supabase, loading: authLoading, profile } = useAuth();
  const [candidatures, setCandidatures] = useState<CandidatureDB[]>([]);
  const [loading, setLoading] = useState(true);

  // 3. Fetch Data
  useEffect(() => {
    const fetchRecentCandidatures = async () => {
      if (authLoading || !profile) return;

      try {
        setLoading(true);
        
        // 1. Start query for candidatures
        let query = supabase
          .from('candidatures')
          .select('*');

        // 2. Filter for Admins/Annonceurs: only show candidatures for THEIR city's/organization's missions
        if (profile.role === 'Admin') {
          let missionIds: string[] = [];
          
          if (profile.annonceur_id) {
            const { data } = await supabase.from('opportunites').select('id').eq('annonceur_id', profile.annonceur_id);
            if (data) missionIds = data.map(m => m.id);
          } else {
            const { data } = await supabase.from('opportunites').select('id').eq('created_by', profile.id);
            if (data) missionIds = data.map(m => m.id);
          }

          if (missionIds.length > 0) {
            query = query.in('opportunite_id', missionIds);
          } else {
            setCandidatures([]);
            setLoading(false);
            return;
          }
        } else if (profile.role === 'Annonceur') {
          // Get IDs of missions created by this user
          const { data: userMissions } = await supabase
            .from('opportunites')
            .select('id')
            .eq('created_by', profile.id);

          if (userMissions && userMissions.length > 0) {
            const missionIds = userMissions.map(m => m.id);
            query = query.in('opportunite_id', missionIds);
          } else {
            // If no missions, show nothing
            setCandidatures([]);
            setLoading(false);
            return;
          }
        }

        const { data: candData, error: candError } = await query
          .order('created_at', { ascending: false })
          .limit(5);

        if (candError) throw candError;

        if (candData && candData.length > 0) {
          // 3. Fetch related mission titles separately
          const missionIds = Array.from(new Set(candData.map(c => c.opportunite_id).filter(Boolean)));
          
          let missionsInfo: Record<number, string> = {};
          if (missionIds.length > 0) {
            const { data: mData } = await supabase
              .from('opportunites')
              .select('id, intitule_action')
              .in('id', missionIds);
            
            if (mData) {
              missionsInfo = mData.reduce((acc: any, curr: any) => {
                acc[curr.id] = curr.intitule_action;
                return acc;
              }, {});
            }
          }

          // 4. Map together
          const mappedData = candData.map(c => ({
            ...c,
            opportunites: missionsInfo[c.opportunite_id] 
              ? [{ titre: missionsInfo[c.opportunite_id] }] 
              : []
          }));

          setCandidatures(mappedData);
        } else {
          setCandidatures([]);
        }
      } catch (err) {
        console.error("Error fetching recent candidatures:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentCandidatures();
  }, [supabase, authLoading, profile]);

  // 4. Helpers
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 3600) return 'À l\'instant';
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'nouvelle':
        return { label: 'Nouveau', style: 'bg-blue-50 text-blue-700' };
      case 'en-attente':
        return { label: 'En attente', style: 'bg-[#D4A800]/10 text-[#D4A800]' };
      case 'repondue':
        return { label: 'Répondu', style: 'bg-green-50 text-green-700' };
      case 'refusee':
        return { label: 'Refusé', style: 'bg-red-50 text-red-700' };
      default:
        return { label: status, style: 'bg-neutral-100 text-neutral-700' };
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 shrink-0">
        <h4 className="text-neutral-900" style={{ fontSize: '18px', fontWeight: 600 }}>
          Candidatures récentes
        </h4>
        
        {/* ✅ UPDATED: Use prop for link */}
        <Link
          href={onViewAllHref}
          className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
          style={{ fontSize: '14px', fontWeight: 500 }}
        >
          Voir toutes
          <span className="text-lg">→</span>
        </Link>
      </div>

      {/* Content */}
      <div className="overflow-x-auto flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : candidatures.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-neutral-400">
            <Inbox className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">Aucune candidature pour le moment</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100">
                <th className="px-6 py-3 text-left text-neutral-600" style={{ fontSize: '13px', fontWeight: 600 }}>
                  CANDIDAT
                </th>
                <th className="px-6 py-3 text-left text-neutral-600" style={{ fontSize: '13px', fontWeight: 600 }}>
                  MISSION
                </th>
                <th className="px-6 py-3 text-left text-neutral-600 hidden md:table-cell" style={{ fontSize: '13px', fontWeight: 600 }}>
                  DATE
                </th>
                <th className="px-6 py-3 text-left text-neutral-600" style={{ fontSize: '13px', fontWeight: 600 }}>
                  STATUT
                </th>
                <th className="px-6 py-3 text-right text-neutral-600" style={{ fontSize: '13px', fontWeight: 600 }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {candidatures.map((app) => {
                const statusConfig = getStatusConfig(app.statut);
                const oppTitle = app.opportunites?.[0]?.titre || 'Candidature spontanée';

                return (
                  <tr
                    key={app.id}
                    className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors"
                  >
                    {/* Candidat */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary" style={{ fontSize: '14px', fontWeight: 600 }}>
                            {getInitials(app.nom_prenom)}
                          </span>
                        </div>
                        <span className="text-neutral-900 font-medium truncate max-w-[150px]" style={{ fontSize: '14px' }}>
                          {app.nom_prenom}
                        </span>
                      </div>
                    </td>

                    {/* Opportunité */}
                    <td className="px-6 py-4">
                      <span className="text-neutral-700 block truncate max-w-[200px]" style={{ fontSize: '14px', fontWeight: 400 }}>
                        {oppTitle}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-neutral-600" style={{ fontSize: '13px', fontWeight: 400 }}>
                        {getTimeAgo(app.created_at)}
                      </span>
                    </td>

                    {/* Statut Badge */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full whitespace-nowrap ${statusConfig.style}`}
                        style={{ fontSize: '12px', fontWeight: 500 }}
                      >
                        {statusConfig.label}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right">
                      {/* ✅ UPDATED: Toggle between Button (if callback provided) or Link */}
                      {onViewApplication ? (
                        <button
                          onClick={() => onViewApplication(app.id)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-primary hover:bg-primary/10 transition-all"
                          title="Voir la candidature"
                          aria-label="Voir la candidature"
                        >
                          <Eye className="w-5 h-5" strokeWidth={2} />
                        </button>
                      ) : (
                        <Link
                          href={`/admin/candidatures/${app.id}`}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-primary hover:bg-primary/10 transition-all"
                          title="Voir la candidature"
                          aria-label="Voir la candidature"
                        >
                          <Eye className="w-5 h-5" strokeWidth={2} />
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}