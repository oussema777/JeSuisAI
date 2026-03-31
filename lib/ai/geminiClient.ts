import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private defaultModel: string = 'gemini-2.5-flash'; // Using valid Gemini 1.5 Flash model

  constructor(apiKey: string) {
    console.log('[GeminiClient] Initializing with API key:', apiKey ? 'Present' : 'Missing');
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    console.log('[GeminiClient] Initialized successfully');
  }

  async generate(
    prompt: string,
    options: {
      temperature?: number;
      model?: string;
      schema?: any; // JSON schema for structured output
      maxRetries?: number;
    } = {}
  ): Promise<string> {
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

    let attempts = maxRetries;
    let lastError: Error | null = null;

    while (attempts > 0) {
      try {
        console.log(`[GeminiClient] Attempt ${maxRetries - attempts + 1}/${maxRetries}`);
        
        const genModel = this.genAI.getGenerativeModel({
          model,
          generationConfig,
        });

        console.log('[GeminiClient] Model created, generating content...');
        const result = await genModel.generateContent(prompt);
        console.log('[GeminiClient] Content generated, getting response...');
        
        const response = await result.response;
        const text = response.text();
        console.log('[GeminiClient] Response received, length:', text.length);
        
        return text;
      } catch (error) {
        lastError = error as Error;
        console.error(`[GeminiClient] Attempt ${maxRetries - attempts + 1} failed:`, error);
        attempts--;
        if (attempts > 0) {
          // Exponential backoff: wait 1s, 2s, 4s...
          const delay = Math.pow(2, maxRetries - attempts) * 1000;
          console.log(`[GeminiClient] Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    console.error('[GeminiClient] All attempts failed');
    throw new Error(`Failed to generate content after ${maxRetries} attempts: ${lastError?.message}`);
  }
}
