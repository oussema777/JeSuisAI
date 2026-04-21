import { createHash } from 'crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';

type GenerateOptions = {
  temperature?: number;
  model?: string;
  schema?: any;
  maxRetries?: number;
};

type ContentPart = {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
};

type CachedGeneration = {
  text: string;
  expiresAt: number;
};

const MAX_CONCURRENT_REQUESTS = 4;
const CACHE_TTL_MS = 15_000;
const CACHE_CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
const TRANSIENT_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);
const cachedGenerations = new Map<string, CachedGeneration>();
const inFlightGenerations = new Map<string, Promise<string>>();
const waitQueue: Array<() => void> = [];

let activeGenerations = 0;

const cacheCleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cachedGenerations) {
    if (now > entry.expiresAt) {
      cachedGenerations.delete(key);
    }
  }
}, CACHE_CLEANUP_INTERVAL_MS);

cacheCleanupTimer.unref?.();

function stableStringify(value: unknown): string {
  if (value === null || value === undefined) {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  if (typeof value === 'object') {
    const objectValue = value as Record<string, unknown>;
    const keys = Object.keys(objectValue).sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(objectValue[key])}`).join(',')}}`;
  }

  return JSON.stringify(value);
}

function createGenerationKey(payload: unknown): string {
  return createHash('sha256').update(stableStringify(payload)).digest('hex');
}

function getCachedGeneration(key: string): string | null {
  const cached = cachedGenerations.get(key);
  if (!cached) {
    return null;
  }

  if (Date.now() > cached.expiresAt) {
    cachedGenerations.delete(key);
    return null;
  }

  return cached.text;
}

function cacheGeneration(key: string, text: string) {
  cachedGenerations.set(key, {
    text,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  if (cachedGenerations.size > 200) {
    const oldestKey = cachedGenerations.keys().next().value;
    if (oldestKey) {
      cachedGenerations.delete(oldestKey);
    }
  }
}

function isTransientGeminiError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const errorRecord = error as {
    status?: number;
    code?: number | string;
    message?: string;
    cause?: { code?: number | string; message?: string };
  };

  const statusCandidates = [errorRecord.status, errorRecord.code, errorRecord.cause?.code]
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

  if (statusCandidates.some((value) => TRANSIENT_STATUS_CODES.has(value))) {
    return true;
  }

  const message = [errorRecord.message, errorRecord.cause?.message]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return /aborterror|timeout|timed out|temporarily unavailable|service unavailable|internal server error|resource exhausted|overloaded|rate limit|econnreset|eai_again|enetunreach|enotfound|fetch failed|socket hang up/.test(message);
}

function getRetryDelayMs(attemptIndex: number) {
  const exponentialDelay = Math.min(8_000, 500 * 2 ** attemptIndex);
  const jitterMultiplier = 0.6 + Math.random() * 0.8;
  return Math.round(exponentialDelay * jitterMultiplier);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function acquireGenerationSlot() {
  if (activeGenerations < MAX_CONCURRENT_REQUESTS) {
    activeGenerations++;
    return;
  }

  await new Promise<void>((resolve) => {
    waitQueue.push(resolve);
  });

  activeGenerations++;
}

function releaseGenerationSlot() {
  activeGenerations = Math.max(0, activeGenerations - 1);
  const next = waitQueue.shift();
  if (next) {
    next();
  }
}

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private defaultModel = 'gemini-2.5-flash';

  constructor(apiKey: string) {
    console.log('[GeminiClient] Initializing with API key:', apiKey ? 'Present' : 'Missing');
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    console.log('[GeminiClient] Initialized successfully');
  }

  async generate(prompt: string, options: GenerateOptions = {}): Promise<string> {
    return this.generateContent([{ text: prompt }], options);
  }

  async generateContent(parts: ContentPart[], options: GenerateOptions = {}): Promise<string> {
    console.log('[GeminiClient] Generate called with model:', options.model || this.defaultModel);
    
    const {
      temperature = 0.7,
      model = this.defaultModel,
      schema,
      maxRetries = 3,
    } = options;

    const generationConfig: any = {
      temperature,
    };

    if (schema) {
      generationConfig.responseMimeType = 'application/json';
      generationConfig.responseSchema = schema;
    }

    console.log('[GeminiClient] Generation config:', generationConfig);

    const generationKey = createGenerationKey({
      model,
      temperature,
      schema,
      parts,
    });

    const cachedGeneration = getCachedGeneration(generationKey);
    if (cachedGeneration !== null) {
      console.log('[GeminiClient] Returning cached generation result');
      return cachedGeneration;
    }

    const inFlight = inFlightGenerations.get(generationKey);
    if (inFlight) {
      console.log('[GeminiClient] Joining in-flight generation request');
      return inFlight;
    }

    const generationPromise = (async () => {
      await acquireGenerationSlot();

      try {
        const genModel = this.genAI.getGenerativeModel({
          model,
          generationConfig,
        });

        let lastError: unknown = null;

        for (let attemptIndex = 0; attemptIndex < maxRetries; attemptIndex++) {
          try {
            console.log(`[GeminiClient] Attempt ${attemptIndex + 1}/${maxRetries}`);
            const result = await genModel.generateContent(parts);
            const response = await result.response;
            const text = response.text();
            console.log('[GeminiClient] Response received, length:', text.length);
            return text;
          } catch (error) {
            lastError = error;
            const transient = isTransientGeminiError(error);
            console.error(`[GeminiClient] Attempt ${attemptIndex + 1} failed:`, error);

            if (!transient || attemptIndex === maxRetries - 1) {
              throw error;
            }

            const delay = getRetryDelayMs(attemptIndex);
            console.log(`[GeminiClient] Transient failure, retrying in ${delay}ms`);
            await sleep(delay);
          }
        }

        throw lastError instanceof Error
          ? lastError
          : new Error('Failed to generate content');
      } finally {
        releaseGenerationSlot();
      }
    })();

    inFlightGenerations.set(generationKey, generationPromise);

    try {
      const text = await generationPromise;
      cacheGeneration(generationKey, text);
      return text;
    } finally {
      inFlightGenerations.delete(generationKey);
    }
  }
}
