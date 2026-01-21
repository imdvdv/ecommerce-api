import { ApiProperty } from '@nestjs/swagger';

export class SessionResponseDto {
  @ApiProperty({
    description: 'Session ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Refresh token ID - unique identifier for the refresh token',
    example: 'a1b2c3d4e5f6g7h8i9j0',
  })
  refreshTokenId: string;

  @ApiProperty({
    description: 'User agent of the device/browser',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    nullable: true,
  })
  userAgent: string | null;

  @ApiProperty({
    description: 'IP address of the client',
    example: '192.168.1.1',
    nullable: true,
  })
  ip: string | null;

  @ApiProperty({
    description: 'Session expiration date',
    example: '2023-10-08T12:34:56.789Z',
  })
  expiresAt: Date;

  @ApiProperty({
    description: 'Session creation date',
    example: '2023-10-01T12:34:56.789Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last session update date',
    example: '2023-10-01T12:34:56.789Z',
  })
  updatedAt: Date;
}
