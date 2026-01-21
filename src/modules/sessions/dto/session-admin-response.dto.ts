import { ApiProperty } from '@nestjs/swagger';
import { SessionResponseDto } from './session-response.dto';

export class SessionAdminResponseDto extends SessionResponseDto {
  @ApiProperty({
    description: 'User ID who owns this session',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;
}
