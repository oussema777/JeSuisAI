"use client";

import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Bot,
  Eye,
  FileUp,
  Loader2,
  MessageSquare,
  Sparkles,
  X,
  Bell,
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
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

type StatusChip = {
  label: string;
  state: 'resolved' | 'pending' | 'clear';
};

type ConversationPhase = 'idle' | 'analyzed' | 'draft_ready' | 'applied';
type DocumentFlowStep = 'form' | 'reading' | 'applying' | 'done';

function getCurrentTimeLabel() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function buildMessage(role: 'user' | 'assistant', content: string): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    timestamp: getCurrentTimeLabel(),
  };
}

function getQuickRepliesForPhase(phase: ConversationPhase, isFrench: boolean): string[] {
  if (phase === 'analyzed') {
    return isFrench
      ? ['Quels sont les points faibles ?', 'Comment améliorer le titre ?', 'Générer une version améliorée']
      : ['What are the weak points?', 'How can I improve the title?', 'Generate an improved version'];
  }

  if (phase === 'draft_ready') {
    return isFrench
      ? ['Appliquer les modifications', 'Modifier un champ spécifique', 'Tout annuler']
      : ['Apply changes', 'Edit a specific field', 'Cancel everything'];
  }

  if (phase === 'applied') {
    return isFrench
      ? ['Analyser à nouveau', 'Voir le rapport complet']
      : ['Analyze again', 'View full report'];
  }

  return [];
}

