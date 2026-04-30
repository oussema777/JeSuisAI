import { SchemaType } from '@google/generative-ai';
import { GeminiClient } from './geminiClient';
import { buildAnalyzePrompt, buildDocumentToMissionPrompt, buildFormAssistantChatPrompt, buildOptimizeMissionPrompt, buildPrePublishPolishPrompt, buildSectionFocusedPrompt, detectSectionTarget } from './promptTemplates';
import { computeGlobalScore } from './scoringEngine';

import { truncateForField } from './textTruncation';
let geminiClient: GeminiClient | null = null;

const documentExtractionPrompt = `
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

const documentExtractionSchema = {
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
} as const;

function resolveGeminiApiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
}

function getGeminiClient() {
  if (geminiClient) return geminiClient;

  const apiKey = resolveGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is required. Set GEMINI_API_KEY (or GOOGLE_GEMINI_API_KEY / GOOGLE_API_KEY).');
  }

  geminiClient = new GeminiClient(apiKey);
  return geminiClient;
}

function cleanModelResponse(raw: string) {
  let cleaned = raw.trim();
  if (cleaned.includes('```json')) {
    cleaned = cleaned.replace(/```json\n?/, '').replace(/```\n?$/, '');
  } else if (cleaned.includes('```')) {
    cleaned = cleaned.replace(/```\n?/, '').replace(/```\n?$/, '');
  }
  return cleaned.trim();
}

export interface DetailedScores {
  description_coherence: number;
  impact_coherence: number;
  contribution_coherence: number;
  feasibility_realism: number;
  diaspora_alignment: number;
}

export interface DetailedMissionAnalysis {
  scores: DetailedScores;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  field_flags: {
    title?: string | null;
    description?: string | null;
    impacts?: string | null;
    contributions?: string | null;
  };
  global_score: number;
}

export interface OptimizedMissionVersion {
  optimized_title: string;
  optimized_description: string;
  optimized_impacts: string;
  optimized_contributions: string;
  optimized_conditions?: string;
  optimized_publicVise?: string;
  optimized_timingAction?: string;
  optimized_missionUrgente?: string;
  optimized_actionDistance?: string;
  optimized_remunerationPrevue?: string;
}

export interface AssistantChatResponse {
  assistant_message: string;
  follow_up_question?: string;
  consultation_points?: string[];
  quick_replies?: string[];
  status_chips?: Array<{
    label: string;
    state: 'resolved' | 'pending' | 'clear';
  }>;
  suggested_updates?: {
    optimized_title?: string;
    optimized_description?: string;
    optimized_impacts?: string;
    optimized_contributions?: string;
  };
  perfected_draft?: {
    optimized_title?: string;
    optimized_description?: string;
    optimized_impacts?: string;
    optimized_contributions?: string;
  };
}

export interface SectionFocusedResponse {
  assistant_message: string;
  suggested_value: string;
  explanation: string;
  section: string;
}

export interface DocumentInferredMission {
  intituleAction?: string;
  domaineAction?: string;
  descriptionGenerale?: string;
  impactsObjectifs?: string;
  detailsContributions?: string;
  conditionsMission?: string;
  publicVise?: string;
  missionUrgente?: string;
  actionDistance?: string;
  timingAction?: string;
  remunerationPrevue?: string;
}

export async function inferMissionFromDocumentFile(data: {
  mimeType: string;
  bytes: Uint8Array;
}) {
  const response = await getGeminiClient().generateContent(
    [
      { text: documentExtractionPrompt },
      {
        inlineData: {
          mimeType: data.mimeType,
          data: Buffer.from(data.bytes).toString('base64'),
        },
      },
    ],
    {
      temperature: 0.2,
      schema: documentExtractionSchema,
    }
  );

  const cleanedResponse = cleanModelResponse(response);
  return JSON.parse(cleanedResponse) as Record<string, string>;
}

export interface PrePublishPolishedMission {
  intituleAction: string;
  descriptionGenerale: string;
  impactsObjectifs: string;
  detailsContributions: string;
  conditionsMission: string;
  detailRemuneration: string;
  facilitesAutres: string;
  remunerationAutre: string;
}

export async function analyzeMission(data: {
  domain: string;
  title: string;
  description?: string;
  impactsObjectifs?: string;
}) {
  const prompt = buildAnalyzePrompt(data);

  const response = await getGeminiClient().generate(prompt);
  const cleanedResponse = cleanModelResponse(response);
  
  console.log('[AI] Cleaned response:', cleanedResponse);

  const analysisResult = JSON.parse(cleanedResponse) as unknown as DetailedMissionAnalysis;
  
  // Compute weighted global score
  const globalScore = computeGlobalScore(analysisResult.scores);
  
  return {
    ...analysisResult,
    global_score: globalScore
  };
}

