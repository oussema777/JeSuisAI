'use client';
import React from 'react';
import { Home, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Bouton } from '../components/ds/Bouton';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

export default function SuccesSoumission() {
  const t = useTranslations('Success');
  const tNav = useTranslations('Navigation');
  const params = useParams();
  const currentLocale = params.locale as string || 'fr';
  const searchParams = useSearchParams();
  
  const type = searchParams.get('type') || 'candidature';
  const opportunityTitle = searchParams.get('opportunityTitle') || '';
  const fullName = searchParams.get('userName') || '';
  const userEmail = searchParams.get('userEmail') || '';

  const getTitle = () => {
    if (type === 'projet') return t('transmitted_project');
    if (type === 'profil') return t('transmitted_profile');
    return t('transmitted');
  };

  const getMessage = () => {
    if (type === 'projet') return t('received_msg_project');
    if (type === 'profil') return t('received_msg_profile');
    return t('received_msg', { title: opportunityTitle || 'Action' });
  };

  const submissionDateFormatted = new Date().toLocaleString(currentLocale === 'en' ? 'en-US' : 'fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const detailsRecap = [
    { label: t('details.name'), valeur: fullName },
    { label: t('details.email'), valeur: userEmail },
    { label: t('details.date'), valeur: submissionDateFormatted },
  ];

  if (type === 'candidature' && opportunityTitle) {
    detailsRecap.unshift({ label: t('details.action'), valeur: opportunityTitle });
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-page-bg py-12 px-5">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-sm border border-neutral-100 p-8 md:p-12 text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-500" strokeWidth={2} />
          </div>
        </div>

        {/* Main Title */}
        <h1 className="text-neutral-900 mb-4 font-bold text-3xl md:text-4xl">
          {t('thanks')}
        </h1>

        {/* Subtitle / Status */}
        <h2 className="text-primary font-semibold text-xl mb-6">
          {getTitle()}
        </h2>

        {/* Description Message */}
        <p className="text-neutral-600 mb-10 text-lg leading-relaxed max-w-lg mx-auto">
          {getMessage()}
        </p>

        {/* Simplified Recap Card */}
        <div className="mb-10 text-left max-w-md mx-auto bg-neutral-50 rounded-xl p-6 border border-neutral-100">
          <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4">
            {t('recap_title')}
          </h3>
          <div className="space-y-3">
            {detailsRecap.map((detail, index) => (
              detail.valeur && (
                <div key={index} className="flex justify-between items-start gap-4 text-sm">
                  <span className="text-neutral-500 shrink-0">{detail.label}</span>
                  <span className="text-neutral-800 font-medium text-right">{detail.valeur}</span>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <Link href="/" className="w-full sm:w-auto">
            <Bouton variant="secondaire" className="w-full justify-center gap-2">
              <Home className="w-4 h-4" />
              {t('back_home')}
            </Bouton>
          </Link>

          {type === 'projet' && (
            <Link href="/soumettre-projet" className="w-full sm:w-auto">
              <Bouton variant="primaire" className="w-full justify-center gap-2">
                {tNav('submit_project')}
                <ArrowRight className="w-4 h-4" />
              </Bouton>
            </Link>
          )}

          {type === 'profil' && (
            <Link href="/missions" className="w-full sm:w-auto">
              <Bouton variant="primaire" className="w-full justify-center gap-2">
                {tNav('find_mission')}
                <ArrowRight className="w-4 h-4" />
              </Bouton>
            </Link>
          )}

          {type === 'candidature' && (
            <Link href="/missions" className="w-full sm:w-auto">
              <Bouton variant="primaire" className="w-full justify-center gap-2">
                {tNav('find_mission')}
                <ArrowRight className="w-4 h-4" />
              </Bouton>
            </Link>
          )}
        </div>

        {/* Simple Footer Note */}
        <div className="mt-12 pt-8 border-t border-neutral-100">
          <p className="text-neutral-400 text-sm">
            {currentLocale === 'en' 
              ? "Need help? Contact our support at" 
              : "Besoin d'aide ? Contactez notre support à"}{' '}
            <a href="mailto:contact@jesuisaucameroun.com" className="text-primary hover:underline font-medium">
              contact@jesuisaucameroun.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
