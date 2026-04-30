export function buildAnalyzePrompt(data: any) {
  return `
Vous êtes un évaluateur stratégique de missions pour la diaspora.

Analysez la proposition suivante :

Domaine : ${data.domain}
Titre : ${data.title}

Description générale :
${data.description ?? "Non fournie"}

Impacts/Objectifs recherchés :
${data.impactsObjectifs ?? "Non fournis"}

Critères d'évaluation :

1. Cohérence interne et externe pour chaque partie :
- description_coherence : logique interne et clarté du texte (5-6 lignes idéales)
- impact_coherence : objectifs découlent logiquement de la description
- contribution_coherence : profils nécessaires correspondent réellement aux besoins

2. feasibility_realism :
La mission est-elle réaliste ?
L'ampleur est-elle proportionnée ?
Le délai implicite est-il crédible ?
Évitez de donner un score élevé à des missions irréalistes ou démesurées.

3. diaspora_alignment :
La mission implique-t-elle réellement la diaspora ?

Analysez la cohérence croisée :
- description → impacts : la description mène-t-elle naturellement aux impacts ?

Les missions vagues, irréalistes ou excessivement ambitieuses doivent recevoir un score faible en feasibility_realism.

Évaluez chaque partie séparément.

Retournez UNIQUEMENT du JSON valide dans ce format :

{
  "scores": {
    "description_coherence": number (0-10),
    "impact_coherence": number (0-10),
    "contribution_coherence": number (0-10),
    "feasibility_realism": number (0-10),
    "diaspora_alignment": number (0-10)
  },
  "strengths": string[],
  "weaknesses": string[],
  "recommendations": string[],
  "field_flags": {
    "title": string | null,
    "description": string | null,
    "impacts": string | null,
    "contributions": string | null
  }
}

Toutes les réponses doivent être en français.
Pas d'explications hors JSON.
`;
}

