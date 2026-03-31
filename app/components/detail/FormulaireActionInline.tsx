'use client';
import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, ChevronDown, Loader2 } from 'lucide-react';
import { Bouton } from '../ds/Bouton';

// 1. Define the exact shape expected by Supabase/Parent
interface CandidatureData {
  nom_prenom: string;
  pays_residence: string;
  email: string;
  whatsapp: string;
  linkedin_url: string;
  lien_territoire: string;
  message: string;
  accord_temoignage: boolean | null; // Changed to boolean for DB
}

interface FormulaireActionInlineProps {
  opportunityTitle: string;
  municipalityName: string;
  onSuccess?: (data: CandidatureData) => void;
}

export function FormulaireActionInline({
  opportunityTitle,
  municipalityName,
  onSuccess,
}: FormulaireActionInlineProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 2. State uses snake_case keys to match Database
  const [formData, setFormData] = useState<CandidatureData>({
    nom_prenom: '',
    pays_residence: '',
    email: '',
    whatsapp: '',
    linkedin_url: '',
    lien_territoire: '',
    message: '',
    accord_temoignage: null,
  });

  // Generic updater
  const updateField = (field: keyof CandidatureData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom_prenom.trim()) newErrors.nom_prenom = 'Ce champ est obligatoire';
    if (!formData.pays_residence.trim()) newErrors.pays_residence = 'Ce champ est obligatoire';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Ce champ est obligatoire';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Veuillez entrer une adresse email valide';
    }
    
    if (!formData.whatsapp.trim()) newErrors.whatsapp = 'Ce champ est obligatoire';
    if (!formData.lien_territoire) newErrors.lien_territoire = 'Ce champ est obligatoire';
    if (!formData.message.trim()) newErrors.message = 'Ce champ est obligatoire';
    
    // Check boolean explicitely (false is valid, null is not)
    if (formData.accord_temoignage === null) newErrors.accord_temoignage = 'Ce champ est obligatoire';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Pass the correctly shaped data to parent
      if (onSuccess) {
        await onSuccess(formData);
      }
      setIsSubmitted(true);
    } catch (error) {
      console.error(error);
      // Parent handles alert
    } finally {
      setIsSubmitting(false);
    }
  };

  const paysOptions = [
    'France', 'États-Unis', 'Canada', 'Belgique', 'Royaume-Uni', 
    'Allemagne', 'Suisse', 'Italie', 'Espagne', 'Pays-Bas', 'Cameroun', 'Autre'
  ];

  const lienTerritoireOptions = [
    { value: 'famille', label: 'Famille sur place' },
    { value: 'etudes', label: 'Études' },
    { value: 'travail', label: 'Travail/Affaires' },
    { value: 'tourisme', label: 'Tourisme' },
    { value: 'aucun', label: 'Aucun' },
  ];

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-xl border-2 border-success p-8 text-center">
        <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-white" strokeWidth={2} />
        </div>
        <h3 className="text-neutral-900 mb-2" style={{ fontSize: '25px', fontWeight: 600 }}>
          Candidature envoyée avec succès !
        </h3>
        <p className="text-neutral-700" style={{ fontSize: '16px', lineHeight: '1.6', fontWeight: 400 }}>
          L&apos;annonceur examinera votre candidature et vous contactera sous peu.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-yellow/5 via-white to-yellow/10 rounded-xl border-2 border-primary shadow-lg p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <h3 className="text-neutral-900" style={{ fontSize: '25px', lineHeight: '1.3', fontWeight: 600 }}>
            Passer à l'action
          </h3>
        </div>
        
        <p className="text-neutral-700 mb-4" style={{ fontSize: '16px', lineHeight: '1.6', fontWeight: 400 }}>
          Exprimez votre intérêt en remplissant ce formulaire. L&apos;annonceur examinera votre candidature et vous contactera sous peu.
        </p>
        
        {/* Context (Read-only) */}
        <div className="bg-white rounded-lg p-4 border border-primary/30 shadow-sm">
          <p className="text-neutral-600 mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>
            Contribution pour :
          </p>
          <p className="text-neutral-900" style={{ fontSize: '16px', fontWeight: 600 }}>
            {opportunityTitle}
          </p>
          <p className="text-neutral-700 mt-1" style={{ fontSize: '14px', fontWeight: 500 }}>
            {municipalityName}
          </p>
        </div>
      </div>

      {/* Error Summary */}
      {Object.keys(errors).length > 0 && (
        <div className="mb-6 bg-accent/8 border-l-4 border-accent rounded-r-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" strokeWidth={2} />
          <div>
            <p className="text-accent" style={{ fontSize: '14px', fontWeight: 600 }}>
              Veuillez corriger les erreurs ci-dessous avant de soumettre
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Field 1: Nom & prénom */}
          <div>
            <label htmlFor="nom_prenom" className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
              Nom & prénom <span className="text-accent">*</span>
            </label>
            <input
              id="nom_prenom"
              type="text"
              value={formData.nom_prenom}
              onChange={(e) => updateField('nom_prenom', e.target.value)}
              className={`w-full h-12 px-4 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                errors.nom_prenom ? 'border-accent' : 'border-neutral-300'
              }`}
              placeholder="Jean Dupont"
              style={{ fontSize: '15px', fontWeight: 400 }}
            />
            {errors.nom_prenom && (
              <p className="text-accent mt-1" style={{ fontSize: '13px', fontWeight: 500 }}>{errors.nom_prenom}</p>
            )}
          </div>

          {/* Field 2: Pays de résidence */}
          <div>
            <label htmlFor="pays_residence" className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
              Pays de résidence <span className="text-accent">*</span>
            </label>
            <div className="relative">
              <select
                id="pays_residence"
                value={formData.pays_residence}
                onChange={(e) => updateField('pays_residence', e.target.value)}
                className={`w-full h-12 px-4 pr-10 bg-white border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer ${
                  errors.pays_residence ? 'border-accent' : 'border-neutral-300'
                }`}
                style={{ fontSize: '15px', fontWeight: 400 }}
              >
                <option value="">Sélectionnez votre pays</option>
                {paysOptions.map((pays) => (
                  <option key={pays} value={pays}>{pays}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 pointer-events-none" strokeWidth={2} />
            </div>
            {errors.pays_residence && (
              <p className="text-accent mt-1" style={{ fontSize: '13px', fontWeight: 500 }}>{errors.pays_residence}</p>
            )}
          </div>

          {/* Field 3: Email */}
          <div>
            <label htmlFor="email" className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
              Email <span className="text-accent">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              className={`w-full h-12 px-4 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                errors.email ? 'border-accent' : 'border-neutral-300'
              }`}
              placeholder="votre.email@exemple.com"
              style={{ fontSize: '15px', fontWeight: 400 }}
            />
            {errors.email && (
              <p className="text-accent mt-1" style={{ fontSize: '13px', fontWeight: 500 }}>{errors.email}</p>
            )}
          </div>

          {/* Field 4: WhatsApp */}
          <div>
            <label htmlFor="whatsapp" className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
              WhatsApp <span className="text-accent">*</span>
            </label>
            <input
              id="whatsapp"
              type="tel"
              value={formData.whatsapp}
              onChange={(e) => updateField('whatsapp', e.target.value)}
              className={`w-full h-12 px-4 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                errors.whatsapp ? 'border-accent' : 'border-neutral-300'
              }`}
              placeholder="+237 6XX XX XX XX"
              style={{ fontSize: '15px', fontWeight: 400 }}
            />
            {errors.whatsapp && (
              <p className="text-accent mt-1" style={{ fontSize: '13px', fontWeight: 500 }}>{errors.whatsapp}</p>
            )}
          </div>

          {/* Field 5: Lien LinkedIn */}
          <div>
            <label htmlFor="linkedin_url" className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
              Lien profil Linkedin
            </label>
            <input
              id="linkedin_url"
              type="url"
              value={formData.linkedin_url}
              onChange={(e) => updateField('linkedin_url', e.target.value)}
              className="w-full h-12 px-4 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="Site web, blog, article de presse..."
              style={{ fontSize: '15px', fontWeight: 400 }}
            />
          </div>

          {/* Field 6: Lien Territoire */}
          <div>
            <label htmlFor="lien_territoire" className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
              Lien avec le territoire <span className="text-accent">*</span>
            </label>
            <div className="relative">
              <select
                id="lien_territoire"
                value={formData.lien_territoire}
                onChange={(e) => updateField('lien_territoire', e.target.value)}
                className={`w-full h-12 px-4 pr-10 bg-white border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer ${
                  errors.lien_territoire ? 'border-accent' : 'border-neutral-300'
                }`}
                style={{ fontSize: '15px', fontWeight: 400 }}
              >
                <option value="">Sélectionnez votre lien</option>
                {lienTerritoireOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 pointer-events-none" strokeWidth={2} />
            </div>
            {errors.lien_territoire && (
              <p className="text-accent mt-1" style={{ fontSize: '13px', fontWeight: 500 }}>{errors.lien_territoire}</p>
            )}
          </div>

          {/* Field 7: Message */}
          <div>
            <label htmlFor="message" className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
              Message <span className="text-accent">*</span>
            </label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => updateField('message', e.target.value)}
              rows={6}
              className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none ${
                errors.message ? 'border-accent' : 'border-neutral-300'
              }`}
              placeholder="Décrivez votre motivation et comment vous pouvez contribuer à ce projet..."
              style={{ fontSize: '15px', fontWeight: 400, lineHeight: '1.6' }}
            />
            {errors.message && (
              <p className="text-accent mt-1" style={{ fontSize: '13px', fontWeight: 500 }}>{errors.message}</p>
            )}
          </div>

          {/* Field 8: Autorisation (Boolean) */}
          <div>
            <label className="block text-neutral-900 mb-3" style={{ fontSize: '14px', fontWeight: 500 }}>
              Autorisez-nous à publier votre contribution sous forme de témoignage ? <span className="text-accent">*</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="accord_temoignage"
                  checked={formData.accord_temoignage === true}
                  onChange={() => updateField('accord_temoignage', true)}
                  className="w-4 h-4 text-primary accent-primary cursor-pointer"
                />
                <span className="text-neutral-800" style={{ fontSize: '15px', fontWeight: 400 }}>Oui</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="accord_temoignage"
                  checked={formData.accord_temoignage === false}
                  onChange={() => updateField('accord_temoignage', false)}
                  className="w-4 h-4 text-primary accent-primary cursor-pointer"
                />
                <span className="text-neutral-800" style={{ fontSize: '15px', fontWeight: 400 }}>Non</span>
              </label>
            </div>
            {errors.accord_temoignage && (
              <p className="text-accent mt-1" style={{ fontSize: '13px', fontWeight: 500 }}>{errors.accord_temoignage}</p>
            )}
          </div>

          <div className="pt-4">
            <Bouton
              type="submit"
              variant="primaire"
              size="large"
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Envoi...
                </span>
              ) : (
                'Merci de me contacter'
              )}
            </Bouton>
          </div>
        </div>
      </form>
    </div>
  );
}