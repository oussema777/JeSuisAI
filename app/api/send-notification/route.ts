// app/api/send-notification/route.ts
// Email endpoint for sending notification/recap emails
// Supports two auth modes:
// 1. Server-side: pass `secret` matching CRON_SECRET (for cron jobs, server actions)
// 2. Client-side: rate-limited by IP (for public form submissions)

import { NextResponse } from 'next/server';
import { transporter } from '@/lib/email';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, subject, html, text, secret } = body;

    // Auth: either secret or rate limit
    const hasValidSecret = secret && secret === process.env.CRON_SECRET;
    if (!hasValidSecret) {
      // Rate limit by IP: 5 emails per minute
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
      const rl = checkRateLimit(`send-notif:${ip}`, { maxRequests: 5, windowSeconds: 60 });
      if (!rl.allowed) return rateLimitResponse(rl.resetAt);
    }

    if (!to || !subject || (!html && !text)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const info = await transporter.sendMail({
      from: `"Je suis au Cameroun" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: text || undefined,
      html: html || undefined,
    });

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: unknown) {
    console.error('Notification email error:', error);
    return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 });
  }
}
