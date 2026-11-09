import { Module } from '@nestjs/common';
import { JwtAuthModule } from '../auth/jwt-auth.module.js';
import { CodeImportModule } from '../code-import/code-import.module.js';
import { ProcedureCodesController } from './procedure-codes.controller.js';
import { ProcedureCodesService } from './procedure-codes.service.js';

@Module({
  imports: [JwtAuthModule, CodeImportModule],
  controllers: [ProcedureCodesController],
  providers: [ProcedureCodesService],
  exports: [ProcedureCodesService],
})
export class ProcedureCodesModule {}
