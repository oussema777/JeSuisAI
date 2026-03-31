import { GeminiClient } from './geminiClient';
import { buildAnalyzePrompt, buildDocumentToMissionPrompt, buildFormAssistantChatPrompt, buildOptimizeMissionPrompt, buildSectionFocusedPrompt, detectSectionTarget } from './promptTemplates';
import { computeGlobalScore } from './scoringEngine';

let geminiClient: GeminiClient | null = null;

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

export async function analyzeMission(data: {
  domain: string;
  title: string;
  description?: string;
  impactsObjectifs?: string;
  detailsContributions?: string;
}) {
  const prompt = buildAnalyzePrompt(data);

  const response = await getGeminiClient().generate(prompt);
  
  // Clean response to handle markdown code blocks
  let cleanedResponse = response.trim();
  
  // Remove markdown code blocks if present
  if (cleanedResponse.includes('```json')) {
    cleanedResponse = cleanedResponse.replace(/```json\n?/, '').replace(/```\n?$/, '');
  } else if (cleanedResponse.includes('```')) {
    cleanedResponse = cleanedResponse.replace(/```\n?/, '').replace(/```\n?$/, '');
  }
  
  cleanedResponse = cleanedResponse.trim();
  
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

  let cleanedResponse = response.trim();

  if (cleanedResponse.includes('```json')) {
    cleanedResponse = cleanedResponse.replace(/```json\n?/, '').replace(/```\n?$/, '');
  } else if (cleanedResponse.includes('```')) {
    cleanedResponse = cleanedResponse.replace(/```\n?/, '').replace(/```\n?$/, '');
  }

  cleanedResponse = cleanedResponse.trim();
  const parsed = JSON.parse(cleanedResponse) as OptimizedMissionVersion;

  const normalizeEnum = (value: string | undefined, allowed: string[]) => {
    const normalized = (value || '').trim().toLowerCase();
    if (!normalized) return '';
    return allowed.includes(normalized) ? normalized : '';
  };

  return {
    ...parsed,
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

  let cleanedResponse = response.trim();

  if (cleanedResponse.includes('```json')) {
    cleanedResponse = cleanedResponse.replace(/```json\n?/, '').replace(/```\n?$/, '');
  } else if (cleanedResponse.includes('```')) {
    cleanedResponse = cleanedResponse.replace(/```\n?/, '').replace(/```\n?$/, '');
  }

  cleanedResponse = cleanedResponse.trim();

  return JSON.parse(cleanedResponse) as AssistantChatResponse;
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

  let cleanedResponse = response.trim();

  if (cleanedResponse.includes('```json')) {
    cleanedResponse = cleanedResponse.replace(/```json\n?/, '').replace(/```\n?$/, '');
  } else if (cleanedResponse.includes('```')) {
    cleanedResponse = cleanedResponse.replace(/```\n?/, '').replace(/```\n?$/, '');
  }

  cleanedResponse = cleanedResponse.trim();

  const parsed = JSON.parse(cleanedResponse);
  return {
    assistant_message: parsed.assistant_message || '',
    suggested_value: parsed.suggested_value || '',
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
    actionDistance?: string;
    timingAction?: string;
  };
}) {
  const prompt = buildDocumentToMissionPrompt(data);
  const response = await getGeminiClient().generate(prompt, { temperature: 0.3 });

  let cleanedResponse = response.trim();

  if (cleanedResponse.includes('```json')) {
    cleanedResponse = cleanedResponse.replace(/```json\n?/, '').replace(/```\n?$/, '');
  } else if (cleanedResponse.includes('```')) {
    cleanedResponse = cleanedResponse.replace(/```\n?/, '').replace(/```\n?$/, '');
  }

  cleanedResponse = cleanedResponse.trim();

  return JSON.parse(cleanedResponse) as DocumentInferredMission;
}
