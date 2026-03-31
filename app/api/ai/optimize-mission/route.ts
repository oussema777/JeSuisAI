import { optimizeMissionVersion } from "@/lib/ai/missionAgent";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await optimizeMissionVersion({
      mission: {
        domain: body?.mission?.domain,
        title: body?.mission?.title,
        description: body?.mission?.description,
        impactsObjectifs: body?.mission?.impactsObjectifs,
        detailsContributions: body?.mission?.detailsContributions,
        conditionsMission: body?.mission?.conditionsMission,
        publicVise: body?.mission?.publicVise,
        timingAction: body?.mission?.timingAction,
        missionUrgente: body?.mission?.missionUrgente,
        actionDistance: body?.mission?.actionDistance,
        remunerationPrevue: body?.mission?.remunerationPrevue,
      },
      analysis: {
        scores: body?.analysis?.scores || {},
        strengths: body?.analysis?.strengths || [],
        weaknesses: body?.analysis?.weaknesses || [],
        recommendations: body?.analysis?.recommendations || [],
        field_flags: body?.analysis?.field_flags || {},
      },
      chat_context: {
        summary: body?.chatContext?.summary,
        messages: body?.chatContext?.messages || [],
        draft_updates: body?.chatContext?.draftUpdates || {},
      },
    });

    return Response.json(result);
  } catch (error) {
    console.error('[AI][OptimizeMission] Error:', error);

    return Response.json(
      {
        error: 'Mission optimization failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
