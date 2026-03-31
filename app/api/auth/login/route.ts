// app/api/auth/login/route.ts
// Server-side login proxy with brute-force protection via rate limiting

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    // Rate limit by IP: 5 attempts per 15 minutes
    const ipRl = checkRateLimit(`login-ip:${ip}`, { maxRequests: 5, windowSeconds: 900 });
    if (!ipRl.allowed) return rateLimitResponse(ipRl.resetAt);

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
    }

    // Also rate limit per email: 5 attempts per 15 minutes (prevents credential stuffing)
    const emailRl = checkRateLimit(`login-email:${email.toLowerCase()}`, { maxRequests: 5, windowSeconds: 900 });
    if (!emailRl.allowed) return rateLimitResponse(emailRl.resetAt);

    // Authenticate via Supabase Admin
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: 'Invalid login credentials' },
        { status: 401 }
      );
    }

    if (!data.user || !data.session) {
      return NextResponse.json(
        { error: 'Aucun utilisateur trouvé' },
        { status: 401 }
      );
    }

    // Fetch user role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profil utilisateur introuvable' },
        { status: 401 }
      );
    }

    // Only allow admin roles
    if (!['Admin', 'Superadmin', 'Annonceur'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé. Ce portail est réservé aux administrateurs.' },
        { status: 403 }
      );
    }

    // Return session tokens so the client can set the session
    return NextResponse.json({
      success: true,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      },
      role: profile.role,
    });
  } catch (error: unknown) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
