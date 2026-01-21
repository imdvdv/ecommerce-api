import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuth } from 'src/common/decorators/jwt-auth.decorator';
import { AdminOnly } from 'src/common/decorators/admin-only.decorator';
import { SessionsService } from './sessions.service';
import { SessionResponseDto } from './dto/session-response.dto';
import { SessionAdminResponseDto } from './dto/session-admin-response.dto';

@ApiTags('Sessions')
@JwtAuth()
@AdminOnly()
@Controller('admin/sessions')
export class AdminSessionsController {
  constructor(private readonly sessionService: SessionsService) {}

  @Get()
  @ApiOperation({ summary: '[ADMIN] Get all sessions' })
  @ApiResponse({
    status: 200,
    description: 'List of all sessions',
    type: [SessionAdminResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async findAllForAdmin(): Promise<SessionAdminResponseDto[]> {
    return await this.sessionService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: '[ADMIN] Get all sessions for a specific user' })
  @ApiResponse({
    status: 200,
    description: 'List of all sessions for the specified user',
    type: [SessionResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async findAllByUserIdForAdmin(
    @Param('userId') userId: string,
  ): Promise<SessionResponseDto[]> {
    return await this.sessionService.findAllByUserIdForAdmin(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '[ADMIN] Get a specific session by ID' })
  @ApiResponse({
    status: 200,
    description: 'The session with the specified ID',
    type: SessionAdminResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async findOneForAdmin(
    @Param('id') sessionId: string,
  ): Promise<SessionAdminResponseDto> {
    return await this.sessionService.findOneForAdmin(sessionId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '[ADMIN] Delete a specific session' })
  @ApiResponse({
    status: 204,
    description: 'Session deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async removeForAdmin(@Param('id') sessionId: string) {
    return await this.sessionService.removeForAdmin(sessionId);
  }

}