export async function optimizeMissionVersion(data: {
  mission: {
    contributionTypes?: string;
    domain?: string;
    title?: string;
    description?: string;
    impactsObjectifs?: string;
    detailsContributions?: string;
    conditionsMission?: string;
    publicVise?: string;
    timingAction?: string;
    missionUrgente?: string;
    actionDistance?: string;
    remunerationPrevue?: string;
  };
  analysis: {
    scores?: Record<string, number>;
    strengths?: string[];
    weaknesses?: string[];
    recommendations?: string[];
    field_flags?: Record<string, string | null | undefined>;
  };
  chat_context?: {
    summary?: string;
    messages?: Array<{ role: "user" | "assistant"; content: string }>;
    draft_updates?: {
      optimized_title?: string;
      optimized_description?: string;
      optimized_impacts?: string;
      optimized_contributions?: string;
    };
  };
}) {
  const prompt = buildOptimizeMissionPrompt(data);
  const response = await getGeminiClient().generate(prompt);

  const cleanedResponse = cleanModelResponse(response);
  const parsed = JSON.parse(cleanedResponse) as OptimizedMissionVersion;

  const normalizeEnum = (value: string | undefined, allowed: string[]) => {
    const normalized = (value || '').trim().toLowerCase();
    if (!normalized) return '';
    return allowed.includes(normalized) ? normalized : '';
  };

  return {
    ...parsed,
    optimized_title: truncateForField(parsed.optimized_title || '', 'title'),
    optimized_description: truncateForField(parsed.optimized_description || '', 'description'),
    optimized_impacts: truncateForField(parsed.optimized_impacts || '', 'impacts'),
    optimized_contributions: truncateForField(parsed.optimized_contributions || '', 'contributions'),
    optimized_conditions: truncateForField(parsed.optimized_conditions || '', 'conditions'),
    optimized_publicVise: normalizeEnum(parsed.optimized_publicVise, ['tous', 'diaspora']),
    optimized_timingAction: normalizeEnum(parsed.optimized_timingAction, ['permanente', 'ponctuelle', 'urgente']),
    optimized_missionUrgente: normalizeEnum(parsed.optimized_missionUrgente, ['oui', 'non']),
    optimized_actionDistance: normalizeEnum(parsed.optimized_actionDistance, ['oui', 'non', 'partiellement']),
    optimized_remunerationPrevue: normalizeEnum(parsed.optimized_remunerationPrevue, ['benevole', 'remuneration', 'defraiement-local', 'defraiement-complet', 'autre']),
  } as OptimizedMissionVersion;
}

export async function chatWithMissionAssistant(data: {
  mission: {
    domain?: string;
    title?: string;
    description?: string;
    impactsObjectifs?: string;
    detailsContributions?: string;
    contributionTypes?: string;
  };
  analysis?: {
    strengths?: string[];
    weaknesses?: string[];
    recommendations?: string[];
    field_flags?: Record<string, string | null | undefined>;
  };
  missing_context_fields?: string[];
  conversation: Array<{ role: "user" | "assistant"; content: string }>;
  userMessage: string;
  language?: 'fr' | 'en';
}) {
  const prompt = buildFormAssistantChatPrompt(data);
  const response = await getGeminiClient().generate(prompt);

  const cleanedResponse = cleanModelResponse(response);
  const parsed = JSON.parse(cleanedResponse) as AssistantChatResponse;

  if (parsed.suggested_updates) {
    if (parsed.suggested_updates.optimized_title) {
      parsed.suggested_updates.optimized_title = truncateForField(parsed.suggested_updates.optimized_title, 'title');
    }
    if (parsed.suggested_updates.optimized_description) {
      parsed.suggested_updates.optimized_description = truncateForField(parsed.suggested_updates.optimized_description, 'description');
    }
    if (parsed.suggested_updates.optimized_impacts) {
      parsed.suggested_updates.optimized_impacts = truncateForField(parsed.suggested_updates.optimized_impacts, 'impacts');
    }
    if (parsed.suggested_updates.optimized_contributions) {
      parsed.suggested_updates.optimized_contributions = truncateForField(parsed.suggested_updates.optimized_contributions, 'contributions');
    }
  }

  if (parsed.perfected_draft) {
    if (parsed.perfected_draft.optimized_title) {
      parsed.perfected_draft.optimized_title = truncateForField(parsed.perfected_draft.optimized_title, 'title');
    }
    if (parsed.perfected_draft.optimized_description) {
      parsed.perfected_draft.optimized_description = truncateForField(parsed.perfected_draft.optimized_description, 'description');
    }
    if (parsed.perfected_draft.optimized_impacts) {
      parsed.perfected_draft.optimized_impacts = truncateForField(parsed.perfected_draft.optimized_impacts, 'impacts');
    }
    if (parsed.perfected_draft.optimized_contributions) {
      parsed.perfected_draft.optimized_contributions = truncateForField(parsed.perfected_draft.optimized_contributions, 'contributions');
    }
  }

  return parsed;
}

