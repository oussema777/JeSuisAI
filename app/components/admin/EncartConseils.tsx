"use client";

import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  Expand,
  Circle,
  CircleAlert,
  Bot,
  Eye,
  FileUp,
  Lightbulb,
  Loader2,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { getScoreColor, getScoreLabel } from '@/lib/ai/scoringEngine';
import { useLocale } from 'next-intl';
import type {
  AssistantChatResponse,
  DetailedMissionAnalysis,
  OptimizedMissionVersion,
} from '@/lib/ai/missionAgent';
import { FormulaireOpportunite, type FormDataOpportunite, type InlineFieldSuggestion, type SuggestionFieldKey } from './FormulaireOpportunite';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type StatusChip = {
  label: string;
  state: 'resolved' | 'pending' | 'clear';
};

function splitAssistantMessage(content: string) {
  const normalized = content
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const chunks: string[] = [];

  normalized.forEach((line) => {
    if (line.length <= 260) {
      chunks.push(line);
      return;
    }

    const sentences = line.split(/(?<=[.!?])\s+/).filter(Boolean);
    if (sentences.length <= 1) {
      // Fallback slicing for very long lines without clear punctuation.
      for (let i = 0; i < line.length; i += 240) {
        chunks.push(line.slice(i, i + 240).trim());
      }
      return;
    }

    let bucket = '';
    sentences.forEach((sentence) => {
      const candidate = bucket ? `${bucket} ${sentence}` : sentence;
      if (candidate.length > 260) {
        if (bucket) chunks.push(bucket.trim());
        bucket = sentence;
      } else {
        bucket = candidate;
      }
    });

    if (bucket) chunks.push(bucket.trim());
  });

  return chunks.filter(Boolean);
}

function buildPersonalizedAnalysisIntro(
  analysis: DetailedMissionAnalysis,
  isFrench: boolean,
  mission: {
    domain?: string;
    title?: string;
    description?: string;
    impactsObjectifs?: string;
    detailsContributions?: string;
  }
) {

  const flaggedFields = Object.entries(analysis.field_flags || {})
    .filter(([, value]) => Boolean(value))
    .map(([field]) => field);

  const fieldLabelMapFr: Record<string, string> = {
    title: 'titre',
    description: 'description',
    impacts: 'objectifs/impacts',
    contributions: 'contributions',
  };

  const fieldLabelMapEn: Record<string, string> = {
    title: 'title',
    description: 'description',
    impacts: 'objectives/impact',
    contributions: 'contributions',
  };

  const labels = flaggedFields.map((field) =>
    isFrench ? (fieldLabelMapFr[field] || field) : (fieldLabelMapEn[field] || field)
  );

  const priorityWeakness = (analysis.weaknesses || []).find(Boolean);
  const priorityRecommendation = (analysis.recommendations || []).find(Boolean);

  const safeTitle = (mission.title || '').trim();
  const safeDomain = (mission.domain || '').trim();
  const safeDescription = (mission.description || '').trim();
  const safeImpacts = (mission.impactsObjectifs || '').trim();

  const intro = isFrench
    ? safeTitle && safeDomain
      ? `Merci pour les details. J'ai bien lu votre mission "${safeTitle}" dans le domaine "${safeDomain}".`
      : safeTitle
      ? `Merci pour les details. J'ai bien lu votre mission "${safeTitle}".`
      : 'Merci pour le contexte partage, je viens de passer sur votre mission.'
    : safeTitle && safeDomain
    ? `Thanks for the details. I carefully reviewed your mission "${safeTitle}" in the "${safeDomain}" domain.`
    : safeTitle
    ? `Thanks for the details. I carefully reviewed your mission "${safeTitle}".`
    : 'Thanks for the context, I just reviewed your mission.';

  const userContext = isFrench
    ? safeDescription
      ? `Vous indiquez actuellement: ${safeDescription.slice(0, 180)}${safeDescription.length > 180 ? '...' : ''}`
      : safeImpacts
      ? `Vos objectifs mentionnes: ${safeImpacts.slice(0, 180)}${safeImpacts.length > 180 ? '...' : ''}`
      : null
    : safeDescription
    ? `You currently describe it as: ${safeDescription.slice(0, 180)}${safeDescription.length > 180 ? '...' : ''}`
    : safeImpacts
    ? `Your stated objectives are: ${safeImpacts.slice(0, 180)}${safeImpacts.length > 180 ? '...' : ''}`
    : null;

  const focus = isFrench
    ? labels.length > 0
      ? `Si on veut l'ameliorer rapidement, je vous propose de commencer par: ${labels.join(', ')}.`
      : 'Le fond est deja bien pose, on peut surtout affiner la formulation pour gagner en impact.'
    : labels.length > 0
    ? `If we want quick improvement, I suggest starting with: ${labels.join(', ')}.`
    : 'The core is already solid; we can mostly sharpen the wording to increase impact.';

  const weakness = priorityWeakness
    ? (isFrench ? `Le point qui freine le plus en ce moment: ${priorityWeakness}` : `The biggest blocker right now is: ${priorityWeakness}`)
    : null;

  const recommendation = priorityRecommendation
    ? (isFrench ? `Je vous propose ceci en premier: ${priorityRecommendation}` : `Here is what I suggest first: ${priorityRecommendation}`)
    : null;

  const closing = isFrench
    ? 'Vous pouvez me donner un contexte general ou des points precis a retravailler, puis cliquer sur Generer pour obtenir une version complete enrichie avec ce contexte.'
    : 'You can share general context or specific areas you want help with, then click Generate to get a complete version enriched with that context.';

  return [intro, userContext, focus, weakness, recommendation, closing].filter(Boolean) as string[];
}

