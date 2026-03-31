'use client';

import React from 'react';
import { useRouter } from '@/i18n/routing';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  Calendar, Clock, Users, CheckCircle2,
  Globe2, Briefcase
} from 'lucide-react';

// UI Components
import { Bouton } from '../components/ds/Bouton';
import { FilDAriane } from '../components/listing/FilDAriane';
import { CarteMunicipalite } from '../components/detail/CarteMunicipalite';
import { IndicateursConfiance } from '../components/detail/IndicateursConfiance';
import { LienDocument } from '../components/detail/LienDocument';
import { BlocPartage } from '../components/detail/BlocPartage';
import { FormulaireActionInline } from '../components/detail/FormulaireActionInline';
import { CameroonFlag } from '../components/icons/CameroonFlag';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { toast } from 'sonner';
import { getPublicUrl } from '@/lib/supabase/storage';
import { sendRecapEmail } from '@/lib/sendRecapEmail';

// 2. Types
interface Contact {
  nom: string;
  email: string;
  tel: string;
  ordre: number;
}

interface AnnonceurProfile {
  id: string;
  pays: string;
  nom: string;
  statut: string;
  logo_url: string | null;
  presentation: string;
  points_focaux_diaspora: string | PointFocalDiaspora[] | null;
  contact_legal_email?: string;
  emails_destinataires?: string;
}

interface PointFocalDiaspora {
  nom: string;
  prenom: string;
  fonction: string;
  email: string;
  whatsapp: string;
}

interface OpportuniteDetail {
  id: string;
  created_at: string;
  intitule_action: string;
  description_generale: string;
  domaine_action: string;
  photo_representation_path: string | null;
  timing_action: string;
  date_debut: string | null;
  date_fin: string | null;
  afficher_une: boolean;
  action_distance: string;
  public_vise: string;
  impacts_objectifs: string;
  details_contributions: string;
  contributions_diaspora: Record<string, boolean>;
  fichier_technique_paths: string[] | null;
  lien_site_fb: string | null;
  conditions_mission: string | null;
  remuneration_prevue: string | null;
  remuneration_autre: string | null;
  detail_remuneration: string | null;
  facilites: Record<string, boolean>;
  facilites_autres: string | null;
  statut_publication: string;
  date_publication: string | null;
  created_by: string;
  contacts?: Contact[];
  annonceur?: AnnonceurProfile;
}

interface CandidatureFormData {
  nom_prenom: string;
  pays_residence: string;
  email: string;
  whatsapp: string;
  linkedin_url: string;
  lien_territoire: string;
  message: string;
  accord_temoignage: boolean | null;
}

interface DetailOpportuniteProps {
  opp: OpportuniteDetail;
}

// Helper function to get country flag component
const getCountryFlag = (countryName: string) => {
  // For now, we'll use CameroonFlag as default
  // You can extend this to support other countries
  const countryLower = countryName.toLowerCase();
  
  if (countryLower.includes('cameroun') || countryLower.includes('cameroon')) {
    return <CameroonFlag width={28} height={21} />;
  }
  
  // Default flag emoji for other countries
  return <span className="text-2xl">🌍</span>;
};

// Helper function to get contribution display names
const getContributionDisplayName = (key: string): string => {
  const contributionNames: Record<string, string> = {
    'investissement': '💰 Investissement',
    'epargne': '🏦 Épargne',
    'competences': '🎓 Compétences',
    'dons': '🎁 Dons',
    'reseauxInfluence': '🌐 Réseaux & influence',
    'achatsTourisme': '🛍️ Achats & tourisme solidaires',
  };

  return contributionNames[key] || key;
};