export function buildOptimizeMissionPrompt(data: {
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
  return `
Vous êtes un expert en amélioration de missions pour la diaspora.

Objectif : proposer une version optimisée de la mission à partir de l'entrée actuelle et de l'analyse IA détaillée.

Entrée actuelle :
- Domaine : ${data.mission.domain ?? "Non fourni"}
- Titre : ${data.mission.title ?? "Non fourni"}

Description générale :
${data.mission.description ?? "Non fournie"}

Impacts/Objectifs :
${data.mission.impactsObjectifs ?? "Non fournis"}

Profils / Contributions :
${data.mission.detailsContributions ?? "Non fournis"}

Types de contribution sélectionnés : ${data.mission.contributionTypes ?? "Non fournis"}

Conditions de mission :
${data.mission.conditionsMission ?? "Non fournies"}

Selections actuelles :
- Public vise : ${data.mission.publicVise ?? "Non fourni"}
- Timing action : ${data.mission.timingAction ?? "Non fourni"}
- Mission urgente : ${data.mission.missionUrgente ?? "Non fourni"}
- Action a distance : ${data.mission.actionDistance ?? "Non fourni"}
- Remuneration prevue : ${data.mission.remunerationPrevue ?? "Non fournie"}

Analyse IA détaillée (à exploiter pleinement) :
- Scores détaillés : ${JSON.stringify(data.analysis.scores ?? {})}
- Points forts : ${JSON.stringify(data.analysis.strengths ?? [])}
- Points faibles : ${JSON.stringify(data.analysis.weaknesses ?? [])}
- Recommandations : ${JSON.stringify(data.analysis.recommendations ?? [])}
- Alertes de champs : ${JSON.stringify(data.analysis.field_flags ?? {})}

Contexte de discussion utilisateur (optionnel) :
- Résumé : ${data.chat_context?.summary ?? "Aucun"}
- Brouillon des améliorations issues du chat : ${JSON.stringify(data.chat_context?.draft_updates ?? {})}
- Historique récent : ${JSON.stringify(data.chat_context?.messages ?? [])}

Instructions :
- Garder le même sens métier et le même domaine.
- Écrire une version plus claire, plus convaincante et plus concrète.
- Rester réaliste, actionnable et orienté diaspora.
- Éviter le jargon inutile et les phrases trop longues.
- Proposer aussi des valeurs selectionnables coherentes pour les champs radio/select.
- Utiliser UNIQUEMENT ces valeurs pour les selections :
  - optimized_publicVise : "tous" | "diaspora" | ""
  - optimized_timingAction : "permanente" | "ponctuelle" | "urgente" | ""
  - optimized_missionUrgente : "oui" | "non" | ""
  - optimized_actionDistance : "oui" | "non" | "partiellement" | ""
  - optimized_remunerationPrevue : "benevole" | "remuneration" | "defraiement-local" | "defraiement-complet" | "autre" | ""
- Répondre en français uniquement.

Prise en compte des types de contribution : Si des types de contribution sont fournis, adaptez la section optimized_contributions pour prioriser les profils et tâches correspondant à ces types. Si nécessaire, transformez ces types en courtes propositions de profils (1 à 3 items) et privilégiez la concision pour respecter les limites de champs.

LIMITES DE LONGUEUR STRICTES (respecter scrupuleusement) :
- optimized_title : MAX 100 caractères (~15 mots)
- optimized_description : MAX 2000 caractères (~300 mots)
- optimized_impacts : MAX 500 caractères (~75 mots)
- optimized_contributions : MAX 500 caractères (~75 mots)
- optimized_conditions : MAX 500 caractères (~75 mots)

IMPORTANT : Si un champ risque de dépasser sa limite, le raccourcir intelligemment en :
- Éliminant les redondances et formules creuses
- Allant droit au but
- Utilisant des listes à puces pour les contributions ou conditions
- Favorisant la clarté sur la complétude

Retournez UNIQUEMENT du JSON valide dans ce format :
{
  "optimized_title": "string",
  "optimized_description": "string",
  "optimized_impacts": "string",
  "optimized_contributions": "string",
  "optimized_conditions": "string",
  "optimized_publicVise": "string",
  "optimized_timingAction": "string",
  "optimized_missionUrgente": "string",
  "optimized_actionDistance": "string",
  "optimized_remunerationPrevue": "string"
}

Pas d'explications hors JSON.
`;
}

export function buildFormAssistantChatPrompt(data: {
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
  language?: "fr" | "en";
}) {
  return `
Vous êtes un architecte de contexte pour améliorer une mission destinée à la diaspora.

Contexte mission :
- Domaine : ${data.mission.domain ?? "Non fourni"}
- Titre : ${data.mission.title ?? "Non fourni"}
- Description : ${data.mission.description ?? "Non fournie"}
- Impacts/Objectifs : ${data.mission.impactsObjectifs ?? "Non fournis"}
- Contributions : ${data.mission.detailsContributions ?? "Non fournis"}
- Types de contribution : ${data.mission.contributionTypes ?? "Non fournis"}

Signaux d'analyse IA :
- Points forts : ${JSON.stringify(data.analysis?.strengths ?? [])}
- Points faibles : ${JSON.stringify(data.analysis?.weaknesses ?? [])}
- Recommandations : ${JSON.stringify(data.analysis?.recommendations ?? [])}
- Alertes champs : ${JSON.stringify(data.analysis?.field_flags ?? {})}
- Champs de contexte potentiellement manquants : ${JSON.stringify(data.missing_context_fields ?? [])}

Historique récent : ${JSON.stringify(data.conversation.slice(-8))}
Message utilisateur courant : ${data.userMessage}
Langue attendue : ${data.language === 'en' ? 'anglais' : 'français'}

Objectif de réponse :
1) Répondre de façon conversationnelle et naturelle, comme un vrai chatbot qui réagit d'abord au message utilisateur.
2) Utiliser la langue attendue (français si "fr", anglais si "en").
3) Maintenir un style professionnel, fluide et collaboratif, sans ton robotique.
4) Commencer par un lien explicite avec ce que l'utilisateur a écrit (reprendre un élément concret du message ou du formulaire).
5) Éviter les formules génériques comme "Très bonne base", "Belle base", "Excellent point" si elles ne sont pas contextualisées.
6) Ne JAMAIS afficher de note/score chiffré dans assistant_message.
7) Transformer les problèmes détectés en consultation_points actionnables (max 3), mais sans inonder l'utilisateur dès le premier message.
8) Si le message utilisateur est une demande d'analyse initiale, proposer explicitement :
   "J'ai identifié X axes à renforcer. Lequel traite-t-on en premier ?"
9) Proposer quick_replies adaptées au message courant.
10) Mettre à jour status_chips avec états 'pending', 'resolved' ou 'clear'.
11) Maintenir/mettre à jour perfected_draft à chaque tour (si info suffisante), sans inventer de faits.
12) Poser au plus UNE follow_up_question précise pour faire avancer la mission.
13) Vérifier et corriger l'orthographe, la grammaire et la clarté dans toutes les propositions.

LIMITES DE CHAMPS (pour suggested_updates et perfected_draft) :
- optimized_title : MAX 100 caractères (~15 mots)
- optimized_description : MAX 2000 caractères (~300 mots)
- optimized_impacts : MAX 500 caractères (~75 mots)
- optimized_contributions : MAX 500 caractères (~75 mots)
Ne proposer de modifications que si elles tiennent strictement dans ces limites.

Retournez UNIQUEMENT du JSON valide au format :
{
  "assistant_message": "string",
  "follow_up_question": "string",
  "consultation_points": ["string"],
  "quick_replies": ["string"],
  "status_chips": [
    { "label": "Contexte", "state": "pending | resolved | clear" }
  ],
  "suggested_updates": {
    "optimized_title": "string | optionnel",
    "optimized_description": "string | optionnel",
    "optimized_impacts": "string | optionnel",
    "optimized_contributions": "string | optionnel"
  },
  "perfected_draft": {
    "optimized_title": "string | optionnel",
    "optimized_description": "string | optionnel",
    "optimized_impacts": "string | optionnel",
    "optimized_contributions": "string | optionnel"
  }
}

Pas d'explications hors JSON.
`;
}

export function buildDocumentToMissionPrompt(data: {
  documentContext: string;
  currentMission?: {
    domain?: string;
    title?: string;
    description?: string;
    impactsObjectifs?: string;
    detailsContributions?: string;
    conditionsMission?: string;
    publicVise?: string;
    missionUrgente?: string;
    actionDistance?: string;
    timingAction?: string;
    remunerationPrevue?: string;
  };
}) {
  return `
Vous êtes un assistant expert de formulation de missions diaspora.

Votre tâche : à partir du contexte document ci-dessous, proposer un pré-remplissage pertinent des champs du formulaire.

Contexte extrait du document :
${data.documentContext || 'Aucun contexte exploitable'}

Valeurs actuelles du formulaire (si déjà saisies) :
${JSON.stringify(data.currentMission ?? {})}

Instructions importantes :
- Vous pouvez raisonner et reformuler pour améliorer la clarté et la structure.
- N'inventez pas des faits précis non soutenus par le contexte.
- Si une information manque totalement, renvoyez une chaîne vide.
- Normalisez strictement :
  - publicVise : "tous" | "diaspora" | ""
  - missionUrgente : "oui" | "non" | ""
  - actionDistance : "oui" | "non" | "partiellement" | ""
  - timingAction : "permanente" | "ponctuelle" | "urgente" | ""
  - remunerationPrevue : "benevole" | "remuneration" | "defraiement-local" | "defraiement-complet" | "autre" | ""
- Tous les champs textuels doivent être en français naturel, utile et exploitable dans un formulaire.

Retournez UNIQUEMENT du JSON valide au format :
{
  "intituleAction": "string",
  "domaineAction": "string",
  "descriptionGenerale": "string",
  "impactsObjectifs": "string",
  "detailsContributions": "string",
  "conditionsMission": "string",
  "publicVise": "string",
  "missionUrgente": "string",
  "actionDistance": "string",
  "timingAction": "string",
  "remunerationPrevue": "string"
}

Pas d'explications hors JSON.
`;
}

export function buildPrePublishPolishPrompt(data: {
  title?: string;
  description?: string;
  impactsObjectifs?: string;
  detailsContributions?: string;
  conditionsMission?: string;
  detailRemuneration?: string;
  facilitesAutres?: string;
  remunerationAutre?: string;
}) {
  return `
Vous êtes un relecteur éditorial avant publication de mission.

Objectif : corriger l'orthographe, la grammaire, la ponctuation et la mise en page des champs texte, sans changer le sens métier.

Règles strictes :
- Conserver les faits et l'intention.
- Ne pas inventer d'informations.
- Améliorer la lisibilité (phrases claires, ponctuation correcte, sauts de ligne propres).
- Garder un ton professionnel.
- Si un champ est vide, le laisser vide.

Champs à corriger :
- intituleAction: ${data.title ?? ''}
- descriptionGenerale: ${data.description ?? ''}
- impactsObjectifs: ${data.impactsObjectifs ?? ''}
- detailsContributions: ${data.detailsContributions ?? ''}
- conditionsMission: ${data.conditionsMission ?? ''}
- detailRemuneration: ${data.detailRemuneration ?? ''}
- facilitesAutres: ${data.facilitesAutres ?? ''}
- remunerationAutre: ${data.remunerationAutre ?? ''}

Retournez UNIQUEMENT du JSON valide avec exactement ce format :
{
  "intituleAction": "string",
  "descriptionGenerale": "string",
  "impactsObjectifs": "string",
  "detailsContributions": "string",
  "conditionsMission": "string",
  "detailRemuneration": "string",
  "facilitesAutres": "string",
  "remunerationAutre": "string"
}

Pas d'explications hors JSON.
`;
}

/**
 * Detect which form section the user is targeting
 * Returns: { section: "title" | "description" | "impacts" | "contributions" | null, confidence: "explicit" | "inferred" | null }
 */
export function detectSectionTarget(userMessage: string): { section: string | null; confidence: "explicit" | "inferred" | null } {
  const msg = userMessage.toLowerCase();

  // Field synonyms mapping
  const sectionKeywords = {
    title: ["titre", "intitulé", "nom", "subject", "heading", "title"],
    description: ["description", "contexte", "background", "présentation", "details", "détails"],
    impacts: ["impacts", "objectifs", "goals", "outcomes", "résultats", "aims", "objectives"],
    contributions: ["contributions", "type de contribution", "type contribution", "profils", "compétences", "skills", "profiles", "expertise", "competences"],
    domain: ["domaine", "domain", "secteur", "sector", "thématique", "field"],
  };

  // Check explicit mentions (high confidence)
  for (const [section, keywords] of Object.entries(sectionKeywords)) {
    for (const keyword of keywords) {
      if (msg.includes(keyword)) {
        return { section, confidence: "explicit" };
      }
    }
  }

  // Infer from context keywords that suggest a specific section
  if (msg.match(/(plus|rendre|make|be|être|plus) (clair|clear|lisible|readable|compréhensible|understandable|précis|specific|détaillé|detailed|accrocheur|catchy|accueillant|welcoming)/i)) {
    // "make it clearer", "be more specific", "more catchy" → often about title or description
    if (msg.match(/(titre|title|nom|name|subject)/i)) {
      return { section: "title", confidence: "inferred" };
    }
    return { section: "description", confidence: "inferred" };
  }

  if (msg.match(/(mesurable|measurable|concret|concrete|tangible|spécifique|specific)/i)) {
    return { section: "impacts", confidence: "inferred" };
  }

  if (msg.match(/(compétence|skill|profil|profile|expertise|expérience|experience|background)/i)) {
    return { section: "contributions", confidence: "inferred" };
  }

  return { section: null, confidence: null };
}

/**
 * Build a focused prompt for section-specific analysis & suggestion
 */
export function buildSectionFocusedPrompt(data: {
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
  language?: "fr" | "en";
}) {
  const sectionLabels = {
    fr: {
      title: "Titre/Intitulé",
      description: "Description générale",
      impacts: "Impacts/Objectifs",
      contributions: "Profils/Contributions",
    },
    en: {
      title: "Title",
      description: "Description",
      impacts: "Impact/Objectives",
      contributions: "Profiles/Contributions",
    },
  };

  const lang = data.language === "en" ? "en" : "fr";
  const labels = sectionLabels[lang];
  const sectionLabel = labels[data.section as keyof typeof labels] || data.section;

  return `
${lang === "en" ? "You are a focused mission editor." : "Vous êtes un éditeur de mission spécialisé."}

${lang === "en" ? "The user wants to improve a specific section of their mission." : "L'utilisateur souhaite améliorer une section spécifique de sa mission."}

${lang === "en" ? "Target section:" : "Section cible:"} ${sectionLabel}

${lang === "en" ? "Current value:" : "Valeur actuelle:"} 
"${data.currentValue}"

${lang === "en" ? "Context mission:" : "Contexte mission:"}
- ${lang === "en" ? "Domain" : "Domaine"}: ${data.mission.domain ?? (lang === "en" ? "Not provided" : "Non fourni")}
- ${lang === "en" ? "Title" : "Titre"}: ${data.mission.title ?? (lang === "en" ? "Not provided" : "Non fourni")}
- ${lang === "en" ? "Description" : "Description"}: ${data.mission.description ?? (lang === "en" ? "Not provided" : "Non fournie")}
- ${lang === "en" ? "Impacts/Goals" : "Impacts/Objectifs"}: ${data.mission.impactsObjectifs ?? (lang === "en" ? "Not provided" : "Non fournis")}
- ${lang === "en" ? "Profiles needed" : "Profils recherchés"}: ${data.mission.detailsContributions ?? (lang === "en" ? "Not provided" : "Non fournis")}
- ${lang === "en" ? "Contribution types" : "Types de contribution"}: ${data.mission.contributionTypes ?? (lang === "en" ? "Not provided" : "Non fournis")}

${lang === "en" ? "User request:" : "Demande utilisateur:"} ${data.userMessage}

${lang === "en" ? "Task:" : "Tâche:"}
1) ${lang === "en" ? "Respond conversationally to the user's request" : "Répondre conversation de façon à la demande de l'utilisateur"}
2) ${lang === "en" ? "Provide a specific, improved version of that section based on their feedback or needs" : "Proposer une version spécifique et améliorée de cette section basée sur leur feedback"}
3) ${lang === "en" ? "The improved version should be concise, clear, and actionable" : "La version améliorée doit être concise, claire et actionnaire"}
4) ${lang === "en" ? "Ensure it remains aligned with the full mission context" : "Assurer qu'elle reste alignée avec le contexte complet de la mission"}

${lang === "en" ? "Return ONLY valid JSON in this format:" : "Retournez UNIQUEMENT du JSON valide au format:"}
{
  "assistant_message": "string ${lang === "en" ? "(conversational response)" : "(réponse conversationnelle)"}",
  "suggested_value": "string ${lang === "en" ? "(improved section text)" : "(texte amélioré de la section)"}",
  "explanation": "string ${lang === "en" ? "(why this is better)" : "(pourquoi c'est mieux)"}"
}

${lang === "en" ? "No explanations outside JSON." : "Pas d'explications hors JSON."}
`;
}
