import { Module } from '@nestjs/common';
import { JwtAuthModule } from '../auth/jwt-auth.module.js';
import { ClaimsController } from './claims.controller.js';
import { ClaimsService } from './claims.service.js';

@Module({
  imports: [JwtAuthModule],
  controllers: [ClaimsController],
  providers: [ClaimsService],
  exports: [ClaimsService],
})
export class ClaimsModule {}
