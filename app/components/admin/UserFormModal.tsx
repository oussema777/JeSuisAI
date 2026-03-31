'use client';

import {
  X, Eye, EyeOff, Loader2, Check, AlertCircle
} from 'lucide-react';
import { useTranslations } from 'next-intl';

interface UserFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  password?: string;
  annonceur_id?: string;
}

interface UserFormModalProps {
  mode: 'add' | 'edit';
  formData: UserFormData;
  setFormData: (data: UserFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  formLoading: boolean;
  formError: string;
  formSuccess: string;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  isSuperadmin?: boolean;
  annonceurs?: Array<{ id: string; nom: string }>;
}

export const UserFormModal = ({
  mode,
  formData,
  setFormData,
  onSubmit,
  onClose,
  formLoading,
  formError,
  formSuccess,
  showPassword,
  setShowPassword,
  isSuperadmin = false,
  annonceurs = [],
}: UserFormModalProps) => {
  const t = useTranslations('Admin.Settings.Team.UserForm');
  const tCommon = useTranslations('Common');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" role="dialog" aria-modal="true" aria-label={mode === 'add' ? t('title_add') : t('title_edit')}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-neutral-900" style={{ fontSize: '24px', fontWeight: 600 }}>
            {mode === 'add' ? t('title_add') : t('title_edit')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={onSubmit} className="p-6 space-y-5">
          {/* Success/Error in Modal */}
          {formSuccess && (
            <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-4 flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" strokeWidth={2} />
              <p className="text-green-700" style={{ fontSize: '14px', fontWeight: 600 }}>
                {formSuccess}
              </p>
            </div>
          )}

          {formError && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" strokeWidth={2} />
              <p className="text-red-700" style={{ fontSize: '14px', fontWeight: 600 }}>
                {formError}
              </p>
            </div>
          )}

          {/* First Name & Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
                {t('label_firstname')}
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border-2 border-neutral-300 focus:border-primary focus:outline-none"
                style={{ fontSize: '15px', fontWeight: 400 }}
                required
              />
            </div>
            <div>
              <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
                {t('label_lastname')}
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border-2 border-neutral-300 focus:border-primary focus:outline-none"
                style={{ fontSize: '15px', fontWeight: 400 }}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
              {t('label_email')}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border-2 border-neutral-300 focus:border-primary focus:outline-none"
              style={{ fontSize: '15px', fontWeight: 400 }}
              required
              disabled={mode === 'edit'}
            />
            {mode === 'edit' && (
              <p className="text-neutral-500 mt-1" style={{ fontSize: '13px', fontWeight: 400 }}>
                {t('email_edit_helper')}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
              {t('label_phone')}
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+237 XXX XX XX XX"
              className="w-full px-4 py-2.5 rounded-lg border-2 border-neutral-300 focus:border-primary focus:outline-none"
              style={{ fontSize: '15px', fontWeight: 400 }}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
              {mode === 'add' ? t('label_password_add') : t('label_password_edit')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 pr-12 rounded-lg border-2 border-neutral-300 focus:border-primary focus:outline-none"
                style={{ fontSize: '15px', fontWeight: 400 }}
                required={mode === 'add'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" strokeWidth={2} /> : <Eye className="w-5 h-5" strokeWidth={2} />}
              </button>
            </div>
            <p className="text-neutral-500 mt-1" style={{ fontSize: '13px', fontWeight: 400 }}>
              {mode === 'add' ? t('password_helper_add') : t('password_helper_edit')}
            </p>
          </div>

          {/* Role & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
                {t('label_role')}
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border-2 border-neutral-300 focus:border-primary focus:outline-none"
                style={{ fontSize: '15px', fontWeight: 400 }}
                required
              >
                <option value="Annonceur">Annonceur</option>
                <option value="Admin">Admin</option>
                {isSuperadmin && (
                  <>
                    <option value="Superadmin">Superadmin</option>
                    <option value="user">Utilisateur</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
                {t('label_status')}
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border-2 border-neutral-300 focus:border-primary focus:outline-none"
                style={{ fontSize: '15px', fontWeight: 400 }}
                required
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
          </div>

          {/* City/Annonceur Assignment (Only for Superadmin and relevant roles) */}
          {isSuperadmin && (formData.role === 'Admin' || formData.role === 'Annonceur') && (
            <div>
              <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
                {t('label_assignment')}
              </label>
              <select
                value={formData.annonceur_id || ''}
                onChange={(e) => setFormData({ ...formData, annonceur_id: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border-2 border-neutral-300 focus:border-primary focus:outline-none"
                style={{ fontSize: '15px', fontWeight: 400 }}
              >
                <option value="">{t('assignment_none')}</option>
                {annonceurs.map((a) => (
                  <option key={a.id} value={a.id}>{a.nom}</option>
                ))}
              </select>
              <p className="text-neutral-500 mt-1" style={{ fontSize: '13px', fontWeight: 400 }}>
                {t('assignment_helper')}
              </p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition-colors"
              style={{ fontSize: '15px', fontWeight: 600 }}
              disabled={formLoading}
            >
              {tCommon('cancel')}
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ fontSize: '15px', fontWeight: 600 }}
            >
              {formLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2} />
                  <span>{t('saving')}</span>
                </>
              ) : (
                <span>{mode === 'add' ? t('button_create') : t('button_update')}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
