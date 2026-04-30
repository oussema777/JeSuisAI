'use client';

import React, { useEffect, useRef } from 'react';
import {
  Eye,
  Save,
  Loader2,
  Check,
  AlertCircle,
  Sparkles,
  Plus,
  Trash2,
  User,
  FileUp,
  Link2,
  MessageSquare,
} from "lucide-react";
import { useLocale, useTranslations } from 'next-intl';
import { SectionFormulaire } from "./SectionFormulaire";
import { ChampTexte } from "./ChampTexte";
import { ChampTextarea } from "./ChampTextarea";
import { ChampSelect } from "./ChampSelect";
import { ChampCheckbox } from "./ChampCheckbox";
import { ChampRadio } from "./ChampRadio";
import { ChampFichier } from "./ChampFichier";
import { Bouton } from "../ds/Bouton";

export interface FormDataOpportunite {
  intituleAction: string;
  photoRepresentation: File[];
  domaineAction: string;
  publicVise: string;
  timingAction: string;
  missionUrgente: string;
  dateDebut: string;
  dateFin: string;
  afficherUne: boolean;
  actionDistance: string;
  descriptionGenerale: string;
  impactsObjectifs: string;
  detailsContributions: string;
  contributionsDiaspora: any;
  fichierTechnique: File[];
  lienSiteFB: string;
  conditionsMission: string;
  remunerationPrevue: string;
  remunerationAutre: string;
  detailRemuneration: string;
  facilites: any;
  facilitesAutres: string;
  contacts: Array<{ nom: string; email: string; tel: string; ordre: number }>;
  emailsRappel: string;
  statutPublication: string;
  datePublication: string;
}

export type SuggestionFieldKey =
  | 'intituleAction'
  | 'domaineAction'
  | 'descriptionGenerale'
  | 'impactsObjectifs'
  | 'detailsContributions'
  | 'conditionsMission'
  | 'publicVise'
  | 'timingAction'
  | 'missionUrgente'
  | 'actionDistance'
  | 'remunerationPrevue';

export interface InlineFieldSuggestion {
  field: SuggestionFieldKey;
  value: string;
  explanation: string;
}

interface FormulaireOpportuniteProps {
  formData: FormDataOpportunite;
  setFormData: React.Dispatch<React.SetStateAction<FormDataOpportunite>>;
  isSubmitting: boolean;
  showSuccess: boolean;
  errorMsg: string;
  onSubmit: (e: React.FormEvent) => void;
  onPreview: () => void;
  submitLabel?: string;
  isEditMode?: boolean;
  hideFooter?: boolean;
  hideHeader?: boolean;
  inlineSuggestion?: InlineFieldSuggestion | null;
  onKeepInlineSuggestion?: (field: SuggestionFieldKey, value: string) => void;
  onDiscardInlineSuggestion?: () => void;
  onAssistantMenuClick?: () => void;
  onAssistantAnalyzeClick?: () => void;
  onAssistantDocumentClick?: () => void;
  onAssistantUrlClick?: () => void;
  onAssistantChatClick?: () => void;
  isAssistantMenuOpen?: boolean;
  onAssistantMenuClose?: () => void;
  assistantNotification?: string | null;
  missingAssistantFields?: string[];
  assistantAnalyzeLoading?: boolean;
  hasAiResult?: boolean;
}

