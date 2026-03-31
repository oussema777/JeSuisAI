import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { escapeHtml } from '@/lib/utils';
import { transporter } from '@/lib/email';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    // Rate limit by IP (public endpoint, no auth required)
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    const rl = checkRateLimit(`contact:${ip}`, { maxRequests: 5, windowSeconds: 60 });
    if (!rl.allowed) return rateLimitResponse(rl.resetAt);

    const body = await req.json();
    const { typeOrganisation, nomOrganisation, nomPrenom, email, whatsappTelephone, objetMessage, message } = body;

    // Validate required fields
    if (!typeOrganisation || !nomPrenom || !email || !objetMessage || !message) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Adresse email invalide' }, { status: 400 });
    }
    if (message.length < 20) {
      return NextResponse.json({ error: 'Le message doit contenir au moins 20 caractères' }, { status: 400 });
    }
    if (message.length > 10000) {
      return NextResponse.json({ error: 'Message trop long' }, { status: 400 });
    }

    // 1. Save to database
    const { error: dbError } = await supabaseAdmin
      .from('contact_messages')
      .insert({
        type_organisation: typeOrganisation,
        nom_organisation: nomOrganisation || null,
        nom_prenom: nomPrenom,
        email,
        whatsapp_telephone: whatsappTelephone || null,
        objet: objetMessage,
        message,
        statut: 'nouveau',
      });

    if (dbError) {
      console.error('Error saving contact message:', dbError);
      // Continue with email even if DB save fails
    }

    // 2. Send email notification
    const notificationEmail = process.env.NEXT_PUBLIC_NOTIFICATION_EMAIL;
    if (notificationEmail) {
      const safeSubject = escapeHtml(`Contact: ${objetMessage}`);
      const safeSenderName = escapeHtml(nomPrenom);
      const safeMessage = escapeHtml(message);
      const safeReplyTo = escapeHtml(email);
      const safeWhatsapp = escapeHtml(whatsappTelephone || '');
      const safeOrganisation = escapeHtml(nomOrganisation || '');
      const safeType = escapeHtml(typeOrganisation);

      const themeColor = "#187A58";
      const secondaryColor = "#003A54";

      const html = `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"></head>
          <body style="margin: 0; padding: 0; font-family: sans-serif; background-color: #f8fafc; color: #1e293b;">
            <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
              <div style="background: linear-gradient(135deg, ${themeColor} 0%, ${secondaryColor} 100%); padding: 45px 30px; text-align: center;">
                <div style="display: inline-block; padding: 6px 16px; background: rgba(255,255,255,0.2); border-radius: 100px; margin-bottom: 15px;">
                  <span style="color: #ffffff; font-size: 12px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">
                    ✉️ MESSAGE DE CONTACT
                  </span>
                </div>
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; line-height: 1.2;">${safeSubject}</h1>
              </div>
              <div style="padding: 35px;">
                <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 30px; border-left: 4px solid ${themeColor};">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 4px 0; color: #64748b; font-size: 13px;">Expéditeur</td>
                      <td style="padding: 4px 0; color: #0f172a; font-size: 14px; font-weight: 700; text-align: right;">${safeSenderName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0; color: #64748b; font-size: 13px;">Type</td>
                      <td style="padding: 4px 0; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">${safeType}</td>
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
                      <td style="padding: 4px 0; color: #64748b; font-size: 13px;">Organisation</td>
                      <td style="padding: 4px 0; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">${safeOrganisation}</td>
                    </tr>` : ''}
                  </table>
                </div>
                <div style="margin-bottom: 30px;">
                  <h3 style="margin: 0 0 12px 0; color: ${themeColor}; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">Détails du message</h3>
                  <div style="color: #334155; font-size: 16px; line-height: 1.6; background: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; white-space: pre-wrap;">${safeMessage}</div>
                </div>
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

      try {
        await transporter.sendMail({
          from: `"Je suis au Cameroun" <${process.env.SMTP_USER}>`,
          to: notificationEmail,
          replyTo: email,
          subject: `✉️ Contact: ${objetMessage}`,
          text: message,
          html,
        });
      } catch (emailError) {
        console.error('Email sending failed (non-blocking):', emailError);
      }
    }

    // 3. Notify admins via platform notifications
    try {
      // Use supabaseAdmin to fetch superadmins and insert notifications server-side
      const { data: superadmins } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('role', 'Superadmin');

      if (superadmins && superadmins.length > 0) {
        const notificationsToInsert = superadmins.map((sa: { id: string }) => ({
          user_id: sa.id,
          type: 'contact_message_received',
          title: 'Nouveau Message de Contact',
          message: `${nomPrenom} a envoyé un message : "${objetMessage}".`,
          data: { candidat_name: nomPrenom, candidat_email: email },
          read: false,
        }));

        await supabaseAdmin.from('notifications').insert(notificationsToInsert);
      }
    } catch (notifError) {
      console.error('Platform notification failed (non-blocking):', notifError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du message" },
      { status: 500 }
    );
  }
}
