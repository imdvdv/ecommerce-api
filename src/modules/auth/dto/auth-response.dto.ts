import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class AuthResponseDto {
  @ApiProperty({
    description: 'Access token for authentication',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiw',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token for obtaining new access tokens',
    example:
      'dGhpcy1pcz1hLXJlZnJlc2gtdG9rZW4tZXhhbXBsZS13aXRoLXN1ZmZpY2lhbC1j',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Authenticated user information',
    example: {
      id: 'user-123',
      email: '<EMAIL>',
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER',
    },
  })
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: Role;
  };
}
