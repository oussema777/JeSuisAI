'use client';

import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface DeleteConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const DeleteConfirmModal = ({
  onConfirm,
  onCancel,
  loading,
}: DeleteConfirmModalProps) => {
  const t = useTranslations('Admin.Settings.Team.DeleteConfirm');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[150] p-4" role="dialog" aria-modal="true" aria-label={t('modal_title')}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-accent" strokeWidth={2} />
        </div>
        <h3 className="text-neutral-900 text-center mb-2" style={{ fontSize: '20px', fontWeight: 600 }}>
          {t('title')}
        </h3>
        <p className="text-neutral-600 text-center mb-6" style={{ fontSize: '15px', fontWeight: 400 }}>
          {t('body')}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition-colors"
            style={{ fontSize: '15px', fontWeight: 600 }}
            disabled={loading}
          >
            {t('button_cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-accent text-white rounded-lg hover:bg-red-700 transition-colors"
            style={{ fontSize: '15px', fontWeight: 600 }}
            disabled={loading}
          >
            {t('button_confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};
