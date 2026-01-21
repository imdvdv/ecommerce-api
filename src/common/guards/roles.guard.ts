// Role guard

import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GetUser } from '../decorators/get-user.decorator';

@Injectable()
export class RolesGuard extends JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAuthenticated = await super.canActivate(context);
    if (!isAuthenticated) {
      return false;
    }

    const requireRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requireRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) {
      this.logger.warn('User not found in request after JWT authentication');
      return false;
    }

    const userRole = String(user.role).toUpperCase();
    const hasRequiredRole = requireRoles.some((role) => userRole === String(role).toUpperCase());
    
    if (!hasRequiredRole) {
      this.logger.debug(`Access denied. User role: ${userRole}, Required roles: ${requireRoles.map(role => String(role).toUpperCase()).join(', ')}`);
    }
    
    return hasRequiredRole;
  }
}
