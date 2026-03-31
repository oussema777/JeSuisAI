import React from 'react';
import { Lightbulb } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function EncartConseilsActualite() {
  const t = useTranslations('Admin.NewsForm.tips');
  
  // Try to get items as an array from translations
  // If not possible, fallback to hardcoded French (or handle it via mapping)
  const tipsKeys = ['0', '1', '2', '3', '4', '5', '6', '7'];

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 sticky top-24">
      <div className="flex items-center gap-3 mb-4">
        <Lightbulb className="w-5 h-5 text-primary" strokeWidth={2} />
        <h4 className="text-neutral-900" style={{ fontSize: '15px', fontWeight: 600 }}>
          {t('title')}
        </h4>
      </div>
      
      <ul className="space-y-3">
        {tipsKeys.map((key) => (
          <li
            key={key}
            className="flex items-start gap-2 text-neutral-700"
            style={{ fontSize: '14px', fontWeight: 400, lineHeight: '1.5' }}
          >
            <span className="text-primary mt-0.5 flex-shrink-0">•</span>
            <span>{t(`items.${key}`)}</span>
          </li>
        ))}
      </ul>
      
      <div className="mt-4 pt-4 border-t border-primary/10">
        <p className="text-neutral-600 text-xs italic">
          {t('footer')}
        </p>
      </div>
    </div>
  );
}