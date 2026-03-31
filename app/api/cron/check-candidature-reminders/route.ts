// app/api/cron/check-candidature-reminders/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { escapeHtml } from '@/lib/utils';
import { supabaseAdmin as supabase } from '@/lib/supabase/admin';
import { transporter } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    // 1. Verify Vercel Cron Secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Target candidatures older than 14 days
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    // Fetch pending candidatures
    const { data: candidatures, error: candidaturesError } = await supabase
      .from('candidatures')
      .select(`
        id,
        nom_prenom,
        email,
        statut,
        created_at,
        opportunite_id,
        opportunites (
          id,
          intitule_action,
          created_by,
          emails_rappel
        )
      `)
      .in('statut', ['nouvelle', 'en_attente'])
      .lte('created_at', fourteenDaysAgo.toISOString());

    if (candidaturesError) throw candidaturesError;
    if (!candidatures || candidatures.length === 0) {
      return NextResponse.json({ message: "No overdue candidatures found." });
    }

    // 3. Group candidatures by Admin (Annonceur)
    const adminNotifications: Record<string, any[]> = {};

    for (const cand of candidatures) {
      const creatorId = cand.opportunites[0]?.created_by;
      if (creatorId) {
        if (!adminNotifications[creatorId]) {
          adminNotifications[creatorId] = [];
        }
        adminNotifications[creatorId].push(cand);
      }
    }

    let emailsSent = 0;

    // 4. Batch-fetch all admin profiles in a single query
    const adminIds = Object.keys(adminNotifications);
    const { data: adminProfiles } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name')
      .in('id', adminIds);

    const adminProfileMap = new Map(
      (adminProfiles || []).map(p => [p.id, p])
    );

    // 5. Send Emails
    for (const [adminId, list] of Object.entries(adminNotifications)) {
      const adminProfile = adminProfileMap.get(adminId);

      if (adminProfile?.email) {
        // Collect additional emails from the opportunities in this list
        const additionalEmails = new Set<string>();
        list.forEach(c => {
          const emails = c.opportunites?.emails_rappel;
          if (emails) {
            emails.split(';').forEach((e: string) => {
              const trimmed = e.trim();
              if (trimmed) additionalEmails.add(trimmed);
            });
          }
        });

        const recipients = [adminProfile.email, ...Array.from(additionalEmails)];

        await transporter.sendMail({
          from: `"Je suis au Cameroun" <${process.env.SMTP_USER}>`,
          to: recipients.join(', '),
          subject: `📢 Rappel: ${list.length} candidature(s) en attente depuis +14 jours`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eef2f1; border-radius: 12px; overflow: hidden;">
              <div style="background: #187A58; padding: 30px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 24px;">Rappel de Gestion</h1>
                <p>Candidatures en attente de réponse</p>
              </div>
              <div style="padding: 30px;">
                <p>Bonjour ${escapeHtml(adminProfile.first_name || 'Admin')},</p>
                <p>Les candidatures suivantes pour vos missions n'ont pas encore reçu de réponse après 14 jours :</p>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                  <tr style="background: #f8fafc;">
                    <th style="padding: 10px; border: 1px solid #edf2f7; text-align: left;">Candidat</th>
                    <th style="padding: 10px; border: 1px solid #edf2f7; text-align: left;">Mission</th>
                    <th style="padding: 10px; border: 1px solid #edf2f7; text-align: left;">Date</th>
                  </tr>
                  ${list.map(c => `
                    <tr>
                      <td style="padding: 10px; border: 1px solid #edf2f7;">${escapeHtml(c.nom_prenom)}</td>
                      <td style="padding: 10px; border: 1px solid #edf2f7;">${escapeHtml(c.opportunites[0]?.intitule_action || '')}</td>
                      <td style="padding: 10px; border: 1px solid #edf2f7;">${new Date(c.created_at).toLocaleDateString()}</td>
                    </tr>
                  `).join('')}
                </table>

                <div style="margin-top: 30px; text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/candidatures" style="background: #187A58; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    Accéder à mon tableau de bord
                  </a>
                </div>
              </div>
              <div style="background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #718096;">
                © ${new Date().getFullYear()} Je suis au Cameroun - Système de Rappel Automatique
              </div>
            </div>
          `
        });
        emailsSent++;
      }
    }

    return NextResponse.json({
      success: true,
      overdueCandidatures: candidatures.length,
      emailsSent
    });

  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
