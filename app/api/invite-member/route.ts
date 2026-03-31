// app/api/invite-member/route.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { escapeHtml } from '@/lib/utils';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { transporter } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, phone, role, password, sendWelcome } = await req.json();

    // Validation
    if (!firstName || !lastName || !email || !role || !password) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      );
    }

    // Validate password
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['Admin', 'Annonceur', 'Superadmin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Rôle invalide' },
        { status: 400 }
      );
    }

    // Get the current user's session to retrieve their annonceur_id
    const cookieStore = await cookies();
    
    // Create a server client with the user's session
    const supabaseUser = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    // Validate user server-side (getUser() validates JWT, unlike getSession())
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Non autorisé - session invalide' },
        { status: 401 }
      );
    }

    // Get the current user's profile to retrieve their annonceur_id
    const { data: currentUserProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('annonceur_id, role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching current user profile:', profileError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération du profil utilisateur' },
        { status: 500 }
      );
    }

    // Verify the current user is an Admin or Superadmin
    if (!['Admin', 'Superadmin'].includes(currentUserProfile.role)) {
      return NextResponse.json(
        { error: 'Non autorisé - privilèges insuffisants' },
        { status: 403 }
      );
    }

    // Rate limit: 5 invitations per minute per user
    const rl = checkRateLimit(`invite-member:${user.id}`, { maxRequests: 5, windowSeconds: 60 });
    if (!rl.allowed) return rateLimitResponse(rl.resetAt);

    // Inherit annonceur_id from the current user's profile
    let inheritedAnnonceurId = currentUserProfile.annonceur_id;

    // Fallback: if the admin has no annonceur_id, try to find it from their missions
    if (!inheritedAnnonceurId) {
      const { data: mission } = await supabaseAdmin
        .from('opportunites')
        .select('annonceur_id')
        .eq('created_by', user.id)
        .not('annonceur_id', 'is', null)
        .limit(1)
        .maybeSingle();

      if (mission?.annonceur_id) {
        inheritedAnnonceurId = mission.annonceur_id;
        // Fix the caller's profile for future calls
        await supabaseAdmin
          .from('profiles')
          .update({ annonceur_id: inheritedAnnonceurId })
          .eq('id', user.id);
      }
    }

    if (!inheritedAnnonceurId) {
      return NextResponse.json(
        { error: 'Impossible de déterminer votre organisation. Veuillez contacter un administrateur.' },
        { status: 400 }
      );
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
      },
    });

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Erreur lors de la création du compte' },
        { status: 500 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Erreur lors de la création du compte' },
        { status: 500 }
      );
    }

    // Update profile - link to the same annonceur as the inviter
    const { error: profileUpdateError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authData.user.id,
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone || null,
        role: role,
        status: 'active',
        annonceur_id: inheritedAnnonceurId,
        email_preferences: {
          new_applications: true,
          auto_reminders: true,
          weekly_summary: true,
          platform_updates: false,
        },
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (profileUpdateError) {
      console.error('Profile error:', profileUpdateError);
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du profil' },
        { status: 500 }
      );
    }

    // Send welcome email if requested
    if (sendWelcome) {
      try {
        await sendInvitationEmail({
          firstName,
          lastName,
          email,
          role,
          tempPassword: password,
        });
      } catch (emailError) {
        console.error('SMTP Invitation Email error:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation envoyée avec succès',
      userId: authData.user.id,
    });

  } catch (error: any) {
    console.error('Invite member error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

async function sendInvitationEmail({
  firstName,
  lastName,
  email,
  role,
  tempPassword,
}: {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  tempPassword: string;
}) {
  const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL}/login`;

  await transporter.sendMail({
    from: `"Je suis au Cameroun" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Bienvenue dans l\'équipe Je suis au Cameroun',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 40px auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            
            <div style="background: linear-gradient(135deg, #187A58 0%, #003A54 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">
                Bienvenue dans l'équipe !
              </h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                Je suis au Cameroun
              </p>
            </div>

            <div style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px;">
                Bonjour ${escapeHtml(firstName)} ${escapeHtml(lastName)},
              </p>

              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.7;">
                Vous avez été invité à rejoindre la plateforme <strong>Je suis au Cameroun</strong> en tant que <strong>${escapeHtml(role)}</strong>.
              </p>

              <div style="background-color: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
                  🔑 Vos identifiants de connexion
                </h3>
                
                <div style="margin-bottom: 12px;">
                  <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 13px; font-weight: 500;">Email</p>
                  <p style="margin: 0; color: #1f2937; font-size: 15px; font-weight: 600; font-family: monospace;">${escapeHtml(email)}</p>
                </div>

                <div>
                  <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 13px; font-weight: 500;">Mot de passe temporaire</p>
                  <p style="margin: 0; color: #1f2937; font-size: 15px; font-weight: 600; font-family: monospace; background-color: white; padding: 8px 12px; border-radius: 4px; border: 1px solid #e5e7eb;">${escapeHtml(tempPassword)}</p>
                </div>
              </div>

              <div style="text-align: center; margin: 35px 0;">
                <a href="${loginUrl}" style="display: inline-block; background-color: #187A58; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  Se connecter à la plateforme
                </a>
              </div>

              <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Si vous avez des questions, n'hésitez pas à contacter l'équipe administrative.
              </p>
            </div>

            <div style="background-color: #f9fafb; padding: 25px 30px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 13px; text-align: center; line-height: 1.6;">
                Cet email a été envoyé automatiquement. Veuillez ne pas répondre à ce message.
              </p>
            </div>
            
            <div style="padding: 20px 30px; background-color: #f3f4f6; text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} Je suis au Cameroun - Tous droits réservés
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}
