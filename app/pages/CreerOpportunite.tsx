"use client";

import { useEffect, useRef, useState } from "react";
import { Check, AlertCircle, PlusCircle, List, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

import { HeaderAdmin } from "../components/admin/HeaderAdmin";
import { EncartConseils } from "../components/admin/EncartConseils";
import { PreviewOpportuniteModal } from "./PreviewOpportunite";
import { useAuth } from "../hooks/useAuth";
import type {
  DetailedMissionAnalysis,
  PrePublishPolishedMission,
  OptimizedMissionVersion,
} from "@/lib/ai/missionAgent";
import { 
  FormulaireOpportunite, 
  FormDataOpportunite,
  InlineFieldSuggestion,
  SuggestionFieldKey,
} from "../components/admin/FormulaireOpportunite";

// Initialize Supabase Client (singleton)
const HAS_SUPABASE_CONFIG =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
const supabase = HAS_SUPABASE_CONFIG ? getSupabaseBrowserClient() : null;

export default function CreerOpportunite() {
  const router = useRouter();
  const t = useTranslations('Admin.MissionForm');
  const { user, profile, loading: authLoading, isSuperadmin } = useAuth(); // Get current user and profile
  const hasAnnonceur = !!profile?.annonceur_id;

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [aiResult, setAiResult] = useState<DetailedMissionAnalysis | null>(null);
  const [optimizedVersion, setOptimizedVersion] = useState<OptimizedMissionVersion | null>(null);
  const [isAiDraftMode, setIsAiDraftMode] = useState(false);
  const [inlineSuggestion, setInlineSuggestion] = useState<InlineFieldSuggestion | null>(null);
  const [isAssistantAnalyzing, setIsAssistantAnalyzing] = useState(false);
  const [isPrePublishReviewOpen, setIsPrePublishReviewOpen] = useState(false);
  const [isPrePublishReviewLoading, setIsPrePublishReviewLoading] = useState(false);
  const [prePublishReview, setPrePublishReview] = useState<PrePublishPolishedMission | null>(null);
  const [pendingPublishData, setPendingPublishData] = useState<FormDataOpportunite | null>(null);
  const [prePublishReviewError, setPrePublishReviewError] = useState<string | null>(null);
  const [isAssistantMenuOpen, setIsAssistantMenuOpen] = useState(false);
  const [assistantNotification, setAssistantNotification] = useState<string | null>(null);
  const assistantNotificationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const assistantTriggerEventName = 'encart-conseils-open-assistant';

  // Form state - Aligned with Cahier de Charge
  const [formData, setFormData] = useState({
    // Section 1: Informations générales
    intituleAction: "", // Intitulé de l'action (1 ligne maxi)
    photoRepresentation: [] as File[], // Photo de représentation de l'action
    domaineAction: "", // Domaine d'action
    
    // Section 2: Public et timing
    publicVise: "", // Tout le monde / Diaspora exclusivement
    timingAction: "", // Permanente / Ponctuelle
    missionUrgente: "", // Oui / Non
    dateDebut: "", // Si ponctuelle
    dateFin: "", // Si ponctuelle
    afficherUne: false, // Si urgente
    actionDistance: "", // Oui / Non / Partiellement
    
    // Section 3: Description et impacts
    descriptionGenerale: "", // 5-6 lignes
    impactsObjectifs: "", // 3 lignes maxi
    detailsContributions: "", // Profils recherchés (3 lignes)
    
    // Section 4: Contributions diaspora recherchées
    contributionsDiaspora: {
      investissement: false,
      epargne: false,
      competences: false,
      dons: false,
      reseauxInfluence: false,
      achatsTourisme: false,
    },
    
    // Section 5: Documents
    fichierTechnique: [] as File[], // Fichier technique joint
    lienSiteFB: "", // Lien site ou FB
    
    // Section 6: Conditions de la mission
    conditionsMission: "", // 5-6 lignes (obligatoire si compétences/réseaux)
    remunerationPrevue: "", // Type de rémunération
    remunerationAutre: "", // Si "autre"
    detailRemuneration: "", // Détail optionnel

    // Section 7: Facilités offertes
    facilites: {
      interlocuteur: false,
      travailDistance: false,
      assistanceProjet: false,
      locauxMateriels: false,
      reseauPrestataires: false,
      autres: false,
    },
    facilitesAutres: "", // Précisions si "autres"
    
    // Section 8: Contacts (Max 2)
    contacts: [
      { nom: "", email: "", tel: "", ordre: 1 }
    ],
    
    // Section 9: Publication
    emailsRappel: "",
    statutPublication: "brouillon",
    datePublication: "",
  });

  const validateForm = () => {
    const requiredFields = [
      { key: 'intituleAction', label: t('intitule_label') },
      { key: 'domaineAction', label: t('domaine_label') },
      { key: 'publicVise', label: t('public_label') },
      { key: 'timingAction', label: t('timing_label') },
      { key: 'actionDistance', label: t('distance_label') },
      { key: 'descriptionGenerale', label: t('description_label') },
      { key: 'impactsObjectifs', label: t('impacts_label') },
    ];

    for (const field of requiredFields) {
      if (!formData[field.key as keyof typeof formData]) {
        return t('validation_field_required', { field: field.label });
      }
    }

    // Check if at least one facility is selected
    const hasFacilite = Object.values(formData.facilites).some(v => v === true);
    if (!hasFacilite) {
      return t('validation_facility_required');
    }

    return null;
  };

  const getMissingAssistantFields = (): string[] => {
    const missing: string[] = [];
    if (!formData.domaineAction.trim()) missing.push('domaine');
    if (!formData.intituleAction.trim()) missing.push('titre');
    if (!Object.values(formData.contributionsDiaspora || {}).some((value) => Boolean(value))) {
      missing.push('type de contribution');
    }
    return missing;
  };

  const handleAssistantMenuClick = () => {
    const missing = getMissingAssistantFields();
    if (missing.length > 0) {
      if (assistantNotificationTimeoutRef.current) {
        clearTimeout(assistantNotificationTimeoutRef.current);
      }
      setAssistantNotification(`Veuillez remplir: ${missing.join(', ')}`);
      assistantNotificationTimeoutRef.current = setTimeout(() => {
        setAssistantNotification(null);
        assistantNotificationTimeoutRef.current = null;
      }, 4000);
    } else {
      setIsAssistantMenuOpen(true);
    }
  };

  const handleAiResult = (result: DetailedMissionAnalysis | null) => {
    setAiResult(result);
  };

  useEffect(() => {
    return () => {
      if (assistantNotificationTimeoutRef.current) {
        clearTimeout(assistantNotificationTimeoutRef.current);
      }
    };
  }, []);

  const triggerAssistantAction = (action: 'analyze' | 'document' | 'url' | 'chat') => {
    window.dispatchEvent(new CustomEvent(assistantTriggerEventName, { detail: { action } }));
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const applyAiFieldUpdates = (updates: Partial<FormDataOpportunite>) => {
    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const handleKeepInlineSuggestion = (field: SuggestionFieldKey, value: string) => {
    applyAiFieldUpdates({ [field]: value } as Partial<FormDataOpportunite>);
    setInlineSuggestion(null);
  };

  const persistOpportunity = async (activeFormData: FormDataOpportunite) => {
    if (!user) {
      throw new Error("Vous devez être connecté pour créer une action.");
    }

    if (!supabase) {
      throw new Error('Configuration Supabase manquante.');
    }

    // 1. Upload Photo
    let photoPath = null;
    if (activeFormData.photoRepresentation.length > 0) {
      const paths = await uploadFiles(activeFormData.photoRepresentation, 'photos');
      photoPath = paths[0];
    }

    // 2. Upload Fichier Technique
    let fichierPaths: string[] = [];
    if (activeFormData.fichierTechnique.length > 0) {
      fichierPaths = await uploadFiles(activeFormData.fichierTechnique, 'fichiers');
    }

    // 3. Prepare Opportunity Payload
    const oppPayload = {
      intitule_action: activeFormData.intituleAction,
      photo_representation_path: photoPath,
      domaine_action: activeFormData.domaineAction,
      
      public_vise: activeFormData.publicVise,
      timing_action: activeFormData.timingAction,
      mission_urgente: activeFormData.missionUrgente === "oui",
      date_debut: parseDateToISO(activeFormData.dateDebut),
      date_fin: parseDateToISO(activeFormData.dateFin),
      afficher_une: activeFormData.afficherUne,
      action_distance: activeFormData.actionDistance,
      
      description_generale: activeFormData.descriptionGenerale,
      impacts_objectifs: activeFormData.impactsObjectifs,
      details_contributions: activeFormData.detailsContributions,
      
      contributions_diaspora: activeFormData.contributionsDiaspora,
      
      fichier_technique_paths: fichierPaths,
      lien_site_fb: activeFormData.lienSiteFB,
      
      conditions_mission: activeFormData.conditionsMission,
      remuneration_prevue: activeFormData.remunerationPrevue,
      remuneration_autre: activeFormData.remunerationAutre,
      detail_remuneration: activeFormData.detailRemuneration || null,

      facilites: activeFormData.facilites,
      facilites_autres: activeFormData.facilitesAutres,
      
      emails_rappel: activeFormData.emailsRappel,
      statut_publication: activeFormData.statutPublication,
      date_publication: activeFormData.datePublication ? new Date(activeFormData.datePublication).toISOString() : null,
      created_by: user.id,
      annonceur_id: profile?.annonceur_id || null,
    };

    const { data: insertedOpp, error: oppError } = await supabase
      .from('opportunites')
      .insert([oppPayload])
      .select()
      .single();

    if (oppError) throw oppError;

    if (insertedOpp && activeFormData.contacts.length > 0) {
      const contactsPayload = activeFormData.contacts.map((contact) => ({
        opportunite_id: insertedOpp.id,
        nom: contact.nom,
        email: contact.email,
        tel: contact.tel,
        ordre: contact.ordre,
      }));

      const { error: contactError } = await supabase
        .from('opportunite_contacts')
        .insert(contactsPayload);

      if (contactError) {
        console.error("Error creating contacts", contactError);
        throw new Error("L'action a été créée mais les contacts n'ont pas pu être ajoutés.");
      }
    }

    if (activeFormData.statutPublication === 'publie' && insertedOpp) {
      try {
        await fetch('/api/notify-newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domaine_action: activeFormData.domaineAction,
            mission_title: activeFormData.intituleAction,
            mission_id: insertedOpp.id,
            description: activeFormData.descriptionGenerale,
          }),
        });
      } catch (newsletterErr) {
        console.error('Newsletter notification failed (non-blocking):', newsletterErr);
      }
    }

    setShowSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openPrePublishReview = async (sourceFormData: FormDataOpportunite) => {
    setPrePublishReviewError(null);
    setIsPrePublishReviewLoading(true);

    try {
      const polishResponse = await fetch('/api/ai/polish-before-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: sourceFormData.intituleAction,
          description: sourceFormData.descriptionGenerale,
          impactsObjectifs: sourceFormData.impactsObjectifs,
          detailsContributions: sourceFormData.detailsContributions,
          conditionsMission: sourceFormData.conditionsMission,
          detailRemuneration: sourceFormData.detailRemuneration,
          facilitesAutres: sourceFormData.facilitesAutres,
          remunerationAutre: sourceFormData.remunerationAutre,
        }),
      });

      const polishedData = (await polishResponse.json()) as PrePublishPolishedMission & { error?: string; details?: string };
      if (!polishResponse.ok) {
        throw new Error(polishedData?.details || polishedData?.error || 'Pré-correction IA impossible avant publication.');
      }

      const correctedData: PrePublishPolishedMission = {
        intituleAction: polishedData.intituleAction ?? sourceFormData.intituleAction,
        descriptionGenerale: polishedData.descriptionGenerale ?? sourceFormData.descriptionGenerale,
        impactsObjectifs: polishedData.impactsObjectifs ?? sourceFormData.impactsObjectifs,
        detailsContributions: polishedData.detailsContributions ?? sourceFormData.detailsContributions,
        conditionsMission: polishedData.conditionsMission ?? sourceFormData.conditionsMission,
        detailRemuneration: polishedData.detailRemuneration ?? sourceFormData.detailRemuneration,
        facilitesAutres: polishedData.facilitesAutres ?? sourceFormData.facilitesAutres,
        remunerationAutre: polishedData.remunerationAutre ?? sourceFormData.remunerationAutre,
      };

      setPrePublishReview(correctedData);
      setPendingPublishData({
        ...sourceFormData,
        intituleAction: correctedData.intituleAction,
        descriptionGenerale: correctedData.descriptionGenerale,
        impactsObjectifs: correctedData.impactsObjectifs,
        detailsContributions: correctedData.detailsContributions,
        conditionsMission: correctedData.conditionsMission,
        detailRemuneration: correctedData.detailRemuneration,
        facilitesAutres: correctedData.facilitesAutres,
        remunerationAutre: correctedData.remunerationAutre,
      });
      setIsPrePublishReviewOpen(true);
    } catch (error) {
      setPrePublishReviewError(error instanceof Error ? error.message : 'Erreur lors de l\'analyse IA avant publication.');
    } finally {
      setIsPrePublishReviewLoading(false);
    }
  };

  const confirmPrePublishReview = async () => {
    if (!pendingPublishData) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await persistOpportunity(pendingPublishData);
      setIsPrePublishReviewOpen(false);
      setPrePublishReview(null);
      setPendingPublishData(null);
      setPrePublishReviewError(null);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Erreur lors de la publication.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closePrePublishReview = () => {
    setIsPrePublishReviewOpen(false);
    setPrePublishReview(null);
    setPendingPublishData(null);
    setPrePublishReviewError(null);
  };

  // Upload Files to Supabase Storage
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const ALLOWED_DOC_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const uploadFiles = async (files: File[], folder: string) => {
    if (!supabase) {
      throw new Error('Supabase indisponible: vérifiez la configuration des variables d\'environnement.');
    }

    const paths: string[] = [];
    if (!files || files.length === 0) return paths;

    const isDocument = folder === 'fichiers';
    const allowedTypes = isDocument ? [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES] : ALLOWED_IMAGE_TYPES;

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        const errorMsg = isDocument 
          ? `Type de fichier non autorisé: ${file.name}. Formats acceptés : JPG, PNG, WebP, GIF, PDF, DOC, DOCX, PPTX`
          : `Type de fichier non autorisé: ${file.name}. Formats acceptés : JPG, PNG, WebP, GIF`;
        throw new Error(errorMsg);
      }
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`Fichier trop volumineux: ${file.name}. Taille maximale : 10 Mo`);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('opportunites')
        .upload(fileName, file);

      if (error) {
        console.error(`Error uploading ${file.name}:`, error);
        throw error;
      }
      
      if (data) {
        paths.push(data.path);
      }
    }
    return paths;
  };

  // Parse Date (DD/MM/YYYY -> YYYY-MM-DD)
  const parseDateToISO = (dateStr: string) => {
    if (!dateStr) return null;
    if (dateStr.includes('-')) return dateStr; // Already ISO or from date picker
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr; 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting || isPrePublishReviewLoading) {
      return;
    }

    if (!user) {
      setErrorMsg("Vous devez être connecté pour créer une action.");
      return;
    }

    if (!supabase) {
      setErrorMsg('Configuration Supabase manquante.');
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setErrorMsg(validationError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setShowSuccess(false);

    try {
      await openPrePublishReview(formData);
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMsg(err.message || t('create_error'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex-1 flex flex-col">
        <HeaderAdmin
          pageTitle="Créer une mission"
          breadcrumb={[
            { label: "Tableau de bord", href: "/admin/dashboard" },
            { label: "Mission" },
            { label: "Créer nouvelle" },
          ]}
        />

        <main className="flex-1 p-10 pt-[72px]">
          <div className="max-w-7xl mx-auto">
            
            {/* Success Message Banner */}
            {showSuccess && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-6 rounded-r shadow-sm animate-in slide-in-from-top-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-green-800 font-semibold">Mission créée avec succès !</h3>
                    <p className="text-green-700 text-sm">Les données ont été enregistrées dans la base de données.</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 ml-11">
                  <button
                    onClick={() => {
                      setShowSuccess(false);
                      setFormData({
                        intituleAction: "",
                        photoRepresentation: [] as File[],
                        domaineAction: "",
                        publicVise: "",
                        timingAction: "",
                        missionUrgente: "",
                        dateDebut: "",
                        dateFin: "",
                        afficherUne: false,
                        actionDistance: "",
                        descriptionGenerale: "",
                        impactsObjectifs: "",
                        detailsContributions: "",
                        contributionsDiaspora: {
                          investissement: false,
                          epargne: false,
                          competences: false,
                          dons: false,
                          reseauxInfluence: false,
                          achatsTourisme: false,
                        },
                        fichierTechnique: [] as File[],
                        lienSiteFB: "",
                        conditionsMission: "",
                        remunerationPrevue: "",
                        remunerationAutre: "",
                        detailRemuneration: "",
                        facilites: {
                          interlocuteur: false,
                          travailDistance: false,
                          assistanceProjet: false,
                          locauxMateriels: false,
                          reseauPrestataires: false,
                          autres: false,
                        },
                        facilitesAutres: "",
                        contacts: [{ nom: "", email: "", tel: "", ordre: 1 }],
                        emailsRappel: "",
                        statutPublication: "brouillon",
                        datePublication: "",
                      });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Créer une nouvelle mission
                  </button>
                  <button
                    onClick={() => router.push('/admin/opportunites')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-green-700 border border-green-300 rounded-lg hover:bg-green-50 transition-colors font-medium text-sm"
                  >
                    <List className="w-4 h-4" />
                    Voir toutes les missions
                  </button>
                </div>
              </div>
            )}

            {/* Fiche Annonceur Required Banner */}
            {!hasAnnonceur && !isSuperadmin && !authLoading && (
              <div className="mb-6 bg-amber-50 border-l-4 border-amber-400 p-5 rounded-r shadow-sm flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-amber-800 font-semibold text-sm">Fiche annonceur requise</h3>
                  <p className="text-amber-700 text-sm mt-1">
                    Vous devez d&apos;abord remplir votre fiche annonceur avant de pouvoir créer une mission.
                    Rendez-vous dans{' '}
                    <button
                      onClick={() => router.push('/admin/parametres?tab=annonceur')}
                      className="underline font-semibold hover:text-amber-900 transition-colors"
                    >
                      Paramètres &rsaquo; Fiche Annonceur
                    </button>{' '}
                    pour compléter vos informations.
                  </p>
                </div>
              </div>
            )}

            {/* Error Message Banner */}
            {errorMsg && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm flex items-center gap-3 animate-in slide-in-from-top-2">
                 <AlertCircle className="w-6 h-6 text-red-500" />
                 <p className="text-red-700 font-medium">{errorMsg}</p>
              </div>
            )}

            {hasAnnonceur || isSuperadmin ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Main Form */}
              <div className={isAiDraftMode ? "lg:col-span-6" : "lg:col-span-8"}>
                <FormulaireOpportunite
                  formData={formData}
                  setFormData={setFormData}
                  isSubmitting={isSubmitting}
                  showSuccess={showSuccess}
                  errorMsg={errorMsg}
                  onSubmit={handleSubmit}
                  onPreview={() => setShowPreview(true)}
                  inlineSuggestion={inlineSuggestion}
                  onKeepInlineSuggestion={handleKeepInlineSuggestion}
                  onDiscardInlineSuggestion={() => setInlineSuggestion(null)}
                  onAssistantMenuClick={handleAssistantMenuClick}
                  onAssistantAnalyzeClick={() => {
                    triggerAssistantAction('analyze');
                    setIsAssistantMenuOpen(false);
                  }}
                  onAssistantDocumentClick={() => {
                    triggerAssistantAction('document');
                    setIsAssistantMenuOpen(false);
                  }}
                  onAssistantUrlClick={() => {
                    triggerAssistantAction('url');
                    setIsAssistantMenuOpen(false);
                  }}
                  onAssistantChatClick={() => triggerAssistantAction('chat')}
                  isAssistantMenuOpen={isAssistantMenuOpen}
                  onAssistantMenuClose={() => setIsAssistantMenuOpen(false)}
                  assistantNotification={assistantNotification}
                  missingAssistantFields={getMissingAssistantFields()}
                  assistantAnalyzeLoading={isAssistantAnalyzing}
                  hasAiResult={Boolean(aiResult)}
                />
              </div>

              {/* Helper Sidebar */}
              <div className={`${isAiDraftMode ? 'lg:col-span-6' : 'lg:col-span-4'} hidden lg:block`}>
                <EncartConseils
                  formData={formData}
                  aiResult={aiResult}
                  optimizedVersion={optimizedVersion}
                  onAiResult={handleAiResult}
                  onOptimizedVersion={setOptimizedVersion}
                  onAssistantResponse={() => {}}
                  onApplyFieldUpdates={applyAiFieldUpdates}
                  onDraftModeChange={setIsAiDraftMode}
                  onInlineSuggestionChange={setInlineSuggestion}
                  onAnalyzingStateChange={setIsAssistantAnalyzing}
                  hideFloatingFab
                  externalTriggerEventName={assistantTriggerEventName}
                />
              </div>
            </div>
            ) : null}
          </div>
        </main>
      </div>
      
      <PreviewOpportuniteModal 
        isOpen={showPreview} 
        onClose={() => setShowPreview(false)} 
        data={formData} 
      />

      {isPrePublishReviewOpen && prePublishReview && (
        <div className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-4 p-5 border-b border-neutral-200 bg-neutral-50">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Aperçu IA avant publication
                </div>
                <h3 className="text-xl font-semibold text-neutral-900">Analyse orthographique et mise en page</h3>
                <p className="text-sm text-neutral-600 mt-1">
                  Gemini a relu l’ensemble du formulaire et propose des corrections de forme sans changer le sens.
                </p>
              </div>
              <button
                type="button"
                onClick={closePrePublishReview}
                className="w-10 h-10 rounded-full border border-neutral-200 text-neutral-500 hover:bg-neutral-100 flex items-center justify-center"
                aria-label="Fermer"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <div className="p-5 border-r border-neutral-200 bg-white max-h-[70vh] overflow-y-auto">
                <h4 className="text-sm font-semibold text-neutral-900 mb-3">Ce qui a été corrigé</h4>
                <div className="space-y-3">
                  {[
                    ['Titre', formData.intituleAction, prePublishReview.intituleAction],
                    ['Description', formData.descriptionGenerale, prePublishReview.descriptionGenerale],
                    ['Impacts', formData.impactsObjectifs, prePublishReview.impactsObjectifs],
                    ['Contributions', formData.detailsContributions, prePublishReview.detailsContributions],
                    ['Conditions', formData.conditionsMission, prePublishReview.conditionsMission],
                    ['Rémunération autre', formData.remunerationAutre, prePublishReview.remunerationAutre],
                    ['Détails rémunération', formData.detailRemuneration, prePublishReview.detailRemuneration],
                    ['Autres facilités', formData.facilitesAutres, prePublishReview.facilitesAutres],
                  ].map(([label, before, after]) => {
                    if (String(before || '').trim() === String(after || '').trim()) return null;

                    return (
                      <div key={label} className="rounded-xl border border-neutral-200 p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-2 h-2 rounded-full bg-primary" />
                          <h5 className="text-sm font-semibold text-neutral-900">{label}</h5>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="rounded-lg bg-red-50 border border-red-100 p-2">
                            <div className="text-[11px] font-semibold uppercase tracking-wide text-red-700 mb-1">Avant</div>
                            <p className="text-neutral-700 whitespace-pre-wrap">{String(before || '—')}</p>
                          </div>
                          <div className="rounded-lg bg-green-50 border border-green-100 p-2">
                            <div className="text-[11px] font-semibold uppercase tracking-wide text-green-700 mb-1">Après</div>
                            <p className="text-neutral-800 whitespace-pre-wrap">{String(after || '—')}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {![
                    ['Titre', formData.intituleAction, prePublishReview.intituleAction],
                    ['Description', formData.descriptionGenerale, prePublishReview.descriptionGenerale],
                    ['Impacts', formData.impactsObjectifs, prePublishReview.impactsObjectifs],
                    ['Contributions', formData.detailsContributions, prePublishReview.detailsContributions],
                    ['Conditions', formData.conditionsMission, prePublishReview.conditionsMission],
                    ['Rémunération autre', formData.remunerationAutre, prePublishReview.remunerationAutre],
                    ['Détails rémunération', formData.detailRemuneration, prePublishReview.detailRemuneration],
                    ['Autres facilités', formData.facilitesAutres, prePublishReview.facilitesAutres],
                  ].some(([, before, after]) => String(before || '').trim() !== String(after || '').trim()) && (
                    <div className="rounded-xl border border-dashed border-neutral-300 p-4 text-sm text-neutral-600">
                      Aucune correction de forme n’était nécessaire. Le formulaire semble déjà propre.
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 bg-neutral-50 max-h-[70vh] overflow-y-auto">
                <h4 className="text-sm font-semibold text-neutral-900 mb-3">Résumé IA</h4>
                <div className="rounded-xl bg-white border border-neutral-200 p-4 space-y-3">
                  <p className="text-sm text-neutral-700">
                    L’IA a vérifié l’orthographe, la grammaire et la lisibilité globale. Vous pouvez d’abord les consulter ici, puis confirmer seulement si le rendu vous convient.
                  </p>
                  {prePublishReviewError && (
                    <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-700">
                      {prePublishReviewError}
                    </div>
                  )}
                  <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm text-neutral-700">
                    Aucune écriture en base de données n’est faite tant que vous n’avez pas confirmé depuis cette fenêtre.
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={confirmPrePublishReview}
                    disabled={isPrePublishReviewLoading}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white font-medium hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {pendingPublishData?.statutPublication === 'publie'
                      ? 'Confirmer et publier'
                      : 'Confirmer et enregistrer'}
                  </button>
                  <button
                    type="button"
                    onClick={closePrePublishReview}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50"
                  >
                    Retour
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}