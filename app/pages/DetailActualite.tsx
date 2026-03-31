'use client';

import React, { useState } from 'react';
import { Link } from '@/i18n/routing';
import { Calendar, Building2, Share2, Download, Facebook, Linkedin, Link2, Check } from 'lucide-react';
import { Bouton } from '../components/ds/Bouton';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { getPublicUrl } from '@/lib/supabase/storage';
import { useTranslations, useLocale } from 'next-intl';

export interface Actualite {
  id: string;
  created_at: string;
  titre: string;
  resume: string;
  detail: string;
  objet: string;
  statut_publication: string;
  public_vise: string;
  public_cible?: string;
  image_principale_path?: string;
  date_publication?: string;
  mairie_emettrice: string;
  pieces_jointes_paths?: string[];
  appel_action_texte?: string;
  appel_action_url?: string;
}

interface DetailActualiteProps {
  article: Actualite;
  announcerName: string;
}

export function DetailActualite({ article, announcerName }: DetailActualiteProps) {
  const t = useTranslations('Public.NewsDetail');
  const tCat = useTranslations('Admin.NewsForm.categories');
  const locale = useLocale();
  const [linkCopied, setLinkCopied] = useState(false);

  const getImageUrl = (path?: string) => {
    if (!path) return "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=1200";
    return getPublicUrl('actualites', path);
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = article.titre;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
        break;
    }
  };

  const categoryLabel = (() => {
    try {
      return tCat(article.objet) || article.objet;
    } catch (e) {
      return article.objet || "Actualité";
    }
  })();

  const publishDate = article.date_publication
    ? new Date(article.date_publication).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date(article.created_at).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-page-bg">
      {/* Main Content Section */}
      <div className="w-full">
        <div className="max-w-4xl mx-auto px-5 md:px-10 py-12">

          {/* News Header */}
          <div className="mb-8">
            <div className="mb-4">
              <span
                className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary"
                style={{ fontSize: '14px', fontWeight: 600 }}
              >
                {categoryLabel}
              </span>
            </div>

            <h1 className="text-neutral-900 mb-6" style={{ fontSize: '42px', lineHeight: '1.2', fontWeight: 600 }}>
              {article.titre}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-neutral-200">
              <button
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-primary" strokeWidth={2} />
                </div>
                <span className="text-neutral-700" style={{ fontSize: '15px', fontWeight: 500 }}>
                  {announcerName}
                </span>
              </button>

              <span className="text-neutral-400">•</span>

              <div className="flex items-center gap-2 text-neutral-600">
                <Calendar className="w-4 h-4" strokeWidth={2} />
                <span style={{ fontSize: '15px', fontWeight: 400 }}>
                  {locale === 'fr' ? `Publié le ${publishDate}` : `Published on ${publishDate}`}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-neutral-700" style={{ fontSize: '14px', fontWeight: 500 }}>
                {t('share_label')}
              </span>

              <button
                onClick={() => handleShare('whatsapp')}
                className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg hover:opacity-90 transition-opacity"
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                <Share2 className="w-4 h-4" strokeWidth={2} />
                WhatsApp
              </button>

              <button
                onClick={() => handleShare('facebook')}
                className="flex items-center gap-2 px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:opacity-90 transition-opacity"
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                <Facebook className="w-4 h-4" strokeWidth={2} fill="white" />
                Facebook
              </button>

              <button
                onClick={() => handleShare('linkedin')}
                className="flex items-center gap-2 px-4 py-2 bg-[#0A66C2] text-white rounded-lg hover:opacity-90 transition-opacity"
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                <Linkedin className="w-4 h-4" strokeWidth={2} fill="white" />
                LinkedIn
              </button>

              <button
                onClick={() => handleShare('copy')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  linkCopied
                    ? 'bg-green-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                {linkCopied ? (
                  <>
                    <Check className="w-4 h-4" strokeWidth={2} />
                    {t('copied')}
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4" strokeWidth={2} />
                    {t('copy_link')}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Featured Image */}
          <div className="mb-10">
            <div className="rounded-xl overflow-hidden shadow-sm">
              <ImageWithFallback
                src={getImageUrl(article.image_principale_path)}
                alt={article.titre}
                width={1200}
                height={675}
                className="w-full h-auto"
                style={{ aspectRatio: '16/9', objectFit: 'cover' }}
              />
            </div>
          </div>

          {/* Article Body */}
          <div className="prose prose-lg max-w-none">
            {/* Résumé */}
            <div className="mb-8 p-6 bg-neutral-50 rounded-xl border-l-4 border-primary italic">
              <p className="text-neutral-700" style={{ fontSize: '18px', lineHeight: '1.8', fontWeight: 500 }}>
                {article.resume}
              </p>
            </div>

            {/* Détail */}
            <div className="text-neutral-700 mb-10 whitespace-pre-line" style={{ fontSize: '17px', lineHeight: '1.8', fontWeight: 400 }}>
              {article.detail}
            </div>
          </div>

          {/* Attached Documents */}
          {article.pieces_jointes_paths && article.pieces_jointes_paths.length > 0 && (
            <div className="mt-12 mb-12 p-6 bg-neutral-50 rounded-xl border border-neutral-200">
              <h3 className="text-neutral-900 mb-4" style={{ fontSize: '20px', fontWeight: 600 }}>
                {t('attachments_title')}
              </h3>

              <div className="space-y-3">
                {article.pieces_jointes_paths.map((path, index) => {
                  const fileName = path.split('/').pop() || `Document ${index + 1}`;
                  const fileUrl = getPublicUrl('actualites', path);

                  return (
                    <a
                      key={index}
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-white rounded-lg border border-neutral-200 hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Download className="w-5 h-5 text-primary" strokeWidth={2} />
                        </div>
                        <div>
                          <p className="text-neutral-900 group-hover:text-primary transition-colors" style={{ fontSize: '15px', fontWeight: 500 }}>
                            {fileName}
                          </p>
                          <p className="text-neutral-500" style={{ fontSize: '13px', fontWeight: 400 }}>
                            {t('reference_document')}
                          </p>
                        </div>
                      </div>
                      <Download className="w-5 h-5 text-neutral-400 group-hover:text-primary transition-colors" strokeWidth={2} />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Call to Action */}
          {(article.appel_action_texte || article.appel_action_url) && (
            <div className="mt-12 mb-12 p-8 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
              <h3 className="text-neutral-900 mb-4" style={{ fontSize: '22px', fontWeight: 600 }}>
                {article.appel_action_texte || t('learn_more')}
              </h3>
              {article.appel_action_url && (
                <Bouton
                  variant="primaire"
                  size="moyen"
                  onClick={() => window.open(article.appel_action_url?.startsWith('http') ? article.appel_action_url : `https://${article.appel_action_url}`, '_blank')}
                >
                  {t('access_link')}
                </Bouton>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
