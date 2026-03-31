"use client";

import { useState, useEffect } from "react";
import { Edit2, Loader2, Check, AlertCircle, X } from "lucide-react";
import { useTranslations } from 'next-intl';
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  FormulaireOpportunite,
  FormDataOpportunite
} from "../components/admin/FormulaireOpportunite";
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

  const validateForm = () => {
    if (!formData.intituleAction) return t('validation_title_required');
    if (!formData.domaineAction) return t('validation_domain_required');
    return null;
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
      let imagePath = currentImagePath;
      if (formData.photoRepresentation.length > 0) {
        const paths = await uploadFiles(formData.photoRepresentation, 'photos');
        imagePath = paths[0];
      }

      let documentPaths = [...currentDocPaths];
      if (formData.fichierTechnique.length > 0) {
        const newPaths = await uploadFiles(formData.fichierTechnique, 'fichiers');
        documentPaths = [...documentPaths, ...newPaths];
      }

      const oppPayload = {
        intitule_action: formData.intituleAction,
        photo_representation_path: imagePath,
        domaine_action: formData.domaineAction,
        public_vise: formData.publicVise,
        timing_action: formData.timingAction,
        mission_urgente: formData.missionUrgente === "oui",
        date_debut: parseDateToISO(formData.dateDebut),
        date_fin: parseDateToISO(formData.dateFin),
        afficher_une: formData.afficherUne,
        action_distance: formData.actionDistance,
        description_generale: formData.descriptionGenerale,
        impacts_objectifs: formData.impactsObjectifs,
        details_contributions: formData.detailsContributions,
        contributions_diaspora: formData.contributionsDiaspora,
        fichier_technique_paths: documentPaths,
        lien_site_fb: formData.lienSiteFB,
        conditions_mission: formData.conditionsMission,
        remuneration_prevue: formData.remunerationPrevue,
        remuneration_autre: formData.remunerationAutre,
        detail_remuneration: formData.detailRemuneration || null,
        facilites: formData.facilites,
        facilites_autres: formData.facilitesAutres,
        emails_rappel: formData.emailsRappel,
        statut_publication: formData.statutPublication,
        date_publication: formData.datePublication ? new Date(formData.datePublication).toISOString() : null,
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

      if (formData.contacts.length > 0) {
         const contactsPayload = formData.contacts
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

                 <FormulaireOpportunite 
                    formData={formData}
                    setFormData={setFormData}
                    isSubmitting={isSubmitting}
                    showSuccess={showSuccess}
                    errorMsg={errorMsg}
                    onSubmit={handleSubmit}
                    onPreview={() => setShowPreview(true)}
                    isEditMode
                 />
              </div>
            )}
        </div>
      </div>
      <PreviewOpportuniteModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        data={formData}
      />
    </div>
  );
};