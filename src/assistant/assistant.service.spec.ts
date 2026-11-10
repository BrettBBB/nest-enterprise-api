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
    gemini.answer.mockImplementation(() =>
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
      expect.stringContaining('attached PDF engineering artifacts'),
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Case Study - Compassion International Global Communication.pdf',
          data: expect.any(String),
        }),
      ]),
      expect.stringContaining('/contact'),
    );
    expect(gemini.answer.mock.calls[0][2]).toHaveLength(4);
    expect(gemini.answer.mock.calls[0][3]).toContain(
      "The visitor's current page was not included",
    );
    expect(gemini.answer.mock.calls[0][3]).toContain('/contact');

    const currentPage: string[] = [];
    for await (const chunk of service.answer(
      'What is on this page?',
      '/contact',
    )) {
      currentPage.push(chunk);
    }
    expect(currentPage).toEqual([
      'The pipeline scaled past 150 million messages.',
    ]);
    expect(gemini.answer.mock.calls[1][3]).toContain(
      'The visitor is currently on Contact (/contact).',
    );
  });
});