export async function chatSectionFocused(data: {
  section: string; // "title" | "description" | "impacts" | "contributions"
  currentValue: string;
  mission: {
    domain?: string;
    title?: string;
    description?: string;
    impactsObjectifs?: string;
    detailsContributions?: string;
    contributionTypes?: string;
  };
  analysis?: {
    strengths?: string[];
    weaknesses?: string[];
    recommendations?: string[];
    field_flags?: Record<string, string | null | undefined>;
  };
  userMessage: string;
  language?: 'fr' | 'en';
}) {
  const prompt = buildSectionFocusedPrompt(data);
  const response = await getGeminiClient().generate(prompt);

  const cleanedResponse = cleanModelResponse(response);

  const parsed = JSON.parse(cleanedResponse);
  return {
    assistant_message: parsed.assistant_message || '',
    suggested_value: truncateForField(
      parsed.suggested_value || '',
      data.section === 'title'
        ? 'title'
        : data.section === 'impacts'
          ? 'impacts'
          : data.section === 'contributions'
            ? 'contributions'
            : 'description'
    ),
    explanation: parsed.explanation || '',
    section: data.section,
  } as SectionFocusedResponse;
}

export function getSectionTargetFromUserMessage(userMessage: string): { section: string | null; confidence: "explicit" | "inferred" | null } {
  return detectSectionTarget(userMessage);
}

export async function inferMissionFromDocumentContext(data: {
  documentContext: string;
  currentMission?: {
    domain?: string;
    title?: string;
    description?: string;
    impactsObjectifs?: string;
    detailsContributions?: string;
    publicVise?: string;
    missionUrgente?: string;
    actionDistance?: string;
    timingAction?: string;
    remunerationPrevue?: string;
  };
}) {
  const prompt = buildDocumentToMissionPrompt(data);
  const response = await getGeminiClient().generate(prompt, { temperature: 0.3 });

  const cleanedResponse = cleanModelResponse(response);

  const parsed = JSON.parse(cleanedResponse) as DocumentInferredMission;

  return {
    ...parsed,
    intituleAction: truncateForField(parsed.intituleAction || '', 'title'),
    descriptionGenerale: truncateForField(parsed.descriptionGenerale || '', 'description'),
    impactsObjectifs: truncateForField(parsed.impactsObjectifs || '', 'impacts'),
    detailsContributions: truncateForField(parsed.detailsContributions || '', 'contributions'),
    conditionsMission: truncateForField(parsed.conditionsMission || '', 'conditions'),
  } as DocumentInferredMission;
}

export async function polishMissionBeforePublish(data: {
  title?: string;
  description?: string;
  impactsObjectifs?: string;
  detailsContributions?: string;
  conditionsMission?: string;
  detailRemuneration?: string;
  facilitesAutres?: string;
  remunerationAutre?: string;
}) {
  const prompt = buildPrePublishPolishPrompt(data);
  const response = await getGeminiClient().generate(prompt, { temperature: 0.2 });

  const cleanedResponse = cleanModelResponse(response);
  const parsed = JSON.parse(cleanedResponse) as Partial<PrePublishPolishedMission>;

  return {
    intituleAction: truncateForField(parsed.intituleAction ?? data.title ?? '', 'title'),
    descriptionGenerale: truncateForField(parsed.descriptionGenerale ?? data.description ?? '', 'description'),
    impactsObjectifs: truncateForField(parsed.impactsObjectifs ?? data.impactsObjectifs ?? '', 'impacts'),
    detailsContributions: truncateForField(parsed.detailsContributions ?? data.detailsContributions ?? '', 'contributions'),
    conditionsMission: truncateForField(parsed.conditionsMission ?? data.conditionsMission ?? '', 'conditions'),
    detailRemuneration: truncateForField(parsed.detailRemuneration ?? data.detailRemuneration ?? '', 'impacts'),
    facilitesAutres: parsed.facilitesAutres ?? data.facilitesAutres ?? '',
    remunerationAutre: parsed.remunerationAutre ?? data.remunerationAutre ?? '',
  } as PrePublishPolishedMission;
}
