// app/api/upload/route.ts
// Server-side file upload validation + proxy to Supabase Storage

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Allowed MIME types mapped to their valid extensions
const ALLOWED_TYPES: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Only allow uploads to these specific buckets
const ALLOWED_BUCKETS = [
  'fichiers-candidatures',
  'fichiers-projets',
  'fichiers-profils',
];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const bucket = formData.get('bucket') as string | null;
    const folder = formData.get('folder') as string | null;

    if (!file || !bucket || !folder) {
      return NextResponse.json(
        { error: 'Missing required fields: file, bucket, folder' },
        { status: 400 }
      );
    }

    // Validate bucket
    if (!ALLOWED_BUCKETS.includes(bucket)) {
      return NextResponse.json(
        { error: 'Invalid storage bucket' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10 MB.' },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: 'Empty file not allowed' },
        { status: 400 }
      );
    }

    // Validate MIME type
    const allowedExtensions = ALLOWED_TYPES[file.type];
    if (!allowedExtensions) {
      return NextResponse.json(
        { error: `File type "${file.type}" is not allowed` },
        { status: 400 }
      );
    }

    // Validate file extension matches MIME type
    const fileName = file.name.toLowerCase();
    const ext = '.' + (fileName.split('.').pop() || '');
    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json(
        { error: `File extension "${ext}" does not match content type "${file.type}"` },
        { status: 400 }
      );
    }

    // Generate safe file path
    const safeFileName = `${Date.now()}_${Math.random().toString(36).substring(2)}${ext}`;
    const filePath = `${folder}/${safeFileName}`;

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Supabase Storage via admin client
    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json(
        { error: 'Upload failed' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      fileName: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
