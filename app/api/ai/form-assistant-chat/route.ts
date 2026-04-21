import { chatWithMissionAssistant, chatSectionFocused, getSectionTargetFromUserMessage } from "@/lib/ai/missionAgent";
import { enforceAiRateLimit } from "@/lib/ai/routeGuards";

export async function POST(req: Request) {
  try {
    const rateLimitResponse = enforceAiRateLimit(req, 'ai:form-assistant-chat');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await req.json();

    const mission = {
      domain: body?.mission?.domain,
      title: body?.mission?.title,
      description: body?.mission?.description,
      impactsObjectifs: body?.mission?.impactsObjectifs,
      detailsContributions: body?.mission?.detailsContributions,
      contributionTypes: body?.mission?.contributionTypes,
    };

    const userMessage = body?.userMessage || "";
    
    // Detect if user is targeting a specific section
    const { section: targetSection, confidence: targetConfidence } = getSectionTargetFromUserMessage(userMessage);

    // If section is explicitly or strongly inferred, use focused chat
    if (targetSection && targetConfidence === "explicit") {
      const sectionValues: Record<string, string> = {
        title: mission.title || "",
        description: mission.description || "",
        impacts: mission.impactsObjectifs || "",
        contributions: mission.detailsContributions || "",
        domain: mission.domain || "",
      };

      const currentValue = sectionValues[targetSection] || "";

      try {
        const result = await chatSectionFocused({
          section: targetSection,
          currentValue,
          mission,
          analysis: {
            strengths: body?.analysis?.strengths || [],
            weaknesses: body?.analysis?.weaknesses || [],
            recommendations: body?.analysis?.recommendations || [],
            field_flags: body?.analysis?.field_flags || {},
          },
          userMessage,
          language: body?.language === 'en' ? 'en' : 'fr',
        });

        // Convert section-focused response to standard chat response format
        return Response.json({
          assistant_message: result.assistant_message,
          section_focused: true,
          targeted_section: targetSection,
          suggested_value: result.suggested_value,
          explanation: result.explanation,
          follow_up_question: undefined,
          consultation_points: [],
          quick_replies: [],
          status_chips: [],
        });
      } catch (sectionError) {
        console.warn('[AI][SectionFocused] Falling back to general chat:', sectionError);
        // Fall back to general chat if section-focused fails
      }
    }

    // Fall back to general chat
    const missingContextFields: string[] = [];
    if (!mission.domain) missingContextFields.push('domaine d\'intervention');
    if (!mission.title || mission.title.trim().length < 8) missingContextFields.push('titre précis');
    if (!mission.description || mission.description.trim().length < 80) missingContextFields.push('description générale plus détaillée');
    if (!mission.impactsObjectifs || mission.impactsObjectifs.trim().length < 50) missingContextFields.push('impacts/objectifs mesurables');
    if (!mission.contributionTypes || mission.contributionTypes.trim().length === 0) missingContextFields.push('type de contribution recherché');

    const result = await chatWithMissionAssistant({
      mission,
      analysis: {
        strengths: body?.analysis?.strengths || [],
        weaknesses: body?.analysis?.weaknesses || [],
        recommendations: body?.analysis?.recommendations || [],
        field_flags: body?.analysis?.field_flags || {},
      },
      missing_context_fields: missingContextFields,
      conversation: body?.conversation || [],
      userMessage,
      language: body?.language === 'en' ? 'en' : 'fr',
    });

    return Response.json(result);
  } catch (error) {
    console.error('[AI][FormAssistantChat] Error:', error);

    return Response.json(
      {
        error: 'Assistant chat failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
