import { Module } from '@nestjs/common';
import { AssistantController } from './assistant.controller.js';
import { AssistantService } from './assistant.service.js';
import { GeminiAssistant } from './gemini-assistant.js';

@Module({
  controllers: [AssistantController],
  providers: [GeminiAssistant, AssistantService],
  exports: [AssistantService],
})
export class AssistantModule {}
