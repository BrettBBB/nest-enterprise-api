import { Test, TestingModule } from '@nestjs/testing';
import { AssistantService } from './assistant.service.js';
import { GeminiAssistant } from './gemini-assistant.js';

describe('AssistantService', () => {
  let service: AssistantService;
  const gemini = { answer: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssistantService,
        { provide: GeminiAssistant, useValue: gemini },
      ],
    }).compile();

    service = module.get(AssistantService);
  });

  it('asks Gemini using the case-study artifacts', async () => {
    gemini.answer.mockReturnValue(
      (async function* () {
        yield 'The pipeline scaled past 150 million messages.';
      })(),
    );

    const chunks: string[] = [];
    for await (const chunk of service.answer(
      "How did Brett scale Compassion's messaging pipeline?",
    )) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual(['The pipeline scaled past 150 million messages.']);
    expect(gemini.answer).toHaveBeenCalledWith(
      "How did Brett scale Compassion's messaging pipeline?",
      expect.stringContaining('Compassion International'),
    );
    expect(gemini.answer.mock.calls[0][1]).toContain('Sequelize to Prisma');
  });
});
