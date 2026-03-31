'use client';
import React, { useState } from 'react';

import { ChevronLeft, Send, Mail } from 'lucide-react';
import { Bouton } from '../components/ds/Bouton';
import { FilDAriane } from '../components/listing/FilDAriane';
import { ChampTexte } from '../components/ds/ChampTexte';
import { Link } from '@/i18n/routing';
import { toast } from 'sonner';

interface FormData {
  typeOrganisation: string;
  nomOrganisation: string;
  nomPrenom: string;
  email: string;
  whatsappTelephone: string;
  objetMessage: string;
  message: string;
}

// Organization types from Brief 27
const TYPES_ORGANISATION = [
  'Entreprise',
  'Administration',
  'ONG',
  'Personne physique',
  'Autre',
];

// Message subject options
const OBJETS_MESSAGE = [
  'Question générale',
  'Partenariat',
  'Support technique',
  'Suggestion d\'amélioration',
  'Signalement d\'un problème',
  'Demande d\'information',
  'Autre',
];

export function Contact() {
  const [formData, setFormData] = useState<FormData>({
    typeOrganisation: '',
    nomOrganisation: '',
    nomPrenom: '',
    email: '',
    whatsappTelephone: '',
    objetMessage: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.typeOrganisation) return false;
    if (!formData.nomPrenom) return false;
    if (!formData.email) return false;
    if (!formData.objetMessage) return false;
    if (!formData.message || formData.message.length < 20) return false;
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.warning('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          typeOrganisation: formData.typeOrganisation,
          nomOrganisation: formData.nomOrganisation,
          nomPrenom: formData.nomPrenom,
          email: formData.email,
          whatsappTelephone: formData.whatsappTelephone,
          objetMessage: formData.objetMessage,
          message: formData.message,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi');
      }

      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Submit error:', err);
      toast.error('Une erreur est survenue lors de l\'envoi. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success message display
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-page-bg">
        {/* Breadcrumb Navigation */}
        <div className="w-full border-b border-neutral-200 bg-white">
          <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20 py-4">
            <FilDAriane
              items={[
                { label: 'Accueil', href: '/' },
                { label: 'Contact' },
              ]}
            />
          </div>
        </div>

        <div className="w-full py-20">
          <div className="max-w-2xl mx-auto px-5 md:px-10 text-center">
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-primary" strokeWidth={2} />
              </div>
              
              <h2 className="text-neutral-900 mb-4" style={{ fontSize: '28px', lineHeight: '1.3', fontWeight: 600 }}>
                Message envoyé avec succès !
              </h2>
              
              <p className="text-neutral-700 mb-8" style={{ fontSize: '16px', lineHeight: '1.6', fontWeight: 400, whiteSpace: 'pre-line' }}>
                {`Merci de nous avoir contacté. Notre équipe examinera votre message et vous répondra dans les plus brefs délais.
                Team JesuisauCameroun.com`}
              </p>
              
              <Link href="/">
                <Bouton
                  variant="primaire"
                  size="grand"
                >
                  Retour à l'accueil
                </Bouton>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-bg">
      {/* Breadcrumb Navigation */}
      <div className="w-full border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20 py-4">
          <FilDAriane
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Contact' },
            ]}
          />
        </div>
      </div>

      {/* Page Header */}
      <div className="w-full bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20 py-8">
          <Link href="/" className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors mb-6"
            style={{ fontSize: '14px', fontWeight: 500 }}>
            <ChevronLeft className="w-4 h-4" strokeWidth={2} />
            Retour à l'accueil
          </Link>

          {/* Icon & Title */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Mail className="w-7 h-7 text-primary" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-neutral-900 mb-2" style={{ fontSize: '32px', lineHeight: '1.2', fontWeight: 600 }}>
                Contactez-nous
              </h2>
              <p className="text-neutral-700" style={{ fontSize: '18px', lineHeight: '1.6', fontWeight: 400 }}>
                Notre équipe est à votre écoute
              </p>
            </div>
          </div>

          <p className="text-neutral-600 max-w-3xl" style={{ fontSize: '15px', lineHeight: '1.7', fontWeight: 400 }}>
            Vous avez une question, une suggestion ou besoin d'assistance ? Remplissez ce formulaire et notre équipe vous répondra dans les meilleurs délais.
          </p>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="w-full py-12">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20">
          <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSubmit}>
                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8 md:p-10">
                  
                  <h3 className="text-neutral-900 mb-6 pb-3 border-b border-neutral-200" style={{ fontSize: '22px', lineHeight: '1.3', fontWeight: 600 }}>
                    Formulaire de contact
                  </h3>

                  <div className="space-y-6">
                    {/* 1. Type d'organisation */}
                    <div>
                      <label className="block text-neutral-700 mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>
                        Vous êtes ? <span className="text-accent-red">*</span>
                      </label>
                      <select
                        value={formData.typeOrganisation}
                        onChange={(e) => handleInputChange('typeOrganisation', e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        style={{ fontSize: '15px', fontWeight: 400 }}
                        required
                      >
                        <option value="">Sélectionnez votre type d'organisation</option>
                        {TYPES_ORGANISATION.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 2. Nom de l'organisation (conditional - hidden for Personne physique) */}
                    {formData.typeOrganisation && formData.typeOrganisation !== 'Personne physique' && (
                      <ChampTexte
                        label="Nom de l'organisation"
                        value={formData.nomOrganisation}
                        onChange={(e) => handleInputChange('nomOrganisation', e.target.value)}
                        placeholder="Ex: Entreprise XYZ, Mairie de..., ONG ABC"
                      />
                    )}

                    {/* 3. Nom & Prénom */}
                    <ChampTexte
                      label="Nom & Prénom"
                      required
                      value={formData.nomPrenom}
                      onChange={(e) => handleInputChange('nomPrenom', e.target.value)}
                      placeholder="Ex: Jean Dupont"
                    />

                    {/* 4. Email & WhatsApp/Téléphone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ChampTexte
                        label="Email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="votre.email@exemple.com"
                      />
                      <ChampTexte
                        label="WhatsApp / Téléphone"
                        type="tel"
                        value={formData.whatsappTelephone}
                        onChange={(e) => handleInputChange('whatsappTelephone', e.target.value)}
                        placeholder="+33 6 12 34 56 78"
                      />
                    </div>

                    {/* 5. Objet du message */}
                    <div>
                      <label className="block text-neutral-700 mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>
                        Objet du message <span className="text-accent-red">*</span>
                      </label>
                      <select
                        value={formData.objetMessage}
                        onChange={(e) => handleInputChange('objetMessage', e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        style={{ fontSize: '15px', fontWeight: 400 }}
                        required
                      >
                        <option value="">Sélectionnez l'objet de votre message</option>
                        {OBJETS_MESSAGE.map((objet) => (
                          <option key={objet} value={objet}>
                            {objet}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 6. Message */}
                    <div>
                      <label className="block text-neutral-700 mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>
                        Message <span className="text-accent-red">*</span>
                      </label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        rows={8}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                        style={{ fontSize: '15px', fontWeight: 400, lineHeight: '1.7' }}
                        placeholder="Décrivez votre demande de manière détaillée..."
                        required
                      />
                      <p className="text-neutral-500 mt-2" style={{ fontSize: '13px', fontWeight: 400 }}>
                        {formData.message.length} caractères (minimum 20)
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 border-t border-neutral-200 mt-8">
                    <Bouton
                      variant="primaire"
                      size="grand"
                      type="submit"
                      disabled={!validateForm() || isSubmitting}
                      className="w-full"
                    >
                      <Send className="w-5 h-5 mr-2" strokeWidth={2} />
                      {isSubmitting ? 'Envoi en cours...' : 'Envoyer mon message'}
                    </Bouton>
                    
                    {!validateForm() && (
                      <p className="text-neutral-500 text-center mt-3" style={{ fontSize: '13px', fontWeight: 400 }}>
                        Veuillez remplir tous les champs obligatoires (*)
                      </p>
                    )}
                  </div>
                </div>
              </form>
          </div>
        </div>
      </div>
    </div>
  );
}