type EncartConseilsProps = {
  formData: FormDataOpportunite;
  aiResult: DetailedMissionAnalysis | null;
  optimizedVersion: OptimizedMissionVersion | null;
  onAiResult: (result: DetailedMissionAnalysis | null) => void;
  onOptimizedVersion: (result: OptimizedMissionVersion | null) => void;
  onAssistantResponse: (response: AssistantChatResponse | null) => void;
  onApplyFieldUpdates: (updates: Partial<FormDataOpportunite>) => void;
  onDraftModeChange?: (isDraftMode: boolean) => void;
  onInlineSuggestionChange?: (suggestion: InlineFieldSuggestion | null) => void;
};

function buildMissionPayload(formData: FormDataOpportunite) {
  return {
    domain: formData.domaineAction,
    title: formData.intituleAction,
    description: formData.descriptionGenerale,
    impactsObjectifs: formData.impactsObjectifs,
    detailsContributions: formData.detailsContributions,
  };
}

function mapExtractedToForm(extracted: Record<string, string | undefined>): Partial<FormDataOpportunite> {
  return {
    intituleAction: extracted.intituleAction ?? '',
    domaineAction: extracted.domaineAction ?? '',
    descriptionGenerale: extracted.descriptionGenerale ?? '',
    impactsObjectifs: extracted.impactsObjectifs ?? '',
    detailsContributions: extracted.detailsContributions ?? '',
    conditionsMission: extracted.conditionsMission ?? '',
    publicVise: extracted.publicVise ?? '',
    missionUrgente: extracted.missionUrgente ?? '',
    actionDistance: extracted.actionDistance ?? '',
    timingAction: extracted.timingAction ?? '',
    remunerationPrevue: extracted.remunerationPrevue ?? '',
  };
}

