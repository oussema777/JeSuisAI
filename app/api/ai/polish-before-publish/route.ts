import { polishMissionBeforePublish } from "@/lib/ai/missionAgent";

export async function POST(req: Request) {
  try {
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
