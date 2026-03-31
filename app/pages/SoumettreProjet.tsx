'use client';

import React, { useState } from 'react';
import { ChevronLeft, Upload, X, FileText, Lightbulb, Send, Loader2 } from 'lucide-react';
import { Bouton } from '../components/ds/Bouton';
import { FilDAriane } from '../components/listing/FilDAriane';
import { ChampTexte } from '../components/ds/ChampTexte';
import { useRouter } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { notificationService } from '@/lib/notificationService';
import { sendRecapEmail } from '@/lib/sendRecapEmail';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

interface FormData {
  // Section 1: Détails du projet
  domainesAction: string[];
  autreDomaineAction: string;
  toutesLesVilles: boolean;
  villesSelectionnees: string[];
  naturesProjet: string[];
  autreNatureProjet: string;
  
  // Section 2: Coordonnées
  nom: string;
  prenom: string;
  pays: string;
  whatsapp: string;
  email: string;
  linkedin: string;
  message: string;
  
  // Section 3: Documents
  documentsJoints: File[];
  
  // Authorization
  autoriserPublication: boolean | null;
}

// Official 14 "Champs d'intervention" from Brief 27
const DOMAINES_ACTION_FR = [
  'Investissement',
  'Santé',
  'Lutte contre la pauvreté',
  'Soutien à la société civile (femmes, jeunes…)',
  'Infrastructures et urbanisme',
  'Environnement et propreté',
  'Education et enfance',
  'Innovation',
  'Recrutement et formation professionnelle',
  'Tourisme',
  'Culture et patrimoine',
  'Rayonnement international',
  'Droits et citoyenneté',
  'Autres (préciser)',
];

const DOMAINES_ACTION_EN = [
  'Investment',
  'Health',
  'Poverty reduction',
  'Civil society support (women, youth...)',
  'Infrastructure and urban planning',
  'Environment and cleanliness',
  'Education and childhood',
  'Innovation',
  'Recruitment and vocational training',
  'Tourism',
  'Culture and heritage',
  'International influence',
  'Rights and citizenship',
  'Others (specify)',
];

// List of Cameroonian cities
const VILLES_CAMEROUN = [
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
];

// Nature de projet options
const NATURES_PROJET_FR = [
  'Création d\'entreprise',
  'Achat dans l\'immobilier',
  'Proposition de services (compétences, réseaux…)',
  'Action citoyenne',
  'Autres (à préciser)',
];

const NATURES_PROJET_EN = [
  'Business creation',
  'Real estate purchase',
  'Service proposal (skills, networks...)',
  'Citizen action',
  'Others (to be specified)',
];

// List of countries
const PAYS = [
  'Afghanistan', 'Afrique du Sud', 'Albanie', 'Algérie', 'Allemagne', 'Angola',
  'Arabie Saoudite', 'Argentine', 'Australie', 'Autriche', 'Belgique', 'Brésil',
  'Burkina Faso', 'Burundi', 'Cameroun', 'Canada', 'Centrafrique', 'Chine',
  'Congo (Brazzaville)', 'Congo (Kinshasa)', 'Côte d\'Ivoire', 'Danemark',
  'Égypte', 'Émirats Arabes Unis', 'Espagne', 'États-Unis', 'Éthiopie', 'Finlande',
  'France', 'Gabon', 'Ghana', 'Grèce', 'Guinée', 'Inde', 'Italie', 'Japon',
  'Kenya', 'Libéria', 'Mali', 'Maroc', 'Mexique', 'Nigeria', 'Norvège',
  'Nouvelle-Zélande', 'Pays-Bas', 'Pologne', 'Portugal', 'Royaume-Uni',
  'Russie', 'Sénégal', 'Suède', 'Suisse', 'Tchad', 'Togo', 'Tunisie', 'Turquie',
];

