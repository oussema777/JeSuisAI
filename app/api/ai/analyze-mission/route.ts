import { analyzeMission } from "@/lib/ai/missionAgent";

export async function POST(req: Request) {
  try {
    console.log('[AI] Request received');
    
    const body = await req.json();
    console.log('[AI] Request body:', body);

    const result = await analyzeMission({
      domain: body.domain,
      title: body.title,
      description: body.description,
      impactsObjectifs: body.impactsObjectifs,
      detailsContributions: body.detailsContributions
    });
    
    console.log('[AI] Analysis result:', result);

    return Response.json(result);
  } catch (error) {
    console.error('[AI] Error details:', error);
    console.error('[AI] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return Response.json(
      { 
        error: "AI analysis failed",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
