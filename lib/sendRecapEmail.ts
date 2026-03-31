// lib/sendRecapEmail.ts
// Client-side helper to send recap/notification emails via the send-notification API

import { escapeHtml } from '@/lib/utils';

interface RecapDetail {
  label: string;
  value: string;
}

interface SendRecapOptions {
  to: string;
  type: 'candidature' | 'projet' | 'profil';
  recipientName: string;
  details: RecapDetail[];
  annonceurEmails?: string; // Comma separated list of emails
}

export async function sendRecapEmail({ to, type, recipientName, details, annonceurEmails }: SendRecapOptions): Promise<void> {
  try {
    const themeMap = {
      candidature: { color: '#ea580c', secondary: '#7c2d12', icon: '🚀', label: 'CANDIDATURE CONFIRMÉE', subject: 'Confirmation de votre candidature - Jesuisaucameroun' },
      projet: { color: '#2563eb', secondary: '#1e3a8a', icon: '💡', label: 'PROJET SOUMIS', subject: 'Confirmation de soumission de votre projet - Jesuisaucameroun' },
      profil: { color: '#7c3aed', secondary: '#4c1d95', icon: '👤', label: 'PROFIL ENREGISTRÉ', subject: "Confirmation d'enregistrement de votre profil - Jesuisaucameroun" },
    };

    const messageMap = {
      candidature: {
        title: 'Votre candidature a bien été reçue',
        body: "Merci pour votre engagement ! Votre candidature a été transmise avec succès. L'annonceur examinera votre demande et vous répondra dans les meilleurs délais.",
        nextSteps: [
          "L'annonceur va étudier votre candidature (7 à 15 jours)",
          'Si votre profil correspond, vous serez contacté par email ou téléphone',
          'Une fois les modalités définies, vous pourrez commencer votre mission',
          'En cas de réponse tardive, vous pouvez nous contacter à : qualite@jesuisaupays.com',
        ],
      },
      projet: {
        title: 'Votre projet a bien été reçu',
        body: "Merci pour votre proposition et engagement ! L'équipe de la (les) ville(s) concernée(s) va étudier votre projet avec intérêt. A l'issue de cette étape, vous serez recontacté dans les meilleurs délais.",
        nextSteps: [
          'Le bénéficiaire concerné accuse réception de votre proposition',
          'La bénéficiaire va traiter votre demande',
          'Vous recevrez une réponse dans les prochains jours',
          'En cas de réponse tardive, contactez-nous à : qualite@jesuisaupays.com',
        ],
      },
      profil: {
        title: 'Votre profil a bien été enregistré',
        body: "Merci pour votre inscription et votre engagement ! Votre profil est désormais consultable par les organisations membres. Vous serez contacté dès qu'un besoin nécessitant votre expertise et correspondant à votre profil se présentera.",
        nextSteps: [
          'Votre profil est consultable par les organisations membres',
          'Vous serez contacté si un besoin correspond à votre expertise',
          'Consultez régulièrement les nouvelles missions disponibles',
          'En cas de réponse tardive, vous pouvez nous contacter à : qualite@jesuisaupays.com',
        ],
      },
    };

    const theme = themeMap[type];
    const msg = messageMap[type];
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';

    const html = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"></head>
        <body style="margin: 0; padding: 0; font-family: sans-serif; background-color: #f8fafc; color: #1e293b;">
          <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            <div style="background: linear-gradient(135deg, ${theme.color} 0%, ${theme.secondary} 100%); padding: 45px 30px; text-align: center;">
              <div style="display: inline-block; padding: 6px 16px; background: rgba(255,255,255,0.2); border-radius: 100px; margin-bottom: 15px;">
                <span style="color: #ffffff; font-size: 12px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">
                  ${theme.icon} ${theme.label}
                </span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; line-height: 1.2;">${msg.title}</h1>
            </div>
            <div style="padding: 35px;">
              <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Bonjour <strong>${escapeHtml(recipientName)}</strong>,
              </p>
              <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                ${msg.body}
              </p>
              <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 30px; border-left: 4px solid ${theme.color};">
                <h3 style="margin: 0 0 15px 0; color: ${theme.color}; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Récapitulatif</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  ${details.map(d => `
                    <tr>
                      <td style="padding: 6px 0; color: #64748b; font-size: 13px;">${escapeHtml(d.label)}</td>
                      <td style="padding: 6px 0; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">${escapeHtml(d.value)}</td>
                    </tr>
                  `).join('')}
                </table>
              </div>
              <div style="margin-bottom: 30px;">
                <h3 style="margin: 0 0 12px 0; color: #0f172a; font-size: 15px; font-weight: 600;">Et maintenant ?</h3>
                ${msg.nextSteps.map((step, i) => `
                  <div style="margin-bottom: 10px;">
                    <table style="border-collapse: collapse;"><tr>
                      <td style="width: 24px; height: 24px; background: ${theme.color}; border-radius: 50%; color: white; font-size: 12px; font-weight: 700; text-align: center; vertical-align: middle;">${i + 1}</td>
                      <td style="padding-left: 10px; color: #334155; font-size: 14px; line-height: 1.5;">${step}</td>
                    </tr></table>
                  </div>
                `).join('')}
              </div>
              <div style="text-align: center;">
                <a href="${siteUrl}/missions" style="display: inline-block; background: ${theme.color}; color: #ffffff; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px;">
                  Découvrir d'autres missions
                </a>
              </div>
            </div>
            <div style="padding: 20px; background: #0f172a; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                © ${new Date().getFullYear()} Jesuisaucameroun • Confirmation automatique
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // 1. Send confirmation to the user
    await fetch('/api/send-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject: `${theme.icon} ${theme.subject}`, html }),
    });

    // 2. Send notification to Impact Diaspora (Admin)
    const adminEmail = 'clients@impactdiaspora.fr';
    const adminSubject = `[NEW ${type.toUpperCase()}] ${escapeHtml(recipientName)} - Jesuisaucameroun`;

    // Tweak HTML slightly for admin to show it's a notification
    const adminHtml = html
      .replace(msg.title, `Nouvelle soumission : ${escapeHtml(theme.label)}`)
      .replace(`Bonjour <strong>${escapeHtml(recipientName)}</strong>`, `Une nouvelle soumission de type <strong>${type}</strong> a été reçue.`);

    await fetch('/api/send-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        to: adminEmail, 
        subject: `${theme.icon} ${adminSubject}`, 
        html: adminHtml 
      }),
    });

    // 3. Send notification to Annonceur (Mission Owner) if applicable
    if ((type === 'candidature' || type === 'profil' || type === 'projet') && annonceurEmails) {
      const annonceurConfigMap = {
        candidature: {
          subject: `🚀 [Nouvelle Candidature] ${escapeHtml(recipientName)} - Jesuisaucameroun`,
          badge: '🚀 Nouvelle Candidature',
          intro: 'Une nouvelle soumission de type <strong>candidature</strong> à vos annonces a été reçue.',
          body: "Vous avez reçu une nouvelle candidature pour une mission publiée sur jesuisaucameroun.com. Un résumé de cette candidature est présenté ci-dessous. N'attendez pas pour la consulter et saisir cette opportunité.",
          ctaLink: `${siteUrl}/admin/candidatures`,
          ctaLabel: 'Consulter la candidature',
        },
        profil: {
          subject: `👤 [Nouveau profil] ${escapeHtml(recipientName)} - jesuisaucameroun`,
          badge: '👤 PROFIL ENREGISTRÉ',
          intro: 'Vous avez reçu une nouvelle candidature spontanée de type « proposer votre profil ».',
          body: "Un résumé de cette candidature est présenté ci-dessous. N'attendez pas pour la consulter et saisir cette opportunité.",
          ctaLink: `${siteUrl}/admin/profilesoumis`,
          ctaLabel: 'Consulter la candidature',
        },
        projet: {
          subject: `💡 [Nouveau PROJET] ${escapeHtml(recipientName)} - jesuisaucameroun`,
          badge: '💡 PROJET SOUMIS',
          intro: 'Vous avez reçu une nouvelle candidature spontanée de type « soumettre un projet ».',
          body: "Un résumé de cette proposition est présenté ci-dessous. N'attendez pas pour la consulter et saisir cette opportunité.",
          ctaLink: `${siteUrl}/admin/projetsoumis`,
          ctaLabel: 'Consulter la candidature',
        },
      };
      const annonceurConfig = annonceurConfigMap[type];

      const annonceurSteps = [
        'Accuser réception de la candidature',
        'Répondre directement à la demande ou faire traiter par le service compétent',
        'Assurer le suivi',
      ];

      const annonceurHtml = `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"></head>
          <body style="margin: 0; padding: 0; font-family: sans-serif; background-color: #f8fafc; color: #1e293b;">
            <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
              <div style="background: linear-gradient(135deg, ${theme.color} 0%, ${theme.secondary} 100%); padding: 45px 30px; text-align: center;">
                <div style="display: inline-block; padding: 6px 16px; background: rgba(255,255,255,0.2); border-radius: 100px; margin-bottom: 15px;">
                  <span style="color: #ffffff; font-size: 12px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">
                    ${annonceurConfig.badge}
                  </span>
                </div>
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; line-height: 1.2;">Nouvelle soumission : ${theme.label}</h1>
              </div>
              <div style="padding: 35px;">
                <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 10px;">
                  ${annonceurConfig.intro}
                </p>
                <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                  ${annonceurConfig.body}
                </p>
                <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 30px; border-left: 4px solid ${theme.color};">
                  <h3 style="margin: 0 0 15px 0; color: ${theme.color}; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Récapitulatif</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    ${details.map(d => `
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px;">${escapeHtml(d.label)}</td>
                        <td style="padding: 6px 0; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">${escapeHtml(d.value)}</td>
                      </tr>
                    `).join('')}
                  </table>
                </div>
                <div style="margin-bottom: 30px;">
                  <h3 style="margin: 0 0 12px 0; color: #0f172a; font-size: 15px; font-weight: 600;">Et maintenant ?</h3>
                  ${annonceurSteps.map((step, i) => `
                    <div style="margin-bottom: 10px;">
                      <table style="border-collapse: collapse;"><tr>
                        <td style="width: 24px; height: 24px; background: ${theme.color}; border-radius: 50%; color: white; font-size: 12px; font-weight: 700; text-align: center; vertical-align: middle;">${i + 1}</td>
                        <td style="padding-left: 10px; color: #334155; font-size: 14px; line-height: 1.5;">${step}</td>
                      </tr></table>
                    </div>
                  `).join('')}
                </div>
                <div style="text-align: center;">
                  <a href="${annonceurConfig.ctaLink}" style="display: inline-block; background: ${theme.color}; color: #ffffff; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px;">
                    ${annonceurConfig.ctaLabel}
                  </a>
                </div>
              </div>
              <div style="padding: 20px; background: #0f172a; text-align: center;">
                <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                  © ${new Date().getFullYear()} Jesuisaucameroun • Notification automatique
                </p>
              </div>
            </div>
          </body>
        </html>
      `;

      await fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: annonceurEmails,
          subject: annonceurConfig.subject,
          html: annonceurHtml
        }),
      });
    }
  } catch (err) {
    console.error('Recap email failed (non-blocking):', err);
  }
}
