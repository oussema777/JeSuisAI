import { createHash } from 'crypto';
import { inferMissionFromDocumentContext, inferMissionFromDocumentFile, type DocumentInferredMission } from '@/lib/ai/missionAgent';
import { enforceAiRateLimit } from '@/lib/ai/routeGuards';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const CACHE_TTL_MS = 1000 * 60 * 60 * 24;

type CachedExtraction = {
  extracted: DocumentInferredMission;
  expiresAt: number;
};

const extractionCache = new Map<string, CachedExtraction>();

const domainKeywords: Array<{ value: string; keywords: string[] }> = [
  { value: 'investissement', keywords: ['investissement', 'financement', 'capital'] },
  { value: 'Santé', keywords: ['santé', 'médical', 'hôpital', 'clinique', 'télémédecine'] },
  { value: 'pauvrete', keywords: ['pauvreté', 'inclusion', 'précarité'] },
  { value: 'societe-civile', keywords: ['société civile', 'femmes', 'jeunes', 'association'] },
  { value: 'infrastructures', keywords: ['infrastructure', 'urbanisme', 'route', 'bâtiment'] },
  { value: 'environnement', keywords: ['environnement', 'propreté', 'déchet', 'climat'] },
  { value: 'éducation', keywords: ['éducation', 'école', 'formation initiale', 'enfance'] },
  { value: 'innovation', keywords: ['innovation', 'numérique', 'digital', 'technologie'] },
  { value: 'recrutement', keywords: ['recrutement', 'emploi', 'formation professionnelle', 'compétences'] },
  { value: 'tourisme', keywords: ['tourisme', 'visite', 'destination'] },
  { value: 'culture', keywords: ['culture', 'patrimoine', 'artistique'] },
  { value: 'rayonnement', keywords: ['rayonnement international', 'influence internationale'] },
  { value: 'droits', keywords: ['droits', 'citoyenneté', 'civique'] },
  { value: 'urgences', keywords: ['urgence', 'catastrophe', 'crise humanitaire'] },
];

function normalizeEnum(value: string | undefined, allowed: string[]) {
  const normalized = (value || '').trim().toLowerCase();
  if (!normalized) return '';
  return allowed.includes(normalized) ? normalized : '';
}

function normalizeDomain(value?: string, context?: string) {
  const source = `${value || ''} ${context || ''}`.toLowerCase();
  for (const domain of domainKeywords) {
    if (domain.keywords.some((kw) => source.includes(kw))) {
      return domain.value;
    }
  }
  return (value || '').trim();
}

function pickBestDeterministic(extracted: any) {
  return {
    intituleAction: (extracted?.intituleAction || '').trim(),
    domaineAction: normalizeDomain(extracted?.domaineAction, extracted?.documentContext),
    descriptionGenerale: (extracted?.descriptionGenerale || '').trim(),
    impactsObjectifs: (extracted?.impactsObjectifs || '').trim(),
    detailsContributions: (extracted?.detailsContributions || '').trim(),
    conditionsMission: (extracted?.conditionsMission || '').trim(),
    publicVise: normalizeEnum(extracted?.publicVise, ['tous', 'diaspora']),
    missionUrgente: normalizeEnum(extracted?.missionUrgente, ['oui', 'non']),
    actionDistance: normalizeEnum(extracted?.actionDistance, ['oui', 'non', 'partiellement']),
    timingAction: normalizeEnum(extracted?.timingAction, ['permanente', 'ponctuelle', 'urgente']),
    remunerationPrevue: normalizeEnum(extracted?.remunerationPrevue, ['benevole', 'remuneration', 'defraiement-local', 'defraiement-complet', 'autre']),
  };
}

function hasStrongDeterministicResult(fields: ReturnType<typeof pickBestDeterministic>) {
  const requiredOk =
    fields.intituleAction.length >= 6 &&
    fields.domaineAction.length >= 3 &&
    fields.descriptionGenerale.length >= 40 &&
    fields.impactsObjectifs.length >= 20 &&
    fields.detailsContributions.length >= 20;

  return requiredOk;
}

