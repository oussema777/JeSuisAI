'use client';

import React, { useState } from 'react';
import {
  Camera,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Check,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations, useLocale } from 'next-intl';

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  photo_url: string | null;
  role: 'Admin' | 'Annonceur' | 'Superadmin';
  created_at: string;
  updated_at: string;
  email_preferences?: {
    new_applications: boolean;
    auto_reminders: boolean;
    weekly_summary: boolean;
    platform_updates: boolean;
  } | null;
}

interface MonCompteProps {
  userProfile: UserProfile;
  showPassword: any;
  setShowPassword: any;
  onProfileUpdate: () => void;
  supabase: any;
}

export function MonCompte({
  userProfile,
  showPassword,
  setShowPassword,
  onProfileUpdate,
  supabase,
}: MonCompteProps) {
  const t = useTranslations('Admin.Settings.Account');
  const locale = useLocale();
  const [hasChanges, setHasChanges] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Données du profil
  const [formData, setFormData] = useState({
    first_name: userProfile.first_name || '',
    last_name: userProfile.last_name || '',
    email: userProfile.email,
    phone: userProfile.phone || '',
  });

  // Mot de passe
  const [passwordData, setPasswordData] = useState({
    new: '',
    confirm: '',
  });

  // Préférences notifications
  const [preferences, setPreferences] = useState({
    new_applications: userProfile.email_preferences?.new_applications ?? true,
    auto_reminders: userProfile.email_preferences?.auto_reminders ?? true,
    weekly_summary: userProfile.email_preferences?.weekly_summary ?? true,
    platform_updates: userProfile.email_preferences?.platform_updates ?? false,
  });

  const markAsChanged = () => setHasChanges(true);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    markAsChanged();
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    if (field === 'new') {
      const hasUpper = /[A-Z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      const isLong = value.length >= 8;

      if (isLong && hasUpper && hasNumber && hasSpecial) {
        setPasswordStrength('strong');
      } else if (isLong && (hasUpper || hasNumber || hasSpecial)) {
        setPasswordStrength('medium');
      } else {
        setPasswordStrength('weak');
      }
    }
  };

  const handlePreferenceChange = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    markAsChanged();
  };

  const handleReset = () => {
    setFormData({
      first_name: userProfile.first_name || '',
      last_name: userProfile.last_name || '',
      email: userProfile.email,
      phone: userProfile.phone || '',
    });
    setPasswordData({ new: '', confirm: '' });
    setPasswordStrength('weak');
    setPreferences({
      new_applications: userProfile.email_preferences?.new_applications ?? true,
      auto_reminders: userProfile.email_preferences?.auto_reminders ?? true,
      weekly_summary: userProfile.email_preferences?.weekly_summary ?? true,
      platform_updates: userProfile.email_preferences?.platform_updates ?? false,
    });
    setHasChanges(false);
  };

  const handleSaveProfileAndPreferences = async () => {
    try {
      setSaving(true);
      const updates = {
        first_name: formData.first_name.trim() || null,
        last_name: formData.last_name.trim() || null,
        phone: formData.phone.trim() || null,
        email_preferences: {
          new_applications: preferences.new_applications,
          auto_reminders: preferences.auto_reminders,
          weekly_summary: preferences.weekly_summary,
          platform_updates: preferences.platform_updates,
        },
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userProfile.id);

      if (error) throw error;

      setHasChanges(false);
      onProfileUpdate();
      toast.success(t('toast_success'));
    } catch (err: any) {
      console.error('Erreur sauvegarde:', err);
      toast.error(t('toast_error'));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast.warning(t('toast_password_match'));
      return;
    }
    if (passwordData.new.length < 8) {
      toast.warning(t('toast_password_length'));
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new,
      });

      if (error) throw error;

      setPasswordData({ new: '', confirm: '' });
      setPasswordStrength('weak');
      toast.success(t('toast_password_success'));
    } catch (err: any) {
      console.error(err);
      toast.error(t('toast_password_error'));
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.warning(t('toast_photo_error'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.warning(t('toast_photo_error')); // Or specific size error if added
      return;
    }

    try {
      setUploadingAvatar(true);
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${userProfile.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatar')
        .upload(path, file, { upsert: true });

      if (uploadError && !uploadError.message.includes('duplicate')) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('avatar').getPublicUrl(path);
      const publicUrl = data.publicUrl;

      await supabase
        .from('profiles')
        .update({ photo_url: publicUrl })
        .eq('id', userProfile.id);

      onProfileUpdate();
      toast.success(t('toast_photo_success'));
    } catch (err) {
      console.error(err);
      toast.error(t('toast_photo_error'));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!userProfile.photo_url || !confirm(t('confirm_photo_delete'))) return;

    try {
      setUploadingAvatar(true);
      const { data: files } = await supabase.storage
        .from('avatar')
        .list(`${userProfile.id}/`);

      if (files?.length) {
        const paths = files.map((f: any) => `${userProfile.id}/${f.name}`);
        await supabase.storage.from('avatar').remove(paths);
      }

      await supabase
        .from('profiles')
        .update({ photo_url: null })
        .eq('id', userProfile.id);

      onProfileUpdate();
      toast.success(t('toast_photo_deleted'));
    } catch (err) {
      console.error(err);
      toast.error(t('toast_photo_error'));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const initials = `${formData.first_name?.[0] || ''}${formData.last_name?.[0] || ''}`.toUpperCase() || 'MM';

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-neutral-900 mb-2" style={{ fontSize: '25px', fontWeight: 600 }}>
          {t('title')}
        </h2>
        <p className="text-neutral-600" style={{ fontSize: '15px', fontWeight: 400 }}>
          {t('subtitle')}
        </p>
      </div>
      <div className="h-px bg-neutral-200 mb-8" />

      {/* Photo + Nom + Rôle */}
      <div className="flex items-center gap-8 mb-10">
        <div className="relative w-[120px] h-[120px] rounded-full border-4 border-neutral-200 bg-primary text-white flex items-center justify-center shadow-md overflow-hidden">
          {userProfile.photo_url ? (
            <img src={userProfile.photo_url} alt="Profil" className="w-full h-full object-cover" />
          ) : (
            <span style={{ fontSize: '32px', fontWeight: 600 }}>{initials}</span>
          )}
          {uploadingAvatar && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-neutral-900" style={{ fontSize: '20px', fontWeight: 600 }}>
            {formData.first_name} {formData.last_name}
          </h3>
          <div className="inline-block px-3.5 py-1.5 bg-primary/15 text-primary rounded-md w-fit">
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{userProfile.role}</span>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={uploadingAvatar}
            />
            <label
              htmlFor="avatar-upload"
              className={`h-10 px-5 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 flex items-center gap-2 cursor-pointer transition-colors ${
                uploadingAvatar ? 'opacity-50 pointer-events-none' : ''
              }`}
              style={{ fontSize: '14px', fontWeight: 500 }}
            >
              <Camera className="w-4 h-4" strokeWidth={2} />
              {uploadingAvatar ? t('photo_uploading') : t('photo_change')}
            </label>
            {userProfile.photo_url && (
              <button
                onClick={handleDeletePhoto}
                disabled={uploadingAvatar}
                className={`text-red-600 hover:text-red-800 transition-colors ${
                  uploadingAvatar ? 'opacity-50 pointer-events-none' : ''
                }`}
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                {t('photo_delete')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Informations personnelles */}
      <div className="mb-10">
        <h4 className="text-neutral-900 mb-6" style={{ fontSize: '18px', fontWeight: 600 }}>
          {t('section_personal')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
              {t('first_name')}
            </label>
            <input
              type="text"
              value={formData.first_name}
              onChange={e => handleInputChange('first_name', e.target.value)}
              className="w-full h-12 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ fontSize: '16px' }}
            />
          </div>
          <div>
            <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
              {t('last_name')}
            </label>
            <input
              type="text"
              value={formData.last_name}
              onChange={e => handleInputChange('last_name', e.target.value)}
              className="w-full h-12 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ fontSize: '16px' }}
            />
          </div>
          <div>
            <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
              {t('email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-4 inset-y-0 my-auto h-5 w-5 text-neutral-400 pointer-events-none" />
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full h-12 pl-12 pr-4 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-600 cursor-not-allowed"
                style={{ fontSize: '16px' }}
              />
            </div>
            <p className="text-neutral-500 mt-2 text-sm">{t('email_helper')}</p>
          </div>
          <div>
            <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
              {t('phone')}
            </label>
            <div className="relative">
              <Phone className="absolute left-4 inset-y-0 my-auto w-5 h-5 text-neutral-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={e => handleInputChange('phone', e.target.value)}
                className="w-full h-12 pl-12 pr-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                style={{ fontSize: '16px' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sécurité – mot de passe */}
      <div className="mb-10">
        <h4 className="text-neutral-900 mb-4" style={{ fontSize: '18px', fontWeight: 600 }}>
          {t('section_security')}
        </h4>
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6 flex gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-neutral-800 text-sm">
            {t('security_helper')}
          </p>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
              {t('password_new')}
            </label>
            <div className="relative">
              <Lock className="absolute left-4 inset-y-0 my-auto w-5 h-5 text-neutral-400" />
              <input
                type={showPassword.new ? 'text' : 'password'}
                value={passwordData.new}
                onChange={e => handlePasswordChange('new', e.target.value)}
                placeholder={t('password_placeholder')}
                className="w-full h-12 pl-12 pr-12 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s: any) => ({ ...s, new: !s.new }))}
                className="absolute right-4 inset-y-0 my-auto text-neutral-500 hover:text-neutral-700"
                aria-label={showPassword.new ? t('password_hide') : t('password_show')}
              >
                {showPassword.new ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {passwordData.new && (
              <div className="mt-3">
                <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      passwordStrength === 'weak' ? 'w-1/3 bg-red-500' :
                      passwordStrength === 'medium' ? 'w-3/4 bg-orange-500' :
                      'w-full bg-green-500'
                    }`}
                  />
                </div>
                <p className={`text-xs mt-1.5 font-medium ${
                  passwordStrength === 'weak' ? 'text-red-600' :
                  passwordStrength === 'medium' ? 'text-orange-600' :
                  'text-green-600'
                }`}>
                  {t(`password_strength.${passwordStrength}`)}
                </p>
              </div>
            )}
          </div>
          <div>
            <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
              {t('password_confirm')}
            </label>
            <div className="relative">
              <Lock className="absolute left-4 inset-y-0 my-auto w-5 h-5 text-neutral-400" />
              <input
                type={showPassword.confirm ? 'text' : 'password'}
                value={passwordData.confirm}
                onChange={e => handlePasswordChange('confirm', e.target.value)}
                placeholder={t('password_placeholder')}
                className="w-full h-12 pl-12 pr-12 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s: any) => ({ ...s, confirm: !s.confirm }))}
                className="absolute right-4 inset-y-0 my-auto text-neutral-500 hover:text-neutral-700"
                aria-label={showPassword.confirm ? t('password_hide') : t('password_show')}
              >
                {showPassword.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <div className="text-sm text-neutral-600 mt-2">
            <p className="mb-2">{t('password_requirements.title')}</p>
            <ul className="space-y-1">
              <li className="flex items-center gap-2">
                <Check size={16} className={passwordData.new.length >= 8 ? "text-green-600" : "text-neutral-300"} />
                {t('password_requirements.min_chars')}
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className={/[A-Z]/.test(passwordData.new) ? "text-green-600" : "text-neutral-300"} />
                {t('password_requirements.uppercase')}
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className={/[0-9]/.test(passwordData.new) ? "text-green-600" : "text-neutral-300"} />
                {t('password_requirements.number')}
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className={/[!@#$%^&*(),.?":{}|<>]/.test(passwordData.new) ? "text-green-600" : "text-neutral-300"} />
                {t('password_requirements.special')}
              </li>
            </ul>
          </div>
          <button
            onClick={handleUpdatePassword}
            disabled={saving || !passwordData.new || passwordData.new !== passwordData.confirm}
            className="mt-4 h-11 px-6 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontSize: '14px', fontWeight: 500 }}
          >
            {saving ? t('password_updating') : t('password_update_button')}
          </button>
        </div>
      </div>

      {/* Préférences */}
      <div className="mb-10">
        <h4 className="text-neutral-900 mb-4" style={{ fontSize: '18px', fontWeight: 600 }}>
          {t('section_preferences')}
        </h4>
        <p className="text-neutral-700 mb-4" style={{ fontSize: '15px', fontWeight: 500 }}>
          {t('notif_email')}
        </p>
        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.new_applications}
              onChange={() => handlePreferenceChange('new_applications')}
              className="w-5 h-5 mt-0.5 rounded border-2 border-neutral-300 text-primary focus:ring-primary"
            />
            <div>
              <div className="text-neutral-900" style={{ fontSize: '14px', fontWeight: 500 }}>
                {t('pref_new_apps')}
              </div>
              <div className="text-neutral-500 text-sm">
                {t('pref_new_apps_desc')}
              </div>
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.auto_reminders}
              onChange={() => handlePreferenceChange('auto_reminders')}
              className="w-5 h-5 mt-0.5 rounded border-2 border-neutral-300 text-primary focus:ring-primary"
            />
            <div>
              <div className="text-neutral-900" style={{ fontSize: '14px', fontWeight: 500 }}>
                {t('pref_reminders')}
              </div>
              <div className="text-neutral-500 text-sm">
                {t('pref_reminders_desc')}
              </div>
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.weekly_summary}
              onChange={() => handlePreferenceChange('weekly_summary')}
              className="w-5 h-5 mt-0.5 rounded border-2 border-neutral-300 text-primary focus:ring-primary"
            />
            <div>
              <div className="text-neutral-900" style={{ fontSize: '14px', fontWeight: 500 }}>
                {t('pref_summary')}
              </div>
              <div className="text-neutral-500 text-sm">
                {t('pref_summary_desc')}
              </div>
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.platform_updates}
              onChange={() => handlePreferenceChange('platform_updates')}
              className="w-5 h-5 mt-0.5 rounded border-2 border-neutral-300 text-primary focus:ring-primary"
            />
            <div>
              <div className="text-neutral-900" style={{ fontSize: '14px', fontWeight: 500 }}>
                {t('pref_updates')}
              </div>
              <div className="text-neutral-500 text-sm">
                {t('pref_updates_desc')}
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-6 mt-8 border-t border-neutral-200 bg-neutral-50 -mx-12 -mb-12 px-12 py-5 rounded-b-xl">
        <span className="text-neutral-600 text-sm">
          {t('last_modified', {
            date: new Date(userProfile.updated_at).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })
          })}
        </span>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <button
              onClick={handleReset}
              className="h-11 px-6 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
              style={{ fontSize: '14px', fontWeight: 500 }}
            >
              {t('reset')}
            </button>
          )}
          <button
            onClick={handleSaveProfileAndPreferences}
            disabled={!hasChanges || saving}
            className={`h-11 px-7 rounded-lg text-white flex items-center gap-2 transition-colors ${
              hasChanges && !saving ? 'bg-primary hover:bg-primary/90' : 'bg-neutral-300 cursor-not-allowed'
            }`}
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
            <Save className="w-5 h-5" strokeWidth={2} />
            {saving ? t('saving') : t('save_changes')}
          </button>
        </div>
      </div>
    </div>
  );
}
