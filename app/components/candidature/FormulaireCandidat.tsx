'use client';
import React, { useState } from 'react';
import { X, FileText, Upload, AlertCircle, Loader2 } from 'lucide-react';
import { ChampTexte } from '../admin/ChampTexte';
import { ChampTextarea } from '../admin/ChampTextarea';
import { ChampSelect } from '../admin/ChampSelect';
import { ChampCheckbox } from '../admin/ChampCheckbox';
import { ChampFichier } from '../admin/ChampFichier';
import { Bouton } from '../ds/Bouton';
import Image from 'next/image';
import { Link } from '@/i18n/routing';

interface FormulaireProps {
  opportunityTitle: string;
  municipalityName: string;
  municipalityLogo?: string;
  onClose: () => void;
  onSuccess: (data: any) => void;
}

export function FormulaireCandidat({
  opportunityTitle,
  municipalityName,
  municipalityLogo,
  onClose,
  onSuccess,
}: FormulaireProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);

  const [formData, setFormData] = useState({
    // Profile
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    paysResidence: '',
    villeResidence: '',
    profilLinkedIn: '',
    
    // Expertise
    profession: '',
    competences: '',
    secteurProfessionnel: '',
    entreprise: '',
    
    // Lien avec la ville
    lienVille: {
      famille: false,
      etudes: false,
      travail: false,
      tourisme: false,
      aucun: false,
    },
    
    // Contribution
    contributionTypes: {
      investissementFinancier: false,
      creationEntreprise: false,
      formationCoaching: false,
      expertiseTechnique: false,
      mentorat: false,
      consultation: false,
      donsFinanciers: false,
      donsMateriels: false,
      miseEnRelation: false,
      influenceMedias: false,
      autre: false,
    },
    montantInvestissement: '',
    deviseInvestissement: 'EUR',
    dateDebut: '',
    dureeEngagement: '',
    messageMotivation: '',
    documents: [] as File[],
    
    // Autorisation
    autorisationTemoignage: false,
    accepteConditions: false,
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const updateNestedField = (parent: string, field: string, value: any) => {
    setFormData((prev) => {
      const parentValue = prev[parent as keyof typeof prev];
      if (typeof parentValue === 'object' && parentValue !== null && !Array.isArray(parentValue)) {
        return {
          ...prev,
          [parent]: {
            ...(parentValue as object),
            [field]: value,
          },
        };
      }
      return prev;
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.nom.trim()) newErrors.nom = 'Ce champ est obligatoire';
    if (!formData.prenom.trim()) newErrors.prenom = 'Ce champ est obligatoire';
    if (!formData.email.trim()) {
      newErrors.email = 'Ce champ est obligatoire';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Veuillez entrer une adresse email valide';
    }
    if (!formData.paysResidence) newErrors.paysResidence = 'Ce champ est obligatoire';
    if (!formData.profession.trim()) newErrors.profession = 'Ce champ est obligatoire';
    if (!formData.competences.trim()) {
      newErrors.competences = 'Ce champ est obligatoire';
    } else if (formData.competences.length < 50) {
      newErrors.competences = 'Veuillez décrire vos compétences plus en détail (min. 50 caractères)';
    }
    
    // Check if at least one contribution type is selected
    const hasContributionType = Object.values(formData.contributionTypes).some((v) => v);
    if (!hasContributionType) {
      newErrors.contributionTypes = 'Veuillez sélectionner au moins un type de contribution';
    }
    
    if (!formData.dateDebut) newErrors.dateDebut = 'Ce champ est obligatoire';
    if (!formData.dureeEngagement) newErrors.dureeEngagement = 'Ce champ est obligatoire';
    
    if (!formData.messageMotivation.trim()) {
      newErrors.messageMotivation = 'Ce champ est obligatoire';
    } else if (formData.messageMotivation.length < 100) {
      newErrors.messageMotivation = 'Le message doit contenir au moins 100 caractères pour une candidature solide';
    }
    
    if (!formData.accepteConditions) {
      newErrors.accepteConditions = 'Vous devez accepter les conditions d\'utilisation';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasTriedSubmit(true);

    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector('[data-error="true"]');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      onSuccess({
        ...formData,
        opportunityTitle,
        municipalityName,
        submissionDate: new Date().toISOString(),
      });
    }, 1500);
  };

  const handleCancel = () => {
    // Check if form has data
    const hasData = formData.nom || formData.email || formData.messageMotivation;
    if (hasData) {
      if (confirm('Voulez-vous vraiment annuler ? Les informations saisies seront perdues.')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const paysOptions = [
    { value: 'FR', label: 'France' },
    { value: 'US', label: 'États-Unis' },
    { value: 'CA', label: 'Canada' },
    { value: 'BE', label: 'Belgique' },
    { value: 'GB', label: 'Royaume-Uni' },
    { value: 'DE', label: 'Allemagne' },
    { value: 'CH', label: 'Suisse' },
    { value: 'IT', label: 'Italie' },
    { value: 'ES', label: 'Espagne' },
    { value: 'NL', label: 'Pays-Bas' },
    { value: 'OTHER', label: 'Autre' },
  ];

  const secteurOptions = [
    { value: 'sante', label: 'Santé' },
    { value: 'education', label: 'Éducation' },
    { value: 'ingenierie', label: 'Ingénierie' },
    { value: 'finance', label: 'Finance' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'technologies', label: 'Technologies' },
    { value: 'commerce', label: 'Commerce' },
    { value: 'industrie', label: 'Industrie' },
    { value: 'autre', label: 'Autre' },
  ];

  const dureeOptions = [
    { value: '1-semaine', label: '1 semaine' },
    { value: '2-semaines', label: '2 semaines' },
    { value: '1-mois', label: '1 mois' },
    { value: '3-mois', label: '3 mois' },
    { value: '6-mois', label: '6 mois' },
    { value: '1-an', label: '1 an' },
    { value: 'flexible', label: 'Flexible' },
  ];

  return (
    <div className="fixed inset-0 bg-base/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[700px] my-8 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-neutral-200 flex items-start justify-between flex-shrink-0">
          <div className="flex-1">
            <h3 className="text-neutral-900 mb-2" style={{ fontSize: '22px', fontWeight: 600 }}>
              Passer à l&apos;action
            </h3>
            <p className="text-neutral-600 mb-3" style={{ fontSize: '14px', fontWeight: 400 }}>
              {opportunityTitle}
            </p>
            <div className="flex items-center gap-2">
              {municipalityLogo && (
                <Image
                  src={municipalityLogo}
                  alt={municipalityName}
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full object-cover"
                />
              )}
              <span
                className="px-3 py-1 bg-neutral-100 rounded-full text-neutral-700"
                style={{ fontSize: '13px', fontWeight: 500 }}
              >
                {municipalityName}
              </span>
            </div>
          </div>
          
          <button
            onClick={handleCancel}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors flex-shrink-0 ml-4"
          >
            <X className="w-5 h-5 text-neutral-600" strokeWidth={2} />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="overflow-y-auto flex-1 px-6 py-8">
          <form onSubmit={handleSubmit} id="candidature-form">
            {/* Error Summary */}
            {hasTriedSubmit && Object.keys(errors).length > 0 && (
              <div className="mb-6 bg-accent/8 border-l-4 border-accent rounded-r-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <p className="text-accent" style={{ fontSize: '14px', fontWeight: 600 }}>
                    Veuillez corriger les erreurs ci-dessous avant de soumettre
                  </p>
                  <p className="text-accent/80 mt-1" style={{ fontSize: '13px', fontWeight: 400 }}>
                    {Object.keys(errors).length} champ{Object.keys(errors).length > 1 ? 's' : ''} nécessite{Object.keys(errors).length > 1 ? 'nt' : ''} votre attention
                  </p>
                </div>
              </div>
            )}

            {/* Form Introduction */}
            <div className="bg-primary/5 rounded-lg p-4 mb-6">
              <p className="text-neutral-700" style={{ fontSize: '14px', fontWeight: 400, lineHeight: '1.6' }}>
                Complétez ce formulaire pour manifester votre intérêt. La mairie étudiera votre profil
                et vous contactera sous 7-14 jours si votre candidature correspond.
              </p>
            </div>

            {/* Section 1: Action (Pre-filled) */}
            <div className="mb-6">
              <ChampTexte
                label="Action concernée"
                name="opportunite"
                value={`${opportunityTitle} - ${municipalityName}`}
                onChange={() => {}}
                disabled
                helperText="Cette information est automatiquement renseignée"
              />
            </div>

            {/* Section 2: Votre Profil */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2 py-1 bg-primary text-white rounded" style={{ fontSize: '12px', fontWeight: 600 }}>
                  1/3
                </span>
                <h4 className="text-neutral-900" style={{ fontSize: '16px', fontWeight: 600 }}>
                  Votre profil
                </h4>
              </div>

              <div className="space-y-4">
                <div data-error={!!errors.nom}>
                  <ChampTexte
                    label="Nom"
                    name="nom"
                    value={formData.nom}
                    onChange={(value) => updateField('nom', value)}
                    placeholder="Votre nom de famille"
                    required
                    error={errors.nom}
                  />
                </div>

                <div data-error={!!errors.prenom}>
                  <ChampTexte
                    label="Prénom"
                    name="prenom"
                    value={formData.prenom}
                    onChange={(value) => updateField('prenom', value)}
                    placeholder="Votre prénom"
                    required
                    error={errors.prenom}
                  />
                </div>

                <div data-error={!!errors.email}>
                  <ChampTexte
                    label="Adresse électronique"
                    name="email"
                    value={formData.email}
                    onChange={(value) => updateField('email', value)}
                    placeholder="votre.email@exemple.com"
                    required
                    helperText="Vous recevrez une confirmation à cette adresse"
                    error={errors.email}
                  />
                </div>

                <ChampTexte
                  label="Téléphone (optionnel mais recommandé)"
                  name="telephone"
                  value={formData.telephone}
                  onChange={(value) => updateField('telephone', value)}
                  placeholder="+237 6XX XX XX XX"
                />

                <div data-error={!!errors.paysResidence}>
                  <ChampSelect
                    label="Pays de résidence actuel"
                    name="paysResidence"
                    value={formData.paysResidence}
                    onChange={(value) => updateField('paysResidence', value)}
                    options={paysOptions}
                    placeholder="Sélectionnez votre pays"
                    required
                    error={errors.paysResidence}
                  />
                </div>

                <ChampTexte
                  label="Ville de résidence (optionnel)"
                  name="villeResidence"
                  value={formData.villeResidence}
                  onChange={(value) => updateField('villeResidence', value)}
                  placeholder="Ex: Paris"
                />

                <ChampTexte
                  label="Profil LinkedIn ou site web professionnel (optionnel)"
                  name="profilLinkedIn"
                  value={formData.profilLinkedIn}
                  onChange={(value) => updateField('profilLinkedIn', value)}
                  placeholder="https://linkedin.com/in/votre-profil"
                  helperText="Permet à la mairie de mieux connaître votre parcours"
                />
              </div>
            </div>

            {/* Section 3: Votre Expertise */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2 py-1 bg-primary text-white rounded" style={{ fontSize: '12px', fontWeight: 600 }}>
                  2/3
                </span>
                <h4 className="text-neutral-900" style={{ fontSize: '16px', fontWeight: 600 }}>
                  Votre expertise
                </h4>
              </div>

              <div className="space-y-4">
                <div data-error={!!errors.profession}>
                  <ChampTexte
                    label="Profession ou domaine d'expertise"
                    name="profession"
                    value={formData.profession}
                    onChange={(value) => updateField('profession', value)}
                    placeholder="Ex: Médecin généraliste, Ingénieur télécoms, Entrepreneur..."
                    required
                    error={errors.profession}
                  />
                </div>

                <div data-error={!!errors.competences}>
                  <ChampTextarea
                    label="Compétences et qualifications spécifiques"
                    name="competences"
                    value={formData.competences}
                    onChange={(value) => updateField('competences', value)}
                    placeholder="Décrivez vos compétences pertinentes pour cette action : diplômes, certifications, expériences..."
                    required
                    rows={4}
                    maxLength={500}
                    error={errors.competences}
                  />
                </div>

                <ChampSelect
                  label="Secteur professionnel (optionnel)"
                  name="secteurProfessionnel"
                  value={formData.secteurProfessionnel}
                  onChange={(value) => updateField('secteurProfessionnel', value)}
                  options={secteurOptions}
                  placeholder="Sélectionnez un secteur"
                />

                <ChampTexte
                  label="Entreprise ou organisation actuelle (optionnel)"
                  name="entreprise"
                  value={formData.entreprise}
                  onChange={(value) => updateField('entreprise', value)}
                  placeholder="Ex: Hôpital Saint-Louis, Microsoft France..."
                />
              </div>
            </div>

            {/* Section 4: Lien avec la ville (Optional) */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2 py-1 bg-neutral-300 text-neutral-700 rounded" style={{ fontSize: '12px', fontWeight: 600 }}>
                  Optionnel
                </span>
                <h4 className="text-neutral-900" style={{ fontSize: '16px', fontWeight: 600 }}>
                  Votre lien avec la ville
                </h4>
              </div>

              <p className="text-neutral-600 mb-4 italic" style={{ fontSize: '14px', fontWeight: 400 }}>
                Ces informations nous aident à mieux comprendre votre motivation
              </p>

              <div>
                <label className="text-neutral-900 mb-3 block" style={{ fontSize: '14px', fontWeight: 500 }}>
                  Quel est votre lien avec {municipalityName.replace('Ville de ', '')} ?
                </label>
                <div className="space-y-2">
                  <ChampCheckbox
                    label="Famille sur place"
                    name="lienFamille"
                    checked={formData.lienVille.famille}
                    onChange={(checked) => updateNestedField('lienVille', 'famille', checked)}
                  />
                  <ChampCheckbox
                    label="J'y ai étudié"
                    name="lienEtudes"
                    checked={formData.lienVille.etudes}
                    onChange={(checked) => updateNestedField('lienVille', 'etudes', checked)}
                  />
                  <ChampCheckbox
                    label="J'y ai travaillé/fait des affaires"
                    name="lienTravail"
                    checked={formData.lienVille.travail}
                    onChange={(checked) => updateNestedField('lienVille', 'travail', checked)}
                  />
                  <ChampCheckbox
                    label="Tourisme/visites fréquentes"
                    name="lienTourisme"
                    checked={formData.lienVille.tourisme}
                    onChange={(checked) => updateNestedField('lienVille', 'tourisme', checked)}
                  />
                  <ChampCheckbox
                    label="Aucun lien particulier mais motivé pour contribuer"
                    name="lienAucun"
                    checked={formData.lienVille.aucun}
                    onChange={(checked) => updateNestedField('lienVille', 'aucun', checked)}
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Votre Proposition */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2 py-1 bg-primary text-white rounded" style={{ fontSize: '12px', fontWeight: 600 }}>
                  3/3
                </span>
                <h4 className="text-neutral-900" style={{ fontSize: '16px', fontWeight: 600 }}>
                  Votre proposition de contribution
                </h4>
              </div>

              <div className="space-y-4">
                <div data-error={!!errors.contributionTypes}>
                  <label className="text-neutral-900 mb-3 block" style={{ fontSize: '14px', fontWeight: 500 }}>
                    Type de contribution que vous proposez <span className="text-accent">*</span>
                  </label>

                  {/* Investissement */}
                  <div className="mb-3">
                    <p className="text-neutral-700 mb-2 font-semibold" style={{ fontSize: '14px' }}>
                      Investissement
                    </p>
                    <div className="space-y-2 ml-4">
                      <ChampCheckbox
                        label="Investissement financier"
                        name="investissementFinancier"
                        checked={formData.contributionTypes.investissementFinancier}
                        onChange={(checked) =>
                          updateNestedField('contributionTypes', 'investissementFinancier', checked)
                        }
                      />
                      <ChampCheckbox
                        label="Création d'entreprise"
                        name="creationEntreprise"
                        checked={formData.contributionTypes.creationEntreprise}
                        onChange={(checked) =>
                          updateNestedField('contributionTypes', 'creationEntreprise', checked)
                        }
                      />
                    </div>
                  </div>

                  {/* Compétences */}
                  <div className="mb-3">
                    <p className="text-neutral-700 mb-2 font-semibold" style={{ fontSize: '14px' }}>
                      Compétences
                    </p>
                    <div className="space-y-2 ml-4">
                      <ChampCheckbox
                        label="Formation & coaching"
                        name="formationCoaching"
                        checked={formData.contributionTypes.formationCoaching}
                        onChange={(checked) =>
                          updateNestedField('contributionTypes', 'formationCoaching', checked)
                        }
                      />
                      <ChampCheckbox
                        label="Expertise technique"
                        name="expertiseTechnique"
                        checked={formData.contributionTypes.expertiseTechnique}
                        onChange={(checked) =>
                          updateNestedField('contributionTypes', 'expertiseTechnique', checked)
                        }
                      />
                      <ChampCheckbox
                        label="Mentorat"
                        name="mentorat"
                        checked={formData.contributionTypes.mentorat}
                        onChange={(checked) =>
                          updateNestedField('contributionTypes', 'mentorat', checked)
                        }
                      />
                      <ChampCheckbox
                        label="Consultation"
                        name="consultation"
                        checked={formData.contributionTypes.consultation}
                        onChange={(checked) =>
                          updateNestedField('contributionTypes', 'consultation', checked)
                        }
                      />
                    </div>
                  </div>

                  {/* Dons */}
                  <div className="mb-3">
                    <p className="text-neutral-700 mb-2 font-semibold" style={{ fontSize: '14px' }}>
                      Dons
                    </p>
                    <div className="space-y-2 ml-4">
                      <ChampCheckbox
                        label="Dons financiers"
                        name="donsFinanciers"
                        checked={formData.contributionTypes.donsFinanciers}
                        onChange={(checked) =>
                          updateNestedField('contributionTypes', 'donsFinanciers', checked)
                        }
                      />
                      <ChampCheckbox
                        label="Dons matériels"
                        name="donsMateriels"
                        checked={formData.contributionTypes.donsMateriels}
                        onChange={(checked) =>
                          updateNestedField('contributionTypes', 'donsMateriels', checked)
                        }
                      />
                    </div>
                  </div>

                  {/* Réseaux */}
                  <div className="mb-3">
                    <p className="text-neutral-700 mb-2 font-semibold" style={{ fontSize: '14px' }}>
                      Réseaux
                    </p>
                    <div className="space-y-2 ml-4">
                      <ChampCheckbox
                        label="Mise en relation"
                        name="miseEnRelation"
                        checked={formData.contributionTypes.miseEnRelation}
                        onChange={(checked) =>
                          updateNestedField('contributionTypes', 'miseEnRelation', checked)
                        }
                      />
                      <ChampCheckbox
                        label="Influence médias/diaspora"
                        name="influenceMedias"
                        checked={formData.contributionTypes.influenceMedias}
                        onChange={(checked) =>
                          updateNestedField('contributionTypes', 'influenceMedias', checked)
                        }
                      />
                    </div>
                  </div>

                  {/* Autre */}
                  <div>
                    <ChampCheckbox
                      label="Autre (précisez dans le message)"
                      name="autre"
                      checked={formData.contributionTypes.autre}
                      onChange={(checked) =>
                        updateNestedField('contributionTypes', 'autre', checked)
                      }
                    />
                  </div>

                  {errors.contributionTypes && (
                    <p className="text-accent mt-2" style={{ fontSize: '13px', fontWeight: 500 }}>
                      {errors.contributionTypes}
                    </p>
                  )}
                </div>

                {/* Investment Amount - Conditional */}
                {(formData.contributionTypes.investissementFinancier ||
                  formData.contributionTypes.creationEntreprise) && (
                  <div>
                    <label className="text-neutral-900 mb-3 block" style={{ fontSize: '14px', fontWeight: 500 }}>
                      Montant d&apos;investissement potentiel (si applicable)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <ChampTexte
                        label=""
                        name="montantInvestissement"
                        value={formData.montantInvestissement}
                        onChange={(value) => updateField('montantInvestissement', value)}
                        placeholder="Ex: 20000"
                      />
                      <ChampSelect
                        label=""
                        name="deviseInvestissement"
                        value={formData.deviseInvestissement}
                        onChange={(value) => updateField('deviseInvestissement', value)}
                        options={[
                          { value: 'EUR', label: 'EUR' },
                          { value: 'USD', label: 'USD' },
                          { value: 'XAF', label: 'XAF' },
                        ]}
                      />
                    </div>
                    <p className="text-neutral-600 mt-2" style={{ fontSize: '13px', fontWeight: 400 }}>
                      Indiquez une estimation ou une fourchette
                    </p>
                  </div>
                )}

                {/* Disponibilités */}
                <div>
                  <label className="text-neutral-900 mb-3 block" style={{ fontSize: '14px', fontWeight: 500 }}>
                    Vos disponibilités <span className="text-accent">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div data-error={!!errors.dateDebut}>
                      <ChampTexte
                        label="À partir du"
                        name="dateDebut"
                        value={formData.dateDebut}
                        onChange={(value) => updateField('dateDebut', value)}
                        placeholder="JJ/MM/AAAA"
                        error={errors.dateDebut}
                      />
                    </div>
                    <div data-error={!!errors.dureeEngagement}>
                      <ChampSelect
                        label="Durée"
                        name="dureeEngagement"
                        value={formData.dureeEngagement}
                        onChange={(value) => updateField('dureeEngagement', value)}
                        options={dureeOptions}
                        placeholder="Sélectionnez"
                        error={errors.dureeEngagement}
                      />
                    </div>
                  </div>
                  <p className="text-neutral-600 mt-2" style={{ fontSize: '13px', fontWeight: 400 }}>
                    Indiquez quand et pour combien de temps vous pouvez contribuer
                  </p>
                </div>

                {/* Message de motivation */}
                <div data-error={!!errors.messageMotivation}>
                  <ChampTextarea
                    label="Message de motivation"
                    name="messageMotivation"
                    value={formData.messageMotivation}
                    onChange={(value) => updateField('messageMotivation', value)}
                    placeholder="Expliquez pourquoi cette action vous intéresse et comment vous comptez contribuer concrètement. Minimum 6 lignes recommandé pour une candidature solide."
                    required
                    rows={6}
                    maxLength={1000}
                    helperText="Soyez précis sur ce que vous pouvez apporter"
                    error={errors.messageMotivation}
                  />
                </div>

                {/* Documents */}
                <ChampFichier
                  label="Documents complémentaires (optionnel)"
                  name="documents"
                  files={formData.documents}
                  onChange={(files) => updateField('documents', files)}
                  accept=".pdf,.doc,.docx"
                  multiple
                  maxSize={5}
                  helperText="Télécharger votre CV, portfolio ou autres documents - PDF, DOC - Max 5MB"
                />
              </div>
            </div>

            {/* Section 6: Autorisations */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-3">
              <ChampCheckbox
                label="Autorisez-vous Jesuisaucameroun.com à publier votre témoignage sur le site web si votre contribution aboutit ? (Vous serez contacté pour validation avant publication)"
                name="autorisationTemoignage"
                checked={formData.autorisationTemoignage}
                onChange={(checked) => updateField('autorisationTemoignage', checked)}
              />

              <div data-error={!!errors.accepteConditions}>
                <ChampCheckbox
                  label={
                    <span>
                      J&apos;ai lu et j&apos;accepte les{' '}
                      <Link href="/mentions-legales" className="text-primary hover:underline">
                        conditions d&apos;utilisation
                      </Link>{' '}
                      et la{' '}
                      <Link href="/protection-donnees" className="text-primary hover:underline">
                        politique de confidentialité
                      </Link>{' '}
                      <span className="text-accent">*</span>
                    </span>
                  }
                  name="accepteConditions"
                  checked={formData.accepteConditions}
                  onChange={(checked) => updateField('accepteConditions', checked)}
                />
                {errors.accepteConditions && (
                  <p className="text-accent mt-2 ml-8" style={{ fontSize: '13px', fontWeight: 500 }}>
                    {errors.accepteConditions}
                  </p>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer - Fixed */}
        <div className="px-6 py-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0 bg-white rounded-b-2xl">
          <Bouton variant="secondaire" size="moyen" onClick={handleCancel} disabled={isSubmitting}>
            Annuler
          </Bouton>

          <Bouton
            variant="primaire"
            size="grand"
            type="submit"
            form="candidature-form"
            disabled={isSubmitting}
            icon={
              isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2} />
              ) : undefined
            }
          >
            {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma candidature'}
          </Bouton>
        </div>

        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-3" strokeWidth={2} />
              <p className="text-neutral-700" style={{ fontSize: '15px', fontWeight: 500 }}>
                Envoi de votre candidature en cours...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
