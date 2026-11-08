import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminGuard } from './admin.guard.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { accessTokenTtlSeconds } from './session-tokens.js';

function jwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  return secret;
}

@Module({
  imports: [
    JwtModule.register({
      secret: jwtSecret(),
      signOptions: { expiresIn: accessTokenTtlSeconds() },
    }),
  ],
  providers: [JwtAuthGuard, AdminGuard],
  exports: [JwtAuthGuard, AdminGuard, JwtModule],
})
export class JwtAuthModule {}