export default function DetailOpportunite({ opp }: DetailOpportuniteProps) {
  const router = useRouter();

  // Handle Candidature Logic
  const handleCandidature = async (formData: CandidatureFormData) => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.from('candidatures').insert({
        opportunite_id: opp.id,
        nom_prenom: formData.nom_prenom,
        pays_residence: formData.pays_residence,
        email: formData.email,
        whatsapp: formData.whatsapp,
        linkedin_url: formData.linkedin_url || null,
        lien_territoire: formData.lien_territoire,
        message: formData.message,
        accord_temoignage: formData.accord_temoignage,
        statut: 'nouvelle'
      });

      if (error) throw error;

      // Send recap email to applicant & Admin (non-blocking)
      try {
        await sendRecapEmail({
          to: formData.email,
          type: 'candidature',
          recipientName: formData.nom_prenom,
          details: [
            { label: 'Mission', value: opp.intitule_action },
            { label: 'Nom', value: formData.nom_prenom },
            { label: 'Email', value: formData.email },
            { label: 'Pays', value: formData.pays_residence },
            { label: 'Date', value: new Date().toLocaleDateString('fr-FR') },
          ],
          annonceurEmails: [
            opp.annonceur?.contact_legal_email,
            opp.annonceur?.emails_destinataires
          ].filter(Boolean).join(',')
        });
      } catch (recapErr) {
        console.error('Recap email failed (non-blocking):', recapErr);
      }
      return Promise.resolve();
    } catch (err) {
      console.error("Error submitting candidature:", err);
      toast.error("Une erreur est survenue lors de l'envoi. Veuillez réessayer.");
      return Promise.reject(err);
    }
  };

  // Helpers
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getDomainImageFallback = (domaine: string | null): string => {
    if (!domaine) return '/images/domaines/innovation.jpg';
    const mapping: Record<string, string> = {
      'investissement': 'investissement',
      'Santé': 'sante',
      'sante': 'sante',
      'pauvrete': 'pauvrete',
      'societe-civile': 'societe-civile',
      'infrastructures': 'infrastructures',
      'environnement': 'environnement',
      'éducation': 'education',
      'education': 'education',
      'innovation': 'innovation',
      'recrutement': 'recrutement',
      'tourisme': 'tourisme',
      'culture': 'culture',
      'rayonnement': 'rayonnement',
      'droits': 'droits',
      'urgences': 'urgences',
    };
    const filename = mapping[domaine] || 'innovation';
    return `/images/domaines/${filename}.jpg`;
  };

  const getImageUrl = (path: string | null) => {
    if (!path) return getDomainImageFallback(opp.domaine_action);
    return getPublicUrl('opportunites', path);
  };

  const getDocumentUrl = (path: string) => {
    return getPublicUrl('opportunites', path);
  };

  const getDocumentName = (path: string) => {
    const parts = path.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('-').slice(1).join('-') || filename;
  };

  // Get annonceur logo with fallback
  const getAnnonceurLogo = () => {
    if (opp?.annonceur?.logo_url) {
      return opp.annonceur.logo_url;
    }
    return undefined;
  };

  // Get country name
  const getCountryName = () => {
    return opp?.annonceur?.pays || 'Cameroun';
  };

  // Get annonceur name
  const getAnnonceurName = () => {
    return opp?.annonceur?.nom || 'Organisation';
  };

  // Get annonceur statut
  const getAnnonceurStatut = () => {
    return opp?.annonceur?.statut || '';
  };

  // Get timing display text
  const getTimingDisplay = () => {
    if (!opp) return 'N/A';
    
    const timing = opp.timing_action;
    if (timing === 'permanente') return 'Permanente';
    if (timing === 'urgente') return 'Urgente';
    if (timing === 'ponctuelle') {
      if (opp.date_debut && opp.date_fin) {
        return `Du ${formatDate(opp.date_debut)} au ${formatDate(opp.date_fin)}`;
      }
      return 'Ponctuelle';
    }
    return timing.charAt(0).toUpperCase() + timing.slice(1);
  };

  // Get action distance display
  const getActionDistanceDisplay = () => {
    if (!opp) return 'Non spécifié';
    
    const distance = opp.action_distance;
    if (distance === 'oui') return 'Oui';
    if (distance === 'non') return 'Non';
    if (distance === 'partiellement') return 'Partiellement';
    return 'Non spécifié';
  };

  // Get sector display name
  const getSectorDisplayName = (sector: string) => {
    const sectors: Record<string, string> = {
      'investissement': 'Investissement',
      'sante': 'Santé',
      'pauvrete': 'Lutte contre la pauvreté',
      'societe-civile': 'Société civile',
      'infrastructures': 'Infrastructures',
      'environnement': 'Environnement',
      'education': 'Éducation',
      'innovation': 'Innovation',
      'recrutement': 'Recrutement',
      'tourisme': 'Tourisme',
      'culture': 'Culture et patrimoine',
      'rayonnement': 'Rayonnement international',
      'droits': 'Droits et citoyenneté',
      'urgences': 'Urgences humanitaires'
    };
    return sectors[sector] || sector;
  };

  // Get contributions summary
  const getContributionsSummary = () => {
    if (!opp || !opp.contributions_diaspora) return 'Diverses contributions';
    
    const contribs = opp.contributions_diaspora;
    const activeContribs = Object.entries(contribs)
      .filter(([_, value]) => value)
      .map(([key, _]) => key);
    
    if (activeContribs.length === 0) return 'Diverses contributions';
    if (activeContribs.length <= 2) {
      return activeContribs.map(c => getContributionDisplayName(c)).join(', ');
    }
    return `${activeContribs.length} types de contributions`;
  };

  // Get active contributions list for BlocInfosCles
  const getActiveContributions = () => {
    if (!opp || !opp.contributions_diaspora) return [];
    
    return Object.entries(opp.contributions_diaspora)
      .filter(([_, value]) => value === true)
      .map(([key, _]) => getContributionDisplayName(key));
  };

  // Get all focal points (opportunite contacts + annonceur focal points)
  const getAllFocalPoints = () => {
    const allContacts: Array<{
      nom: string;
      prenom?: string;
      fonction?: string;
      email: string;
      tel: string;
      whatsapp?: string;
      source: 'opportunite' | 'annonceur';
    }> = [];

    // Add opportunite-specific contacts (skip empty entries)
    if (opp?.contacts && opp.contacts.length > 0) {
      opp.contacts.forEach(contact => {
        if (!contact.nom?.trim() && !contact.email?.trim()) return;
        allContacts.push({
          nom: contact.nom,
          email: contact.email,
          tel: contact.tel,
          source: 'opportunite'
        });
      });
    }

    // Add annonceur focal points
    if (opp?.annonceur?.points_focaux_diaspora) {
      try {
        let focalPoints: PointFocalDiaspora[] = [];
        
        // Check if it's already an object or a string
        if (typeof opp.annonceur.points_focaux_diaspora === 'string') {
          focalPoints = JSON.parse(opp.annonceur.points_focaux_diaspora);
        } else if (Array.isArray(opp.annonceur.points_focaux_diaspora)) {
          focalPoints = opp.annonceur.points_focaux_diaspora;
        }
        
        focalPoints.forEach(fp => {
          if (!fp.nom?.trim() && !fp.email?.trim()) return;
          allContacts.push({
            nom: fp.nom,
            prenom: fp.prenom,
            fonction: fp.fonction,
            email: fp.email,
            tel: fp.whatsapp,
            whatsapp: fp.whatsapp,
            source: 'annonceur'
          });
        });
      } catch (e) {
        console.error('Error parsing points_focaux_diaspora:', e);
      }
    }

    return allContacts;
  };

  // Get display name for a contact
  const getContactDisplayName = (contact: ReturnType<typeof getAllFocalPoints>[0]) => {
    if (contact.prenom) {
      return `${contact.prenom} ${contact.nom}`;
    }
    return contact.nom;
  };

  return (
    <div className="min-h-screen bg-page-bg">
      {/* Fil d'ariane */}
      <div className="w-full border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20 py-4">
          <FilDAriane
            items={[
              { label: 'Accueil', onClick: () => router.push('/') },
              { label: 'Missions', onClick: () => router.push('/missions') },
              { label: opp.intitule_action },
            ]}
          />
        </div>
      </div>
      
      {/* En-tête avec image */}
      <div className="w-full bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              {/* Country Flag Badge - Dynamic */}
              <div className="mb-3">
                <div className="inline-flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-neutral-200 shadow-sm">
                  {getCountryFlag(getCountryName())}
                  <span className="text-neutral-700" style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.3px' }}>
                    {getCountryName().toUpperCase()}
                  </span>
                </div>
              </div>
              
              {/* Titre */}
              <div className="mb-3">
                <h1 className="text-neutral-900 mb-2" style={{ fontSize: '39px', lineHeight: '1.2', fontWeight: 600 }}>
                  {opp.intitule_action}
                </h1>
              </div>

              {/* Annonceur Name - NEW */}
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-neutral-600" style={{ fontSize: '15px', fontWeight: 500 }}>
                  par
                  </span>
                  <span className="text-primary" style={{ fontSize: '16px', fontWeight: 600 }}>
                    {getAnnonceurName()}
                  </span>
                  {getAnnonceurStatut() && (
                    <span className="text-neutral-500 text-sm italic">
                      ({getAnnonceurStatut()})
                    </span>
                  )}
                </div>
              </div>

              {/* Priority Badge */}
              {opp.afficher_une && (
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 bg-accent-yellow/10 text-accent-yellow px-3 py-1 rounded-full border border-accent-yellow/20">
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>PRIORITAIRE</span>
                  </div>
                </div>
              )}
              
              {/* INFORMATIONS CLÉS */}
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20 mb-6">
                <h3 className="text-neutral-900 mb-4" style={{ fontSize: '16px', fontWeight: 600 }}>
                  Informations clés
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 1. Date */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-primary" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-neutral-600" style={{ fontSize: '13px', fontWeight: 500 }}>
                        Date de publication
                      </p>
                      <p className="text-neutral-900" style={{ fontSize: '15px', fontWeight: 600 }}>
                        {formatDate(opp.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  {/* 2. Timing */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-primary" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-neutral-600" style={{ fontSize: '13px', fontWeight: 500 }}>
                        Timing
                      </p>
                      <p className="text-neutral-900" style={{ fontSize: '15px', fontWeight: 600 }}>
                        {getTimingDisplay()}
                      </p>
                    </div>
                  </div>
                  
                  {/* 3. Action à distance */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <Globe2 className="w-5 h-5 text-primary" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-neutral-600" style={{ fontSize: '13px', fontWeight: 500 }}>
                        Action à distance
                      </p>
                      <p className="text-neutral-900" style={{ fontSize: '15px', fontWeight: 600 }}>
                        {getActionDistanceDisplay()}
                      </p>
                    </div>
                  </div>
                  
                  {/* 4. Public visé */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-primary" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-neutral-600" style={{ fontSize: '13px', fontWeight: 500 }}>
                        Public visé
                      </p>
                      <p className="text-neutral-900" style={{ fontSize: '15px', fontWeight: 600 }}>
                        {opp.public_vise === 'tous' ? 'Tout le monde' : 'Diaspora exclusivement'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Métadonnées */}
              <div className="flex flex-wrap gap-4 text-sm text-neutral-600 mb-6">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" strokeWidth={2} />
                  <span>{getSectorDisplayName(opp.domaine_action)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" strokeWidth={2} />
                  <span>Publié le {formatDate(opp.created_at)}</span>
                </div>
              </div>
            </div>
          <div className="lg:col-span-4">
  {/* Image */}
  <div className="relative w-full aspect-[1/2] lg:aspect-[5/6] rounded-xl overflow-hidden shadow-md bg-neutral-50 flex items-center justify-center">
    <ImageWithFallback
      src={getImageUrl(opp.photo_representation_path)}
      alt={opp.intitule_action}
      fill
      className="object-cover"
      sizes="(max-width: 1024px) 100vw, 40vw"
    />
    {/* Badge secteur */}
    <div className="absolute top-4 left-4">
      <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-primary/20">
        <span className="text-primary capitalize" style={{ fontSize: '14px', fontWeight: 600 }}>
          {getSectorDisplayName(opp.domaine_action)}
        </span>
      </div>
    </div>
  </div>
</div>
          </div>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Colonne Gauche (Texte) */}
            <div className="lg:col-span-8">
              {/* Description */}
              <section className="mb-12">
                <h2 className="text-neutral-900 mb-4" style={{ fontSize: '25px', lineHeight: '1.3', fontWeight: 600 }}>
                  Description générale
                </h2>
                <div className="prose prose-neutral max-w-none whitespace-pre-line text-neutral-700" style={{ fontSize: '16px', lineHeight: '1.7' }}>
                  {opp.description_generale}
                </div>
              </section>
              
              {/* Impacts / Objectifs */}
              <section className="mb-12">
                <h2 className="text-neutral-900 mb-4" style={{ fontSize: '25px', lineHeight: '1.3', fontWeight: 600 }}>
                  Impacts/objectifs
                </h2>
                <div className="bg-neutral-50 p-6 rounded-xl whitespace-pre-line text-neutral-700">
                  {opp.impacts_objectifs}
                </div>
              </section>
              
              {/* Profil recherché / Contributions */}
              <section className="mb-12">
                <h2 className="text-neutral-900 mb-4" style={{ fontSize: '25px', lineHeight: '1.3', fontWeight: 600 }}>
                  Détails des contributions
                </h2>
                <div className="bg-white border border-neutral-200 rounded-xl p-6 whitespace-pre-line text-neutral-700">
                  {opp.details_contributions}
                </div>
              </section>

                {/* Documents */}
              {opp.fichier_technique_paths && opp.fichier_technique_paths.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-neutral-900 mb-4" style={{ fontSize: '25px', lineHeight: '1.3', fontWeight: 600 }}>
                    Documents à télécharger
                  </h2>
                  <div className="space-y-3">
                    {opp.fichier_technique_paths.map((path, index) => (
                      <LienDocument
                        key={index}
                        nom={getDocumentName(path)}
                        taille="-"
                        url={getDocumentUrl(path)}
                      />
                    ))}
                  </div>
                </section>
              )}


              {/* Lien */}
              {opp.lien_site_fb && (
                <section className="mb-12">
                  <h2 className="text-neutral-900 mb-4" style={{ fontSize: '25px', lineHeight: '1.3', fontWeight: 600 }}>
                   Lien site ou FB
                  </h2>
                  <div className="bg-white border border-neutral-200 rounded-xl p-6 whitespace-pre-line text-neutral-700">
                    {opp.lien_site_fb}
                  </div>
                </section>
              )}

              {/* Conditions de la mission */}
              {opp.conditions_mission && (
                <section className="mb-12">
                  <h2 className="text-neutral-900 mb-4" style={{ fontSize: '25px', lineHeight: '1.3', fontWeight: 600 }}>
                    Conditions de la mission
                  </h2>
                  <div className="bg-white border border-neutral-200 rounded-xl p-6 whitespace-pre-line text-neutral-700">
                    {opp.conditions_mission}
                  </div>
                </section>
              )}

              {/* Rémunération */}
              {opp.remuneration_prevue && (
                <section className="mb-12">
                  <h2 className="text-neutral-900 mb-4" style={{ fontSize: '25px', lineHeight: '1.3', fontWeight: 600 }}>
                    Rémunération éventuelle prévue
                  </h2>
                  <div className="bg-neutral-50 p-6 rounded-xl text-neutral-700">
                    {opp.remuneration_prevue === 'benevole' && '100% bénévole'}
                    {opp.remuneration_prevue === 'defraiement-local' && 'Défraiement (frais locaux)'}
                    {opp.remuneration_prevue === 'defraiement-complet' && 'Défraiement (billet avion + frais locaux)'}
                    {opp.remuneration_prevue === 'remuneration' && 'Rémunération'}
                    {opp.remuneration_prevue === 'autre' && opp.remuneration_autre}
                  </div>
                  {opp.detail_remuneration && (
                    <div className="bg-neutral-50 p-6 rounded-xl text-neutral-700 mt-4">
                      <h3 className="text-neutral-900 mb-2" style={{ fontSize: '16px', fontWeight: 600 }}>
                        Détail de la rémunération
                      </h3>
                      <p className="whitespace-pre-line">{opp.detail_remuneration}</p>
                    </div>
                  )}
                </section>
              )}

              {/* Facilités offertes */}
              {opp.facilites && Object.values(opp.facilites).some(v => v) && (
                <section className="mb-12">
                  <h2 className="text-neutral-900 mb-4" style={{ fontSize: '25px', lineHeight: '1.3', fontWeight: 600 }}>
Facilités offertes pour cette action                  </h2>
                  <div className="bg-white border border-neutral-200 rounded-xl p-6">
                    <ul className="space-y-2 text-neutral-700">
                      {opp.facilites.interlocuteur && <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> Interlocuteur dédié</li>}
                      {opp.facilites.travailDistance && <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> Travail à distance possible</li>}
                      {opp.facilites.assistanceProjet && <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> Assistance projets</li>}
                      {opp.facilites.locauxMateriels && <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> Locaux et matériels disponibles</li>}
                      {opp.facilites.reseauPrestataires && <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> Accès au réseau de prestataires</li>}
                      {opp.facilites.autres && opp.facilites_autres && <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> {opp.facilites_autres}</li>}
                    </ul>
                  </div>
                </section>
              )}
              
            

              {/* Lien site/FB */}
              {opp.lien_site_fb && (
                <section className="mb-12">
                  <h2 className="text-neutral-900 mb-4" style={{ fontSize: '25px', lineHeight: '1.3', fontWeight: 600 }}>
                    En savoir plus
                  </h2>
                  <a 
                    href={opp.lien_site_fb} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-2"
                  >
                    <Globe2 className="w-5 h-5" />
                    Visiter le site web <span className="sr-only">(nouvelle fenêtre)</span>
                  </a>
                </section>
              )}

              {/* Formulaire Postuler */}
              <FormulaireActionInline
                opportunityTitle={opp.intitule_action}
                municipalityName={getAnnonceurName()}
                onSuccess={handleCandidature}
              />
            </div>
            
            {/* Sidebar Droite */}
            <div className="lg:col-span-4 space-y-6">
              {/* Contributions attendues */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-neutral-200">
                <h4 className="text-neutral-900 mb-4" style={{ fontSize: '18px', fontWeight: 600 }}>
                  Contributions diaspora recherchées
                </h4>
                <div className="space-y-2">
                  {getActiveContributions().length > 0 ? (
                    getActiveContributions().map((contribution, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" strokeWidth={2} />
                        <span className="text-neutral-700" style={{ fontSize: '15px' }}>
                          {contribution}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-neutral-500 italic text-sm">
                      Aucune contribution spécifique définie
                    </p>
                  )}
                </div>
              </div>
              
           
             
              {/* Carte Annonceur - Updated */}

<CarteMunicipalite
  nom={getAnnonceurName()}
  region={getCountryName()}
  logo={getAnnonceurLogo()}
  href={opp?.annonceur?.id ? `/fiche-ville/${opp.annonceur.id}` : undefined}
/>
              
              {/* Vos interlocuteurs Diaspora */}
              <div className="bg-bg-base rounded-xl p-6 shadow-lg">
                <h4 className="text-white mb-5" style={{ fontSize: '18px', fontWeight: 600 }}>
                  Points focaux diaspora
                </h4>
                
                <div className="space-y-4 mb-5">
                  {getAllFocalPoints().length > 0 ? (
                    getAllFocalPoints().map((contact, idx) => (
                      <div key={idx} className={`flex items-center gap-4 ${idx !== getAllFocalPoints().length - 1 ? 'pb-4 border-b border-white/20' : ''}`}>
                        <div className="rounded-full overflow-hidden flex-shrink-0 bg-white/20 flex items-center justify-center text-white font-bold" style={{ width: '56px', height: '56px', fontSize: '18px' }}>
                          {contact.prenom ? contact.prenom.charAt(0).toUpperCase() : contact.nom.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-white mb-1" style={{ fontSize: '16px', fontWeight: 600 }}>
                            {getContactDisplayName(contact)}
                          </p>
                          {contact.fonction && (
                            <p className="text-white/70 mb-1" style={{ fontSize: '13px', fontWeight: 400 }}>
                              {contact.fonction}
                            </p>
                          )}
                          <div className="text-white/80" style={{ fontSize: '12px', fontWeight: 400, lineHeight: '1.4' }}>
                            <a href={`mailto:${contact.email}`} className="hover:underline">{contact.email}</a>
                            {contact.whatsapp && contact.whatsapp !== contact.tel && (
                              <>
                                <br />
                                WhatsApp: {contact.whatsapp}
                              </>
                            )}
                            {contact.tel && (
                              <>
                                <br />
                                Tél: {contact.tel}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-white/70 italic text-sm">
                      Aucun contact spécifique assigné.
                    </div>
                  )}
                </div>
                
                <Bouton 
                  variant="primaire" 
                  size="moyen" 
                  fullWidth 
                  className="mb-3"
                  onClick={() => {
                    const emails = getAllFocalPoints().map(cp => cp.email).filter(Boolean).join(',');
                    if (emails) {
                      window.location.href = `mailto:${emails}?subject=Contact concernant la mission : ${opp.intitule_action}`;
                    }
                  }}
                >
                  Contacter
                </Bouton>
                
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" strokeWidth={2} />
                  <p className="text-white/90 text-center" style={{ fontSize: '12px', fontWeight: 400 }}>
                    Réponse garantie sous 48h
                  </p>
                </div>
              </div>

              <IndicateursConfiance dateMAJ={formatDate(opp.created_at)} annonceurName={getAnnonceurName()}  />
              <BlocPartage />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}