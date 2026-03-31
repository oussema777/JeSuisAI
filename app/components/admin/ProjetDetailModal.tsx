import {
  Lightbulb, Globe, Mail, Phone, Linkedin, MapPin,
  FileText, Download, X, Clock, Check
} from 'lucide-react';

interface ProjetSoumis {
  id: string;
  created_at: string;
  nom: string;
  prenom: string;
  pays: string;
  email: string;
  whatsapp: string | null;
  profil_linkedin: string | null;
  domaines_action: string[];
  autres_domaine: string | null;
  niveau_ciblage: string;
  ville_specifique: string | null;
  villes_multiples: string[] | null;
  nature_projet: string[];
  autres_nature: string | null;
  message: string | null;
  fichiers_joints_urls: string[] | null;
  fichiers_joints_noms: string[] | null;
  fichiers_joints_tailles: number[] | null;
  autorisation_publication: string | null;
  statut?: string;
}

interface ProjetDetailModalProps {
  projet: ProjetSoumis;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  getStatusBadge: (status?: string) => React.ReactNode;
  formatDateTime: (date: string) => string;
}

export const ProjetDetailModal = ({
  projet,
  onClose,
  onUpdateStatus,
  getStatusBadge,
  formatDateTime,
}: ProjetDetailModalProps) => (
  <div
    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
    aria-label="Détails du projet"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Modal Header */}
      <div className="bg-primary p-8 text-white">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Lightbulb className="w-8 h-8 text-white" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">
                Projet de {projet.prenom} {projet.nom}
              </h2>
              <div className="flex items-center gap-2 text-white/90">
                <Globe className="w-4 h-4" />
                <span>{projet.pays}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Fermer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(projet.statut)}
          <span className="text-white/70 text-sm">
            Soumis le {formatDateTime(projet.created_at)}
          </span>
        </div>
      </div>

      {/* Modal Content */}
      <div className="p-8 overflow-y-auto max-h-[calc(90vh-280px)]">
        <div className="space-y-6">
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Informations de contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-neutral-400" />
                <span className="text-neutral-700">{projet.email}</span>
              </div>
              {projet.whatsapp && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-neutral-400" />
                  <span className="text-neutral-700">{projet.whatsapp}</span>
                </div>
              )}
              {projet.profil_linkedin && (
                <div className="flex items-center gap-3">
                  <Linkedin className="w-5 h-5 text-neutral-400" />
                  <a
                    href={projet.profil_linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Profil LinkedIn <span className="sr-only">(nouvelle fenêtre)</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Project Details */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Détails du projet
            </h3>
            <div className="space-y-3">
              {projet.nature_projet && projet.nature_projet.length > 0 && (
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Nature du projet</p>
                  <div className="flex flex-wrap gap-2">
                    {projet.nature_projet.map((nature, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-sm"
                      >
                        {nature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {projet.domaines_action && projet.domaines_action.length > 0 && (
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Domaines d&apos;action</p>
                  <div className="flex flex-wrap gap-2">
                    {projet.domaines_action.map((domaine, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-purple-50 text-purple-700 rounded-md text-sm"
                      >
                        {domaine}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-neutral-600 mb-1">Ciblage géographique</p>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-neutral-400" />
                  <span className="text-neutral-700">
                    {projet.niveau_ciblage === 'toutes' && 'Toutes les villes'}
                    {projet.niveau_ciblage === 'une-ville' && projet.ville_specifique}
                    {projet.niveau_ciblage === 'plusieurs-villes' &&
                      projet.villes_multiples?.join(', ')}
                  </span>
                </div>
              </div>

              {projet.message && (
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Message</p>
                  <p className="text-neutral-700 whitespace-pre-wrap">{projet.message}</p>
                </div>
              )}
            </div>
          </div>

          {/* Files */}
          {projet.fichiers_joints_noms && projet.fichiers_joints_noms.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Fichiers joints
              </h3>
              <div className="space-y-2">
                {projet.fichiers_joints_noms.map((nom, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-neutral-400" />
                      <span className="text-neutral-700">{nom}</span>
                    </div>
                    {projet.fichiers_joints_urls && projet.fichiers_joints_urls[idx] && (
                      <a
                        href={projet.fichiers_joints_urls[idx]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                      >
                        <Download className="w-4 h-4" />
                        Télécharger <span className="sr-only">(nouvelle fenêtre)</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions Footer */}
      <div className="p-6 border-t border-neutral-200 bg-neutral-50">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-white transition-colors"
          >
            Fermer
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => onUpdateStatus(projet.id, 'rejete')}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-700 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
            >
              <X className="w-4 h-4" />
              Rejeter
            </button>
            <button
              onClick={() => onUpdateStatus(projet.id, 'en-cours')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-700 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors"
            >
              <Clock className="w-4 h-4" />
              En cours
            </button>
            <button
              onClick={() => onUpdateStatus(projet.id, 'approuve')}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-500/90 transition-colors"
            >
              <Check className="w-4 h-4" />
              Approuver
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);
