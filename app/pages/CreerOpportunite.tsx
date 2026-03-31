"use client";

import { useEffect, useState } from "react";
import { Check, AlertCircle, PlusCircle, List, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

import { SidebarAdmin } from "../components/admin/SidebarAdmin";
import { HeaderAdmin } from "../components/admin/HeaderAdmin";
import { EncartConseils } from "../components/admin/EncartConseils";
import { PreviewOpportuniteModal } from "./PreviewOpportunite";
import { useAuth } from "../hooks/useAuth";
import { 
  FormulaireOpportunite, 
  FormDataOpportunite 
} from "../components/admin/FormulaireOpportunite";

// Initialize Supabase Client (singleton)
const supabase = getSupabaseBrowserClient();

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

  // AI Assistant States
  const [aiResult, setAiResult] = useState<any>(null);
  const [optimizedVersion, setOptimizedVersion] = useState<any>(null);

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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (parent: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as Record<string, any>),
        [field]: value,
      },
    }));
  };

  // Contact Management Helpers
  const updateContact = (index: number, field: string, value: string) => {
    const newContacts = [...formData.contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    updateField("contacts", newContacts);
  };

  const addContact = () => {
    if (formData.contacts.length < 2) {
      updateField("contacts", [
        ...formData.contacts, 
        { nom: "", email: "", tel: "", ordre: formData.contacts.length + 1 }
      ]);
    }
  };

  const removeContact = (index: number) => {
    if (formData.contacts.length > 1) {
      const newContacts = formData.contacts.filter((_, i) => i !== index);
      const reordered = newContacts.map((c, i) => ({ ...c, ordre: i + 1 }));
      updateField("contacts", reordered);
    }
  };

  // Upload Files to Supabase Storage
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

    if (!user) {
      setErrorMsg("Vous devez être connecté pour créer une action.");
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setErrorMsg(validationError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    setShowSuccess(false);

    try {
      // 1. Upload Photo
      let photoPath = null;
      if (formData.photoRepresentation.length > 0) {
        const paths = await uploadFiles(formData.photoRepresentation, 'photos');
        photoPath = paths[0];
      }

      // 2. Upload Fichier Technique
      let fichierPaths: string[] = [];
      if (formData.fichierTechnique.length > 0) {
        fichierPaths = await uploadFiles(formData.fichierTechnique, 'fichiers');
      }

      // 3. Prepare Opportunity Payload
      const oppPayload = {
        intitule_action: formData.intituleAction,
        photo_representation_path: photoPath,
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
        
        fichier_technique_paths: fichierPaths,
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
        created_by: user.id, // Add the current user's ID
        annonceur_id: profile?.annonceur_id || null, // Link to the city/organization
      };

      // 4. Insert Opportunity
      const { data: insertedOpp, error: oppError } = await supabase
        .from('opportunites')
        .insert([oppPayload])
        .select()
        .single();

      if (oppError) throw oppError;

      // 5. Insert Contacts
      if (insertedOpp && formData.contacts.length > 0) {
        const contactsPayload = formData.contacts.map((contact) => ({
            opportunite_id: insertedOpp.id,
            nom: contact.nom,
            email: contact.email,
            tel: contact.tel,
            ordre: contact.ordre
        }));

        const { error: contactError } = await supabase
            .from('opportunite_contacts')
            .insert(contactsPayload);

        if (contactError) {
            console.error("Error creating contacts", contactError);
            throw new Error("L'action a été créée mais les contacts n'ont pas pu être ajoutés.");
        }
      }

      // 6. Notify newsletter subscribers if mission is published
      if (formData.statutPublication === 'publie' && insertedOpp) {
        try {
          await fetch('/api/notify-newsletter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              domaine_action: formData.domaineAction,
              mission_title: formData.intituleAction,
              mission_id: insertedOpp.id,
              description: formData.descriptionGenerale,
            }),
          });
        } catch (newsletterErr) {
          console.error('Newsletter notification failed (non-blocking):', newsletterErr);
        }
      }

      // 7. Success State
      setShowSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Reset form or redirect? 
      // Keep state but show success is fine for now
      
    } catch (err: any) {
      console.error("Submission error:", err);
      setErrorMsg(err.message || t('create_error'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const domaineOptions = [
    { value: "investissement", label: "Investissement" },
    { value: "Santé", label: "Santé" },
    { value: "pauvrete", label: "Lutte contre la pauvreté" },
    { value: "societe-civile", label: "Soutien à la société civile (femmes, jeunes…)" },
    { value: "infrastructures", label: "Infrastructures et urbanisme" },
    { value: "environnement", label: "Environnement et propreté" },
    { value: "éducation", label: "Éducation et enfance" },
    { value: "innovation", label: "Innovation" },
    { value: "recrutement", label: "Recrutement et formation professionnelle" },
    { value: "tourisme", label: "Tourisme" },
    { value: "culture", label: "Culture et patrimoine" },
    { value: "rayonnement", label: "Rayonnement international" },
    { value: "droits", label: "Droits et citoyenneté" },
    { value: "urgences", label: "Urgences catastrophes" },
  ];

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
              <div className="lg:col-span-8">
                <FormulaireOpportunite
                  formData={formData}
                  setFormData={setFormData}
                  isSubmitting={isSubmitting}
                  showSuccess={showSuccess}
                  errorMsg={errorMsg}
                  onSubmit={handleSubmit}
                  onPreview={() => setShowPreview(true)}
                />
              </div>

              {/* Helper Sidebar */}
              <div className="lg:col-span-4 hidden lg:block">
                <EncartConseils
                  formData={formData as any}
                  aiResult={aiResult}
                  optimizedVersion={optimizedVersion}
                  onAiResult={setAiResult}
                  onOptimizedVersion={setOptimizedVersion}
                  onAssistantResponse={() => {}}
                  onApplyFieldUpdates={(updates) => setFormData(prev => ({ ...prev, ...updates }))}
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
    </div>
  );
}