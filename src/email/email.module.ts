import { Module } from '@nestjs/common';
import { EmailController } from './email.controller.js';
import { ResendAdapter } from './adapters/resend.js';
import { EmailService } from './email.service.js';

@Module({
  controllers: [EmailController],
  providers: [ResendAdapter, EmailService],
  exports: [EmailService],
})
export class EmailModule {}
