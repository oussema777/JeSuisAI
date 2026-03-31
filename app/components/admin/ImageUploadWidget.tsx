'use client';

import React, { useState } from 'react';
import { Upload, Image as ImageIcon, User } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface ImageUploadWidgetProps {
  label: string;
  currentUrl: string | null | undefined;
  bucket: string;
  pathPrefix: string;
  userId: string;
  supabase: any;
  maxSizeMB: number;
  onUploadComplete: (publicUrl: string) => void;
  disabled: boolean;
  previewClassName?: string;
  previewStyle?: React.CSSProperties;
  placeholderIcon?: 'image' | 'user';
  inputId: string;
}

export const ImageUploadWidget = ({
  label,
  currentUrl,
  bucket,
  pathPrefix,
  userId,
  supabase,
  maxSizeMB,
  onUploadComplete,
  disabled,
  previewClassName = 'w-35 h-35',
  previewStyle,
  placeholderIcon = 'image',
  inputId,
}: ImageUploadWidgetProps) => {
  const t = useTranslations('Common.image_upload');
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('select_image'));
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(t('size_error', { size: maxSizeMB }));
      return;
    }

    try {
      setUploading(true);
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
      const timestamp = Date.now();
      const path = `${userId}/${pathPrefix}_${timestamp}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onUploadComplete(data.publicUrl);
    } catch (error) {
      console.error(`Error uploading ${pathPrefix}:`, error);
      toast.error(t('upload_error'));
    } finally {
      setUploading(false);
    }
  };

  const PlaceholderIcon = placeholderIcon === 'user' ? User : ImageIcon;

  return (
    <div>
      <label className="block text-neutral-900 mb-3" style={{ fontSize: '14px', fontWeight: 500 }}>
        {label}
      </label>
      <div className="flex items-start gap-8">
        <div
          className={`relative border-2 border-dashed border-neutral-300 rounded-xl bg-neutral-50 flex items-center justify-center shadow-sm overflow-hidden ${previewClassName}`}
          style={previewStyle}
        >
          {currentUrl ? (
            <img
              src={currentUrl}
              alt={pathPrefix}
              className={`w-full h-full ${placeholderIcon === 'image' && previewClassName?.includes('h-40') ? 'object-cover' : 'object-contain p-2'}`}
            />
          ) : (
            <PlaceholderIcon className="w-12 h-12 text-neutral-300" strokeWidth={1.5} />
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full" />
            </div>
          )}
        </div>

        {!disabled && (
          <div className="flex flex-col gap-3">
            <input
              type="file"
              id={inputId}
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
            <label
              htmlFor={inputId}
              className={`h-11 px-6 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 cursor-pointer ${
                uploading ? 'opacity-50 pointer-events-none' : ''
              }`}
              style={{ fontSize: '14px', fontWeight: 600 }}
            >
              <Upload className="w-4.5 h-4.5" strokeWidth={2} />
              {uploading ? t('uploading') : t('upload')}
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
