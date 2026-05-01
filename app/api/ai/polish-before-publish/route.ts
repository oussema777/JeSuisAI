import { polishMissionBeforePublish } from "@/lib/ai/missionAgent";
import { enforceAiRateLimit } from "@/lib/ai/routeGuards";

export async function POST(req: Request) {
  try {
    const rateLimitResponse = enforceAiRateLimit(req, 'ai:polish-before-publish');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await req.json();

    const result = await polishMissionBeforePublish({
      title: body?.title,
      description: body?.description,
      impactsObjectifs: body?.impactsObjectifs,
      detailsContributions: body?.detailsContributions,
      conditionsMission: body?.conditionsMission,
      detailRemuneration: body?.detailRemuneration,
      facilitesAutres: body?.facilitesAutres,
      remunerationAutre: body?.remunerationAutre,
      language: body?.language === 'en' ? 'en' : 'fr',
    });

    return Response.json(result);
  } catch (error) {
    console.error('[AI][PolishBeforePublish] Error:', error);

    return Response.json(
      {
        error: 'Pre-publish polishing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
