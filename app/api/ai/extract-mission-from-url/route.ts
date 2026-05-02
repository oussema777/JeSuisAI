import { inferMissionFromDocumentContext, type DocumentInferredMission } from '@/lib/ai/missionAgent';
import { enforceAiRateLimit } from '@/lib/ai/routeGuards';

const MAX_HTML_CHARS = 120000;
const MAX_CONTEXT_CHARS = 22000;
const REQUEST_TIMEOUT_MS = 12000;

function stripHtmlToText(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?>[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeEnum(value?: string, allowed: string[] = []) {
  const normalized = (value || '').trim().toLowerCase();
  if (!normalized) return '';
  return allowed.includes(normalized) ? normalized : '';
}

function normalizeExtracted(extracted: DocumentInferredMission): DocumentInferredMission {
  return {
    intituleAction: (extracted.intituleAction || '').trim(),
    domaineAction: (extracted.domaineAction || '').trim(),
    descriptionGenerale: (extracted.descriptionGenerale || '').trim(),
    impactsObjectifs: (extracted.impactsObjectifs || '').trim(),
    detailsContributions: (extracted.detailsContributions || '').trim(),
    conditionsMission: (extracted.conditionsMission || '').trim(),
    publicVise: normalizeEnum(extracted.publicVise, ['tous', 'diaspora']),
    missionUrgente: normalizeEnum(extracted.missionUrgente, ['oui', 'non']),
    actionDistance: normalizeEnum(extracted.actionDistance, ['oui', 'non', 'partiellement']),
    timingAction: normalizeEnum(extracted.timingAction, ['permanente', 'ponctuelle', 'urgente']),
    remunerationPrevue: normalizeEnum(extracted.remunerationPrevue, ['benevole', 'remuneration', 'defraiement-local', 'defraiement-complet', 'autre']),
  };
}

export async function POST(req: Request) {
  try {
    const rateLimitResponse = enforceAiRateLimit(req, 'ai:extract-mission-from-url');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await req.json();
    const urlRaw = String(body?.url || '').trim();
    const guidance = String(body?.guidance || '').trim();
    const currentMission = body?.currentMission;

    if (!urlRaw) {
      return Response.json({ error: 'URL manquante' }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(urlRaw);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      return Response.json({ error: 'URL invalide. Utilisez un lien http(s).' }, { status: 400 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(parsedUrl.toString(), {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'JeSuisVPS-AI-Assistant/1.0 (+URL-Context-Extractor)',
          Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
        },
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      return Response.json(
        { error: `Impossible de lire l'URL (HTTP ${response.status})` },
        { status: 400 }
      );
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      return Response.json(
        { error: 'Le contenu URL doit être une page HTML lisible.' },
        { status: 400 }
      );
    }

    const html = (await response.text()).slice(0, MAX_HTML_CHARS);
    const pageText = stripHtmlToText(html).slice(0, MAX_CONTEXT_CHARS);

    if (pageText.length < 80) {
      return Response.json(
        { error: 'Le contenu récupéré depuis l’URL est insuffisant pour analyse.' },
        { status: 400 }
      );
    }

    const documentContext = [
      `Source URL: ${parsedUrl.toString()}`,
      guidance ? `Orientation utilisateur: ${guidance}` : '',
      `Contenu extrait: ${pageText}`,
    ]
      .filter(Boolean)
      .join('\n\n');

    const extracted = await inferMissionFromDocumentContext({
      documentContext,
      currentMission,
    }, body?.language === 'en' ? 'en' : 'fr');

    return Response.json({
      extracted: normalizeExtracted(extracted),
      meta: {
        sourceUrl: parsedUrl.toString(),
        extractedChars: pageText.length,
      },
    });
  } catch (error) {
    console.error('[AI][ExtractMissionFromUrl] Error:', error);
    return Response.json(
      {
        error: 'Extraction depuis URL impossible',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
