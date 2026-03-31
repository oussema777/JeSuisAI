// app/api/notify-newsletter/route.ts
// Sends newsletter alerts to subscribers when a mission is published
// Matches subscribers by domaine d'action

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAdmin as supabase } from '@/lib/supabase/admin';
import { transporter } from '@/lib/email';
import { escapeHtml } from '@/lib/utils';

// Map mission domain values to newsletter domain values for matching
const normalizeDomain = (domain: string): string => {
  return domain
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .trim();
};

export async function POST(req: Request) {
  try {
    const { domaine_action, mission_title, mission_id, description, secret } = await req.json();

    // Auth: either CRON_SECRET or authenticated admin user
    const hasValidSecret = secret && secret === process.env.CRON_SECRET;
    if (!hasValidSecret) {
      const cookieStore = await cookies();
      const authSupabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
      );
      const { data: { user } } = await authSupabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    if (!domaine_action || !mission_title || !mission_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch all newsletter subscribers
    const { data: subscribers, error: fetchError } = await supabase
      .from('newsletter_subscriptions')
      .select('email, domaine');

    if (fetchError) throw fetchError;
    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ message: 'No subscribers found', emailsSent: 0 });
    }

    // Filter subscribers: match by domain or "all domains"
    const normalizedMissionDomain = normalizeDomain(domaine_action);
    const matchingSubscribers = subscribers.filter(sub => {
      if (!sub.domaine || sub.domaine === 'Tous les domaines' || sub.domaine === '') {
        return true; // Subscribed to all domains
      }
      return normalizeDomain(sub.domaine) === normalizedMissionDomain;
    });

    if (matchingSubscribers.length === 0) {
      return NextResponse.json({ message: 'No matching subscribers', emailsSent: 0 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://jesuisaucameroun.com';
    const safeTitle = escapeHtml(mission_title);
    const safeDomain = escapeHtml(domaine_action);
    const safeDesc = description ? escapeHtml(description).substring(0, 200) : '';

    const html = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"></head>
        <body style="margin: 0; padding: 0; font-family: sans-serif; background-color: #f8fafc; color: #1e293b;">
          <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            <div style="background: linear-gradient(135deg, #187A58 0%, #003A54 100%); padding: 45px 30px; text-align: center;">
              <div style="display: inline-block; padding: 6px 16px; background: rgba(255,255,255,0.2); border-radius: 100px; margin-bottom: 15px;">
                <span style="color: #ffffff; font-size: 12px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">
                  🌍 NOUVELLE MISSION
                </span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; line-height: 1.3;">${safeTitle}</h1>
            </div>
            <div style="padding: 35px;">
              <div style="display: inline-block; padding: 4px 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; margin-bottom: 20px;">
                <span style="color: #187A58; font-size: 13px; font-weight: 600;">${safeDomain}</span>
              </div>
              <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                Une nouvelle mission correspondant à vos centres d'intérêt vient d'être publiée sur la plateforme Jesuisaucameroun.
              </p>
              ${safeDesc ? `
              <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6;">${safeDesc}${description && description.length > 200 ? '...' : ''}</p>
              </div>
              ` : ''}
              <div style="text-align: center;">
                <a href="${siteUrl}/missions/${mission_id}" style="display: inline-block; background: #187A58; color: #ffffff; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px;">
                  Voir la mission
                </a>
              </div>
            </div>
            <div style="padding: 20px; background: #0f172a; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                © ${new Date().getFullYear()} Je suis au Cameroun • Alerte Newsletter
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send emails in batches (BCC to avoid exposing addresses)
    const batchSize = 50;
    let emailsSent = 0;

    for (let i = 0; i < matchingSubscribers.length; i += batchSize) {
      const batch = matchingSubscribers.slice(i, i + batchSize);
      const bccList = batch.map(s => s.email).join(', ');

      await transporter.sendMail({
        from: `"Je suis au Cameroun" <${process.env.SMTP_USER}>`,
        to: process.env.SMTP_USER, // Send to self
        bcc: bccList, // Recipients in BCC
        subject: `🌍 Nouvelle mission: ${mission_title}`,
        html,
      });
      emailsSent += batch.length;
    }

    return NextResponse.json({ success: true, emailsSent, matchingSubscribers: matchingSubscribers.length });
  } catch (error: any) {
    console.error('Newsletter notification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