function trapFocusInContainer(event: KeyboardEvent, container: HTMLElement | null) {
  if (!container || event.key !== 'Tab') return;

  const focusable = Array.from(
    container.querySelectorAll<HTMLElement>(
      'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => !el.hasAttribute('disabled'));

  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement as HTMLElement | null;

  if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

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
    contributionTypes?: string;
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
  const safeContributions = (mission.detailsContributions || '').trim();
  const safeContributionTypes = (mission.contributionTypes || '').trim();

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
      : safeContributions
      ? `Vos contributions attendues: ${safeContributions.slice(0, 180)}${safeContributions.length > 180 ? '...' : ''}`
      : null
    : safeDescription
    ? `You currently describe it as: ${safeDescription.slice(0, 180)}${safeDescription.length > 180 ? '...' : ''}`
    : safeImpacts
    ? `Your stated objectives are: ${safeImpacts.slice(0, 180)}${safeImpacts.length > 180 ? '...' : ''}`
    : safeContributions
    ? `Your expected contributions are: ${safeContributions.slice(0, 180)}${safeContributions.length > 180 ? '...' : ''}`
    : null;

  const contributionContext = safeContributionTypes
    ? isFrench
      ? `Types de contribution selectionnes: ${safeContributionTypes}.`
      : `Selected contribution types: ${safeContributionTypes}.`
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

  return [intro, userContext, contributionContext, focus, weakness, recommendation, closing].filter(Boolean) as string[];
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
  onAnalyzingStateChange?: (isAnalyzing: boolean) => void;
  hideFloatingFab?: boolean;
  externalTriggerEventName?: string;
};

function buildMissionPayload(formData: FormDataOpportunite) {
  const contributionTypes = Object.entries(formData.contributionsDiaspora || {})
    .filter(([, isSelected]) => Boolean(isSelected))
    .map(([key]) => key)
    .join(', ');

  return {
    domain: formData.domaineAction,
    title: formData.intituleAction,
    description: formData.descriptionGenerale,
    impactsObjectifs: formData.impactsObjectifs,
    detailsContributions: formData.detailsContributions,
    contributionTypes,
  };
}

function buildMissionSignature(payload: ReturnType<typeof buildMissionPayload>) {
  return JSON.stringify({
    domain: payload.domain.trim(),
    title: payload.title.trim(),
    description: payload.description.trim(),
    impactsObjectifs: payload.impactsObjectifs.trim(),
    detailsContributions: payload.detailsContributions.trim(),
    contributionTypes: payload.contributionTypes.trim(),
  });
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

type TechnicalReportSnapshot = {
  global_score: number;
  scores: DetailedMissionAnalysis['scores'];
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  field_flags?: DetailedMissionAnalysis['field_flags'];
};

type TechnicalReportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  technicalReport: TechnicalReportSnapshot | null;
  previousTechnicalReport: TechnicalReportSnapshot | null;
  adminAssessment: {
    decision: { label: string; tone: string };
    insufficientData: boolean;
    prioritizedActions: string[];
  } | null;
  ui: Record<string, string>;
  isFrench: boolean;
  missionTitle?: string;
  focusRing: string;
};

function TechnicalReportModal({
  isOpen,
  onClose,
  technicalReport,
  previousTechnicalReport,
  adminAssessment,
  ui,
  isFrench,
  missionTitle,
  focusRing,
}: TechnicalReportModalProps) {
  if (!isOpen || !technicalReport) return null;

  const modalRef = useRef<HTMLDivElement>(null);

  // [REPORT-UX] Reduced motion detection to disable non-essential animations.
  const [prefersReduced, setPrefersReduced] = useState(false);
  // [REPORT-UX] Mount animation trigger for bars/arc/verdict.
  const [animateIn, setAnimateIn] = useState(false);
  // [REPORT-UX] Collapsible detail sections.
  const [openSections, setOpenSections] = useState({
    strengths: true,
    weaknesses: true,
    recommendations: true,
    flags: false,
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReduced(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const id = window.requestAnimationFrame(() => setAnimateIn(true));
    return () => {
      window.cancelAnimationFrame(id);
      setAnimateIn(false);
    };
  }, [isOpen]);

  // [REPORT-UX] Focus trap + Escape close for dialog accessibility.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !modalRef.current) return;
      const focusable = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute('disabled'));

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    modalRef.current?.focus();
  }, [isOpen]);

  // [REPORT-UX] Shared score color utility.
  const scoreColor = (score: number) => (score >= 7.5 ? 'green' : score >= 5 ? 'amber' : 'red');

  // [REPORT-UX] Delta display utility.
  const deltaBadge = (prev: number, curr: number) => {
    const value = Number((curr - prev).toFixed(1));
    if (value > 0) {
      return <span className="text-green-600">↑ +{value}</span>;
    }
    if (value < 0) {
      return <span className="text-red-500">↓ {value}</span>;
    }
    return <span className="text-gray-400">— {value}</span>;
  };

  const dimensions = useMemo(() => {
    const rows = [
      {
        key: 'description_coherence',
        label: isFrench ? 'Cohérence description' : 'Description coherence',
        score: technicalReport.scores.description_coherence,
      },
      {
        key: 'impact_coherence',
        label: isFrench ? 'Cohérence impacts' : 'Impact coherence',
        score: technicalReport.scores.impact_coherence,
      },
      {
        key: 'contribution_coherence',
        label: isFrench ? 'Cohérence contributions' : 'Contribution coherence',
        score: technicalReport.scores.contribution_coherence,
      },
      {
        key: 'feasibility_realism',
        label: isFrench ? 'Faisabilité' : 'Feasibility',
        score: technicalReport.scores.feasibility_realism,
      },
      {
        key: 'diaspora_alignment',
        label: isFrench ? 'Alignement diaspora' : 'Diaspora alignment',
        score: technicalReport.scores.diaspora_alignment,
      },
    ];
    return rows.sort((a, b) => a.score - b.score);
  }, [isFrench, technicalReport]);

  const globalTone = scoreColor(technicalReport.global_score);
  const toneClasses = {
    green: 'text-green-700 bg-green-50 border-green-400',
    amber: 'text-amber-700 bg-amber-50 border-amber-400',
    red: 'text-red-700 bg-red-50 border-red-500',
  };

  const verdictClasses = (() => {
    if (!adminAssessment) return 'bg-neutral-50 border-l-4 border-neutral-300 text-neutral-700';
    const label = adminAssessment.decision.label.toLowerCase();
    if (label.includes('non évaluable') || label.includes('not evaluable')) {
      return 'bg-red-50 border-l-4 border-red-500 text-red-700';
    }
    if (label.includes('retravailler') || label.includes('refinement')) {
      return 'bg-orange-50 border-l-4 border-orange-400 text-orange-700';
    }
    if (label.includes('conditions') || label.includes('potential')) {
      return 'bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700';
    }
    return 'bg-green-50 border-l-4 border-green-500 text-green-700';
  })();

  const effortLabel = (index: number) => {
    if (index === 0) return isFrench ? 'rapide' : 'quick';
    if (index === 1) return isFrench ? 'moyen' : 'medium';
    return isFrench ? 'important' : 'high';
  };

  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(10, technicalReport.global_score));
  const progress = clampedScore / 10;
  const dashOffset = circumference * (1 - progress);
  const arcColor = globalTone === 'green' ? '#15803d' : globalTone === 'amber' ? '#b45309' : '#dc2626';

  const previousRows = previousTechnicalReport
    ? [
        {
          key: 'description_coherence',
          label: isFrench ? 'Description' : 'Description',
          prev: previousTechnicalReport.scores.description_coherence,
          curr: technicalReport.scores.description_coherence,
        },
        {
          key: 'impact_coherence',
          label: isFrench ? 'Impacts' : 'Impacts',
          prev: previousTechnicalReport.scores.impact_coherence,
          curr: technicalReport.scores.impact_coherence,
        },
        {
          key: 'contribution_coherence',
          label: isFrench ? 'Contributions' : 'Contributions',
          prev: previousTechnicalReport.scores.contribution_coherence,
          curr: technicalReport.scores.contribution_coherence,
        },
        {
          key: 'feasibility_realism',
          label: isFrench ? 'Faisabilité' : 'Feasibility',
          prev: previousTechnicalReport.scores.feasibility_realism,
          curr: technicalReport.scores.feasibility_realism,
        },
        {
          key: 'diaspora_alignment',
          label: isFrench ? 'Diaspora' : 'Diaspora',
          prev: previousTechnicalReport.scores.diaspora_alignment,
          curr: technicalReport.scores.diaspora_alignment,
        },
      ]
    : [];

  return (
    // [REPORT-UX] Dialog frame with compact max dimensions and two-panel body.
    <div className="fixed inset-0 z-[90] bg-black/40 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-title"
        className="w-full max-w-[880px] max-h-[88vh] rounded-2xl bg-white border border-neutral-200 shadow-2xl overflow-hidden"
      >
        {/* [REPORT-UX] Sticky modal header with mission title context. */}
        <div className="sticky top-0 z-20 bg-white">
          <div className="px-5 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h5 id="report-title" className="text-sm font-semibold text-neutral-900">{ui.reportTitle}</h5>
              <p className="text-xs text-neutral-500 truncate max-w-[420px]">{missionTitle || (isFrench ? 'Mission sans titre' : 'Untitled mission')}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-neutral-300 bg-white text-neutral-700 text-xs hover:bg-neutral-50 ${focusRing}`}
            >
              <X className="w-3.5 h-3.5" /> {ui.close}
            </button>
          </div>
          <div className="border-b border-neutral-200" />
        </div>

        <div className="flex flex-col sm:flex-row h-[calc(88vh-58px)]">
          {/* [REPORT-UX] Left panel: verdict + score ring + sorted dimensions + delta pills. */}
          <aside className="sm:w-[320px] shrink-0 border-r border-neutral-200 bg-neutral-50 p-4 space-y-4">
            <div
              className={`rounded-lg px-3 py-2 ${verdictClasses}`}
              style={prefersReduced ? undefined : { transform: animateIn ? 'translateX(0)' : 'translateX(-8px)', opacity: animateIn ? 1 : 0, transition: 'all 200ms ease-out' }}
            >
              <p className="text-xs font-semibold">{ui.pmDecision}</p>
              <p className="text-sm font-semibold mt-0.5">{adminAssessment?.decision.label || ui.none}</p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-4 flex flex-col items-center">
              <svg width="120" height="120" viewBox="0 0 120 120" aria-label={`${isFrench ? 'Score global' : 'Global score'}: ${technicalReport.global_score} ${isFrench ? 'sur 10' : 'out of 10'}`}>
                <circle cx="60" cy="60" r={radius} stroke="#e5e7eb" strokeWidth="10" fill="none" />
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  stroke={arcColor}
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  strokeDasharray={circumference}
                  strokeDashoffset={prefersReduced ? dashOffset : animateIn ? dashOffset : circumference}
                  style={prefersReduced ? undefined : { transition: 'stroke-dashoffset 600ms ease-out' }}
                />
                <text x="60" y="58" textAnchor="middle" className="fill-neutral-900" style={{ fontSize: '24px', fontWeight: 700 }}>
                  {technicalReport.global_score.toFixed(1)}
                </text>
                <text x="60" y="75" textAnchor="middle" className="fill-neutral-500" style={{ fontSize: '11px' }}>
                  /10
                </text>
              </svg>
              <p className={`mt-1 text-xs font-medium px-2 py-1 rounded border ${toneClasses[globalTone]}`}>
                {getScoreLabel(technicalReport.global_score)}
              </p>
            </div>

            <div className="space-y-2">
              {dimensions.map((dim) => {
                const tone = scoreColor(dim.score);
                const fillClass = tone === 'green' ? 'bg-green-500' : tone === 'amber' ? 'bg-amber-500' : 'bg-red-500';
                const dotClass = tone === 'green' ? 'bg-green-500' : tone === 'amber' ? 'bg-amber-500' : 'bg-red-500';
                return (
                  <div key={dim.key} className="rounded-lg border border-neutral-200 bg-white p-2">
                    <div className="flex items-center justify-between text-xs mb-1 gap-2">
                      <span className="inline-flex items-center gap-1.5 min-w-0">
                        <span className={`w-2 h-2 rounded-full ${dotClass}`} />
                        <span className="truncate">{dim.label}</span>
                      </span>
                      <span className="font-semibold">{dim.score.toFixed(1)}</span>
                    </div>
                    <div className="h-1.5 rounded bg-neutral-100 overflow-hidden">
                      <div
                        className={`h-full ${fillClass}`}
                        style={{
                          width: prefersReduced ? `${Math.max(0, Math.min(100, dim.score * 10))}%` : animateIn ? `${Math.max(0, Math.min(100, dim.score * 10))}%` : '0%',
                          transition: prefersReduced ? undefined : 'width 600ms ease-out',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {previousTechnicalReport && (
              <div className="rounded-lg border border-neutral-200 bg-white p-3 space-y-2">
                <p className="text-xs font-semibold text-neutral-900">{isFrench ? 'Évolution' : 'Delta'}</p>
                <div className="text-xs text-neutral-700 rounded-md bg-neutral-50 border border-neutral-200 px-2 py-1 flex items-center justify-between">
                  <span>{isFrench ? 'Global' : 'Global'}</span>
                  <span>
                    [{previousTechnicalReport.global_score.toFixed(1)} → {technicalReport.global_score.toFixed(1)}] {deltaBadge(previousTechnicalReport.global_score, technicalReport.global_score)}
                  </span>
                </div>
                {previousRows.map((row) => (
                  <div key={`delta-${row.key}`} className="text-xs text-neutral-700 rounded-md bg-neutral-50 border border-neutral-200 px-2 py-1 flex items-center justify-between">
                    <span className="truncate mr-2">{row.label}</span>
                    <span>
                      [{row.prev.toFixed(1)} → {row.curr.toFixed(1)}] {deltaBadge(row.prev, row.curr)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </aside>

          {/* [REPORT-UX] Right panel: sticky priorities + collapsible sections + technical details. */}
          <main className="flex-1 overflow-y-auto p-4 space-y-4">
            <p className="sticky top-0 z-10 text-xs text-neutral-500 bg-white/95 py-1">{isFrench ? 'Analyse détaillée' : 'Detailed analysis'}</p>

            <div className="sticky top-6 z-10 rounded-xl border border-amber-200 bg-amber-50 p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <CircleAlert className="w-4 h-4 text-amber-600" />
                <p className="text-xs font-semibold text-amber-800">{isFrench ? 'Actions prioritaires' : 'Priority actions'}</p>
              </div>
              <ol className="space-y-2">
                {(adminAssessment?.prioritizedActions?.slice(0, 3) || technicalReport.recommendations?.slice(0, 3) || []).map((action, index) => (
                  <li
                    key={`priority-action-${index}`}
                    className="rounded-lg bg-white border border-amber-100 p-2"
                    style={prefersReduced ? undefined : { opacity: animateIn ? 1 : 0, transform: animateIn ? 'translateY(0)' : 'translateY(6px)', transition: `all 220ms ease-out ${index * 60}ms` }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-[11px] px-1.5 py-0.5 rounded font-semibold ${index === 0 ? 'bg-red-100 text-red-700' : index === 1 ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        #{index + 1}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded border border-neutral-200 text-neutral-600">{effortLabel(index)}</span>
                    </div>
                    <p className="text-xs text-neutral-800 mt-1">{action}</p>
                  </li>
                ))}
              </ol>
            </div>

            <section className="rounded-xl border border-neutral-200 bg-white">
              <button
                type="button"
                aria-expanded={openSections.strengths}
                onClick={() => setOpenSections((prev) => ({ ...prev, strengths: !prev.strengths }))}
                className={`w-full px-3 py-2 text-left flex items-center justify-between ${focusRing}`}
              >
                <span className="text-sm font-semibold text-neutral-900">{ui.strengths}</span>
                <ChevronRight className={`w-4 h-4 text-neutral-500 transition ${openSections.strengths ? 'rotate-90' : ''}`} />
              </button>
              <div
                style={{ maxHeight: openSections.strengths ? '520px' : '0px', transition: prefersReduced ? undefined : 'max-height 300ms ease' }}
                className="overflow-hidden"
              >
                <div className="px-3 pb-3 space-y-1">
                  {(technicalReport.strengths?.length ? technicalReport.strengths : [ui.none]).map((item, index) => (
                    <p key={`strength-item-${index}`} className="text-xs text-neutral-700 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600 mt-0.5" /> {item}
                    </p>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-neutral-200 bg-white">
              <button
                type="button"
                aria-expanded={openSections.weaknesses}
                onClick={() => setOpenSections((prev) => ({ ...prev, weaknesses: !prev.weaknesses }))}
                className={`w-full px-3 py-2 text-left flex items-center justify-between ${focusRing}`}
              >
                <span className="text-sm font-semibold text-neutral-900">{ui.weaknesses}</span>
                <ChevronRight className={`w-4 h-4 text-neutral-500 transition ${openSections.weaknesses ? 'rotate-90' : ''}`} />
              </button>
              <div
                style={{ maxHeight: openSections.weaknesses ? '520px' : '0px', transition: prefersReduced ? undefined : 'max-height 300ms ease' }}
                className="overflow-hidden"
              >
                <div className="px-3 pb-3 space-y-1">
                  {(technicalReport.weaknesses?.length ? technicalReport.weaknesses : [ui.none]).map((item, index) => (
                    <p key={`weakness-item-${index}`} className="text-xs text-neutral-700 flex items-start gap-2">
                      <CircleAlert className="w-3.5 h-3.5 text-red-600 mt-0.5" /> {item}
                    </p>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-neutral-200 bg-white">
              <button
                type="button"
                aria-expanded={openSections.recommendations}
                onClick={() => setOpenSections((prev) => ({ ...prev, recommendations: !prev.recommendations }))}
                className={`w-full px-3 py-2 text-left flex items-center justify-between ${focusRing}`}
              >
                <span className="text-sm font-semibold text-neutral-900">{ui.recommendations}</span>
                <ChevronRight className={`w-4 h-4 text-neutral-500 transition ${openSections.recommendations ? 'rotate-90' : ''}`} />
              </button>
              <div
                style={{ maxHeight: openSections.recommendations ? '520px' : '0px', transition: prefersReduced ? undefined : 'max-height 300ms ease' }}
                className="overflow-hidden"
              >
                <div className="px-3 pb-3 space-y-1">
                  {(technicalReport.recommendations?.length ? technicalReport.recommendations : [ui.none]).map((item, index) => (
                    <p key={`recommendation-item-${index}`} className="text-xs text-neutral-700 flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-blue-600 mt-0.5" /> {item}
                    </p>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-neutral-200 bg-white p-3">
              <p className="text-sm font-semibold text-neutral-900 mb-2">{ui.priorityPlan}</p>
              <div className="space-y-3">
                {(adminAssessment?.prioritizedActions?.length ? adminAssessment.prioritizedActions : (technicalReport.recommendations || []).slice(0, 3)).map((item, index) => (
                  <div key={`plan-step-${index}`} className="pl-3 border-l border-neutral-200">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-neutral-900">{isFrench ? `Étape ${index + 1}` : `Step ${index + 1}`}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded border border-neutral-200 text-neutral-600">{effortLabel(index)}</span>
                    </div>
                    <p className="text-xs text-neutral-600 mt-0.5">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-neutral-200 bg-white">
              <button
                type="button"
                aria-expanded={openSections.flags}
                onClick={() => setOpenSections((prev) => ({ ...prev, flags: !prev.flags }))}
                className={`w-full px-3 py-2 text-left flex items-center justify-between ${focusRing}`}
              >
                <span className="text-sm font-semibold text-neutral-900">{ui.technicalFlags}</span>
                <ChevronRight className={`w-4 h-4 text-neutral-500 transition ${openSections.flags ? 'rotate-90' : ''}`} />
              </button>
              <div
                style={{ maxHeight: openSections.flags ? '520px' : '0px', transition: prefersReduced ? undefined : 'max-height 300ms ease' }}
                className="overflow-hidden"
              >
                <div className="px-3 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(technicalReport.field_flags || {}).map(([key, value]) => {
                    const stringValue = String(value || '').toLowerCase();
                    const state = !value ? 'ok' : stringValue.includes('partial') || stringValue.includes('partiel') ? 'partial' : 'missing';
                    const stateLabel = state === 'ok' ? 'OK' : state === 'partial' ? (isFrench ? 'Partiel' : 'Partial') : (isFrench ? 'Manquant' : 'Missing');
                    const stateTone = state === 'ok' ? 'text-green-700 bg-green-50' : state === 'partial' ? 'text-amber-700 bg-amber-50' : 'text-red-700 bg-red-50';
                    const stateIcon = state === 'ok' ? '✓' : state === 'partial' ? '⚠' : '✗';

                    return (
                      <div key={`flag-${key}`} className="rounded-md border border-neutral-200 px-2 py-1.5">
                        <p className="text-[11px] text-neutral-500 truncate">{key}</p>
                        <p className={`text-xs mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded ${stateTone}`}>
                          <span>{stateIcon}</span>
                          <span>{stateLabel}</span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {previousTechnicalReport && (
              <section className="rounded-xl border border-neutral-200 bg-white p-3">
                <p className="text-sm font-semibold text-neutral-900 mb-2">{isFrench ? 'Comparaison avec l\'analyse précédente' : 'Comparison with previous analysis'}</p>
                <div className="rounded-md bg-neutral-50 border border-neutral-200 p-2 text-xs flex items-center justify-between">
                  <span>{isFrench ? 'Score global' : 'Global score'}</span>
                  <span>
                    {previousTechnicalReport.global_score.toFixed(1)} → {technicalReport.global_score.toFixed(1)} {deltaBadge(previousTechnicalReport.global_score, technicalReport.global_score)}
                  </span>
                </div>
                <div className="mt-2 overflow-hidden rounded-md border border-neutral-200">
                  <div className="grid grid-cols-4 bg-neutral-50 text-[11px] font-semibold text-neutral-600 px-2 py-1">
                    <span>{isFrench ? 'Dimension' : 'Dimension'}</span>
                    <span>{isFrench ? 'Avant' : 'Prev'}</span>
                    <span>{isFrench ? 'Actuel' : 'Current'}</span>
                    <span>{isFrench ? 'Delta' : 'Delta'}</span>
                  </div>
                  {previousRows.map((row) => (
                    <div key={`cmp-${row.key}`} className="grid grid-cols-4 text-xs text-neutral-700 px-2 py-1 border-t border-neutral-100">
                      <span className="truncate pr-2">{row.label}</span>
                      <span>{row.prev.toFixed(1)}</span>
                      <span>{row.curr.toFixed(1)}</span>
                      <span>{deltaBadge(row.prev, row.curr)}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
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
  onAnalyzingStateChange,
  hideFloatingFab = false,
  externalTriggerEventName = 'encart-conseils-open-assistant',
}: EncartConseilsProps) {
  const locale = useLocale();
  const isFrench = locale.startsWith('fr');
  // [UX] Shared focus-ring token applied to all interactive elements.
  const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40';

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
  const [showFabBanner, setShowFabBanner] = useState(false);
  const [isDocumentExtractionModalOpen, setIsDocumentExtractionModalOpen] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isFabHovered, setIsFabHovered] = useState(false);
  const [shouldPulseFab, setShouldPulseFab] = useState(false);
  const [conversationPhase, setConversationPhase] = useState<ConversationPhase>('idle');
  const [documentFlowStep, setDocumentFlowStep] = useState<DocumentFlowStep>('form');
  const [expandedAssistantMessages, setExpandedAssistantMessages] = useState<string[]>([]);
  const [confirmDiscardDraft, setConfirmDiscardDraft] = useState(false);
  const [lastAnalyzedSignature, setLastAnalyzedSignature] = useState<string | null>(null);
  const [previousTechnicalReport, setPreviousTechnicalReport] = useState<TechnicalReportSnapshot | null>(null);

  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const chatModalRef = useRef<HTMLDivElement>(null);
  const reportModalRef = useRef<HTMLDivElement>(null);
  const documentModalRef = useRef<HTMLDivElement>(null);
  const fabContainerRef = useRef<HTMLDivElement>(null);

  const fabToastTimeoutRef = useRef<NodeJS.Timeout>();
  const fabPulseTimeoutRef = useRef<NodeJS.Timeout>();

  const missionPayload = useMemo(() => buildMissionPayload(formData), [formData]);
  const currentMissionSignature = useMemo(() => buildMissionSignature(missionPayload), [missionPayload]);
  const hasMinimumMissionContext =
    missionPayload.domain.trim().length > 0 &&
    missionPayload.title.trim().length > 0 &&
    missionPayload.detailsContributions.trim().length > 0 &&
    missionPayload.contributionTypes.trim().length > 0;
  const hasMissionChangedSinceAnalysis = Boolean(
    aiResult && lastAnalyzedSignature && currentMissionSignature !== lastAnalyzedSignature
  );
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

  const scoreDimensions = useMemo(() => {
    if (!technicalReport) return [];

    const dimensions = [
      {
        key: 'description_coherence',
        label: isFrench ? 'Cohérence de la description' : 'Description coherence',
        score: technicalReport.scores.description_coherence,
      },
      {
        key: 'impact_coherence',
        label: isFrench ? 'Cohérence des impacts' : 'Impact coherence',
        score: technicalReport.scores.impact_coherence,
      },
      {
        key: 'contribution_coherence',
        label: isFrench ? 'Cohérence des contributions' : 'Contribution coherence',
        score: technicalReport.scores.contribution_coherence,
      },
      {
        key: 'feasibility_realism',
        label: isFrench ? 'Réalisme / faisabilité' : 'Feasibility realism',
        score: technicalReport.scores.feasibility_realism,
      },
      {
        key: 'diaspora_alignment',
        label: isFrench ? 'Alignement diaspora' : 'Diaspora alignment',
        score: technicalReport.scores.diaspora_alignment,
      },
    ];

    return dimensions.sort((a, b) => a.score - b.score);
  }, [technicalReport, isFrench]);

  const topPriorityActions = useMemo(() => {
    if (!technicalReport?.recommendations?.length) return [];
    return technicalReport.recommendations.slice(0, 3);
  }, [technicalReport]);

  const reportComparison = useMemo(() => {
    if (!technicalReport || !previousTechnicalReport) return [];

    const fields = [
      {
        key: 'description_coherence',
        label: isFrench ? 'Description' : 'Description',
        current: technicalReport.scores.description_coherence,
        previous: previousTechnicalReport.scores.description_coherence,
      },
      {
        key: 'impact_coherence',
        label: isFrench ? 'Impacts' : 'Impacts',
        current: technicalReport.scores.impact_coherence,
        previous: previousTechnicalReport.scores.impact_coherence,
      },
      {
        key: 'contribution_coherence',
        label: isFrench ? 'Contributions' : 'Contributions',
        current: technicalReport.scores.contribution_coherence,
        previous: previousTechnicalReport.scores.contribution_coherence,
      },
      {
        key: 'feasibility_realism',
        label: isFrench ? 'Faisabilité' : 'Feasibility',
        current: technicalReport.scores.feasibility_realism,
        previous: previousTechnicalReport.scores.feasibility_realism,
      },
      {
        key: 'diaspora_alignment',
        label: isFrench ? 'Alignement diaspora' : 'Diaspora alignment',
        current: technicalReport.scores.diaspora_alignment,
        previous: previousTechnicalReport.scores.diaspora_alignment,
      },
    ];

    return fields.filter((field) => field.current !== field.previous);
  }, [isFrench, previousTechnicalReport, technicalReport]);

  const ui = {
    title: isFrench ? 'Assistant IA mission' : 'AI Mission Assistant',
    analyze: isFrench ? 'Analyser la mission' : 'Analyze mission',
    analyzing: isFrench ? 'Analyse en cours...' : 'Analyzing...',
    minimumContext: isFrench
      ? 'Complétez au moins le domaine, le titre, les contributions attendues et le type de contribution pour lancer l\'analyse.'
      : 'Fill at least the domain, title, expected contributions, and contribution type to run analysis.',
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
    fullReportInChat: isFrench ? 'Voir le rapport complet' : 'View full report',
    reanalysisDone: isFrench ? 'Réanalyse terminée - le rapport a été mis à jour et l\'ancien reste disponible pour comparaison.' : 'Re-analysis complete - the report has been updated and the previous version is still available for comparison.',
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
    reopenChat: isFrench ? 'Rouvrir le chat' : 'Reopen chat',
    reanalyze: isFrench ? 'Réanalyser' : 'Reanalyze',
    noChangesDetected: isFrench ? 'Aucun changement détecté' : 'No changes detected',
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
    onAnalyzingStateChange?.(isAnalyzing);
  }, [isAnalyzing, onAnalyzingStateChange]);

  // [UX] Allow a header-level trigger to open the assistant without relying on floating FAB placement.
  useEffect(() => {
    if (typeof window === 'undefined' || !externalTriggerEventName) return;

    const handleExternalTrigger = async (event: Event) => {
      const customEvent = event as CustomEvent<{ action?: 'analyze' | 'document' | 'chat' | 'reanalyze' }>;
      const action = customEvent.detail?.action || 'analyze';

      setShowFabBanner(false);

      if (isAnalyzing) {
        return;
      }

      if (action === 'document') {
        setError(null);
        setIsDocumentExtractionModalOpen(true);
        setDocumentFlowStep('form');
        return;
      }

      if (action === 'chat') {
        if (aiResult) {
          setError(null);
          setIsChatOverlayOpen(true);
          return;
        }
      }

      if (action === 'reanalyze') {
        if (!aiResult) {
          return;
        }

        if (!hasMissionChangedSinceAnalysis) {
          setError(ui.noChangesDetected);
          return;
        }

        setError(null);
        await handleAnalyzeMission();
        return;
      }

      if (action === 'analyze' && aiResult) {
        if (!hasMissionChangedSinceAnalysis) {
          setError(ui.noChangesDetected);
          return;
        }

        setError(null);
        await handleAnalyzeMission();
        return;
      }

      if (!hasMinimumMissionContext) {
        setError(ui.minimumContext);
        return;
      }

      setError(null);
      await handleAnalyzeMission();
    };

    window.addEventListener(externalTriggerEventName, handleExternalTrigger as EventListener);
    return () => {
      window.removeEventListener(externalTriggerEventName, handleExternalTrigger as EventListener);
    };
  }, [externalTriggerEventName, isAnalyzing, aiResult, hasMinimumMissionContext, ui.minimumContext]);

  // [UX] Readiness banner + one-time session pulse on first eligibility.
  useEffect(() => {
    if (!hasMinimumMissionContext || aiResult) return;

    setShowFabBanner(true);
    if (fabToastTimeoutRef.current) clearTimeout(fabToastTimeoutRef.current);
    fabToastTimeoutRef.current = setTimeout(() => setShowFabBanner(false), 6000);

    if (typeof window !== 'undefined') {
      const pulseKey = 'encart-conseils-fab-pulse-shown';
      const hasPulsed = window.sessionStorage.getItem(pulseKey) === 'true';

      if (!hasPulsed) {
        setShouldPulseFab(true);
        window.sessionStorage.setItem(pulseKey, 'true');
        if (fabPulseTimeoutRef.current) clearTimeout(fabPulseTimeoutRef.current);
        fabPulseTimeoutRef.current = setTimeout(() => setShouldPulseFab(false), 2200);
      }
    }

    return () => {
      if (fabToastTimeoutRef.current) clearTimeout(fabToastTimeoutRef.current);
      if (fabPulseTimeoutRef.current) clearTimeout(fabPulseTimeoutRef.current);
    };
  }, [hasMinimumMissionContext, aiResult]);

  // [UX] Focus chat input when overlay opens.
  useEffect(() => {
    if (!isChatOverlayOpen) return;
    const id = window.setTimeout(() => chatInputRef.current?.focus(), 30);
    return () => window.clearTimeout(id);
  }, [isChatOverlayOpen]);

  // [UX] Modal focus trapping and Escape priority handling.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isFabOpen) {
          event.preventDefault();
          setIsFabOpen(false);
          return;
        }
        if (isChatOverlayOpen) {
          event.preventDefault();
          setIsChatOverlayOpen(false);
          return;
        }
        if (isDocumentExtractionModalOpen) {
          event.preventDefault();
          setIsDocumentExtractionModalOpen(false);
          setDocumentFlowStep('form');
          return;
        }
        if (isReportOpen) {
          event.preventDefault();
          setIsReportOpen(false);
        }
      }

      const activeModal = isReportOpen
        ? reportModalRef.current
        : isDocumentExtractionModalOpen
        ? documentModalRef.current
        : isChatOverlayOpen
        ? chatModalRef.current
        : null;

      trapFocusInContainer(event, activeModal);
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isFabOpen, isChatOverlayOpen, isDocumentExtractionModalOpen, isReportOpen]);

  // [UX] Set initial focus inside opened modal/dialog surfaces.
  useEffect(() => {
    if (isChatOverlayOpen) {
      chatModalRef.current?.focus();
    } else if (isDocumentExtractionModalOpen) {
      documentModalRef.current?.focus();
    } else if (isReportOpen) {
      reportModalRef.current?.focus();
    }
  }, [isChatOverlayOpen, isDocumentExtractionModalOpen, isReportOpen]);

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
    const userMessage = buildMessage('user', message);
    const nextConversation = includeUserMessage ? [...chatHistory, userMessage] : [...chatHistory];

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
        const assistantBubbles = messageChunks.map((chunk) => buildMessage('assistant', chunk));
        setChatHistory((prev) => [...prev, ...assistantBubbles]);
      } else {
        // Regular chat response
        onInlineSuggestionChange?.(null);
        const assistantMessage = data.assistant_message || 'Je n\'ai pas de suggestion pour le moment.';
        const messageChunks = splitAssistantMessage(assistantMessage);
        const followUpChunk = data.follow_up_question ? [`Question: ${data.follow_up_question}`] : [];
        const assistantBubbles = [...messageChunks, ...followUpChunk].map((chunk) => buildMessage('assistant', chunk));

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

      const hadPreviousReport = Boolean(technicalReport);
      const previousSnapshot = technicalReport
        ? {
            global_score: technicalReport.global_score,
            scores: technicalReport.scores,
            strengths: technicalReport.strengths,
            weaknesses: technicalReport.weaknesses,
            recommendations: technicalReport.recommendations,
            field_flags: technicalReport.field_flags,
          }
        : null;

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
      if (previousSnapshot) {
        setPreviousTechnicalReport(previousSnapshot);
      }
      onAiResult(analysis);
      setLastAnalyzedSignature(currentMissionSignature);

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
      setConversationPhase('analyzed');
      setQuickReplies(getQuickRepliesForPhase('analyzed', isFrench));

      setChatHistory((prev) => {
        if (prev.length > 0) return prev;
        const seededMessages = buildPersonalizedAnalysisIntro(analysis, isFrench, missionPayload)
          .flatMap((line) => splitAssistantMessage(line))
          .map((chunk) => buildMessage('assistant', chunk));
        return seededMessages;
      });

      // Automatically open the expanded chat with smooth transition
      setTimeout(() => {
        setIsChatOverlayOpen(true);
      }, 300);

      setShowFabBanner(false);

      if (hadPreviousReport) {
        setChatHistory((prev) => [
          ...prev,
          buildMessage('assistant', ui.reanalysisDone),
        ]);
      }

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
      setConversationPhase('draft_ready');
      setQuickReplies(getQuickRepliesForPhase('draft_ready', isFrench));
      const optimizeNote = splitAssistantMessage(
        isFrench
          ? 'Draft final généré. Une version pré-remplie est affichée. Choisissez Keep ou Discard.'
          : 'Final draft generated. A pre-filled version is now shown. Choose Keep or Discard.'
      );
      setChatHistory((prev) => [
        ...prev,
        ...optimizeNote.map((chunk) => buildMessage('assistant', chunk)),
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
    const generateIntent = isFrench ? 'Générer une version améliorée' : 'Generate an improved version';
    const applyIntent = isFrench ? 'Appliquer les modifications' : 'Apply changes';
    const cancelIntent = isFrench ? 'Tout annuler' : 'Cancel everything';
    const reportIntent = isFrench ? 'Voir le rapport complet' : 'View full report';
    const analyzeIntent = isFrench ? 'Analyser à nouveau' : 'Analyze again';

    if (reply === generateIntent) {
      await handleOptimizeMission();
      return;
    }
    if (reply === applyIntent) {
      keepDraftReview();
      return;
    }
    if (reply === cancelIntent) {
      setConfirmDiscardDraft(true);
      return;
    }
    if (reply === reportIntent) {
      setIsReportOpen(true);
      return;
    }
    if (reply === analyzeIntent) {
      await handleAnalyzeMission();
      return;
    }

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
      setDocumentFlowStep('reading');

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

      setDocumentFlowStep('applying');

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
      setConversationPhase('draft_ready');
      setQuickReplies(getQuickRepliesForPhase('draft_ready', isFrench));
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
        ...extractionNote.map((chunk) => buildMessage('assistant', chunk)),
      ]);

      setDocumentFlowStep('done');
      window.setTimeout(() => {
        setIsDocumentExtractionModalOpen(false);
        setDocumentFlowStep('form');
        setIsChatOverlayOpen(true);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : isFrench ? 'Erreur pendant l\'extraction documentaire' : 'Document extraction error');
      setDocumentFlowStep('form');
    } finally {
      setIsExtracting(false);
    }
  };

  const keepDraftReview = () => {
    onApplyFieldUpdates(draftFormData);
    setIsDraftMode(false);
    setConfirmDiscardDraft(false);
    setConversationPhase('applied');
    setQuickReplies(getQuickRepliesForPhase('applied', isFrench));
    setChatHistory((prev) => [
      ...prev,
      buildMessage('assistant', isFrench ? 'Version conservée. Le formulaire a été mis à jour.' : 'Draft kept. The form has been updated.'),
    ]);
  };

  const discardDraftReview = () => {
    setIsDraftMode(false);
    setConfirmDiscardDraft(false);
    setConversationPhase('applied');
    setQuickReplies(getQuickRepliesForPhase('applied', isFrench));
    setChatHistory((prev) => [
      ...prev,
      buildMessage('assistant', isFrench ? 'Version ignorée. On continue avec la discussion actuelle.' : 'Draft discarded. We can continue the current discussion.'),
    ]);
  };

  const modifiedFieldLabels = useMemo(() => {
    const labels: string[] = [];
    const compare = [
      {
        key: 'intituleAction',
        label: isFrench ? 'Titre' : 'Title',
      },
      {
        key: 'descriptionGenerale',
        label: isFrench ? 'Description' : 'Description',
      },
      {
        key: 'detailsContributions',
        label: isFrench ? 'Compétences requises' : 'Required skills',
      },
      {
        key: 'impactsObjectifs',
        label: isFrench ? 'Objectifs' : 'Objectives',
      },
    ] as const;

    compare.forEach(({ key, label }) => {
      const before = String(formData[key] || '').trim();
      const after = String(draftFormData[key] || '').trim();
      if (before !== after) labels.push(label);
    });

    return labels;
  }, [draftFormData, formData, isFrench]);

  const isLongAssistantMessage = (message: ChatMessage) => {
    if (message.role !== 'assistant') return false;
    return message.content.split('\n').length > 5 || message.content.length > 420;
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
                  {/* [UX] Diff summary above actions for quicker review. */}
                  <p className="mt-2 text-xs text-neutral-700">
                    {isFrench
                      ? `${Math.max(modifiedFieldLabels.length, 3)} champs modifiés : ${(modifiedFieldLabels.length ? modifiedFieldLabels : ['Titre', 'Description', 'Compétences requises']).slice(0, 3).join(', ')}`
                      : `${Math.max(modifiedFieldLabels.length, 3)} fields changed: ${(modifiedFieldLabels.length ? modifiedFieldLabels : ['Title', 'Description', 'Required skills']).slice(0, 3).join(', ')}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 pt-1">
                  {/* [UX] Destructive action requires inline confirmation. */}
                  {confirmDiscardDraft ? (
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-[11px] text-amber-700 text-right max-w-[220px]">
                        {isFrench
                          ? 'Vous perdrez les suggestions IA - Confirmer l\'annulation?'
                          : 'You will lose AI suggestions - Confirm cancellation?'}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmDiscardDraft(false)}
                          className={`px-3 py-1.5 text-xs rounded-md border border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 ${focusRing}`}
                        >
                          {isFrench ? 'Retour' : 'Back'}
                        </button>
                        <button
                          type="button"
                          onClick={discardDraftReview}
                          className={`px-3 py-1.5 text-xs rounded-md border border-red-200 text-red-700 bg-white hover:bg-red-50 ${focusRing}`}
                        >
                          {isFrench ? 'Confirmer' : 'Confirm'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setConfirmDiscardDraft(true)}
                        className={`px-3 py-1.5 text-xs rounded-md border border-neutral-300 text-neutral-700 bg-white hover:border-red-200 hover:text-red-700 hover:bg-red-50 ${focusRing}`}
                      >
                        {isFrench ? 'Annuler' : 'Cancel'}
                      </button>
                      <button
                        type="button"
                        onClick={keepDraftReview}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-primary text-white hover:opacity-90 ${focusRing}`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {isFrench ? 'Appliquer au formulaire' : 'Apply to form'}
                      </button>
                    </>
                  )}
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
    <>
      {/* [UX] Inline contextual readiness banner with action link and custom slide-up entrance. */}
      {!hideFloatingFab && showFabBanner && hasMinimumMissionContext && !aiResult && (
        <div
          className="fixed bottom-24 right-6 z-40"
          style={{
            animation: 'uxFabBannerEnter 400ms ease-out forwards',
          }}
        >
          <div className="bg-white border border-primary/30 rounded-lg shadow-lg p-3 flex items-center gap-2 max-w-sm">
            <Bell className="w-4 h-4 text-primary flex-shrink-0" />
            <p className="text-xs text-neutral-700 font-medium leading-relaxed">
              {isFrench ? '✦ Votre mission est prête pour l\'analyse IA - ' : '✦ Your mission is ready for AI analysis - '}
              <button
                type="button"
                onClick={async () => {
                  setShowFabBanner(false);
                  await handleAnalyzeMission();
                }}
                className={`inline text-primary underline underline-offset-2 hover:opacity-80 ${focusRing}`}
              >
                {isFrench ? 'Analyser maintenant ->' : 'Analyze now ->'}
              </button>
            </p>
          </div>
        </div>
      )}

      {/* [UX] FAB with tooltip, one-time pulse, and two distinct expanded actions. */}
      {!hideFloatingFab && hasMinimumMissionContext && isAnalyzing && !aiResult && (
        <div className="fixed bottom-6 right-6 z-30 flex items-end gap-3">
          <button
            type="button"
            disabled
            aria-label={isFrench ? 'Analyse en cours' : 'Analysis in progress'}
            className={`relative flex items-center justify-center w-14 h-14 rounded-full bg-neutral-300 text-neutral-600 shadow-lg cursor-wait ${focusRing}`}
          >
            <Loader2 className="w-6 h-6 animate-spin" />
          </button>
          <div className="rounded-md bg-neutral-900 text-white text-xs px-2 py-1 shadow-md animate-in fade-in duration-150">
            {isFrench ? 'Analyse en cours…' : 'Analysis in progress…'}
          </div>
        </div>
      )}

      {!hideFloatingFab && hasMinimumMissionContext && !isAnalyzing && !aiResult && (
        <div ref={fabContainerRef} className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-2">
          {!isFabOpen && isFabHovered && (
            <div className="mb-1 rounded-md bg-neutral-900 text-white text-xs px-2 py-1 shadow-md animate-in fade-in duration-150">
              {isFrench ? 'Analyser ma mission' : 'Analyze my mission'}
            </div>
          )}

          {isFabOpen && (
            <div className="flex flex-col items-end gap-2">
              <button
                type="button"
                onClick={async () => {
                  setIsFabOpen(false);
                  setShowFabBanner(false);
                  await handleAnalyzeMission();
                }}
                className={`w-48 inline-flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-primary text-white text-sm font-medium shadow-md transition hover:opacity-90 ${focusRing}`}
              >
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {isFrench ? 'Analyser' : 'Analyze'}
                </span>
                <span className="text-[10px] text-white/80">{isFrench ? 'Action principale' : 'Primary action'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsDocumentExtractionModalOpen(true);
                  setDocumentFlowStep('form');
                  setIsFabOpen(false);
                  setShowFabBanner(false);
                }}
                className={`w-48 inline-flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white border border-primary/30 text-primary text-sm font-medium shadow-sm transition hover:bg-primary/5 ${focusRing}`}
              >
                <span className="inline-flex items-center gap-2">
                  <FileUp className="w-4 h-4" />
                  {isFrench ? 'Depuis un document' : 'From a document'}
                </span>
                <span className="text-[10px] text-primary/80">{isFrench ? 'Pré-remplissage' : 'Pre-fill'}</span>
              </button>
            </div>
          )}

          {isFabOpen && (
            <button
              type="button"
              onClick={async () => {
                setIsFabOpen(false);
                setShowFabBanner(false);
                await handleAnalyzeMission();
              }}
              className="hidden"
            />
          )}

          <button
            type="button"
            onClick={() => {
              setIsFabOpen((prev) => !prev);
              setShowFabBanner(false);
            }}
            onMouseEnter={() => setIsFabHovered(true)}
            onMouseLeave={() => setIsFabHovered(false)}
            aria-label={isFabOpen ? (isFrench ? 'Fermer l\'assistant IA' : 'Close AI assistant') : (isFrench ? 'Ouvrir l\'assistant IA' : 'Open AI assistant')}
            className={`relative animate-in zoom-in-50 duration-200 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transform transition-all hover:scale-110 ${focusRing} ${
              isFabOpen ? 'bg-red-500 text-white rotate-45' : 'bg-primary text-white hover:shadow-xl'
            }`}
          >
            {shouldPulseFab && (
              <span className="absolute inset-0 rounded-full bg-primary/25 animate-ping" aria-hidden="true" />
            )}
            {isFabOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Sparkles className="w-6 h-6" />
            )}
          </button>
        </div>
      )}

      {/* [UX] Post-analysis quick actions: reopen chat + gated reanalyze. */}
      {!hideFloatingFab && aiResult && (
        <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-3">
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => setIsChatOverlayOpen(true)}
              aria-label={ui.reopenChat}
              className={`relative flex items-center justify-center w-14 h-14 rounded-full bg-white border border-primary/30 text-primary shadow-lg hover:bg-primary/5 transition ${focusRing}`}
            >
              <MessageSquare className="w-6 h-6" />
            </button>
            <span className="text-[10px] text-neutral-600">{ui.reopenChat}</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={handleAnalyzeMission}
              disabled={isAnalyzing || !hasMissionChangedSinceAnalysis}
              aria-label={ui.reanalyze}
              className={`relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition ${
                hasMissionChangedSinceAnalysis
                  ? 'bg-primary text-white hover:shadow-xl hover:scale-105'
                  : 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
              } ${focusRing}`}
            >
              {isAnalyzing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
            </button>
            <span className={`text-[10px] ${hasMissionChangedSinceAnalysis ? 'text-neutral-600' : 'text-neutral-400'}`}>
              {ui.reanalyze}
            </span>
          </div>

          {!hasMissionChangedSinceAnalysis && (
            <p className="text-[11px] text-neutral-500 max-w-[120px] text-right">{ui.noChangesDetected}</p>
          )}
        </div>
      )}

      {/* [UX] Document modal now has progressive extraction states and focus trap. */}
      {isDocumentExtractionModalOpen && (
        <div className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            ref={documentModalRef}
            tabIndex={-1}
            className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200 p-6 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 space-y-4"
          >
            {documentFlowStep === 'form' ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-900">
                    {isFrench ? 'Démarrer avec un document' : 'Start with a document'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDocumentExtractionModalOpen(false);
                      setDocumentFlowStep('form');
                    }}
                    className={`text-neutral-500 hover:text-neutral-700 ${focusRing}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-sm text-neutral-600">
                  {isFrench
                    ? 'Téléchargez un document pour pré-remplir le formulaire. Décrivez ensuite ce sur quoi je dois me concentrer.'
                    : 'Upload a document to pre-fill the form. Then describe what I should focus on.'}
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      {isFrench ? 'Orientation (obligatoire)' : 'Focus area (required)'}
                    </label>
                    <textarea
                      value={documentExtractionGuidance}
                      onChange={(e) => setDocumentExtractionGuidance(e.target.value)}
                      placeholder={ui.docExtractGuidancePlaceholder}
                      className={`w-full rounded-lg border border-primary/20 bg-white p-3 text-sm min-h-[100px] ${focusRing}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      {ui.extractTitle}
                    </label>
                    <input
                      type="file"
                      onChange={(e) => setSelectedDocument(e.target.files?.[0] || null)}
                      accept=".pdf,.doc,.docx,.pptx,image/png,image/jpeg,image/webp"
                      className={`w-full text-sm border border-primary/20 rounded-lg p-2 file:mr-3 file:px-3 file:py-1.5 file:bg-primary/10 file:text-primary file:border-0 file:text-xs file:font-medium ${focusRing}`}
                    />
                    {selectedDocument && (
                      <p className="text-xs text-emerald-700 font-medium mt-2">✓ {selectedDocument.name}</p>
                    )}
                  </div>

                  <p className="text-xs text-neutral-500 bg-neutral-50 rounded p-2">
                    {extractionContextText}
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDocumentExtractionModalOpen(false);
                      setDocumentFlowStep('form');
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 text-sm font-medium ${focusRing}`}
                  >
                    {ui.close}
                  </button>
                  <button
                    type="button"
                    onClick={handleExtractFromDocument}
                    disabled={isExtracting || !selectedDocument || !documentExtractionGuidance.trim()}
                    className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium ${focusRing}`}
                  >
                    <FileUp className="w-4 h-4" />
                    {isFrench
                      ? 'Extraire le contenu et pré-remplir le formulaire'
                      : 'Extract content and pre-fill the form'}
                  </button>
                </div>
              </>
            ) : (
              <div className="min-h-[220px] flex flex-col items-center justify-center text-center gap-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm font-medium text-neutral-900">
                  {documentFlowStep === 'reading'
                    ? (isFrench ? 'Lecture du document en cours…' : 'Reading document...')
                    : documentFlowStep === 'applying'
                    ? (isFrench ? 'Application des données au formulaire…' : 'Applying extracted data to form...')
                    : (isFrench ? 'Finalisation…' : 'Finishing...')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-6 left-6 z-50 max-w-sm text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 shadow">
          {error}
        </div>
      )}

      {/* [UX] Chat overlay upgraded with assistant visuals, timestamps, and expandable long messages. */}
      {isChatOverlayOpen && (
        <div className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4 sm:p-6 pt-20 sm:pt-24 animate-in fade-in duration-300">
          <div
            ref={chatModalRef}
            tabIndex={-1}
            className="w-full max-w-4xl h-[calc(100vh-8rem)] max-h-[860px] bg-white rounded-2xl border border-neutral-200 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
          >
            <div className="px-5 py-3 border-b border-neutral-200 bg-white/95 flex items-center justify-between">
              <h5 className="text-sm font-semibold text-neutral-900">{ui.chatOverlayTitle}</h5>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsReportOpen(true)}
                  disabled={!aiResult}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-neutral-300 bg-white text-neutral-700 text-xs hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed ${focusRing}`}
                >
                  <Eye className="w-3.5 h-3.5" /> {ui.fullReportInChat}
                </button>
                <button
                  type="button"
                  onClick={() => setIsChatOverlayOpen(false)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-neutral-300 bg-white text-neutral-700 text-xs hover:bg-neutral-50 ${focusRing}`}
                >
                  <ChevronDown className="w-3.5 h-3.5" /> {ui.closeOverlay}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-neutral-50">
              {chatHistory.length === 0 && (
                <p className="text-sm text-neutral-500">{ui.chatEmpty}</p>
              )}
              {chatHistory.map((msg, index) => (
                <div
                  key={msg.id || `overlay-${msg.role}-${index}`}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} max-w-3xl mx-auto`}
                >
                  <div className="max-w-[85%]">
                    <div className={`flex ${msg.role === 'assistant' ? 'items-start gap-2' : 'items-start'}`}>
                      {msg.role === 'assistant' && (
                        <Bot className="w-5 h-5 mt-1 text-primary/55" />
                      )}
                      <div
                        className={`rounded-2xl px-4 py-3 shadow-sm border whitespace-pre-wrap text-xs leading-relaxed ${msg.role === 'user'
                          ? 'bg-primary text-white border-primary/80 rounded-br-md'
                          : 'bg-white text-neutral-800 border-neutral-200 border-l-4 border-l-primary rounded-bl-md'
                        }`}
                      >
                        <p className={`text-xs font-semibold mb-1 ${msg.role === 'user' ? 'text-white/85' : 'text-neutral-500'}`}>
                          {msg.role === 'user' ? ui.you : ui.assistantName}
                        </p>
                        <p
                          style={
                            msg.role === 'assistant' && isLongAssistantMessage(msg) && !expandedAssistantMessages.includes(msg.id)
                              ? { maxHeight: '7.5rem', overflow: 'hidden' }
                              : undefined
                          }
                        >
                          {msg.content}
                        </p>
                        {msg.role === 'assistant' && isLongAssistantMessage(msg) && (
                          <button
                            type="button"
                            onClick={() => {
                              setExpandedAssistantMessages((prev) =>
                                prev.includes(msg.id)
                                  ? prev.filter((id) => id !== msg.id)
                                  : [...prev, msg.id]
                              );
                            }}
                            className={`mt-2 text-[11px] text-primary underline underline-offset-2 ${focusRing}`}
                          >
                            {expandedAssistantMessages.includes(msg.id)
                              ? (isFrench ? 'Voir moins ↑' : 'Show less ↑')
                              : (isFrench ? 'Voir plus ↓' : 'See more ↓')}
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="mt-1 text-[11px] text-neutral-400 px-2">{msg.timestamp}</p>
                  </div>
                </div>
              ))}
              {isAssistantTyping && (
                <div className="flex justify-start max-w-3xl mx-auto">
                  <div className="max-w-[85%] flex items-start gap-2">
                    <Bot className="w-5 h-5 mt-1 text-primary/55" />
                    <div className="rounded-2xl px-4 py-3 shadow-sm border bg-neutral-50 text-neutral-800 border-neutral-200 border-l-4 border-l-primary rounded-bl-md">
                      <p className="text-xs font-semibold mb-1 text-neutral-500">{ui.assistantName}</p>
                      <div className="flex items-center gap-1.5" aria-label={ui.typing}>
                        <span className="w-2 h-2 rounded-full bg-neutral-400 animate-pulse" />
                        <span className="w-2 h-2 rounded-full bg-neutral-400 animate-pulse [animation-delay:120ms]" />
                        <span className="w-2 h-2 rounded-full bg-neutral-400 animate-pulse [animation-delay:240ms]" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-neutral-200 space-y-3 bg-white">
              <div className="max-w-3xl mx-auto space-y-3">
                <textarea
                  ref={chatInputRef}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={ui.chatPlaceholder}
                  className={`w-full rounded-xl border border-primary/20 bg-white p-3 text-sm min-h-[92px] ${focusRing}`}
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleSendChat}
                    disabled={isChatting || !chatInput.trim()}
                    className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white disabled:opacity-60 disabled:cursor-not-allowed ${focusRing}`}
                  >
                    {isChatting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                    {isChatting ? ui.sending : ui.send}
                  </button>
                  <button
                    type="button"
                    onClick={handleOptimizeMission}
                    disabled={isOptimizing || !aiResult}
                    className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed font-semibold ${focusRing}`}
                  >
                    {isOptimizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {isOptimizing ? ui.generatingFinal : ui.generateFinal}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsReportOpen(true)}
                    disabled={!aiResult}
                    className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 disabled:opacity-60 disabled:cursor-not-allowed ${focusRing}`}
                  >
                    <Eye className="w-4 h-4" />
                    {ui.fullReportInChat}
                  </button>
                  {quickReplies.map((reply, index) => (
                    <button
                      key={`overlay-reply-${reply}-${index}`}
                      type="button"
                      onClick={() => handleQuickReply(reply)}
                      className={`px-2.5 py-1.5 rounded-full border border-primary/30 text-primary text-xs bg-primary/5 hover:bg-primary/10 ${focusRing}`}
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

      <TechnicalReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        technicalReport={technicalReport}
        previousTechnicalReport={previousTechnicalReport}
        adminAssessment={adminAssessment}
        ui={ui}
        isFrench={isFrench}
        missionTitle={missionPayload.title}
        focusRing={focusRing}
      />

      {/* [UX] Inline keyframes for banner entrance animation. */}
      <style jsx>{`
        @keyframes uxFabBannerEnter {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

export { EncartConseils };
