import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export function getMissionUrl(title: string, id: string): string {
  return `/missions/${slugify(title)}-${id}`;
}

export function extractIdFromSlug(slug: string): string {
  // If it's a UUID already (fallback)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(slug)) return slug;

  // Otherwise extract the ID at the end (last 36 chars if UUID)
  const parts = slug.split('-');
  if (parts.length >= 5) {
    // Check if the last 5 parts form a UUID
    const potentialId = parts.slice(-5).join('-');
    if (uuidRegex.test(potentialId)) return potentialId;
  }
  
  // Return original if no match (might be a simple ID or the UUID itself)
  return slug;
}