export function EncartConseils({
  formData,
  aiResult,
  optimizedVersion,
  onAiResult,
  onOptimizedVersion,
  onAssistantResponse,
  onApplyFieldUpdates,
  onDraftModeChange,
  onInlineSuggestionChange,
}: EncartConseilsProps) {
  const locale = useLocale();
  const isFrench = locale.startsWith('fr');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [pendingSuggestedUpdates, setPendingSuggestedUpdates] = useState<AssistantChatResponse['suggested_updates'] | null>(null);
  const [perfectedDraft, setPerfectedDraft] = useState<AssistantChatResponse['perfected_draft'] | null>(null);
  const [consultationPoints, setConsultationPoints] = useState<string[]>([]);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [statusChips, setStatusChips] = useState<StatusChip[]>([]);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isChatOverlayOpen, setIsChatOverlayOpen] = useState(false);
  const [isDraftMode, setIsDraftMode] = useState(false);
  const [draftFormData, setDraftFormData] = useState<FormDataOpportunite>(formData);
  const [selectedDocument, setSelectedDocument] = useState<File | null>(null);
  const [documentExtractionGuidance, setDocumentExtractionGuidance] = useState('');

  const missionPayload = useMemo(() => buildMissionPayload(formData), [formData]);
  const hasMinimumMissionContext =
    missionPayload.domain.trim().length > 0 &&
    missionPayload.title.trim().length > 0;
  const extractionContextText = isFrench
    ? `Contexte actuel - Titre: ${formData.intituleAction || 'non renseigne'} | Domaine: ${formData.domaineAction || 'non renseigne'}`
    : `Current context - Title: ${formData.intituleAction || 'not provided'} | Domain: ${formData.domaineAction || 'not provided'}`;

  const technicalReport = useMemo(() => {
    if (!aiResult) return null;
    return {
      global_score: aiResult.global_score,
      scores: aiResult.scores,
      strengths: aiResult.strengths,
      weaknesses: aiResult.weaknesses,
      recommendations: aiResult.recommendations,
      field_flags: aiResult.field_flags,
    };
  }, [aiResult]);

  const ui = {
    title: isFrench ? 'Assistant IA mission' : 'AI Mission Assistant',
    analyze: isFrench ? 'Analyser la mission' : 'Analyze mission',
    analyzing: isFrench ? 'Analyse en cours...' : 'Analyzing...',
    minimumContext: isFrench
      ? 'Complétez au moins le domaine et le titre pour lancer l\'analyse.'
      : 'Fill at least domain and title to run analysis.',
    chatTitle: isFrench ? 'Chat assistant' : 'Assistant chat',
    chatPlaceholder: isFrench
      ? 'Ex: Comment rendre cette mission plus concrète ?'
      : 'Ex: How can we make this mission more concrete?',
    chatEmpty: isFrench
      ? 'Commencez une conversation naturelle avec l\'assistant.'
      : 'Start a natural conversation with the assistant.',
    sending: isFrench ? 'Envoi...' : 'Sending...',
    send: isFrench ? 'Envoyer' : 'Send',
    generateFinal: isFrench ? 'Générer Formulaire Amélioré' : 'Generate Improved Form',
    generatingFinal: isFrench ? 'Génération en cours...' : 'Generating...',
    extractTitle: isFrench ? 'Extraction document' : 'Document extraction',
    extract: isFrench ? 'Extraire et pré-remplir' : 'Extract and pre-fill',
    extracting: isFrench ? 'Extraction...' : 'Extracting...',
    workspaceHint: isFrench
      ? 'L\'espace de travail principal est dans le chat ci-dessous.'
      : 'The main workspace is in the chat below.',
    technicalReport: isFrench ? 'Voir le rapport technique complet' : 'View Full Technical Report',
    aiGeneratedForm: isFrench ? 'Formulaire IA généré' : 'AI-generated form',
    compareDraft: isFrench
      ? 'Comparez avec le formulaire original puis choisissez Keep ou Discard.'
      : 'Compare with the original form, then choose Keep or Discard.',
    keep: 'Keep',
    discard: 'Discard',
    statusPending: isFrench ? 'À traiter' : 'Pending',
    statusResolved: isFrench ? 'Résolu' : 'Resolved',
    statusClear: isFrench ? 'Stable' : 'Clear',
    typing: isFrench ? 'Assistant IA écrit' : 'AI assistant is typing',
    assistantName: isFrench ? 'Assistant IA' : 'AI Assistant',
    you: isFrench ? 'Vous' : 'You',
    openOverlay: isFrench ? 'Agrandir le chat' : 'Expand chat',
    closeOverlay: isFrench ? 'Réduire' : 'Collapse',
    chatOverlayTitle: isFrench ? 'Assistant IA - Vue étendue' : 'AI Assistant - Expanded view',
    reportTitle: isFrench ? 'Rapport technique complet' : 'Full technical report',
    close: isFrench ? 'Fermer' : 'Close',
    globalScore: isFrench ? 'Score global' : 'Global score',
    pmDecision: isFrench ? 'Avis chef de projet' : 'Project manager assessment',
    notEvaluable: isFrench ? 'Non évaluable - dossier incomplet' : 'Not evaluable - incomplete dossier',
    refineBeforeSelection: isFrench ? 'À retravailler avant sélection' : 'Needs refinement before selection',
    conditionalPotential: isFrench ? 'Potentiel sous conditions' : 'Potential with conditions',
    selectionReady: isFrench ? 'Recevable pour présélection' : 'Eligible for pre-selection',
    scoringBreakdown: isFrench ? 'Détail des scores' : 'Score breakdown',
    strengths: isFrench ? 'Forces' : 'Strengths',
    weaknesses: isFrench ? 'Faiblesses' : 'Weaknesses',
    recommendations: isFrench ? 'Recommandations' : 'Recommendations',
    priorityPlan: isFrench ? 'Plan d\'amélioration priorisé' : 'Prioritized improvement plan',
    technicalFlags: isFrench ? 'Flags techniques' : 'Technical flags',
    none: isFrench ? 'Aucune' : 'None',
    // Document extraction workflow
    docExtractTitle: isFrench ? 'Démarrer avec un document' : 'Start with a document',
    docExtractGuide: isFrench
      ? 'Pour pré-remplir rapidement le formulaire, téléchargez un document et dites-moi ce sur quoi je dois me concentrer.'
      : 'To quickly pre-fill the form, upload a document and tell me what to focus on.',
    docExtractGuidancePlaceholder: isFrench
      ? 'Ex: Extrayez les principaux objectifs, les activités clés et le budget requis.'
      : 'Ex: Extract the main objectives, key activities, and required budget.',
    docExtractHint: isFrench 
      ? 'Décrivez ce que vous souhaitez que je concentre dans le document'
      : 'Describe what you want me to focus on in the document',
    fillDocument: isFrench ? 'Remplir Document' : 'Fill from Document',
    fillingDocument: isFrench ? 'Extraction et remplissage...' : 'Extracting and filling...',
  };

  const adminAssessment = useMemo(() => {
    if (!technicalReport) return null;

    const flags = Object.entries(technicalReport.field_flags || {}).filter(([, value]) => Boolean(value));
    const lowScore = technicalReport.global_score <= 1.5;
    const insufficientData = lowScore && flags.length >= 2;

    const decision = insufficientData
      ? { label: ui.notEvaluable, tone: 'text-slate-700 bg-slate-100 border-slate-200' }
      : technicalReport.global_score < 4
      ? { label: ui.refineBeforeSelection, tone: 'text-red-700 bg-red-50 border-red-200' }
      : technicalReport.global_score < 6
      ? { label: ui.conditionalPotential, tone: 'text-amber-700 bg-amber-50 border-amber-200' }
      : { label: ui.selectionReady, tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' };

    const prioritizedActions = flags.slice(0, 3).map(([field, value], index) => {
      const fieldLabel = isFrench
        ? field === 'title'
          ? 'Titre'
          : field === 'description'
          ? 'Description'
          : field === 'impacts'
          ? 'Objectifs/Impacts'
          : field === 'contributions'
          ? 'Contributions'
          : field
        : field;

      return `${index + 1}. ${fieldLabel}: ${String(value)}`;
    });

    return {
      decision,
      insufficientData,
      prioritizedActions,
    };
  }, [technicalReport, ui.notEvaluable, ui.refineBeforeSelection, ui.conditionalPotential, ui.selectionReady, isFrench]);

  useEffect(() => {
    onDraftModeChange?.(isDraftMode);
  }, [isDraftMode, onDraftModeChange]);

  useEffect(() => {
    // Keep the AI-side form aligned with the full original form structure
    // whenever we are not actively reviewing a generated draft.
    if (!isDraftMode) {
      setDraftFormData(formData);
    }
  }, [formData, isDraftMode]);

  const ingestAssistantData = (data: AssistantChatResponse) => {
    setPendingSuggestedUpdates(data.suggested_updates || null);
    setPerfectedDraft((prev) => ({ ...(prev || {}), ...(data.perfected_draft || data.suggested_updates || {}) }));
    setConsultationPoints(data.consultation_points || []);
    setQuickReplies((data.quick_replies || []).slice(0, 4));
    setStatusChips((data.status_chips || []) as StatusChip[]);
  };

  const sendChatMessage = async (
    rawMessage: string,
    options?: { includeUserMessage?: boolean; analysisSnapshot?: DetailedMissionAnalysis | null }
  ) => {
    const message = rawMessage.trim();
    if (!message) return;

    const includeUserMessage = options?.includeUserMessage !== false;
    const nextConversation = includeUserMessage
      ? [...chatHistory, { role: 'user' as const, content: message }]
      : [...chatHistory];

    if (includeUserMessage) {
      setChatHistory(nextConversation);
    }

    try {
      setError(null);
      setIsChatting(true);
      setIsAssistantTyping(true);

      const response = await fetch('/api/ai/form-assistant-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mission: missionPayload,
          analysis: options?.analysisSnapshot ?? aiResult,
          conversation: nextConversation,
          userMessage: message,
          language: isFrench ? 'fr' : 'en',
        }),
      });

      const data = (await response.json()) as AssistantChatResponse & { 
        error?: string
        details?: string
        section_focused?: boolean
        targeted_section?: string
        suggested_value?: string
        explanation?: string
      };
      if (!response.ok) {
        throw new Error(data?.details || data?.error || 'Le chat IA a échoué');
      }

      // Handle section-focused response
      if (data.section_focused && data.targeted_section) {
        const sectionToFieldMap: Record<string, SuggestionFieldKey> = {
          title: 'intituleAction',
          description: 'descriptionGenerale',
          impacts: 'impactsObjectifs',
          contributions: 'detailsContributions',
          domain: 'domaineAction',
        };

        const mappedField = sectionToFieldMap[data.targeted_section];
        if (mappedField && data.suggested_value) {
          onInlineSuggestionChange?.({
            field: mappedField,
            value: data.suggested_value,
            explanation: data.explanation || (isFrench ? 'Suggestion d\'amelioration ciblee.' : 'Targeted improvement suggestion.'),
          });
        }

        const assistantMessage = data.assistant_message || 'Suggestion proposée.';
        const messageChunks = splitAssistantMessage(assistantMessage);
        const assistantBubbles = messageChunks.map((chunk) => ({
          role: 'assistant' as const,
          content: chunk,
        }));
        setChatHistory((prev) => [...prev, ...assistantBubbles]);
      } else {
        // Regular chat response
        onInlineSuggestionChange?.(null);
        const assistantMessage = data.assistant_message || 'Je n\'ai pas de suggestion pour le moment.';
        const messageChunks = splitAssistantMessage(assistantMessage);
        const followUpChunk = data.follow_up_question ? [`Question: ${data.follow_up_question}`] : [];
        const assistantBubbles = [...messageChunks, ...followUpChunk].map((chunk) => ({
          role: 'assistant' as const,
          content: chunk,
        }));

        setChatHistory((prev) => [...prev, ...assistantBubbles]);
        ingestAssistantData(data);
      }

      onAssistantResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chat IA');
    } finally {
      setIsChatting(false);
      setIsAssistantTyping(false);
    }
  };

  const handleAnalyzeMission = async () => {
    try {
      setError(null);
      setIsAnalyzing(true);

      const response = await fetch('/api/ai/analyze-mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(missionPayload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.details || data?.error || 'Analyse impossible');
      }

      const analysis = data as DetailedMissionAnalysis;
      onAiResult(analysis);

      const fallbackConsultationPoints = [
        ...(analysis.weaknesses || []).slice(0, 2),
        ...(analysis.recommendations || []).slice(0, 1),
      ].filter(Boolean);
      setConsultationPoints(fallbackConsultationPoints);
      if (!statusChips.length) {
        setStatusChips([
          { label: isFrench ? 'Titre' : 'Title', state: analysis.field_flags?.title ? 'pending' : 'resolved' },
          { label: isFrench ? 'Description' : 'Description', state: analysis.field_flags?.description ? 'pending' : 'resolved' },
          { label: isFrench ? 'Objectifs/Impacts' : 'Objectives/Impact', state: analysis.field_flags?.impacts ? 'pending' : 'resolved' },
        ]);
      }
      if (!quickReplies.length) {
        setQuickReplies(
          isFrench
            ? ['Reecris mon titre', 'Ameliore ma description', 'Clarifie mes objectifs']
            : ['Rewrite my title', 'Improve my description', 'Clarify my objectives']
        );
      }

      setChatHistory((prev) => {
        if (prev.length > 0) return prev;
        const seededMessages = buildPersonalizedAnalysisIntro(analysis, isFrench, missionPayload)
          .flatMap((line) => splitAssistantMessage(line))
          .map((chunk) => ({ role: 'assistant' as const, content: chunk }));
        return seededMessages;
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'analyse IA');
      onAiResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOptimizeMission = async () => {
    if (!aiResult) {
      setError('Veuillez lancer une analyse IA avant l\'optimisation.');
      return;
    }

    try {
      setError(null);
      setIsOptimizing(true);

      const response = await fetch('/api/ai/optimize-mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mission: {
            ...missionPayload,
            conditionsMission: formData.conditionsMission,
            publicVise: formData.publicVise,
            timingAction: formData.timingAction,
            missionUrgente: formData.missionUrgente,
            actionDistance: formData.actionDistance,
            remunerationPrevue: formData.remunerationPrevue,
          },
          analysis: aiResult,
          chatContext: {
            summary: 'Optimisation depuis la page de création mission',
            messages: chatHistory,
            draftUpdates: pendingSuggestedUpdates || {},
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.details || data?.error || 'Optimisation impossible');
      }

      const optimized = data as OptimizedMissionVersion;
      onOptimizedVersion(optimized);
      setPerfectedDraft((prev) => ({ ...(prev || {}), ...optimized }));
      setDraftFormData({
        ...formData,
        intituleAction: optimized.optimized_title || formData.intituleAction || '',
        descriptionGenerale: optimized.optimized_description || formData.descriptionGenerale || '',
        impactsObjectifs: optimized.optimized_impacts || formData.impactsObjectifs || '',
        detailsContributions: optimized.optimized_contributions || formData.detailsContributions || '',
        conditionsMission: optimized.optimized_conditions || formData.conditionsMission || '',
        publicVise: optimized.optimized_publicVise || formData.publicVise || '',
        timingAction: optimized.optimized_timingAction || formData.timingAction || '',
        missionUrgente: optimized.optimized_missionUrgente || formData.missionUrgente || '',
        actionDistance: optimized.optimized_actionDistance || formData.actionDistance || '',
        remunerationPrevue: optimized.optimized_remunerationPrevue || formData.remunerationPrevue || '',
      });
      setIsDraftMode(true);
      const optimizeNote = splitAssistantMessage(
        isFrench
          ? 'Draft final généré. Une version pré-remplie est affichée. Choisissez Keep ou Discard.'
          : 'Final draft generated. A pre-filled version is now shown. Choose Keep or Discard.'
      );
      setChatHistory((prev) => [
        ...prev,
        ...optimizeNote.map((chunk) => ({ role: 'assistant' as const, content: chunk })),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'optimisation IA');
      onOptimizedVersion(null);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSendChat = async () => {
    const message = chatInput.trim();
    if (!message) return;
    setChatInput('');
    await sendChatMessage(message, { includeUserMessage: true });
  };

  const handleQuickReply = async (reply: string) => {
    await sendChatMessage(reply, { includeUserMessage: true });
  };

  const handleExtractFromDocument = async () => {
    if (!selectedDocument) {
      setError(isFrench ? 'Veuillez sélectionner un document à analyser.' : 'Please select a document to analyze.');
      return;
    }

    if (!documentExtractionGuidance.trim()) {
      setError(isFrench ? 'Veuillez décrire ce sur quoi je dois me concentrer.' : 'Please describe what I should focus on.');
      return;
    }

    try {
      setError(null);
      setIsExtracting(true);

      const multipart = new FormData();
      multipart.append('file', selectedDocument);
      multipart.append(
        'currentMission',
        JSON.stringify({
          ...missionPayload,
          conditionsMission: formData.conditionsMission,
          publicVise: formData.publicVise,
          missionUrgente: formData.missionUrgente,
          actionDistance: formData.actionDistance,
          timingAction: formData.timingAction,
          remunerationPrevue: formData.remunerationPrevue,
        })
      );
      multipart.append('extractionGuidance', documentExtractionGuidance);

      const response = await fetch('/api/ai/extract-mission-from-document', {
        method: 'POST',
        body: multipart,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.details || data?.error || (isFrench ? 'Extraction impossible' : 'Extraction failed'));
      }

      const extractedPatch = mapExtractedToForm(data.extracted || {});
      setDraftFormData({
        ...formData,
        intituleAction: extractedPatch.intituleAction || formData.intituleAction || '',
        descriptionGenerale: extractedPatch.descriptionGenerale || formData.descriptionGenerale || '',
        impactsObjectifs: extractedPatch.impactsObjectifs || formData.impactsObjectifs || '',
        detailsContributions: extractedPatch.detailsContributions || formData.detailsContributions || '',
        conditionsMission: extractedPatch.conditionsMission || formData.conditionsMission || '',
        domaineAction: extractedPatch.domaineAction || formData.domaineAction || '',
        publicVise: extractedPatch.publicVise || formData.publicVise || '',
        missionUrgente: extractedPatch.missionUrgente || formData.missionUrgente || '',
        actionDistance: extractedPatch.actionDistance || formData.actionDistance || '',
        timingAction: extractedPatch.timingAction || formData.timingAction || '',
        remunerationPrevue: extractedPatch.remunerationPrevue || formData.remunerationPrevue || '',
      });
      setIsDraftMode(true);
      setSelectedDocument(null);
      setDocumentExtractionGuidance('');

      // Add success message to chat
      const extractionNote = splitAssistantMessage(
        isFrench
          ? 'Document analyse et version pre-remplie generee. Comparez puis choisissez Keep ou Discard.'
          : 'Document analyzed and pre-filled version generated. Compare and choose Keep or Discard.'
      );
      setChatHistory((prev) => [
        ...prev,
        ...extractionNote.map((chunk) => ({ role: 'assistant' as const, content: chunk })),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : isFrench ? 'Erreur pendant l\'extraction documentaire' : 'Document extraction error');
    } finally {
      setIsExtracting(false);
    }
  };

  const keepDraftReview = () => {
    onApplyFieldUpdates(draftFormData);
    setIsDraftMode(false);
    setChatHistory((prev) => [
      ...prev,
      { role: 'assistant', content: isFrench ? 'Version conservée. Le formulaire a été mis à jour.' : 'Draft kept. The form has been updated.' },
    ]);
  };

  const discardDraftReview = () => {
    setIsDraftMode(false);
    setChatHistory((prev) => [
      ...prev,
      { role: 'assistant', content: isFrench ? 'Version ignorée. On continue avec la discussion actuelle.' : 'Draft discarded. We can continue the current discussion.' },
    ]);
  };


  if (isDraftMode) {
    return (
      <div className="animate-in fade-in-0 slide-in-from-right-4 duration-300">
        <div className="rounded-xl p-[1px] bg-gradient-to-br from-primary/50 via-amber-300/40 to-primary/20 shadow-[0_12px_40px_-20px_rgba(0,0,0,0.4)]">
          <div className="bg-white rounded-xl overflow-hidden">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-neutral-900 mb-2" style={{ fontSize: '25px', fontWeight: 600 }}>
                    {ui.aiGeneratedForm}
                  </h4>
                  <p className="text-neutral-600" style={{ fontSize: '14px', fontWeight: 400 }}>
                    {ui.compareDraft}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 pt-1">
                  <button
                    type="button"
                    onClick={discardDraftReview}
                    className="px-3 py-1.5 text-xs rounded-md border border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50"
                  >
                    {ui.discard}
                  </button>
                  <button
                    type="button"
                    onClick={keepDraftReview}
                    className="px-3 py-1.5 text-xs rounded-md bg-primary text-white hover:opacity-90"
                  >
                    {ui.keep}
                  </button>
                </div>
              </div>
            </div>

            <FormulaireOpportunite
              formData={draftFormData}
              setFormData={setDraftFormData}
              isSubmitting={false}
              showSuccess={false}
              errorMsg=""
              onSubmit={(e) => e.preventDefault()}
              onPreview={() => {}}
              hideFooter
              hideHeader
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 sticky top-24 space-y-5 animate-in fade-in-0 slide-in-from-left-2 duration-300">
      <div className="flex items-center gap-3">
        <Lightbulb className="w-5 h-5 text-primary" strokeWidth={2} />
        <h4 className="text-neutral-900" style={{ fontSize: '15px', fontWeight: 600 }}>
          {ui.title}
        </h4>
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      <section className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
          <Sparkles className="w-4 h-4 text-primary" /> Analyse
        </div>
        <button
          type="button"
          onClick={handleAnalyzeMission}
          disabled={isAnalyzing || !hasMinimumMissionContext}
          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary text-white disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
          {isAnalyzing ? ui.analyzing : ui.analyze}
        </button>
        {!hasMinimumMissionContext && (
          <p className="text-xs text-neutral-600">{ui.minimumContext}</p>
        )}

        {aiResult && (
          <div className="rounded-lg border border-primary/20 bg-white p-3 space-y-2">
            <p className="text-xs text-neutral-700">{ui.workspaceHint}</p>
          </div>
        )}
      </section>

      {!aiResult && (
      <section className="space-y-3">
        <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-neutral-900 mb-2">{ui.docExtractTitle}</p>
            <p className="text-xs text-neutral-700 mb-2">{ui.docExtractGuide}</p>
            <p className="text-xs text-neutral-500">{extractionContextText}</p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-neutral-700">{ui.extractTitle}</label>
            <input
              type="file"
              onChange={(e) => setSelectedDocument(e.target.files?.[0] || null)}
              accept=".pdf,.doc,.docx,.pptx,image/png,image/jpeg,image/webp"
              className="w-full text-xs border border-primary/20 rounded-lg p-2 file:mr-3 file:px-2 file:py-1 file:bg-primary/10 file:text-primary file:border-0 file:text-xs file:font-medium"
            />
            {selectedDocument && (
              <p className="text-xs text-emerald-700 font-medium">✓ {selectedDocument.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-neutral-700">{ui.docExtractHint}</label>
            <textarea
              value={documentExtractionGuidance}
              onChange={(e) => setDocumentExtractionGuidance(e.target.value)}
              placeholder={ui.docExtractGuidancePlaceholder}
              className="w-full rounded-lg border border-primary/20 bg-white p-2.5 text-sm min-h-[80px] focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <button
            type="button"
            onClick={handleExtractFromDocument}
            disabled={isExtracting || !selectedDocument || !documentExtractionGuidance.trim()}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-primary text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed font-semibold shadow-md transition"
          >
            {isExtracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
            {isExtracting ? ui.fillingDocument : ui.fillDocument}
          </button>
        </div>
      </section>
      )}

      {aiResult && (
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2 text-sm font-semibold text-neutral-800">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" /> {ui.chatTitle}
          </div>
          <button
            type="button"
            onClick={() => setIsChatOverlayOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-neutral-300 bg-white text-neutral-700 text-xs hover:bg-neutral-50"
          >
            <Expand className="w-3.5 h-3.5" /> {ui.openOverlay}
          </button>
        </div>
        {statusChips.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {statusChips.map((chip, index) => (
              <span
                key={`${chip.label}-${index}`}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] border ${chip.state === 'resolved'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : chip.state === 'clear'
                  ? 'bg-sky-50 text-sky-700 border-sky-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {chip.state === 'resolved' ? <CheckCircle2 className="w-3 h-3" /> : chip.state === 'clear' ? <Circle className="w-3 h-3" /> : <CircleAlert className="w-3 h-3" />}
                {chip.label}: {chip.state === 'resolved' ? ui.statusResolved : chip.state === 'clear' ? ui.statusClear : ui.statusPending}
              </span>
            ))}
          </div>
        )}
        <div className="max-h-[300px] overflow-y-auto rounded-xl border border-primary/20 bg-gradient-to-b from-white to-primary/5 p-3.5 space-y-3 shadow-inner">
          {chatHistory.length === 0 && (
            <p className="text-xs text-neutral-500">{ui.chatEmpty}</p>
          )}
          {chatHistory.map((msg, index) => (
            <div
              key={`${msg.role}-${index}`}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-3 py-2 shadow-sm border whitespace-pre-wrap text-xs leading-relaxed ${msg.role === 'user'
                  ? 'bg-primary text-white border-primary/80 rounded-br-md'
                  : 'bg-neutral-50 text-neutral-800 border-neutral-200 rounded-bl-md'
                }`}
              >
                <p className={`text-[11px] font-semibold mb-1 ${msg.role === 'user' ? 'text-white/85' : 'text-neutral-500'}`}>
                  {msg.role === 'user' ? ui.you : ui.assistantName}
                </p>
                <p>{msg.content}</p>
              </div>
            </div>
          ))}
          {isAssistantTyping && (
            <div className="flex justify-start">
              <div className="max-w-[88%] rounded-2xl px-3 py-2 shadow-sm border bg-neutral-50 text-neutral-800 border-neutral-200 rounded-bl-md">
                <p className="text-[11px] font-semibold mb-1 text-neutral-500">{ui.assistantName}</p>
                <div className="flex items-center gap-1.5" aria-label={ui.typing}>
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse [animation-delay:120ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse [animation-delay:240ms]" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={ui.chatPlaceholder}
            className="w-full rounded-lg border border-primary/20 bg-white p-2.5 text-sm min-h-[72px]"
          />
          <button
            type="button"
            onClick={handleSendChat}
            disabled={isChatting || !chatInput.trim()}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary text-white disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isChatting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
            {isChatting ? ui.sending : ui.send}
          </button>
          <button
            type="button"
            onClick={handleOptimizeMission}
            disabled={isOptimizing || !aiResult}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed font-semibold shadow-md"
          >
            {isOptimizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isOptimizing ? ui.generatingFinal : ui.generateFinal}
          </button>
          {quickReplies.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {quickReplies.map((reply, index) => (
                <button
                  key={`${reply}-${index}`}
                  type="button"
                  onClick={() => handleQuickReply(reply)}
                  className="px-2.5 py-1.5 rounded-full border border-primary/30 text-primary text-xs bg-primary/5 hover:bg-primary/10"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
      )}

      {aiResult && (
        <section className="space-y-3">
          <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-4 space-y-3">
            <div>
              <p className="text-sm font-semibold text-neutral-900 mb-2">{ui.docExtractTitle}</p>
              <p className="text-xs text-neutral-700 mb-2">{ui.docExtractGuide}</p>
              <p className="text-xs text-neutral-500">{extractionContextText}</p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-neutral-700">{ui.extractTitle}</label>
              <input
                type="file"
                onChange={(e) => setSelectedDocument(e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx,.pptx,image/png,image/jpeg,image/webp"
                className="w-full text-xs border border-primary/20 rounded-lg p-2 file:mr-3 file:px-2 file:py-1 file:bg-primary/10 file:text-primary file:border-0 file:text-xs file:font-medium"
              />
              {selectedDocument && (
                <p className="text-xs text-emerald-700 font-medium">✓ {selectedDocument.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-neutral-700">{ui.docExtractHint}</label>
              <textarea
                value={documentExtractionGuidance}
                onChange={(e) => setDocumentExtractionGuidance(e.target.value)}
                placeholder={ui.docExtractGuidancePlaceholder}
                className="w-full rounded-lg border border-primary/20 bg-white p-2.5 text-sm min-h-[80px] focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              type="button"
              onClick={handleExtractFromDocument}
              disabled={isExtracting || !selectedDocument || !documentExtractionGuidance.trim()}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-primary text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed font-semibold shadow-md transition"
            >
              {isExtracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
              {isExtracting ? ui.fillingDocument : ui.fillDocument}
            </button>
          </div>
        </section>
      )}

      {aiResult && (
        <section className="space-y-2">
          <button
            type="button"
            onClick={() => setIsReportOpen(true)}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50"
          >
            <Eye className="w-4 h-4" /> {ui.technicalReport}
          </button>
        </section>
      )}

      {isChatOverlayOpen && (
        <div className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4 sm:p-6 pt-20 sm:pt-24">
          <div className="w-full max-w-4xl h-[calc(100vh-8rem)] max-h-[860px] bg-white rounded-2xl border border-neutral-200 shadow-2xl flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-neutral-200 bg-white/95 flex items-center justify-between">
              <h5 className="text-sm font-semibold text-neutral-900">{ui.chatOverlayTitle}</h5>
              <button
                type="button"
                onClick={() => setIsChatOverlayOpen(false)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-neutral-300 bg-white text-neutral-700 text-xs hover:bg-neutral-50"
              >
                <ChevronDown className="w-3.5 h-3.5" /> {ui.closeOverlay}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-neutral-50">
              {chatHistory.length === 0 && (
                <p className="text-sm text-neutral-500">{ui.chatEmpty}</p>
              )}
              {chatHistory.map((msg, index) => (
                <div
                  key={`overlay-${msg.role}-${index}`}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} max-w-3xl mx-auto`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm border whitespace-pre-wrap text-xs leading-relaxed ${msg.role === 'user'
                      ? 'bg-primary text-white border-primary/80 rounded-br-md'
                      : 'bg-white text-neutral-800 border-neutral-200 rounded-bl-md'
                    }`}
                  >
                    <p className={`text-xs font-semibold mb-1 ${msg.role === 'user' ? 'text-white/85' : 'text-neutral-500'}`}>
                      {msg.role === 'user' ? ui.you : ui.assistantName}
                    </p>
                    <p>{msg.content}</p>
                  </div>
                </div>
              ))}
              {isAssistantTyping && (
                <div className="flex justify-start max-w-3xl mx-auto">
                  <div className="max-w-[85%] rounded-2xl px-4 py-3 shadow-sm border bg-neutral-50 text-neutral-800 border-neutral-200 rounded-bl-md">
                    <p className="text-xs font-semibold mb-1 text-neutral-500">{ui.assistantName}</p>
                    <div className="flex items-center gap-1.5" aria-label={ui.typing}>
                      <span className="w-2 h-2 rounded-full bg-neutral-400 animate-pulse" />
                      <span className="w-2 h-2 rounded-full bg-neutral-400 animate-pulse [animation-delay:120ms]" />
                      <span className="w-2 h-2 rounded-full bg-neutral-400 animate-pulse [animation-delay:240ms]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-neutral-200 space-y-3 bg-white">
              <div className="max-w-3xl mx-auto space-y-3">
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={ui.chatPlaceholder}
                  className="w-full rounded-xl border border-primary/20 bg-white p-3 text-sm min-h-[92px]"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleSendChat}
                    disabled={isChatting || !chatInput.trim()}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isChatting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                    {isChatting ? ui.sending : ui.send}
                  </button>
                  <button
                    type="button"
                    onClick={handleOptimizeMission}
                    disabled={isOptimizing || !aiResult}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed font-semibold"
                  >
                    {isOptimizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {isOptimizing ? ui.generatingFinal : ui.generateFinal}
                  </button>
                  {quickReplies.map((reply, index) => (
                    <button
                      key={`overlay-reply-${reply}-${index}`}
                      type="button"
                      onClick={() => handleQuickReply(reply)}
                      className="px-2.5 py-1.5 rounded-full border border-primary/30 text-primary text-xs bg-primary/5 hover:bg-primary/10"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isReportOpen && technicalReport && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-xl bg-white border border-neutral-200 shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-semibold text-neutral-900">{ui.reportTitle}</h5>
              <button
                type="button"
                onClick={() => setIsReportOpen(false)}
                className="text-xs px-2 py-1 rounded border border-neutral-300 hover:bg-neutral-50"
              >
                {ui.close}
              </button>
            </div>

            {adminAssessment && (
              <div className={`rounded-lg border px-3 py-2 ${adminAssessment.decision.tone}`}>
                <p className="text-xs font-semibold">{ui.pmDecision}</p>
                <p className="text-sm font-semibold mt-0.5">{adminAssessment.decision.label}</p>
                {adminAssessment.insufficientData && (
                  <p className="text-xs mt-1">
                    {isFrench
                      ? 'Le dossier est trop incomplet pour une sélection. Priorité: compléter les champs critiques avant nouvelle évaluation.'
                      : 'The dossier is too incomplete for selection. Priority: complete critical fields before reevaluation.'}
                  </p>
                )}
              </div>
            )}

            <p className="text-sm text-neutral-800">
              {ui.globalScore}:{' '}
              <span className={`font-semibold ${getScoreColor(technicalReport.global_score)}`}>
                {technicalReport.global_score}/10 ({getScoreLabel(technicalReport.global_score)})
              </span>
            </p>

            <div className="text-xs text-neutral-700 rounded-lg border border-neutral-200 p-3">
              <p className="font-semibold mb-2">{ui.scoringBreakdown}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <p>{isFrench ? 'Cohérence de la description' : 'Description coherence'}: {technicalReport.scores.description_coherence}</p>
                <p>{isFrench ? 'Cohérence des impacts' : 'Impact coherence'}: {technicalReport.scores.impact_coherence}</p>
                <p>{isFrench ? 'Cohérence des contributions' : 'Contribution coherence'}: {technicalReport.scores.contribution_coherence}</p>
                <p>{isFrench ? 'Réalisme / faisabilité' : 'Feasibility realism'}: {technicalReport.scores.feasibility_realism}</p>
                <p>{isFrench ? 'Alignement diaspora' : 'Diaspora alignment'}: {technicalReport.scores.diaspora_alignment}</p>
              </div>
            </div>

            <div className="text-xs text-neutral-700 space-y-3">
              <div>
                <p className="font-semibold mb-1">{ui.strengths}</p>
                <ul className="list-disc list-inside space-y-1">
                  {(technicalReport.strengths?.length ? technicalReport.strengths : [ui.none]).map((item, idx) => (
                    <li key={`strength-${idx}`}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-1">{ui.weaknesses}</p>
                <ul className="list-disc list-inside space-y-1">
                  {(technicalReport.weaknesses?.length ? technicalReport.weaknesses : [ui.none]).map((item, idx) => (
                    <li key={`weak-${idx}`}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-1">{ui.recommendations}</p>
                <ul className="list-disc list-inside space-y-1">
                  {(technicalReport.recommendations?.length ? technicalReport.recommendations : [ui.none]).map((item, idx) => (
                    <li key={`rec-${idx}`}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {adminAssessment && adminAssessment.prioritizedActions.length > 0 && (
              <div className="text-xs text-neutral-700 bg-amber-50 border border-amber-200 rounded p-3">
                <p className="font-semibold mb-1">{ui.priorityPlan}</p>
                {adminAssessment.prioritizedActions.map((item) => (
                  <p key={item} className="mb-1 last:mb-0">{item}</p>
                ))}
              </div>
            )}

            <div className="text-xs text-neutral-700 bg-neutral-50 border border-neutral-200 rounded p-3">
              <p className="font-semibold mb-1">{ui.technicalFlags}</p>
              {Object.entries(technicalReport.field_flags || {}).map(([key, value]) => (
                <p key={key}>{key}: {value ? String(value) : 'OK'}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
