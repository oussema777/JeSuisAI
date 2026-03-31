import { X, MapPin, Calendar, Users, Wallet, CheckCircle2, FileText, Phone, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { Bouton } from "../components/ds/Bouton";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any; // Using any here for flexibility with the complex form type
}

// Helper to map keys to readable labels
const LABELS_MAPPING: Record<string, string> = {
  // Contributions diaspora
  investissement: "💰 Investissement",
  epargne: "🏦 Épargne",
  competences: "🎓 Compétences",
  dons: "🎁 Dons",
  reseauxInfluence: "🌐 Réseaux & influence",
  achatsTourisme: "🛍️ Achats & tourisme solidaires",
  // Facilités
  interlocuteur: "Interlocuteur dédié",
  travailDistance: "Collaboration à distance",
  assistanceProjet: "Assistance projets",
  locauxMateriels: "Locaux et matériels",
  reseauPrestataires: "Réseau de prestataires",
  autres: "Autres",
};

export const PreviewOpportuniteModal = ({ isOpen, onClose, data }: PreviewModalProps) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Handle Image Preview from File Object
  useEffect(() => {
    if (data.photoRepresentation && data.photoRepresentation.length > 0) {
      const objectUrl = URL.createObjectURL(data.photoRepresentation[0]);
      setPreviewImage(objectUrl);
      
      // Cleanup to avoid memory leaks
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewImage(null);
    }
  }, [data.photoRepresentation]);

  if (!isOpen) return null;

  // Helper to extract true values from objects
  const getActiveLabels = (obj: any) => {
    if (!obj) return [];
    return Object.keys(obj)
      .filter((key) => obj[key] === true)
      .map((key) => LABELS_MAPPING[key] || key);
  };

  const activeContributions = getActiveLabels(data.contributionsDiaspora);
  const activeFacilites = getActiveLabels(data.facilites);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-label="Prévisualisation de l'action">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 bg-neutral-50">
          <h3 className="text-xl font-bold text-neutral-800">Prévisualisation de l'action</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-500 hover:text-neutral-700"
            aria-label="Fermer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white">
          
          {/* Hero Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Image */}
            <div className="aspect-video bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200 flex items-center justify-center">
              {previewImage ? (
                <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-neutral-400 flex flex-col items-center">
                  <span className="text-sm">Aucune image sélectionnée</span>
                </div>
              )}
            </div>

            {/* Main Info */}
            <div>
              <div className="inline-flex px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider mb-3">
                {data.domaineAction || "Domaine non défini"}
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-4 leading-tight">
                {data.intituleAction || "Intitulé de l'Action"}
              </h1>
              
              <div className="space-y-3 text-sm text-neutral-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-neutral-400" />
                  <span>Localisation : Cameroun</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-neutral-400" />
                  <span>
                    {data.timingAction === 'permanente' ? "Action Permanente" : `${data.dateDebut} - ${data.dateFin}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-neutral-400" />
                  <span>Cible : {data.publicVise === 'diaspora' ? "Diaspora exclusivement" : "Tout le monde"}</span>
                </div>
              </div>
            </div>
          </div>

          <hr className="my-8 border-neutral-100" />

          {/* Description */}
          <section className="mb-8">
            <h3 className="text-lg font-bold text-neutral-900 mb-3">Description de la mission</h3>
            <p className="text-neutral-600 leading-relaxed whitespace-pre-wrap">
              {data.descriptionGenerale || "Aucune description fournie."}
            </p>
          </section>

          {/* Impacts & Contributions */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <h3 className="text-lg font-bold text-blue-900 mb-3">Contributions attendues</h3>
              <ul className="space-y-2 mb-4">
                {activeContributions.length > 0 ? activeContributions.map((label) => (
                  <li key={label} className="flex items-start gap-2 text-blue-800 text-sm">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                    {label}
                  </li>
                )) : <li className="text-sm text-blue-800 italic">Aucune sélectionnée</li>}
              </ul>
              <p className="text-sm text-blue-700 mt-4 border-t border-blue-200 pt-3">
                <span className="font-semibold">Détails profils:</span> {data.detailsContributions}
              </p>
            </div>

            <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
              <h3 className="text-lg font-bold text-emerald-900 mb-3">Impacts & Facilités</h3>
              <p className="text-sm text-emerald-800 mb-4 whitespace-pre-wrap">{data.impactsObjectifs}</p>
              
              <h4 className="font-semibold text-emerald-900 text-sm mb-2">Ce que nous offrons :</h4>
              <div className="flex flex-wrap gap-2">
                {activeFacilites.length > 0 ? activeFacilites.map((label) => (
                  <span key={label} className="bg-white px-2 py-1 rounded border border-emerald-200 text-xs text-emerald-700 font-medium">
                    {label}
                  </span>
                )) : <span className="text-xs text-emerald-700 italic">Rien de spécifié</span>}
              </div>
            </div>
          </div>

          {/* Contacts Section */}
          <section>
            <h3 className="text-lg font-bold text-neutral-900 mb-4">Contacts</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {data.contacts.map((contact: any, index: number) => (
                <div key={index} className="border border-neutral-200 p-4 rounded-lg flex flex-col gap-2 hover:border-accent transition-colors">
                   <div className="font-bold text-neutral-900 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-xs text-neutral-600 font-bold">
                        {index + 1}
                      </div>
                      {contact.nom || "Nom manquant"}
                   </div>
                   {contact.email && (
                     <div className="flex items-center gap-2 text-sm text-neutral-600 ml-10">
                       <Mail className="w-4 h-4" /> {contact.email}
                     </div>
                   )}
                   {contact.tel && (
                     <div className="flex items-center gap-2 text-sm text-neutral-600 ml-10">
                       <Phone className="w-4 h-4" /> {contact.tel}
                     </div>
                   )}
                </div>
              ))}
              {data.contacts.length === 0 && <p className="text-neutral-500 italic">Aucun contact ajouté.</p>}
            </div>
          </section>

          {/* Documents */}
          {data.fichierTechnique && data.fichierTechnique.length > 0 && (
            <section className="mt-8 pt-6 border-t border-neutral-100">
               <h4 className="text-sm font-bold text-neutral-900 mb-2">Documents joints ({data.fichierTechnique.length})</h4>
               <div className="flex flex-wrap gap-2">
                 {data.fichierTechnique.map((file: File, i: number) => (
                   <span key={i} className="flex items-center gap-1 text-xs bg-neutral-100 px-2 py-1 rounded text-neutral-600">
                     <FileText className="w-3 h-3" />
                     {file.name}
                   </span>
                 ))}
               </div>
            </section>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-neutral-200 bg-neutral-50 flex justify-end gap-3">
          <Bouton variant="tertiaire" onClick={onClose}>Fermer</Bouton>
          <Bouton variant="primaire" onClick={onClose}>Continuer l'édition</Bouton>
        </div>
      </div>
    </div>
  );
};