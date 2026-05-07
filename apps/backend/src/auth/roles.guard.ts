import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { UserRole } from './entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest<{
      user: { id: string; role: UserRole; suspended: boolean };
    }>();

    if (!user) throw new ForbiddenException('No autenticado');
    if (user.suspended) throw new ForbiddenException('Cuenta suspendida');
    if (!requiredRoles.includes(user.role))
      throw new ForbiddenException('Acceso denegado');

    return true;
  }
}
