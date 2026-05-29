import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import type { Request } from 'express'
import type { Role } from '../generated/prisma'

/**
 * Autorise uniquement les utilisateurs ayant le rôle ADMIN.
 * À utiliser APRÈS le JwtAuthGuard (qui renseigne req.user) :
 *   @UseGuards(JwtAuthGuard, AdminGuard)
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx
      .switchToHttp()
      .getRequest<Request & { user?: { role: Role } }>()
    if (req.user?.role !== 'ADMIN') {
      throw new ForbiddenException('Accès réservé aux administrateurs')
    }
    return true
  }
}
