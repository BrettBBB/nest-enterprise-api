import { ServiceUnavailableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GeminiAssistant, geminiModel } from './gemini-assistant.js';

const { generateContentStream, ApiError } = vi.hoisted(() => {
  class ApiError extends Error {
    status: number;

    constructor(options: { message: string; status: number }) {
      super(options.message);
      this.name = 'ApiError';
      this.status = options.status;
    }
  }

  return { generateContentStream: vi.fn(), ApiError };
});

vi.mock('@google/genai', () => ({
  ApiError,
  GoogleGenAI: class GoogleGenAI {
    models = { generateContentStream };
  },
}));

describe('GeminiAssistant', () => {
  let assistant: GeminiAssistant;
  const previousKey = process.env.GEMINI_API_KEY;

  beforeEach(async () => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test-key';
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeminiAssistant],
    }).compile();
    assistant = module.get(GeminiAssistant);
  });

  afterEach(() => {
    process.env.GEMINI_API_KEY = previousKey;
  });

  it('refuses to call Gemini when the API key is missing', async () => {
    process.env.GEMINI_API_KEY = '  ';

    await expect(collect(assistant.answer('Hello', 'Artifacts', [artifact]))).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(generateContentStream).not.toHaveBeenCalled();
  });

  it('refuses to call Gemini when no PDF artifacts were copied', async () => {
    await expect(collect(assistant.answer('What changed?', 'Artifacts'))).rejects.toThrow(
      'The engineering artifacts are not available.',
    );
    expect(generateContentStream).not.toHaveBeenCalled();
  });

  it('tells the visitor when Gemini is busy', async () => {
    generateContentStream.mockRejectedValue(
      new ApiError({ message: 'unavailable', status: 503 }),
    );

    await expect(collect(assistant.answer('What changed?', 'Artifacts', [artifact]))).rejects.toThrow(
      'Gemini is busy right now. Try again in a moment.',
    );
  });

  it('yields text from the Gemini stream', async () => {
    generateContentStream.mockResolvedValue(
      (async function* () {
        yield { text: 'Prisma replaced Sequelize' };
        yield { text: ' during a phased migration.' };
      })(),
    );

    await expect(
      collect(assistant.answer('What changed?', 'Artifacts', [artifact], 'Website page index')),
    ).resolves.toEqual([
      'Prisma replaced Sequelize',
      ' during a phased migration.',
    ]);
    expect(generateContentStream).toHaveBeenCalledWith({
      model: geminiModel,
      contents: [
        { text: 'Engineering artifact: study.pdf' },
        { inlineData: { mimeType: 'application/pdf', data: 'cGRm' } },
        { text: 'Website page index' },
        { text: 'What changed?' },
      ],
      config: expect.objectContaining({
        systemInstruction: 'Artifacts',
        automaticContinuation: false,
        maxOutputTokens: 2048,
      }),
    });
  });
});

const artifact = { name: 'study.pdf', data: 'cGRm' };

async function collect(stream: AsyncGenerator<string>) {
  const chunks: string[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return chunks;
}
