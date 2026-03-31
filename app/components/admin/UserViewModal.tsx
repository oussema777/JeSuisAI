'use client';

import { X, Edit } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  photo_url: string | null;
  role: string;
  status: string | null;
  created_at: string;
  updated_at: string;
}

interface UserViewModalProps {
  user: UserProfile;
  onClose: () => void;
  onEdit: () => void;
  getRoleBadgeColor: (role: string) => string;
  getStatusBadgeColor: (status: string | null) => string;
}

export const UserViewModal = ({
  user,
  onClose,
  onEdit,
  getRoleBadgeColor,
  getStatusBadgeColor,
}: UserViewModalProps) => {
  const t = useTranslations('Admin.Settings.Team.UserView');
  const locale = useLocale();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" role="dialog" aria-modal="true" aria-label={t('title')}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-4 flex items-center justify-between">
          <h2 style={{ fontSize: '24px', fontWeight: 600 }}>
            {t('title')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label={t('button_close')}
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* User Avatar & Name */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              {user.photo_url ? (
                <img src={user.photo_url} alt={`Photo de ${user.first_name || ''} ${user.last_name || ''}`} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-primary" style={{ fontSize: '24px', fontWeight: 600 }}>
                  {((user.first_name?.[0] || '') + (user.last_name?.[0] || '')).toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-neutral-900" style={{ fontSize: '20px', fontWeight: 600 }}>
                {`${user.first_name || ''} ${user.last_name || ''}`.trim() || (locale === 'fr' ? 'Sans nom' : 'No name')}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-3 py-1 rounded-full ${getRoleBadgeColor(user.role)}`} style={{ fontSize: '13px', fontWeight: 600 }}>
                  {user.role}
                </span>
                <span className={`px-3 py-1 rounded-full ${getStatusBadgeColor(user.status)}`} style={{ fontSize: '13px', fontWeight: 600 }}>
                  {user.status || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* User Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <p className="text-neutral-500 mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>
                {t('label_email')}
              </p>
              <p className="text-neutral-900" style={{ fontSize: '15px', fontWeight: 500 }}>
                {user.email}
              </p>
            </div>
            <div>
              <p className="text-neutral-500 mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>
                {t('label_phone')}
              </p>
              <p className="text-neutral-900" style={{ fontSize: '15px', fontWeight: 500 }}>
                {user.phone || t('phone_none')}
              </p>
            </div>
            <div>
              <p className="text-neutral-500 mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>
                {t('label_id')}
              </p>
              <p className="text-neutral-900 font-mono" style={{ fontSize: '13px', fontWeight: 500 }}>
                {user.id}
              </p>
            </div>
            <div>
              <p className="text-neutral-500 mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>
                {t('label_created')}
              </p>
              <p className="text-neutral-900" style={{ fontSize: '15px', fontWeight: 500 }}>
                {new Date(user.created_at).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div>
              <p className="text-neutral-500 mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>
                {t('label_updated')}
              </p>
              <p className="text-neutral-900" style={{ fontSize: '15px', fontWeight: 500 }}>
                {new Date(user.updated_at).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-neutral-200">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition-colors"
              style={{ fontSize: '15px', fontWeight: 600 }}
            >
              {t('button_close')}
            </button>
            <button
              onClick={onEdit}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
              style={{ fontSize: '15px', fontWeight: 600 }}
            >
              <Edit className="w-5 h-5" strokeWidth={2} />
              <span>{t('button_edit')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
