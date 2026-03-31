'use client';
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Save, Check, Upload, X } from 'lucide-react';
import { Bouton } from '../components/ds/Bouton';
import { FilDAriane } from '../components/listing/FilDAriane';
import { ChampTexte } from '../components/ds/ChampTexte';
import { CaseACocher } from '../components/ds/CaseACocher';
import { useRouter } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { notificationService } from '@/lib/notificationService';
import { sendRecapEmail } from '@/lib/sendRecapEmail';

type Step = 1 | 2 | 3;

interface FormData {
  // Step 1: Personal Information
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  paysResidence: string;
  competences: string;
  secteurProfessionnel: string;
  
  // Step 2: Proposal
  motivation: string;
  typeContribution: string;
  dateDebut: string;
  dureeEstimee: string;
  montantInvestissement: string;
  documents: File[];
  
  // Step 3: Confirmation
  accepteConditions: boolean;
}

export default function PostulerOpportunite() {
  const router = useRouter();
  const params = useParams();
  const [opportunityId, setOpportunityId] = useState<string | undefined>(params.id ? params.id as string : undefined);
  const [opportunityTitle, setOpportunityTitle] = useState('Chargement...');
  const [annonceurEmails, setAnnonceurEmails] = useState<string>('');
  const [annonceurId, setAnnonceurId] = useState<string | null>(null);

  const supabase = getSupabaseBrowserClient();

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    paysResidence: '',
    competences: '',
    secteurProfessionnel: '',
    motivation: '',
    typeContribution: '',
    dateDebut: '',
    dureeEstimee: '',
    montantInvestissement: '',
    documents: [],
    accepteConditions: false,
  });
  
  // Fetch Opportunity Title and Annonceur emails
  useEffect(() => {
    if (opportunityId) {
      const fetchData = async () => {
        const { data } = await supabase
          .from('opportunites')
          .select(`
            intitule_action,
            profiles:created_by (
              annonceur_id,
              annonceur_profiles:annonceur_id (
                contact_legal_email,
                emails_destinataires,
                points_focaux_diaspora
              )
            )
          `)
          .eq('id', opportunityId)
          .single();

        if (data) {
          setOpportunityTitle(data.intitule_action);

          // Safely extract emails from nested structure
          const profile = data.profiles as any;
          if (profile?.annonceur_id) {
            setAnnonceurId(profile.annonceur_id);
          }
          const annonceur = profile?.annonceur_profiles;
          if (annonceur) {
            // Extract focal point emails from points_focaux_diaspora
            let focalPointEmails: string[] = [];
            if (annonceur.points_focaux_diaspora) {
              try {
                const focalPoints = typeof annonceur.points_focaux_diaspora === 'string'
                  ? JSON.parse(annonceur.points_focaux_diaspora)
                  : annonceur.points_focaux_diaspora;
                if (Array.isArray(focalPoints)) {
                  focalPointEmails = focalPoints
                    .map((fp: { email?: string }) => fp.email?.trim())
                    .filter(Boolean) as string[];
                }
              } catch (e) {
                console.error('Error parsing points_focaux_diaspora:', e);
              }
            }

            const emails = [
              annonceur.contact_legal_email,        // Main project manager
              annonceur.emails_destinataires,        // Email addresses for diaspora responses
              ...focalPointEmails                    // Diaspora focal point emails
            ].filter(Boolean).join(',');
            setAnnonceurEmails(emails);
          }
        }
      };
      fetchData();
    }
  }, [opportunityId, supabase]);
  
  // Auto-save every 2 minutes
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      handleSaveDraft(true);
    }, 120000); 
    
    return () => clearInterval(autoSaveInterval);
  }, [formData]);
  
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSaveDraft = (isAutoSave = false) => {
    setIsSaving(true);
    setTimeout(() => {
      setLastSaved(new Date());
      setIsSaving(false);
    }, 500);
  };
  
  const ALLOWED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      for (const file of newFiles) {
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
          toast.warning('Type de fichier non autorisé. Formats acceptés : PDF, DOC, DOCX');
          return;
        }
        if (file.size > MAX_FILE_SIZE) {
          toast.warning('Le fichier est trop volumineux. Taille maximale : 10 Mo');
          return;
        }
      }
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...newFiles].slice(0, 3),
      }));
    }
  };
  
  const handleRemoveFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };
  
  const handleNextStep = () => {
    handleSaveDraft();
    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as Step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const handleSubmit = async () => {
    if (!formData.accepteConditions) {
      toast.warning('Veuillez accepter les conditions générales d\'utilisation');
      return;
    }
    
    setIsSaving(true);
    try {
      // 1. Upload Documents
      const uploadedFileUrls: string[] = [];
      const uploadedFileNames: string[] = [];

      for (const file of formData.documents) {
        const body = new FormData();
        body.append('file', file);
        body.append('bucket', 'fichiers-candidatures');
        body.append('folder', 'candidatures');

        const res = await fetch('/api/upload', { method: 'POST', body });
        const result = await res.json();

        if (!res.ok || !result.success) {
          console.error('Upload error:', result.error);
          toast.error('Erreur lors de l\'upload des fichiers. Veuillez réessayer.');
          setIsSaving(false);
          return;
        }

        uploadedFileUrls.push(result.url);
        uploadedFileNames.push(result.fileName);
      }

      // 2. Insert into Supabase
      const { data: insertedData, error: insertError } = await supabase
        .from('candidatures')
        .insert({
          opportunite_id: opportunityId,
          nom_prenom: `${formData.prenom} ${formData.nom}`,
          email: formData.email,
          telephone: formData.telephone || null,
          pays_residence: formData.paysResidence,
          competences: formData.competences,
          secteur_professionnel: formData.secteurProfessionnel || null,
          motivation: formData.motivation,
          type_contribution: formData.typeContribution,
          date_debut: formData.dateDebut || null,
          duree_estimee: formData.dureeEstimee || null,
          montant_investissement: formData.montantInvestissement || null,
          fichiers_joints_urls: uploadedFileUrls.length > 0 ? uploadedFileUrls : null,
          fichiers_joints_noms: uploadedFileNames.length > 0 ? uploadedFileNames : null,
          statut: 'nouvelle'
        })
        .select()
        .single();

      if (insertError) {
        console.error('Erreur insertion Supabase:', insertError);
        throw insertError;
      }

      // 4. Send Platform Notification to Admins
      try {
        await notificationService.notifyAdmins({
          type: 'candidature_received',
          title: 'Nouvelle Candidature',
          message: `${formData.prenom} ${formData.nom} a postulé à la mission "${opportunityTitle}".`,
          data: {
            candidature_id: insertedData.id,
            candidat_name: `${formData.prenom} ${formData.nom}`,
            opportunity_title: opportunityTitle,
          },
          annonceur_id: annonceurId,
        });
      } catch (notifErr) {
        console.error('Platform notification failed (non-blocking):', notifErr);
      }

      // 5. Send Recap Email to Applicant & Admin
      try {
        await sendRecapEmail({
          to: formData.email,
          type: 'candidature',
          recipientName: `${formData.prenom} ${formData.nom}`,
          details: [
            { label: 'Mission', value: opportunityTitle },
            { label: 'Nom', value: `${formData.prenom} ${formData.nom}` },
            { label: 'Email', value: formData.email },
            { label: 'Type de contribution', value: formData.typeContribution || 'Non spécifié' },
            { label: 'Date', value: new Date().toLocaleDateString('fr-FR') },
          ],
          annonceurEmails: annonceurEmails
        });
      } catch (recapErr) {
        console.error('Recap email failed (non-blocking):', recapErr);
      }

      router.push(`/succes-soumission?type=candidature&opportunityTitle=${encodeURIComponent(opportunityTitle)}`);
    } catch (err) {
      console.error('Submission error:', err);
      toast.error('Erreur lors de la soumission. Veuillez réessayer.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const validateStep1 = () => {
    return formData.nom && formData.prenom && formData.email && 
           formData.paysResidence && formData.competences;
  };
  
  const validateStep2 = () => {
    return formData.motivation && formData.typeContribution;
  };
  
  const getLastSavedText = () => {
    if (!lastSaved) return '';
    const diffMinutes = Math.floor((new Date().getTime() - lastSaved.getTime()) / 60000);
    if (diffMinutes < 1) return 'Brouillon sauvegardé à l\'instant';
    return `Brouillon sauvegardé il y a ${diffMinutes} minutes`;
  };
  
  const steps = [
    { number: 1, title: 'Informations personnelles' },
    { number: 2, title: 'Votre proposition' },
    { number: 3, title: 'Récapitulatif' },
  ];
  
  return (
    <div className="min-h-screen bg-page-bg">
      <div className="w-full border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20 py-4">
          <FilDAriane
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Missions', href: '/missions' },
              { label: opportunityTitle },
              { label: 'Postuler' },
            ]}
          />
        </div>
      </div>
      
      <div className="w-full bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20 py-8">
          <Link href={`/missions/${opportunityId}`}>
            <button className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors mb-6 text-sm font-medium">
              <ChevronLeft className="w-4 h-4" strokeWidth={2} />
              Retour à la mission
            </button>
          </Link>
          
          <h2 className="text-neutral-900 mb-3" style={{ fontSize: 'clamp(24px, 5vw, 32px)', lineHeight: '1.2', fontWeight: 600 }}>
            Postuler pour : {opportunityTitle}
          </h2>
          
          <p className="text-neutral-700 mb-8" style={{ fontSize: '18px', lineHeight: '1.6', fontWeight: 400 }}>
            Étape {currentStep} sur 3 : {steps[currentStep - 1].title}
          </p>
          
          <div className="flex items-center gap-2 max-w-2xl overflow-x-auto pb-4 no-scrollbar">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex-shrink-0 flex flex-col items-center min-w-[100px]">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${ 
                      currentStep > step.number ? 'bg-primary text-white' : currentStep === step.number ? 'bg-primary text-white' : 'bg-neutral-200 text-neutral-500'
                    }`}
                    style={{ fontSize: '16px', fontWeight: 600 }}
                  >
                    {currentStep > step.number ? <Check className="w-5 h-5" strokeWidth={3} /> : step.number}
                  </div>
                  <p className={`mt-2 text-center text-xs ${currentStep >= step.number ? 'text-neutral-900 font-semibold' : 'text-neutral-500'}`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 min-w-[30px] rounded transition-colors ${currentStep > step.number ? 'bg-primary' : 'bg-neutral-200'}`} style={{ marginTop: '-20px' }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      
      <div className="w-full">
        <div className="max-w-4xl mx-auto px-5 md:px-10 py-12">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 md:p-10">
            
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-neutral-900 mb-6">Votre profil diaspora</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ChampTexte label="Nom" required value={formData.nom} onChange={(e) => handleInputChange('nom', e.target.value)} placeholder="Ex: Tankou" />
                  <ChampTexte label="Prénom" required value={formData.prenom} onChange={(e) => handleInputChange('prenom', e.target.value)} placeholder="Ex: Marie" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ChampTexte label="Email" type="email" required value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="votre.email@exemple.com" />
                  <ChampTexte label="Téléphone" type="tel" value={formData.telephone} onChange={(e) => handleInputChange('telephone', e.target.value)} placeholder="+33 6 12 34 56 78" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Pays de résidence *</label>
                  <select value={formData.paysResidence} onChange={(e) => handleInputChange('paysResidence', e.target.value)} className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary outline-none">
                    <option value="">Sélectionnez votre pays</option>
                    <option value="France">France</option>
                    <option value="Belgique">Belgique</option>
                    <option value="Suisse">Suisse</option>
                    <option value="Canada">Canada</option>
                    <option value="Cameroun">Cameroun</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Compétences et expertise *</label>
                  <textarea value={formData.competences} onChange={(e) => handleInputChange('competences', e.target.value)} rows={4} className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none" placeholder="Décrivez vos compétences..." />
                </div>
                <div className="flex gap-4 mt-8 pt-6 border-t border-neutral-200">
                  <Bouton variant="primaire" size="grand" onClick={handleNextStep} disabled={!validateStep1()} className="flex-1">Continuer</Bouton>
                </div>
              </div>
            )}
            
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-neutral-900 mb-6">Votre proposition</h3>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Message de motivation *</label>
                  <textarea value={formData.motivation} onChange={(e) => handleInputChange('motivation', e.target.value)} rows={6} className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none" placeholder="Pourquoi souhaitez-vous contribuer ?" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Type de contribution *</label>
                  <select value={formData.typeContribution} onChange={(e) => handleInputChange('typeContribution', e.target.value)} className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary outline-none">
                    <option value="">Sélectionnez le type</option>
                    <option value="Compétences">Compétences</option>
                    <option value="Investissement">Investissement</option>
                    <option value="Mixte">Mixte</option>
                  </select>
                </div>
                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer relative">
                  <input type="file" multiple accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <Upload className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-neutral-700">Ajouter des documents (CV, etc.)</p>
                  <p className="text-xs text-neutral-500 mt-1">PDF, DOC up to 10MB</p>
                </div>
                {formData.documents.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {formData.documents.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                        <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                        <button onClick={() => handleRemoveFile(idx)} className="text-neutral-400 hover:text-red-500" aria-label="Retirer le fichier"><X className="w-5 h-5" /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-4 mt-8 pt-6 border-t border-neutral-200">
                  <Bouton variant="tertiaire" size="grand" onClick={handlePreviousStep}>Retour</Bouton>
                  <Bouton variant="primaire" size="grand" onClick={handleNextStep} disabled={!validateStep2()} className="flex-1">Vérifier</Bouton>
                </div>
              </div>
            )}
            
            {currentStep === 3 && (
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-neutral-900 mb-6">Récapitulatif</h3>
                <div className="bg-neutral-50 rounded-xl p-6 space-y-4">
                  <div><p className="text-xs font-bold uppercase text-neutral-500">Candidat</p><p className="font-semibold">{formData.prenom} {formData.nom}</p></div>
                  <div><p className="text-xs font-bold uppercase text-neutral-500">Motivation</p><p className="text-sm line-clamp-3">{formData.motivation}</p></div>
                </div>
                <CaseACocher label="J'accepte les conditions d'utilisation" checked={formData.accepteConditions} onChange={(checked) => handleInputChange('accepteConditions', checked)} />
                <div className="flex gap-4 mt-8 pt-6 border-t border-neutral-200">
                  <Bouton variant="tertiaire" size="grand" onClick={handlePreviousStep}>Retour</Bouton>
                  <Bouton variant="primaire" size="grand" onClick={handleSubmit} disabled={isSaving} className="flex-1">
                    {isSaving ? 'Envoi...' : 'Confirmer la candidature'}
                  </Bouton>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
