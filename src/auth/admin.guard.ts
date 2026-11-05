import {
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtAuthGuard, type AuthenticatedRequest } from './jwt-auth.guard.js';

@Injectable()
export class AdminGuard extends JwtAuthGuard {
  override async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (request.user?.isAdmin !== true) {
      throw new ForbiddenException();
    }
    return true;
  }
}
