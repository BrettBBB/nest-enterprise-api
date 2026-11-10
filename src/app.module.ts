import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { EmailModule } from './email/email.module.js';
import { validateEnv } from './env.validation.js';
import { ClaimRulesModule } from './claim-rules/claim-rules.module.js';
import { ClaimsModule } from './claims/claims.module.js';
import { DiagnosisCodesModule } from './diagnosis-codes/diagnosis-codes.module.js';
import { DiagnosisRulesModule } from './diagnosis-rules/diagnosis-rules.module.js';
import { ProcedureCodesModule } from './procedure-codes/procedure-codes.module.js';
import { ProcedureRulesModule } from './procedure-rules/procedure-rules.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './users/users.module.js';

const env = validateEnv();

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com,
    // then run `npx @nestjs/observe link` to write your key pair into .env.
    ObserveModule.forRoot({
      appKey: env.OBSERVE_APP_KEY ?? 'YOUR_APP_KEY',
      appSecret: env.OBSERVE_APP_SECRET ?? 'YOUR_APP_SECRET',
      serviceId: 'nest-enterprise-api',
    }),
    PrismaModule,
    UsersModule,
    ProcedureCodesModule,
    ProcedureRulesModule,
    DiagnosisCodesModule,
    DiagnosisRulesModule,
    ClaimsModule,
    ClaimRulesModule,
    AuthModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
