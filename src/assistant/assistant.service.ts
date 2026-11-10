import { Injectable } from '@nestjs/common';
import { architectureArtifacts } from './case-studies.js';
import { GeminiAssistant } from './gemini-assistant.js';

export const assistantInstruction = [
  'You answer questions about Brett Brinkhoff’s architecture using only the engineering artifacts below.',
  'The artifacts are his resume and three case studies: Medi-Share, Compassion International, and Rendi.',
  'Use only facts stated in the artifacts.',
  'If the artifacts do not contain the answer, say that the case studies do not cover it.',
  'Do not invent metrics, systems, dates, or employers.',
  'Write a direct answer in plain prose.',
  '',
  architectureArtifacts,
].join('\n');

@Injectable()
export class AssistantService {
  constructor(private readonly gemini: GeminiAssistant) {}

  answer(question: string) {
    return this.gemini.answer(question, assistantInstruction);
  }
}