export default function SoumettreProjet() {
  const tCommon = useTranslations('Common');
  const tNav = useTranslations('Navigation');
  const params = useParams();
  const currentLocale = params.locale as string || 'fr';
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const DOMAINES_ACTION = currentLocale === 'en' ? DOMAINES_ACTION_EN : DOMAINES_ACTION_FR;
  const NATURES_PROJET = currentLocale === 'en' ? NATURES_PROJET_EN : NATURES_PROJET_FR;

  const supabase = getSupabaseBrowserClient();

  const [formData, setFormData] = useState<FormData>({
    domainesAction: [],
    autreDomaineAction: '',
    toutesLesVilles: false,
    villesSelectionnees: [],
    naturesProjet: [],
    autreNatureProjet: '',
    nom: '',
    prenom: '',
    pays: '',
    whatsapp: '',
    email: '',
    linkedin: '',
    message: '',
    documentsJoints: [],
    autoriserPublication: null,
  });

  const handleDomaineToggle = (domaine: string) => {
    setFormData(prev => ({
      ...prev,
      domainesAction: prev.domainesAction.includes(domaine)
        ? prev.domainesAction.filter(d => d !== domaine)
        : [...prev.domainesAction, domaine],
    }));
  };

  const handleVilleToggle = (ville: string) => {
    setFormData(prev => ({
      ...prev,
      villesSelectionnees: prev.villesSelectionnees.includes(ville)
        ? prev.villesSelectionnees.filter(v => v !== ville)
        : [...prev.villesSelectionnees, ville],
    }));
  };

  const handleNatureToggle = (nature: string) => {
    setFormData(prev => ({
      ...prev,
      naturesProjet: prev.naturesProjet.includes(nature)
        ? prev.naturesProjet.filter(n => n !== nature)
        : [...prev.naturesProjet, nature],
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      // Max 10MB total
      const totalSize = [...formData.documentsJoints, ...newFiles].reduce((sum, file) => sum + file.size, 0);
      if (totalSize > 10 * 1024 * 1024) {
        toast.warning(currentLocale === 'en' ? 'Total file size must not exceed 10 MB' : 'La taille totale des fichiers ne doit pas dépasser 10 Mo');
        return;
      }
      setFormData(prev => ({
        ...prev,
        documentsJoints: [...prev.documentsJoints, ...newFiles],
      }));
    }
  };

  const handleRemoveFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documentsJoints: prev.documentsJoints.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    // Required fields
    if (formData.domainesAction.length === 0) return false;
    const othersActionLabel = currentLocale === 'en' ? 'Others (specify)' : 'Autres (préciser)';
    if (formData.domainesAction.includes(othersActionLabel) && !formData.autreDomaineAction.trim()) return false;
    if (!formData.toutesLesVilles && formData.villesSelectionnees.length === 0) return false;
    if (formData.naturesProjet.length === 0) return false;
    const othersNatureLabel = currentLocale === 'en' ? 'Others (to be specified)' : 'Autres (à préciser)';
    if (formData.naturesProjet.includes(othersNatureLabel) && !formData.autreNatureProjet.trim()) return false;
    if (!formData.email.trim()) return false;
    if (formData.autoriserPublication === null) return false;
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.warning(currentLocale === 'en' ? 'Please fill all required fields (*)' : 'Veuillez remplir tous les champs obligatoires (*)');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload files to Supabase Storage
      const uploadedFileUrls: string[] = [];
      const uploadedFileNames: string[] = [];
      const uploadedFileSizes: number[] = [];

      for (const file of formData.documentsJoints) {
        const body = new FormData();
        body.append('file', file);
        body.append('bucket', 'fichiers-projets');
        body.append('folder', 'projets');

        const res = await fetch('/api/upload', { method: 'POST', body });
        const result = await res.json();

        if (!res.ok || !result.success) {
          console.error('Erreur upload:', result.error);
          toast.error('Erreur lors de l\'upload des fichiers. Veuillez réessayer.');
          setIsSubmitting(false);
          return;
        }

        uploadedFileUrls.push(result.url);
        uploadedFileNames.push(result.fileName);
        uploadedFileSizes.push(result.size);
      }

      // Prepare data for insertion
      const dataToInsert = {
        nom: formData.nom,
        prenom: formData.prenom,
        pays: formData.pays,
        email: formData.email,
        whatsapp: formData.whatsapp || null,
        profil_linkedin: formData.linkedin || null,
        domaines_action: formData.domainesAction,
        autres_domaine: formData.autreDomaineAction || null,
        niveau_ciblage: formData.toutesLesVilles ? 'toutes' : 'plusieurs-villes',
        ville_specifique: null,
        villes_multiples: formData.toutesLesVilles ? null : formData.villesSelectionnees,
        nature_projet: formData.naturesProjet,
        autres_nature: formData.autreNatureProjet || null,
        message: formData.message || null,
        fichiers_joints_urls: uploadedFileUrls.length > 0 ? uploadedFileUrls : null,
        fichiers_joints_noms: uploadedFileNames.length > 0 ? uploadedFileNames : null,
        fichiers_joints_tailles: uploadedFileSizes.length > 0 ? uploadedFileSizes : null,
        autorisation_publication: formData.autoriserPublication === true ? 'oui' : formData.autoriserPublication === false ? 'non' : null,
      };

      // Insert into Supabase
      const { error } = await supabase
        .from('projets_soumis')
        .insert(dataToInsert);

      if (error) {
        console.error('Erreur insertion Supabase:', error);
        toast.error('Une erreur est survenue lors de l\'envoi. Veuillez réessayer.');
        setIsSubmitting(false);
        return;
      }

      // 5. Fetch annonceur data for targeted villes
      let annonceurEmails = '';
      let annonceurIds: string[] = [];
      try {
        const targetVilles = formData.toutesLesVilles
          ? []
          : (formData.villesSelectionnees || []);

        if (targetVilles.length > 0) {
          const { data: annonceurs } = await supabase
            .from('annonceur_profiles')
            .select('id, contact_legal_email, emails_destinataires, points_focaux_diaspora')
            .in('ville', targetVilles);

          if (annonceurs && annonceurs.length > 0) {
            annonceurIds = annonceurs.map((a: any) => a.id).filter(Boolean);
            const emails: string[] = [];
            annonceurs.forEach((a: any) => {
              if (a.contact_legal_email) emails.push(a.contact_legal_email);
              if (a.emails_destinataires) emails.push(a.emails_destinataires);
              if (a.points_focaux_diaspora) {
                try {
                  const fps = typeof a.points_focaux_diaspora === 'string'
                    ? JSON.parse(a.points_focaux_diaspora)
                    : a.points_focaux_diaspora;
                  if (Array.isArray(fps)) {
                    fps.forEach((fp: any) => { if (fp.email?.trim()) emails.push(fp.email.trim()); });
                  }
                } catch (e) { /* ignore parse errors */ }
              }
            });
            annonceurEmails = emails.filter(Boolean).join(',');
          }
        }
      } catch (err) {
        console.error('Failed to fetch annonceur emails (non-blocking):', err);
      }

      // 6. Send Platform Notification to Admins (filtered by annonceur)
      try {
        await notificationService.notifyAdmins({
          type: 'project_submitted',
          title: 'Nouveau Projet Soumis',
          message: `${formData.prenom} ${formData.nom} a soumis un nouveau projet.`,
          data: {
            candidat_name: `${formData.prenom} ${formData.nom}`,
            candidat_email: formData.email,
          },
          annonceur_ids: annonceurIds,
        });
      } catch (notifErr) {
        console.error('Platform notification failed (non-blocking):', notifErr);
      }

      // 7. Send Recap Email to Submitter, Admin & Annonceurs
      try {
        await sendRecapEmail({
          to: formData.email,
          type: 'projet',
          recipientName: `${formData.prenom} ${formData.nom}`,
          details: [
            { label: 'Nom', value: `${formData.prenom} ${formData.nom}` },
            { label: 'Email', value: formData.email },
            { label: 'Domaines', value: formData.domainesAction.join(', ') },
            { label: 'Pays', value: formData.pays },
            { label: 'Date', value: new Date().toLocaleDateString('fr-FR') },
          ],
          annonceurEmails: annonceurEmails || undefined,
        });
      } catch (recapErr) {
        console.error('Recap email failed (non-blocking):', recapErr);
      }

      // Success - redirect to success page
      router.push(
        `/succes-soumission?type=projet&userName=${encodeURIComponent(formData.prenom + ' ' + formData.nom)}&userEmail=${encodeURIComponent(formData.email)}`
      );
    } catch (err) {
      console.error('Erreur inattendue:', err);
      toast.error('Une erreur est survenue. Veuillez réessayer.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-page-bg">
      {/* Breadcrumb Navigation */}
      <div className="w-full border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20 py-4">
          <FilDAriane
            items={[
              { label: currentLocale === 'en' ? 'Home' : 'Accueil', href: '/' },
              { label: tNav('submit_project') },
            ]}
          />
        </div>
      </div>

      {/* Page Header - Green background */}
      <div className="w-full bg-gradient-to-br from-primary via-primary to-bg-base border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20 py-12">
          <Link
            href="/"
            className="flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-6"
            style={{ fontSize: '14px', fontWeight: 500 }}
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2} />
            {currentLocale === 'en' ? 'Back to home' : "Retour à l'accueil"}
          </Link>

          {/* Icon & Title */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-white mb-2" style={{ fontSize: '32px', lineHeight: '1.2', fontWeight: 600 }}>
                {currentLocale === 'en' ? 'Describe your project for Cameroon here!' : 'Décrivez-nous ici votre projet pour le Cameroun !'}
              </h2>
              <p className="text-white/90" style={{ fontSize: '18px', lineHeight: '1.6', fontWeight: 400 }}>
                {currentLocale === 'en' 
                  ? 'The diaspora focal point of the targeted city(ies) will be directly informed and will be able to act…' 
                  : 'Le point focal diaspora de la ou les villes ciblées sera directement informé et pourra agir…'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="w-full py-12">
        <div className="max-w-4xl mx-auto px-5 md:px-10">
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8 md:p-10">
              
              {/* SECTION 1: DOMAINE D'ACTION */}
              <div className="mb-12">
                <label className="block text-neutral-700 mb-4" style={{ fontSize: '16px', fontWeight: 600 }}>
                  {currentLocale === 'en' ? 'Field of action' : "Domaine d'action"} <span className="text-accent-red">*</span>
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 border border-neutral-300 rounded-lg">
                  {DOMAINES_ACTION.map((domaine) => (
                    <label key={domaine} className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.domainesAction.includes(domaine)}
                        onChange={() => handleDomaineToggle(domaine)}
                        className="mt-1 w-4 h-4 text-primary rounded"
                      />
                      <span className="text-neutral-700 group-hover:text-neutral-900" style={{ fontSize: '14px', fontWeight: 400 }}>
                        {domaine}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Conditional: Autres domaine input */}
                {formData.domainesAction.includes(currentLocale === 'en' ? 'Others (specify)' : 'Autres (préciser)') && (
                  <div className="mt-4">
                    <ChampTexte
                      label={currentLocale === 'en' ? 'Specify the field of action' : "Précisez le domaine d'action"}
                      required
                      value={formData.autreDomaineAction}
                      onChange={(e) => setFormData(prev => ({ ...prev, autreDomaineAction: e.target.value }))}
                      placeholder={currentLocale === 'en' ? "Describe the field of action" : "Précisez votre domaine d'action"}
                    />
                  </div>
                )}
              </div>

              {/* SECTION 2: VILLE(S) CIBLÉE(S) */}
              <div className="mb-12">
                <label className="block text-neutral-700 mb-4" style={{ fontSize: '16px', fontWeight: 600 }}>
                  {currentLocale === 'en' ? 'Target city(ies)' : "Ville(s) ciblée(s)"} <span className="text-accent-red">*</span>
                </label>
                
                {/* Toutes les villes checkbox */}
                <div className="mb-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.toutesLesVilles}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          toutesLesVilles: e.target.checked,
                          villesSelectionnees: e.target.checked ? [] : prev.villesSelectionnees,
                        }));
                      }}
                      className="mt-1 w-4 h-4 text-primary rounded"
                    />
                    <span className="text-neutral-900" style={{ fontSize: '15px', fontWeight: 600 }}>
                      {currentLocale === 'en' ? 'Option: "All cities"' : 'Option : "Toutes les villes"'}
                    </span>
                  </label>
                </div>

                {/* Individual city checkboxes */}
                {!formData.toutesLesVilles && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border border-neutral-300 rounded-lg">
                    {VILLES_CAMEROUN.map((ville) => (
                      <label key={ville} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={formData.villesSelectionnees.includes(ville)}
                          onChange={() => handleVilleToggle(ville)}
                          className="w-4 h-4 text-primary rounded"
                        />
                        <span className="text-neutral-700 group-hover:text-neutral-900" style={{ fontSize: '14px', fontWeight: 400 }}>
                          {ville}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 3: NATURE DE VOTRE PROJET */}
              <div className="mb-12">
                <label className="block text-neutral-700 mb-4" style={{ fontSize: '16px', fontWeight: 600 }}>
                  {currentLocale === 'en' ? 'Nature of your project' : "Nature de votre projet"} <span className="text-accent-red">*</span>
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 border border-neutral-300 rounded-lg">
                  {NATURES_PROJET.map((nature) => (
                    <label key={nature} className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.naturesProjet.includes(nature)}
                        onChange={() => handleNatureToggle(nature)}
                        className="mt-1 w-4 h-4 text-primary rounded"
                      />
                      <span className="text-neutral-700 group-hover:text-neutral-900" style={{ fontSize: '14px', fontWeight: 400 }}>
                        {nature}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Conditional: Autres nature input */}
                {formData.naturesProjet.includes(currentLocale === 'en' ? 'Others (to be specified)' : 'Autres (à préciser)') && (
                  <div className="mt-4">
                    <ChampTexte
                      label={currentLocale === 'en' ? 'Specify the nature of the project' : "Précisez la nature du projet"}
                      required
                      value={formData.autreNatureProjet}
                      onChange={(e) => setFormData(prev => ({ ...prev, autreNatureProjet: e.target.value }))}
                      placeholder={currentLocale === 'en' ? "Describe the nature of your project" : "Précisez la nature de votre projet"}
                    />
                  </div>
                )}
              </div>

              {/* SECTION 4: CONTACT */}
              <div className="mb-12">
                <h3 className="text-neutral-900 mb-6 pb-3 border-b border-neutral-200" style={{ fontSize: '22px', lineHeight: '1.3', fontWeight: 600 }}>
                  {currentLocale === 'en' ? 'Contact' : 'Contact'}
                </h3>

                <div className="space-y-6">
                  {/* Nom & Prénom */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ChampTexte
                      label={currentLocale === 'en' ? 'Last name (Optional)' : 'Nom (Optionnel)'}
                      value={formData.nom}
                      onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                      placeholder="Ex: Tankou"
                    />
                    <ChampTexte
                      label={currentLocale === 'en' ? 'First name (Optional)' : 'Prénom (Optionnel)'}
                      value={formData.prenom}
                      onChange={(e) => setFormData(prev => ({ ...prev, prenom: e.target.value }))}
                      placeholder="Ex: Marie"
                    />
                  </div>

                  {/* Pays */}
                  <div>
                    <label className="block text-neutral-700 mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>
                      {currentLocale === 'en' ? 'Country (Optional)' : 'Pays (Optionnel)'}
                    </label>
                    <select
                      value={formData.pays}
                      onChange={(e) => setFormData(prev => ({ ...prev, pays: e.target.value }))}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      style={{ fontSize: '15px', fontWeight: 400 }}
                    >
                      <option value="">{currentLocale === 'en' ? 'Select your country' : 'Sélectionnez votre pays'}</option>
                      {PAYS.map((pays) => (
                        <option key={pays} value={pays}>
                          {pays}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* WhatsApp */}
                  <ChampTexte
                    label={currentLocale === 'en' ? 'WhatsApp (Optional)' : 'WhatsApp (Optionnel)'}
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="+33 6 12 34 56 78"
                  />

                  {/* Email */}
                  <ChampTexte
                    label={currentLocale === 'en' ? 'Email' : 'Email'}
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="votre.email@exemple.com"
                  />

                  {/* Profil LinkedIn */}
                  <ChampTexte
                    label={currentLocale === 'en' ? 'LinkedIn Profile (Optional)' : 'Profil LinkedIn (Optionnel)'}
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                    placeholder="https://www.linkedin.com/in/votre-profil"
                  />

                  {/* Message */}
                  <div>
                    <label className="block text-neutral-700 mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>
                      {currentLocale === 'en' ? 'Message' : 'Message'}
                    </label>
                    <p className="text-neutral-600 mb-3" style={{ fontSize: '13px', fontWeight: 400 }}>
                      {currentLocale === 'en' ? 'Tell us all the useful details here...' : 'Précisez-nous ici tous les détails utiles...'}
                    </p>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      rows={8}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                      style={{ fontSize: '15px', fontWeight: 400, lineHeight: '1.7' }}
                      placeholder={currentLocale === 'en' ? 'Describe your project in detail...' : "Décrivez votre projet en détail..."}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: PIÈCES JOINTES */}
              <div className="mb-8">
                <label className="block text-neutral-700 mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>
                  {currentLocale === 'en' ? 'Attachments' : 'Pièces jointes'}
                </label>
                <p className="text-neutral-600 mb-4" style={{ fontSize: '13px', fontWeight: 400 }}>
                  {currentLocale === 'en' ? 'Add all additional documents here...' : 'Ajoutez ici tous les documents complémentaires...'}
                </p>

                {/* File Upload Area */}
                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="w-12 h-12 text-neutral-400 mb-3" strokeWidth={1.5} />
                    <p className="text-neutral-700 mb-1" style={{ fontSize: '15px', fontWeight: 500 }}>
                      {currentLocale === 'en' ? 'Click to add files' : 'Cliquez pour ajouter des fichiers'}
                    </p>
                    <p className="text-neutral-500" style={{ fontSize: '13px', fontWeight: 400 }}>
                      {currentLocale === 'en' ? 'or drag and drop your documents here' : 'ou glissez-déposez vos documents ici'}
                    </p>
                  </label>
                </div>

                {/* Uploaded Files List */}
                {formData.documentsJoints.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.documentsJoints.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-primary" strokeWidth={2} />
                          <div>
                            <p className="text-neutral-900" style={{ fontSize: '14px', fontWeight: 500 }}>
                              {file.name}
                            </p>
                            <p className="text-neutral-500" style={{ fontSize: '12px', fontWeight: 400 }}>
                              {(file.size / 1024).toFixed(1)} Ko
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="p-1 hover:bg-neutral-200 rounded transition-colors"
                          aria-label="Retirer le fichier"
                        >
                          <X className="w-5 h-5 text-neutral-600" strokeWidth={2} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 6: AUTHORIZATION */}
              <div className="mb-8 p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
                <label className="block mb-3 text-neutral-700" style={{ fontSize: '15px', fontWeight: 500 }}>
                  {currentLocale === 'en' 
                    ? 'Authorize us to publish your contribution as a testimonial on the platform?' 
                    : 'Autorisez-nous à publier votre contribution sous forme de témoignage sur la plateforme ?'}
                </label>
                
                <div className="flex gap-6">
                  {/* Option Oui */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="autoriserPublication"
                      checked={formData.autoriserPublication === true}
                      onChange={() => setFormData(prev => ({ ...prev, autoriserPublication: true }))}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-neutral-700" style={{ fontSize: '15px', fontWeight: 400 }}>
                      {currentLocale === 'en' ? 'Yes' : 'Oui'}
                    </span>
                  </label>

                  {/* Option Non */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="autoriserPublication"
                      checked={formData.autoriserPublication === false}
                      onChange={() => setFormData(prev => ({ ...prev, autoriserPublication: false }))}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-neutral-700" style={{ fontSize: '15px', fontWeight: 400 }}>
                      {currentLocale === 'en' ? 'No' : 'Non'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-neutral-200">
                <Bouton
                  variant="primaire"
                  size="grand"
                  type="submit"
                  disabled={!validateForm() || isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" strokeWidth={2} />
                      {currentLocale === 'en' ? 'Submitting...' : 'Envoi en cours...'}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" strokeWidth={2} />
                      {currentLocale === 'en' ? 'Submit' : 'Envoyer'}
                    </>
                  )}
                </Bouton>
                
                {!validateForm() && !isSubmitting && (
                  <p className="text-neutral-500 text-center mt-3" style={{ fontSize: '13px', fontWeight: 400 }}>
                    {currentLocale === 'en' ? '* Required field - Please fill all required fields' : '* Champ obligatoire - Veuillez remplir tous les champs requis'}
                  </p>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}