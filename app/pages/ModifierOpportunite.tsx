"use client";

import { useState, useEffect, useRef } from "react";
import { Edit2, Loader2, Check, AlertCircle, X } from "lucide-react";
import { useTranslations, useLocale } from 'next-intl';
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  FormulaireOpportunite,
  FormDataOpportunite,
  InlineFieldSuggestion,
  SuggestionFieldKey,
} from "../components/admin/FormulaireOpportunite";
import { EncartConseils } from "../components/admin/EncartConseils";
import type {
  DetailedMissionAnalysis,
  PrePublishPolishedMission,
  OptimizedMissionVersion,
} from "@/lib/ai/missionAgent";
import { PreviewOpportuniteModal } from "./PreviewOpportunite";

// Helper to construct image URL from path
const getStorageUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/opportunites/${path}`;
};

interface ModifierOpportuniteModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityId: string | null;
  onUpdateSuccess: () => void; // Callback to refresh the list after update
}

export const ModifierOpportuniteModal = ({ 
  isOpen, 
  onClose, 
  opportunityId, 
  onUpdateSuccess 
}: ModifierOpportuniteModalProps) => {
  
  const supabase = getSupabaseBrowserClient();
  const t = useTranslations('Admin.MissionForm');

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const [showPreview, setShowPreview] = useState(false);
  const [currentImagePath, setCurrentImagePath] = useState<string | null>(null);
  const [currentDocPaths, setCurrentDocPaths] = useState<string[]>([]);

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
  const locale = useLocale();
  const isFrench = locale.startsWith('fr');
  const suppressChatAutoOpenEventName = 'encart-conseils-suppress-chat-autopen';

  // Form state
  const [formData, setFormData] = useState<FormDataOpportunite>({
    intituleAction: "",
    photoRepresentation: [],
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
    fichierTechnique: [],
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

  useEffect(() => {
    if (isOpen && opportunityId) {
      fetchOpportunityData(opportunityId);
    } else {
        setShowSuccess(false);
        setErrorMsg("");
    }
  }, [isOpen, opportunityId]);

  const fetchOpportunityData = async (id: string) => {
    setIsLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('opportunites')
        .select(`*, opportunite_contacts (nom, email, tel, ordre)`)
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setCurrentImagePath(data.photo_representation_path);
        setCurrentDocPaths(data.fichier_technique_paths || []);
        const sortedContacts = data.opportunite_contacts?.sort((a: any, b: any) => a.ordre - b.ordre) || [];

        setFormData({
            intituleAction: data.intitule_action || "",
            photoRepresentation: [],
            domaineAction: data.domaine_action || "",
            publicVise: data.public_vise || "tous",
            timingAction: data.timing_action || "permanente",
            missionUrgente: data.mission_urgente ? "oui" : "non",
            dateDebut: data.date_debut || "",
            dateFin: data.date_fin || "",
            afficherUne: data.afficher_une || false,
            actionDistance: data.action_distance || "non",
            descriptionGenerale: data.description_generale || "",
            impactsObjectifs: data.impacts_objectifs || "",
            detailsContributions: data.details_contributions || "",
            contributionsDiaspora: data.contributions_diaspora || {
              investissement: false,
              epargne: false,
              competences: false,
              dons: false,
              reseauxInfluence: false,
              achatsTourisme: false,
            },
            fichierTechnique: [],
            lienSiteFB: data.lien_site_fb || "",
            conditionsMission: data.conditions_mission || "",
            remunerationPrevue: data.remuneration_prevue || "benevole",
            remunerationAutre: data.remuneration_autre || "",
            detailRemuneration: data.detail_remuneration || "",
            facilites: data.facilites || {
              interlocuteur: false,
              travailDistance: false,
              assistanceProjet: false,
              locauxMateriels: false,
              reseauPrestataires: false,
              autres: false,
            },
            facilitesAutres: data.facilites_autres || "",
            contacts: sortedContacts.length > 0 ? sortedContacts : [{ nom: "", email: "", tel: "", ordre: 1 }],
            emailsRappel: data.emails_rappel || "",
            statutPublication: data.statut_publication || "brouillon",
            datePublication: data.date_publication ? data.date_publication.substring(0, 16) : "",
        });
      }
    } catch (err) {
      console.error("Error fetching opportunity:", err);
      setErrorMsg(t('edit_loading_error'));
    } finally {
      setIsLoadingData(false);
    }
  };

  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const ALLOWED_DOC_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const uploadFiles = async (files: File[], folder: string) => {
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
      const { data, error } = await supabase.storage.from('opportunites').upload(fileName, file);
      if (error) throw error;
      if (data) paths.push(data.path);
    }
    return paths;
  };

  const parseDateToISO = (dateStr: string) => {
    if (!dateStr) return null;
    return dateStr; // Now coming from date/datetime-local inputs which are already ISO-ish
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
    setIsAssistantMenuOpen((prev) => !prev);
  };

  const applyAiFieldUpdates = (updates: Partial<FormDataOpportunite>) => {
    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const suppressAssistantChatAutoOpen = () => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new Event(suppressChatAutoOpenEventName));
  };

  const handleKeepInlineSuggestion = (field: SuggestionFieldKey, value: string) => {
    suppressAssistantChatAutoOpen();
    applyAiFieldUpdates({ [field]: value } as Partial<FormDataOpportunite>);
    setInlineSuggestion(null);
  };

  const triggerAssistantAction = (action: 'analyze' | 'document' | 'url' | 'chat') => {
    window.dispatchEvent(new CustomEvent(assistantTriggerEventName, { detail: { action } }));
  };

  const validateForm = () => {
    if (!formData.intituleAction) return t('validation_title_required');
    if (!formData.domaineAction) return t('validation_domain_required');
    return null;
  };
  const openPrePublishReview = async (sourceFormData: FormDataOpportunite) => {
    setPrePublishReviewError(null);
    setIsPrePublishReviewLoading(true);

    try {
      console.group('🔍 [SPELLCHECK] Starting Pre-Publish Review');
      
      const requestPayload = {
        title: sourceFormData.intituleAction,
        description: sourceFormData.descriptionGenerale,
        impactsObjectifs: sourceFormData.impactsObjectifs,
        detailsContributions: sourceFormData.detailsContributions,
        conditionsMission: sourceFormData.conditionsMission,
        detailRemuneration: sourceFormData.detailRemuneration,
        facilitesAutres: sourceFormData.facilitesAutres,
        remunerationAutre: sourceFormData.remunerationAutre,
        language: isFrench ? 'fr' : 'en',
      };
      
      console.log('📤 [SPELLCHECK] Sending to API:', requestPayload);

      const polishResponse = await fetch('/api/ai/polish-before-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      });

      const polishedData = (await polishResponse.json()) as PrePublishPolishedMission & { error?: string; details?: string };
      
      console.log('📥 [SPELLCHECK] API Response:', polishedData);
      
      if (!polishResponse.ok) {
        console.error('❌ [SPELLCHECK] API Error:', polishedData);
        throw new Error(polishedData?.details || polishedData?.error || 'Pré-correction IA impossible avant mise à jour.');
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
      
      console.log('✅ [SPELLCHECK] Corrected Data (from AI):', correctedData);

      function applyCorrectionsToForm(orig: FormDataOpportunite, corrected: PrePublishPolishedMission) {
        console.group('🔄 [SPELLCHECK] Applying AI Corrections to Form:');
        const result = { ...orig } as FormDataOpportunite;
        const fields: Array<[keyof PrePublishPolishedMission, keyof FormDataOpportunite]> = [
          ['intituleAction', 'intituleAction'],
          ['descriptionGenerale', 'descriptionGenerale'],
          ['impactsObjectifs', 'impactsObjectifs'],
          ['detailsContributions', 'detailsContributions'],
          ['conditionsMission', 'conditionsMission'],
          ['detailRemuneration', 'detailRemuneration'],
          ['facilitesAutres', 'facilitesAutres'],
          ['remunerationAutre', 'remunerationAutre'],
        ];

        let appliedAny = false;
        for (const [cKey, fKey] of fields) {
          const originalVal = String((orig as any)[fKey] ?? '');
          const correctedVal = String((corrected as any)[cKey] ?? '');
          
          if (originalVal === correctedVal) {
            console.log(`✏️  [${fKey}] No changes (identical)`);
            continue;
          }
          
          (result as any)[fKey] = correctedVal;
          appliedAny = true;
          console.log(`✅ [${fKey}] Updated:\n   From: "${originalVal.substring(0, 80)}${originalVal.length > 80 ? '...' : ''}"\n   To:   "${correctedVal.substring(0, 80)}${correctedVal.length > 80 ? '...' : ''}"`);
        }
        console.groupEnd();
        
        return { result, appliedAny } as any;
      }

      const { result: autoAppliedForm, appliedAny } = applyCorrectionsToForm(sourceFormData, correctedData);

      if (appliedAny) {
        console.log('📊 [SPELLCHECK] Corrections Applied:', {
          original: sourceFormData,
          corrected: autoAppliedForm,
        });
      } else {
        console.log('✨ [SPELLCHECK] No corrections needed - text is clean!');
      }

      setFormData(autoAppliedForm);
      setPendingPublishData({
        ...autoAppliedForm,
      });

      if (appliedAny) {
        setAssistantNotification(isFrench ? 'Corrections orthographiques appliquées automatiquement' : 'Spelling corrections applied automatically');
        if (assistantNotificationTimeoutRef.current) clearTimeout(assistantNotificationTimeoutRef.current);
        assistantNotificationTimeoutRef.current = setTimeout(() => setAssistantNotification(null), 3000);
      }

      console.log('💾 [SPELLCHECK] Saving mission to database...');
      // Automatically persist the mission (silent flow - no modal, no user confirmation needed)
      await confirmPrePublishReview(autoAppliedForm);
      console.log('✅ [SPELLCHECK] Mission saved successfully!');
      console.groupEnd();
      
    } catch (error) {
      console.error('[SPELLCHECK] Error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Erreur lors de l\'analyse IA avant mise à jour.';
      setPrePublishReviewError(errorMsg);
      setErrorMsg(errorMsg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      console.groupEnd();
    } finally {
      setIsPrePublishReviewLoading(false);
    }
  };

  const confirmPrePublishReview = async (formDataOverride?: typeof pendingPublishData) => {
    const dataToUse = formDataOverride || pendingPublishData;
    if (!dataToUse) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // upload new files if any
      let imagePath = currentImagePath;
      if (dataToUse.photoRepresentation.length > 0) {
        const paths = await uploadFiles(dataToUse.photoRepresentation, 'photos');
        imagePath = paths[0];
      }

      let documentPaths = [...currentDocPaths];
      if (dataToUse.fichierTechnique.length > 0) {
        const newPaths = await uploadFiles(dataToUse.fichierTechnique, 'fichiers');
        documentPaths = [...documentPaths, ...newPaths];
      }

      const oppPayload = {
        intitule_action: dataToUse.intituleAction,
        photo_representation_path: imagePath,
        domaine_action: dataToUse.domaineAction,
        public_vise: dataToUse.publicVise,
        timing_action: dataToUse.timingAction,
        mission_urgente: dataToUse.missionUrgente === "oui",
        date_debut: parseDateToISO(dataToUse.dateDebut),
        date_fin: parseDateToISO(dataToUse.dateFin),
        afficher_une: dataToUse.afficherUne,
        action_distance: dataToUse.actionDistance,
        description_generale: dataToUse.descriptionGenerale,
        impacts_objectifs: dataToUse.impactsObjectifs,
        details_contributions: dataToUse.detailsContributions,
        contributions_diaspora: dataToUse.contributionsDiaspora,
        fichier_technique_paths: documentPaths,
        lien_site_fb: dataToUse.lienSiteFB,
        conditions_mission: dataToUse.conditionsMission,
        remuneration_prevue: dataToUse.remunerationPrevue,
        remuneration_autre: dataToUse.remunerationAutre,
        detail_remuneration: dataToUse.detailRemuneration || null,
        facilites: dataToUse.facilites,
        facilites_autres: dataToUse.facilitesAutres,
        emails_rappel: dataToUse.emailsRappel,
        statut_publication: dataToUse.statutPublication,
        date_publication: dataToUse.datePublication ? new Date(dataToUse.datePublication).toISOString() : null,
      };

      const { data: updateData, error: updateError } = await supabase
        .from('opportunites')
        .update(oppPayload)
        .eq('id', opportunityId)
        .select('id');

      if (updateError) throw updateError;
      if (!updateData || updateData.length === 0) {
        throw new Error(t('edit_permission_error'));
      }

      const { error: deleteError } = await supabase.from('opportunite_contacts').delete().eq('opportunite_id', opportunityId);
      if (deleteError) throw deleteError;

      if (dataToUse.contacts.length > 0) {
         const contactsPayload = dataToUse.contacts
            .filter(c => c.nom || c.email)
            .map((c, i) => ({
             opportunite_id: opportunityId,
             nom: c.nom,
             email: c.email,
             tel: c.tel,
             ordre: i + 1
         }));
         const { error: insertError } = await supabase.from('opportunite_contacts').insert(contactsPayload);
         if (insertError) throw insertError;
      }

      setShowSuccess(true);
      if(onUpdateSuccess) onUpdateSuccess();
      setIsPrePublishReviewOpen(false);
      setPrePublishReview(null);
      setPendingPublishData(null);
      setPrePublishReviewError(null);

      setTimeout(() => {
          onClose();
          setShowSuccess(false);
      }, 1500);

    } catch (err: any) {
      console.error("Update error:", err);
      setErrorMsg(err.message || t('edit_update_error'));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const valErr = validateForm();
    if (valErr) {
      setErrorMsg(valErr);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      await openPrePublishReview(formData);
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMsg(err.message || t('edit_update_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-label={t('edit_modal_title')}>
      <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl h-[90vh] bg-neutral-50 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 bg-white">
          <h3 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-primary" />
            {t('edit_modal_title')}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500" aria-label={t('edit_modal_close')}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
            {isLoadingData ? (
                <div className="space-y-6 animate-pulse">
                  <div className="h-12 bg-neutral-200 rounded-lg" />
                  <div className="h-32 bg-neutral-200 rounded-lg" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-12 bg-neutral-200 rounded-lg" />
                    <div className="h-12 bg-neutral-200 rounded-lg" />
                  </div>
                  <div className="h-48 bg-neutral-200 rounded-lg" />
                  <div className="h-12 bg-neutral-200 rounded-lg" />
                </div>
            ) : (
              <div className="space-y-6">
                 {showSuccess && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-green-700 font-medium">{t('edit_update_success')}</span>
                  </div>
                 )}
                 {errorMsg && (
                   <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r flex items-center gap-3">
                     <AlertCircle className="w-5 h-5 text-red-600" />
                     <span className="text-red-700 font-medium">{errorMsg}</span>
                   </div>
                 )}

                 {currentImagePath && (
                    <div className="bg-white p-4 rounded-xl border border-neutral-200 mb-6">
                      <p className="text-sm font-medium text-neutral-900 mb-3">{t('edit_current_photo')}</p>
                      <img src={getStorageUrl(currentImagePath)!} alt="Current" className="w-full max-w-md h-48 object-cover rounded-lg" />
                    </div>
                 )}

                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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
                        onAssistantAnalyzeClick={() => { triggerAssistantAction('analyze'); setIsAssistantMenuOpen(false); }}
                        onAssistantDocumentClick={() => { triggerAssistantAction('document'); setIsAssistantMenuOpen(false); }}
                        onAssistantUrlClick={() => { triggerAssistantAction('url'); setIsAssistantMenuOpen(false); }}
                        onAssistantChatClick={() => triggerAssistantAction('chat')}
                        isAssistantMenuOpen={isAssistantMenuOpen}
                        onAssistantMenuClose={() => setIsAssistantMenuOpen(false)}
                        assistantNotification={assistantNotification}
                        missingAssistantFields={getMissingAssistantFields()}
                        assistantAnalyzeLoading={isAssistantAnalyzing}
                        isEditMode
                     />
                   </div>

                   <div className={`${isAiDraftMode ? 'lg:col-span-6' : 'lg:col-span-4'} hidden lg:block`}>
                     <EncartConseils
                       formData={formData}
                       aiResult={aiResult}
                       optimizedVersion={optimizedVersion}
                       onAiResult={setAiResult}
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
              </div>
            )}
        </div>
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
                  Aperçu IA avant mise à jour
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
                    onClick={() => void confirmPrePublishReview()}
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
};