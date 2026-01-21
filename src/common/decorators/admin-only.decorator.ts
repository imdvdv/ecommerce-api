import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from './roles.decorator';
import { RolesGuard } from '../guards/roles.guard';

export function AdminOnly() {
  return applyDecorators(
    UseGuards(RolesGuard),
    Roles(Role.ADMIN),
    ApiBearerAuth('JWT-auth'),
  );
}
