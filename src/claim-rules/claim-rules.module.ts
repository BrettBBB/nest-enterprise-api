import { Module } from '@nestjs/common';
import { JwtAuthModule } from '../auth/jwt-auth.module.js';
import { ClaimRulesController } from './claim-rules.controller.js';
import { ClaimRulesService } from './claim-rules.service.js';

@Module({
  imports: [JwtAuthModule],
  controllers: [ClaimRulesController],
  providers: [ClaimRulesService],
  exports: [ClaimRulesService],
})
export class ClaimRulesModule {}