export function FormulaireOpportunite({
  formData,
  setFormData,
  isSubmitting,
  showSuccess,
  errorMsg,
  onSubmit,
  onPreview,
  submitLabel,
  isEditMode = false,
  hideFooter = false,
  hideHeader = false,
  inlineSuggestion = null,
  onKeepInlineSuggestion,
  onDiscardInlineSuggestion,
  onAssistantMenuClick,
  onAssistantAnalyzeClick,
  onAssistantDocumentClick,
  onAssistantUrlClick,
  onAssistantChatClick,
  isAssistantMenuOpen = false,
  onAssistantMenuClose,
  assistantNotification = null,
  missingAssistantFields = [],
  assistantAnalyzeLoading = false,
  hasAiResult = false,
}: FormulaireOpportuniteProps) {

  const t = useTranslations('Admin.MissionForm');
  const locale = useLocale();
  const isFrench = locale.startsWith('fr');

  // Refs for auto-scroll to suggestion fields
  const fieldRefs = useRef<Record<SuggestionFieldKey, HTMLDivElement | null>>({
    intituleAction: null,
    domaineAction: null,
    descriptionGenerale: null,
    impactsObjectifs: null,
    detailsContributions: null,
    conditionsMission: null,
    publicVise: null,
    timingAction: null,
    missionUrgente: null,
    actionDistance: null,
    remunerationPrevue: null,
  });

  const menuRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to field when inline suggestion appears
  useEffect(() => {
    if (inlineSuggestion && fieldRefs.current[inlineSuggestion.field]) {
      const fieldElement = fieldRefs.current[inlineSuggestion.field];
      if (fieldElement) {
        setTimeout(() => {
          fieldElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 0);
      }
    }
  }, [inlineSuggestion]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isAssistantMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onAssistantMenuClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAssistantMenuOpen, onAssistantMenuClose]);
  const resolvedSubmitLabel = submitLabel || (isEditMode ? t('edit_submit') : t('create_submit'));

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const normalizeSpacing = (value: string) =>
    value
      .replace(/\u00A0/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/\s+([,;:.!?])/g, '$1')
      .replace(/([,;:.!?])(\S)/g, '$1 $2')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

  const capitalizeSentenceStarts = (value: string) =>
    value.replace(/(^|[.!?]\s+|\n+)([a-zà-ÿ])/g, (match, prefix: string, letter: string) => `${prefix}${letter.toUpperCase()}`);

  const ensureTrailingPunctuation = (value: string) => {
    if (!value) return value;
    if (/[.!?…]$/.test(value)) return value;
    return `${value}.`;
  };

  const autoFormatTextField = (
    field: keyof FormDataOpportunite,
    value: string,
    options?: { sentenceMode?: boolean; addTerminalPunctuation?: boolean }
  ) => {
    const sentenceMode = options?.sentenceMode ?? false;
    const addTerminalPunctuation = options?.addTerminalPunctuation ?? false;

    if (!value?.trim()) return value;

    let formatted = normalizeSpacing(value);

    if (sentenceMode) {
      formatted = capitalizeSentenceStarts(formatted);
      if (addTerminalPunctuation) {
        formatted = ensureTrailingPunctuation(formatted);
      }
    } else {
      formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }

    if (formatted !== value) {
      updateField(field, formatted);
    }

    return formatted;
  };

  const updateNestedField = (parent: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof FormDataOpportunite] as Record<string, any>),
        [field]: value,
      },
    }));
  };

  const updateContact = (index: number, field: string, value: string) => {
    const newContacts = [...formData.contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    updateField("contacts", newContacts);
  };

  const addContact = () => {
    if (formData.contacts.length < 2) {
      updateField("contacts", [
        ...formData.contacts,
        { nom: "", email: "", tel: "", ordre: formData.contacts.length + 1 }
      ]);
    }
  };

  const removeContact = (index: number) => {
    if (formData.contacts.length > 1) {
      const newContacts = formData.contacts.filter((_, i) => i !== index);
      const reordered = newContacts.map((c, i) => ({ ...c, ordre: i + 1 }));
      updateField("contacts", reordered);
    }
  };

  const domaineOptions = [
    { value: "investissement", label: t('domains.investissement') },
    { value: "Santé", label: t('domains.sante') },
    { value: "pauvrete", label: t('domains.pauvrete') },
    { value: "societe-civile", label: t('domains.societe_civile') },
    { value: "infrastructures", label: t('domains.infrastructures') },
    { value: "environnement", label: t('domains.environnement') },
    { value: "éducation", label: t('domains.education') },
    { value: "innovation", label: t('domains.innovation') },
    { value: "recrutement", label: t('domains.recrutement') },
    { value: "tourisme", label: t('domains.tourisme') },
    { value: "culture", label: t('domains.culture') },
    { value: "rayonnement", label: t('domains.rayonnement') },
    { value: "droits", label: t('domains.droits') },
    { value: "urgences", label: t('domains.urgences') },
  ];

  const renderInlineSuggestion = (field: SuggestionFieldKey) => {
    if (!inlineSuggestion || inlineSuggestion.field !== field) return null;

    return (
      <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5">
        <p className="text-xs text-amber-900 font-medium mb-1">Suggestion IA</p>
        <p className="text-xs text-amber-800 mb-1 whitespace-pre-wrap">{inlineSuggestion.explanation}</p>
        <p className="text-xs text-neutral-800 bg-white border border-amber-200 rounded p-2 mb-2 whitespace-pre-wrap">
          {inlineSuggestion.value}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onDiscardInlineSuggestion?.()}
            className="px-2 py-1 text-[11px] rounded border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
          >
            Ignorer
          </button>
          <button
            type="button"
            onClick={() => onKeepInlineSuggestion?.(field, inlineSuggestion.value)}
            className="px-2 py-1 text-[11px] rounded bg-amber-600 text-white hover:bg-amber-700"
          >
            Appliquer
          </button>
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      {/* Form Header */}
      {!hideHeader && (
      <div className="bg-white rounded-t-xl p-6 border-b border-neutral-200">
        <div className="flex flex-col items-start gap-3">
          <div>
            <h2 className="text-neutral-900 mb-2" style={{ fontSize: "25px", fontWeight: 600 }}>
              {isEditMode ? t('title_edit') : t('title_new')}
            </h2>
            <p className="text-neutral-600" style={{ fontSize: "14px", fontWeight: 400 }}>
              {t('subtitle')}
            </p>
          </div>

          {/* AI Assistant controls under title/subtitle */}
          {(onAssistantMenuClick || onAssistantAnalyzeClick || onAssistantDocumentClick || onAssistantUrlClick || onAssistantChatClick) && (
            <div className="flex flex-col items-start gap-1" ref={menuRef}>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onAssistantMenuClick}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-colors"
                  aria-label="Ouvrir l'assistant IA"
                >
                  {assistantAnalyzeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Assistant IA
                </button>

                {hasAiResult && onAssistantChatClick && (
                  <button
                    type="button"
                    onClick={onAssistantChatClick}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors"
                    aria-label="Ouvrir la discussion avec l'assistant"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Discussion
                  </button>
                )}
              </div>

              {/* Assistant helper callout (idle / missing-fields states) */}
              {missingAssistantFields && missingAssistantFields.length > 0 ? (
                <div className="mt-1 rounded-xl border border-emerald-200 px-3 py-2 shadow-sm bg-white">
                  <div className="flex items-start gap-2">
                    <span className="text-sm leading-none mt-0.5">✨</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-tight text-emerald-700">{isFrench ? 'Pour commencer :' : 'To get started :'}</p>
                      <p className="text-sm leading-snug text-emerald-700/90 font-medium mt-0.5">
                        {isFrench
                          ? '👉 Indique : titre de la mission, domaine d’intervention, contributions de la diaspora'
                          : '👉 Provide: mission title, domain, diaspora contributions'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-1 rounded-xl border border-emerald-200 px-3 py-2 shadow-sm bg-gradient-to-r from-emerald-50/40 via-white to-emerald-50/40 animate-in fade-in">
                  <div className="flex items-start gap-2">
                    <span className="text-sm leading-none mt-0.5">✨</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-tight text-emerald-700">
                        {isFrench ? '💡 Besoin d’aide ? Je peux corriger ta fiche mission ou en créer une pour toi.' : '💡 Need help? I can improve your mission form or create one for you.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isAssistantMenuOpen && (
                <div className="mt-2 flex gap-2 bg-neutral-50 p-2 rounded-lg border border-neutral-200">
                  {onAssistantChatClick && (
                    <button
                      type="button"
                      onClick={onAssistantChatClick}
                      className="inline-flex flex-col items-center gap-1 px-3 py-2 rounded-md bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100 transition-colors text-xs"
                      aria-label={isFrench ? 'Écrire quelques infos (tchat)' : 'Write some info (chat)'}
                    >
                      <MessageSquare className="w-4 h-4 text-green-500" />
                      {isFrench ? 'Ecris qqs infos (tchat)' : 'Write a few infos (chat)'}
                    </button>
                  )}

                  {onAssistantDocumentClick && (
                    <button
                      type="button"
                      onClick={onAssistantDocumentClick}
                      className="inline-flex flex-col items-center gap-1 px-3 py-2 rounded-md bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100 transition-colors text-xs"
                      aria-label={isFrench ? 'IA avec doc' : 'AI with doc'}
                    >
                      <FileUp className="w-4 h-4 text-blue-500" />
                      {isFrench ? 'IA avec doc' : 'AI with doc'}
                    </button>
                  )}

                  {onAssistantUrlClick && (
                    <button
                      type="button"
                      onClick={onAssistantUrlClick}
                      className="inline-flex flex-col items-center gap-1 px-3 py-2 rounded-md bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100 transition-colors text-xs"
                      aria-label={isFrench ? 'Lien site (URL)' : 'Website link (URL)'}
                    >
                      <Link2 className="w-4 h-4 text-violet-600" />
                      {isFrench ? 'Lien site (URL)' : 'Website link (URL)'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      )}

      {/* Form Content Body */}
      <div className={`bg-white p-8 shadow-sm ${hideHeader ? 'rounded-none' : 'rounded-b-xl'}`}>

        {/* SECTION 1: General Information */}
        <SectionFormulaire numero="1" titre={t('section1')}>
          <div ref={(el) => { if (el) fieldRefs.current.intituleAction = el; }}>
            <ChampTexte
              label={t('intitule_label')}
              name="intituleAction"
              value={formData.intituleAction}
              onChange={(value) => updateField("intituleAction", value)}
              onBlur={(value) => {
                autoFormatTextField('intituleAction', value, { sentenceMode: false, addTerminalPunctuation: false });
              }}
              placeholder={t('intitule_placeholder')}
              required
              maxLength={100}
              helperText={t('intitule_helper')}
            />
            {renderInlineSuggestion('intituleAction')}
          </div>

          <ChampFichier
            label={t('photo_label')}
            name="photoRepresentation"
            files={formData.photoRepresentation}
            onChange={(files) => updateField("photoRepresentation", files)}
            accept="image/jpeg,image/png"
            maxSize={5}
            helperText={t('photo_helper')}
          />

          <div ref={(el) => { if (el) fieldRefs.current.domaineAction = el; }}>
            <ChampSelect
              label={t('domaine_label')}
              name="domaineAction"
              value={formData.domaineAction}
              onChange={(value) => updateField("domaineAction", value)}
              options={domaineOptions}
              placeholder={t('domaine_placeholder')}
              required
            />
            {renderInlineSuggestion('domaineAction')}
          </div>
        </SectionFormulaire>

        {/* SECTION 2: Target audience and timing */}
        <SectionFormulaire numero="2" titre={t('section2')}>
          <div ref={(el) => { if (el) fieldRefs.current.publicVise = el; }}>
            <ChampRadio
              label={t('public_label')}
              name="publicVise"
              value={formData.publicVise}
              onChange={(value) => updateField("publicVise", value)}
              options={[
                { value: "tous", label: t('public_tous') },
                { value: "diaspora", label: t('public_diaspora') },
              ]}
              required
            />
            {renderInlineSuggestion('publicVise')}
          </div>

          <div ref={(el) => { if (el) fieldRefs.current.timingAction = el; }}>
            <ChampRadio
              label={t('timing_label')}
              name="timingAction"
              value={formData.timingAction}
              onChange={(value) => updateField("timingAction", value)}
              options={[
                { value: "permanente", label: t('timing_permanente') },
                { value: "ponctuelle", label: t('timing_ponctuelle') },
              ]}
              required
            />
            {renderInlineSuggestion('timingAction')}
          </div>

          {formData.timingAction === "ponctuelle" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChampTexte
                label={t('date_debut')}
                name="dateDebut"
                type="date"
                value={formData.dateDebut}
                onChange={(v) => updateField("dateDebut", v)}
              />
              <ChampTexte
                label={t('date_fin')}
                name="dateFin"
                type="date"
                value={formData.dateFin}
                onChange={(v) => updateField("dateFin", v)}
              />
            </div>
          )}

          <div ref={(el) => { if (el) fieldRefs.current.missionUrgente = el; }}>
            <ChampRadio
              label={t('urgente_label')}
              name="missionUrgente"
              value={formData.missionUrgente}
              onChange={(value) => updateField("missionUrgente", value)}
              options={[
                { value: "oui", label: t('oui') },
                { value: "non", label: t('non') },
              ]}
              required
            />
            {renderInlineSuggestion('missionUrgente')}
          </div>

          {formData.missionUrgente === "oui" && (
            <ChampCheckbox
              label={t('afficher_une')}
              name="afficherUne"
              checked={formData.afficherUne}
              onChange={(c) => updateField("afficherUne", c)}
            />
          )}

          <div ref={(el) => { if (el) fieldRefs.current.actionDistance = el; }}>
            <ChampRadio
              label={t('distance_label')}
              name="actionDistance"
              value={formData.actionDistance}
              onChange={(value) => updateField("actionDistance", value)}
              options={[
                { value: "oui", label: t('oui') },
                { value: "non", label: t('non') },
                { value: "partiellement", label: t('partiellement') },
              ]}
              required
            />
            {renderInlineSuggestion('actionDistance')}
          </div>
        </SectionFormulaire>

        {/* SECTION 3: Description and impacts */}
        <SectionFormulaire numero="3" titre={t('section3')}>
          <div ref={(el) => { if (el) fieldRefs.current.descriptionGenerale = el; }}>
            <ChampTextarea
              label={t('description_label')}
              name="descriptionGenerale"
              value={formData.descriptionGenerale}
              onChange={(value) => updateField("descriptionGenerale", value)}
              onBlur={(value) => {
                autoFormatTextField('descriptionGenerale', value, { sentenceMode: true, addTerminalPunctuation: true });
              }}
              placeholder={t('description_placeholder')}
              required
              rows={8}
              maxLength={2000}
              helperText={t('description_helper')}
            />
            {renderInlineSuggestion('descriptionGenerale')}
          </div>

          <div ref={(el) => { if (el) fieldRefs.current.impactsObjectifs = el; }}>
            <ChampTextarea
              label={t('impacts_label')}
              name="impactsObjectifs"
              value={formData.impactsObjectifs}
              onChange={(value) => updateField("impactsObjectifs", value)}
              onBlur={(value) => {
                autoFormatTextField('impactsObjectifs', value, { sentenceMode: true, addTerminalPunctuation: true });
              }}
              placeholder={t('impacts_placeholder')}
              required
              rows={5}
              maxLength={500}
              helperText={t('impacts_helper')}
            />
            {renderInlineSuggestion('impactsObjectifs')}
          </div>

        </SectionFormulaire>

        {/* SECTION 4: Diaspora contributions */}
        <SectionFormulaire numero="4" titre={t('section4')}>
          <div>
            <label className="text-neutral-900 mb-3 block" style={{ fontSize: "14px", fontWeight: 500 }}>
              {t('contributions_label')} <span className="text-accent">*</span>
            </label>

            <div className="space-y-3">
              <ChampCheckbox label={t('contrib_investissement')} name="investissement" checked={formData.contributionsDiaspora.investissement} onChange={(c) => updateNestedField("contributionsDiaspora", "investissement", c)} />
              <ChampCheckbox label={t('contrib_epargne')} name="epargne" checked={formData.contributionsDiaspora.epargne} onChange={(c) => updateNestedField("contributionsDiaspora", "epargne", c)} />
              <ChampCheckbox label={t('contrib_competences')} name="competences" checked={formData.contributionsDiaspora.competences} onChange={(c) => updateNestedField("contributionsDiaspora", "competences", c)} />
              <ChampCheckbox label={t('contrib_dons')} name="dons" checked={formData.contributionsDiaspora.dons} onChange={(c) => updateNestedField("contributionsDiaspora", "dons", c)} />
              <ChampCheckbox label={t('contrib_reseaux')} name="reseauxInfluence" checked={formData.contributionsDiaspora.reseauxInfluence} onChange={(c) => updateNestedField("contributionsDiaspora", "reseauxInfluence", c)} />
              <ChampCheckbox label={t('contrib_achats')} name="achatsTourisme" checked={formData.contributionsDiaspora.achatsTourisme} onChange={(c) => updateNestedField("contributionsDiaspora", "achatsTourisme", c)} />
            </div>
          </div>

          <div ref={(el) => { if (el) fieldRefs.current.detailsContributions = el; }}>
            <ChampTextarea
              label={t('contributions_detail_label')}
              name="detailsContributions"
              value={formData.detailsContributions}
              onChange={(value) => updateField("detailsContributions", value)}
              onBlur={(value) => {
                autoFormatTextField('detailsContributions', value, { sentenceMode: true, addTerminalPunctuation: true });
              }}
              placeholder={t('contributions_detail_placeholder')}
              rows={4}
              maxLength={500}
              helperText={t('contributions_detail_helper')}
            />
            {renderInlineSuggestion('detailsContributions')}
          </div>
        </SectionFormulaire>

        {/* SECTION 5: Mission conditions */}
        <SectionFormulaire numero="5" titre={t('section6')}>
          <div ref={(el) => { if (el) fieldRefs.current.conditionsMission = el; }}>
            <ChampTextarea
              label={t('conditions_label')}
              name="conditionsMission"
              value={formData.conditionsMission}
              onChange={(v) => updateField("conditionsMission", v)}
              onBlur={(v) => {
                autoFormatTextField('conditionsMission', v, { sentenceMode: true, addTerminalPunctuation: true });
              }}
              rows={6}
              placeholder={t('conditions_placeholder')}
            />
            {renderInlineSuggestion('conditionsMission')}
          </div>

          <div ref={(el) => { if (el) fieldRefs.current.remunerationPrevue = el; }}>
            <ChampRadio
              label={t('remuneration_label')}
              name="remunerationPrevue"
              value={formData.remunerationPrevue}
              onChange={(v) => updateField("remunerationPrevue", v)}
              options={[
                { value: "benevole", label: t('remuneration_benevole') },
                { value: "remuneration", label: t('remuneration_remuneration') },
                { value: "defraiement-local", label: t('remuneration_local') },
                { value: "defraiement-complet", label: t('remuneration_complet') },
                { value: "autre", label: t('remuneration_autre') },
              ]}
            />
            {renderInlineSuggestion('remunerationPrevue')}
          </div>

          {formData.remunerationPrevue === "autre" && (
            <div>
              <ChampTexte
                label={t('remuneration_autre_label')}
                name="remunerationAutre"
                value={formData.remunerationAutre}
                onChange={(v) => updateField("remunerationAutre", v)}
                onBlur={(v) => {
                  autoFormatTextField('remunerationAutre', v, { sentenceMode: false, addTerminalPunctuation: false });
                }}
              />
            </div>
          )}

          <div>
            <ChampTextarea
              label={t('detail_remuneration_label')}
              name="detailRemuneration"
              value={formData.detailRemuneration}
              onChange={(v) => updateField("detailRemuneration", v)}
              onBlur={(v) => {
                autoFormatTextField('detailRemuneration', v, { sentenceMode: true, addTerminalPunctuation: true });
              }}
              rows={4}
              placeholder={t('detail_remuneration_placeholder')}
            />
          </div>
        </SectionFormulaire>

        {/* SECTION 6: Facilities */}
        <SectionFormulaire numero="6" titre={t('section7')}>
          <div>
            <label className="text-neutral-900 mb-3 block" style={{ fontSize: "14px", fontWeight: 500 }}>
              {t('facilites_label')} <span className="text-accent">*</span>
            </label>
            <div className="space-y-2">
              <ChampCheckbox label={t('facilite_interlocuteur')} name="interlocuteur" checked={formData.facilites.interlocuteur} onChange={(c) => updateNestedField("facilites", "interlocuteur", c)} />
              <ChampCheckbox label={t('facilite_distance')} name="travailDistance" checked={formData.facilites.travailDistance} onChange={(c) => updateNestedField("facilites", "travailDistance", c)} />
              <ChampCheckbox label={t('facilite_assistance')} name="assistanceProjet" checked={formData.facilites.assistanceProjet} onChange={(c) => updateNestedField("facilites", "assistanceProjet", c)} />
              <ChampCheckbox label={t('facilite_locaux')} name="locauxMateriels" checked={formData.facilites.locauxMateriels} onChange={(c) => updateNestedField("facilites", "locauxMateriels", c)} />
              <ChampCheckbox label={t('facilite_prestataires')} name="reseauPrestataires" checked={formData.facilites.reseauPrestataires} onChange={(c) => updateNestedField("facilites", "reseauPrestataires", c)} />
              <ChampCheckbox label={t('facilite_autres')} name="autres" checked={formData.facilites.autres} onChange={(c) => updateNestedField("facilites", "autres", c)} />
            </div>

            {formData.facilites.autres && (
              <div className="mt-3">
                <ChampTexte
                  label={t('facilite_autres_label')}
                  name="facilitesAutres"
                  value={formData.facilitesAutres}
                  onChange={(v) => updateField("facilitesAutres", v)}
                  onBlur={(v) => {
                    autoFormatTextField('facilitesAutres', v, { sentenceMode: true, addTerminalPunctuation: true });
                  }}
                />
              </div>
            )}
          </div>
        </SectionFormulaire>

        {/* SECTION 7: Documents and links */}
        <SectionFormulaire numero="7" titre={t('section5')}>
          <ChampFichier
              label={t('fichier_label')}
              name="fichierTechnique"
              files={formData.fichierTechnique}
              onChange={(files) => updateField("fichierTechnique", files)}
              accept=".pdf,.doc,.docx"
              multiple
              helperText={t('fichier_helper')}
          />

          <ChampTexte
            label={t('lien_label')}
            name="lienSiteFB"
            value={formData.lienSiteFB}
            onChange={(v) => updateField("lienSiteFB", v)}
            placeholder="https://..."
          />
        </SectionFormulaire>

        {/* SECTION 8: Additional contact */}
        <SectionFormulaire numero="8" titre={t('section8')}>
          <div className="space-y-6">
            {formData.contacts.map((contact, index) => (
              <div key={index} className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 relative">
                 <div className="flex items-center gap-2 mb-4">
                    <User className="w-4 h-4 text-accent" />
                    <h4 className="font-semibold text-sm text-neutral-800">{t('contact_title', { number: index + 1 })}</h4>
                    {formData.contacts.length > 1 && (
                      <button type="button" onClick={() => removeContact(index)} className="ml-auto text-red-500 hover:text-red-700 text-sm flex items-center gap-1">
                        <Trash2 className="w-4 h-4" /> {t('contact_supprimer')}
                      </button>
                    )}
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <ChampTexte label={t('contact_nom')} name={`c-nom-${index}`} value={contact.nom} onChange={(val) => updateContact(index, 'nom', val)} />
                   <ChampTexte label={t('contact_email')} name={`c-email-${index}`} value={contact.email} onChange={(val) => updateContact(index, 'email', val)} />
                   <ChampTexte label={t('contact_tel')} name={`c-tel-${index}`} value={contact.tel} onChange={(val) => updateContact(index, 'tel', val)} />
                 </div>
              </div>
            ))}
            {formData.contacts.length < 2 && (
              <button type="button" onClick={addContact} className="w-full py-3 border-2 border-dashed border-neutral-300 rounded-lg text-neutral-600 hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-2 font-medium">
                <Plus className="w-5 h-5" /> {t('contact_ajouter')}
              </button>
            )}
          </div>

          <ChampTexte
            label={t('emails_label')}
            name="emailsRappel"
            value={formData.emailsRappel}
            onChange={(v) => updateField("emailsRappel", v)}
            placeholder={t('emails_placeholder')}
            helperText={t('emails_helper')}
          />
        </SectionFormulaire>

        {/* SECTION 9: Publication */}
        <SectionFormulaire numero="9" titre={t('section9')}>
          <ChampRadio
            label={t('statut_label')}
            name="statutPublication"
            value={formData.statutPublication}
            onChange={(v) => updateField("statutPublication", v)}
            options={[
              { value: "brouillon", label: t('statut_brouillon') },
              { value: "publie", label: t('statut_publie') },
              { value: "programme", label: t('statut_programme') },
            ]}
          />
          {formData.statutPublication === "programme" && (
             <ChampTexte label={t('date_publication')} name="datePublication" type="datetime-local" value={formData.datePublication} onChange={(v) => updateField("datePublication", v)} />
          )}
        </SectionFormulaire>
      </div>

      {/* FORM FOOTER */}
      {!hideFooter && (
      <div className="sticky bottom-0 bg-white border-t border-neutral-200 shadow-lg rounded-lg mt-6 p-5 z-20">
        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="text-red-700 text-sm font-medium">{errorMsg}</span>
          </div>
        )}
        {showSuccess && (
          <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-r flex items-center gap-2 mb-4">
            <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-green-700 text-sm font-medium">
              {isEditMode ? t('success_update') : t('success_create')}
            </span>
          </div>
        )}
        <div className="flex items-center gap-3">
          <Bouton variant="secondaire" size="moyen" icon={<Eye className="w-5 h-5" />} disabled={isSubmitting} type="button" onClick={onPreview}>{t('btn_preview')}</Bouton>
          <Bouton variant="primaire" size="moyen" icon={isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (showSuccess ? <Check className="w-5 h-5"/> : <Save className="w-5 h-5" />)} type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('btn_saving') : showSuccess ? t('btn_saved') : resolvedSubmitLabel}
          </Bouton>
        </div>
      </div>
      )}

      {assistantNotification && (
        <div className="fixed bottom-5 right-5 z-50 pointer-events-none">
          <div className="max-w-md bg-orange-50 border border-orange-200 border-l-4 border-l-orange-500 shadow-lg rounded-lg px-4 py-3 flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0" />
            <span className="text-orange-700 text-sm font-medium">{assistantNotification}</span>
          </div>
        </div>
      )}
    </form>
  );
}
