import { X, Calendar, User, Tag, Link as LinkIcon, FileText, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Bouton } from "../components/ds/Bouton";
import { useTranslations, useLocale } from "next-intl";

interface PreviewActualiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  motsCles: string[];
}

export const PreviewActualiteModal = ({ isOpen, onClose, data, motsCles }: PreviewActualiteModalProps) => {
  const t = useTranslations("Admin.NewsForm.preview");
  const tCat = useTranslations("Admin.NewsForm.categories");
  const locale = useLocale();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (data.imagePrincipale && data.imagePrincipale.length > 0) {
      const objectUrl = URL.createObjectURL(data.imagePrincipale[0]);
      setPreviewImage(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewImage(null);
    }
  }, [data.imagePrincipale]);

  if (!isOpen) return null;

  // Safely get category label
  let categoryLabel = t("modal_title"); // fallback
  if (data.objet) {
    try {
      categoryLabel = tCat(data.objet);
    } catch (e) {
      categoryLabel = data.objet;
    }
  }

  const publishDate = data.datePublication 
    ? new Date(data.datePublication).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-label={t("modal_title")}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-bold text-neutral-800">{t("modal_title")}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-500 hover:text-neutral-700"
            aria-label={t("close")}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-0 bg-white">
          
          {/* Article Header / Hero Image */}
          <div className="relative h-64 md:h-80 bg-neutral-100 flex items-center justify-center overflow-hidden">
            {previewImage ? (
              <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
            ) : data.existingImagePath ? (
                <div className="text-neutral-500 italic">{t("existing_image_placeholder")}</div>
            ) : (
              <div className="text-neutral-400 flex flex-col items-center">
                <FileText className="w-12 h-12 mb-2 opacity-20" />
                <span className="text-sm">{t("illustration_placeholder")}</span>
              </div>
            )}
            
            {/* Category Badge Over Image */}
            <div className="absolute top-6 left-6">
              <span className="px-4 py-2 bg-primary text-white rounded-full text-sm font-bold shadow-lg">
                {categoryLabel}
              </span>
            </div>
          </div>

          <div className="p-6 md:p-10 max-w-3xl mx-auto">
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 mb-6 text-sm text-neutral-500 border-b border-neutral-100 pb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span>{t("published_on", { date: publishDate })}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <span>{t("by", { author: data.mairieEmettrice })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                <span>
                  {data.publicVise === 'tous' 
                    ? t("audience.tous") 
                    : data.publicVise === 'diaspora' 
                      ? t("audience.diaspora") 
                      : (data.publicCible || t("audience.cible"))
                  }
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6 leading-tight">
              {data.titre || t("default_title")}
            </h1>

            {/* Resume / Intro */}
            <div className="bg-neutral-50 p-6 rounded-xl border-l-4 border-primary mb-8 italic text-neutral-700 text-lg leading-relaxed">
              {data.resume || t("default_resume")}
            </div>

            {/* Content Detail */}
            <div className="prose prose-neutral max-w-none text-neutral-600 leading-relaxed whitespace-pre-wrap mb-10">
              {data.detail || t("default_detail")}
            </div>

            {/* Call to Action */}
            {data.appelActionTexte && (
              <div className="bg-primary/5 p-8 rounded-2xl border border-primary/20 flex flex-col items-center text-center mb-10">
                <h3 className="text-xl font-bold text-neutral-900 mb-4">{data.appelActionTexte}</h3>
                {data.appelActionUrl && (
                  <Bouton variant="primaire" size="large">
                    {data.appelActionUrl.startsWith('http') ? <LinkIcon className="w-5 h-5 mr-2" /> : null}
                    {t("cta_button")}
                  </Bouton>
                )}
              </div>
            )}

            {/* Tags */}
            {motsCles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-10 pt-6 border-t border-neutral-100">
                {motsCles.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Attachments Preview */}
            {(data.piecesJointes.length > 0 || (data.existingPiecesJointes && data.existingPiecesJointes.length > 0)) && (
              <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-200">
                <h4 className="text-sm font-bold text-neutral-900 mb-4 flex items-center gap-2">
                   <FileText className="w-4 h-4 text-primary" />
                   {t("attachments_title")}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.existingPiecesJointes?.map((path: string, i: number) => (
                    <div key={`existing-${i}`} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-neutral-100 text-sm">
                       <FileText className="w-5 h-5 text-neutral-400" />
                       <span className="truncate flex-1">{path.split('/').pop()}</span>
                    </div>
                  ))}
                  {data.piecesJointes?.map((file: File, i: number) => (
                    <div key={`new-${i}`} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-neutral-100 text-sm">
                       <FileText className="w-5 h-5 text-primary" />
                       <span className="truncate flex-1 font-medium">{file.name}</span>
                       <span className="text-[10px] text-neutral-400">{t("attachment_new")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-neutral-200 bg-neutral-50 flex justify-end gap-3">
          <Bouton variant="tertiaire" onClick={onClose}>{t("close")}</Bouton>
          <Bouton variant="primaire" onClick={onClose}>{t("continue_editing")}</Bouton>
        </div>
      </div>
    </div>
  );
};