function getCacheKey(bytes: Buffer) {
  const hash = createHash('sha256').update(bytes).digest('hex');
  return `doc-extract:v3:${hash}`;
}

function getCached(cacheKey: string) {
  const hit = extractionCache.get(cacheKey);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    extractionCache.delete(cacheKey);
    return null;
  }
  return hit.extracted;
}

function setCached(cacheKey: string, extracted: DocumentInferredMission) {
  extractionCache.set(cacheKey, {
    extracted,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

export async function POST(req: Request) {
  try {
    const rateLimitResponse = enforceAiRateLimit(req, 'ai:extract-mission-from-document');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const currentMissionRaw = formData.get('currentMission');

    if (!(file instanceof File)) {
      return Response.json({ error: 'Aucun fichier reçu' }, { status: 400 });
    }

    if (file.size === 0) {
      return Response.json({ error: 'Le fichier est vide' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return Response.json({ error: 'Fichier trop volumineux (max 10MB)' }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || 'application/octet-stream';
    const cacheKey = getCacheKey(bytes);

    const cached = getCached(cacheKey);
    if (cached) {
      return Response.json({
        extracted: cached,
        meta: { cacheHit: true, reasoningUsed: false },
      });
    }

    const extractedBase = await inferMissionFromDocumentFile({
      mimeType,
      bytes,
    });

    const deterministic = pickBestDeterministic(extractedBase);
    let finalExtracted: DocumentInferredMission = deterministic;
    let reasoningUsed = false;

    const shouldUseReasoning = !hasStrongDeterministicResult(deterministic);

    if (shouldUseReasoning) {
      const currentMission = (() => {
        if (typeof currentMissionRaw !== 'string' || !currentMissionRaw.trim()) return undefined;
        try {
          return JSON.parse(currentMissionRaw);
        } catch {
          return undefined;
        }
      })();

      const reasoned = await inferMissionFromDocumentContext({
        documentContext: extractedBase?.documentContext || '',
        currentMission,
      });

      finalExtracted = {
        intituleAction: reasoned.intituleAction?.trim() || deterministic.intituleAction,
        domaineAction: normalizeDomain(reasoned.domaineAction, extractedBase?.documentContext) || deterministic.domaineAction,
        descriptionGenerale: reasoned.descriptionGenerale?.trim() || deterministic.descriptionGenerale,
        impactsObjectifs: reasoned.impactsObjectifs?.trim() || deterministic.impactsObjectifs,
        detailsContributions: reasoned.detailsContributions?.trim() || deterministic.detailsContributions,
        conditionsMission: reasoned.conditionsMission?.trim() || deterministic.conditionsMission,
        publicVise: normalizeEnum(reasoned.publicVise, ['tous', 'diaspora']) || deterministic.publicVise,
        missionUrgente: normalizeEnum(reasoned.missionUrgente, ['oui', 'non']) || deterministic.missionUrgente,
        actionDistance: normalizeEnum(reasoned.actionDistance, ['oui', 'non', 'partiellement']) || deterministic.actionDistance,
        timingAction: normalizeEnum(reasoned.timingAction, ['permanente', 'ponctuelle', 'urgente']) || deterministic.timingAction,
        remunerationPrevue: normalizeEnum(reasoned.remunerationPrevue, ['benevole', 'remuneration', 'defraiement-local', 'defraiement-complet', 'autre']) || deterministic.remunerationPrevue,
      };
      reasoningUsed = true;
    }

    setCached(cacheKey, finalExtracted);

    return Response.json({
      extracted: finalExtracted,
      meta: { cacheHit: false, reasoningUsed },
    });
  } catch (error) {
    console.error('[AI][ExtractMissionFromDocument] Error:', error);
    return Response.json(
      {
        error: 'Extraction du document impossible',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
