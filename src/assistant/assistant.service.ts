import { Injectable } from '@nestjs/common';
import { loadEngineeringArtifacts } from './artifacts.js';
import { GeminiAssistant } from './gemini-assistant.js';
import { siteContext } from './site-context.js';

export const assistantInstruction = [
  'You answer questions about Brett Brinkhoff’s architecture using the attached PDF engineering artifacts and the website page index included with the question.',
  'Each PDF is labeled with its file name before the file contents.',
  'The artifacts are his resume and case studies, including Medi-Share, Compassion International, and Rendi.',
  'The page index lists every route, who can open it, and the text on that screen.',
  'The index names the page the visitor is currently viewing. Use that page when the question is about this page, this screen, or what the visitor is looking at.',
  'Use only facts stated in the PDFs or the page index.',
  'If they do not contain the answer, say that the case studies and site pages do not cover it.',
  'Do not invent metrics, systems, dates, or employers.',
  'Write a direct, detailed answer in plain prose.',
].join('\n');

@Injectable()
export class AssistantService {
  constructor(private readonly gemini: GeminiAssistant) {}

  async *answer(question: string, page?: string) {
    const artifacts = await loadEngineeringArtifacts();
    yield* this.gemini.answer(
      question,
      assistantInstruction,
      artifacts,
      await siteContext(page),
    );
  }
}
