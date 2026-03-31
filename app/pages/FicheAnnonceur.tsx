// Updated Fiche Annonceur Tab Component with Role-Based Access Control
// This component handles both viewing and editing based on user role
// UPDATED: Added "ville" field to the form

import React, { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import {
  Upload,
  ExternalLink,
  Mail,
  Phone,
  Globe,
  MapPin,
  User,
  MessageCircle,
  Info,
  Save,
  Briefcase,
  FileText,
  Trash2,
  Plus,
  X as XIcon,
  Facebook as FacebookIcon,
  Linkedin as LinkedinIcon,
  Instagram as InstagramIcon,
  Video as TiktokIcon,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { ImageUploadWidget } from '../components/admin/ImageUploadWidget';
import { useTranslations, useLocale } from 'next-intl';

interface AnnonceurProfile {
  id: string;
  user_id: string;
  pays: string;
  ville: string | null;  // ADDED: ville field
  statut: string;
  nom: string;
  adresse: string;
  logo_url: string | null;
  photo_presentation_url: string | null;
  presentation: string;
  mot_dirigeant: string;
  nom_dirigeant: string;
  poste_dirigeant: string;
  photo_dirigeant_url: string | null;
  site_web: string | null;
  facebook: string | null;
  linkedin: string | null;
  tiktok: string | null;
  instagram: string | null;
  contact_legal_nom: string;
  contact_legal_prenom: string;
  contact_legal_fonction: string;
  contact_legal_email: string;
  contact_legal_whatsapp: string;
  points_focaux_diaspora: Array<{
    nom: string;
    prenom: string;
    fonction: string;
    email: string;
    whatsapp: string;
  }>;
  emails_destinataires: string;
  domaines_action: string[];
  contributions_recherchees: string[];
  nombre_programmes_annuels: string | null;
  facilites_offertes: string[];
  facilites_autres: string | null;
  pieces_jointes: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  created_at: string;
  updated_at: string;
}

interface FocalPoint {
  nom: string;
  prenom: string;
  fonction: string;
  email: string;
  whatsapp: string;
}

const VILLES_CAMEROUN = [
  'National (toutes les villes)',
  'Bafoussam',
  'Bamenda',
  'Bertoua',
  'Douala',
  'Ebolowa',
  'Edéa',
  'Garoua',
  'Kribi',
  'Kumba',
  'Limbe',
  'Maroua',
  'Ngaoundéré',
  'Nkongsamba',
  'Yaoundé',
  'Autre ville',
];

const STATUTS = [
  'Collectivité locale',
  'Administration centrale',
  'Aéroport',
  'Bailleur de fonds',
  'ONG',
  'Entreprise'
];

const DOMAINES_ACTION = [
  'Entreprenariat',
  'Immobilier',
  'Santé',
  'Lutte contre la pauvreté',
  'Soutien à la société civile (femmes, jeunes…)',
  'Infrastructures et urbanisme',
  'Environnement et propreté',
  'Education et enfance',
  'Innovation',
  'Emploi et formation professionnelle',
  'Tourisme',
  'Culture et patrimoine',
  'Rayonnement international',
  'Droits et citoyenneté',
  'Urgence catastrophe'
];

const CONTRIBUTIONS = [
  'Investissement',
  'Epargne',
  'Compétences',
  'Dons',
  'Réseaux & influence',
  'Achats & tourisme solidaires'
];

const FACILITES = [
  'Interlocuteur dédié (email, tel…)',
  'Travail ou collaboration à distance',
  'Assistance projets',
  'Mise à disposition de locaux et matériels',
  'Accès à un réseau de prestataires agrées',
  'Autres (précisez)',
  'Aucun'
];

const NOMBRE_PROGRAMMES = ['<2', '2 et >5', '>5 et <10', '>10'];

export function FicheAnnonceurTab({
  userProfile,
  supabase,
  onProfileUpdate,
}: {
  userProfile: any;
  supabase: any;
  onProfileUpdate: () => void;
}) {
  const t = useTranslations('Admin.Settings.Announcer');
  const locale = useLocale();
  const { profile: currentUserProfile, loading: authLoading } = useAuth();
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [loading, setLoading] = useState(true);
  const [annonceurProfile, setAnnonceurProfile] = useState<AnnonceurProfile | null>(null);

  // Temporary storage for uploaded image URLs before form save
  const [tempLogoUrl, setTempLogoUrl] = useState<string | null>(null);
  const [tempPhotoUrl, setTempPhotoUrl] = useState<string | null>(null);
  const [tempDirigeantUrl, setTempDirigeantUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    pays: 'Cameroun',
    ville: '',  // ADDED: ville field in form data
    statut: '',
    nom: '',
    adresse: '',
    presentation: '',
    mot_dirigeant: '',
    nom_dirigeant: '',
    poste_dirigeant: '',
    site_web: '',
    facebook: '',
    linkedin: '',
    tiktok: '',
    instagram: '',
    contact_legal_nom: '',
    contact_legal_prenom: '',
    contact_legal_fonction: '',
    contact_legal_email: '',
    contact_legal_whatsapp: '',
    emails_destinataires: '',
    nombre_programmes_annuels: '',
    facilites_autres: '',
  });

  const [pointsFocaux, setPointsFocaux] = useState<FocalPoint[]>([{ nom: '', prenom: '', fonction: '', email: '', whatsapp: '' }]);
  const [domainesAction, setDomainesAction] = useState<string[]>([]);
  const [contributions, setContributions] = useState<string[]>([]);
  const [facilites, setFacilites] = useState<string[]>([]);
  const [piecesJointes, setPiecesJointes] = useState<Array<{ name: string; url: string; type: string }>>([]);

  // Check if user can edit (Admin, Superadmin, or Annonceur)
  const canEdit = userProfile?.role === 'Admin' || userProfile?.role === 'Superadmin' || userProfile?.role === 'Annonceur';

  // Fetch annonceur profile on mount
  useEffect(() => {
    if (!authLoading) {
      if (userProfile.annonceur_id) {
        fetchAnnonceurProfile();
      } else {
        setLoading(false);
      }
    }
  }, [userProfile.annonceur_id, authLoading]);

  const fetchAnnonceurProfile = async () => {
    try {
      setLoading(true);
      
      // If user has annonceur_id, fetch that specific profile
      if (userProfile.annonceur_id) {
        const { data, error } = await supabase
          .from('annonceur_profiles')
          .select('*')
          .eq('id', userProfile.annonceur_id)
          .single();

        if (error) {
          console.error('Error fetching annonceur profile:', error);
          return;
        }

        if (data) {
          setAnnonceurProfile(data);
          populateFormData(data);
        }
      } else {
        // No annonceur_id - empty state
        setAnnonceurProfile(null);
      }
    } catch (error) {
      console.error('Error fetching annonceur profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const populateFormData = (data: AnnonceurProfile) => {
    setFormData({
      pays: data.pays || 'Cameroun',
      ville: data.ville || '',  // ADDED: populate ville
      statut: data.statut || '',
      nom: data.nom || '',
      adresse: data.adresse || '',
      presentation: data.presentation || '',
      mot_dirigeant: data.mot_dirigeant || '',
      nom_dirigeant: data.nom_dirigeant || '',
      poste_dirigeant: data.poste_dirigeant || '',
      site_web: data.site_web || '',
      facebook: data.facebook || '',
      linkedin: data.linkedin || '',
      tiktok: data.tiktok || '',
      instagram: data.instagram || '',
      contact_legal_nom: data.contact_legal_nom || '',
      contact_legal_prenom: data.contact_legal_prenom || '',
      contact_legal_fonction: data.contact_legal_fonction || '',
      contact_legal_email: data.contact_legal_email || '',
      contact_legal_whatsapp: data.contact_legal_whatsapp || '',
      emails_destinataires: data.emails_destinataires || '',
      nombre_programmes_annuels: data.nombre_programmes_annuels || '',
      facilites_autres: data.facilites_autres || '',
    });
    
    // Ensure at least one focal point is shown if list is empty
    const pointsFocauxData = data.points_focaux_diaspora || [];
    setPointsFocaux(pointsFocauxData.length > 0 ? pointsFocauxData : [{ nom: '', prenom: '', fonction: '', email: '', whatsapp: '' }]);
    
    setDomainesAction(data.domaines_action || []);
    setContributions(data.contributions_recherchees || []);
    setFacilites(data.facilites_offertes || []);
    setPiecesJointes(data.pieces_jointes || []);
  };

  const handleInputChange = (field: string, value: string) => {
    if (!canEdit) return;
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleAddFocalPoint = () => {
    if (!canEdit) return;
    setPointsFocaux([
      ...pointsFocaux,
      { nom: '', prenom: '', fonction: '', email: '', whatsapp: '' },
    ]);
    setHasChanges(true);
  };

  const handleRemoveFocalPoint = (index: number) => {
    if (!canEdit) return;
    setPointsFocaux(pointsFocaux.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleFocalPointChange = (index: number, field: string, value: string) => {
    if (!canEdit) return;
    const updated = [...pointsFocaux];
    updated[index] = { ...updated[index], [field]: value };
    setPointsFocaux(updated);
    setHasChanges(true);
  };

  const toggleCheckbox = (
    array: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    if (!canEdit) return;
    if (array.includes(value)) {
      setter(array.filter((item) => item !== value));
    } else {
      setter([...array, value]);
    }
    setHasChanges(true);
  };

  const handleReset = () => {
    if (!canEdit) return;
    if (annonceurProfile) {
      populateFormData(annonceurProfile);
    }
    setTempLogoUrl(null);
    setTempPhotoUrl(null);
    setTempDirigeantUrl(null);
    setHasChanges(false);
  };

  const validateForm = () => {
    const requiredFields = [
      'pays', 'ville', 'statut', 'nom', 'adresse', 'presentation', 'mot_dirigeant',  // ADDED: ville to required fields
      'nom_dirigeant', 'poste_dirigeant', 'contact_legal_nom', 'contact_legal_prenom',
      'contact_legal_fonction', 'contact_legal_email',
      'emails_destinataires'
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]?.trim()) {
        toast.warning(t('toast_required', { field }));
        return false;
      }
    }

    if (pointsFocaux.length === 0) {
      toast.warning(t('toast_focal_required'));
      return false;
    }

    // Valider que tous les champs de chaque point focal sont remplis
    for (let i = 0; i < pointsFocaux.length; i++) {
      const focal = pointsFocaux[i];
      if (!focal.nom?.trim() || !focal.prenom?.trim() || !focal.fonction?.trim() || !focal.email?.trim() || !focal.whatsapp?.trim()) {
        toast.warning(t('toast_focal_fields', { count: i + 1 }));
        return false;
      }
    }

    if (domainesAction.length === 0) {
      toast.warning(t('toast_domain_required'));
      return false;
    }

    if (contributions.length === 0) {
      toast.warning(t('toast_contrib_required'));
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!canEdit) {
      toast.error(t('no_permission'));
      return;
    }

    if (!validateForm()) return;

    try {
      setSaving(true);

      const profileData = {
        pays: formData.pays,
        ville: formData.ville.trim(),  // ADDED: include ville in save data
        statut: formData.statut,
        nom: formData.nom.trim(),
        adresse: formData.adresse.trim(),
        logo_url: tempLogoUrl || annonceurProfile?.logo_url || null,
        photo_presentation_url: tempPhotoUrl || annonceurProfile?.photo_presentation_url || null,
        photo_dirigeant_url: tempDirigeantUrl || annonceurProfile?.photo_dirigeant_url || null,
        presentation: formData.presentation.trim(),
        mot_dirigeant: formData.mot_dirigeant.trim(),
        nom_dirigeant: formData.nom_dirigeant.trim(),
        poste_dirigeant: formData.poste_dirigeant.trim(),
        site_web: formData.site_web.trim() || null,
        facebook: formData.facebook.trim() || null,
        linkedin: formData.linkedin.trim() || null,
        tiktok: formData.tiktok.trim() || null,
        instagram: formData.instagram.trim() || null,
        contact_legal_nom: formData.contact_legal_nom.trim(),
        contact_legal_prenom: formData.contact_legal_prenom.trim(),
        contact_legal_fonction: formData.contact_legal_fonction.trim(),
        contact_legal_email: formData.contact_legal_email.trim(),
        contact_legal_whatsapp: formData.contact_legal_whatsapp.trim(),
        points_focaux_diaspora: pointsFocaux,
        emails_destinataires: formData.emails_destinataires.trim(),
        domaines_action: domainesAction,
        contributions_recherchees: contributions,
        nombre_programmes_annuels: formData.nombre_programmes_annuels || null,
        facilites_offertes: facilites,
        facilites_autres: formData.facilites_autres.trim() || null,
        pieces_jointes: piecesJointes,
        updated_at: new Date().toISOString(),
      };

      let annonceurProfileId: string;

      if (annonceurProfile) {
        // Update existing annonceur profile
        const { error } = await supabase
          .from('annonceur_profiles')
          .update(profileData)
          .eq('id', annonceurProfile.id);

        if (error) throw error;
        
        annonceurProfileId = annonceurProfile.id;
      } else {
        // Insert new annonceur profile (only if no annonceur_id exists)
        if (!userProfile.annonceur_id) {
          const { data: insertedProfile, error } = await supabase
            .from('annonceur_profiles')
            .insert([profileData])
            .select('id')
            .single();

          if (error) throw error;
          
          annonceurProfileId = insertedProfile.id;

          // Update the profiles table to link annonceur_id
          const { error: profileUpdateError } = await supabase
            .from('profiles')
            .update({ 
              annonceur_id: annonceurProfileId,
              updated_at: new Date().toISOString()
            })
            .eq('id', userProfile.id);

          if (profileUpdateError) {
            console.error('Error updating profile annonceur_id:', profileUpdateError);
            throw profileUpdateError;
          }
        } else {
          throw new Error('Un profil annonceur existe déjà pour cet utilisateur');
        }
      }

      // Clear temporary URLs after successful save
      setTempLogoUrl(null);
      setTempPhotoUrl(null);
      setTempDirigeantUrl(null);

      await fetchAnnonceurProfile();
      
      // Call the parent's onProfileUpdate to refresh the user profile
      if (onProfileUpdate) {
        await onProfileUpdate();
      }
      
      setHasChanges(false);
      toast.success(t('toast_save_success'), {
        duration: 5000,
        style: {
          border: '1px solid #10b981',
          padding: '16px',
          color: '#064e3b',
        },
      });
    } catch (error: any) {
      console.error('Error saving annonceur profile:', error);
      toast.error(error.message || t('toast_save_error'));
    } finally {
      setSaving(false);
    }
  };

  // Image upload complete handlers
  const handleImageUploadComplete = async (
    publicUrl: string,
    dbField: string,
    tempSetter: (url: string) => void,
    successMessage: string
  ) => {
    if (annonceurProfile) {
      await supabase
        .from('annonceur_profiles')
        .update({ [dbField]: publicUrl })
        .eq('id', annonceurProfile.id);
      await fetchAnnonceurProfile();
      toast.success(successMessage, { duration: 4000 });
    } else {
      tempSetter(publicUrl);
      setHasChanges(true);
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEdit) return;

    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allowedDocTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    const maxDocSize = 10 * 1024 * 1024; // 10MB

    for (let i = 0; i < files.length; i++) {
      if (!allowedDocTypes.includes(files[i].type)) {
        toast.warning('Type de fichier non autorisé. Formats acceptés : PDF, DOC, DOCX, PPTX');
        return;
      }
      if (files[i].size > maxDocSize) {
        toast.warning('Le fichier est trop volumineux. Taille maximale : 10 Mo');
        return;
      }
    }

    try {
      setUploadingDocument(true);
      const uploadedFiles: Array<{ name: string; url: string; type: string }> = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
        const timestamp = Date.now();
        const path = `${userProfile.id}/document_${timestamp}_${i}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('annonceur-documents')
          .upload(path, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('annonceur-documents').getPublicUrl(path);
        
        uploadedFiles.push({
          name: file.name,
          url: data.publicUrl,
          type: file.type,
        });
      }

      const newPiecesJointes = [...piecesJointes, ...uploadedFiles];
      setPiecesJointes(newPiecesJointes);
      setHasChanges(true);
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error(t('toast_upload_error'));
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleRemoveDocument = (index: number) => {
    if (!canEdit) return;
    if (!confirm(t('confirm_doc_delete'))) return;
    setPiecesJointes(piecesJointes.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  // Get current logo URL (from temp or profile)
  const getCurrentLogoUrl = () => tempLogoUrl || annonceurProfile?.logo_url;
  const getCurrentPhotoUrl = () => tempPhotoUrl || annonceurProfile?.photo_presentation_url;
  const getCurrentDirigeantUrl = () => tempDirigeantUrl || annonceurProfile?.photo_dirigeant_url;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-neutral-600">Chargement de la fiche...</div>
      </div>
    );
  }

  // Empty state when no annonceur_id exists
  if (!userProfile.annonceur_id && !canEdit) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Info className="w-16 h-16 text-neutral-300 mb-4" strokeWidth={1.5} />
        <h3 className="text-neutral-900 mb-2" style={{ fontSize: '20px', fontWeight: 600 }}>
          {t('title')}
        </h3>
        <p className="text-neutral-600 text-center max-w-md" style={{ fontSize: '15px', fontWeight: 400 }}>
          Aucune fiche annonceur n&apos;est associée à ce profil. Contactez un administrateur pour créer une fiche.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-neutral-900 mb-2" style={{ fontSize: '25px', fontWeight: 600 }}>
            {t('title')}
          </h2>
          <p className="text-neutral-600" style={{ fontSize: '15px', fontWeight: 400 }}>
            {canEdit 
              ? t('subtitle_edit')
              : t('subtitle_view')}
          </p>
          {!canEdit && (
            <div className="flex items-center gap-2 mt-2 text-orange-600" style={{ fontSize: '13px', fontWeight: 500 }}>
              <Lock className="w-4 h-4" strokeWidth={2} />
              <span>{t('no_permission')}</span>
            </div>
          )}
        </div>
        {annonceurProfile?.id && (
          <Link
            href={`/fiche-ville/${annonceurProfile.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-11 px-5 border rounded-lg text-white hover:opacity-90 transition-colors flex items-center gap-2"
            style={{ fontSize: '14px', fontWeight: 500, backgroundColor: '#F7BB10', borderColor: '#F7BB10' }}
          >
            <ExternalLink className="w-4.5 h-4.5" strokeWidth={2} />
            {t('preview')} <span className="sr-only">(nouvelle fenêtre)</span>
          </Link>
        )}
      </div>

      <div className="h-px bg-neutral-200 mb-8" />

      {/* SECTION 1: Informations de base */}
      <div className="mb-10">
        <h4 className="text-neutral-900 mb-6" style={{ fontSize: '18px', fontWeight: 600 }}>
          {t('section_basic')}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pays */}
          <div>
            <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
              {t('country')}
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value="Cameroun"
                readOnly
                className="w-full h-12 px-4 border border-neutral-300 rounded-lg bg-neutral-100 text-neutral-500 cursor-not-allowed"
                style={{ fontSize: '16px', fontWeight: 400 }}
              />
              <Lock className="absolute right-4 w-4 h-4 text-neutral-400 pointer-events-none" />
            </div>
          </div>

          {/* Ville field */}
          <div>
            <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
              {t('city')}
            </label>
            <select
              value={formData.ville}
              onChange={(e) => handleInputChange('ville', e.target.value)}
              disabled={!canEdit}
              className={`w-full h-12 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
              style={{ fontSize: '16px', fontWeight: 400 }}
            >
              <option value="">{t('city_placeholder')}</option>
              {VILLES_CAMEROUN.map((ville) => (
                <option key={ville} value={ville}>{ville}</option>
              ))}
            </select>
          </div>

          {/* Statut */}
          <div>
            <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
              {t('status')}
            </label>
            <select
              value={formData.statut}
              onChange={(e) => handleInputChange('statut', e.target.value)}
              disabled={!canEdit}
              className={`w-full h-12 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
              style={{ fontSize: '16px', fontWeight: 400 }}
            >
              <option value="">{t('status_placeholder')}</option>
              {STATUTS.map((statut) => (
                <option key={statut} value={statut}>{statut}</option>
              ))}
            </select>
          </div>

          {/* Nom */}
          <div className="md:col-span-2">
            <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
              {t('name')}
            </label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => handleInputChange('nom', e.target.value)}
              disabled={!canEdit}
              className={`w-full h-12 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${!canEdit ? 'opacity-60 cursor-not-allowed bg-neutral-50' : ''}`}
              style={{ fontSize: '16px', fontWeight: 400 }}
              placeholder={t('name')}
            />
          </div>

          {/* Adresse */}
          <div className="md:col-span-2">
            <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
              {t('address')}
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 inset-y-0 my-auto w-5 h-5 text-neutral-400" strokeWidth={2} />
              <input
                type="text"
                value={formData.adresse}
                onChange={(e) => handleInputChange('adresse', e.target.value)}
                disabled={!canEdit}
                className={`w-full h-12 pl-12 pr-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${!canEdit ? 'opacity-60 cursor-not-allowed bg-neutral-50' : ''}`}
                style={{ fontSize: '16px', fontWeight: 400 }}
                placeholder={t('address_placeholder')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Canaux officiels */}
      <div className="mb-10">
        <h4 className="text-neutral-900 mb-6" style={{ fontSize: '18px', fontWeight: 600 }}>
          {t('section_channels')}
        </h4>

        <div className="grid grid-cols-1 gap-4">
          {/* Site web */}
          <div>
            <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
              {t('website')}
            </label>
            <div className="relative">
              <Globe className="absolute left-4 inset-y-0 my-auto w-5 h-5 text-neutral-400" strokeWidth={2} />
              <input
                type="url"
                value={formData.site_web}
                onChange={(e) => handleInputChange('site_web', e.target.value)}
                disabled={!canEdit}
                className={`w-full h-12 pl-12 pr-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${!canEdit ? 'opacity-60 cursor-not-allowed bg-neutral-50' : ''}`}
                style={{ fontSize: '16px', fontWeight: 400 }}
                placeholder="https://www.exemple.cm"
              />
            </div>
          </div>

          {/* Réseaux sociaux */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
                Facebook
              </label>
              <div className="relative">
                <FacebookIcon className="absolute left-4 inset-y-0 my-auto w-5 h-5 text-neutral-400" strokeWidth={2} />
                <input
                  type="url"
                  value={formData.facebook}
                  onChange={(e) => handleInputChange('facebook', e.target.value)}
                  disabled={!canEdit}
                  className={`w-full h-12 pl-12 pr-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${!canEdit ? 'opacity-60 cursor-not-allowed bg-neutral-50' : ''}`}
                  style={{ fontSize: '16px', fontWeight: 400 }}
                  placeholder="https://facebook.com/..."
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
                LinkedIn
              </label>
              <div className="relative">
                <LinkedinIcon className="absolute left-4 inset-y-0 my-auto w-5 h-5 text-neutral-400" strokeWidth={2} />
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => handleInputChange('linkedin', e.target.value)}
                  disabled={!canEdit}
                  className={`w-full h-12 pl-12 pr-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${!canEdit ? 'opacity-60 cursor-not-allowed bg-neutral-50' : ''}`}
                  style={{ fontSize: '16px', fontWeight: 400 }}
                  placeholder="https://linkedin.com/company/..."
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
                TikTok
              </label>
              <div className="relative">
                <TiktokIcon className="absolute left-4 inset-y-0 my-auto w-5 h-5 text-neutral-400" strokeWidth={2} />
                <input
                  type="url"
                  value={formData.tiktok}
                  onChange={(e) => handleInputChange('tiktok', e.target.value)}
                  disabled={!canEdit}
                  className={`w-full h-12 pl-12 pr-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${!canEdit ? 'opacity-60 cursor-not-allowed bg-neutral-50' : ''}`}
                  style={{ fontSize: '16px', fontWeight: 400 }}
                  placeholder="https://tiktok.com/@..."
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
                Instagram
              </label>
              <div className="relative">
                <InstagramIcon className="absolute left-4 inset-y-0 my-auto w-5 h-5 text-neutral-400" strokeWidth={2} />
                <input
                  type="url"
                  value={formData.instagram}
                  onChange={(e) => handleInputChange('instagram', e.target.value)}
                  disabled={!canEdit}
                  className={`w-full h-12 pl-12 pr-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${!canEdit ? 'opacity-60 cursor-not-allowed bg-neutral-50' : ''}`}
                  style={{ fontSize: '16px', fontWeight: 400 }}
                  placeholder="https://instagram.com/..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Identité visuelle */}
      <div className="mb-10">
        <h4 className="text-neutral-900 mb-6" style={{ fontSize: '18px', fontWeight: 600 }}>
          {t('section_visual')}
        </h4>

        {/* Logo */}
        <div className="mb-6">
          <ImageUploadWidget
            label={t('logo_label')}
            currentUrl={getCurrentLogoUrl()}
            bucket="annonceur-logos"
            pathPrefix="logo"
            userId={userProfile.id}
            supabase={supabase}
            maxSizeMB={2}
            onUploadComplete={(url) =>
              handleImageUploadComplete(url, 'logo_url', setTempLogoUrl, 'Logo mis à jour !')
            }
            disabled={!canEdit}
            previewStyle={{ width: '140px', height: '140px' }}
            inputId="logo-upload"
          />
        </div>

        {/* Photo de présentation */}
        <ImageUploadWidget
          label={t('photo_presentation_label')}
          currentUrl={getCurrentPhotoUrl()}
          bucket="annonceur-photos"
          pathPrefix="photo_presentation"
          userId={userProfile.id}
          supabase={supabase}
          maxSizeMB={5}
          onUploadComplete={(url) =>
            handleImageUploadComplete(url, 'photo_presentation_url', setTempPhotoUrl, 'Photo de présentation mise à jour !')
          }
          disabled={!canEdit}
          previewClassName="w-80 h-40"
          inputId="photo-upload"
        />
      </div>

      {/* SECTION 3: Présentation */}
      <div className="mb-10">
        <h4 className="text-neutral-900 mb-6" style={{ fontSize: '18px', fontWeight: 600 }}>
          {t('section_presentation')}
        </h4>

        {/* Présentation générale */}
        <div className="mb-6">
          <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
            {t('presentation_label')}
          </label>
          <textarea
            value={formData.presentation}
            onChange={(e) => handleInputChange('presentation', e.target.value)}
            disabled={!canEdit}
            className={`w-full h-32 px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none ${!canEdit ? 'opacity-60 cursor-not-allowed bg-neutral-50' : ''}`}
            style={{ fontSize: '16px', fontWeight: 400 }}
            placeholder={t('presentation_placeholder')}
            maxLength={1000}
          />
          <div className="flex items-center justify-end mt-2">
            <span className="text-neutral-500" style={{ fontSize: '12px', fontWeight: 400 }}>
              {formData.presentation.length}/1000
            </span>
          </div>
        </div>

      </div>

      {/* SECTION 4: Informations du Représentant légal */}
      <div className="mb-10">
        <h4 className="text-neutral-900 mb-6" style={{ fontSize: '18px', fontWeight: 600 }}>
          {t('section_leader')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
              {t('leader_name')}
            </label>
            <input
              type="text"
              value={formData.nom_dirigeant}
              onChange={(e) => handleInputChange('nom_dirigeant', e.target.value)}
              disabled={!canEdit}
              className={`w-full h-12 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${!canEdit ? 'opacity-60 cursor-not-allowed bg-neutral-50' : ''}`}
              style={{ fontSize: '16px', fontWeight: 400 }}
              placeholder="Prénom et nom"
            />
          </div>

          <div>
            <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
              {t('leader_role')}
            </label>
            <input
              type="text"
              value={formData.poste_dirigeant}
              onChange={(e) => handleInputChange('poste_dirigeant', e.target.value)}
              disabled={!canEdit}
              className={`w-full h-12 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${!canEdit ? 'opacity-60 cursor-not-allowed bg-neutral-50' : ''}`}
              style={{ fontSize: '16px', fontWeight: 400 }}
              placeholder={t('leader_role_placeholder')}
            />
          </div>
        </div>

        {/* Mot du Représentant légal */}
        <div className="mb-6">
          <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
            {t('leader_word')}
          </label>
          <textarea
            value={formData.mot_dirigeant}
            onChange={(e) => handleInputChange('mot_dirigeant', e.target.value)}
            disabled={!canEdit}
            className={`w-full h-32 px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none ${!canEdit ? 'opacity-60 cursor-not-allowed bg-neutral-50' : ''}`}
            style={{ fontSize: '16px', fontWeight: 400 }}
            placeholder={t('leader_word_placeholder')}
            maxLength={1000}
          />
          <div className="flex items-center justify-end mt-2">
            <span className="text-neutral-500" style={{ fontSize: '12px', fontWeight: 400 }}>
              {formData.mot_dirigeant.length}/1000
            </span>
          </div>
        </div>

        {/* Photo du Représentant légal */}
        <ImageUploadWidget
          label={t('leader_photo')}
          currentUrl={getCurrentDirigeantUrl()}
          bucket="annonceur-dirigeants"
          pathPrefix="photo_dirigeant"
          userId={userProfile.id}
          supabase={supabase}
          maxSizeMB={2}
          onUploadComplete={(url) =>
            handleImageUploadComplete(url, 'photo_dirigeant_url', setTempDirigeantUrl, 'Photo du Représentant légal mise à jour !')
          }
          disabled={!canEdit}
          previewStyle={{ width: '140px', height: '140px' }}
          placeholderIcon="user"
          inputId="dirigeant-upload"
        />
      </div>

      {/* SECTION 6: Contact légal */}
      <div className="mb-10">
        <h4 className="text-neutral-900 mb-6" style={{ fontSize: '18px', fontWeight: 600 }}>
          {t('section_legal')}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
              {t('legal_name')}
            </label>
            <input
              type="text"
              value={formData.contact_legal_nom}
              onChange={(e) => handleInputChange('contact_legal_nom', e.target.value)}
              disabled={!canEdit}
              className={`w-full h-12 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${!canEdit ? 'opacity-60 cursor-not-allowed bg-neutral-50' : ''}`}
              style={{ fontSize: '16px', fontWeight: 400 }}
            />
          </div>

          <div>
            <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
              {t('legal_firstname')}
            </label>
            <input
              type="text"
              value={formData.contact_legal_prenom}
              onChange={(e) => handleInputChange('contact_legal_prenom', e.target.value)}
              disabled={!canEdit}
              className={`w-full h-12 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${!canEdit ? 'opacity-60 cursor-not-allowed bg-neutral-50' : ''}`}
              style={{ fontSize: '16px', fontWeight: 400 }}
            />
          </div>

          <div>
            <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
              {t('legal_role')}
            </label>
            <input
              type="text"
              value={formData.contact_legal_fonction}
              onChange={(e) => handleInputChange('contact_legal_fonction', e.target.value)}
              disabled={!canEdit}
              className={`w-full h-12 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${!canEdit ? 'opacity-60 cursor-not-allowed bg-neutral-50' : ''}`}
              style={{ fontSize: '16px', fontWeight: 400 }}
            />
          </div>

          <div>
            <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
              {t('email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-4 inset-y-0 my-auto w-5 h-5 text-neutral-400" strokeWidth={2} />
              <input
                type="email"
                value={formData.contact_legal_email}
                onChange={(e) => handleInputChange('contact_legal_email', e.target.value)}
                disabled={!canEdit}
                className={`w-full h-12 pl-12 pr-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${!canEdit ? 'opacity-60 cursor-not-allowed bg-neutral-50' : ''}`}
                style={{ fontSize: '16px', fontWeight: 400 }}
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
              WhatsApp
            </label>
            <div className="relative">
              <MessageCircle className="absolute left-4 inset-y-0 my-auto w-5 h-5 text-neutral-400" strokeWidth={2} />
              <input
                type="tel"
                value={formData.contact_legal_whatsapp}
                onChange={(e) => handleInputChange('contact_legal_whatsapp', e.target.value)}
                disabled={!canEdit}
                className={`w-full h-12 pl-12 pr-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${!canEdit ? 'opacity-60 cursor-not-allowed bg-neutral-50' : ''}`}
                style={{ fontSize: '16px', fontWeight: 400 }}
                placeholder="+237 6XX XX XX XX"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 7: Points focaux diaspora */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-neutral-900" style={{ fontSize: '18px', fontWeight: 600 }}>
            {t('section_focal')}
          </h4>
          {canEdit && (
            <button
              onClick={handleAddFocalPoint}
              className="h-10 px-5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              style={{ fontSize: '14px', fontWeight: 600 }}
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              {t('add_focal')}
            </button>
          )}
        </div>

        <div className="space-y-6">
          {pointsFocaux.map((focal, index) => (
            <div key={index} className="bg-neutral-50 border border-neutral-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-neutral-900" style={{ fontSize: '16px', fontWeight: 600 }}>
                  {t('focal_point_number', { count: index + 1 })}
                </h5>
                {canEdit && (
                  <button
                    onClick={() => handleRemoveFocalPoint(index)}
                    className="text-accent hover:text-accent/80 transition-colors"
                    aria-label="Supprimer le point focal"
                  >
                    <Trash2 className="w-5 h-5" strokeWidth={2} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-700 mb-2" style={{ fontSize: '13px', fontWeight: 500 }}>
                    {t('legal_name')}
                  </label>
                  <input
                    type="text"
                    value={focal.nom}
                    onChange={(e) => handleFocalPointChange(index, 'nom', e.target.value)}
                    disabled={!canEdit}
                    className={`w-full h-11 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white ${!canEdit ? 'opacity-60 cursor-not-allowed bg-neutral-50' : ''}`}
                    style={{ fontSize: '15px', fontWeight: 400 }}
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 mb-2" style={{ fontSize: '13px', fontWeight: 500 }}>
                    {t('legal_firstname')}
                  </label>
                  <input
                    type="text"
                    value={focal.prenom}
                    onChange={(e) => handleFocalPointChange(index, 'prenom', e.target.value)}
                    disabled={!canEdit}
                    className={`w-full h-11 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white ${!canEdit ? 'opacity-60 cursor-not-allowed bg-neutral-50' : ''}`}
                    style={{ fontSize: '15px', fontWeight: 400 }}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-neutral-700 mb-2" style={{ fontSize: '13px', fontWeight: 500 }}>
                    {t('legal_role')}
                  </label>
                  <input
                    type="text"
                    value={focal.fonction}
                    onChange={(e) => handleFocalPointChange(index, 'fonction', e.target.value)}
                    disabled={!canEdit}
                    className={`w-full h-11 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white ${!canEdit ? 'opacity-60 cursor-not-allowed bg-neutral-50' : ''}`}
                    style={{ fontSize: '15px', fontWeight: 400 }}
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 mb-2" style={{ fontSize: '13px', fontWeight: 500 }}>
                    {t('focal_email')}
                  </label>
                  <input
                    type="email"
                    value={focal.email}
                    onChange={(e) => handleFocalPointChange(index, 'email', e.target.value)}
                    disabled={!canEdit}
                    className={`w-full h-11 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white ${!canEdit ? 'opacity-60 cursor-not-allowed bg-neutral-50' : ''}`}
                    style={{ fontSize: '15px', fontWeight: 400 }}
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 mb-2" style={{ fontSize: '13px', fontWeight: 500 }}>
                    WhatsApp *
                  </label>
                  <input
                    type="tel"
                    value={focal.whatsapp}
                    onChange={(e) => handleFocalPointChange(index, 'whatsapp', e.target.value)}
                    disabled={!canEdit}
                    className={`w-full h-11 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white ${!canEdit ? 'opacity-60 cursor-not-allowed bg-neutral-50' : ''}`}
                    style={{ fontSize: '15px', fontWeight: 400 }}
                    placeholder="+237 6XX XX XX XX"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 8: Emails destinataires */}
      <div className="mb-10">
        <h4 className="text-neutral-900 mb-2" style={{ fontSize: '18px', fontWeight: 600 }}>
          {t('section_emails')}
        </h4>
        <p className="text-neutral-600 mb-4" style={{ fontSize: '13px', fontWeight: 400 }}>
          {t('emails_helper')}
        </p>
        <div className="relative">
          <Mail className="absolute left-4 top-4 w-5 h-5 text-neutral-400" strokeWidth={2} />
          <textarea
            value={formData.emails_destinataires}
            onChange={(e) => handleInputChange('emails_destinataires', e.target.value)}
            disabled={!canEdit}
            className={`w-full h-24 pl-12 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none ${!canEdit ? 'opacity-60 cursor-not-allowed bg-neutral-50' : ''}`}
            style={{ fontSize: '16px', fontWeight: 400 }}
            placeholder={t('emails_placeholder')}
          />
        </div>
      </div>

      {/* SECTION 9: Domaines d'action */}
      <div className="mb-10">
        <h4 className="text-neutral-900 mb-2" style={{ fontSize: '18px', fontWeight: 600 }}>
          {t('section_domains')}
        </h4>
        <p className="text-neutral-600 mb-4" style={{ fontSize: '13px', fontWeight: 400 }}>
          {t('domains_desc')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DOMAINES_ACTION.map((domaine) => (
            <label key={domaine} className={`flex items-center gap-3 p-3 border border-neutral-200 rounded-lg transition-colors ${canEdit ? 'hover:bg-neutral-50 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}>
              <input
                type="checkbox"
                checked={domainesAction.includes(domaine)}
                onChange={() => toggleCheckbox(domainesAction, setDomainesAction, domaine)}
                disabled={!canEdit}
                className="w-5 h-5 rounded border-2 border-neutral-300 text-primary focus:ring-primary"
              />
              <span className="text-neutral-900" style={{ fontSize: '14px', fontWeight: 400 }}>
                {domaine}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* SECTION 10: Contributions recherchées */}
      <div className="mb-10">
        <h4 className="text-neutral-900 mb-2" style={{ fontSize: '18px', fontWeight: 600 }}>
          {t('section_contributions')}
        </h4>
        <p className="text-neutral-600 mb-4" style={{ fontSize: '13px', fontWeight: 400 }}>
          {t('contributions_desc')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CONTRIBUTIONS.map((contribution) => (
            <label key={contribution} className={`flex items-center gap-3 p-3 border border-neutral-200 rounded-lg transition-colors ${canEdit ? 'hover:bg-neutral-50 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}>
              <input
                type="checkbox"
                checked={contributions.includes(contribution)}
                onChange={() => toggleCheckbox(contributions, setContributions, contribution)}
                disabled={!canEdit}
                className="w-5 h-5 rounded border-2 border-neutral-300 text-primary focus:ring-primary"
              />
              <span className="text-neutral-900" style={{ fontSize: '14px', fontWeight: 400 }}>
                {contribution}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* SECTION 11: Nombre de programmes */}
      <div className="mb-10">
        <h4 className="text-neutral-900 mb-4" style={{ fontSize: '18px', fontWeight: 600 }}>
          {t('section_program_count')}
        </h4>

        <select
          value={formData.nombre_programmes_annuels}
          onChange={(e) => handleInputChange('nombre_programmes_annuels', e.target.value)}
          disabled={!canEdit}
          className={`w-full h-12 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
          style={{ fontSize: '16px', fontWeight: 400 }}
        >
          <option value="">Sélectionnez...</option>
          {NOMBRE_PROGRAMMES.map((nombre) => (
            <option key={nombre} value={nombre}>{nombre}</option>
          ))}
        </select>
      </div>

      {/* SECTION 12: Facilités offertes */}
      <div className="mb-10">
        <h4 className="text-neutral-900 mb-2" style={{ fontSize: '18px', fontWeight: 600 }}>
          {t('section_facilities')}
        </h4>
        <p className="text-neutral-600 mb-4" style={{ fontSize: '13px', fontWeight: 400 }}>
          {t('facilities_desc')}
        </p>

        <div className="grid grid-cols-1 gap-3 mb-4">
          {FACILITES.map((facilite) => (
            <label key={facilite} className={`flex items-center gap-3 p-3 border border-neutral-200 rounded-lg transition-colors ${canEdit ? 'hover:bg-neutral-50 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}>
              <input
                type="checkbox"
                checked={facilites.includes(facilite)}
                onChange={() => toggleCheckbox(facilites, setFacilites, facilite)}
                disabled={!canEdit}
                className="w-5 h-5 rounded border-2 border-neutral-300 text-primary focus:ring-primary"
              />
              <span className="text-neutral-900" style={{ fontSize: '14px', fontWeight: 400 }}>
                {facilite}
              </span>
            </label>
          ))}
        </div>

        {facilites.includes('Autres (précisez)') && (
          <div>
            <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
              {t('facilities_other')}
            </label>
            <textarea
              value={formData.facilites_autres}
              onChange={(e) => handleInputChange('facilites_autres', e.target.value)}
              disabled={!canEdit}
              className={`w-full h-24 px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none ${!canEdit ? 'opacity-60 cursor-not-allowed bg-neutral-50' : ''}`}
              style={{ fontSize: '16px', fontWeight: 400 }}
              placeholder="Décrivez les autres facilités offertes..."
            />
          </div>
        )}
      </div>

      {/* SECTION 13: Pièces jointes */}
      <div className="mb-10">
        <h4 className="text-neutral-900 mb-2" style={{ fontSize: '18px', fontWeight: 600 }}>
          {t('section_attachments')}
        </h4>
        <p className="text-neutral-600 mb-4" style={{ fontSize: '13px', fontWeight: 400 }}>
          {t('attachments_desc')}
        </p>

        {canEdit && (
          <div className="mb-4">
            <input
              type="file"
              id="document-upload"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              multiple
              onChange={handleDocumentUpload}
              className="hidden"
              disabled={uploadingDocument}
            />
            <label
              htmlFor="document-upload"
              className={`h-12 px-6 bg-white border-2 border-dashed border-neutral-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                uploadingDocument ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <Upload className="w-5 h-5 text-neutral-600" strokeWidth={2} />
              <span className="text-neutral-900" style={{ fontSize: '14px', fontWeight: 500 }}>
                {uploadingDocument ? t('attachments_uploading') : t('attachments_upload')}
              </span>
            </label>
          </div>
        )}

        {piecesJointes.length > 0 && (
          <div className="space-y-2">
            {piecesJointes.map((piece, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-neutral-600" strokeWidth={2} />
                  <div>
                    <p className="text-neutral-900" style={{ fontSize: '14px', fontWeight: 500 }}>
                      {piece.name}
                    </p>
                    <p className="text-neutral-500" style={{ fontSize: '12px', fontWeight: 400 }}>
                      {piece.type}
                    </p>
                  </div>
                </div>
                {canEdit && (
                  <button
                    onClick={() => handleRemoveDocument(index)}
                    className="text-accent hover:text-accent/80 transition-colors"
                    aria-label="Supprimer le document"
                  >
                    <Trash2 className="w-5 h-5" strokeWidth={2} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Footer */}
      {canEdit && (
        <div className="flex items-center justify-between pt-6 mt-8 border-t border-neutral-200 bg-neutral-50 -mx-12 -mb-12 px-12 py-5 rounded-b-xl">
          <span className="text-neutral-600" style={{ fontSize: '13px', fontWeight: 400 }}>
            {annonceurProfile?.updated_at
              ? t('last_modified', {
                  date: new Date(annonceurProfile.updated_at).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                })
              : t('new_profile')}
          </span>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <button
                onClick={handleReset}
                className="h-11 px-6 bg-white border border-neutral-300 rounded-lg text-neutral-900 hover:bg-neutral-50 transition-colors"
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                {t('reset_button')}
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className={`h-11 px-7 rounded-lg text-white transition-colors flex items-center gap-2 ${
                saving ? 'bg-neutral-300 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'
              }`}
              style={{ fontSize: '14px', fontWeight: 600 }}
            >
              <Save className="w-5 h-5" strokeWidth={2} />
              {saving ? t('saving_button') : t('save_button')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
