import { Module } from '@nestjs/common';
import { JwtAuthModule } from '../auth/jwt-auth.module.js';
import { RulesController } from './rules.controller.js';
import { RulesService } from './rules.service.js';

@Module({
  imports: [JwtAuthModule],
  controllers: [RulesController],
  providers: [RulesService],
  exports: [RulesService],
})
export class RulesModule {}
