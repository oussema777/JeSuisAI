// app/api/send-email/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { escapeHtml } from '@/lib/utils';
import { transporter } from '@/lib/email';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    // Auth check: require a valid user session
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() {},
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Rate limit: 10 emails per minute per user
    const rl = checkRateLimit(`send-email:${user.id}`, { maxRequests: 10, windowSeconds: 60 });
    if (!rl.allowed) return rateLimitResponse(rl.resetAt);

    const { to, cc, subject, message, replyTo, senderName, structuredData } = await req.json();

    if (!to || !subject || !message) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    // Validate email formats
    if (!EMAIL_REGEX.test(to)) {
      return NextResponse.json({ error: 'Adresse email destinataire invalide' }, { status: 400 });
    }
    if (cc) {
      const ccEmails = cc.split(',').map((e: string) => e.trim()).filter((e: string) => e.length > 0);
      for (const email of ccEmails) {
        if (!EMAIL_REGEX.test(email)) {
          return NextResponse.json({ error: `Adresse email CC invalide : ${email}` }, { status: 400 });
        }
      }
    }
    if (replyTo && !EMAIL_REGEX.test(replyTo)) {
      return NextResponse.json({ error: 'Adresse email de réponse invalide' }, { status: 400 });
    }

    // Input length limits
    if (subject.length > 500 || message.length > 10000) {
      return NextResponse.json({ error: 'Contenu trop long' }, { status: 400 });
    }

    // --- Dynamic Branding Logic ---
    const type = structuredData?.type || "Contact";
    let themeColor = "#187A58"; // Default Green
    let secondaryColor = "#003A54";
    let typeLabel = "MESSAGE";
    let typeIcon = "✉️";

    if (type.includes("Projet")) {
      themeColor = "#2563eb"; // Pro Blue
      secondaryColor = "#1e3a8a";
      typeLabel = "NOUVEAU PROJET";
      typeIcon = "💡";
    } else if (type.includes("Profil")) {
      themeColor = "#7c3aed"; // Talent Purple
      secondaryColor = "#4c1d95";
      typeLabel = "NOUVEAU PROFIL";
      typeIcon = "👤";
    } else if (type.includes("Candidature") || type.includes("Mission")) {
      themeColor = "#ea580c"; // Action Orange
      secondaryColor = "#7c2d12";
      typeLabel = "NOUVELLE CANDIDATURE";
      typeIcon = "🚀";
    }

    const safeSubject = escapeHtml(subject);
    const safeSenderName = escapeHtml(senderName || '');
    const safeMessage = escapeHtml(message);
    const safeReplyTo = escapeHtml(replyTo || '');
    const safeWhatsapp = escapeHtml(structuredData?.whatsapp || '');
    const safeOrganisation = escapeHtml(structuredData?.organisation || '');

    const html = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"></head>
        <body style="margin: 0; padding: 0; font-family: sans-serif; background-color: #f8fafc; color: #1e293b;">
          <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">

            <!-- HEADER: Dynamic Background -->
            <div style="background: linear-gradient(135deg, ${themeColor} 0%, ${secondaryColor} 100%); padding: 45px 30px; text-align: center;">
              <div style="display: inline-block; padding: 6px 16px; background: rgba(255,255,255,0.2); border-radius: 100px; margin-bottom: 15px;">
                <span style="color: #ffffff; font-size: 12px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">
                  ${typeIcon} ${typeLabel}
                </span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; line-height: 1.2;">${safeSubject}</h1>
            </div>

            <div style="padding: 35px;">
              <!-- SENDER BOX -->
              <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 30px; border-left: 4px solid ${themeColor};">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 4px 0; color: #64748b; font-size: 13px;">Expéditeur</td>
                    <td style="padding: 4px 0; color: #0f172a; font-size: 14px; font-weight: 700; text-align: right;">${safeSenderName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #64748b; font-size: 13px;">Contact</td>
                    <td style="padding: 4px 0; color: ${themeColor}; font-size: 14px; font-weight: 600; text-align: right;">
                      <a href="mailto:${safeReplyTo}" style="color: inherit; text-decoration: none;">${safeReplyTo}</a>
                    </td>
                  </tr>
                  ${safeWhatsapp ? `
                  <tr>
                    <td style="padding: 4px 0; color: #64748b; font-size: 13px;">WhatsApp</td>
                    <td style="padding: 4px 0; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">${safeWhatsapp}</td>
                  </tr>` : ''}
                  ${safeOrganisation ? `
                  <tr>
                    <td style="padding: 4px 0; color: #64748b; font-size: 13px;">Pays / Ville</td>
                    <td style="padding: 4px 0; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">${safeOrganisation}</td>
                  </tr>` : ''}
                </table>
              </div>

              <!-- MESSAGE -->
              <div style="margin-bottom: 30px;">
                <h3 style="margin: 0 0 12px 0; color: ${themeColor}; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">Détails du message</h3>
                <div style="color: #334155; font-size: 16px; line-height: 1.6; background: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; white-space: pre-wrap;">${safeMessage}</div>
              </div>

              <!-- CTA -->
              <div style="text-align: center;">
                <a href="mailto:${safeReplyTo}" style="display: inline-block; background: ${themeColor}; color: #ffffff; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px;">
                  Répondre à ${safeSenderName.split(' ')[0]}
                </a>
              </div>
            </div>

            <div style="padding: 20px; background: #0f172a; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                © ${new Date().getFullYear()} Je suis au Cameroun • Notification Administrative
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: `"Je suis au Cameroun" <${process.env.SMTP_USER}>`,
      to,
      cc: cc || undefined,
      replyTo: replyTo || process.env.SMTP_USER,
      subject: `${typeIcon} ${subject}`, // Icon in subject line too!
      text: message,
      html,
    });

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: unknown) {
    console.error('Email SMTP error:', error);
    return NextResponse.json({ error: "Erreur lors de l'envoi de l'email" }, { status: 500 });
  }
}
