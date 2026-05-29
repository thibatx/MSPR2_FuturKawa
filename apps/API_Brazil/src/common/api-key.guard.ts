import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { Request } from 'express'
import { IS_PUBLIC_KEY } from './public.decorator'

/**
 * Sécurise la communication machine-à-machine avec l'API_Siege.
 * Le client (API_Siege) doit présenter l'en-tête `x-api-key` correspondant
 * à la variable d'environnement API_KEY. Aucune session utilisateur ici :
 * l'authentification des humains reste au niveau du Siège.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true

    const expected = process.env.API_KEY
    if (!expected) {
      throw new UnauthorizedException('API_KEY non configurée sur le serveur')
    }

    const req = context.switchToHttp().getRequest<Request>()
    const provided = req.headers['x-api-key']
    if (provided !== expected) {
      throw new UnauthorizedException('Clé API invalide ou manquante')
    }
    return true
  }
}
