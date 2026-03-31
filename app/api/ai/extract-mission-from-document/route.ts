import { createHash } from 'crypto';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { inferMissionFromDocumentContext, type DocumentInferredMission } from '@/lib/ai/missionAgent';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const CACHE_TTL_MS = 1000 * 60 * 60 * 24;

type CachedExtraction = {
  extracted: DocumentInferredMission;
  expiresAt: number;
};

const extractionCache = new Map<string, CachedExtraction>();

const extractionSchema = {
  type: SchemaType.OBJECT,
  properties: {
    documentContext: { type: SchemaType.STRING },
    intituleAction: { type: SchemaType.STRING },
    domaineAction: { type: SchemaType.STRING },
    descriptionGenerale: { type: SchemaType.STRING },
    impactsObjectifs: { type: SchemaType.STRING },
    detailsContributions: { type: SchemaType.STRING },
    conditionsMission: { type: SchemaType.STRING },
    publicVise: { type: SchemaType.STRING },
    missionUrgente: { type: SchemaType.STRING },
    actionDistance: { type: SchemaType.STRING },
    timingAction: { type: SchemaType.STRING },
    remunerationPrevue: { type: SchemaType.STRING },
  },
};

const extractionPrompt = `
Vous êtes un assistant d'analyse documentaire pour pré-remplir un formulaire de mission diaspora.

À partir du fichier fourni, retournez à la fois :
1) un contexte synthétique fiable,
2) un premier pré-remplissage des champs.

Retournez UNIQUEMENT du JSON valide avec ces clés :
{
  "documentContext": "string",
  "intituleAction": "string",
  "domaineAction": "string",
  "descriptionGenerale": "string",
  "impactsObjectifs": "string",
  "detailsContributions": "string",
  "conditionsMission": "string",
  "publicVise": "tous | diaspora | string vide si inconnu",
  "missionUrgente": "oui | non | string vide si inconnu",
  "actionDistance": "oui | non | partiellement | string vide si inconnu",
  "timingAction": "permanente | ponctuelle | urgente | string vide si inconnu",
  "remunerationPrevue": "benevole | remuneration | defraiement-local | defraiement-complet | autre | string vide si inconnu"
}

Règles :
- Ne mettez que des informations réellement trouvées ou clairement déduites du document.
- Si incertain, renvoyez une chaîne vide.
- Réponse en français uniquement.
`;

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

function cleanModelResponse(raw: string) {
  let cleaned = raw.trim();
  if (cleaned.includes('```json')) {
    cleaned = cleaned.replace(/```json\n?/, '').replace(/```\n?$/, '');
  } else if (cleaned.includes('```')) {
    cleaned = cleaned.replace(/```\n?/, '').replace(/```\n?$/, '');
  }
  return cleaned.trim();
}

function normalizeEnum(value?: string, allowed: string[]) {
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
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'GEMINI_API_KEY manquante' }, { status: 500 });
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

    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: extractionSchema,
      },
    });

    const result = await model.generateContent([
      { text: extractionPrompt },
      {
        inlineData: {
          mimeType,
          data: bytes.toString('base64'),
        },
      },
    ]);

    const rawText = result.response.text();
    const cleaned = cleanModelResponse(rawText);
    const extractedBase = JSON.parse(cleaned) as any;

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
