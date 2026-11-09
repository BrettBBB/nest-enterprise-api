import { Module } from '@nestjs/common';
import { CodeImportService } from './code-import.service.js';

@Module({
  providers: [CodeImportService],
  exports: [CodeImportService],
})
export class CodeImportModule {}
