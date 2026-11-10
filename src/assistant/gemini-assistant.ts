import { ApiError, GoogleGenAI } from '@google/genai';
import {
  BadGatewayException,
  HttpException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';

export const geminiModel = 'gemini-3.5-flash-lite';

@Injectable()
export class GeminiAssistant {
  async *answer(question: string, instruction: string): AsyncGenerator<string> {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'The architecture assistant is not configured.',
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    let yielded = false;
    try {
      const stream = await ai.models.generateContentStream({
        model: geminiModel,
        contents: question,
        config: {
          systemInstruction: instruction,
          temperature: 0.2,
          maxOutputTokens: 1024,
          automaticContinuation: false,
        },
      });
      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          yielded = true;
          yield text;
        }
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof ApiError && error.status === 503) {
        throw new ServiceUnavailableException(
          'Gemini is busy right now. Try again in a moment.',
        );
      }
      throw new BadGatewayException(
        'The assistant could not answer that question.',
        { cause: error },
      );
    }

    if (!yielded) {
      throw new BadGatewayException('The assistant returned an empty answer.');
    }
  }
}
