import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// Public paths that don't require authentication (without locale prefix)
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/a-propos",
  "/comment-ca-marche",
  "/missions",
  "/actualites",
  "/contact",
  "/mentions-legales",
  "/protection-donnees",
  "/premiere-visite",
  "/soumettre-profil",
  "/soumettre-projet",
  "/succes-soumission",
];

// API routes that are publicly accessible (no auth required)
const PUBLIC_API_PATHS = [
  "/api/cron/", // Cron jobs authenticate via CRON_SECRET header
];

// Check if a path is public or matches public patterns
function isPublicPath(pathname: string): boolean {
  // Strip locale prefix if present
  let path = pathname;
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length > 0 && ['en', 'fr'].includes(parts[0])) {
    path = '/' + parts.slice(1).join('/');
  }

  // Exact match
  if (PUBLIC_PATHS.includes(path)) return true;

  // Dynamic routes patterns
  if (path.startsWith("/missions/")) return true;
  if (path.startsWith("/actualites/")) return true;
  if (path.startsWith("/fiche-ville/")) return true;
  if (path.startsWith("/postuler/")) return true;
  if (path.startsWith("/_next")) return true;

  // Only specific API routes are public (cron uses its own auth)
  if (PUBLIC_API_PATHS.some(p => path.startsWith(p))) return true;

  return false;
}

export async function middleware(request: NextRequest) {
  // 1. Run next-intl middleware first to handle localization
  const response = intlMiddleware(request);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          // Note: Since we're using the response from intlMiddleware, 
          // we need to set the cookies on it as well.
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: This refreshes the session if it's expired.
  let user = null;
  try {
    const { data, error: authError } = await supabase.auth.getUser();
    if (authError) {
      if (authError.message.includes('Refresh Token Not Found') || authError.message.includes('invalid_grant')) {
        console.warn("Middleware: Invalid session detected, clearing cookies");
        await supabase.auth.signOut();
      }
    } else {
      user = data.user;
    }
  } catch (error: any) {
    console.error("Middleware Auth Exception:", error);
    if (error?.message?.includes('Refresh Token Not Found') || error?.message?.includes('invalid_grant')) {
      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        console.error('Middleware sign-out error:', signOutError);
      }
    }
  }

  const pathname = request.nextUrl.pathname;
  const parts = pathname.split('/').filter(Boolean);
  const locale = parts.length > 0 && ['en', 'fr'].includes(parts[0]) ? parts[0] : 'fr';
  
  // Get path without locale for checks
  const pathWithoutLocale = parts.length > 0 && ['en', 'fr'].includes(parts[0]) 
    ? '/' + parts.slice(1).join('/') 
    : pathname;

  // 2. Allow public paths
  if (isPublicPath(pathname)) {
    return finalizeResponse(request, response);
  }

  // 3. Check authentication for protected paths
  if (!user) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("redirect_to", pathname);
    
    // Create the redirect response
    const redirectResponse = NextResponse.redirect(loginUrl);

    // Copy cookies from the intl response to the redirect response
    response.cookies.getAll().forEach(({ name, value, ...options }) => {
      redirectResponse.cookies.set(name, value, options);
    });

    return redirectResponse;
  }

  // 4. Admin/Superadmin role checks
  if (pathWithoutLocale.startsWith("/admin") || pathWithoutLocale.startsWith("/superadmin")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;

    if (pathWithoutLocale.startsWith("/superadmin") && role !== "Superadmin") {
      const redirectResponse = NextResponse.redirect(new URL(`/${locale}`, request.url));
      response.cookies.getAll().forEach(({ name, value, ...options }) => {
        redirectResponse.cookies.set(name, value, options);
      });
      return redirectResponse;
    }

    if (pathWithoutLocale.startsWith("/admin") && !["Admin", "Superadmin", "Annonceur"].includes(role)) {
      const redirectResponse = NextResponse.redirect(new URL(`/${locale}`, request.url));
      response.cookies.getAll().forEach(({ name, value, ...options }) => {
        redirectResponse.cookies.set(name, value, options);
      });
      return redirectResponse;
    }
  }

  return finalizeResponse(request, response);
}

function finalizeResponse(_request: NextRequest, response: NextResponse) {
  return response;
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - /api (unless it starts with /api/actions or /api/cron etc if you want to localize them, usually not)
    // - /_next (Next.js internals)
    // - /_vercel (Vercel internals)
    // - /static, /favicon.ico, etc. (static files)
    "/((?!api|_next|_vercel|.*\\..*).*)",
    // Optional: Match all API routes that should be handled by the middleware
    "/api/actions/:path*"
  ],
};

