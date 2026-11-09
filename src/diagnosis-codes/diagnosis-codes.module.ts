import { Module } from '@nestjs/common';
import { JwtAuthModule } from '../auth/jwt-auth.module.js';
import { CodeImportModule } from '../code-import/code-import.module.js';
import { DiagnosisCodesController } from './diagnosis-codes.controller.js';
import { DiagnosisCodesService } from './diagnosis-codes.service.js';

@Module({
  imports: [JwtAuthModule, CodeImportModule],
  controllers: [DiagnosisCodesController],
  providers: [DiagnosisCodesService],
  exports: [DiagnosisCodesService],
})
export class DiagnosisCodesModule {}
