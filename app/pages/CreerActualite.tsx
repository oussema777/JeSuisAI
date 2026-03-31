"use client";

import { useState, useEffect } from "react";
import { Eye, Save, Loader2, Check, AlertCircle, Plus, Trash2, FileText, X, Info } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

import { SidebarAdmin } from "../components/admin/SidebarAdmin";
import { HeaderAdmin } from "../components/admin/HeaderAdmin";
import { SectionFormulaire } from "../components/admin/SectionFormulaire";
import { ChampTexte } from "../components/admin/ChampTexte";
import { ChampTextarea } from "../components/admin/ChampTextarea";
import { ChampSelect } from "../components/admin/ChampSelect";
import { ChampCheckbox } from "../components/admin/ChampCheckbox";
import { ChampRadio } from "../components/admin/ChampRadio";
import { ChampFichier } from "../components/admin/ChampFichier";
import { EncartConseils } from "../components/admin/EncartConseils";
import { Bouton } from "../components/ds/Bouton";
import { EncartConseilsActualite } from "../components/admin/EncartConseil-actualite";
import { PreviewActualiteModal } from "./PreviewActualite";
import { useAuth } from "../hooks/useAuth";

// Initialize Supabase Client (singleton)
const supabase = getSupabaseBrowserClient();

export default function CreerActualite() {
  const t = useTranslations("Admin.NewsForm");
  const router = useRouter();
  const searchParams = useSearchParams();
  const actualiteId = searchParams.get('id');
  const isEditMode = !!actualiteId;
  const { user, profile, loading: authLoading, isSuperadmin } = useAuth();
  const hasAnnonceur = !!profile?.annonceur_id;
  
  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Mots-clés specific state
  const [motsClesInput, setMotsClesInput] = useState("");
  const [motsClesList, setMotsClesList] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    // Objet (Catégorie)
    objet: "",
    
    // Public visé
    publicVise: "",
    publicCible: "",
    
    // Titre
    titre: "",
    
    // Mots clés - will be derived from motsClesList
    motsCles: "",
    
    // Résumé (120 mots / 4 lignes max)
    resume: "",
    
    // Détail (300 mots / 10 lignes max)
    detail: "",
    
    // Appel à l'action
    appelActionTexte: "",
    appelActionUrl: "",
    
    // Image principale
    imagePrincipale: [] as File[],
    existingImagePath: "" as string,
    
    // Pièces jointes (docs PDF, photos)
    piecesJointes: [] as File[],
    existingPiecesJointes: [] as string[],
    
    // Mairie émettrice
    mairieEmettrice: "Organisation",
    
    // Publication
    statutPublication: "brouillon",
    datePublication: "",
    
    // Priorité
    prioritaire: false,
    epingle: false,
    
    // Dates de validité (optionnel - pour avis temporaires)
    dateDebut: "",
    dateFin: "",
  });

  // Load annonceur name
  useEffect(() => {
    const fetchAnnonceurName = async () => {
      if (profile?.annonceur_id) {
        const { data, error } = await supabase
          .from('annonceur_profiles')
          .select('nom')
          .eq('id', profile.annonceur_id)
          .single();
        
        if (data && !error) {
          updateField('mairieEmettrice', data.nom);
        }
      }
    };

    if (!authLoading && profile) {
      fetchAnnonceurName();
    }
  }, [profile, authLoading]);

  // Load existing actualite data if in edit mode
  useEffect(() => {
    if (isEditMode && actualiteId) {
      loadActualiteData(actualiteId);
    }
  }, [actualiteId, isEditMode]);

  const loadActualiteData = async (id: string) => {
    try {
      setIsLoading(true);
      setErrorMsg("");

      const { data, error } = await supabase
        .from('actualites')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        // Convert ISO date to YYYY-MM-DD format for date inputs
        const formatDateForInput = (isoDate: string | null) => {
          if (!isoDate) return "";
          return isoDate.split('T')[0];
        };

        // Convert ISO date or DD/MM/YYYY to YYYY-MM-DD for native date inputs
        const formatForInput = (dateStr: string | null) => {
          if (!dateStr) return "";
          if (dateStr.includes('T')) return dateStr.split('T')[0];
          if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
          return dateStr;
        };

        // Parse mots-clés into array
        const parsedMotsCles = data.mots_cles ? data.mots_cles.split(';').map((k: string) => k.trim()).filter(Boolean) : [];
        setMotsClesList(parsedMotsCles);

        setFormData({
          objet: data.objet || "",
          publicVise: data.public_vise || "",
          publicCible: data.public_cible || "",
          titre: data.titre || "",
          motsCles: data.mots_cles || "",
          resume: data.resume || "",
          detail: data.detail || "",
          appelActionTexte: data.appel_action_texte || "",
          appelActionUrl: data.appel_action_url || "",
          imagePrincipale: [],
          existingImagePath: data.image_principale_path || "",
          piecesJointes: [],
          existingPiecesJointes: data.pieces_jointes_paths || [],
          mairieEmettrice: data.mairie_emettrice || "Organisation",
          statutPublication: data.statut_publication || "brouillon",
          datePublication: data.date_publication ? formatDateForInput(data.date_publication) : "",
          prioritaire: data.prioritaire || false,
          epingle: data.epingle || false,
          dateDebut: formatForInput(data.date_debut),
          dateFin: formatForInput(data.date_fin),
        });
      }
    } catch (err: any) {
      console.error('Error loading actualité:', err);
      setErrorMsg(err.message || t("loading_error"));
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Mots-clés handlers
  const handleMotsClesInputChange = (value: string) => {
    setMotsClesInput(value);
  };

  const handleMotsClesKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ';' || e.key === ',') {
      e.preventDefault();
      addMotCle();
    }
  };

  const addMotCle = () => {
    const trimmedInput = motsClesInput.trim();
    if (trimmedInput && !motsClesList.includes(trimmedInput)) {
      const newList = [...motsClesList, trimmedInput];
      setMotsClesList(newList);
      updateField('motsCles', newList.join(';'));
      setMotsClesInput('');
    }
  };

  const removeMotCle = (indexToRemove: number) => {
    const newList = motsClesList.filter((_, index) => index !== indexToRemove);
    setMotsClesList(newList);
    updateField('motsCles', newList.join(';'));
  };

  // --- Helper: Upload Files to Supabase Storage ---
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const ALLOWED_DOC_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const uploadFiles = async (files: File[], folder: string) => {
    const paths: string[] = [];
    if (!files || files.length === 0) return paths;

    const isDocument = folder === 'documents';
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
        .from('actualites')
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

  // --- Helper: Delete file from Supabase Storage ---
  const deleteFile = async (path: string) => {
    try {
      const { error } = await supabase.storage
        .from('actualites')
        .remove([path]);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  };

  // --- Helper: Parse Date (DD/MM/YYYY -> YYYY-MM-DD) ---
  const parseDateToISO = (dateStr: string) => {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr; 
  };

  // --- Helper: Count words ---
  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  // --- Helper: Get image URL ---
  const getImageUrl = (path: string) => {
    if (!path) return null;
    const { data } = supabase.storage.from('actualites').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    setShowSuccess(false);

    try {
      if (!user) throw new Error("Vous devez être connecté.");

      // Validation personnalisée
      const titreWordCount = countWords(formData.titre);
      if (titreWordCount > 30) {
        throw new Error(`Le titre dépasse la limite de 30 mots (actuellement ${titreWordCount} mots)`);
      }

      const resumeWordCount = countWords(formData.resume);
      if (resumeWordCount > 120) {
        throw new Error(`Le résumé dépasse la limite de 120 mots (actuellement ${resumeWordCount} mots)`);
      }

      const detailWordCount = countWords(formData.detail);
      if (detailWordCount > 300) {
        throw new Error(`Le détail dépasse la limite de 300 mots (actuellement ${detailWordCount} mots)`);
      }

      // 1. Handle Image Principale
      let imagePath = formData.existingImagePath;
      if (formData.imagePrincipale.length > 0) {
        // Delete old image if exists
        if (formData.existingImagePath) {
          await deleteFile(formData.existingImagePath);
        }
        // Upload new image
        const paths = await uploadFiles(formData.imagePrincipale, 'images');
        imagePath = paths[0];
      }

      // 2. Handle Pièces Jointes
      let piecesPaths: string[] = [...formData.existingPiecesJointes];
      if (formData.piecesJointes.length > 0) {
        const newPaths = await uploadFiles(formData.piecesJointes, 'documents');
        piecesPaths = [...piecesPaths, ...newPaths];
      }

      // 3. Prepare Actualité Payload
      const actualitePayload = {
        objet: formData.objet,
        public_vise: formData.publicVise,
        public_cible: formData.publicCible || null,
        titre: formData.titre,
        mots_cles: motsClesList.join(';'),
        resume: formData.resume,
        detail: formData.detail,
        appel_action_texte: formData.appelActionTexte || null,
        appel_action_url: formData.appelActionUrl || null,
        image_principale_path: imagePath,
        pieces_jointes_paths: piecesPaths,
        mairie_emettrice: formData.mairieEmettrice,
        annonceur_id: profile?.annonceur_id || null, // Link to the city/organization
        statut_publication: formData.statutPublication,
        date_publication: formData.datePublication ? new Date(formData.datePublication).toISOString() : null,
        prioritaire: formData.prioritaire,
        epingle: formData.epingle,
        date_debut: parseDateToISO(formData.dateDebut),
        date_fin: parseDateToISO(formData.dateFin),
        created_by: user.id, // Track the creator
      };

      if (isEditMode) {
        // 4a. Update existing actualité
        const { data: updatedActualite, error: updateError } = await supabase
          .from('actualites')
          .update(actualitePayload)
          .eq('id', actualiteId)
          .select()
          .single();

        if (updateError) throw updateError;
      } else {
        // 4b. Insert new actualité
        const { data: insertedActualite, error: insertError } = await supabase
          .from('actualites')
          .insert([actualitePayload])
          .select()
          .single();

        if (insertError) throw insertError;
      }

      // 5. Success State
      setShowSuccess(true);
      window.scrollTo(0, 0);

      // Redirect after 2 seconds
      setTimeout(() => router.push('/admin/actualites'), 2000);

    } catch (err: any) {
      console.error("Submission error:", err);
      setErrorMsg(err.message || t("actions.saving_error") || "Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Options pour le champ "Objet"
  const objetOptions = [
    { value: "avis-circulation", label: t("categories.avis-circulation") },
    { value: "avis-securite", label: t("categories.avis-securite") },
    { value: "alertes-meteo", label: t("categories.alertes-meteo") },
    { value: "services-citoyens", label: t("categories.services-citoyens") },
    { value: "activites-maire", label: t("categories.activites-maire") },
    { value: "evenements", label: t("categories.evenements") },
    { value: "offres-recrutement", label: t("categories.offres-recrutement") },
    { value: "appel-offres", label: t("categories.appel-offres") },
    { value: "projets-developpement", label: t("categories.projets-developpement") },
    { value: "campagnes-sensibilisation", label: t("categories.campagnes-sensibilisation") },
    { value: "actions-solidarite", label: t("categories.actions-solidarite") },
    { value: "autres", label: t("categories.autres") },
  ];

  // Character/Word counters
  const titreWordCount = countWords(formData.titre);
  const resumeWordCount = countWords(formData.resume);
  const detailWordCount = countWords(formData.detail);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex-1 flex flex-col">
          <HeaderAdmin
            pageTitle={isEditMode ? "Modifier l'actualité" : "Créer une actualité"}
            breadcrumb={[
              { label: "Tableau de bord", href: "/admin/dashboard" },
              { label: "Actualités" },
              { label: isEditMode ? "Modifier" : "Créer nouvelle" },
            ]}
          />
          <main className="flex-1 p-4 sm:p-10 pt-[72px] flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <p className="text-neutral-600" style={{ fontSize: '15px', fontWeight: 400 }}>
                Chargement de l'actualité...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex-1 flex flex-col">
        <HeaderAdmin
          pageTitle={isEditMode ? t("title_edit") : t("title_new")}
          breadcrumb={[
            { label: t("breadcrumb_dashboard") || "Tableau de bord", href: "/admin/dashboard" },
            { label: t("breadcrumb_news") || "Actualités", href: "/admin/actualites" },
            { label: isEditMode ? t("breadcrumb_edit") || "Modifier" : t("breadcrumb_create") || "Créer nouvelle" },
          ]}
        />

        <main className="flex-1 p-4 sm:p-10 pt-[72px]">
          <div className="max-w-7xl mx-auto">
            
            {/* Success Message Banner */}
            {showSuccess && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r shadow-sm flex items-center gap-3 animate-in slide-in-from-top-2">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-green-800 font-semibold">
                    {isEditMode ? t("success_updated") : t("success_created")}
                  </h3>
                  <p className="text-green-700 text-sm">
                    {isEditMode ? t("success_updated_desc") : t("success_created_desc")}
                  </p>
                </div>
              </div>
            )}

            {/* Fiche Annonceur Required Banner */}
            {!hasAnnonceur && !isSuperadmin && !authLoading && (
              <div className="mb-6 bg-amber-50 border-l-4 border-amber-400 p-5 rounded-r shadow-sm flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-amber-800 font-semibold text-sm">{t("error_annonceur")}</h3>
                  <p className="text-amber-700 text-sm mt-1">
                    {t("error_annonceur_desc")}
                    {" "}
                    <button
                      onClick={() => router.push('/admin/parametres?tab=annonceur')}
                      className="underline font-semibold hover:text-amber-900 transition-colors"
                    >
                      {t("error_annonceur_link")}
                    </button>
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
              <div className="lg:col-span-8">
                <form onSubmit={handleSubmit}>
                  {/* Form Header */}
                  <div className="bg-white rounded-t-xl p-6 border-b border-neutral-200">
                    <h2
                      className="text-neutral-900 mb-2"
                      style={{ fontSize: "25px", fontWeight: 600 }}
                    >
                      {isEditMode ? t("title_edit") : t("title_new")}
                    </h2>
                    <p
                      className="text-neutral-600"
                      style={{ fontSize: "14px", fontWeight: 400 }}
                    >
                      {isEditMode 
                        ? t("subtitle_edit")
                        : t("subtitle_new")}
                      {" "}{t("required_fields")}
                    </p>
                  </div>

                  {/* Form Content Body */}
                  <div className="bg-white rounded-b-xl p-8 shadow-sm">
                    {/* SECTION 1: Catégorie et Public */}
                    <SectionFormulaire numero="1" titre={t("section1")}>
                      <ChampSelect
                        label={t("objet_label")}
                        name="objet"
                        value={formData.objet}
                        onChange={(value) => updateField("objet", value)}
                        options={objetOptions}
                        placeholder={t("objet_placeholder")}
                        required
                      />

                      <ChampRadio
                        label={t("public_label")}
                        name="publicVise"
                        value={formData.publicVise}
                        onChange={(value) => updateField("publicVise", value)}
                        options={[
                          { value: "tous", label: t("public_tous") },
                          { value: "diaspora", label: t("public_diaspora") },
                          { value: "cible", label: t("public_cible") },
                        ]}
                        required
                      />
                      
                      {formData.publicVise === "cible" && (
                        <ChampTexte
                          label={t("public_cible_precisez")}
                          name="publicCible"
                          value={formData.publicCible}
                          onChange={(value) => updateField("publicCible", value)}
                          placeholder={t("public_cible_placeholder")}
                          required
                        />
                      )}

                      <ChampTexte
                        label={t("mairie_label")}
                        name="mairieEmettrice"
                        value={formData.mairieEmettrice}
                        disabled
                        helperText={t("mairie_helper")}
                        onChange={() => {}}
                      />
                    </SectionFormulaire>

                    {/* SECTION 2: Contenu */}
                    <SectionFormulaire numero="2" titre={t("section2")}>
                      <div>
                        <ChampTexte
                          label={t("titre_label")}
                          name="titre"
                          value={formData.titre}
                          onChange={(value) => updateField("titre", value)}
                          placeholder={t("titre_placeholder")}
                          required
                          maxLength={200}
                        />
                        <div className="mt-1 flex items-center justify-between">
                          <p className="text-xs text-neutral-500">
                            {t("titre_helper")}
                          </p>
                          <p className={`text-xs font-medium ${titreWordCount > 30 ? 'text-red-500' : 'text-neutral-600'}`}>
                            {t("titre_word_count", { count: titreWordCount })}
                          </p>
                        </div>
                      </div>

                      {/* Mots-clés with badges */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-900 mb-2">
                          {t("mots_cles_label")} <span className="text-red-500">*</span>
                        </label>
                        
                        {/* Badges Display */}
                        {motsClesList.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                            {motsClesList.map((motCle, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20 hover:bg-primary/20 transition-colors"
                              >
                                {motCle}
                                <button
                                  type="button"
                                  onClick={() => removeMotCle(index)}
                                  className="hover:bg-primary/30 rounded-full p-0.5 transition-colors"
                                  aria-label={t("mots_cles_remove", { motCle })}
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Input Field */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={motsClesInput}
                            onChange={(e) => handleMotsClesInputChange(e.target.value)}
                            onKeyDown={handleMotsClesKeyDown}
                            placeholder={t("mots_cles_placeholder")}
                            className="flex-1 px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                          />
                          <button
                            type="button"
                            onClick={addMotCle}
                            disabled={!motsClesInput.trim()}
                            className="px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            {t("mots_cles_add")}
                          </button>
                        </div>

                        <p className="mt-2 text-xs text-neutral-500">
                          {t("mots_cles_helper")}
                        </p>
                      </div>

                      <div>
                        <ChampTextarea
                          label={t("resume_label")}
                          name="resume"
                          value={formData.resume}
                          onChange={(value) => updateField("resume", value)}
                          placeholder={t("resume_placeholder")}
                          required
                          rows={5}
                          maxLength={1000}
                        />
                        <div className="mt-1 flex items-center justify-between">
                          <p className="text-xs text-neutral-500">
                            {t("resume_helper")}
                          </p>
                          <p className={`text-xs font-medium ${resumeWordCount > 120 ? 'text-red-500' : 'text-neutral-600'}`}>
                            {t("resume_word_count", { count: resumeWordCount })}
                          </p>
                        </div>
                      </div>

                      <div>
                        <ChampTextarea
                          label={t("detail_label")}
                          name="detail"
                          value={formData.detail}
                          onChange={(value) => updateField("detail", value)}
                          placeholder={t("detail_placeholder")}
                          required
                          rows={10}
                          maxLength={2500}
                        />
                        <div className="mt-1 flex items-center justify-between">
                          <p className="text-xs text-neutral-500">
                            {t("detail_helper")}
                          </p>
                          <p className={`text-xs font-medium ${detailWordCount > 300 ? 'text-red-500' : 'text-neutral-600'}`}>
                            {t("detail_word_count", { count: detailWordCount })}
                          </p>
                        </div>
                      </div>
                    </SectionFormulaire>

                    {/* SECTION 3: Appel à l'action */}
                    <SectionFormulaire numero="3" titre={t("section3")}>
                      <ChampTexte
                        label={t("cta_text_label")}
                        name="appelActionTexte"
                        value={formData.appelActionTexte}
                        onChange={(value) => updateField("appelActionTexte", value)}
                        placeholder={t("cta_text_placeholder")}
                      />

                      <ChampTexte
                        label={t("cta_link_label")}
                        name="appelActionUrl"
                        value={formData.appelActionUrl}
                        onChange={(value) => updateField("appelActionUrl", value)}
                        placeholder={t("cta_link_placeholder")}
                        helperText={t("cta_link_helper")}
                      />
                    </SectionFormulaire>

                    {/* SECTION 4: Médias */}
                    <SectionFormulaire numero="4" titre={t("section4")}>
                      <div>
                        {formData.existingImagePath && (
                          <div className="mb-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                            <p className="text-sm text-neutral-700 mb-2 font-medium">{t("image_current")}</p>
                            <img 
                              src={getImageUrl(formData.existingImagePath) || ''} 
                              alt="Current Image" 
                              className="w-full max-w-md h-48 object-cover rounded-lg"
                            />
                            <p className="text-xs text-neutral-500 mt-2">
                              {t("image_replace_helper")}
                            </p>
                          </div>
                        )}
                        <ChampFichier
                          label={formData.existingImagePath ? t("image_new_label") : t("image_label")}
                          name="imagePrincipale"
                          files={formData.imagePrincipale}
                          onChange={(files) => updateField("imagePrincipale", files)}
                          accept="image/jpeg,image/png,image/webp"
                          maxSize={5}
                          helperText={t("image_helper")}
                        />
                      </div>

                      <div>
                        {formData.existingPiecesJointes.length > 0 && (
                          <div className="mb-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                            <p className="text-sm text-neutral-700 mb-2 font-medium">
                              {t("attachments_existing", { count: formData.existingPiecesJointes.length })}
                            </p>
                            <div className="space-y-2">
                              {formData.existingPiecesJointes.map((path, index) => (
                                <div key={index} className="flex items-center justify-between bg-white p-2 rounded border border-neutral-200">
                                  <span className="text-xs text-neutral-600 truncate flex-1">
                                    {path.split('/').pop()}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newPieces = formData.existingPiecesJointes.filter((_, i) => i !== index);
                                      updateField("existingPiecesJointes", newPieces);
                                      deleteFile(path);
                                    }}
                                    className="ml-2 text-red-500 hover:text-red-700"
                                    aria-label="Remove attachment"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <ChampFichier
                          label={t("attachments_label")}
                          name="piecesJointes"
                          files={formData.piecesJointes}
                          onChange={(files) => updateField("piecesJointes", files)}
                          accept=".pdf,.doc,.docx,image/jpeg,image/png"
                          multiple
                          maxSize={10}
                          helperText={t("attachments_helper")}
                        />
                      </div>
                    </SectionFormulaire>

                    {/* SECTION 5: Publication et priorité */}
                    <SectionFormulaire numero="5" titre={t("section5")}>
                      <div className="space-y-4">
                        <ChampCheckbox
                          label={t("prioritaire_label")}
                          name="prioritaire"
                          checked={formData.prioritaire}
                          onChange={(checked) => updateField("prioritaire", checked)}
                          helperText={t("prioritaire_helper")}
                        />

                        <ChampCheckbox
                          label={t("epingle_label")}
                          name="epingle"
                          checked={formData.epingle}
                          onChange={(checked) => updateField("epingle", checked)}
                          helperText={t("epingle_helper")}
                        />
                      </div>

                      <div className="mt-6 pt-6 border-t border-neutral-200">
                        <label className="text-neutral-900 mb-3 block" style={{ fontSize: "14px", fontWeight: 500 }}>
                          {t("validity_title")}
                        </label>
                        <p className="text-sm text-neutral-600 mb-4">
                          {t("validity_desc")}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <ChampTexte
                            label={t("date_debut")}
                            name="dateDebut"
                            type="date"
                            value={formData.dateDebut}
                            onChange={(value) => updateField("dateDebut", value)}
                          />
                          <ChampTexte
                            label={t("date_fin")}
                            name="dateFin"
                            type="date"
                            value={formData.dateFin}
                            onChange={(value) => updateField("dateFin", value)}
                          />
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-neutral-200">
                        <ChampRadio
                          label={t("statut_label")}
                          name="statutPublication"
                          value={formData.statutPublication}
                          onChange={(value) => updateField("statutPublication", value)}
                          options={[
                            { value: "brouillon", label: t("statut_brouillon") },
                            { value: "publier", label: t("statut_publier") },
                            { value: "programmer", label: t("statut_programmer") },
                          ]}
                        />
                        
                        {formData.statutPublication === "programmer" && (
                          <ChampTexte
                            label={t("date_publication_label")}
                            name="datePublication"
                            value={formData.datePublication}
                            onChange={(value) => updateField("datePublication", value)}
                            placeholder={t("date_publication_placeholder")}
                          />
                        )}
                      </div>
                    </SectionFormulaire>
                  </div>

                  {/* FORM FOOTER */}
                  <div className="sticky bottom-0 bg-white border-t border-neutral-200 shadow-lg rounded-lg mt-6 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 z-20">
                    <div className="flex items-center gap-4">
                      <Bouton 
                        variant="tertiaire" 
                        size="moyen" 
                        disabled={isSubmitting}
                        type="button"
                        onClick={() => router.push('/admin/actualites')}
                      >
                        {t("actions.cancel")}
                      </Bouton>
                    </div>

                    <div className="flex items-center gap-3">
                      <Bouton 
                        variant="secondaire" 
                        size="moyen" 
                        icon={<Eye className="w-5 h-5" />} 
                        disabled={isSubmitting}
                        type="button"
                        onClick={() => setShowPreview(true)}
                      >
                        {t("actions.preview")}
                      </Bouton>
                      <Bouton
                        variant="primaire"
                        size="moyen"
                        icon={isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (showSuccess ? <Check className="w-5 h-5"/> : <Save className="w-5 h-5" />)}
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting 
                          ? (isEditMode ? t("actions.modifying") : t("actions.saving")) 
                          : showSuccess 
                            ? (isEditMode ? t("actions.modified") : t("actions.saved")) 
                            : (formData.statutPublication === "brouillon" 
                                ? (isEditMode ? t("actions.save_changes") : t("actions.save_draft")) 
                                : (isEditMode ? t("actions.publish_changes") : t("actions.publish"))
                              )
                        }
                      </Bouton>
                    </div>
                  </div>
                </form>
              </div>

              {/* Helper Sidebar */}
              <div className="lg:col-span-4 hidden lg:block">
                <EncartConseilsActualite />
              </div>
            </div>
            ) : null}
          </div>
        </main>
      </div>

      <PreviewActualiteModal 
        isOpen={showPreview} 
        onClose={() => setShowPreview(false)} 
        data={formData} 
        motsCles={motsClesList}
      />
    </div>
  );
}