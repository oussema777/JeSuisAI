import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';

type AiRateLimitOptions = {
  maxRequests?: number;
  windowSeconds?: number;
};

function getRequestIp(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  const source = forwardedFor || realIp || cfConnectingIp || 'unknown';
  return source.split(',')[0]?.trim() || 'unknown';
}

export function enforceAiRateLimit(
  request: Request,
  routeName: string,
  options: AiRateLimitOptions = {}
): Response | null {
  const { maxRequests = 12, windowSeconds = 60 } = options;
  const clientKey = `${routeName}:${getRequestIp(request)}`;
  const result = checkRateLimit(clientKey, { maxRequests, windowSeconds });

  if (!result.allowed) {
    return rateLimitResponse(result.resetAt);
  }

  return null;
}