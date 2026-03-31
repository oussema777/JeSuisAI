import {
  User, Globe, XCircle, Mail, Linkedin, Briefcase,
  Target, MapPin, FileText, Download, X, Clock, Check
} from 'lucide-react';

interface ProfilSoumis {
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
  contributions_proposees: string[];
  niveau_ciblage: string;
  ville_specifique: string | null;
  villes_multiples: string[] | null;
  message: string | null;
  fichiers_joints_urls: string[] | null;
  fichiers_joints_noms: string[] | null;
  fichiers_joints_tailles: number[] | null;
  autorisation_publication: string;
  statut?: string;
}

interface ProfilDetailModalProps {
  profil: ProfilSoumis;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  getStatusBadge: (status?: string) => React.ReactNode;
  formatDateTime: (date: string) => string;
}

export const ProfilDetailModal = ({
  profil,
  onClose,
  onUpdateStatus,
  getStatusBadge,
  formatDateTime,
}: ProfilDetailModalProps) => (
  <div
    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
    role="dialog"
    aria-modal="true"
    aria-label="Détails du profil"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-2xl shadow-modal max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slideUp"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 p-8 text-white">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <User className="w-8 h-8 text-white" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">
                {profil.prenom} {profil.nom}
              </h2>
              <div className="flex items-center gap-2 text-white/90">
                <Globe className="w-4 h-4" />
                <span>{profil.pays}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Fermer"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {getStatusBadge(profil.statut)}
          <span className="text-white/70 text-sm">
            Soumis le {formatDateTime(profil.created_at)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 overflow-y-auto max-h-[calc(90vh-280px)]">
        {/* Contact Information */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Informations de contact
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-neutral-50 rounded-xl p-6">
            <div>
              <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide block mb-1">
                Email
              </label>
              <p className="text-neutral-900">{profil.email}</p>
            </div>
            {profil.whatsapp && (
              <div>
                <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide block mb-1">
                  WhatsApp
                </label>
                <p className="text-neutral-900">{profil.whatsapp}</p>
              </div>
            )}
            {profil.profil_linkedin && (
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide block mb-1">
                  LinkedIn
                </label>
                <a
                  href={profil.profil_linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  <Linkedin className="w-4 h-4" />
                  {profil.profil_linkedin} <span className="sr-only">(nouvelle fenêtre)</span>
                </a>
              </div>
            )}
          </div>
        </section>

        {/* Domaines & Contributions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <section>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              Domaines d&apos;action
            </h3>
            <div className="flex flex-wrap gap-2">
              {profil.domaines_action.map((domaine, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded-lg border border-primary/20"
                >
                  {domaine}
                </span>
              ))}
            </div>
            {profil.autres_domaine && (
              <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
                <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide block mb-1">
                  Autre domaine
                </label>
                <p className="text-neutral-900">{profil.autres_domaine}</p>
              </div>
            )}
          </section>

          <section>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Contributions
            </h3>
            <div className="flex flex-wrap gap-2">
              {profil.contributions_proposees.map((contribution, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-primary/5 text-primary text-sm font-medium rounded-lg border border-primary/10"
                >
                  {contribution}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* Villes ciblées */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Villes ciblées
          </h3>
          <div className="p-4 bg-neutral-50 rounded-lg">
            {profil.niveau_ciblage === 'toutes' ? (
              <p className="text-neutral-900 font-medium">Toutes les villes du Cameroun</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profil.villes_multiples?.map((ville, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-white text-neutral-700 text-sm rounded-md border border-neutral-200"
                  >
                    {ville}
                  </span>
                ))}
                {profil.ville_specifique && (
                  <span className="px-3 py-1.5 bg-white text-neutral-700 text-sm rounded-md border border-neutral-200">
                    {profil.ville_specifique}
                  </span>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Message */}
        {profil.message && (
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Message
            </h3>
            <div className="p-6 bg-neutral-50 rounded-xl border border-neutral-200">
              <p className="text-neutral-700 whitespace-pre-wrap leading-relaxed">
                {profil.message}
              </p>
            </div>
          </section>
        )}

        {/* Fichiers joints */}
        {profil.fichiers_joints_urls && profil.fichiers_joints_urls.length > 0 && (
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Fichiers joints ({profil.fichiers_joints_urls.length})
            </h3>
            <div className="space-y-2">
              {profil.fichiers_joints_urls.map((url, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg border border-neutral-200 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-neutral-900 font-medium text-sm">
                        {profil.fichiers_joints_noms?.[idx] || `Document ${idx + 1}`}
                      </p>
                      {profil.fichiers_joints_tailles?.[idx] && (
                        <p className="text-neutral-500 text-xs">
                          {(profil.fichiers_joints_tailles[idx] / 1024).toFixed(1)} Ko
                        </p>
                      )}
                    </div>
                  </div>
                  <Download className="w-5 h-5 text-neutral-400 group-hover:text-primary transition-colors" />
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Autorisation de publication */}
        <section>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Autorisation de publication
          </h3>
          <div className={`p-4 rounded-lg ${
            profil.autorisation_publication === 'oui'
              ? 'bg-green-500/10 border border-green-500/20'
              : 'bg-neutral-100 border border-neutral-200'
          }`}>
            <p className="text-neutral-900 font-medium">
              {profil.autorisation_publication === 'oui'
                ? '✓ Autorise la publication en témoignage'
                : '✗ N\'autorise pas la publication'}
            </p>
          </div>
        </section>
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
              onClick={() => onUpdateStatus(profil.id, 'rejete')}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-700 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
            >
              <X className="w-4 h-4" />
              Rejeter
            </button>
            <button
              onClick={() => onUpdateStatus(profil.id, 'en-cours')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-700 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors"
            >
              <Clock className="w-4 h-4" />
              En cours
            </button>
            <button
              onClick={() => onUpdateStatus(profil.id, 'approuve')}
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
