/**
 * Generate a public URL for a Supabase storage object.
 * Works in both server and client components (no Supabase client needed).
 */
export function getPublicUrl(bucket: string, path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}
