import { Module } from '@nestjs/common';
import { JwtAuthModule } from '../auth/jwt-auth.module.js';
import { DiagnosisRulesController } from './diagnosis-rules.controller.js';
import { DiagnosisRulesService } from './diagnosis-rules.service.js';

@Module({
  imports: [JwtAuthModule],
  controllers: [DiagnosisRulesController],
  providers: [DiagnosisRulesService],
  exports: [DiagnosisRulesService],
})
export class DiagnosisRulesModule {}
