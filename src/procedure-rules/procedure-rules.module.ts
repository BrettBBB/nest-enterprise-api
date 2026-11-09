import { Module } from '@nestjs/common';
import { JwtAuthModule } from '../auth/jwt-auth.module.js';
import { ProcedureRulesController } from './procedure-rules.controller.js';
import { ProcedureRulesService } from './procedure-rules.service.js';

@Module({
  imports: [JwtAuthModule],
  controllers: [ProcedureRulesController],
  providers: [ProcedureRulesService],
  exports: [ProcedureRulesService],
})
export class ProcedureRulesModule {}
